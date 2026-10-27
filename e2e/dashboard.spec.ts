import { expect, test, type Page } from "@playwright/test";

const rows = (page: Page) => page.locator("tbody tr[data-status]");
const range = (page: Page) => page.getByTestId("result-range");
const statuses = (page: Page) =>
  rows(page).evaluateAll((trs) => trs.map((tr) => tr.getAttribute("data-status")));
const kpi = async (page: Page, key: string) =>
  Number(await page.getByTestId(`kpi-${key}-value`).textContent());

async function choose(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

test.describe("Stok Uyarı Paneli", () => {
  test("AC-14 sayfa açılır, 56 ürün yüklenir, konsolda hata yok", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Stok Uyarı Paneli" })).toBeVisible();
    await expect(page.getByTestId("kpi-total-value")).toHaveText("56");
    await expect(range(page)).toHaveText("56 üründen 1–15 arası");
    await expect(rows(page)).toHaveCount(15);
    expect(errors).toEqual([]);
  });

  test("AC-15 ilk yüklemede Tükendi üstte, ardından Kritik gelir", async ({ page }) => {
    await page.goto("/");
    await expect(rows(page)).toHaveCount(15);
    const list = await statuses(page);
    const outCount = await kpi(page, "outOfStock");
    expect(outCount).toBeGreaterThan(0);
    expect(list.slice(0, outCount).every((s) => s === "out_of_stock")).toBe(true);
    expect(list[outCount]).toBe("critical");
    // Kritik grubu tedarik açığına göre büyükten küçüğe: ilk sırada SK-1006 (6 gün açık)
    await expect(rows(page).nth(outCount)).toContainText("SK-1006");
  });

  test("AC-15 tedarik süresi nedeniyle kritik: 12 gün stok / 15 gün tedarik", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Ara").fill("SK-1003");
    await expect(rows(page)).toHaveCount(1);
    const row = rows(page).first();
    await expect(row).toHaveAttribute("data-status", "critical");
    await expect(row.locator("td").nth(5)).toHaveText("12");
    await expect(row).toContainText("15 gün");
    await expect(row).toContainText("Tedarikten 3 gün kısa");
  });

  test("AC-13 KPI değerleri tablodaki durum sayılarıyla tutarlı", async ({ page }) => {
    await page.goto("/");
    const cases = [
      ["outOfStock", "Tükendi"],
      ["critical", "Kritik"],
      ["warning", "Dikkat"],
    ] as const;
    for (const [key, label] of cases) {
      const expected = await kpi(page, key);
      await choose(page, "Stok durumu", label);
      await expect(range(page)).toContainText(`${expected} üründen`);
    }
  });

  test("AC-13 KPI kartı tıklanınca tablo o duruma filtrelenir", async ({ page }) => {
    await page.goto("/");
    const critical = await kpi(page, "critical");
    await page.getByTestId("kpi-critical").click();
    await expect(page.getByTestId("kpi-critical")).toHaveAttribute("aria-pressed", "true");
    await expect(range(page)).toContainText(`${critical} üründen`);
    expect(new Set(await statuses(page))).toEqual(new Set(["critical"]));
    await page.getByTestId("kpi-total").click();
    await expect(range(page)).toContainText("56 üründen");
  });

  test("operasyonel uyarı tükenen ve kritik sayılarını verir, sipariş ima etmez", async ({ page }) => {
    await page.goto("/");
    const alert = page.getByTestId("operational-alert");
    const out = await kpi(page, "outOfStock");
    const critical = await kpi(page, "critical");
    await expect(alert).toContainText(
      `${out} ürünün stoğu tükenmiş, ${critical} ürün kritik seviyede.`,
    );
    await expect(alert).not.toContainText(/sipariş/i);
  });

  test("AC-16 arama SKU ve ürün adında çalışır (Türkçe harf duyarsız)", async ({ page }) => {
    await page.goto("/");
    const search = page.getByLabel("Ara");
    await search.fill("sk-1022");
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first()).toContainText("Slip-ins Go Walk 6");

    await search.fill("SLIP");
    await expect(range(page)).toContainText("6 üründen"); // adında "Slip" geçen 6 ürün

    await search.fill("go walk");
    await expect(rows(page).first()).toContainText(/go walk/i);
    const names = await rows(page).locator("td:nth-child(2)").allTextContents();
    expect(names.every((n) => /go walk/i.test(n))).toBe(true);

    await search.fill("olmayan ürün");
    await expect(page.getByText("Bu arama ve filtrelerle eşleşen ürün yok.")).toBeVisible();
    await page.getByRole("button", { name: "Filtreleri temizle" }).click();
    await expect(range(page)).toContainText("56 üründen");
  });

  test("AC-17 filtreler ve sayfalama birlikte çalışır", async ({ page }) => {
    await page.goto("/");
    await choose(page, "Stok durumu", "Normal");
    await expect(range(page)).toHaveText("28 üründen 1–15 arası");
    await page.getByRole("button", { name: "Sonraki" }).click();
    await expect(range(page)).toHaveText("28 üründen 16–28 arası");
    await expect(page.getByText("Sayfa 2 / 2")).toBeVisible();
    await expect(rows(page)).toHaveCount(13);
    expect(new Set(await statuses(page))).toEqual(new Set(["normal"]));

    // Filtre değişince ilk sayfaya döner ve iki filtre birlikte uygulanır
    await choose(page, "Kategori", "Sneaker");
    await expect(page.getByText("Sayfa 1 / 1")).toBeVisible();
    const categories = await rows(page).locator("td:nth-child(3)").allTextContents();
    expect(categories.length).toBeGreaterThan(0);
    expect(new Set(categories)).toEqual(new Set(["Sneaker"]));
    expect(new Set(await statuses(page))).toEqual(new Set(["normal"]));

    await page.getByRole("button", { name: "Varsayılan görünüme dön" }).click();
    await expect(range(page)).toHaveText("56 üründen 1–15 arası");
  });

  test("kullanıcı sütuna göre sıralayabilir ve aciliyet sırasına dönebilir", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("columnheader", { name: /Mevcut stok/ });
    const sortButton = header.getByRole("button", { name: /Mevcut stok/ });
    await sortButton.click();
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await sortButton.click();
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await expect(rows(page).first()).toContainText("SK-1013"); // en yüksek stok: 200

    await page.getByRole("button", { name: "Varsayılan görünüme dön" }).click();
    await expect(header).not.toHaveAttribute("aria-sort", /.+/);
    await expect(rows(page).first()).toHaveAttribute("data-status", "out_of_stock");
  });

  test("AC-19 bozuk JSON uygulamayı çökertmez, anlaşılır hata gösterir", async ({ page }) => {
    const errors = trackErrors(page);
    await page.route("**/data/products.json", (route) =>
      route.fulfill({ contentType: "application/json", body: "[{ bozuk" }),
    );
    await page.goto("/");
    await expect(page.getByRole("alert")).toContainText("geçerli bir JSON değil");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("AC-19 hatalı kayıtlar ayrılır, geçerli ürünler gösterilmeye devam eder", async ({ page }) => {
    await page.route("**/data/products.json", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          { sku: "SK-1", name: "Geçerli", category: "Walking", stock: 0, dailyAverageSales: 3, leadTimeDays: 2 },
          { sku: "SK-2", name: "Stoksuz", category: "Walking", dailyAverageSales: 3, leadTimeDays: 2 },
          { sku: "SK-3", name: "Negatif", category: "Walking", stock: 5, dailyAverageSales: -1, leadTimeDays: 2 },
        ]),
      }),
    );
    await page.goto("/");
    const issues = page.getByTestId("data-issues");
    await expect(issues).toContainText("2 kayıt hatalı veri nedeniyle hesaplanamadı.");
    await expect(issues).toContainText("Satır 2 (SK-2): Mevcut stok eksik veya sayı değil.");
    await expect(page.getByTestId("kpi-total-value")).toHaveText("1");
    await expect(rows(page)).toHaveCount(1);
  });

  test("AC-19 boş ürün listesinde 'risk yok' güvencesi vermez", async ({ page }) => {
    await page.route("**/data/products.json", (route) =>
      route.fulfill({ contentType: "application/json", body: "[]" }),
    );
    await page.goto("/");
    const alert = page.getByTestId("operational-alert");
    await expect(alert).toContainText("Gösterilecek ürün yok.");
    await expect(alert).not.toContainText("karşılıyor");
    await expect(page.getByText("Listelenecek ürün yok.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Filtreleri temizle" })).toHaveCount(0);
  });

  test("masaüstü ekran görüntüsü", async ({ page }) => {
    await page.goto("/");
    await expect(rows(page)).toHaveCount(15);
    await page.screenshot({ path: "docs/screenshots/desktop.png", fullPage: true });
  });
});

test.describe("Mobil görünüm @mobile", () => {
  test("AC-18 sayfa yatay taşmaz, tablo kaydırılır, ürün adı ve durum görünür", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(rows(page)).toHaveCount(15);

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(pageOverflow).toBeLessThanOrEqual(0);

    const container = page.locator("[data-slot=table-container]");
    expect(await container.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);

    const firstName = rows(page).first().locator("td:nth-child(2)");
    await firstName.scrollIntoViewIfNeeded();
    await expect(firstName).toBeInViewport();
    await expect(firstName).toContainText("Tükendi");

    // Yatay kaydırmada ürün adı sütunu sabit kalır
    await container.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
    await expect(firstName).toBeInViewport();

    await page.getByRole("button", { name: "Sonraki" }).click();
    await expect(range(page)).toHaveText("56 üründen 16–30 arası");
    expect(errors).toEqual([]);
  });

  test("mobil ekran görüntüsü", async ({ page }) => {
    await page.goto("/");
    await expect(rows(page)).toHaveCount(15);
    await page.screenshot({ path: "docs/screenshots/mobile.png", fullPage: true });
  });
});

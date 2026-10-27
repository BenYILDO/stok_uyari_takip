import { expect, test, type Page } from "@playwright/test";

const QUESTION = "Hangi ürünler kritik durumda ve acil sipariş gerektiriyor?";
const day = (date: number, hour: number, minute: number) => new Date(2026, 9, date, hour, minute);

const toggle = (page: Page) => page.getByTestId("morning-toggle");
const question = (page: Page) => page.getByRole("heading", { name: QUESTION });
const items = (page: Page) => page.getByTestId("order-item");
const item = (page: Page, sku: string) => items(page).filter({ hasText: sku });

test.describe("Sabah modu", () => {
  test("AC-20 08:00'de normal panel açılır; buton ile sabah moduna geçilip geri dönülür", async ({ page }) => {
    await page.clock.install({ time: day(27, 8, 0) });
    await page.goto("/");
    await expect(page.getByTestId("kpi-total")).toBeVisible();
    await expect(toggle(page)).toHaveText("Sabah modu");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");

    await toggle(page).click();
    await expect(question(page)).toBeVisible();
    await expect(toggle(page)).toHaveText("Panele dön");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("kpi-total")).toHaveCount(0);

    await toggle(page).click();
    await expect(question(page)).toHaveCount(0);
    await expect(page.getByTestId("kpi-total-value")).toHaveText("56");
  });

  test("AC-22 sipariş gereken ürünler doğru listelenir ve sipariş ima edilmez", async ({ page }) => {
    await page.clock.install({ time: day(27, 8, 0) });
    await page.goto("/");
    await toggle(page).click();

    await expect(page.getByTestId("order-summary")).toHaveText(
      "Bugün 15 ürün için sipariş vermeniz gerekiyor.",
    );
    await expect(items(page)).toHaveCount(15);
    await expect(items(page).first()).toContainText("SK-1001");
    await expect(items(page).first()).toContainText("Tükendi");
    await expect(item(page, "SK-1003")).toContainText(
      "Bugün sipariş verilse bile yaklaşık 3 gün stoksuz kalır.",
    );
    await expect(item(page, "SK-1052")).toContainText("Satış verisi yok.");
    await expect(page.getByRole("heading", { name: "Stoğu tükendi" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Yeni stok gelmeden tükenecek" })).toBeVisible();
    await expect(page.getByText(/sipariş (oluştur|verildi)/i)).toHaveCount(0);
  });

  test("AC-21 08:31'de günün ilk açılışında kendiliğinden açılır; kapatılınca o gün tekrar açılmaz", async ({ page }) => {
    await page.clock.install({ time: day(27, 8, 31) });
    await page.goto("/");
    await expect(question(page)).toBeVisible();

    await toggle(page).click();
    await expect(page.getByTestId("kpi-total")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("kpi-total")).toBeVisible();
    await expect(question(page)).toHaveCount(0);

    // Ertesi gün 08:31: yeniden açılır
    await page.clock.setSystemTime(day(28, 8, 31));
    await page.reload();
    await expect(question(page)).toBeVisible();
  });

  test("AC-21 panel 08:30'dan önce açıksa saat gelince kendiliğinden geçer", async ({ page }) => {
    await page.clock.install({ time: day(27, 8, 29) });
    await page.goto("/");
    await expect(page.getByTestId("kpi-total")).toBeVisible();
    await expect(question(page)).toHaveCount(0);

    await page.clock.runFor("02:00");
    await expect(question(page)).toBeVisible();
  });

  test("sabah modu ekran görüntüsü", async ({ page }) => {
    await page.clock.install({ time: day(27, 8, 31) });
    await page.goto("/");
    await expect(items(page)).toHaveCount(15);
    await page.screenshot({ path: "docs/screenshots/morning.png", fullPage: true });
  });
});

test.describe("Sabah modu mobil @mobile", () => {
  test("AC-20 mobilde sabah modu taşmaz ve konsolda hata yok", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.clock.install({ time: day(27, 8, 31) });
    await page.goto("/");
    await expect(question(page)).toBeVisible();
    await expect(items(page)).toHaveCount(15);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.screenshot({ path: "docs/screenshots/morning-mobile.png", fullPage: true });
    expect(errors).toEqual([]);
  });
});

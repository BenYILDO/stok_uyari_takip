import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyzeProduct } from "@/domain/calculate";
import { parseProducts } from "@/domain/validate";

const raw: unknown = JSON.parse(
  readFileSync(new URL("../../public/data/products.json", import.meta.url), "utf8"),
);
const parsed = parseProducts(raw);
const analyses = parsed.ok ? parsed.products.map(analyzeProduct) : [];

describe("demo ürün verisi", () => {
  it("en az 50 ürün içerir ve tamamı geçerlidir", () => {
    expect(parsed.ok && parsed.issues).toEqual([]);
    expect(analyses.length).toBeGreaterThanOrEqual(50);
  });

  it("tüm stok durumlarını içerir", () => {
    const statuses = new Set(analyses.map((a) => a.status));
    expect([...statuses].sort()).toEqual(
      ["critical", "no_sales", "normal", "out_of_stock", "warning"].sort(),
    );
  });

  it("tedarik süresi nedeniyle kritik olan (kalan gün > 7) ürünler içerir", () => {
    expect(
      analyses.some((a) => a.status === "critical" && (a.remainingDays ?? 0) > 7),
    ).toBe(true);
  });

  it("sınır değerleri içerir: kalan = 3, kalan = tedarik, kalan = 7", () => {
    const days = analyses.map((a) => a.remainingDays);
    expect(days).toContain(3);
    expect(days).toContain(7);
    expect(analyses.some((a) => a.remainingDays === a.product.leadTimeDays)).toBe(true);
  });

  it("istisnaları içerir: stok 0 ve satış 0, ondalıklı satış", () => {
    expect(
      analyses.some((a) => a.product.stock === 0 && a.product.dailyAverageSales === 0),
    ).toBe(true);
    expect(analyses.some((a) => !Number.isInteger(a.product.dailyAverageSales))).toBe(true);
  });
});

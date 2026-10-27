import { describe, expect, it } from "vitest";
import { analyzeProduct } from "./calculate";
import { compareByUrgency, sortByUrgency } from "./prioritize";
import type { Product } from "./types";

const p = (
  sku: string,
  stock: number,
  dailyAverageSales: number,
  leadTimeDays: number,
): Product => ({ sku, name: sku, category: "Walking", stock, dailyAverageSales, leadTimeDays });

const skus = (products: Product[]) =>
  sortByUrgency(products.map(analyzeProduct)).map((a) => a.product.sku);

describe("sortByUrgency — AC-11", () => {
  it("durum sırası: Tükendi, Kritik, Dikkat, Normal, Satış Yok", () => {
    expect(
      skus([
        p("no-sales", 25, 0, 5),
        p("normal", 100, 5, 4),
        p("warning", 50, 10, 2),
        p("critical", 20, 10, 1),
        p("out", 0, 4, 3),
      ]),
    ).toEqual(["out", "critical", "warning", "normal", "no-sales"]);
  });

  it("Kritik ürünler tedarik açığına göre büyükten küçüğe sıralanır", () => {
    expect(
      skus([
        p("gap-1", 40, 10, 5), // 4 gün, açık 1
        p("gap-8", 24, 2, 20), // 12 gün, açık 8
        p("gap-3", 24, 2, 15), // 12 gün, açık 3
      ]),
    ).toEqual(["gap-8", "gap-3", "gap-1"]);
  });

  it("Kritik içinde açık eşitse kalan günü kısa olan üstte", () => {
    expect(
      skus([
        p("long", 60, 10, 8), // 6 gün, açık 2
        p("short", 20, 10, 4), // 2 gün, açık 2
      ]),
    ).toEqual(["short", "long"]);
  });

  it("Dikkat ve Normal içinde kalan günü kısa olan üstte", () => {
    expect(
      skus([
        p("normal-20", 200, 10, 2),
        p("warning-7", 70, 10, 2),
        p("normal-9", 90, 10, 2),
        p("warning-4", 40, 10, 2),
      ]),
    ).toEqual(["warning-4", "warning-7", "normal-9", "normal-20"]);
  });

  it("Tükendi içinde günlük satışı yüksek olan üstte (V5)", () => {
    expect(skus([p("slow", 0, 1, 3), p("fast", 0, 9, 3), p("none", 0, 0, 3)])).toEqual([
      "fast",
      "slow",
      "none",
    ]);
  });

  it("tam eşitlikte SKU'ya göre deterministik sıralar", () => {
    expect(skus([p("SK-2", 0, 4, 3), p("SK-1", 0, 4, 3)])).toEqual(["SK-1", "SK-2"]);
  });

  it("girdiyi değiştirmez", () => {
    const input = [p("b", 100, 5, 4), p("a", 0, 4, 3)].map(analyzeProduct);
    sortByUrgency(input);
    expect(input.map((a) => a.product.sku)).toEqual(["b", "a"]);
  });
});

describe("compareByUrgency", () => {
  it("daha acil olan için negatif döner", () => {
    const out = analyzeProduct(p("out", 0, 4, 3));
    const normal = analyzeProduct(p("normal", 100, 5, 4));
    expect(compareByUrgency(out, normal)).toBeLessThan(0);
    expect(compareByUrgency(normal, out)).toBeGreaterThan(0);
  });
});

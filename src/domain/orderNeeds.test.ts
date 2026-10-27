import { describe, expect, it } from "vitest";
import { analyzeProduct } from "./calculate";
import { buildOrderSummary, getOrderNeeds } from "./orderNeeds";
import type { Product } from "./types";

const p = (sku: string, stock: number, sales: number, lead: number): Product => ({
  sku,
  name: sku,
  category: "Walking",
  stock,
  dailyAverageSales: sales,
  leadTimeDays: lead,
});

const needFor = (product: Product) => {
  const { outOfStock, beforeRestock } = getOrderNeeds([analyzeProduct(product)]);
  return [...outOfStock, ...beforeRestock][0];
};

describe("getOrderNeeds", () => {
  it("yalnızca Tükendi ve Kritik ürünleri alır", () => {
    const needs = getOrderNeeds(
      [
        p("out", 0, 4, 3),
        p("critical", 20, 10, 1),
        p("warning", 50, 10, 2),
        p("normal", 100, 5, 4),
        p("no-sales", 25, 0, 5),
      ].map(analyzeProduct),
    );
    const skus = [...needs.outOfStock, ...needs.beforeRestock].map((n) => n.analysis.product.sku);
    expect(skus).toEqual(["out", "critical"]);
    expect(needs.total).toBe(2);
  });

  it("ürünleri iki gruba ayırır ve girdi sırasını korur", () => {
    const needs = getOrderNeeds([p("A", 0, 4, 3), p("B", 24, 2, 15), p("C", 20, 10, 1)].map(analyzeProduct));
    expect(needs.outOfStock.map((n) => n.analysis.product.sku)).toEqual(["A"]);
    expect(needs.beforeRestock.map((n) => n.analysis.product.sku)).toEqual(["B", "C"]);
    expect(needs.total).toBe(3);
  });

  it("boş girdide boş gruplar döner", () => {
    expect(getOrderNeeds([])).toEqual({ outOfStock: [], beforeRestock: [], total: 0 });
  });
});

describe("sipariş notları", () => {
  it("tükenen ürün: yeni stoğun en erken ne zaman geleceğini söyler", () => {
    expect(needFor(p("X", 0, 4, 7)).note).toBe("Raf boş; yeni stok en erken 7 gün sonra gelir.");
  });

  it("tükenen ürün, tedarik süresi 0: '0 gün sonra' yazmaz", () => {
    expect(needFor(p("X", 0, 2, 0)).note).toBe("Raf boş; yeni stok bugün gelebilir.");
  });

  it("tedarik açığı varsa kaç gün stoksuz kalacağını söyler", () => {
    expect(needFor(p("X", 24, 2, 15)).note).toBe(
      "Bugün sipariş verilse bile yaklaşık 3 gün stoksuz kalır.",
    );
  });

  it("açık yoksa bugün sipariş verilirse yetişeceğini söyler", () => {
    expect(needFor(p("X", 20, 10, 1)).note).toBe("Bugün sipariş verilirse yeni stok yetişir.");
  });

  it("stok ve satış 0 ise satış verisi olmadığını işaretler", () => {
    expect(needFor(p("X", 0, 0, 4)).noSalesData).toBe(true);
    expect(needFor(p("X", 0, 4, 4)).noSalesData).toBe(false);
    expect(needFor(p("X", 24, 2, 15)).noSalesData).toBe(false);
  });
});

describe("buildOrderSummary", () => {
  it("sipariş gereken ürün sayısını söyler", () => {
    expect(buildOrderSummary(15)).toBe("Bugün 15 ürün için sipariş vermeniz gerekiyor.");
  });

  it("ürün yoksa acil sipariş olmadığını söyler", () => {
    expect(buildOrderSummary(0)).toBe("Bugün acil sipariş gerektiren ürün yok.");
  });
});

describe("dil kuralı", () => {
  it("hiçbir metin siparişin oluşturulduğunu veya verildiğini ima etmez", () => {
    const texts = [
      buildOrderSummary(3),
      buildOrderSummary(0),
      ...[p("a", 0, 4, 7), p("b", 0, 2, 0), p("c", 24, 2, 15), p("d", 20, 10, 1)].map(
        (x) => needFor(x).note,
      ),
    ];
    for (const t of texts) expect(t).not.toMatch(/oluştur|verildi/i);
  });
});

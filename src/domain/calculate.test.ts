import { describe, expect, it } from "vitest";
import {
  analyzeProduct,
  getRemainingDays,
  getStatus,
  getStockGapDays,
} from "./calculate";
import type { Product } from "./types";

const product = (
  stock: number,
  dailyAverageSales: number,
  leadTimeDays: number,
): Product => ({
  sku: "SK-TEST",
  name: "Test",
  category: "Walking",
  stock,
  dailyAverageSales,
  leadTimeDays,
});

describe("getRemainingDays", () => {
  it("stoğu günlük satışa böler (30 / 5 = 6)", () => {
    expect(getRemainingDays(product(30, 5, 3))).toBe(6);
  });

  it("günlük satış 0 iken sıfıra bölmez, null döner", () => {
    expect(getRemainingDays(product(25, 0, 5))).toBeNull();
  });

  it("ondalıklı sonucu yuvarlamaz", () => {
    expect(getRemainingDays(product(11, 3, 3))).toBeCloseTo(3.6667, 4);
  });
});

describe("getStockGapDays", () => {
  it("tedarik süresinden kalan günü çıkarır (pozitif = açık var)", () => {
    expect(getStockGapDays(product(24, 2, 15))).toBe(3);
  });

  it("stok tedarik süresinden uzunsa negatif döner", () => {
    expect(getStockGapDays(product(100, 5, 4))).toBe(-16);
  });

  it("kalan gün hesaplanamıyorsa null döner", () => {
    expect(getStockGapDays(product(25, 0, 5))).toBeNull();
  });
});

describe("getStatus — brief §9 kabul senaryoları", () => {
  it.each([
    ["AC-01 stok 0", product(0, 4, 3), "out_of_stock"],
    ["AC-02 stok 20, satış 10, tedarik 1", product(20, 10, 1), "critical"],
    ["AC-03 stok 50, satış 10, tedarik 8", product(50, 10, 8), "critical"],
    ["AC-04 stok 50, satış 10, tedarik 2", product(50, 10, 2), "warning"],
    ["AC-05 stok 100, satış 5, tedarik 4", product(100, 5, 4), "normal"],
    ["AC-06 stok 25, satış 0, tedarik 5", product(25, 0, 5), "no_sales"],
    ["AC-07 kalan gün = tedarik süresi (5 = 5)", product(50, 10, 5), "critical"],
    ["AC-08 kalan gün = 3", product(30, 10, 1), "critical"],
    ["AC-09 kalan gün = 7, tedarik 2", product(70, 10, 2), "warning"],
  ] as const)("%s", (_label, p, expected) => {
    expect(getStatus(p)).toBe(expected);
  });
});

describe("getStatus — kural sırası ve sınırlar", () => {
  it("stok 0 ve satış 0 ise Tükendi (kural 1, kural 2'den önce)", () => {
    expect(getStatus(product(0, 0, 5))).toBe("out_of_stock");
  });

  it("tedarik süresi 7 günden uzunsa: 12 gün kalan / 15 gün tedarik → Kritik", () => {
    expect(getStatus(product(24, 2, 15))).toBe("critical");
  });

  it("AC-10 yuvarlama yapmaz: 3,67 gün / tedarik 3 → Dikkat (aşağı yuvarlansaydı Kritik olurdu)", () => {
    expect(getStatus(product(11, 3, 3))).toBe("warning");
  });

  it("AC-10 3 günün hemen üstü (3,1) ve tedarik 1 → Dikkat", () => {
    expect(getStatus(product(31, 10, 1))).toBe("warning");
  });

  it("7 günün hemen üstü (7,1) ve kısa tedarik → Normal", () => {
    expect(getStatus(product(71, 10, 2))).toBe("normal");
  });

  it("tedarik süresi 0 geçerlidir; 5 gün kalan → Dikkat", () => {
    expect(getStatus(product(50, 10, 0))).toBe("warning");
  });
});

describe("analyzeProduct", () => {
  it("ürünü durum, kalan gün ve tedarik açığıyla birlikte döner", () => {
    const p = product(24, 2, 15);
    expect(analyzeProduct(p)).toEqual({
      product: p,
      status: "critical",
      remainingDays: 12,
      stockGapDays: 3,
    });
  });
});

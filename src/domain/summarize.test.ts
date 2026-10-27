import { describe, expect, it } from "vitest";
import { analyzeProduct } from "./calculate";
import { buildAlertMessage, getKpis } from "./summarize";
import type { Product } from "./types";

const p = (sku: string, stock: number, sales: number, lead: number): Product => ({
  sku,
  name: sku,
  category: "Walking",
  stock,
  dailyAverageSales: sales,
  leadTimeDays: lead,
});

describe("getKpis — AC-13", () => {
  it("durumları analiz sonuçlarından sayar", () => {
    const analyses = [
      p("o1", 0, 4, 3),
      p("o2", 0, 0, 3),
      p("c1", 20, 10, 1),
      p("w1", 50, 10, 2),
      p("n1", 100, 5, 4),
      p("s1", 25, 0, 5),
    ].map(analyzeProduct);
    expect(getKpis(analyses)).toEqual({ total: 6, outOfStock: 2, critical: 1, warning: 1 });
  });

  it("boş listede sıfırlar döner", () => {
    expect(getKpis([])).toEqual({ total: 0, outOfStock: 0, critical: 0, warning: 0 });
  });
});

describe("buildAlertMessage", () => {
  it("tükenen ve kritik ürünleri birlikte bildirir", () => {
    expect(buildAlertMessage({ total: 50, outOfStock: 2, critical: 6, warning: 3 })).toEqual({
      tone: "danger",
      title: "2 ürünün stoğu tükenmiş, 6 ürün kritik seviyede.",
      description: "Bu ürünler listenin en üstünde. Önce bunları inceleyin.",
    });
  });

  it("yalnızca tükenen ürün varsa kritik kısmını yazmaz", () => {
    expect(buildAlertMessage({ total: 9, outOfStock: 1, critical: 0, warning: 0 }).title).toBe(
      "1 ürünün stoğu tükenmiş.",
    );
  });

  it("yalnızca kritik ürün varsa tükenen kısmını yazmaz", () => {
    expect(buildAlertMessage({ total: 9, outOfStock: 0, critical: 4, warning: 0 }).title).toBe(
      "4 ürün kritik seviyede.",
    );
  });

  it("kritik ürün yoksa bilgilendirme tonunda mesaj verir, dikkat sayısını belirtir", () => {
    expect(buildAlertMessage({ total: 9, outOfStock: 0, critical: 0, warning: 3 })).toEqual({
      tone: "info",
      title: "Stoğu tükenen veya kritik seviyede ürün yok.",
      description: "3 ürün 7 gün içinde tükenebilir; Dikkat filtresiyle takip edebilirsiniz.",
    });
  });

  it("hiç risk yoksa sade bilgilendirme verir", () => {
    expect(buildAlertMessage({ total: 9, outOfStock: 0, critical: 0, warning: 0 })).toEqual({
      tone: "info",
      title: "Stoğu tükenen veya kritik seviyede ürün yok.",
      description: "Tüm ürünlerin stoğu tedarik süresini karşılıyor.",
    });
  });

  it("sipariş oluşturulduğunu ima etmez (V9)", () => {
    const messages = [
      buildAlertMessage({ total: 9, outOfStock: 2, critical: 3, warning: 1 }),
      buildAlertMessage({ total: 9, outOfStock: 0, critical: 0, warning: 1 }),
    ];
    for (const m of messages) {
      expect(`${m.title} ${m.description}`).not.toMatch(/sipariş/i);
    }
  });
});

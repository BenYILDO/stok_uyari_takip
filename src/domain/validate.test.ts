import { describe, expect, it } from "vitest";
import { parseProducts } from "./validate";

const valid = {
  sku: "SK-1001",
  name: "Skechers Arch Fit",
  category: "Walking",
  stock: 24,
  dailyAverageSales: 8,
  leadTimeDays: 5,
};

describe("parseProducts — AC-12/AC-19", () => {
  it("geçerli kayıtları ürün olarak döner", () => {
    const result = parseProducts([valid]);
    expect(result).toEqual({ ok: true, products: [valid], issues: [] });
  });

  it("dizi olmayan veride hata döner, çökmez", () => {
    expect(parseProducts({ products: [] })).toEqual({
      ok: false,
      error: "Ürün verisi bir liste olmalı.",
    });
    expect(parseProducts(null).ok).toBe(false);
  });

  it("eksik alanı sıfıra çevirmez, kaydı sorunlu olarak ayırır", () => {
    const { stock: _omit, ...noStock } = valid;
    const result = parseProducts([noStock, { ...valid, sku: "SK-2" }]);
    expect(result.ok && result.products.map((p) => p.sku)).toEqual(["SK-2"]);
    expect(result.ok && result.issues).toEqual([
      { row: 1, sku: "SK-1001", reasons: ["Mevcut stok eksik veya sayı değil."] },
    ]);
  });

  it("sayı yerine metin, NaN ve sonsuz değerleri reddeder", () => {
    const result = parseProducts([
      { ...valid, sku: "A", stock: "24" },
      { ...valid, sku: "B", dailyAverageSales: Number.NaN },
      { ...valid, sku: "C", leadTimeDays: Number.POSITIVE_INFINITY },
    ]);
    expect(result.ok && result.products).toEqual([]);
    expect(result.ok && result.issues.map((i) => i.reasons)).toEqual([
      ["Mevcut stok eksik veya sayı değil."],
      ["Günlük ortalama satış eksik veya sayı değil."],
      ["Tedarik süresi eksik veya sayı değil."],
    ]);
  });

  it("negatif değerleri ve ondalıklı stoğu reddeder (V4)", () => {
    const result = parseProducts([
      { ...valid, sku: "A", stock: -1 },
      { ...valid, sku: "B", stock: 2.5 },
      { ...valid, sku: "C", dailyAverageSales: -0.5 },
      { ...valid, sku: "D", leadTimeDays: -2 },
    ]);
    expect(result.ok && result.issues.map((i) => i.reasons)).toEqual([
      ["Mevcut stok negatif olamaz."],
      ["Mevcut stok tam sayı olmalı."],
      ["Günlük ortalama satış negatif olamaz."],
      ["Tedarik süresi negatif olamaz."],
    ]);
  });

  it("ondalıklı günlük satışı ve 0 tedarik süresini kabul eder (V4)", () => {
    const result = parseProducts([{ ...valid, dailyAverageSales: 0.5, leadTimeDays: 0 }]);
    expect(result.ok && result.issues).toEqual([]);
  });

  it("boş SKU, ad veya kategoriyi reddeder ve tüm nedenleri birlikte listeler", () => {
    const result = parseProducts([{ ...valid, sku: " ", name: "", category: 7 }]);
    expect(result.ok && result.issues).toEqual([
      {
        row: 1,
        reasons: ["SKU eksik.", "Ürün adı eksik.", "Kategori eksik."],
      },
    ]);
  });

  it("nesne olmayan kaydı reddeder", () => {
    const result = parseProducts(["SK-1", 42]);
    expect(result.ok && result.issues).toEqual([
      { row: 1, reasons: ["Kayıt bir ürün nesnesi değil."] },
      { row: 2, reasons: ["Kayıt bir ürün nesnesi değil."] },
    ]);
  });

  it("tekrar eden SKU'nun ilk kaydını tutar, sonrakileri ayırır", () => {
    const result = parseProducts([valid, { ...valid, name: "Kopya" }]);
    expect(result.ok && result.products).toEqual([valid]);
    expect(result.ok && result.issues).toEqual([
      { row: 2, sku: "SK-1001", reasons: ["Bu SKU daha önce kullanılmış."] },
    ]);
  });

  it("metin alanlarının baş ve sondaki boşluklarını temizler", () => {
    const result = parseProducts([{ ...valid, sku: " SK-1001 ", name: " Arch Fit " }]);
    expect(result.ok && result.products[0]).toMatchObject({ sku: "SK-1001", name: "Arch Fit" });
  });
});

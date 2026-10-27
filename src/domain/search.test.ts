import { describe, expect, it } from "vitest";
import { matchesSearch } from "./search";

const product = { sku: "SK-1022", name: "Slip-ins Go Walk 6" };

describe("matchesSearch — AC-16", () => {
  it("SKU ile eşleşir", () => {
    expect(matchesSearch(product, "SK-1022")).toBe(true);
    expect(matchesSearch(product, "1022")).toBe(true);
  });

  it("ürün adının bir parçasıyla eşleşir", () => {
    expect(matchesSearch(product, "go walk")).toBe(true);
  });

  it("büyük/küçük harf duyarsızdır, Türkçe I/İ/ı farkını yok sayar", () => {
    expect(matchesSearch(product, "SLIP")).toBe(true);
    expect(matchesSearch(product, "SLİP")).toBe(true);
    expect(matchesSearch(product, "slıp")).toBe(true);
  });

  it("baş ve sondaki boşlukları yok sayar; boş arama her ürünle eşleşir", () => {
    expect(matchesSearch(product, "  walk ")).toBe(true);
    expect(matchesSearch(product, "   ")).toBe(true);
  });

  it("eşleşmeyen aramada false döner", () => {
    expect(matchesSearch(product, "sandal")).toBe(false);
  });
});

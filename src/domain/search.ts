import type { Product } from "./types";

/** Türkçe I/İ/ı/i farkını ve aksanları yok sayan karşılaştırma anahtarı. */
const fold = (value: string) =>
  value
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Ürün adı veya SKU içinde arar. Boş arama her ürünle eşleşir. */
export function matchesSearch(product: Pick<Product, "sku" | "name">, query: string): boolean {
  const needle = fold(query.trim());
  if (!needle) return true;
  return fold(product.sku).includes(needle) || fold(product.name).includes(needle);
}

import { analyzeProduct } from "@/domain/calculate";
import { sortByUrgency } from "@/domain/prioritize";
import type { DataIssue, ProductAnalysis } from "@/domain/types";
import { parseProducts } from "@/domain/validate";

export type LoadResult =
  | { status: "ready"; analyses: ProductAnalysis[]; issues: DataIssue[] }
  | { status: "error"; message: string };

type FetchLike = (url: string) => Promise<Response>;

export const PRODUCTS_URL = `${import.meta.env.BASE_URL}data/products.json`;

/** Ürün JSON'unu okur, doğrular ve aciliyete göre sıralar. Hiçbir durumda fırlatmaz. */
export async function loadProducts(
  url: string = PRODUCTS_URL,
  fetchImpl: FetchLike = (u) => fetch(u),
): Promise<LoadResult> {
  let response: Response;
  try {
    response = await fetchImpl(url);
  } catch {
    return {
      status: "error",
      message: "Ürün dosyası yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.",
    };
  }
  if (!response.ok) {
    return { status: "error", message: `Ürün dosyası yüklenemedi (HTTP ${response.status}).` };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(await response.text());
  } catch {
    return { status: "error", message: "Ürün dosyası okunamadı: geçerli bir JSON değil." };
  }

  const parsed = parseProducts(raw);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  return {
    status: "ready",
    analyses: sortByUrgency(parsed.products.map(analyzeProduct)),
    issues: parsed.issues,
  };
}

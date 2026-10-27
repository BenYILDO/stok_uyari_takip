import type { DataIssue, Product } from "./types";

export type ParseResult =
  | { ok: true; products: Product[]; issues: DataIssue[] }
  | { ok: false; error: string };

type NumericField = "stock" | "dailyAverageSales" | "leadTimeDays";

const NUMERIC_FIELDS: { key: NumericField; label: string; integer: boolean }[] = [
  { key: "stock", label: "Mevcut stok", integer: true },
  { key: "dailyAverageSales", label: "Günlük ortalama satış", integer: false },
  { key: "leadTimeDays", label: "Tedarik süresi", integer: false },
];

const TEXT_FIELDS = [
  { key: "sku", label: "SKU" },
  { key: "name", label: "Ürün adı" },
  { key: "category", label: "Kategori" },
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * JSON'dan gelen bilinmeyen veriyi doğrular. Geçersiz kayıtlar sıfıra
 * çevrilmez; nedenleriyle birlikte `issues` listesine ayrılır.
 */
export function parseProducts(raw: unknown): ParseResult {
  if (!Array.isArray(raw)) {
    return { ok: false, error: "Ürün verisi bir liste olmalı." };
  }

  const products: Product[] = [];
  const issues: DataIssue[] = [];
  const seenSkus = new Set<string>();

  raw.forEach((item, index) => {
    const row = index + 1;
    if (!isRecord(item)) {
      issues.push({ row, reasons: ["Kayıt bir ürün nesnesi değil."] });
      return;
    }

    const reasons: string[] = [];
    for (const { key, label } of TEXT_FIELDS) {
      if (!text(item[key])) reasons.push(`${label} eksik.`);
    }
    for (const { key, label, integer } of NUMERIC_FIELDS) {
      const value = item[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        reasons.push(`${label} eksik veya sayı değil.`);
      } else if (value < 0) {
        reasons.push(`${label} negatif olamaz.`);
      } else if (integer && !Number.isInteger(value)) {
        reasons.push(`${label} tam sayı olmalı.`);
      }
    }

    const sku = text(item.sku);
    if (reasons.length === 0 && seenSkus.has(sku)) {
      reasons.push("Bu SKU daha önce kullanılmış.");
    }

    if (reasons.length > 0) {
      issues.push(sku ? { row, sku, reasons } : { row, reasons });
      return;
    }

    seenSkus.add(sku);
    products.push({
      sku,
      name: text(item.name),
      category: text(item.category),
      stock: item.stock as number,
      dailyAverageSales: item.dailyAverageSales as number,
      leadTimeDays: item.leadTimeDays as number,
    });
  });

  return { ok: true, products, issues };
}

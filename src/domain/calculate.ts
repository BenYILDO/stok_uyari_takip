import type { Product, ProductAnalysis, StockStatus } from "./types";

const CRITICAL_DAYS = 3;
const WARNING_DAYS = 7;

/** stock / dailyAverageSales. Satış 0 ise sıfıra bölmemek için null. */
export function getRemainingDays(p: Product): number | null {
  if (p.dailyAverageSales === 0) return null;
  return p.stock / p.dailyAverageSales;
}

/** leadTimeDays - remainingDays. Pozitif değer tahmini stok açığıdır. */
export function getStockGapDays(p: Product): number | null {
  const remaining = getRemainingDays(p);
  return remaining === null ? null : p.leadTimeDays - remaining;
}

/**
 * Brief §5.3 kuralları, belirtilen sırayla. Karşılaştırmalar
 * yuvarlanmamış değerlerle yapılır.
 */
export function getStatus(p: Product): StockStatus {
  if (p.stock === 0) return "out_of_stock";

  const remaining = getRemainingDays(p);
  if (remaining === null) return "no_sales";

  if (remaining <= CRITICAL_DAYS || remaining <= p.leadTimeDays) return "critical";
  if (remaining <= WARNING_DAYS) return "warning";
  return "normal";
}

export function analyzeProduct(p: Product): ProductAnalysis {
  return {
    product: p,
    status: getStatus(p),
    remainingDays: getRemainingDays(p),
    stockGapDays: getStockGapDays(p),
  };
}

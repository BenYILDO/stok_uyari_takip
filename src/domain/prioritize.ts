import type { ProductAnalysis, StockStatus } from "./types";

/** Brief §6 öncelik sırası: küçük değer daha acil. */
export const STATUS_RANK: Record<StockStatus, number> = {
  out_of_stock: 0,
  critical: 1,
  warning: 2,
  normal: 3,
  no_sales: 4,
};

const byRemainingAsc = (a: ProductAnalysis, b: ProductAnalysis) =>
  (a.remainingDays ?? Infinity) - (b.remainingDays ?? Infinity);

const withinStatus: Record<StockStatus, (a: ProductAnalysis, b: ProductAnalysis) => number> = {
  // V5: kaçırılan satış potansiyeli yüksek olan üstte
  out_of_stock: (a, b) => b.product.dailyAverageSales - a.product.dailyAverageSales,
  critical: (a, b) =>
    (b.stockGapDays ?? -Infinity) - (a.stockGapDays ?? -Infinity) || byRemainingAsc(a, b),
  warning: byRemainingAsc,
  normal: byRemainingAsc,
  no_sales: () => 0,
};

export function compareByUrgency(a: ProductAnalysis, b: ProductAnalysis): number {
  return (
    STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
    withinStatus[a.status](a, b) ||
    a.product.sku.localeCompare(b.product.sku, "tr")
  );
}

export function sortByUrgency(list: readonly ProductAnalysis[]): ProductAnalysis[] {
  return [...list].sort(compareByUrgency);
}

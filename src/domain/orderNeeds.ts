import { formatDays } from "@/lib/format";
import type { ProductAnalysis } from "./types";

export interface OrderNeed {
  analysis: ProductAnalysis;
  /** Ürünün neden acil olduğunu anlatan tek cümle */
  note: string;
  /** Stok ve satış 0: satış verisi olmadığı için talep bilinmiyor */
  noSalesData: boolean;
}

export interface OrderNeeds {
  outOfStock: OrderNeed[];
  beforeRestock: OrderNeed[];
  total: number;
}

function buildNote({ status, stockGapDays, product }: ProductAnalysis): string {
  if (status === "out_of_stock") {
    return product.leadTimeDays > 0
      ? `Raf boş; yeni stok en erken ${formatDays(product.leadTimeDays)} gün sonra gelir.`
      : "Raf boş; yeni stok bugün gelebilir.";
  }
  return stockGapDays !== null && stockGapDays > 0
    ? `Bugün sipariş verilse bile yaklaşık ${formatDays(stockGapDays)} gün stoksuz kalır.`
    : "Bugün sipariş verilirse yeni stok yetişir.";
}

const toNeed = (analysis: ProductAnalysis): OrderNeed => ({
  analysis,
  note: buildNote(analysis),
  noSalesData: analysis.product.stock === 0 && analysis.product.dailyAverageSales === 0,
});

/**
 * Sipariş gereken ürünler = Tükendi + Kritik (mevcut iş kuralları; yeni eşik
 * yok). Girdi sırası korunur; çağıran aciliyet sırasıyla verir.
 */
export function getOrderNeeds(analyses: readonly ProductAnalysis[]): OrderNeeds {
  const outOfStock = analyses.filter((a) => a.status === "out_of_stock").map(toNeed);
  const beforeRestock = analyses.filter((a) => a.status === "critical").map(toNeed);
  return { outOfStock, beforeRestock, total: outOfStock.length + beforeRestock.length };
}

export function buildOrderSummary(total: number): string {
  return total > 0
    ? `Bugün ${total} ürün için sipariş vermeniz gerekiyor.`
    : "Bugün acil sipariş gerektiren ürün yok.";
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  stock: number;
  dailyAverageSales: number;
  leadTimeDays: number;
}

export type StockStatus =
  | "out_of_stock"
  | "critical"
  | "warning"
  | "normal"
  | "no_sales";

export interface ProductAnalysis {
  product: Product;
  status: StockStatus;
  /** Yuvarlanmamış değer. Günlük satış 0 ise null. */
  remainingDays: number | null;
  /** leadTimeDays - remainingDays. Kalan gün hesaplanamıyorsa null. */
  stockGapDays: number | null;
}

/** Hesaplanamayan (geçersiz) bir JSON kaydı. */
export interface DataIssue {
  /** JSON dizisindeki 1 tabanlı sıra numarası */
  row: number;
  sku?: string;
  reasons: string[];
}

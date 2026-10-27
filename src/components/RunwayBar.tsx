import type { ProductAnalysis } from "@/domain/types";
import { STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

/** Tüm satırlarda aynı ölçek: 0–30 gün. Daha uzun süreler çubuğu doldurur. */
export const RUNWAY_SCALE_DAYS = 30;

const pct = (days: number) => `${(Math.min(days, RUNWAY_SCALE_DAYS) / RUNWAY_SCALE_DAYS) * 100}%`;

/**
 * Kalan stok süresi (dolgu) ile tedarik süresini (çentik) yan yana gösterir.
 * Dolgu çentiğe ulaşmıyorsa yeni stok gelmeden ürün tükenir. Bilgi metin
 * olarak da tabloda bulunduğu için ekran okuyuculardan gizlenir.
 */
export function RunwayBar({ analysis }: { analysis: ProductAnalysis }) {
  const { remainingDays, status, product } = analysis;
  if (remainingDays === null) return <span className="w-16" aria-hidden="true" />;

  return (
    <span aria-hidden="true" className="relative hidden h-1.5 w-16 rounded-full bg-muted md:block">
      <span
        className={cn("absolute inset-y-0 left-0 rounded-full", STATUS_META[status].fill)}
        style={{ width: pct(remainingDays) }}
      />
      <span
        className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
        style={{ left: pct(product.leadTimeDays) }}
      />
    </span>
  );
}

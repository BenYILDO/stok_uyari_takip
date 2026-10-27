import { Card } from "@/components/ui/card";
import type { Kpis } from "@/domain/summarize";
import type { StockStatus } from "@/domain/types";
import { cn } from "@/lib/utils";

interface KpiItem {
  key: keyof Kpis;
  label: string;
  hint: string;
  /** Kart seçildiğinde tabloya uygulanacak durum filtresi */
  status?: StockStatus;
  tone: string;
}

const ITEMS: KpiItem[] = [
  { key: "total", label: "Toplam ürün", hint: "Tüm ürünleri göster", tone: "text-foreground" },
  {
    key: "outOfStock",
    label: "Stoğu tükenenler",
    hint: "Satılabilir stok yok",
    status: "out_of_stock",
    tone: "text-status-out-bg",
  },
  {
    key: "critical",
    label: "Kritik stok",
    hint: "3 gün içinde ya da tedarikten önce biter",
    status: "critical",
    tone: "text-status-critical",
  },
  {
    key: "warning",
    label: "Dikkat gerektirenler",
    hint: "7 gün içinde tükenebilir",
    status: "warning",
    tone: "text-status-warning",
  },
];

export function KpiCards({
  kpis,
  activeStatus,
  onSelect,
}: {
  kpis: Kpis;
  activeStatus: StockStatus | undefined;
  onSelect: (status: StockStatus | undefined) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ITEMS.map((item) => {
        const value = kpis[item.key];
        const active = item.status ? activeStatus === item.status : activeStatus === undefined;
        return (
          <li key={item.key}>
            <Card
              className={cn(
                "h-full gap-0 overflow-hidden rounded-lg py-0 shadow-none transition-colors hover:border-foreground/30",
                active && item.status && "border-foreground/70",
              )}
            >
              <button
                type="button"
                data-testid={`kpi-${item.key}`}
                aria-pressed={item.status ? active : undefined}
                onClick={() => onSelect(item.status && !active ? item.status : undefined)}
                className="h-full w-full rounded-lg px-4 py-3.5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
              >
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <span
                  className={cn(
                    "tabular mt-1 block text-3xl leading-tight font-semibold tracking-tight",
                    value > 0 ? item.tone : "text-muted-foreground",
                  )}
                  data-testid={`kpi-${item.key}-value`}
                >
                  {value}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{item.hint}</span>
              </button>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

import { createColumnHelper, type FilterFn, type SortFn } from "@tanstack/react-table";
import { compareByUrgency } from "@/domain/prioritize";
import type { ProductAnalysis } from "@/domain/types";
import { formatDays, formatNumber } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { RunwayBar } from "./RunwayBar";
import type { productTableFeatures } from "./useProductTable";

type Features = typeof productTableFeatures;

const helper = createColumnHelper<Features, ProductAnalysis>();

const equals: FilterFn<Features, ProductAnalysis> = (row, columnId, value) =>
  row.getValue(columnId) === value;

const byUrgency: SortFn<Features, ProductAnalysis> = (a, b) =>
  compareByUrgency(a.original, b.original);

export const productColumns = helper.columns([
  helper.accessor((row) => row.product.sku, {
    id: "sku",
    header: "SKU",
    cell: ({ getValue }) => <span translate="no">{getValue()}</span>,
  }),
  helper.accessor((row) => row.product.name, {
    id: "name",
    header: "Ürün adı",
    sortFn: "text",
    cell: ({ row }) => (
      <>
        <span translate="no" className="block font-medium text-foreground">
          {row.original.product.name}
        </span>
        <span className="mt-0.5 flex items-center gap-2 sm:hidden">
          <span translate="no" className="text-xs whitespace-nowrap text-muted-foreground">
            {row.original.product.sku}
          </span>
          <StatusBadge status={row.original.status} />
        </span>
      </>
    ),
  }),
  helper.accessor((row) => row.product.category, {
    id: "category",
    header: "Kategori",
    sortFn: "text",
    filterFn: equals,
  }),
  helper.accessor((row) => row.product.stock, {
    id: "stock",
    header: "Mevcut stok",
    cell: ({ getValue }) => formatNumber(getValue()),
  }),
  helper.accessor((row) => row.product.dailyAverageSales, {
    id: "dailyAverageSales",
    header: "Günlük ort. satış",
    cell: ({ getValue }) => formatNumber(getValue()),
  }),
  helper.accessor((row) => row.remainingDays ?? undefined, {
    id: "remainingDays",
    header: "Kalan gün",
    sortUndefined: "last",
    cell: ({ row }) => (
      <span className="inline-flex items-center justify-end gap-2.5">
        <RunwayBar analysis={row.original} />
        <span className="w-9 text-right">{formatDays(row.original.remainingDays)}</span>
      </span>
    ),
  }),
  helper.accessor((row) => row.product.leadTimeDays, {
    id: "leadTimeDays",
    header: "Tedarik süresi",
    cell: ({ getValue }) => `${formatNumber(getValue())} gün`,
  }),
  helper.accessor((row) => row.status, {
    id: "status",
    header: "Durum",
    sortFn: byUrgency,
    filterFn: equals,
    cell: ({ row }) => {
      const { status, stockGapDays } = row.original;
      const gap = status === "critical" && stockGapDays !== null && stockGapDays > 0;
      return (
        <span className="flex flex-col items-start gap-1">
          <StatusBadge status={status} />
          {gap && (
            <span className="text-xs whitespace-nowrap text-status-critical">
              Tedarikten {formatDays(stockGapDays)}&nbsp;gün kısa
            </span>
          )}
        </span>
      );
    },
  }),
]);

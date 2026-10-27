import { ArrowDown, ArrowUp, ArrowUpDown, Info } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { StockStatus } from "@/domain/types";
import { cn } from "@/lib/utils";
import { RUNWAY_SCALE_DAYS } from "./RunwayBar";
import type { ProductTableController } from "./useProductTable";

const NUMERIC = new Set(["stock", "dailyAverageSales", "remainingDays", "leadTimeDays"]);

const COLUMN_CLASS: Record<string, string> = {
  sku: "hidden sm:table-cell text-muted-foreground whitespace-nowrap",
  name:
    "sticky left-0 z-10 bg-inherit min-w-36 max-w-56 whitespace-normal sm:static sm:min-w-44",
};

const HEADER_HINT: Record<string, string> = {
  remainingDays: `Mevcut stok ÷ günlük ortalama satış. Çubuk ${RUNWAY_SCALE_DAYS} güne kadar kalan süreyi, çentik tedarik süresini gösterir.`,
  leadTimeDays: "Yeni stoğun mağazaya ulaşması için gereken gün.",
};

const ROW_ACCENT: Partial<Record<StockStatus, string>> = {
  out_of_stock: "shadow-[inset_3px_0_0_var(--status-out-bg)]",
  critical: "shadow-[inset_3px_0_0_var(--status-critical)]",
};

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

export function ProductTable({
  controller,
  emptyState,
}: {
  controller: ProductTableController;
  emptyState: ReactNode;
}) {
  const { table } = controller;
  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table className="tabular">
        <TableCaption className="sr-only">
          Ürünler varsayılan olarak aciliyete göre sıralanır: Tükendi, Kritik, Dikkat, Normal,
          Satış Yok. Sütun başlıklarıyla sıralamayı değiştirebilirsiniz.
        </TableCaption>
        <TableHeader className="bg-muted/60">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const id = header.column.id;
                const sorted = header.column.getIsSorted();
                const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={sorted ? ARIA_SORT[sorted] : undefined}
                    className={cn(
                      "h-11 px-3 text-xs font-semibold text-muted-foreground",
                      NUMERIC.has(id) && "text-right",
                      COLUMN_CLASS[id],
                      id === "name" && "bg-muted sm:bg-transparent",
                    )}
                  >
                    <span className={cn("inline-flex items-center gap-0.5", NUMERIC.has(id) && "flex-row-reverse")}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "-mx-2 h-8 gap-1 px-2 text-xs font-semibold",
                          sorted ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        <table.FlexRender header={header} />
                        <SortIcon aria-hidden="true" className={cn("size-3.5", !sorted && "opacity-40")} />
                      </Button>
                      {HEADER_HINT[id] && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                              aria-label={`${String(header.column.columnDef.header)} nedir?`}
                            >
                              <Info aria-hidden="true" className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-64">{HEADER_HINT[id]}</TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={table.getAllLeafColumns().length} className="py-14">
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-status={row.original.status}
                className="bg-card hover:bg-row-hover"
              >
                {row.getAllCells().map((cell) => {
                  const id = cell.column.id;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-3 py-2.5",
                        NUMERIC.has(id) && "text-right",
                        COLUMN_CLASS[id],
                        id === "sku" && ROW_ACCENT[row.original.status],
                        id === "name" && ["sm:shadow-none", ROW_ACCENT[row.original.status]],
                      )}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

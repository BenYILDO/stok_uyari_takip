import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductTableController } from "./useProductTable";

export function TablePagination({ controller }: { controller: ProductTableController }) {
  const { table } = controller;
  const total = table.getPrePaginatedRowModel().rows.length;
  if (total === 0) return null;

  const { pageIndex, pageSize } = table.state.pagination;
  const from = pageIndex * pageSize + 1;
  const to = Math.min(from + pageSize - 1, total);
  const pageCount = table.getPageCount();

  return (
    <nav
      aria-label="Sayfalama"
      className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
    >
      <p className="tabular" aria-live="polite" data-testid="result-range">
        {total} üründen {from}–{to} arası
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 bg-card"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft aria-hidden="true" />
          Önceki
        </Button>
        <span className="tabular min-w-24 text-center text-foreground">
          Sayfa {pageIndex + 1} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-9 bg-card"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Sonraki
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}

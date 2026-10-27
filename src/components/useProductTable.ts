import { useMemo, useState } from "react";
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type PaginationState,
  sortFn_text,
  type SortingState,
} from "@tanstack/react-table";
import { matchesSearch } from "@/domain/search";
import type { ProductAnalysis, StockStatus } from "@/domain/types";
import { productColumns } from "./productColumns";

export const PAGE_SIZE = 15;

export const productTableFeatures = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { text: sortFn_text },
  filteredRowModel: createFilteredRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const FIRST_PAGE: PaginationState = { pageIndex: 0, pageSize: PAGE_SIZE };

/**
 * TanStack Table yalnızca tablo durumunu (sıralama, filtre, sayfa) yönetir.
 * İş kuralları domain/ altındaki saf fonksiyonlardadır; veri aciliyet
 * sırasıyla gelir, sıralama boşken bu sıra korunur.
 */
export function useProductTable(analyses: ProductAnalysis[]) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>(FIRST_PAGE);

  const table = useTable({
    features: productTableFeatures,
    columns: productColumns,
    data: analyses,
    getRowId: (row) => row.product.sku,
    state: { sorting, globalFilter, columnFilters, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    // İlk tıklama her sütunda artan sıralar: en kısa kalan gün en üstte
    sortDescFirst: false,
    globalFilterFn: (row, _columnId, value: string) => matchesSearch(row.original.product, value),
    getColumnCanGlobalFilter: (column) => column.id === "sku",
  });

  const categories = useMemo(
    () =>
      [...new Set(analyses.map((a) => a.product.category))].sort((a, b) =>
        a.localeCompare(b, "tr"),
      ),
    [analyses],
  );

  const filterValue = (id: string) =>
    columnFilters.find((f) => f.id === id)?.value as string | undefined;

  const setFilter = (id: "category" | "status", value: string | undefined) => {
    setColumnFilters((prev) => [
      ...prev.filter((f) => f.id !== id),
      ...(value ? [{ id, value }] : []),
    ]);
    setPagination(FIRST_PAGE);
  };

  return {
    table,
    categories,
    search: globalFilter,
    setSearch: (value: string) => {
      setGlobalFilter(value);
      setPagination(FIRST_PAGE);
    },
    category: filterValue("category"),
    setCategory: (value: string | undefined) => setFilter("category", value),
    status: filterValue("status") as StockStatus | undefined,
    setStatus: (value: StockStatus | undefined) => setFilter("status", value),
    isDefaultView: sorting.length === 0 && columnFilters.length === 0 && globalFilter === "",
    reset: () => {
      setSorting([]);
      setColumnFilters([]);
      setGlobalFilter("");
      setPagination(FIRST_PAGE);
    },
  };
}

export type ProductTableController = ReturnType<typeof useProductTable>;

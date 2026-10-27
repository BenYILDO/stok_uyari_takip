import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StockStatus } from "@/domain/types";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import type { ProductTableController } from "./useProductTable";

const ALL = "all";

export function TableToolbar({ controller }: { controller: ProductTableController }) {
  const { search, setSearch, category, setCategory, status, setStatus, categories } = controller;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-64">
        <label htmlFor="product-search" className="text-xs font-medium text-muted-foreground">
          Ara
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="product-search"
            name="q"
            type="search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Ürün adı veya SKU, örn. SK-1003…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 bg-card pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex">
        <FilterSelect
          id="category-filter"
          label="Kategori"
          value={category ?? ALL}
          onChange={(v) => setCategory(v === ALL ? undefined : v)}
          options={[
            { value: ALL, label: "Tüm kategoriler" },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
        />
        <FilterSelect
          id="status-filter"
          label="Stok durumu"
          value={status ?? ALL}
          onChange={(v) => setStatus(v === ALL ? undefined : (v as StockStatus))}
          options={[
            { value: ALL, label: "Tüm durumlar" },
            ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label })),
          ]}
        />
      </div>

      {!controller.isDefaultView && (
        <Button variant="ghost" className="h-10 self-start sm:self-auto" onClick={controller.reset}>
          <RotateCcw aria-hidden="true" />
          Varsayılan görünüme dön
        </Button>
      )}
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label id={`${id}-label`} htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          aria-labelledby={`${id}-label`}
          className="h-10! w-full bg-card sm:w-44"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

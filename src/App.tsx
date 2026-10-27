import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KpiCards } from "@/components/KpiCards";
import { ProductTable } from "@/components/ProductTable";
import { DataIssuesAlert, LoadErrorAlert, OperationalAlert } from "@/components/StatusAlerts";
import { TablePagination } from "@/components/TablePagination";
import { TableToolbar } from "@/components/TableToolbar";
import { useProductTable } from "@/components/useProductTable";
import { loadProducts, type LoadResult } from "@/data/loadProducts";
import { buildAlertMessage, getKpis } from "@/domain/summarize";
import type { ProductAnalysis } from "@/domain/types";

const NO_ANALYSES: ProductAnalysis[] = [];

export default function App() {
  const [result, setResult] = useState<LoadResult | null>(null);

  useEffect(() => {
    let active = true;
    loadProducts().then((r) => active && setResult(r));
    return () => {
      active = false;
    };
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
            Stok Uyarı Paneli
          </h1>
          <p className="text-muted-foreground">
            Ürün stoklarını ve tedarik risklerini tek ekrandan takip edin.
          </p>
        </header>

        {result === null && (
          <p className="text-muted-foreground" role="status">
            Ürün verisi yükleniyor…
          </p>
        )}
        {result?.status === "error" && <LoadErrorAlert message={result.message} />}
        {result?.status === "ready" && (
          <Dashboard analyses={result.analyses} issues={result.issues} />
        )}
      </main>
    </TooltipProvider>
  );
}

function Dashboard({
  analyses = NO_ANALYSES,
  issues,
}: {
  analyses: ProductAnalysis[];
  issues: Extract<LoadResult, { status: "ready" }>["issues"];
}) {
  const controller = useProductTable(analyses);
  const kpis = useMemo(() => getKpis(analyses), [analyses]);

  return (
    <>
      <section aria-label="Stok özeti" className="flex flex-col gap-3">
        <KpiCards kpis={kpis} activeStatus={controller.status} onSelect={controller.setStatus} />
        <OperationalAlert message={buildAlertMessage(kpis)} />
        <DataIssuesAlert issues={issues} />
      </section>

      <section aria-labelledby="products-heading" className="flex flex-col gap-4">
        <h2 id="products-heading" className="sr-only">
          Ürün listesi
        </h2>
        <TableToolbar controller={controller} />
        <ProductTable
          controller={controller}
          emptyState={
            <div className="flex flex-col items-center gap-3 text-center">
              <SearchX aria-hidden="true" className="size-6 text-muted-foreground" />
              <p className="font-medium">Bu arama ve filtrelerle eşleşen ürün yok.</p>
              <Button variant="outline" size="sm" onClick={controller.reset}>
                Filtreleri temizle
              </Button>
            </div>
          }
        />
        <TablePagination controller={controller} />
      </section>
    </>
  );
}

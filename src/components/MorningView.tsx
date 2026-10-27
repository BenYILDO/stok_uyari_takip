import { CircleCheck, FileWarning } from "lucide-react";
import { buildOrderSummary, getOrderNeeds, type OrderNeed } from "@/domain/orderNeeds";
import { SHIFT_START } from "@/domain/shiftClock";
import type { ProductAnalysis } from "@/domain/types";
import { formatDays, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

const dateFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "full" });
const shiftStart = `${String(SHIFT_START.hour).padStart(2, "0")}:${String(SHIFT_START.minute).padStart(2, "0")}`;

export const MORNING_QUESTION = "Hangi ürünler kritik durumda ve acil sipariş gerektiriyor?";

export function MorningView({
  analyses,
  issueCount,
}: {
  analyses: ProductAnalysis[];
  issueCount: number;
}) {
  const needs = getOrderNeeds(analyses);

  return (
    <section aria-labelledby="morning-question" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 border-b pb-6">
        <p className="text-sm text-muted-foreground">
          <span>{dateFormat.format(new Date())}</span>
          <span aria-hidden="true">, </span>
          <span>mesai başlangıcı {shiftStart}</span>
        </p>
        <h2 id="morning-question" className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
          {MORNING_QUESTION}
        </h2>
        <p
          data-testid="order-summary"
          className={cn(
            "text-lg font-medium",
            needs.total > 0 ? "text-status-critical" : "text-status-normal",
          )}
        >
          {buildOrderSummary(needs.total)}
        </p>
        {issueCount > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileWarning aria-hidden="true" className="size-4" />
            {issueCount} kayıt hatalı veri nedeniyle değerlendirilemedi.
          </p>
        )}
      </div>

      {needs.total === 0 ? (
        <p className="flex items-center gap-2 text-muted-foreground">
          <CircleCheck aria-hidden="true" className="size-5 text-status-normal" />
          Tüm ürünlerin stoğu tedarik süresi boyunca yetiyor.
        </p>
      ) : (
        <>
          <NeedGroup title="Stoğu tükendi" needs={needs.outOfStock} />
          <NeedGroup title="Yeni stok gelmeden tükenecek" needs={needs.beforeRestock} />
        </>
      )}
    </section>
  );
}

function NeedGroup({ title, needs }: { title: string; needs: OrderNeed[] }) {
  if (needs.length === 0) return null;
  const id = `group-${title.replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h3 id={id} className="flex items-baseline gap-2 text-base font-semibold">
        {title}
        <span className="tabular text-sm font-normal text-muted-foreground">{needs.length} ürün</span>
      </h3>
      <ul className="grid gap-3 md:grid-cols-2">
        {needs.map((need) => (
          <NeedItem key={need.analysis.product.sku} need={need} />
        ))}
      </ul>
    </section>
  );
}

function NeedItem({ need }: { need: OrderNeed }) {
  const { product, status, remainingDays, stockGapDays } = need.analysis;
  const short = status === "out_of_stock" || (stockGapDays !== null && stockGapDays > 0);
  return (
    <li
      data-testid="order-item"
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card px-4 py-3.5",
        status === "out_of_stock"
          ? "shadow-[inset_3px_0_0_var(--status-out-bg)]"
          : "shadow-[inset_3px_0_0_var(--status-critical)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p translate="no" className="font-medium">
            {product.name}
          </p>
          <p translate="no" className="text-xs text-muted-foreground">
            {product.sku}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <dl className="tabular grid grid-cols-3 gap-2 text-sm">
        <Stat label="Mevcut stok" value={formatNumber(product.stock)} />
        <Stat label="Kalan gün" value={formatDays(remainingDays)} />
        <Stat label="Tedarik süresi" value={`${formatNumber(product.leadTimeDays)} gün`} />
      </dl>

      <p className={cn("text-sm", short ? "text-status-critical" : "text-muted-foreground")}>
        {need.note}
        {need.noSalesData && <span className="text-muted-foreground"> Satış verisi yok.</span>}
      </p>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

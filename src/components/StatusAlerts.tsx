import { FileWarning, Info, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AlertMessage } from "@/domain/summarize";
import type { DataIssue } from "@/domain/types";
import { cn } from "@/lib/utils";

export function OperationalAlert({ message }: { message: AlertMessage }) {
  const danger = message.tone === "danger";
  const Icon = danger ? TriangleAlert : Info;
  return (
    <Alert
      data-testid="operational-alert"
      className={cn(
        "rounded-lg",
        danger
          ? "border-status-critical-line bg-status-critical-bg text-status-critical"
          : "bg-card",
      )}
    >
      <Icon aria-hidden="true" />
      <AlertTitle className="line-clamp-none font-semibold">{message.title}</AlertTitle>
      <AlertDescription className={danger ? "text-status-critical/90" : undefined}>
        {message.description}
      </AlertDescription>
    </Alert>
  );
}

export function DataIssuesAlert({ issues }: { issues: DataIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <Alert data-testid="data-issues" className="rounded-lg border-dashed bg-card">
      <FileWarning aria-hidden="true" />
      <AlertTitle className="line-clamp-none font-semibold">
        {issues.length} kayıt hatalı veri nedeniyle hesaplanamadı.
      </AlertTitle>
      <AlertDescription>
        <p>Bu kayıtlar tabloya ve özet sayılarına dahil edilmedi. Ürün dosyasında düzeltin:</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {issues.map((issue) => (
            <li key={issue.row}>
              <span className="font-medium text-foreground">
                Satır {issue.row}
                {issue.sku ? ` (${issue.sku})` : ""}:
              </span>{" "}
              {issue.reasons.join(" ")}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

export function LoadErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" role="alert" className="rounded-lg bg-card">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle className="line-clamp-none font-semibold">Ürün verisi gösterilemiyor</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <p>Panel çalışmaya devam ediyor; dosya düzeltildiğinde sayfayı yenileyin.</p>
      </AlertDescription>
    </Alert>
  );
}

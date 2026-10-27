import { Badge } from "@/components/ui/badge";
import type { StockStatus } from "@/domain/types";
import { STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: StockStatus }) {
  const { label, icon: Icon, badge } = STATUS_META[status];
  return (
    <Badge variant="outline" className={cn("gap-1 rounded-md px-1.5 font-semibold", badge)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

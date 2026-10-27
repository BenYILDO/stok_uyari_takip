import { CircleCheck, Clock, Minus, PackageX, TriangleAlert, type LucideIcon } from "lucide-react";
import type { StockStatus } from "@/domain/types";

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  /** Rozet sınıfları */
  badge: string;
  /** Stok/tedarik çubuğunun dolgu rengi */
  fill: string;
}

/** Durumlar brief §6 öncelik sırasıyla listelenir. */
export const STATUS_META: Record<StockStatus, StatusMeta> = {
  out_of_stock: {
    label: "Tükendi",
    icon: PackageX,
    badge: "bg-status-out-bg text-status-out border-status-out-line",
    fill: "bg-status-out-bg",
  },
  critical: {
    label: "Kritik",
    icon: TriangleAlert,
    badge: "bg-status-critical-bg text-status-critical border-status-critical-line",
    fill: "bg-status-critical",
  },
  warning: {
    label: "Dikkat",
    icon: Clock,
    badge: "bg-status-warning-bg text-status-warning border-status-warning-line",
    fill: "bg-status-warning-fill",
  },
  normal: {
    label: "Normal",
    icon: CircleCheck,
    badge: "bg-status-normal-bg text-status-normal border-status-normal-line",
    fill: "bg-status-normal",
  },
  no_sales: {
    label: "Satış Yok",
    icon: Minus,
    badge: "bg-status-idle-bg text-status-idle border-status-idle-line",
    fill: "bg-status-idle",
  },
};

export const STATUS_ORDER = Object.keys(STATUS_META) as StockStatus[];

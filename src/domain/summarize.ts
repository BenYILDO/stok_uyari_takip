import type { ProductAnalysis } from "./types";

export interface Kpis {
  total: number;
  outOfStock: number;
  critical: number;
  warning: number;
}

export interface AlertMessage {
  tone: "danger" | "info";
  title: string;
  description: string;
}

export function getKpis(list: readonly ProductAnalysis[]): Kpis {
  const count = (status: ProductAnalysis["status"]) =>
    list.filter((a) => a.status === status).length;
  return {
    total: list.length,
    outOfStock: count("out_of_stock"),
    critical: count("critical"),
    warning: count("warning"),
  };
}

/** Operasyonel uyarı metni. Sipariş oluşturulduğunu ima etmez. */
export function buildAlertMessage(
  { total, outOfStock, critical, warning }: Kpis,
  invalidCount = 0,
): AlertMessage {
  if (total === 0) {
    return {
      tone: "info",
      title: "Gösterilecek ürün yok.",
      description:
        invalidCount > 0
          ? `${invalidCount} kaydın tamamı hatalı veri nedeniyle değerlendirilemedi.`
          : "Ürün dosyasında kayıt bulunamadı. Kayıtlar eklendiğinde burada listelenir.",
    };
  }

  if (outOfStock > 0 || critical > 0) {
    const parts = [
      outOfStock > 0 && `${outOfStock} ürünün stoğu tükenmiş`,
      critical > 0 && `${critical} ürün kritik seviyede`,
    ].filter(Boolean);
    return {
      tone: "danger",
      title: `${parts.join(", ")}.`,
      description: "Bu ürünler listenin en üstünde. Önce bunları inceleyin.",
    };
  }

  return {
    tone: "info",
    title: "Stoğu tükenen veya kritik seviyede ürün yok.",
    description:
      warning > 0
        ? `${warning} ürün 7 gün içinde tükenebilir; Dikkat filtresiyle takip edebilirsiniz.`
        : invalidCount > 0
          ? `Hesaplanabilen ürünlerin stoğu tedarik süresini karşılıyor; ${invalidCount} kayıt hatalı veri nedeniyle değerlendirilemedi.`
          : "Tüm ürünlerin stoğu tedarik süresini karşılıyor.",
  };
}

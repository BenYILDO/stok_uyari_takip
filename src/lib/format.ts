const oneDecimal = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

/** Ekranda gösterilecek gün değeri. Hesaplamalar yuvarlanmamış değerle yapılır. */
export function formatDays(days: number | null): string {
  return days === null ? "—" : oneDecimal.format(days);
}

export function formatNumber(value: number): string {
  return oneDecimal.format(value);
}

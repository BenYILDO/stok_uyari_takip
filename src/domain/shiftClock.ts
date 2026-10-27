/** Mesai başlangıcı (cihazın yerel saati). Sabah modu günde bir kez bu saatten sonra açılır. */
export const SHIFT_START = { hour: 8, minute: 30 } as const;

export const LAST_SHOWN_KEY = "stok-paneli:sabah-modu:son-gosterim";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function toLocalDateKey(now: Date): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function shiftStartOf(now: Date): Date {
  const start = new Date(now);
  start.setHours(SHIFT_START.hour, SHIFT_START.minute, 0, 0);
  return start;
}

export function isAfterShiftStart(now: Date): boolean {
  return now.getTime() >= shiftStartOf(now).getTime();
}

export function shouldAutoOpen(now: Date, lastShown: string | null): boolean {
  return isAfterShiftStart(now) && lastShown !== toLocalDateKey(now);
}

/** Bugünkü 08:30'a kalan süre; geçtiyse null. */
export function msUntilShiftStart(now: Date): number | null {
  const ms = shiftStartOf(now).getTime() - now.getTime();
  return ms > 0 ? ms : null;
}

/** Tarayıcı depolamayı engellerse (gizli pencere vb.) null döner. */
export function readLastShown(store: KeyValueStore | undefined): string | null {
  try {
    return store?.getItem(LAST_SHOWN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function writeLastShown(store: KeyValueStore | undefined, dateKey: string): void {
  try {
    store?.setItem(LAST_SHOWN_KEY, dateKey);
  } catch {
    // Kayıt tutulamazsa mod yine çalışır; yalnızca "bugün gösterildi" hatırlanmaz.
  }
}

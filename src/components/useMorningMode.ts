import { useCallback, useEffect, useState } from "react";
import {
  isAfterShiftStart,
  msUntilShiftStart,
  readLastShown,
  shouldAutoOpen,
  toLocalDateKey,
  writeLastShown,
  type KeyValueStore,
} from "@/domain/shiftClock";

function getStorage(): KeyValueStore | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Sabah modu: günün 08:30'dan sonraki ilk açılışında kendiliğinden açılır.
 * Panel 08:30'dan önce açıksa saat gelince açılır. `toggle` sunum ve test
 * için modu elle açıp kapatır.
 */
export function useMorningMode() {
  const [isMorning, setIsMorning] = useState(false);

  useEffect(() => {
    const storage = getStorage();
    const check = () => {
      const now = new Date();
      if (shouldAutoOpen(now, readLastShown(storage))) {
        writeLastShown(storage, toLocalDateKey(now));
        setIsMorning(true);
      }
    };

    check();
    const wait = msUntilShiftStart(new Date());
    if (wait === null) return;
    const timer = window.setTimeout(check, wait);
    return () => window.clearTimeout(timer);
  }, []);

  const toggle = useCallback(() => {
    setIsMorning((open) => {
      const now = new Date();
      if (!open && isAfterShiftStart(now)) writeLastShown(getStorage(), toLocalDateKey(now));
      return !open;
    });
  }, []);

  return { isMorning, toggle };
}

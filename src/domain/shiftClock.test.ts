import { describe, expect, it } from "vitest";
import {
  isAfterShiftStart,
  msUntilShiftStart,
  readLastShown,
  shouldAutoOpen,
  toLocalDateKey,
  writeLastShown,
  type KeyValueStore,
} from "./shiftClock";

const at = (hour: number, minute: number, second = 0) => new Date(2026, 9, 27, hour, minute, second);

const throwingStore: KeyValueStore = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
};

describe("toLocalDateKey", () => {
  it("yerel tarihi YYYY-AA-GG biçiminde verir", () => {
    expect(toLocalDateKey(new Date(2026, 9, 7, 23, 59))).toBe("2026-10-07");
  });
});

describe("isAfterShiftStart — mesai 08:30", () => {
  it("08:29:59'da false, 08:30:00'da ve sonrasında true", () => {
    expect(isAfterShiftStart(at(8, 29, 59))).toBe(false);
    expect(isAfterShiftStart(at(8, 30, 0))).toBe(true);
    expect(isAfterShiftStart(at(17, 0))).toBe(true);
  });
});

describe("shouldAutoOpen — günde bir kez", () => {
  it("08:30'dan önce açılmaz", () => {
    expect(shouldAutoOpen(at(8, 29), null)).toBe(false);
  });

  it("08:30'da, bugün gösterilmediyse açılır", () => {
    expect(shouldAutoOpen(at(8, 30), null)).toBe(true);
  });

  it("bugün zaten gösterildiyse açılmaz", () => {
    expect(shouldAutoOpen(at(9, 0), "2026-10-27")).toBe(false);
  });

  it("son gösterim dün ise açılır", () => {
    expect(shouldAutoOpen(at(9, 0), "2026-10-26")).toBe(true);
  });
});

describe("msUntilShiftStart", () => {
  it("08:00'de 30 dakika kaldığını verir", () => {
    expect(msUntilShiftStart(at(8, 0))).toBe(30 * 60_000);
  });

  it("08:30 ve sonrasında null döner", () => {
    expect(msUntilShiftStart(at(8, 30))).toBeNull();
    expect(msUntilShiftStart(at(12, 0))).toBeNull();
  });
});

describe("son gösterim kaydı", () => {
  it("okuma hata fırlatırsa veya depo yoksa null döner", () => {
    expect(readLastShown(throwingStore)).toBeNull();
    expect(readLastShown(undefined)).toBeNull();
  });

  it("yazma hata fırlatırsa sessizce geçer", () => {
    expect(() => writeLastShown(throwingStore, "2026-10-27")).not.toThrow();
    expect(() => writeLastShown(undefined, "2026-10-27")).not.toThrow();
  });

  it("yazılan tarihi geri okur", () => {
    const data = new Map<string, string>();
    const store: KeyValueStore = {
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => void data.set(k, v),
    };
    writeLastShown(store, "2026-10-27");
    expect(readLastShown(store)).toBe("2026-10-27");
  });
});

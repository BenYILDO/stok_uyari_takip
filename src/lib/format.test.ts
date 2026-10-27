import { describe, expect, it } from "vitest";
import { formatDays, formatNumber } from "./format";

describe("formatDays (V7)", () => {
  it("bir ondalıkla tr-TR biçiminde gösterir", () => {
    expect(formatDays(6.4444)).toBe("6,4");
  });

  it("tam sayıda ondalık göstermez", () => {
    expect(formatDays(12)).toBe("12");
  });

  it("hesaplanamayan değer için uzun tire gösterir", () => {
    expect(formatDays(null)).toBe("—");
  });
});

describe("formatNumber", () => {
  it("binlik ayırıcı ve en fazla bir ondalık kullanır", () => {
    expect(formatNumber(1250)).toBe("1.250");
    expect(formatNumber(0.5)).toBe("0,5");
  });
});

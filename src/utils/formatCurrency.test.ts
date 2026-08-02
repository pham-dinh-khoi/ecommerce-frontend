import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats a basic amount with thousand separators", () => {
    expect(formatCurrency(100000)).toBe("100.000₫");
  });

  it("formats a large amount (millions)", () => {
    expect(formatCurrency(1500000)).toBe("1.500.000₫");
  });

  it("handles zero correctly", () => {
    expect(formatCurrency(0)).toBe("0₫");
  });

  it("handles small numbers without a thousand separator", () => {
    expect(formatCurrency(500)).toBe("500₫");
  });

  it("handles negative numbers correctly", () => {
    expect(formatCurrency(-50000)).toBe("-50.000₫");
  });
});
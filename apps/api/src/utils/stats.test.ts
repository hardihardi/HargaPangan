import { describe, expect, it } from "vitest";
import { calculateChangePct } from "./stats";

describe("calculateChangePct", () => {
  it("returns null when previous is null or zero", () => {
    expect(calculateChangePct(100, null)).toBeNull();
    expect(calculateChangePct(100, 0)).toBeNull();
  });

  it("calculates positive change correctly", () => {
    expect(calculateChangePct(110, 100)).toBeCloseTo(10);
  });

  it("calculates negative change correctly", () => {
    expect(calculateChangePct(90, 100)).toBeCloseTo(-10);
  });
});
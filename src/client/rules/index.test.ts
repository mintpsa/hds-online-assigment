import { describe, it, expect } from "vitest";
import { ajv } from "./index";

describe("isIncreasing keyword", () => {
  const schema = { type: "array", isIncreasing: true };

  it("passes for a strictly increasing array", () => {
    expect(ajv.validate(schema, [1, 2, 5, 10])).toBe(true);
  });

  it("fails when two consecutive values are equal", () => {
    expect(ajv.validate(schema, [1, 2, 2, 3])).toBe(false);
  });

  it("fails for a decreasing array", () => {
    expect(ajv.validate(schema, [10, 5, 2, 1])).toBe(false);
  });

  it("passes for a single-element array", () => {
    expect(ajv.validate(schema, [42])).toBe(true);
  });

  it("passes for an empty array", () => {
    expect(ajv.validate(schema, [])).toBe(true);
  });

  it("does nothing when schema value is false", () => {
    expect(
      ajv.validate({ type: "array", isIncreasing: false }, [3, 1, 2]),
    ).toBe(true);
  });
});

describe("isDecreasing keyword", () => {
  const schema = { type: "array", isDecreasing: true };

  it("passes for a strictly decreasing array", () => {
    expect(ajv.validate(schema, [10, 5, 2, 1])).toBe(true);
  });

  it("fails when two consecutive values are equal", () => {
    expect(ajv.validate(schema, [5, 3, 3, 1])).toBe(false);
  });

  it("fails for an increasing array", () => {
    expect(ajv.validate(schema, [1, 2, 5, 10])).toBe(false);
  });

  it("passes for a single-element array", () => {
    expect(ajv.validate(schema, [42])).toBe(true);
  });

  it("passes for an empty array", () => {
    expect(ajv.validate(schema, [])).toBe(true);
  });

  it("does nothing when schema value is false", () => {
    expect(
      ajv.validate({ type: "array", isDecreasing: false }, [1, 3, 2]),
    ).toBe(true);
  });
});

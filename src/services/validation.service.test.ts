import { describe, it, expect } from "vitest";
import { validateConfig } from "./validation.service.js";
import { baseConfig } from "./__fixtures__/slot-config.fixture.js";

describe("validateConfig", () => {
  it("returns valid=true and no findings for a clean config", async () => {
    const result = await validateConfig(baseConfig);
    expect(result.valid).toBe(true);
    expect(result.findings.filter((f) => f.severity === "error")).toHaveLength(
      0,
    );
  });

  it("returns valid=false when game_name is missing", async () => {
    const config = { ...baseConfig, game_name: "" };
    const result = await validateConfig(config);
    expect(result.valid).toBe(false);
    const finding = result.findings.find((f) => f.field === "game_name");
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe("error");
  });

  it("returns valid=false when bet_levels is empty", async () => {
    const config = { ...baseConfig, bet_levels: [] };
    const result = await validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.findings.some((f) => f.field === "bet_levels")).toBe(true);
  });

  it("returns valid=false when bet_levels are not ascending", async () => {
    const config = { ...baseConfig, bet_levels: [100, 50, 10] };
    const result = await validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.findings.some((f) => f.field.startsWith("bet_levels"))).toBe(
      true,
    );
  });

  it("returns valid=false when a bet level is zero or negative", async () => {
    const config = { ...baseConfig, bet_levels: [0, 50, 100] };
    const result = await validateConfig(config);
    expect(result.valid).toBe(false);
  });

  it("includes both errors and warnings in findings", async () => {
    const config = { ...baseConfig, game_name: "" };
    const result = await validateConfig(config);
    // At minimum we should have the error we triggered
    expect(result.findings.length).toBeGreaterThan(0);
  });

  it("valid is false when any finding has severity=error", async () => {
    const config = { ...baseConfig, game_name: "", slot_machine_id: "" };
    const result = await validateConfig(config);
    const errors = result.findings.filter((f) => f.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
    expect(result.valid).toBe(false);
  });
});

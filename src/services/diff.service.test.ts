import { describe, it, expect } from "vitest";
import { diffConfigs } from "./diff.service.js";
import { baseConfig } from "./__fixtures__/slot-config.fixture.js";

describe("diffConfigs", () => {
  it("returns empty array when configs are identical", async () => {
    const result = await diffConfigs(baseConfig, baseConfig);
    expect(result).toEqual([]);
  });

  it("detects a changed scalar field", async () => {
    const modified = { ...baseConfig, game_name: "Updated Game" };
    const result = await diffConfigs(baseConfig, modified);
    expect(result).toContainEqual({
      field: "game_name",
      oldValue: "Test Game",
      newValue: "Updated Game",
    });
  });

  it("detects a changed nested field", async () => {
    const modified = {
      ...baseConfig,
      rewards: { ...baseConfig.rewards, daily_login_base: 999 },
    };
    const result = await diffConfigs(baseConfig, modified);
    expect(result).toContainEqual({
      field: "rewards.daily_login_base",
      oldValue: 100,
      newValue: 999,
    });
  });

  it("detects a changed array field", async () => {
    const modified = { ...baseConfig, bet_levels: [10, 50, 200] };
    const result = await diffConfigs(baseConfig, modified);
    expect(result).toContainEqual({
      field: "bet_levels",
      oldValue: [10, 50, 100],
      newValue: [10, 50, 200],
    });
  });

  it("returns results sorted alphabetically by field", async () => {
    const modified = {
      ...baseConfig,
      game_name: "Z Game",
      slot_machine_id: "SLOT_999",
    };
    const result = await diffConfigs(baseConfig, modified);
    const fields = result.map((d) => d.field);
    expect(fields).toEqual([...fields].sort());
  });

  it("detects a field added in configB", async () => {
    const configA = { ...baseConfig, event_schedule: [] };
    const configB = {
      ...baseConfig,
      event_schedule: [
        {
          event_id: "ev1",
          event_name: "Weekend Boost",
          start_date: "2025-01-01",
          end_date: "2025-01-03",
          event_type: "multiplier",
          multiplier_value: 2,
        },
      ],
    };
    const result = await diffConfigs(configA, configB);
    expect(result.some((d) => d.field === "event_schedule")).toBe(true);
  });
});

import type { SlotConfig, ConfigDiff } from "../types/index.js";

export async function diffConfigs(
  configA: SlotConfig,
  configB: SlotConfig,
): Promise<ConfigDiff[]> {
  void configA;
  void configB;
  return [];
}

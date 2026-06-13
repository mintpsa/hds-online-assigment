import type { SlotConfig, ValidationReport } from "../types/index.js";

export async function validateConfig(
  config: SlotConfig,
): Promise<ValidationReport> {
  void config;
  return { valid: true, findings: [] };
}

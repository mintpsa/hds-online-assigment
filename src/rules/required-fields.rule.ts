import type { SlotConfig, ValidationFinding } from "../types/index.js";

export default function validateRequiredFields(
  config: SlotConfig,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  const requiredStrings: Array<keyof SlotConfig> = [
    "game_name",
    "slot_machine_id",
    "app_version_target",
  ];

  for (const field of requiredStrings) {
    const value = config[field];
    if (typeof value !== "string" || value.trim() === "") {
      findings.push({
        severity: "error",
        field,
        message: `Required field "${field}" is missing or empty.`,
      });
    }
  }

  if (!Array.isArray(config.bet_levels) || config.bet_levels.length === 0) {
    findings.push({
      severity: "error",
      field: "bet_levels",
      message: 'Required field "bet_levels" is missing or empty.',
    });
  }

  if (
    typeof config.reel_symbols !== "object" ||
    config.reel_symbols === null ||
    Object.keys(config.reel_symbols).length === 0
  ) {
    findings.push({
      severity: "error",
      field: "reel_symbols",
      message: 'Required field "reel_symbols" is missing or empty.',
    });
  }

  if (
    typeof config.payout_table !== "object" ||
    config.payout_table === null ||
    Object.keys(config.payout_table).length === 0
  ) {
    findings.push({
      severity: "error",
      field: "payout_table",
      message: 'Required field "payout_table" is missing or empty.',
    });
  }

  return findings;
}

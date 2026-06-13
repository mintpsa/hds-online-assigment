import type { SlotConfig, ValidationFinding } from "../types/index.js";

export default function validateBetLevels(
  config: SlotConfig,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const levels = config.bet_levels;

  if (!Array.isArray(levels) || levels.length === 0) {
    return findings;
  }

  for (let i = 0; i < levels.length; i++) {
    if (levels[i] <= 0) {
      findings.push({
        severity: "error",
        field: `bet_levels[${i}]`,
        message: `Bet level at index ${i} must be greater than 0 (got ${levels[i]}).`,
      });
    }
  }

  for (let i = 1; i < levels.length; i++) {
    if (levels[i] <= levels[i - 1]) {
      findings.push({
        severity: "error",
        field: `bet_levels[${i}]`,
        message: `Bet levels must be in ascending order: levels[${i}] (${levels[i]}) is not greater than levels[${i - 1}] (${levels[i - 1]}).`,
      });
    }
  }

  return findings;
}

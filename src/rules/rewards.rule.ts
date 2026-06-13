import type { SlotConfig, ValidationFinding } from "../types/index.js";

export default function validateRewards(
  config: SlotConfig,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const rewards = config.rewards;

  const fields = [
    "daily_login_base",
    "daily_login_streak_multiplier",
    "ad_watch_reward",
    "social_share_reward",
    "level_up_base",
  ] as const;

  for (const field of fields) {
    const value = rewards[field];
    if (typeof value !== "number" || value <= 0) {
      findings.push({
        severity: "error",
        field: `rewards.${field}`,
        message: `Reward value "${field}" must be a positive number (got ${value}).`,
      });
    }
  }

  return findings;
}

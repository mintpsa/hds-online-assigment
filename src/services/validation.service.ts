import type {
  SlotConfig,
  ValidationReport,
  ValidationRule,
} from "../types/index.js";
import { logger } from "../utils/logger.js";
import validateBetLevels from "../rules/bet-levels.rule.js";
import validateEventSchedule from "../rules/event-schedule.rule.js";
import validateFeatureFlags from "../rules/feature-flags.rule.js";
import validateJackpot from "../rules/jackpot.rule.js";
import validateLiveopsCampaigns from "../rules/liveops-campaigns.rule.js";
import validatePayoutTable from "../rules/payout-table.rule.js";
import validateRequiredFields from "../rules/required-fields.rule.js";
import validateRewards from "../rules/rewards.rule.js";

const rules: ValidationRule[] = [
  validateRequiredFields,
  validateBetLevels,
  validateRewards,
  validateEventSchedule,
  validateFeatureFlags,
  validateJackpot,
  validateLiveopsCampaigns,
  validatePayoutTable,
];

export async function validateConfig(
  config: SlotConfig,
): Promise<ValidationReport> {
  logger.info({ rules: rules.length }, "validation: applying rules");
  const findings = rules.flatMap((rule) => rule(config));
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;
  const valid = findings.every((f) => f.severity !== "error");
  logger.info({ valid, errors, warnings }, "validation: done");
  return { valid, findings };
}

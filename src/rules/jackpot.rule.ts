import type { SlotConfig, ValidationFinding } from "../types/index.js";

const WARN_TOTAL_CONTRIBUTION_PCT = 0.15;
const MAX_SAFE_TOTAL_CONTRIBUTION_PCT = 0.25;

export default function validateJackpot(
  config: SlotConfig,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const { tiers } = config.jackpot_settings;

  let totalContribution = 0;

  for (const [tierName, tier] of Object.entries(tiers)) {
    const prefix = `jackpot_settings.tiers.${tierName}`;

    if (tier.seed <= 0) {
      findings.push({
        severity: "error",
        field: `${prefix}.seed`,
        message: `Jackpot tier "${tierName}" seed must be greater than 0 (got ${tier.seed}).`,
      });
    }

    if (tier.contribution_pct <= 0 || tier.contribution_pct >= 1) {
      findings.push({
        severity: "error",
        field: `${prefix}.contribution_pct`,
        message: `Jackpot tier "${tierName}" contribution_pct must be between 0 and 1 exclusive (got ${tier.contribution_pct}).`,
      });
    } else {
      totalContribution += tier.contribution_pct;
    }
  }

  if (totalContribution > MAX_SAFE_TOTAL_CONTRIBUTION_PCT) {
    findings.push({
      severity: "error",
      field: "jackpot_settings.tiers",
      message: `Total jackpot contribution (${totalContribution.toFixed(4)}) exceeds the safe maximum of ${MAX_SAFE_TOTAL_CONTRIBUTION_PCT}.`,
    });
  } else if (totalContribution > WARN_TOTAL_CONTRIBUTION_PCT) {
    findings.push({
      severity: "warning",
      field: "jackpot_settings.tiers",
      message: `Total jackpot contribution (${totalContribution.toFixed(4)}) is high — approaches the safety threshold of ${MAX_SAFE_TOTAL_CONTRIBUTION_PCT}.`,
    });
  }

  return findings;
}

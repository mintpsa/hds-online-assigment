import type { SlotConfig, ValidationFinding } from "../types/index.js";

export default function validateLiveopsCampaigns(
  config: SlotConfig,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const campaigns = config.liveops_campaign_settings;
  const { is_tournament_enabled, is_jackpot_enabled } = config.feature_flags;

  const gameIsDisabled = !is_tournament_enabled && !is_jackpot_enabled;

  const seenIds = new Set<string>();

  for (let i = 0; i < campaigns.length; i++) {
    const campaign = campaigns[i];
    const prefix = `liveops_campaign_settings[${i}]`;

    if (seenIds.has(campaign.campaign_id)) {
      findings.push({
        severity: "error",
        field: `${prefix}.campaign_id`,
        message: `Duplicate campaign_id "${campaign.campaign_id}" at index ${i}.`,
      });
    }
    seenIds.add(campaign.campaign_id);

    if (gameIsDisabled && campaign.active_campaign) {
      findings.push({
        severity: "warning",
        field: `${prefix}.active_campaign`,
        message: `Campaign "${campaign.campaign_id}" is active but both is_tournament_enabled and is_jackpot_enabled are disabled.`,
      });
    }
  }

  return findings;
}

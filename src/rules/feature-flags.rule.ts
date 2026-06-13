import type {
  FeatureFlags,
  SlotConfig,
  ValidationFinding,
} from "../types/index.js";

const APPROVED_FLAG_NAMES = new Set<keyof FeatureFlags>([
  "is_tournament_enabled",
  "is_jackpot_enabled",
  "enable_buy_feature",
  "use_high_res_assets",
  "enable_haptic_feedback",
]);

export default function validateFeatureFlags(
  config: SlotConfig,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const flags = config.feature_flags as unknown as Record<string, unknown>;

  for (const name of Object.keys(flags)) {
    if (!APPROVED_FLAG_NAMES.has(name as keyof FeatureFlags)) {
      findings.push({
        severity: "error",
        field: `feature_flags.${name}`,
        message: `Unknown feature flag "${name}" — not in the approved flag set.`,
      });
    }
  }

  return findings;
}

import type { SlotConfig, ValidationFinding } from "../types/index.js";

export default function validatePayoutTable(
  config: SlotConfig,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const knownSymbols = new Set(Object.values(config.reel_symbols));

  for (const [symbol, entry] of Object.entries(config.payout_table)) {
    const prefix = `payout_table.${symbol}`;

    if (!knownSymbols.has(symbol)) {
      findings.push({
        severity: "error",
        field: prefix,
        message: `Symbol "${symbol}" in payout_table is not defined in reel_symbols.`,
      });
    }

    const p3 = entry["3"];
    const p4 = entry["4"];
    const p5 = entry["5"];

    for (const [key, value] of [
      ["3", p3],
      ["4", p4],
      ["5", p5],
    ] as const) {
      if (value <= 0) {
        findings.push({
          severity: "error",
          field: `${prefix}.${key}`,
          message: `Payout for symbol "${symbol}" at match-${key} must be positive (got ${value}).`,
        });
      }
    }

    if (p3 > 0 && p4 > 0 && p5 > 0) {
      if (p4 < p3) {
        findings.push({
          severity: "error",
          field: `${prefix}.4`,
          message: `Payout for symbol "${symbol}": 4-match payout (${p4}) must be ≥ 3-match payout (${p3}).`,
        });
      }
      if (p5 < p4) {
        findings.push({
          severity: "error",
          field: `${prefix}.5`,
          message: `Payout for symbol "${symbol}": 5-match payout (${p5}) must be ≥ 4-match payout (${p4}).`,
        });
      }
    }
  }

  return findings;
}

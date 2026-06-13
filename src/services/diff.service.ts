import type { SlotConfig, ConfigDiff } from "../types/index.js";
import { logger } from "../utils/logger.js";

function flattenObject(
  obj: unknown,
  prefix = "",
  result: Record<string, unknown> = {},
): Record<string, unknown> {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    result[prefix] = obj;
    return result;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      flattenObject(value, path, result);
    } else {
      result[path] = value;
    }
  }
  return result;
}

export async function diffConfigs(
  configA: SlotConfig,
  configB: SlotConfig,
): Promise<ConfigDiff[]> {
  logger.info("diff: flattening configs for comparison");
  const flatA = flattenObject(configA);
  const flatB = flattenObject(configB);

  const findings: ConfigDiff[] = [];
  const allKeys = new Set([...Object.keys(flatA), ...Object.keys(flatB)]);

  for (const field of allKeys) {
    const oldValue = flatA[field];
    const newValue = flatB[field];
    const aJson = JSON.stringify(oldValue);
    const bJson = JSON.stringify(newValue);
    if (aJson !== bJson) {
      findings.push({ field, oldValue, newValue });
    }
  }

  logger.info({ changes: findings.length }, "diff: comparison complete");
  return findings.sort((a, b) => a.field.localeCompare(b.field));
}

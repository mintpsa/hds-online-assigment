import type { SlotConfig } from "./slot-config.type.js";

export type ValidationRule = (config: SlotConfig) => ValidationFinding[];

export interface ValidationFinding {
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  findings: ValidationFinding[];
}

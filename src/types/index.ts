export type OutputFormat = "text" | "json";

export interface CliOptions {
  format: OutputFormat;
}

export interface SlotConfig {
  [key: string]: unknown;
}

export interface ValidationFinding {
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  findings: ValidationFinding[];
}

export interface ConfigDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

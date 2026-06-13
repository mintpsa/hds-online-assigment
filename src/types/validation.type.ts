export interface ValidationFinding {
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  findings: ValidationFinding[];
}

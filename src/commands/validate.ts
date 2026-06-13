import { Command } from "commander";
import type { ValidationFinding, OutputFormat } from "../types/index.js";
import { readConfig } from "../repositories/config.repository.js";
import { validateConfig } from "../services/validation.service.js";
import { logger } from "../utils/logger.js";

interface ValidateOptions {
  input: string;
  format: OutputFormat;
}

export function makeValidateCommand(): Command {
  return new Command("validate")
    .description("Read a slot game config file and produce a validation report")
    .requiredOption("--input <file>", "path to the config file")
    .option("--format <format>", 'output format: "text" or "json"', "text")
    .action(async (options: ValidateOptions) => {
      logger.info({ file: options.input }, "validate: reading config");
      const config = await readConfig(options.input);
      logger.info("validate: running rules");
      const report = await validateConfig(config);
      logger.info(
        { valid: report.valid, findings: report.findings.length },
        "validate: complete",
      );

      if (options.format === "json") {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      const status = report.valid ? "✓ VALID" : "✗ INVALID";
      console.log(`\nValidation result: ${status}`);
      console.log(`File: ${options.input}\n`);

      if (report.findings.length === 0) {
        console.log("No issues found.");
        return;
      }

      const bySeverity: Record<string, ValidationFinding[]> = {
        error: [],
        warning: [],
        info: [],
      };

      for (const finding of report.findings) {
        bySeverity[finding.severity].push(finding);
      }

      for (const severity of ["error", "warning", "info"] as const) {
        const group = bySeverity[severity];
        if (group.length === 0) continue;
        console.log(`${severity.toUpperCase()}S (${group.length}):`);
        for (const f of group) {
          console.log(`  [${f.field}] ${f.message}`);
        }
        console.log();
      }
    });
}

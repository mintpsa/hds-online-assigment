import { Command } from "commander";
import type { CliOptions } from "../types/index.js";

export function makeValidateCommand(): Command {
  return new Command("validate")
    .description("Read a slot game config file and produce a validation report")
    .argument("<file>", "path to the config file")
    .option("--format <format>", 'output format: "text" or "json"', "text")
    .action(async (file: string, options: CliOptions) => {
      console.log(
        `[validate] not yet implemented — file: ${file}, format: ${options.format}`,
      );
    });
}

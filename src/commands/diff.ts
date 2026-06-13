import { Command } from "commander";
import type { CliOptions } from "../types/index.js";

export function makeDiffCommand(): Command {
  return new Command("diff")
    .description("Compare two slot game config versions and show changes")
    .argument("<file1>", "path to the first (older) config file")
    .argument("<file2>", "path to the second (newer) config file")
    .option("--format <format>", 'output format: "text" or "json"', "text")
    .action(async (file1: string, file2: string, options: CliOptions) => {
      console.log(
        `[diff] not yet implemented — file1: ${file1}, file2: ${file2}, format: ${options.format}`,
      );
    });
}

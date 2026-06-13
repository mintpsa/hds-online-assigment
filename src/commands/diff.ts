import { Command } from "commander";
import { diffJson } from "diff";
import type { OutputFormat } from "../types/index.js";
import { readConfig } from "../repositories/config.repository.js";
import { diffConfigs } from "../services/diff.service.js";
import { logger } from "../utils/logger.js";

interface DiffOptions {
  old: string;
  new: string;
  format: OutputFormat;
}

export function makeDiffCommand(): Command {
  return new Command("diff")
    .description(
      "Compare two slot game config versions and show field-level changes",
    )
    .requiredOption("--old <file>", "path to the old (base) config file")
    .requiredOption("--new <file>", "path to the new config file")
    .option("--format <format>", 'output format: "text" or "json"', "text")
    .action(async (options: DiffOptions) => {
      logger.info(
        { old: options.old, new: options.new },
        "diff: reading configs",
      );
      const [configOld, configNew] = await Promise.all([
        readConfig(options.old),
        readConfig(options.new),
      ]);

      if (options.format === "json") {
        const diffs = await diffConfigs(configOld, configNew);
        logger.info({ changes: diffs.length }, "diff: complete");
        console.log(JSON.stringify(diffs, null, 2));
        return;
      }

      console.log(`\nDiff: ${options.old} → ${options.new}\n`);

      const changes = diffJson(configOld, configNew);
      const hasChanges = changes.some((c) => c.added || c.removed);
      logger.info(
        { changes: changes.filter((c) => c.added || c.removed).length },
        "diff: complete",
      );

      if (!hasChanges) {
        console.log("No differences found.");
        return;
      }

      for (const change of changes) {
        if (change.added) {
          process.stdout.write(
            change.value
              .split("\n")
              .filter((l) => l.trim())
              .map((l) => `+ ${l}`)
              .join("\n") + "\n",
          );
        } else if (change.removed) {
          process.stdout.write(
            change.value
              .split("\n")
              .filter((l) => l.trim())
              .map((l) => `- ${l}`)
              .join("\n") + "\n",
          );
        }
      }
    });
}

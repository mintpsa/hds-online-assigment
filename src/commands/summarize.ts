import { readFile } from "node:fs/promises";
import { Command } from "commander";
import type { OutputFormat } from "../types/index.js";
import { readConfig } from "../repositories/config.repository.js";
import { diffConfigs } from "../services/diff.service.js";
import { summarizeDiff } from "../services/summarize.service.js";
import { OpenRouterClient } from "../llm/openrouter.client.js";
import { LmStudioClient } from "../llm/lmstudio.client.js";
import type { LlmClient } from "../llm/llm.interface.js";
import { logger } from "../utils/logger.js";

type Backend = "openrouter" | "lmstudio";

interface SummarizeOptions {
  old: string;
  new: string;
  context?: string;
  backend: Backend;
  model?: string;
  format: OutputFormat;
}

const DEFAULT_MODELS: Record<Backend, string> = {
  openrouter: "anthropic/claude-haiku-4-5",
  lmstudio: "google/gemma-4-e4b",
};

function createClient(backend: Backend, model: string): LlmClient {
  if (backend === "openrouter") {
    return new OpenRouterClient({ model });
  }
  return new LmStudioClient({ model });
}

export function makeSummarizeCommand(): Command {
  return new Command("summarize")
    .description(
      "Summarize the changes between two config versions using an LLM",
    )
    .requiredOption("--old <file>", "path to the old (base) config file")
    .requiredOption("--new <file>", "path to the new config file")
    .option(
      "--context <file>",
      "path to a plain-text game description file to ground the summary",
    )
    .option(
      "--backend <backend>",
      'LLM backend to use: "openrouter" or "lmstudio"',
      "openrouter",
    )
    .option("--model <model>", "model identifier to pass to the backend")
    .option("--format <format>", 'output format: "text" or "json"', "text")
    .action(async (options: SummarizeOptions) => {
      const model = options.model ?? DEFAULT_MODELS[options.backend];
      let client: LlmClient;
      try {
        client = createClient(options.backend, model);
      } catch (err) {
        console.error(
          `Error: ${err instanceof Error ? err.message : String(err)}`,
        );
        process.exit(1);
      }

      logger.info(
        { old: options.old, new: options.new },
        "summarize: reading configs",
      );
      const [configOld, configNew] = await Promise.all([
        readConfig(options.old),
        readConfig(options.new),
      ]);

      const diffs = await diffConfigs(configOld, configNew);

      let gameContext: string | undefined;
      if (options.context) {
        logger.info(
          { file: options.context },
          "summarize: loading game context",
        );
        gameContext = await readFile(options.context, "utf-8");
      }

      const report = await summarizeDiff(diffs, client, gameContext);
      logger.info(
        { highlights: report.highlights.length },
        "summarize: complete",
      );

      if (options.format === "json") {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      console.log(`\nConfig summary: ${options.old} → ${options.new}`);
      console.log(`Changes detected: ${report.changeCount}\n`);
      console.log(report.summary);

      if (report.highlights.length > 0) {
        console.log();
        for (const highlight of report.highlights) {
          console.log(`  • ${highlight}`);
        }
      }
      console.log();
    });
}

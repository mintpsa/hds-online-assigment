import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname, dirname } from "node:path";
import { Command } from "commander";
import { diffJson } from "diff";
import { readConfig } from "../repositories/config.repository.js";
import { diffConfigs } from "../services/diff.service.js";
import { summarizeDiff } from "../services/summarize.service.js";
import { validateConfig } from "../services/validation.service.js";
import { OpenRouterClient } from "../llm/openrouter.client.js";
import { LmStudioClient } from "../llm/lmstudio.client.js";
import type { LlmClient } from "../llm/llm.interface.js";
import type { ValidationReport } from "../types/index.js";
import { logger } from "../utils/logger.js";

type Backend = "openrouter" | "lmstudio";

interface ReportOptions {
  old: string;
  new: string;
  context?: string;
  backend: Backend;
  model?: string;
  output?: string;
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

function defaultOutputPath(oldFile: string, newFile: string): string {
  const stem = (f: string) => basename(f, extname(f));
  return `reports/${stem(oldFile)}-vs-${stem(newFile)}.md`;
}

function buildTextDiff(configOld: unknown, configNew: unknown): string {
  const changes = diffJson(
    configOld as Record<string, unknown>,
    configNew as Record<string, unknown>,
  );
  const lines: string[] = [];
  for (const change of changes) {
    if (change.added || change.removed) {
      const prefix = change.added ? "+" : "-";
      change.value
        .split("\n")
        .filter((l) => l.trim())
        .forEach((l) => lines.push(`${prefix} ${l}`));
    }
  }
  return lines.join("\n");
}

function buildValidationSection(label: string, report: ValidationReport): string {
  const status = report.valid ? "VALID" : "INVALID";
  if (report.findings.length === 0) {
    return `### ${label}\n\n**Status:** ${status} — no issues found.\n`;
  }

  const rows = report.findings
    .map((f) => `| ${f.severity} | \`${f.field}\` | ${f.message} |`)
    .join("\n");

  return (
    `### ${label}\n\n` +
    `**Status:** ${status}\n\n` +
    `| Severity | Field | Message |\n` +
    `|---|---|---|\n` +
    `${rows}\n`
  );
}

function buildMarkdown(
  oldPath: string,
  newPath: string,
  changeCount: number,
  textDiff: string,
  validationOld: ValidationReport,
  validationNew: ValidationReport,
  summary: string,
  highlights: string[],
): string {
  const infoTable =
    `| | File |\n` +
    `|---|---|\n` +
    `| Old | \`${oldPath}\` |\n` +
    `| New | \`${newPath}\` |`;

  const diffSection =
    textDiff.trim().length > 0
      ? `\`\`\`diff\n${textDiff}\n\`\`\``
      : "_No differences found._";

  const highlightLines =
    highlights.length > 0
      ? `\n\n### Highlights\n\n${highlights.map((h) => `- ${h}`).join("\n")}`
      : "";

  const validationSection =
    buildValidationSection(`Old: \`${oldPath}\``, validationOld) +
    `\n` +
    buildValidationSection(`New: \`${newPath}\``, validationNew);

  return (
    `# Config Diff Report\n\n` +
    `## Info\n\n` +
    `${infoTable}\n\n` +
    `**Changes detected:** ${changeCount}\n\n` +
    `## Validation\n\n` +
    `${validationSection}\n` +
    `## Difference\n\n` +
    `${diffSection}\n\n` +
    `## Summary\n\n` +
    `${summary}` +
    `${highlightLines}\n`
  );
}

export function makeReportCommand(): Command {
  return new Command("report")
    .description(
      "Generate a markdown report combining diff and AI summary for two config versions",
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
    .option(
      "--output <path>",
      "output path for the markdown report (default: reports/<old>-vs-<new>.md)",
    )
    .action(async (options: ReportOptions) => {
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
        "report: reading configs",
      );
      const [configOld, configNew] = await Promise.all([
        readConfig(options.old),
        readConfig(options.new),
      ]);

      logger.info("report: computing diffs and running validation");
      const [diffs, validationOld, validationNew] = await Promise.all([
        diffConfigs(configOld, configNew),
        validateConfig(configOld),
        validateConfig(configNew),
      ]);
      const textDiff = buildTextDiff(configOld, configNew);

      let gameContext: string | undefined;
      if (options.context) {
        logger.info({ file: options.context }, "report: loading game context");
        gameContext = await readFile(options.context, "utf-8");
      }

      logger.info({ changes: diffs.length }, "report: requesting LLM summary");
      const summaryReport = await summarizeDiff(diffs, client, gameContext);

      const outputPath =
        options.output ?? defaultOutputPath(options.old, options.new);
      const markdown = buildMarkdown(
        options.old,
        options.new,
        summaryReport.changeCount,
        textDiff,
        validationOld,
        validationNew,
        summaryReport.summary,
        summaryReport.highlights,
      );

      logger.info({ path: outputPath }, "report: writing markdown file");
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, markdown, "utf-8");

      console.log(`Report is ready at ${outputPath}`);
    });
}

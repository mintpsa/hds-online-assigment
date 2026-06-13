import type { ConfigDiff, SummaryReport } from "../types/index.js";
import type { LlmClient } from "../llm/llm.interface.js";
import { logger } from "../utils/logger.js";

function buildPrompt(diffs: ConfigDiff[], gameContext?: string): string {
  const contextBlock = gameContext
    ? `## Game context\n\n${gameContext}\n\n`
    : "";

  return (
    `You are a slot game configuration auditor. Your job is to summarize config changes for a LiveOps team.\n\n` +
    `${contextBlock}` +
    `## Changed fields\n\n` +
    `${JSON.stringify(diffs, null, 2)}\n\n` +
    `## Instructions\n\n` +
    `Write a brief summary of what changed and why it matters to a LiveOps team.\n` +
    `Your entire response must be a single JSON object. Do not write anything before or after the JSON.\n` +
    `Do not use markdown code fences. Output only the raw JSON object.\n\n` +
    `Required format:\n` +
    `{\n` +
    `  "summary": "<one to two sentence narrative of what changed>",\n` +
    `  "highlights": ["<key change 1>", "<key change 2>"]\n` +
    `}`
  );
}

function extractJson(raw: string): string | null {
  // Strip markdown code fences if present
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  // Find the outermost { ... } block
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return stripped.slice(start, end + 1);
}

function parseResponse(raw: string): { summary: string; highlights: string[] } {
  const candidate = extractJson(raw);
  if (candidate) {
    try {
      const parsed = JSON.parse(candidate) as {
        summary?: unknown;
        highlights?: unknown;
      };
      if (
        typeof parsed.summary === "string" &&
        Array.isArray(parsed.highlights)
      ) {
        return {
          summary: parsed.summary,
          highlights: parsed.highlights.filter(
            (h): h is string => typeof h === "string",
          ),
        };
      }
    } catch {
      // fall through to fallback
    }
  }
  logger.warn(
    "summarize: could not parse LLM response as JSON, using raw text",
  );
  return { summary: raw.trim(), highlights: [] };
}

export async function summarizeDiff(
  diffs: ConfigDiff[],
  client: LlmClient,
  gameContext?: string,
): Promise<SummaryReport> {
  if (diffs.length === 0) {
    logger.info("summarize: no changes detected, skipping LLM call");
    return {
      changeCount: 0,
      summary: "No changes detected between the two config versions.",
      highlights: [],
    };
  }

  logger.info(
    { changes: diffs.length, hasContext: Boolean(gameContext) },
    "summarize: sending diff to LLM",
  );
  const prompt = buildPrompt(diffs, gameContext);
  const raw = await client.send(prompt);
  logger.info("summarize: LLM response received, parsing");
  const { summary, highlights } = parseResponse(raw);

  return { changeCount: diffs.length, summary, highlights };
}

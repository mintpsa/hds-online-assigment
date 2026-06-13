import type { ConfigDiff, SummaryReport } from "../types/index.js";
import type { LlmClient } from "../llm/llm.interface.js";
import { logger } from "../utils/logger.js";

function buildPrompt(diffs: ConfigDiff[], gameContext?: string): string {
  const contextBlock = gameContext
    ? `## Game context\n\n${gameContext}\n\n`
    : "";

  return (
    `You are a slot game configuration auditor reviewing a config change for a LiveOps team.\n\n` +
    `${contextBlock}` +
    `The following fields changed between two config versions:\n\n` +
    `${JSON.stringify(diffs, null, 2)}\n\n` +
    `Respond with JSON only — no markdown, no prose outside the JSON. Use this exact shape:\n` +
    `{ "summary": "<one or two sentence narrative>", "highlights": ["<short bullet>", ...] }`
  );
}

function parseResponse(raw: string): { summary: string; highlights: string[] } {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
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

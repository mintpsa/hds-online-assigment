import { describe, it, expect, vi } from "vitest";
import { summarizeDiff } from "./summarize.service.js";
import type { LlmClient } from "../llm/llm.interface.js";
import type { ConfigDiff } from "../types/index.js";

function makeMockClient(response: string): LlmClient {
  return { send: vi.fn().mockResolvedValue(response) };
}

const sampleDiffs: ConfigDiff[] = [
  { field: "game_name", oldValue: "Old Game", newValue: "New Game" },
];

describe("summarizeDiff", () => {
  it("returns a zero-change report without calling the LLM when diffs is empty", async () => {
    const client = makeMockClient("should not be called");
    const result = await summarizeDiff([], client);
    expect(result.changeCount).toBe(0);
    expect(result.highlights).toEqual([]);
    expect(client.send).not.toHaveBeenCalled();
  });

  it("returns changeCount equal to the number of diffs passed in", async () => {
    const json = JSON.stringify({
      summary: "One field changed.",
      highlights: ["game_name updated"],
    });
    const client = makeMockClient(json);
    const result = await summarizeDiff(sampleDiffs, client);
    expect(result.changeCount).toBe(1);
  });

  it("parses a well-formed JSON LLM response", async () => {
    const json = JSON.stringify({
      summary: "Bet levels were adjusted for the next event.",
      highlights: ["bet_levels changed", "rtp adjusted"],
    });
    const client = makeMockClient(json);
    const result = await summarizeDiff(sampleDiffs, client);
    expect(result.summary).toBe("Bet levels were adjusted for the next event.");
    expect(result.highlights).toEqual(["bet_levels changed", "rtp adjusted"]);
  });

  it("strips markdown code fences before parsing", async () => {
    const wrapped =
      "```json\n" +
      JSON.stringify({ summary: "Minor tweak.", highlights: ["x changed"] }) +
      "\n```";
    const client = makeMockClient(wrapped);
    const result = await summarizeDiff(sampleDiffs, client);
    expect(result.summary).toBe("Minor tweak.");
    expect(result.highlights).toEqual(["x changed"]);
  });

  it("falls back to raw text when the LLM response is not valid JSON", async () => {
    const client = makeMockClient(
      "Something changed, no structured output here.",
    );
    const result = await summarizeDiff(sampleDiffs, client);
    expect(result.summary).toBe(
      "Something changed, no structured output here.",
    );
    expect(result.highlights).toEqual([]);
  });

  it("falls back to raw text when the JSON is missing required fields", async () => {
    const client = makeMockClient(JSON.stringify({ unexpected: true }));
    const result = await summarizeDiff(sampleDiffs, client);
    // No summary/highlights in the object → falls back to raw string
    expect(result.summary).toBeTruthy();
    expect(result.highlights).toEqual([]);
  });

  it("passes the optional gameContext string to the LLM prompt", async () => {
    const json = JSON.stringify({ summary: "ctx", highlights: [] });
    const client = makeMockClient(json);
    await summarizeDiff(sampleDiffs, client, "Pirate-themed slot game");
    expect(client.send).toHaveBeenCalledWith(
      expect.stringContaining("Pirate-themed slot game"),
    );
  });
});

// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { readFileText } from "./readFileText";

function makeFile(content: string, name = "test.json"): File {
  return new File([content], name, { type: "application/json" });
}

describe("readFileText", () => {
  it("reads text content from a File", async () => {
    const file = makeFile('{"key":"value"}');
    const result = await readFileText(file);
    expect(result).toBe('{"key":"value"}');
  });

  it("reads an empty file as an empty string", async () => {
    const file = makeFile("");
    const result = await readFileText(file);
    expect(result).toBe("");
  });

  it("reads multi-line content correctly", async () => {
    const content = "line1\nline2\nline3";
    const file = makeFile(content, "config.yaml");
    const result = await readFileText(file);
    expect(result).toBe(content);
  });

  it("returns a Promise", () => {
    const file = makeFile("{}");
    expect(readFileText(file)).toBeInstanceOf(Promise);
  });
});

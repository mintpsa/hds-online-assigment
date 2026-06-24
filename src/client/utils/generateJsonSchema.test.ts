import { describe, it, expect } from "vitest";
import { generateJsonSchema } from "./generateJsonSchema";

describe("generateJsonSchema", () => {
  it("includes $schema, title, and root type", () => {
    const result = JSON.parse(generateJsonSchema('{"a":1}', "my title"));
    expect(result.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(result.title).toBe("my title");
    expect(result.type).toBe("object");
  });

  it("infers string property", () => {
    const result = JSON.parse(generateJsonSchema('{"name":"slot"}', "t"));
    expect(result.properties.name).toEqual({ type: "string" });
  });

  it("infers number property", () => {
    const result = JSON.parse(generateJsonSchema('{"rtp":96.5}', "t"));
    expect(result.properties.rtp).toEqual({ type: "number" });
  });

  it("infers boolean property", () => {
    const result = JSON.parse(generateJsonSchema('{"enabled":true}', "t"));
    expect(result.properties.enabled).toEqual({ type: "boolean" });
  });

  it("infers null property", () => {
    const result = JSON.parse(generateJsonSchema('{"value":null}', "t"));
    expect(result.properties.value).toEqual({ type: "null" });
  });

  it("infers nested object without required", () => {
    const result = JSON.parse(
      generateJsonSchema('{"meta":{"version":1}}', "t"),
    );
    expect(result.properties.meta.type).toBe("object");
    expect(result.properties.meta.properties.version).toEqual({
      type: "number",
    });
    expect(result.properties.meta.required).toBeUndefined();
  });

  it("does not add required on root object", () => {
    const result = JSON.parse(generateJsonSchema('{"a":1,"b":2}', "t"));
    expect(result.required).toBeUndefined();
  });

  it("infers array as type:array with no items constraint", () => {
    const result = JSON.parse(generateJsonSchema('{"levels":[1,2,3]}', "t"));
    expect(result.properties.levels).toEqual({ type: "array" });
    expect(result.properties.levels.items).toBeUndefined();
  });

  it("infers array of objects as type:array with no items constraint", () => {
    const result = JSON.parse(
      generateJsonSchema('{"reels":[{"symbols":["A","B"]}]}', "t"),
    );
    expect(result.properties.reels).toEqual({ type: "array" });
  });

  it("handles a top-level array", () => {
    const result = JSON.parse(generateJsonSchema("[1,2,3]", "t"));
    expect(result.type).toBe("array");
    expect(result.items).toBeUndefined();
  });

  it("throws on invalid JSON", () => {
    expect(() => generateJsonSchema("not json", "t")).toThrow();
  });

  it("returns valid JSON string", () => {
    expect(() => JSON.parse(generateJsonSchema('{"x":1}', "t"))).not.toThrow();
  });
});

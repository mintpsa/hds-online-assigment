import { describe, it, expect } from "vitest";
import {
  generateJsonSchema,
  generateJsonSchemaFromObject,
} from "./generateJsonSchema";

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

describe("generateJsonSchemaFromObject", () => {
  it("accepts a plain JS object directly without JSON parsing", () => {
    const result = JSON.parse(generateJsonSchemaFromObject({ a: 1 }, "t"));
    expect(result.type).toBe("object");
    expect(result.properties.a).toEqual({ type: "number" });
  });

  it("accepts a YAML-parsed object (simulated)", () => {
    // Mirrors what App.tsx does: yaml.parse() → generateJsonSchemaFromObject
    const yamlParsed = { gameName: "slots", rtp: 96.5, enabled: true };
    const result = JSON.parse(generateJsonSchemaFromObject(yamlParsed, "game"));
    expect(result.properties.gameName).toEqual({ type: "string" });
    expect(result.properties.rtp).toEqual({ type: "number" });
    expect(result.properties.enabled).toEqual({ type: "boolean" });
  });

  it("sets title from argument", () => {
    const result = JSON.parse(generateJsonSchemaFromObject({}, "my-schema"));
    expect(result.title).toBe("my-schema");
  });

  it("handles nested objects from YAML-like structure", () => {
    const obj = { meta: { version: 2, tags: ["a", "b"] } };
    const result = JSON.parse(generateJsonSchemaFromObject(obj, "t"));
    expect(result.properties.meta.type).toBe("object");
    expect(result.properties.meta.properties.version).toEqual({
      type: "number",
    });
    expect(result.properties.meta.properties.tags).toEqual({ type: "array" });
  });

  it("handles arrays at the root", () => {
    const result = JSON.parse(generateJsonSchemaFromObject([1, 2, 3], "t"));
    expect(result.type).toBe("array");
    expect(result.items).toBeUndefined();
  });

  it("handles null", () => {
    const result = JSON.parse(generateJsonSchemaFromObject(null, "t"));
    expect(result.type).toBe("null");
  });

  it("produces the same schema as generateJsonSchema for equivalent input", () => {
    const obj = { level: 1, name: "basic", active: false };
    const fromObj = generateJsonSchemaFromObject(obj, "t");
    const fromJson = generateJsonSchema(JSON.stringify(obj), "t");
    expect(fromObj).toBe(fromJson);
  });
});

function inferSchema(value: unknown): Record<string, unknown> {
  if (value === null) return { type: "null" };

  if (Array.isArray(value)) {
    return { type: "array" };
  }

  if (typeof value === "object") {
    const properties: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      properties[k] = inferSchema(v);
    }
    return { type: "object", properties };
  }

  return { type: typeof value };
}

export function generateJsonSchema(jsonText: string, title: string): string {
  const value = JSON.parse(jsonText) as unknown;
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title,
    ...inferSchema(value),
  };
  return JSON.stringify(schema, null, 2);
}

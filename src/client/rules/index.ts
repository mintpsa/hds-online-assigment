import Ajv from "ajv";

export const ajv = new Ajv({ allErrors: true });

ajv.addKeyword({
  keyword: "isIncreasing",
  type: "array",
  schemaType: "boolean",
  validate(schema: boolean, data: unknown[]): boolean {
    if (!schema) return true;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] as number) <= (data[i - 1] as number)) return false;
    }
    return true;
  },
  errors: false,
});

ajv.addKeyword({
  keyword: "isDecreasing",
  type: "array",
  schemaType: "boolean",
  validate(schema: boolean, data: unknown[]): boolean {
    if (!schema) return true;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] as number) >= (data[i - 1] as number)) return false;
    }
    return true;
  },
  errors: false,
});

import { parse as parseYaml } from "yaml";

export function parseFileContent(content: string, fileName: string): unknown {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "yaml" || ext === "yml") return parseYaml(content) as unknown;
  return JSON.parse(content) as unknown;
}

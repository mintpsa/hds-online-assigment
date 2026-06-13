import { access, readFile } from "node:fs/promises";

export async function loadJson<T>(filePath: string): Promise<T> {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const raw = await readFile(filePath, "utf-8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Invalid JSON in file: ${filePath}`);
  }
}

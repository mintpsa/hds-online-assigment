import type { SlotConfig } from "../types/index.js";
import { loadJson } from "../utils/io.js";

export async function readConfig(filePath: string): Promise<SlotConfig> {
  return loadJson<SlotConfig>(filePath);
}

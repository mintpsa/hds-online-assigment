import { Command } from "commander";
import { loadJson } from "../utils/io.js";
import { logger } from "../utils/logger.js";

export function makeIoCommand(): Command {
  const io = new Command("io").description("I/O utilities");

  io.addCommand(makeLoadJsonCommand());

  return io;
}

function makeLoadJsonCommand(): Command {
  return new Command("load-json")
    .description("Load a JSON file from disk and print its contents")
    .requiredOption("--input <file>", "path to the JSON file")
    .action(async (options: { input: string }) => {
      logger.info({ file: options.input }, "io load-json: reading file");
      const data = await loadJson<unknown>(options.input);
      logger.info("io load-json: complete");
      console.log(JSON.stringify(data, null, 2));
    });
}

#!/usr/bin/env node
import { Command } from "commander";
import { makeValidateCommand } from "./commands/validate.js";
import { makeDiffCommand } from "./commands/diff.js";

const program = new Command();

program
  .name("slot-validator")
  .description("Slot game configuration validator and diff tool")
  .version("1.0.0")
  .helpOption("-h, --help", "display help for command");

program.addCommand(makeValidateCommand());
program.addCommand(makeDiffCommand());

if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);

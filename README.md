# HDS Coding Assessment — Slot Game Config Validator

A CLI tool that reads slot game configuration files and produces a validation report.

## What it does

- **Validates** configuration files — catches missing required fields, out-of-range values, and structural errors
- **Flags risks** — highlights suspicious RTP values, payout table anomalies, or other values that warrant manual review
- **Diffs versions** — compares two config snapshots and reports field-level changes
- **Reports for multiple audiences** — human-readable CLI output for engineers and QA; JSON output for LiveOps tooling

## Usage

```bash
# Validate a single config
node dist/index.js validate path/to/game.json

# Diff two configs
node dist/index.js diff path/to/game-v1.json path/to/game-v2.json

# Output JSON report
node dist/index.js validate path/to/game.json --format json
```

## How AI tools were used

This project was developed with assistance from **Claude Code** (powered by `claude-sonnet-4-6` with 1M context window).

The methodology kept humans in the driving seat: the developer defined the overall plan, architecture, and requirements, then directed Claude Code to implement the smaller details — scaffolding files, writing scripts, generating boilerplate. AI suggestions were reviewed and accepted or adjusted before being applied; the tool was never run in a fully automated mode without supervision.

AI assistance was used for:

- Generating the initial `CLAUDE.md` and `README.md` from a project brief
- Adding `package.json` scripts for linting and formatting
- Drafting code structure and file layout based on human-defined architecture

The plan itself — what to build, how to structure it, what the validation rules should check — remained a human decision throughout.

## Development

```bash
npm install
npx tsc --noEmit   # type-check
npx eslint .        # lint
```

## Project structure

```
src/
  index.ts          # CLI entry point
  parser/           # Config file deserialization
  rules/            # Individual validation rules
  diff/             # Version comparison logic
  reporter/         # Output formatting (text, JSON)
```

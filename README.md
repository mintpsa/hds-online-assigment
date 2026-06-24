# HDS Coding Assessment — Slot Game Config Validator

A tool for reading, validating, and comparing slot game configuration files. Available as a **CLI** for scripting and CI pipelines, and as a **web application** for interactive use by engineers, QA, and LiveOps teams.

## What it does

- **Validates** configuration files — catches missing required fields, out-of-range values, and structural errors
- **Flags risks** — highlights suspicious RTP values, payout table anomalies, or other values that warrant manual review
- **Diffs versions** — compares two config snapshots and reports field-level changes
- **Reports for multiple audiences** — human-readable CLI output for engineers and QA; JSON output for LiveOps tooling

---

## Web application

The web UI provides a browser-based interface for the same validation and diffing functionality, without needing to build or run the CLI.

### Start the dev server

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Features

**Differ tab**

- Drag-and-drop (or click to browse) to upload one or two config files — JSON or YAML
- Side-by-side Monaco diff editor shows changes between the two files with syntax highlighting
- When only one file is uploaded, the right pane is editable so you can make changes and compare inline
- **Validate** button per side — picks a stored schema and runs AJV validation, showing all errors
- **Generate schema** — scaffolds a JSON Schema draft-07 from the uploaded config and adds it to the Schemas tab
- **Generate report** — opens a modal with filenames, validation results for both sides (against a single chosen schema), a diff summary (counts of added/removed/changed fields), and a full field-level change list

**Schemas tab**

- Sidebar lists all stored schemas for the session
- Monaco editor lets you view and edit any schema; Save auto-formats the JSON
- Schema name stays in sync with the `title` field as you type
- **New** — creates an empty schema skeleton
- **Upload** — imports an existing `.json` schema file from disk

### Custom AJV keywords

Schemas loaded in the web UI support two custom keywords for array fields:

| Keyword        | Value  | Effect                                                                        |
| -------------- | ------ | ----------------------------------------------------------------------------- |
| `isIncreasing` | `true` | Fails validation if any element is not strictly greater than the previous one |
| `isDecreasing` | `true` | Fails validation if any element is not strictly less than the previous one    |

Example — validate that `bet_levels` are always in ascending order:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Slot Config",
  "type": "object",
  "properties": {
    "bet_levels": {
      "type": "array",
      "isIncreasing": true
    }
  }
}
```

### Build for production

```bash
npm run build
```

Static assets are written to `dist/`. Serve with any static file server.

---

## Commands

### `validate` — validate a config file

Reads a single config file, runs all validation rules, and reports findings grouped by severity (`error`, `warning`, `info`).

```bash
# Human-readable output
node dist/index.js validate --input path/to/game.json

# Structured JSON output (pipe-friendly)
node dist/index.js validate --input path/to/game.json --format json
```

| Option              | Required | Description                |
| ------------------- | -------- | -------------------------- |
| `--input <file>`    | yes      | Path to the config file    |
| `--format <format>` | no       | `text` (default) or `json` |

---

### `diff` — compare two config versions

Compares two config files and shows field-level additions and removals.

```bash
# Human-readable diff
node dist/index.js diff --old path/to/game-v1.json --new path/to/game-v2.json

# Structured JSON diff (dot-notation paths with old/new values)
node dist/index.js diff --old path/to/game-v1.json --new path/to/game-v2.json --format json
```

| Option              | Required | Description                   |
| ------------------- | -------- | ----------------------------- |
| `--old <file>`      | yes      | Path to the base (old) config |
| `--new <file>`      | yes      | Path to the new config        |
| `--format <format>` | no       | `text` (default) or `json`    |

---

### `summarize` — LLM-generated change summary

Diffs two configs and sends the structured diff to an LLM for a plain-English summary with highlights. Requires an API key for OpenRouter; LM Studio runs locally without one.

```bash
# OpenRouter (requires OPENROUTER_API_KEY env var)
node dist/index.js summarize --old path/to/game-v1.json --new path/to/game-v2.json

# LM Studio (local, no API key needed)
node dist/index.js summarize \
  --old path/to/game-v1.json \
  --new path/to/game-v2.json \
  --backend lmstudio

# Add a game description file for richer, more context-aware output
node dist/index.js summarize \
  --old inputs/000001_mock_game_config.json \
  --new inputs/000002_edited_mock_game_config.json \
  --context inputs/game-info.md

# JSON output (changeCount + summary + highlights array)
node dist/index.js summarize \
  --old path/to/game-v1.json \
  --new path/to/game-v2.json \
  --format json
```

| Option                | Required | Description                                           |
| --------------------- | -------- | ----------------------------------------------------- |
| `--old <file>`        | yes      | Path to the base (old) config                         |
| `--new <file>`        | yes      | Path to the new config                                |
| `--context <file>`    | no       | Plain-text game description to ground the LLM summary |
| `--backend <backend>` | no       | `openrouter` (default) or `lmstudio`                  |
| `--model <model>`     | no       | Override the default model for the chosen backend     |
| `--format <format>`   | no       | `text` (default) or `json`                            |

Default models: `anthropic/claude-haiku-4-5` (OpenRouter), `google/gemma-4-e4b` (LM Studio).

---

### `report` — combined markdown report

Combines `diff` + `summarize` into a single markdown file with three sections: **Info** (file paths and change count), **Difference** (fenced diff block), and **Summary** (LLM narrative + highlights). Suitable for sharing with LiveOps, QA, or engineering.

```bash
# Basic report — written to reports/<old>-vs-<new>.md
node dist/index.js report \
  --old inputs/000001_mock_game_config.json \
  --new inputs/000002_edited_mock_game_config.json

# With game context and LM Studio backend
node dist/index.js report \
  --old inputs/000001_mock_game_config.json \
  --new inputs/000002_edited_mock_game_config.json \
  --context inputs/game-info.md \
  --backend lmstudio

# Custom output path
node dist/index.js report \
  --old inputs/000001_mock_game_config.json \
  --new inputs/000002_edited_mock_game_config.json \
  --output my-report.md
```

On success, prints: `Report is ready at reports/<name>.md`

| Option                | Required | Description                                                  |
| --------------------- | -------- | ------------------------------------------------------------ |
| `--old <file>`        | yes      | Path to the base (old) config                                |
| `--new <file>`        | yes      | Path to the new config                                       |
| `--context <file>`    | no       | Plain-text game description to ground the LLM summary        |
| `--backend <backend>` | no       | `openrouter` (default) or `lmstudio`                         |
| `--model <model>`     | no       | Override the default model for the chosen backend            |
| `--output <path>`     | no       | Output path (default: `reports/<old-stem>-vs-<new-stem>.md`) |

---

### `io load-json` — inspect a raw config file

Reads a JSON file and pretty-prints it to stdout. Useful for quickly inspecting a config before running other commands.

```bash
node dist/index.js io load-json --input path/to/game.json
```

| Option           | Required | Description           |
| ---------------- | -------- | --------------------- |
| `--input <file>` | yes      | Path to the JSON file |

## How AI tools were used

This project was developed with assistance from **Claude Code** (powered by `claude-sonnet-4-6` with 1M context window).

The methodology kept humans in the driving seat: the developer defined the overall plan, architecture, and requirements, then directed Claude Code to implement the smaller details — scaffolding files, writing scripts, generating boilerplate. AI suggestions were reviewed and accepted or adjusted before being applied; the tool was never run in a fully automated mode without supervision.

AI assistance was used for:

- Generating the initial `CLAUDE.md` and `README.md` from a project brief
- Adding `package.json` scripts for linting and formatting
- Drafting code structure and file layout based on human-defined architecture

The plan itself — what to build, how to structure it, what the validation rules should check — remained a human decision throughout.

## LLM summarization design decisions

The `summarize` command feeds the structured `ConfigDiff[]` output from the diff engine into an LLM and returns a human-readable narrative. Several decisions shape how this is built.

**Separate `summarize` command, not a `--format` on `diff`.**
Summarization is asynchronous, makes an external API call, and has its own option (`--context`). Mixing it into the `diff` command as a format variant would conflate pure formatting (synchronous, deterministic) with side-effectful I/O.

**`--backend` flag (`openrouter` | `lmstudio`) rather than env-only selection.**
Env vars supply credentials; the flag selects runtime behavior. This lets a user explicitly choose local (LM Studio, offline, no cost) vs cloud (OpenRouter) without modifying the environment.

**`--context <file>` for game description rather than hardcoded domain knowledge.**
Different teams ship different games. A file-based context is portable — the same `game-info.md` can be committed alongside the configs for a specific title and reused across every diff run for that game. Without a context file, the summary still works but relies on field names alone.

**Structured `ConfigDiff[]` as LLM input, not raw text diff.**
The field-level diff (dot-notation paths with old/new values) is unambiguous and concise. Raw text diff (`+`/`-` lines) requires the LLM to parse formatting that was designed for humans. Structured input also avoids token waste on unchanged context lines.

**`claude-haiku-4-5` (via OpenRouter), `qwen3-4b` (via LM Studio) as defaults.**  
Summarization is a simple compression task — it doesn't need high-reasoning models. Cheaper, faster models keep the command snappy for CI pipelines or frequent LiveOps use.

**Graceful JSON parsing.**  
The prompt asks for a JSON-only response. If the model adds markdown fences or prose, the service extracts the first `{...}` block and tries to parse it. If all else fails, the raw response becomes the `summary` field with an empty `highlights` array — so the command always produces output.

## Diffing library choice

The diff command uses **[jsdiff](https://github.com/kpdecker/jsdiff)** (`diff` on npm), the most widely used diffing library in the JavaScript ecosystem. It implements the **Myers O(ND) difference algorithm** — the same foundational algorithm Git historically uses — which produces additions and deletions that are immediately familiar to engineers and QA without extra processing.

The main alternative considered was **fast-diff**, which is based on Google's Diff-Match-Patch algorithm and is faster for massive text volumes or real-time character-level input (e.g. collaborative editors). However, it operates natively on characters and requires extra work to produce line-by-line or field-level output. For config files of this size, the performance difference is negligible, and jsdiff's Git-like output is the better fit for a developer/QA audience.

## Future improvements

The current validation engine is rule-based and deterministic — the same config always produces the same findings. A natural next layer would be an **AI-assisted risk pass** that runs after the rule engine:

- Rules catch _known-bad_ states (invalid values, constraint violations)
- An LLM could flag _suspicious-but-valid_ combinations that rules cannot express — e.g. jackpot contribution rates that are individually within bounds but collectively drain faster than intended, or reward multipliers that interact in unexpected ways across player segments

This would function as a second-pass "risk advisor", not a replacement for rules. The rule engine output would be its input, and its findings would be advisory (`info` severity) rather than blocking. Guardrails (structured output, severity caps) would be needed to prevent false positives from blocking valid configs.

## Prerequisites

- **Node.js** v20 or later
- **npm** v10 or later

### Install dependencies

```bash
npm install
npm run build
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values you need:

```bash
cp .env.example .env
```

| Variable              | Required                            | Description                                                                                                                                           |
| --------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPENROUTER_API_KEY`  | Required for `--backend openrouter` | API key from [openrouter.ai](https://openrouter.ai). Used by the `summarize` and `report` commands when the default OpenRouter backend is selected.   |
| `LM_STUDIO_API_TOKEN` | Optional                            | Bearer token for LM Studio's REST API. Most local LM Studio setups do not require this — leave blank unless your instance has authentication enabled. |
| `LOG_LEVEL`           | Optional                            | Pino log level written to stderr. Accepted values: `trace`, `debug`, `info` (default), `warn`, `error`, `fatal`, `silent`.                            |

The `validate` and `diff` commands run without any env vars. Only `summarize` and `report` require credentials (for the LLM backend).

## Development

```bash
npm install
npx tsc --noEmit   # type-check
npx eslint .        # lint
```

## Project structure

```
src/
  index.ts              # CLI entry point
  commands/             # validate, diff, summarize, report, io commands
  rules/                # Individual validation rules
  services/             # Business logic (validation, diff, summarize)
  llm/                  # LLM client interface + OpenRouter / LM Studio adapters
  types/                # Shared TypeScript types
  client/               # Web application (React + Vite)
    App.tsx             # Root component — tab state, file state, modal orchestration
    types.ts            # Shared types (StoredSchema)
    rules/              # Custom AJV keywords (isIncreasing, isDecreasing)
    components/         # UI components (FileDropZone, DiffViewer, ValidateModal, ReportModal, …)
    utils/              # Client utilities (parseFileContent, generateJsonSchema, readFileText)
```

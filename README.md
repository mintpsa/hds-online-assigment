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
node dist/index.js validate --input path/to/game.json

# Diff two configs
node dist/index.js diff --old path/to/game-v1.json --new path/to/game-v2.json

# Diff with JSON output (structured field-level changes)
node dist/index.js diff --old path/to/game-v1.json --new path/to/game-v2.json --format json

# Summarize changes with an LLM (OpenRouter — requires OPENROUTER_API_KEY)
node dist/index.js summarize --old path/to/game-v1.json --new path/to/game-v2.json

# Summarize with LM Studio (local, no API key needed)
node dist/index.js summarize --old path/to/game-v1.json --new path/to/game-v2.json --backend lmstudio

# Summarize with game context for richer output
node dist/index.js summarize \
  --old inputs/000001_mock_game_config.json \
  --new inputs/000002_edited_mock_game_config.json \
  --context inputs/game-info.md

# Output JSON report
node dist/index.js validate --input path/to/game.json --format json
```

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

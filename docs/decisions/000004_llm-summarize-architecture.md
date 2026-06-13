# LLM summarization architecture

**Date:** 2026-06-13
**Task:** Add an LLM-powered `summarize` command that narrates config diffs for LiveOps, QA, and engineering audiences

## Decision

Built a thin `src/llm/` abstraction layer with a single-method `LlmClient` interface (`send(prompt): Promise<string>`), two implementations (OpenRouter via `@openrouter/sdk`; LM Studio via `fetch`), and a `summarize` command that composes existing `diffConfigs()` output with an optional game-context file before calling the LLM.

Key choices:

- `--backend openrouter|lmstudio` flag (not env-only) for runtime backend selection
- `--context <file>` flag for portable, per-game domain context
- Structured `ConfigDiff[]` as LLM input (not raw text diff)
- Separate `summarize` command (not a `--format` variant on `diff`)
- `skipLibCheck: true` added to tsconfig to suppress type conflicts inside `@openrouter/sdk`

## Why

- **Separate abstraction layer:** future commands (risk-flagging, advisory notes) may also call LLMs; centralising prevents re-implementing HTTP per command
- **`--backend` flag:** env vars supply credentials, the flag selects behaviour — users can choose offline (LM Studio) vs cloud (OpenRouter) without altering environment
- **`--context` file:** different games have different semantics; committing a `game-info.md` alongside configs is more portable than hardcoding domain knowledge in the prompt
- **Structured diff input:** unambiguous, concise, avoids token waste on unchanged context lines that a raw text diff would include
- **Separate command:** summarization is async, has side effects, and has its own option set — mixing it into `diff` as a format variant conflates pure formatting with I/O
- **`skipLibCheck`:** `@openrouter/sdk` ships type definitions that conflict with TypeScript 6's stricter `ReadableStream` types; `skipLibCheck` is the standard fix and only suppresses third-party `.d.ts` errors

## How to apply

- Add new LLM backends by implementing `LlmClient` in `src/llm/` — the command layer only depends on the interface
- If the prompt quality degrades, edit `buildPrompt()` in `src/services/summarize.service.ts`; the parsing fallback in `parseResponse()` handles non-JSON-clean model outputs gracefully
- Default models are set in `src/commands/summarize.ts` (`DEFAULT_MODELS`); override per-run with `--model`
- The `--context` file is plain text/markdown — no special format required

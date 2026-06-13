# Project Bootstrap Decisions

**Date:** 2026-06-13
**Task:** Bootstrap tooling, documentation, and AI workflow for the slot game config validator

## Decision

1. **Skill stored in project scope** (`.claude/skills/wrap-up/`) rather than global `~/.claude/skills/`.
2. **Decision records go to `docs/decisions/`** with zero-padded 6-digit numeric prefix (e.g. `000001_`), not inside `.claude/memory/`.
3. **npm scripts follow a lint / lint:fix / format / format:check pattern** covering both write and check variants for CI vs local dev use.
4. **AI methodology is human-led**: human defines the plan and architecture; AI implements details under supervision — this is documented in README.md.

## Why

- Project-scoped skill keeps the wrap-up workflow portable with the repo rather than tied to one developer's global config.
- `docs/decisions/` is version-controlled, human-readable, and follows the ADR (Architecture Decision Record) convention — more discoverable than a hidden `.claude/` directory.
- Numeric prefixes keep decisions in chronological order without relying on filesystem timestamps.
- The lint/format script split matches the common CI pattern: `format:check` and `lint` for pipelines, `lint:fix` and `format` for local development.

## How to apply

- When wrapping up a task, always check the highest prefix in `docs/decisions/` and increment by 1.
- Keep entries focused on _why_ a decision was made — the code shows the _what_.
- The AI methodology section in README.md should be kept up to date as tooling evolves.

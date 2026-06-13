# Validation approach: rule-based over AI

**Date:** 2026-06-13
**Task:** Implement PLAYSTUDIOS-style validation rules for slot game configuration files

## Decision

1. **Rule-based validation only** — each validation concern is a pure function `(config: SlotConfig) => ValidationFinding[]` in its own file under `src/rules/`.
2. **One file per rule group** — named `<concern>.rule.ts`; registered in the service by importing and listing in a `rules` array.
3. **`valid` = zero error-severity findings** — warnings and info findings do not block; only `error` severity sets `valid: false`.
4. **Operational thresholds as named constants** — e.g. `WARN_TOTAL_CONTRIBUTION_PCT = 0.15`, `MAX_SAFE_TOTAL_CONTRIBUTION_PCT = 0.25` — never magic numbers.
5. **AI deferred as a future second-pass layer** — not rejected outright; scoped to flagging suspicious-but-valid combinations that rules cannot express.

## Why

- **Determinism** — CI and QA pipelines require the same config to always produce the same result; an LLM can introduce non-determinism.
- **Auditability** — when a LiveOps operator asks why a config failed, the answer must point to a specific rule and value, not a model inference.
- **No operational overhead** — no network call, no token cost, runs offline; validation is on the hot path of every config deploy.
- **AI second-pass** is still valuable for relational or combinatorial risks (e.g. jackpot rates that are individually valid but collectively drain faster than intended), but needs guardrails and an advisory-only severity — deferred as a future improvement.

## How to apply

- Add new rules as `src/rules/<concern>.rule.ts` exporting a default function; register it in the `rules` array in `src/services/validation.service.ts`.
- Use `severity: "error"` for hard constraints (config must not deploy), `"warning"` for operational risks (human review recommended), `"info"` for informational flags.
- Keep thresholds in named constants at the top of each rule file — never inline numbers.
- The `ValidationRule` type alias in `src/types/validation.type.ts` is the contract all rules must satisfy.

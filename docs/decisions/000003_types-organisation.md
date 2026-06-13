# Types Organisation

**Date:** 2026-06-13
**Task:** Separate the monolithic `src/types/index.ts` into per-domain type files and add typed interfaces for the slot config schema

## Decision

1. **Per-domain type files** — types are split into `cli.type.ts`, `slot-config.type.ts`, `validation.type.ts`, and `diff.type.ts` under `src/types/`.
2. **File naming convention** — `<model>.type.ts` (lowercase kebab-case, `.type.ts` suffix).
3. **Barrel re-export** — `src/types/index.ts` becomes a barrel (`export * from ...`) so all existing consumer imports (`from "../types/index.js"`) continue to work without changes.
4. **`loadJson` generic utility** — added `src/utils/io.ts` with `loadJson<T>()` that validates path existence and JSON parseability before returning; structural validation is left to the caller.
5. **`PayoutEntry` uses string literal keys** — `"3"`, `"4"`, `"5"` because JSON object keys are always strings; numeric index keys would not match at runtime.
6. **`overrides` stays `Record<string, unknown>`** — player segment overrides are free-form per segment; closing the type would require a discriminated union not justified by the current schema.

## Why

- A single `index.ts` with all types becomes hard to navigate as the schema grows; grouping by domain mirrors the controller/service/repository split already in place.
- `.type.ts` suffix makes domain model files immediately identifiable in a file tree without opening them.
- The barrel keeps consumer imports stable — no mechanical refactor across the codebase every time the types folder is restructured.
- `loadJson` is kept in `src/utils/` (not `src/repositories/`) because it is infrastructure-level I/O with no domain knowledge; the repository layer wraps it with domain context.

## How to apply

- New type files go in `src/types/<model>.type.ts` and must be re-exported from `src/types/index.ts`.
- Consumers should import from `../types/index.js` (the barrel), not from individual type files directly — this keeps refactoring the folder transparent to callers.
- When adding new top-level config fields, extend `SlotConfig` in `slot-config.type.ts` and add supporting interfaces in the same file.

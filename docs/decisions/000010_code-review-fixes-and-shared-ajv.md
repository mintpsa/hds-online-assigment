# Code review fixes and shared AJV rules layer

**Date:** 2026-06-24
**Task:** Fix bugs surfaced by /code-review, refactor shared types/utils, add custom AJV keywords

## Decision

- **Shared `ajv` instance in `src/client/rules/`** — a single AJV instance exported from a dedicated rules folder; both `ValidateModal` and `ReportModal` import from there instead of each owning their own.
- **Shared `StoredSchema` type** extracted to `src/client/types.ts` — was duplicated in three files.
- **Shared `parseFileContent` util** extracted to `src/client/utils/parseFileContent.ts` — was duplicated in both modals and `App.tsx`.
- **`ValidateButton` component** added to `ActionButtons.tsx` — avoids a module-level `className` constant in `App.tsx`.
- **`isIncreasing` / `isDecreasing` AJV keywords** registered on the shared instance, applied to `type: "array"` fields.
- **DiffViewer `onMount` seeds initial `rightContent`** by calling `onModifiedChange(getValue())` immediately, before wiring `onDidChangeModelContent`.
- **`classifyDragItems` MIME check aligned with `isAccepted`** — empty MIME and `text/plain` are now accepted optimistically during drag, consistent with drop-time acceptance.
- **`language` detection uses `leftFile ?? rightFile`** — previously only checked `leftFile`, causing wrong syntax highlighting when only a right file was loaded.

## Why

- Duplicate `ajv` instances meant custom keywords registered on one would not run on the other; two caches also accumulated compiled validators independently.
- `rightContent` staying `''` on initial mount caused the Report modal to silently show "No differences found" and a spurious parse error in the validation panel when only one file was uploaded.
- `classifyDragItems` and `isAccepted` using different predicates caused the drop zone to turn green on drag but then flash an error on drop for files with `text/plain` MIME (common on Firefox/Windows for YAML).
- User explicitly requested `ValidateButton` be a component rather than an inline `className` constant.

## How to apply

- All AJV keyword additions go in `src/client/rules/index.ts` — never instantiate `new Ajv()` in a component.
- The shared `ajv` instance uses `addSchema(def, id)` + `validate(id, data)` to avoid recompiling schemas on every render.
- To add a new custom keyword, add an `ajv.addKeyword(...)` call in `rules/index.ts` and a corresponding test in `rules/index.test.ts`.
- `StoredSchema` is the canonical type in `src/client/types.ts`; do not re-declare it locally.

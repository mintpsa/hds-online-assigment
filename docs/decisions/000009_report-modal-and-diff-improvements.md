# Report modal and diff improvements

**Date:** 2026-06-24
**Task:** Add Generate Report modal, make right diff editor editable, fix deep diff flattening and overflow

## Decision

- **Generate Report modal** computes validation and diff entirely client-side inside the component — no server calls, no separate utility file. `flattenObject`, `runValidation`, and `computeDiff` are co-located with the modal since they are only used there.
- **Single shared schema** for both sides in the report — one `<select>` drives both left and right validation results simultaneously. Rejected per-side selectors (original design) after user feedback.
- **Editable right diff pane** — `DiffEditor` `readOnly: false` + `originalEditable: false` locks the left side and allows typing on the right. `onModifiedChange` only updates state when no right file is uploaded, so a dropped file always takes precedence over manual edits.
- **Report available with one file** — `reportDisabled` was relaxed from `!leftFile || !rightFile` to `!leftFile` because the right side is always populated (either from a file or from editing).
- **Deep flattenObject with array indexing** — recurses into arrays by numeric index (`key.0.subfield`) instead of treating the whole array as an atomic value. This is the correct fix for the "whole object shows as changed" bug caused by any nested field mutation.
- **Value overflow fix** — old/new values in diff entries now stack vertically, use `break-all` + `whitespace-pre-wrap`, and cap within the card bounds instead of a horizontal `flex` row that overflowed.

## Why

- Per-side schema selectors added friction — when validating two versions of the same config format, you always want the same schema for both.
- The editable right pane lets users tweak a config and immediately see what would change in the diff without needing to save a file, matching the workflow of testing incremental edits.
- Array indexing in `flattenObject` mirrors how the CLI's `diff.service.ts` works (same pattern), keeping behaviour consistent between CLI and UI.
- Horizontal old→new layout broke on any value longer than ~40 chars; vertical stacking is unconditionally safe.

## How to apply

- `flattenObject` in `ReportModal.tsx` uses dot-separated paths with numeric indices for arrays. If the diff output becomes too granular for large arrays (e.g. 100-element reels), consider a max-depth cutoff or a special-case for arrays of primitives.
- `DiffViewer` now forwards `onModifiedChange`; if it's absent the editor still works read-only for the right side (the `onMount` handler is a no-op when the prop is undefined).
- The `rightFileUploaded` prop on `ReportModal` controls the "(edited)" label — pass `false` when no file was dropped on the right side.

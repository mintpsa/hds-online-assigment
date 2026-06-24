# Schema tab UX improvements

**Date:** 2026-06-24
**Task:** Improve schema generation strictness, add YAML validation support, schema CRUD in the Schemas tab, auto-format on save, and live name sync from the title field

## Decision

- **Less-strict schema scaffold**: arrays emit `{ type: "array" }` only (no `items`); objects omit `required`. Previously every key was required and array items were locked to the first element's shape, causing the source file to fail its own generated schema.
- **YAML-aware validation**: `ValidateModal` detects the file extension and parses YAML via the `yaml` package before running `ajv`, rather than always calling `JSON.parse`.
- **Auto-format on Save**: `handleSaveSchema` runs `JSON.stringify(JSON.parse(...), null, 2)` before storing. Silently skips formatting if the JSON is invalid so the user doesn't lose their draft.
- **Live name sync from `title` field**: the editor `onChange` handler parses the draft JSON on every keystroke; if `title` has changed to a non-empty string, both `selectedSchema` and the schemas list are updated immediately — no separate Save needed for the rename.
- **Create / Upload in sidebar**: `+` button creates an empty draft-07 skeleton with an auto-incremented name; Upload button opens a hidden `<input type="file" accept=".json">` and reads the file with the existing `readFileText` utility.

## Why

- The strict scaffold made generated schemas useless for immediate validation — the most natural first action after generating a schema is validating the source file against it.
- YAML files were already displayed in the editor but silently failed validation because `JSON.parse` throws on YAML text.
- Auto-format on save avoids the editor accumulating inconsistent indentation after manual edits.
- Live title→name sync is lower friction than requiring a Save to rename; keeping it on every valid-JSON keystroke means the sidebar always reflects the current intent.

## How to apply

- `generateJsonSchema.ts` is a pure function — extend it by adding an `options` argument if stricter mode is ever needed (e.g. include `required` for known-stable schemas).
- The YAML parsing path in `ValidateModal` uses the `yaml` npm package (already a direct dependency). If YAML support is needed elsewhere (e.g. the diff editor language), the same `ext`-check pattern applies.
- The live name-sync in `App.tsx` mutates `selectedSchema` ref mid-edit; if the Schemas tab is ever extracted to its own component/context, move this logic into a `useSchemaEditor` hook.

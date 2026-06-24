# Frontend UI — drag-and-drop, diff editor, schema management

**Date:** 2026-06-24
**Task:** Build a React frontend for the slot config validator with file upload, Monaco diff view, and JSON Schema generation/validation

## Decision

- **Native HTML5 drag-and-drop** instead of `react-dropzone` — avoids `--legacy-peer-deps` since react-dropzone@15 excludes React 19 from its peer dep range.
- **`@monaco-editor/react` DiffEditor** as the primary content viewer — replaces a plain `<pre>` viewer; gives side-by-side diff with syntax highlighting out of the box.
- **`ajv`** for client-side JSON Schema validation — runs entirely in the browser, no server round-trip needed.
- **Client-side JSON Schema generation** — walks the JSON tree recursively to infer types; produces JSON Schema draft-07. No LLM call required for the scaffold.
- **Single-file drop zones that stay visible after upload** — user can re-drop to replace rather than having a separate "clear" flow.
- **When only one file is loaded, mirror its content to both sides of the diff editor** — gives a useful read view rather than a blank right pane.
- **Editable Monaco editor on Schemas tab with a Save button** — Save is disabled when content is unchanged (dirty-flag pattern); saving writes back to in-memory schema list.

## Why

- React 19 compatibility ruled out react-dropzone without a peer-dep override.
- Monaco was already a dependency (via `@monaco-editor/react` added for the diff view), so using it for the schema editor added no new dependency.
- Client-side schema generation and validation keeps the tool self-contained and fast — the existing CLI already handles server-side concerns.
- Mirroring the single file to both diff panes avoids a jarring blank side and lets the user read the file comfortably while the second file hasn't been uploaded yet.

## How to apply

- The `FileDropZone` component (`src/client/components/FileDropZone/`) is self-contained and reusable — it emits a raw `File`; parsing is the caller's responsibility.
- `generateJsonSchema` (`src/client/utils/generateJsonSchema.ts`) is a pure function; extend it to handle YAML by parsing with the `yaml` package before passing the object in.
- Stored schemas live in `App` state only — no persistence across page reloads yet. Add `localStorage` serialization there when needed.
- The dirty-flag pattern for the schema editor (`isDirty`, `editorDraft`) is in `App.tsx`; if the Schemas tab grows, extract it into a dedicated hook.

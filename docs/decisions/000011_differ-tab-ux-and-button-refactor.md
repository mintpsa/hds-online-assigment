# Differ tab UX overhaul and button component refactor

**Date:** 2026-06-25
**Task:** Remove right-hand upload, add export/clear/delete, refactor button components, add two-column validate row

## Decision

- **Single file upload** — the right pane of the diff editor is now always editable; the right-side drop zone was removed. The user uploads one config and edits the right pane inline.
- **Button components split into individual files** — `PrimaryButton`, `OutlineButton`, `DangerButton`, `ValidateButton` each live in their own file under `ActionButtons/`. `ActionButtons.tsx` is a re-export barrel. `index.ts` is the public barrel.
- **`ActionButtons` component replaced by `PrimaryButton`** — the old component accepted named callbacks (`onGenerateSchema`, `onGenerateReport`) which required touching the component every time a new action was added. Callers now compose `PrimaryButton` directly with their own label and handler.
- **`DangerButton`** — distinct red outline style for destructive actions (Clear, Delete), separate from the gray `OutlineButton` used for secondary actions.
- **`downloadFile` utility** — wraps the Blob/object-URL browser download pattern; shared by Export config and Export schema.
- **Two-column validate row** — a second toolbar row below the main action row shows "Validate original" and "Validate edited" side by side, mirroring the diff pane split. Single `validateTarget: "original" | "edited" | null` state drives both.
- **Schema tab: Edit/Save/Cancel flow** — view mode shows a readonly Monaco editor with Export and Edit buttons. Edit mode switches to a DiffEditor (saved vs draft). Title rename now only commits on Save.
- **Schema Delete** — hidden during edit mode to prevent accidental deletion mid-edit.

## Why

- Right-side drop zone was redundant once the right pane became editable.
- Named-callback `ActionButtons` required a prop change for every new action; generic `PrimaryButton` is open for extension without modification.
- Separate button files make each variant independently discoverable and testable.
- Two validate buttons make it explicit which version (original or edited) is being validated against a schema.

## How to apply

- Add new button variants by creating a new `<Variant>Button.tsx` file, exporting from `ActionButtons.tsx` and `index.ts`.
- Never instantiate `new Ajv()` in components — use the shared instance from `src/client/rules/`.
- `validateTarget` drives the ValidateModal; extend it with additional targets if more panes are added.

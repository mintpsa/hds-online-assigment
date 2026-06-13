# Report command — inline orchestration, no new service

**Date:** 2026-06-13
**Task:** Add a `report` command that combines diff + LLM summary and writes a markdown file

## Decision

All orchestration logic lives directly inside `src/commands/report.ts`. No new service file was created. The command reuses `readConfig()`, `diffConfigs()`, `summarizeDiff()`, and `diffJson()` from existing modules, and owns the markdown assembly and file-write steps inline.

## Why

The report command is pure composition — it calls existing services in sequence and formats their outputs. Extracting this into a `report.service.ts` would add a layer of indirection without any reuse benefit (the `report` command is the only caller). The existing services already cover the domain logic; the command is the right place for orchestration that exists only to serve one flow.

## How to apply

If a future command reuses the markdown-building or text-diff logic from `report.ts`, that's the signal to extract a shared helper or service. Until there's a second caller, keep orchestration in the command layer.

# CLI Scaffold Architecture

**Date:** 2026-06-13
**Task:** Install commander.js and scaffold the root CLI with a controller/service/repository structure

## Decision

1. **ESM over CJS** — `"type": "module"` in `package.json`, `"module": "NodeNext"` in `tsconfig.json`.
2. **`moduleResolution: NodeNext`** — paired with `"module": "NodeNext"`; requires `.js` extensions on all relative imports.
3. **Commander command factories** — each subcommand is a `make*Command()` function returning a `Command`, registered in `src/index.ts` via `addCommand()`.
4. **No `bin` field in `package.json`** — the tool is run directly via `node dist/index.js`; global install is not a requirement at this stage.
5. **`void` pattern for unused stub parameters** — service stubs use `void param` to satisfy `noUnusedParameters` without disabling the rule.
6. **`prettierConfig` added to ESLint flat config** — was already in devDeps but not wired in; prevents ESLint/Prettier rule conflicts.

## Why

- ESM is the first-class path for Node 22 and commander v15; avoids `require()` calls and bundler overhead.
- `NodeNext` is the only `moduleResolution` that fully models Node's ESM resolver and correctly picks up commander's `exports` map.
- Command factories keep subcommand definitions self-contained and independently testable without touching the root program.
- Skipping `bin` keeps scope minimal; it can be added later if the tool needs to be globally installable.
- `void` stubs let the project compile cleanly under strict TypeScript from day one without silencing real future warnings.

## How to apply

- Always pair `"module": "NodeNext"` with `"moduleResolution": "NodeNext"` in `tsconfig.json` — mixing them causes silent resolution mismatches.
- All relative imports in `src/` must use the `.js` extension (e.g. `"../types/index.js"`), even though the source is `.ts`.
- New subcommands follow the pattern: create `src/commands/<name>.ts` exporting `make<Name>Command()`, then register it in `src/index.ts`.
- New business logic goes in `src/services/`, file I/O in `src/repositories/`.

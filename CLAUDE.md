# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Objective

Build a CLI tool that reads slot game configuration files and produces a validation report. The tool must answer:
- Is the configuration valid?
- Are there risky or suspicious values?
- What changed between two configuration versions?
- Is the output useful for engineering, QA, or LiveOps teams?

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Linting**: ESLint + Prettier (configured in `eslint.config.mts`)
- **Test runner**: Not yet configured — add Jest or Vitest when writing tests

## Commands

```bash
npm run lint          # check for lint errors
npm run lint:fix      # auto-fix lint errors
npm run format        # format all files with Prettier
npm run format:check  # check formatting without writing

# Type-check
npx tsc --noEmit

# Run the tool (once built)
node dist/index.js <config-file>
```

No build script or test runner exists yet — add them to `package.json` as the project grows.

## Architecture (to be built)

The tool should be structured around three concerns:

1. **Parsing** — read and deserialize config files (JSON/YAML) from disk
2. **Validation** — apply rules that detect invalid values, risky thresholds, or structural issues; each rule returns a typed finding
3. **Diffing** — compare two parsed configs and surface field-level changes
4. **Reporting** — format findings for human output (CLI table/text) and machine output (JSON)

Entry point will be `src/index.ts`. Validation rules should live in `src/rules/` so they can be added or removed independently. Keep I/O (file reading, stdout) at the edges; pure functions in the middle make testing straightforward.

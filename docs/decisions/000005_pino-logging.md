# Structured logging with pino

**Date:** 2026-06-13
**Task:** Add a global logger and instrument all commands, services, and LLM clients with informational logs

## Decision

Created a singleton logger at `src/utils/logger.ts` using pino. Logger writes to **stderr** (fd 2), uses `pino-pretty` in development and plain JSON in production. Log level is configurable via `LOG_LEVEL` env var (default: `info`). `pino-pretty` installed as a devDependency.

## Why

- **Stderr, not stdout:** command output goes to stdout; mixing logs into the same stream would break JSON piping (`--format json | jq`). Routing logs to stderr keeps streams cleanly separated.
- **pino over console.log:** structured JSON fields (e.g. `{ valid: true, errors: 0 }`) are machine-readable for log aggregators; `console.log` strings are not.
- **pino-pretty as devDependency:** pretty-printing is a dev convenience only; production containers read JSON logs from stderr directly — no pretty-printing needed there.
- **Singleton module:** importing the same `logger.ts` from every file shares one pino instance and one transport, avoiding multiple transports being opened.

## How to apply

- Import from `../utils/logger.js` (with `.js` extension for NodeNext ESM)
- Log at `info` for normal operational events; use structured fields for queryable data (`{ file, changes, valid }`)
- Keep log messages short and in `scope: action` format (e.g. `"validate: reading config"`)
- Override level at runtime: `LOG_LEVEL=debug node dist/index.js validate ...`
- In production (`NODE_ENV=production`), pino emits newline-delimited JSON to stderr — no transport needed

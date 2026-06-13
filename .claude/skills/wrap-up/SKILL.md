---
name: wrap-up
description: End-of-task wrap-up: saves decision notes to memory, runs format + lint, commits all changes, and outputs a brief summary. Use this skill whenever a task is done and the user says "wrap up", "commit this", "done for now", "finish this off", or similar. Also invoke it when the user asks to "document and commit" or "save progress".
---

# Wrap-Up Skill

Run this skill at the end of a task to document decisions, clean up code quality, commit, and summarise what happened.

## Steps — run in order

### 1. Gather context from the session

Before doing anything, reflect on the current conversation to extract:

- **What was built or changed** (files touched, features added, config updated)
- **Key decisions made** — things that weren't obvious, trade-offs chosen, approaches rejected
- **Why** those decisions were made (constraints, preferences the user expressed)

If anything is unclear, ask the user one focused question before proceeding.

### 2. Save decisions to docs/decisions

Write a decision record in `docs/decisions/` capturing non-obvious decisions from this task.

**Filename format:** `<N>_<short-slug>.md` where `<N>` is a zero-padded 6-digit sequence number (e.g. `000001_`, `000002_`). To find the next number, list existing files in `docs/decisions/` and increment the highest prefix. If the directory is empty or doesn't exist, start at `000001_`. Create `docs/decisions/` if it doesn't exist.

Use this file format:

```markdown
# <Short title>

**Date:** <YYYY-MM-DD>
**Task:** <one-line description of what the task was>

## Decision

<What was decided>

## Why

<Reason — constraint, user preference, tradeoff, approach rejected>

## How to apply

<What future contributors should know when touching this area>
```

Skip this step if the task was purely mechanical with no notable decisions (e.g. only ran commands, fixed a typo).

### 3. Run format and lint

Run these two commands from the project root. Report the result of each.

```bash
npm run format
npm run lint
```

If lint returns errors that need fixing, fix them before proceeding. If format makes changes, stage those too.

### 4. Commit

Stage all changes with `git add` (be specific — avoid `git add .` if there are unrelated files). Then commit using the standard format:

```
git commit -m "$(cat <<'EOF'
<type>(<scope>): <short imperative summary>

<optional body: what changed and why, if not obvious>

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Commit types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`

Pick the type that best fits the primary change. Use `chore` for config/tooling changes, `docs` for README/CLAUDE.md only changes.

### 5. Output summary

Print a brief wrap-up block:

```
## Wrap-up

**What changed:** <one sentence>
**Commit:** <commit hash (short)> — <commit message first line>
**Decisions documented:** <yes / no — and the file path if yes (e.g. docs/decisions/000001_foo.md)>
```

Keep it to 4–6 lines. The user can read the diff; this is just orientation.

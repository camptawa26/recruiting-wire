# The Recruiting Wire

A weekly auto-generated newsletter on the recruiting industry — tech recruiting and AI innovations specifically. Publishes every Friday at 5pm PT to a public webpage.

**Live site:** _(URL added after first deploy)_

## How it works

A Claude scheduled agent ("routine") runs every Friday. It reads new feedback from a Google Form (via Drive MCP), updates `learnings.md`, generates the next issue using web search across a quality-filtered source set, and commits `current-issue.md` to this repo. GitHub Pages serves the page. The page renders `current-issue.md` as HTML in the browser.

## Repo layout

- `index.html`, `style.css`, `render.js` — the static page
- `current-issue.md` — latest issue (overwritten weekly by the routine)
- `learnings.md` — feedback-derived rules the routine follows
- `ai-writing-rules.md` — style guide (rules to avoid AI writing tells)
- `feedback/raw/` — captured feedback, one MD per submission
- `docs/superpowers/specs/` — design spec
- `docs/superpowers/plans/` — implementation plan
- `docs/superpowers/routine-prompt.md` — the prompt the scheduled routine runs

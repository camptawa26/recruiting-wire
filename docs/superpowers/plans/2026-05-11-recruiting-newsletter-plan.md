# The Recruiting Wire — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship a weekly auto-generating recruiting-industry newsletter that publishes to a public webpage every Friday at 5pm PT, with a feedback button that captures input into a learning loop.

**Architecture:** A GitHub repo hosts a static page (HTML/CSS/JS) on GitHub Pages. A scheduled Claude routine runs every Friday: reads new feedback rows from a Google Sheet (via Drive MCP), commits the feedback as MD files to the repo (via GitHub MCP), updates a `learnings.md` file, generates the next issue, and commits `current-issue.md`. GitHub Pages auto-redeploys. The page client-side-renders `current-issue.md` as HTML via `marked.js` (CDN, no build step).

**Tech Stack:**
- GitHub + GitHub Pages (hosting)
- HTML + CSS + vanilla JS (`marked.js` via CDN for markdown rendering)
- Google Forms + Google Sheets (feedback intake)
- Anthropic scheduled agent ("routine"), created via the `schedule` skill
- GitHub MCP connector (claude.ai → Connectors)
- Google Drive MCP (already connected)
- `gh` CLI (local GitHub ops)

**Spec reference:** `docs/superpowers/specs/2026-05-11-recruiting-newsletter-design.md`

---

## Verification Protocol

This plan executes under explicit self-review discipline. Every checkpoint has a defined verifier and a defined trigger for re-doing the work.

### Before execution starts
- Cold-read the plan, identify ambiguities, mismatches, or unmet assumptions.
- Report findings to the user before kicking off Task 1.
- Fix issues inline.

### After each subagent task (Phase A)
- Subagent reports completion.
- Orchestrator (Claude, main session) verifies by:
  - Reading every file the task created or modified — not trusting the subagent's word.
  - Confirming each file's content matches what the task specified (line-by-line for short files; sampling for long ones).
  - Running any verification command the task lists (`git status`, `git log -1`, `curl localhost:8080`, etc.).
  - Confirming the commit exists with the stated message: `git log -1 --pretty=format:"%s"`.
- If anything is off: dispatch a follow-up subagent with the specific fix, then re-verify.

### After human tasks (Phase B)
- User reports completion (provides Form URL, confirms connector enabled).
- Orchestrator verifies:
  - Form URL responds 200 OK and points to the right form.
  - GitHub MCP tools (`mcp__claude_ai_GitHub__*`) are listed in the current tool surface.

### On the routine setup (Task 7)
- Orchestrator drives via `schedule` skill.
- Verifies the routine exists, is paused, has correct cron + timezone, has the correct prompt body, has GitHub + Drive connectors selected.

### On the preview issue (Task 8)
- Orchestrator reads the entire generated `current-issue.md` after the routine commits.
- Runs an independent quality scan:
  - **Structure:** all 10 sections accounted for (skipped sections clearly absent, not stubs).
  - **Word count:** 900-1,100 on a full-content week.
  - **Writing rules violations:** grep-scan for every forbidden term in `ai-writing-rules.md` (`quietly`, `deeply`, `fundamentally`, `tapestry`, `landscape`, `paradigm`, `ecosystem`, `serves as`, `stands as`, `delve`, `leverage`, `utilize`, `robust`, `streamline`, `harness`, `certainly`, "It's not", "Not X. Not Y."). 0-2 hits is acceptable; 3+ triggers prompt hardening + re-run.
  - **Source quality:** every cited link resolves (HTTP HEAD check on a sample); no obvious hallucinated outlets.
  - **"So What" specificity:** the section names specific companies/services/prices/segments, not generic platitudes. If it says "agencies should adapt to AI" rather than "Pitch X service to clients in segment Y who raised this week", the section is generic — re-run.
  - **Feedback handling:** confirm `feedback/raw/` contains a file for the test submission and the Sheet's Processed column was marked.
- Report findings to the user concisely. The user does not need to approve, but knows what was checked.
- If quality fails: harden the routine prompt, re-run, re-verify. Do not arm the schedule until quality passes.

### After arming (Task 9)
- Orchestrator confirms the routine's next-run timestamp matches the upcoming Friday at 5pm PT.
- A 1-week and 4-week calendar reminder are created (post-launch verification).

---

## Execution Roles

This plan has three execution phases, each with a different driver. The phases run sequentially.

| Phase | Tasks | Driver | Why |
|-------|-------|--------|-----|
| A | 1, 2, 3, 4 | Subagent (dispatched per task) | Pure local filesystem + `gh` CLI; fully autonomous. |
| B | 5, 6 | User (browser actions) | Google Forms creation and claude.ai connector setup require browser interaction; not automatable. |
| C | 7, 8, 9 | Claude (main session) | Uses the `schedule` skill (available in this session). Quality review runs here. |

Between phases, the orchestrator pauses and either dispatches the next subagent or asks the user to perform the next manual step.

---

## Prerequisites

Verify these before starting. If any aren't met, resolve before Task 1.

- [ ] You have a GitHub account (visit https://github.com — should show your dashboard).
- [ ] `gh` CLI is installed and authenticated:
  - Install: `brew install gh`
  - Auth: `gh auth login` → GitHub.com → HTTPS → authenticate via browser
  - Verify: `gh auth status` shows `✓ Logged in to github.com`
- [ ] Google Drive MCP is already connected to your Claude account (confirmed: `mcp__claude_ai_Google_Drive__*` tools available in current session).
- [ ] You can spend ~5 minutes at https://claude.ai → Settings → Connectors to add the GitHub connector when we reach Task 6.

---

## File Structure

By the end of implementation, `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/` (which doubles as the local clone of the GitHub repo) will look like:

```
.
├── .gitignore
├── README.md                ← project overview
├── ai-writing-rules.md      ← style guide (exists)
├── current-issue.md         ← latest newsletter content (routine overwrites)
├── learnings.md             ← feedback-derived rules (routine appends)
├── index.html               ← the page entry point
├── style.css                ← styling
├── render.js                ← fetches + renders current-issue.md
├── feedback/
│   └── raw/
│       └── .gitkeep         ← keeps the folder tracked
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-05-11-recruiting-newsletter-design.md  (exists)
        ├── plans/
        │   └── 2026-05-11-recruiting-newsletter-plan.md    (this file)
        └── routine-prompt.md
```

GitHub Pages serves from repo root. Nothing in `docs/` is linked from `index.html`, so internal docs stay private-by-obscurity.

---

## Task 1: Initialize local git repo

**Files:**
- Create: `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/.gitignore`
- Init: git repo in `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/`

- [ ] **Step 1: Initialize git on main**

```bash
cd "/Users/takunoguchi/Documents/Recruiting Newsletter Agent"
git init -b main
```

Expected: `Initialized empty Git repository in /Users/takunoguchi/Documents/Recruiting Newsletter Agent/.git/`

- [ ] **Step 2: Create .gitignore**

Write to `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/.gitignore`:

```
.DS_Store
*.swp
*.tmp
node_modules/
.vscode/
```

- [ ] **Step 3: Verify clean state**

```bash
git status
```

Expected: shows `.gitignore`, `ai-writing-rules.md`, and `docs/` as untracked.

- [ ] **Step 4: Initial commit**

```bash
git add .gitignore ai-writing-rules.md docs/
git commit -m "chore: initialize repo with style guide and spec"
```

Expected: 1 commit, files committed.

---

## Task 2: Create content scaffolding

**Files:**
- Create: `current-issue.md`
- Create: `learnings.md`
- Create: `feedback/raw/.gitkeep`
- Create: `README.md`

- [ ] **Step 1: Create placeholder current-issue.md**

Write to `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/current-issue.md`:

```markdown
# The Recruiting Wire

*Week of — first issue lands Friday at 5pm PT*

This page publishes a weekly digest of the recruiting industry — tech recruiting and AI innovations specifically — every Friday at 5pm PT.

The first generated issue will appear after the routine's first scheduled run.

In the meantime, you can submit a thought, a wish, or a complaint via the Feedback button in the top-right.
```

- [ ] **Step 2: Create learnings.md scaffold**

Write to `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/learnings.md`:

```markdown
# Newsletter Learnings — Persistent Rules from Feedback

This file is the durable, synthesized memory of feedback. The generation routine reads this file every Friday and incorporates these rules into the issue it drafts.

**How this file gets updated:** After each Friday run, the routine reads new feedback rows from the Google Form's response Sheet, extracts durable rules, and appends them here with the date learned. Raw feedback is preserved in `feedback/raw/` forever; this file is the working memory.

**Format:** Each rule is a one-line bullet. Include the date the rule was learned, in parentheses, so we can sunset stale ones.

---

## Active rules

_(none yet — this file will be populated by the routine after the first feedback submission)_

---

## Retired rules

_(rules that no longer apply, kept for context)_
```

- [ ] **Step 3: Create feedback folder structure**

```bash
cd "/Users/takunoguchi/Documents/Recruiting Newsletter Agent"
mkdir -p feedback/raw
touch feedback/raw/.gitkeep
```

- [ ] **Step 4: Create README**

Write to `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/README.md`:

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add current-issue.md learnings.md feedback/raw/.gitkeep README.md
git commit -m "chore: scaffold content files and README"
```

---

## Task 3: Build the static page

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `render.js`

- [ ] **Step 1: Create index.html**

Write to `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Recruiting Wire</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js"></script>
</head>
<body>
  <header>
    <a href="#" id="feedback-btn" class="feedback-btn" target="_blank" rel="noopener">Feedback</a>
  </header>
  <main id="content">
    <p class="loading">Loading…</p>
  </main>
  <script src="render.js"></script>
</body>
</html>
```

The `href="#"` on the feedback button is a placeholder. Task 5 replaces it with the Google Form URL.

- [ ] **Step 2: Create style.css**

Write to `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/style.css`:

```css
:root {
  --bg: #fafaf7;
  --text: #1a1a1a;
  --accent: #c8551e;
  --muted: #6b6b6b;
  --border: #e5e5e0;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 18px;
  line-height: 1.6;
}

header {
  position: sticky;
  top: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  z-index: 10;
}

.feedback-btn {
  display: inline-block;
  background: var(--accent);
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  font-weight: 600;
}

.feedback-btn:hover { opacity: 0.9; }

main {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
}

main h1 { font-size: 32px; line-height: 1.2; margin-top: 0; }
main h2 { font-size: 22px; margin-top: 40px; }
main h3 { font-size: 18px; margin-top: 32px; }

main p, main li { font-size: 17px; }
main a { color: var(--accent); }

main code {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 15px;
  background: rgba(0,0,0,0.04);
  padding: 2px 4px;
  border-radius: 2px;
}

.loading { color: var(--muted); font-style: italic; }
```

- [ ] **Step 3: Create render.js**

Write to `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/render.js`:

```javascript
async function loadAndRender() {
  const contentEl = document.getElementById('content');
  try {
    const response = await fetch('current-issue.md?t=' + Date.now());
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const markdown = await response.text();
    contentEl.innerHTML = marked.parse(markdown);
  } catch (err) {
    contentEl.innerHTML = '<p>Could not load the latest issue. Try refreshing.</p>';
    console.error('Failed to load current-issue.md:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadAndRender);
```

The `?t=` cache-buster ensures fresh content after the routine commits.

- [ ] **Step 4: Verify locally**

Run:

```bash
cd "/Users/takunoguchi/Documents/Recruiting Newsletter Agent"
python3 -m http.server 8080
```

Open http://localhost:8080 in a browser.

Expected:
- Page loads.
- A "Feedback" button is visible in the top-right header.
- Body content shows: an H1 "The Recruiting Wire", an italic week-marker line, and the placeholder paragraph text.

If you see "Loading…" indefinitely or "Could not load the latest issue", check the browser console.

Stop the server with `Ctrl-C`.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css render.js
git commit -m "feat: static page with client-side markdown rendering"
```

---

## Task 4: Push to GitHub and enable Pages

**Files:** none (remote-only operations)

- [ ] **Step 1: Create the GitHub repo**

```bash
cd "/Users/takunoguchi/Documents/Recruiting Newsletter Agent"
gh repo create recruiting-wire --public --source=. --remote=origin --description="Weekly auto-generated newsletter on the recruiting industry"
```

Expected output: `✓ Created repository <username>/recruiting-wire on GitHub` and `✓ Added remote https://github.com/<username>/recruiting-wire.git`.

- [ ] **Step 2: Push to GitHub**

```bash
git push -u origin main
```

Expected: pushes the commits to origin/main.

- [ ] **Step 3: Enable GitHub Pages from main branch root**

Use a JSON body via stdin (most reliable for nested objects):

```bash
gh api --method POST "repos/{owner}/{repo}/pages" \
  --input - <<'EOF'
{"source": {"branch": "main", "path": "/"}}
EOF
```

Expected: JSON response containing the Pages URL (something like `https://<username>.github.io/recruiting-wire/`).

**Capture this URL — you'll need it in Step 5.**

Errors and fallbacks:
- "Pages is already enabled" — fine, proceed.
- 422 / 404 / other API failure — fall back to enabling manually at `https://github.com/<username>/recruiting-wire/settings/pages` → Source: "Deploy from a branch", Branch: `main`, Folder: `/ (root)` → Save. Then retrieve the URL via `gh api repos/{owner}/{repo}/pages | jq -r .html_url`.


- [ ] **Step 4: Wait and verify**

Visit the Pages URL in a browser. First deploy can take 1-3 minutes.

Expected: the placeholder page appears (same as the local test) with the Feedback button.

If 404 after 3 minutes: check `Settings → Pages` in the repo UI, confirm source config, wait another minute.

- [ ] **Step 5: Update README with live URL**

Edit `README.md`, replacing `_(URL added after first deploy)_` with the actual Pages URL.

- [ ] **Step 6: Commit and push**

```bash
git add README.md
git commit -m "docs: add live site URL to README"
git push
```

---

## Task 5: Create Google Form and wire up feedback button

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Create the Form**

Open https://forms.google.com → click `+` blank form.

Configure:
- **Title:** `Recruiting Wire — Feedback`
- **Description:** `What worked, what didn't, what to change. The generator reads new responses every Friday and adjusts.`
- **Questions:**
  1. Type: **Paragraph**. Title: `Your feedback`. Required: ✓
  2. Type: **Short answer**. Title: `Your name (optional)`. Required: ✗

- [ ] **Step 2: Link the Form to a Google Sheet**

In the Form editor, click the **Responses** tab → click the green Sheets icon ("Link to Sheets") → "Create a new spreadsheet" → name it `Recruiting Wire — Feedback Responses` → Create.

The Sheet auto-creates with columns: `Timestamp`, `Your feedback`, `Your name (optional)`.

- [ ] **Step 3: Add a Processed column to the Sheet**

Open the Sheet in Drive. In column D (first empty column), add header `Processed`.

This column stays empty until the routine fills it in.

- [ ] **Step 4: Get the public Form URL**

In the Form editor, click **Send** (top-right) → click the link/chain icon → check "Shorten URL" → click "Copy".

Save this URL — you'll paste it into `index.html` next.

- [ ] **Step 5: Wire the feedback button**

Edit `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/index.html`. Find:

```html
<a href="#" id="feedback-btn" class="feedback-btn" target="_blank" rel="noopener">Feedback</a>
```

Replace with (substituting your actual URL):

```html
<a href="https://forms.gle/YOUR_FORM_SHORT_CODE" id="feedback-btn" class="feedback-btn" target="_blank" rel="noopener">Feedback</a>
```

- [ ] **Step 6: Verify the button works locally**

```bash
cd "/Users/takunoguchi/Documents/Recruiting Newsletter Agent"
python3 -m http.server 8080
```

Open http://localhost:8080 → click Feedback.

Expected: opens the Google Form in a new tab.

Stop the server.

- [ ] **Step 7: Commit and push**

```bash
git add index.html
git commit -m "feat: wire feedback button to Google Form"
git push
```

- [ ] **Step 8: Verify on the live site**

After ~1 minute, visit the GitHub Pages URL. Click Feedback. The Form should open.

- [ ] **Step 9: Submit one test feedback row**

Submit a test entry: `Test feedback — please ignore. The page looks readable.`

Open the Sheet. Verify a row appeared with your test text.

This row will be processed by the routine on its first run (Task 8).

---

## Task 6: Connect GitHub MCP to Claude

**Files:** none

- [ ] **Step 1: Add the GitHub connector**

Open https://claude.ai → profile menu → **Settings** → **Connectors** → "Add connector".

Find **GitHub** → click Add → authorize → on the GitHub OAuth screen, restrict access to **Only select repositories** → choose `recruiting-wire` → install.

(Avoid granting "All repositories" unless you specifically want Claude able to touch all of them.)

- [ ] **Step 2: Verify the GitHub MCP is available**

Open a new Claude conversation. Ask: "List the GitHub MCP tools available to you."

Expected: tools prefixed `mcp__claude_ai_GitHub__*` appear (e.g., `create_or_update_file`, `get_file_contents`, `list_commits`).

If they don't appear: re-check the connector is enabled and refresh.

---

## Task 7: Create the scheduled routine

**Files:**
- Create: `docs/superpowers/routine-prompt.md`

- [ ] **Step 1: Write the routine prompt to the repo**

First derive the GitHub username so the prompt has the real value baked in:

```bash
GH_USER=$(gh api user --jq .login)
echo "$GH_USER"
```

Capture the output (e.g., `takunoguchi`). When writing the prompt file, substitute `<GITHUB-USERNAME>` with this value.

Write to `/Users/takunoguchi/Documents/Recruiting Newsletter Agent/docs/superpowers/routine-prompt.md` (with `<GITHUB-USERNAME>` replaced):

````markdown
# Routine Prompt — The Recruiting Wire

This is the prompt used by the scheduled Claude routine that publishes The Recruiting Wire every Friday at 5pm PT.

---

You are publishing this week's issue of "The Recruiting Wire," a weekly newsletter on the recruiting industry. Work through the steps below in order.

## Repo

GitHub repo: `<GITHUB-USERNAME>/recruiting-wire` (branch `main`).

Use the GitHub MCP for all repo reads/writes. Use Google Drive MCP for reading the feedback Sheet.

## Step 1 — Read style and learnings

Fetch from the repo:
- `ai-writing-rules.md` — mandatory writing rules. Honor these strictly.
- `learnings.md` — durable rules learned from past feedback. Honor these as well.

## Step 2 — Ingest new feedback

Find the Google Sheet titled `Recruiting Wire — Feedback Responses` in Google Drive (via Drive MCP).

Read all rows where the `Processed` column is empty.

For each unprocessed row:

1. Create a file at `feedback/raw/YYYY-MM-DD-<short-id>.md` in the repo (use a 6-char hash of the timestamp+feedback as the short-id). Body:
   ```
   ---
   submitted_at: <timestamp from sheet>
   submitted_by: <name or "anonymous">
   ---

   <feedback body verbatim>
   ```
   Commit via GitHub MCP with message: `feedback: capture submission YYYY-MM-DD-<short-id>`.

2. Mark the Sheet row's `Processed` column with `Processed YYYY-MM-DD` so it isn't re-ingested next week.

Then read all newly captured feedback and decide which contain **durable** rules (persistent style or content preferences) vs. one-off comments.

Append each durable rule as a bullet in `learnings.md` under "Active rules", with the date learned in parentheses, e.g.:

```
- Lead with strategic implications, not news (2026-05-23)
```

Commit `learnings.md` with message: `learnings: update from feedback YYYY-MM-DD`.

## Step 3 — Generate this week's issue

Use web search to gather the past 7 days of news across these source layers, in priority order:

1. **Trusted backbone** (always check): Josh Bersin (joshbersin.com), Recruiting Brainfood (Hung Lee), ERE Media, HR Brew, SHRM, TechCrunch, The Information, LinkedIn Talent Blog, well-funded HR-tech vendor blogs, Layoffs.fyi, Levels.fyi, Pave.
2. **Aggregator layer**: Google News topic queries (`"AI recruiting"`, `"tech hiring layoffs"`, `"HR tech funding"`, `"tech compensation"`, `"AI hiring lawsuit"`), Techmeme, Hacker News, Bloomberg/WSJ/NYT/Reuters tech & labor coverage, Crunchbase News, PitchBook News.
3. **Discovery (open web)**: fill remaining gaps, filtering to established outlets and people/companies with real market traction (followers, named customers, raised material capital).

**Exclude:** vendor-paid placements, "Top 10" listicles, single-source claims on major moves (M&A, layoffs), pre-launch vapor.

Draft the issue in markdown, following this structure exactly. **Skip any section with fewer than 2 strong items — do not pad.** "The Week in One Paragraph" and "So What — Strategic Implications" are required; they shrink but never disappear.

```
# The Recruiting Wire

*Week of <Mon date>–<Fri date>*

## 📌 The Week in One Paragraph
[2-3 sentences naming the theme of the week. Pure synthesis, no items.]

## 🤖 AI in Recruiting
- [item — 2-3 sentence summary] — [source link]

## 💼 Tech Hiring & Roles in Demand
- [item]

## 📈 Funding & Hiring Signals
- [item]

## 📉 Layoffs & Talent Released
- [item]

## 💰 Compensation
- [item]

## 🗣️ Quotes & Threads Worth Reading
- "[quote]" — [author], [where]. [Why it matters in 1 line.] [source link]

## ⚙️ AI Workflow Automation Ideas
- [1-2 concrete plays the team could try this week]

## 🎯 So What — Strategic Implications for Us
[2-3 short paragraphs of strategic moves the agency should make. Be specific: pricing, pitches, sourcing targets, services to push.]

## 🔗 Sources Scanned This Week
- [source]
```

Target length: 900-1,100 words on a full-content week.

## Step 4 — Self-check against writing rules

Re-read the draft. Flag any of these (drawn from `ai-writing-rules.md`):

- `"It's not X — it's Y"` and related negative parallelism / em-dash dismissals
- Magic adverbs: `quietly`, `deeply`, `fundamentally`, `remarkably`, `arguably`
- Ornate nouns: `tapestry`, `landscape`, `paradigm`, `ecosystem`, `framework`, `synergy`
- The "serves as" / "stands as" / "marks" / "represents" dodge
- "The X? A Y." rhetorical question pattern
- "Not X. Not Y. Just Z." dramatic-countdown pattern
- Anaphora abuse (repeated sentence openings)
- AI-vocabulary tells: `delve`, `leverage` (verb), `utilize`, `robust`, `streamline`, `harness`, `certainly`

Rewrite any flagged sentence.

## Step 5 — Publish

Overwrite `current-issue.md` in the repo with the final draft. Commit message: `issue: publish week of YYYY-MM-DD`.

## Step 6 — Report

End your run with a summary:
- Feedback rows processed: N
- Rules added to learnings.md: N
- Target word count vs. actual: 900-1,100 / <actual>
- Sections omitted under no-padding rule: <list or "none">
- Commits made: <list with SHAs if available>

If any step failed (e.g., GitHub commit error, Drive read error), report the error clearly and do not silently proceed.
````

- [ ] **Step 2: Commit the routine prompt**

```bash
git add docs/superpowers/routine-prompt.md
git commit -m "docs: routine prompt for scheduled agent"
git push
```

- [ ] **Step 3: Create the scheduled routine via the `schedule` skill**

In Claude, invoke the `schedule` skill (type `/schedule` or ask Claude to use it).

When prompted, provide:

- **Name:** `Recruiting Wire weekly publish`
- **Cron:** `0 17 * * 5`
- **Timezone:** `America/Los_Angeles`
- **Required connectors / tools:** GitHub MCP (for repo `<your-username>/recruiting-wire`), Google Drive MCP, web search
- **Prompt:** paste the entire body of `docs/superpowers/routine-prompt.md` (replacing `<GITHUB-USERNAME>` with your actual username if you haven't already)
- **Initial state:** paused / not armed (we'll do a preview run before arming)

If the schedule skill doesn't support an initial paused state, complete creation and immediately pause the routine before it has a chance to fire.

- [ ] **Step 4: Verify the routine exists and is paused**

Use the `schedule` skill to list routines. Confirm:
- The new routine is present.
- Status is paused / not armed.
- Cron and timezone match.

---

## Task 8: Preview run and quality check

**Files:**
- Verify: `current-issue.md` (updated by routine)
- Verify: `feedback/raw/<some file>.md` (created by routine)
- Verify: `learnings.md` (possibly updated)

- [ ] **Step 1: Trigger the routine manually**

Use the `schedule` skill to run the routine on-demand (most schedule implementations have a "run now" / "trigger" command).

Expected duration: 3-10 minutes (web search + drafting + multiple commits).

- [ ] **Step 2: Watch the routine's run logs**

The `schedule` skill should expose logs. Confirm in order:

1. Routine fetched `ai-writing-rules.md` and `learnings.md` from the repo. ✓
2. Routine read the Google Sheet and found 1 unprocessed row (the test feedback from Task 5 Step 9). ✓
3. Routine committed a file under `feedback/raw/`. ✓
4. Routine marked the Sheet row's `Processed` column. ✓
5. Routine generated the issue and committed `current-issue.md`. ✓
6. Routine reported a summary.

If any step failed, read the error, patch the routine prompt or the routine's tool access, and re-run.

- [ ] **Step 3: Verify the live site updated**

After the final commit, wait ~1 minute for GitHub Pages to redeploy. Visit the Pages URL.

Expected: the page shows the freshly generated issue, not the placeholder.

- [ ] **Step 4: Quality-check the issue**

Read the entire issue. Check:

- Does each surviving section have substantive content? Were thin sections omitted (not padded)?
- Are sources cited with real links?
- Is the voice expert peer-to-peer (no hype, no "explaining what an ATS is")?
- Does the "So What" section give specific moves, not platitudes?
- Word count 900-1,100 on a full-content week?

Then scan specifically for writing-rule violations:

- "quietly" / "deeply" / "fundamentally" / "remarkably"
- "tapestry" / "landscape" / "paradigm" / "ecosystem"
- "It's not X — it's Y" / "Not X. Not Y. Just Z."
- "serves as" / "stands as" / "marks"
- "The X? A Y."
- "delve" / "leverage" / "utilize" / "robust" / "streamline"

Acceptance bar: **0-2 violations is acceptable**. 3+ means harden the prompt before arming the schedule.

- [ ] **Step 5: Verify the feedback file in the repo**

Browse the GitHub repo's `feedback/raw/` folder (in the GitHub web UI or `git pull` and view locally). Confirm an MD file exists for the test feedback submitted in Task 5.

- [ ] **Step 6: Verify learnings.md handling**

If the test feedback was trivial ("Test feedback — please ignore..."), `learnings.md` should NOT have a new rule.

If the routine added a rule from trivial feedback, that's a prompt issue — the routine is over-eager. Note it for prompt hardening.

- [ ] **Step 7: If issues found, harden the prompt and re-run**

If quality is below the bar:

1. Edit `docs/superpowers/routine-prompt.md` to fix the specific issues (e.g., add explicit examples of rules the routine should NOT extract from trivial feedback).
2. Commit and push.
3. Re-paste the updated prompt into the routine via the `schedule` skill.
4. Re-run from Step 1.

Repeat until quality is acceptable.

---

## Task 9: Arm the schedule

**Files:** none

- [ ] **Step 1: Enable the recurring schedule**

Use the `schedule` skill to set the routine to active / armed.

- [ ] **Step 2: Confirm next run time**

Ask the `schedule` skill for the routine's next run. Expected: the upcoming Friday at 5pm PT.

- [ ] **Step 3: Create calendar reminders**

In Google Calendar (via the connector, or manually), create two events:

1. **First-fire check** — upcoming Friday at 5:15pm PT, titled `Check that The Recruiting Wire published`. Confirms the first scheduled run worked.
2. **4-week retrospective** — 4 Fridays from now at 5:30pm PT, titled `Recruiting Wire 4-week retro` with body referencing the spec's success criteria (Taku reads it most weeks, URL shared with a colleague, at least one strategic implication influenced a real decision, no-padding rule holding). This is the spec's evaluation gate — if criteria aren't met, re-scope rather than tune.

- [ ] **Step 4: Final review**

```bash
cd "/Users/takunoguchi/Documents/Recruiting Newsletter Agent"
git log --oneline -15
```

Expected: clean commit history showing the build.

The newsletter is live and the schedule is armed.

---

## Contingencies (if blockers appear during execution)

**Contingency 1: GitHub MCP is not callable from a scheduled routine**

The scheduled routine sandbox may not have access to MCPs the same way interactive Claude does. Discover this in Task 7 Step 3 (the schedule skill should let you select connectors; if GitHub is not selectable, this contingency triggers).

**Fallback:** the routine writes the issue + feedback files to a Google Drive folder (since Drive MCP is known to work). A small GitHub Action runs on a 10-minute schedule, pulls the latest files from Drive (using `rclone` or the Drive API), and commits them to the repo. Adds one moving piece but unblocks delivery.

If this contingency triggers, write a follow-up plan for the GitHub Action sync before continuing.

**Contingency 2: Drive MCP is not callable from a scheduled routine**

Same risk as GitHub MCP. Verify in Task 7 Step 3.

**Fallback:** use a different feedback intake — e.g., GitHub Issues on the repo. The page's Feedback button links to "Open a new issue" on GitHub. The routine reads open Issues via GitHub MCP, captures them, closes them. Requires GitHub login from feedback submitters, which slightly raises friction.

**Contingency 3: GitHub Pages 404s or fails to deploy**

Check repo `Settings → Pages`. Confirm source is `Deploy from a branch`, branch `main`, folder `/ (root)`. If a GitHub Action workflow error appears in the Actions tab, read it and fix.

If Pages refuses to serve from main root (rare): create a `gh-pages` branch and point Pages there, or move the site into a `/docs/` folder and configure Pages to serve from `/docs/` instead (will require updating internal paths in `index.html`).

**Contingency 4: marked.js CDN is unreachable**

Some networks block CDNs. If the page shows "Could not load the latest issue" but `current-issue.md` exists:

Replace the `<script src="https://cdn.jsdelivr.net/...">` line in `index.html` with a vendored copy: download `marked.min.js` into the repo as `vendor/marked.min.js` and reference it locally. Adds a tiny bit of repo size but removes the CDN dependency.

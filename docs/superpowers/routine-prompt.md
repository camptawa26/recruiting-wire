# Routine Prompt — The Recruiting Wire

This is the prompt used by the scheduled Claude routine that publishes The Recruiting Wire every Friday at 5pm PT.

---

You are publishing this week's issue of "The Recruiting Wire," a weekly newsletter on the recruiting industry. Work through the steps below in order.

## Repo

GitHub repo: `camptawa26/recruiting-wire` (branch `main`).

The repo is **auto-cloned into your working directory** at the start of the run (via the routine's `sources` config). Use `git` CLI via the **Bash** tool for all repo reads/writes — do not use GitHub MCP.

Before your first commit, configure the git author (skip silently if already set):

```bash
git config user.email "recruiting-wire-bot@users.noreply.github.com"
git config user.name "Recruiting Wire Routine"
```

Use Google Drive MCP for reading the feedback Sheet.

## Step 1 — Read style and learnings

`cd` into the cloned repo directory if you aren't already in it. Then read these files (they're already on disk after the clone — no API call needed):

- `ai-writing-rules.md` — mandatory writing rules. Honor these strictly.
- `learnings.md` — durable rules learned from past feedback. Honor these as well.

## Step 2 — Ingest new feedback

Find the Google Sheet titled `Recruiting Wire — Feedback Responses` in Google Drive (via Drive MCP).

Read all rows where the `Processed` column is empty.

For each unprocessed row:

1. Create a file at `feedback/raw/YYYY-MM-DD-<short-id>.md` in the local clone (use a 6-char hash of the timestamp+feedback as the short-id). Body:
   ```
   ---
   submitted_at: <timestamp from sheet>
   ---

   <feedback body verbatim>
   ```
   Then commit + push:
   ```bash
   git add feedback/raw/YYYY-MM-DD-<short-id>.md
   git commit -m "feedback: capture submission YYYY-MM-DD-<short-id>"
   git push origin main
   ```

2. Mark the Sheet row's `Processed` column with `Processed YYYY-MM-DD` so it isn't re-ingested next week.

Then read all newly captured feedback and decide which contain **durable** rules (persistent style or content preferences) vs. one-off comments.

Append each durable rule as a bullet in `learnings.md` under "Active rules", with the date learned in parentheses, e.g.:

```
- Lead with strategic implications, not news (2026-05-23)
```

Then commit + push:
```bash
git add learnings.md
git commit -m "learnings: update from feedback YYYY-MM-DD"
git push origin main
```

Do NOT extract rules from trivial feedback (e.g., "Test", "looks good", "ignore"). If the feedback is not actionable as a persistent guideline, only file it in `raw/` and do not touch `learnings.md`.

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

## 🧰 Promising AI Tools to Test
- [Tool name with link] — what it does in 1 line. Signal: [funding, named customers, recruiter-community traction, or domain-deep founders]. Test recommendation: [specific role/workflow to pilot it on].

## 🎯 Strategic Implications
- [punchy 1-line implication]
- [...]
- [3-5 items total]

## 🔗 Sources Scanned This Week
- [source]
```

Target length: 900-1,100 words on a full-content week.

### Section-specific rules

**🧰 Promising AI Tools to Test — strict filter.** Include 1-3 tools per week, max. ONLY include a tool if it clears at least one of these signal bars:
- Series A or later funding from a reputable VC (a16z, Sequoia, Greylock, Index, Accel, USV, Founders Fund, Bessemer, Kleiner, Insight, Tiger, Khosla, GV, Benchmark) within the past 12 months
- Named enterprise customers at companies with >500 employees (not pilots, not "logo on the website" without proof)
- Recurring discussion in trusted recruiter-community sources: Hung Lee's Brainfood, Tim Sackett, People Engineers newsletter, ERE, established recruiting Slacks/subreddits
- Founders with deep recruiting domain experience (e.g., ex-head of TA at a large company, repeat HR-tech founder)

DO NOT include: pre-launch tools, waitlist-stage products, undifferentiated Chrome-extension AI sourcing plugins, tools without named customers, "AI for X" press releases that are mostly marketing, products that just bolted "AI" onto an existing tool name.

If no tool clears the bar this week, **skip the section entirely** — do not pad with marginal picks. A skipped section is the correct outcome more weeks than not. The whole point of this section is signal, not coverage.

**🎯 Strategic Implications — formatting and tone.** 3-5 punchy single-line bullets. Each one names a specific, concrete move the agency should make this week or this month. Good examples:
- "Pitch <service line> to <segment> clients who raised in Funding section this week"
- "Reprice retainers for AI-engineer placements +5-8% given the 9% comp shift"
- "Send a 1-page note to hiring managers about the Eightfold suit by Friday — they don't know about it yet"

Avoid generic platitudes. Skip "stay aware of trends", "consider new approaches", "monitor the landscape" — those are filler. Each bullet should be specific enough to put on a Monday agency standup agenda.

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

Overwrite `current-issue.md` in the local clone with the final draft. Then commit + push:

```bash
git add current-issue.md
git commit -m "issue: publish week of YYYY-MM-DD"
git push origin main
```

## Step 6 — Report

End your run with a summary:
- Feedback rows processed: N
- Rules added to learnings.md: N
- Target word count vs. actual: 900-1,100 / <actual>
- Sections omitted under no-padding rule: <list or "none">
- Commits made: <list with SHAs from `git rev-parse HEAD` after each commit>

If any step failed (e.g., git push auth error, Drive read error), report the error verbatim and do not silently proceed. In particular, if `git push` fails with an auth error on the first commit, stop and report — that's the signal to pivot the architecture.

# Layout-Match Redesign — bring every page up to the artifact's real source

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.
> **Plan style (owner pref):** files + interfaces + verify intent + commits; **no inline code bodies** — the
> reference files in `docs/redesign/reference/` ARE the code. Each task points at its reference file +
> `DESIGN-GUIDE.md` section + the Definition-of-Done checklist. Do not duplicate reference code into this plan.

**Goal:** Rebuild every page's **layout** (markup structure + CSS classes) to match the redesigned artifact,
whose *actual working source* now lives in `docs/redesign/reference/`. The earlier pass only recolored the old
layouts; this pass replaces how each page presents information — clean `.dt` tables, boxed sections, hero cards,
step bars, structured documentation — exactly as the reference renders it.

**Architecture:** The reference is a single-`DATA`-object vanilla monolith (`tokens.css` + `base.css` +
`views.css` + `charts.js` + `app.js` + five `view-*.js` renderers). Our prototype is per-view ES modules with
real data plumbing (`lib/store.js`, dept JSON, `data/*.json`). We **lift the reference's CSS classes and markup
structure and wire them to OUR data** — we never copy the reference `DATA` object. Foundation (CSS + shell +
charts) is ported once so **no per-view task touches `styles.css`**; each view task then rebuilds only its own
`views/*.js` markup to emit the ported classes.

**Tech Stack:** Vanilla ES modules, no build step, no deps; single `styles.css`; `serve.py` on :8770; Node test
runner. Fonts via Google Fonts `<link>` in `index.html` (the prototype is served locally, not CSP-locked) with a
system-stack fallback.

## Source of truth (read before every task)
- `docs/redesign/DESIGN-GUIDE.md` — the master guide (foundations, shell, component vocabulary, chart rules,
  per-page instructions §5.1–5.9, Definition-of-Done §6, anti-pattern list).
- `docs/redesign/reference/README.md` — maps each reference file to what to lift from it.
- `docs/redesign/reference/*` — the artifact's real source. **Class names + markup structure are the spec.**

## Global Constraints (every task inherits these)
- **Match the reference layout** — the markup structure, class names, and section order in the matching
  `reference/view-*.js` + the DESIGN-GUIDE per-page section are the spec. Rebuild markup to match; do not
  preserve old layout scaffolding.
- **Our data, reference structure** — keep our data plumbing (`lib/store.js`, `lib/*`, `data/*.json`,
  `resolvePersona`, hash router, `buildDeptContext`, accountability/comments stores). Never import or hardcode the
  reference `DATA` object. Zero invented data — render only what our JSON/stores actually contain; if the
  reference shows a field we don't have, omit it or use our real value, never fabricate.
- **Behavior/data/logic preserved** — `node --test tests/*.test.mjs` stays **green (174/174 or higher)** on every
  task. Existing interactions (drill, deep-links, comment threads, red-KPI response loop, 8-step advance, ODG
  gate) keep working.
- **Design tokens only** — no stray hex/gray in component CSS; every color/space/radius/shadow references a token
  already defined in `:root`. RAG hues (`--green/amber/red/info` + `-bg/-border/-text`) are **status-only**, never
  decorative. Charts use the **viz palette only** — never a status hue as a line color, never blue `#3b82f6`.
- **Verification is STATIC for subagents** — `node --check` on every changed JS file, `node --test tests/*.test.mjs`
  green, and `grep` assertions that the required classes/structure are present and that anti-patterns are absent.
  **No Playwright/browser-verify inside subagents** (they stall). The controller runs a browser pass at the end;
  the owner does the aesthetic review.
- **Anti-patterns to remove** (DESIGN-GUIDE §6): dark navy rail; emoji/glyph nav icons (`◎ ◆ ⚑ ≣ ⛁ ◇`); blue
  default accents; colored 4px left-borders as the primary KPI status signal; mono font for hero numbers; "AI
  content ready" placeholder boxes; banner boxes restating what a chip can say; italic table columns; centered
  page-level buttons; >3 font weights fighting on one screen.

## File-role mapping (our views ↔ reference renderer)
| Our file | Reference renderer + guide § | Notes |
|---|---|---|
| `app.js` `renderLayout` | `reference/app.js` `renderShell` + §2 | dark rail → light sidebar; SVG nav; topbar; inbox popover; deep-link params |
| `lib/charts.js` | `reference/charts.js` + §4 | port helpers to the dataviz spec |
| `views/overview.js` | `view-overview.js` + §5.1 | hero red-KPI + Mark thread + stat tiles |
| `views/kpi.js`, `views/teamboard.js`, `views/teamboard-location.js` | `view-kpi.js` + §5.2 | our 3-level board drill; apply the one KPI-Boards idiom across all levels |
| `views/hoshin.js` (NEW) | `view-hoshin.js` + §5.3 | objective cards + activity tables; `hoshinStrip()`/`hoshinChips()` consumed by boards |
| `views/problemsolving.js` (tracker) | `view-solve.js` tracker + §5.4 | AI-draft banner + `.step-track` table |
| `views/problemsolving.js` (8-step A3) | `view-solve.js` `renderKz346`/`stepBody` + §5.5 | `.kz-meta`, horizontal step bar, per-step bodies, Mark assist |
| `views/standardwork.js` | `view-rest.js` (Standard Work) + §5.6 | library table + SOP detail; fix the 5 named problems |
| `views/sources.js` | `view-rest.js` (Sources) + §5.7 | summary + amber banner + by-source cards + 3-node flow |
| `views/askmark.js` | `view-rest.js` (Ask Mark) + §5.8 | chat-first grid, q-cards, threads, response modal |
| `views/myday.js`, `views/myboard.js`, `views/odg-hub.js`, `views/login.js` | `view-rest.js` (My Day) + §5.9 | headline hero, driver grid, reason composer; login re-skin |

---

## Phase 1 — Foundation (CSS + shell + charts). Sequential; all touch shared files.

### Task 1: Fonts — Lora / Inter / JetBrains Mono
**Files:** `index.html` (add the Google Fonts `<link>`), `styles.css` (confirm `--font-serif/-sans/-mono` wired;
remove any prior IBM Plex reference).
**Interfaces:** Produces: Lora (500/600 + 500 italic), Inter (400–700), JetBrains Mono (400/500) available to all
views; `body` renders Inter, `h1/h2` render Lora, mono chips render JetBrains Mono.
- [ ] Add the three families (Google Fonts link; keep the system-stack fallback already in the font tokens).
  Remove any IBM Plex/old font link.
- [ ] Verify: `grep` shows the three families requested in `index.html`; `node --test tests/*.test.mjs` green.
- [ ] Commit: `feat(style): load Lora/Inter/JetBrains Mono`.

### Task 2: Reconcile the token layer with `reference/tokens.css`
**Files:** `styles.css` (`:root` block).
**Interfaces:** Produces: a `:root` that is a superset of `reference/tokens.css` — every token `base.css`/`views.css`
reference (`--sidebar-*`, `--width-content`, `--top-bar-height`, `--sp-*`, `--shadow-xs/-ring`, `--table-header-bg`,
`--text-disabled`, `--viz-*`, `--ring`) resolves.
- [ ] Diff our `:root` against `reference/tokens.css`; add any missing token; **delete the dead dark-rail tokens**
  (`--ink-900/800/700/600`, `--rail-fg`, `--rail-fg-bright`, `--rail-line`) and any `--surface-card` alias only the
  old rail used. Keep values identical to the reference where both define a token.
- [ ] Verify: `grep -c` confirms each token used in `reference/base.css` + `reference/views.css` exists in
  `styles.css`; no `--ink-`/`--rail-` remain; tests green.
- [ ] Commit: `feat(style): reconcile tokens with artifact reference; drop dead rail tokens`.

### Task 3: Port base component CSS (`reference/base.css`)
**Files:** `styles.css`.
**Interfaces:** Produces the shared component classes verbatim from `reference/base.css`: `.running-head`, shell
(`.shell`, `.content-area`, `.canvas`, `.sidebar`, `.brand*`, `.dept-block*`, `.nav`, `.nav-item`, `.sidebar__footer`,
`.persona*`, `.signout`), `.topbar`/`.crumb`/`.topbar__search`/`.rollup-tag`, `.btn` + variants + `.icon-btn`,
`.badge` + tones, `.card`/`--pad`/`--interactive`, `.table-wrap`/`.table-scroll`/`table.dt`, `.seg`/`.seg__item`,
`.input`, `.page-head*`, `.section-head`, chart bits (`.spark`,`.chart-tip`,`.legend*`), `.popover`/`.drawer`,
utilities (`.muted`,`.faint`,`.tnum`,`.grid`,`.flex`,`.hidden`).
- [ ] Port `reference/base.css` into `styles.css`. **Remove old conflicting component rules** that styled the dark
  rail / old buttons / old tables so nothing double-defines. Keep only token-referencing values.
- [ ] Verify: `node --check` (n/a for CSS) → `grep` confirms `.sidebar`, `.nav-item`, `.btn--primary`, `table.dt`,
  `.page-head`, `.badge--red` present and no `.rail-link`/`--ink-` rules remain; tests green.
- [ ] Commit: `feat(style): port base component CSS (shell/buttons/badges/cards/dt/seg)`.

### Task 4: Port view-component CSS (`reference/views.css`)
**Files:** `styles.css`.
**Interfaces:** Produces every view-specific class the per-view tasks will emit: `.hero-kpi*`, `.stat-grid`/`.stat-tile*`,
`.ai-note*`, `.source-note`, `.board-hint`, KPI-board rows/`.status-cell`/`.chip`/`.hoshin-chip`/expandable rows,
`.step-track`, AI-draft banner, `.kz-meta`, `.step-bar*`, A3 grids/callouts/`.whys*`, score-entry matrix,
`.chart-fig`/`illustrative`, `.drop-zone`, `.hoshin-disk`/`.hoshin-strip`/`.q-chip`, Ask-Mark `.q-card`/`.thread-item`/
chat surface/`.modal-overlay`/`.modal-panel`, `.life-chip`, My-Day driver grid, inbox popover.
- [ ] Port `reference/views.css` into `styles.css` completely (append after the base block). Remove old view-specific
  rules that these supersede.
- [ ] Verify: `grep` confirms `.hero-kpi`, `.stat-tile`, `.step-bar`, `.q-card`, `.hoshin-disk`, `.modal-panel`,
  `.kz-meta` present; tests green.
- [ ] Commit: `feat(style): port view-component CSS (hero/tiles/stepbar/hoshin/askmark/modal)`.

### Task 5: Rebuild the app shell (`app.js` → light sidebar) — `reference/app.js` §2
**Files:** `app.js` (`renderLayout`, `navFor`, inbox popover, hash parsing).
**Interfaces:** Consumes: our `resolvePersona`, dept data, `navFor(dept, role)`, `redKpisNeedingResponse`.
Produces: `renderLayout` emits `.shell > .sidebar + (.content-area > .topbar + .canvas)`; light sidebar (brand,
`.dept-block`, `.nav` with real **inline SVG stroke icons** — no glyphs, 6px red flag on Overview when a KPI needs
attention, footer persona + `.signout`); topbar (breadcrumb `Dept / View`, `Ask Mark` outline btn, bell `.icon-btn`
with count, search input, `.rollup-tag`); inbox popover as **routed buttons** (item→Problem-Solving KZ-346,
item→Standard Work BWI detail); deep-link hash params `view/loc/chart/kz/step/sop/respond` parsed and applied.
- [ ] Replace the dark-rail `renderLayout` with the light-sidebar shell per `reference/app.js` `renderShell`, wired to
  our persona/nav/router. Port the SVG `ICONS` set. Keep our view dispatch + existing routes working.
- [ ] Verify: `node --check app.js`; `grep` shows `class="sidebar"`, `nav-item`, `<svg`, `rollup-tag`, and **no**
  `rail-link`/`◎◆⚑≣⛁◇` glyphs; tests green.
- [ ] Commit: `feat(shell): rebuild app shell — light sidebar, SVG nav, topbar, routed inbox, deep-links`.

### Task 6: Port chart helpers (`lib/charts.js`) — `reference/charts.js` §4
**Files:** `lib/charts.js` (+ any view import-site name changes deferred to the consuming view tasks).
**Interfaces:** Produces helpers matching the dataviz spec: `sparkline`, `lineChart` (multi-series, direct end
labels + vertical collision nudge, left-anchored dashed target, legend only when multi-series), `stepChart`
(gap + recovery: solid actual, dashed projected tail with hollow dots, countermeasure-in marker, `illustrative`
badge), `paretoBars` (largest-first, first bar rust, value labels), `meter`, `fmtVal`, `wireChartHover`
(crosshair + white tooltip card). Viz-palette only; 2px lines; 10% wash; 2px-white-ringed endpoints; 1px solid grid.
- [ ] Port the reference helpers into `lib/charts.js`, keeping the export names our views already import where
  possible; add the new helpers (`stepChart`, `paretoBars`, `wireChartHover`) the A3 needs. Preserve existing
  export signatures used by current tests.
- [ ] Verify: `node --check lib/charts.js`; `node --test tests/*.test.mjs` green (chart tests still pass); `grep`
  confirms no `#3b82f6`/status-hue line colors.
- [ ] Commit: `feat(charts): port dataviz helpers (line/step/pareto/hover) to spec`.

---

## Phase 2 — Per-view markup rebuild. Sequential; each touches only its own view file(s).

### Task 7: Overview (`views/overview.js`) — `view-overview.js` §5.1
**Files:** `views/overview.js`.
**Interfaces:** Consumes: dept KPIs, red-KPI/story data, Mark notes, ported classes + `sparkline`.
Produces: `.page-head` (eyebrow/h1/sub + Sources secondary + Open-KPI-Boards primary); `NEEDS ATTENTION` →
`.hero-kpi` card (2-col: serif 56px hero value, target/mechanism line, full-width sparkline w/ target, source note +
ghost link; right = Mark `.ai-note` thread incl. `Review Draft 8-Step` deep-opening KZ-346); `ON TRACK` → `.stat-tile`
grid (26px value, badge, sparkline, source + ghost). No left color-bars — state lives in the badge.
- [ ] Rebuild markup to match. Wire deep-links (`data-go`, `data-go-kz` → solve/kz346/step) to our router.
- [ ] Verify: `node --check`; `grep` shows `hero-kpi`, `stat-tile`, `ai-note`, no `left color-bar` class; tests green.
- [ ] Commit: `feat(overview): rebuild layout — hero red-KPI + Mark thread + stat tiles`.

### Task 8: KPI Boards — canonical board (`views/teamboard-location.js`) — `view-kpi.js` §5.2
**Files:** `views/teamboard-location.js`.
**Interfaces:** Consumes: board KPIs, per-location/sub rows, Hoshin relations (`lib/hoshin.js` +
`hoshinStrip`/`hoshinChips` from the new `views/hoshin.js` — Task 9 produces these; if Task 9 not yet done, inline a
minimal strip and swap in Task 9). Produces: head + `Back to Overview`; **Hoshin strip** card (numbered
`.hoshin-disk`s, drives/supports one-liner, `Open Hoshin View →`); `LOCATION` `.seg`; **adaptive chart card**
(OTP multi-line w/ Mexico rust emphasis; PPLH/Materials single series; title/subtitle/legend swap per seg);
`.dt` table `KPI|Target|Actual|Status|Target source|Trend` (caret expander, `Mechanism B` + `H2/H4` chips,
`.status-cell`, source `.chip`, sparkline); expandable location sub-rows (indented, `hand-keyed` chips, flag notes);
OTP expanded reveals the red-left-bordered T3 story card; per-location boards (summary strip + category-band table +
contributions/SRR meter rows); `.board-hint` footer.
- [ ] Rebuild markup + deep-link `loc`/`chart` hash params. Keep our drill/expand behavior.
- [ ] Verify: `node --check`; `grep` shows `hoshin-strip`, `seg__item`, `status-cell`, `table dt`, caret expander;
  tests green.
- [ ] Commit: `feat(kpi-boards): rebuild location board layout — hoshin strip, adaptive chart, dt table`.

### Task 8b: KPI Boards — sibling drill levels (`views/kpi.js`, `views/teamboard.js`)
**Files:** `views/kpi.js`, `views/teamboard.js`.
**Interfaces:** Same idiom as Task 8 applied to our main→team drill levels (main-KPI board and team board). Reuse the
same classes; adjust only the data each level shows (main KPIs / team roll-ups / sub-KPI connections).
- [ ] Apply the §5.2 idiom (Hoshin strip where a level maps to objectives, `.dt` table, chips, status cells,
  expandable rows) to both files; keep our existing drill routes/roll-up-bug banner behavior.
- [ ] Verify: `node --check` both; `grep` shows the shared classes; tests green.
- [ ] Commit: `feat(kpi-boards): apply board idiom to main/team drill levels`.

### Task 9: Hoshin view (NEW `views/hoshin.js`) — `view-hoshin.js` §5.3
**Files:** Create `views/hoshin.js`; modify `app.js` (nav item `hoshin` + CEO route); Test `tests/hoshin-view.test.mjs`.
**Interfaces:** Consumes: `lib/hoshin.js` (`objectives`, `activitiesFor`, `functionalLeadFor`, `objectiveRelations`,
`loadHoshin`) + `data/hoshin.json`. Produces: per-function Hoshin page (eyebrow + `Operations Hoshin`; 5 objective
cards w/ `.hoshin-disk` + drives/supports badge; one card per activity plan w/ mapped disks, Lead block, Q1–Q4
`.q-chip`s, `Target·Milestone | Support function | Accountable | Due | Status` `.dt` table; support-functions note
card) **and** the CEO "Executive Hoshin Activities" view (per-department activity cards). Also **exports
`hoshinStrip(deptId)` + `hoshinChips(deptId)`** consumed by the board tasks.
- [ ] Build `views/hoshin.js` porting `view-hoshin.js` structure, wired to our Hoshin data layer. Add nav/route in
  `app.js` (functional-lead page per dept; CEO Executive view). Export the strip/chips helpers.
- [ ] Test: `tests/hoshin-view.test.mjs` asserts the renderer produces objective cards + activity tables for a
  fixture dept and that `hoshinStrip`/`hoshinChips` return markup with `.hoshin-disk`/`.hoshin-chip`.
- [ ] Verify: `node --check views/hoshin.js app.js`; `node --test tests/*.test.mjs` green (new test passes).
- [ ] Commit: `feat(hoshin): Hoshin function page + CEO Executive Hoshin view; strip/chips helpers`.

### Task 10: Problem-Solving tracker (`views/problemsolving.js` — tracker) — `view-solve.js` §5.4
**Files:** `views/problemsolving.js` (tracker/list section only).
**Interfaces:** Consumes: KZ records (`data/kz-records.json`), red sub-KPI list, AI-draft flag. Produces: head
(counts sub + red sub-KPI `<select>` + `Open 8-Step (AI-Drafted)` primary); **AI-draft banner** (sage left border,
Mark avatar, `Review Draft 8-Step →` primary → KZ-346); `.dt` table `Item|KZ #|Who|ODG|Start|Progress(1–8)|Status|
action` (`.step-track` dots + `n/8`, KZ# mono nowrap, status badges, KZ-346 row sage-tinted w/ `AI draft ready` chip);
prose card + `.board-hint`.
- [ ] Rebuild the tracker markup. Preserve the select→open and row→open-8-step wiring.
- [ ] Verify: `node --check`; `grep` shows `step-track`, AI-draft banner, `table dt`; tests green.
- [ ] Commit: `feat(problem-solving): rebuild tracker layout — AI-draft banner + step-track table`.

### Task 11: The 8-step A3 (`views/problemsolving.js` — wizard) — `view-solve.js` `renderKz346`/`stepBody` §5.5
**Files:** `views/problemsolving.js` (the 8-step wizard section); may consume ported `stepChart`/`paretoBars` from Task 6.
**Interfaces:** Consumes: the KZ record, 8-step template (`data/eightstep-template.json`), golden-thread links,
`lib/agent.js` docked-Mark replies + step-help intent, ODG gate + SOP write-back stores. Produces: **`.kz-meta`
header row** (owner / golden-thread chips / AI-draft chip — no banner box); **horizontal `.step-bar`** (8 tabs,
done=sage ✓ / active outlined); full-width canvas grid `1fr 300px` with the **Mark assist docked panel** (per-step
note + chat thread + composer); real A3 field bodies per step (1 gap callout + gap chart + drop-zone; 2 what/where +
Pareto; 3 3-col + chart; 4 5-Whys ladder + root-cause callout; 5 score-entry matrix + Add-Countermeasure; 6 action
register + ODG gate; 7 KPI grid + recovery chart; 8 docs grid + SOP write-back → Standard Work BWI); footer nav
(`Previous` ghost / `Confirm & Next` primary; step 8 = close KZ). **No "content ready" placeholders** — real fields.
- [ ] Rebuild the wizard markup step-by-step per `stepBody`. Preserve advance/confirm, docked-Mark, ODG-approve, and
  the SOP write-back deep-link to Standard Work.
- [ ] Verify: `node --check`; `grep` shows `kz-meta`, `step-bar`, `eightstep__assist`, `whys`, score-entry, and
  **no** "content ready"/placeholder box; tests green.
- [ ] Commit: `feat(8-step): rebuild A3 wizard layout — kz-meta, step bar, per-step bodies, Mark assist`.

### Task 12: Standard Work (`views/standardwork.js`) — `view-rest.js` §5.6 (+ the 5 named fixes)
**Files:** `views/standardwork.js`.
**Interfaces:** Consumes: `data/sop-library.json`, `data/sops/*.json`, backlinks/revision data. Produces: **Library**
(head eyebrow, count pills + collection badges, `.dt` table `Type|Document|Area/Product|Owner|Lang|Link` with
`.doc-type` mono chips + `Open In-App`/`link pending`; `SOPS AVAILABLE IN-APP` featured card; footer legend).
**SOP detail** fixing all five problems: (1) h1 **24px `max-width:30ch`** (stops wrapping); (2) `Back to Library`
in `.page-head__side` top-right as `--secondary`; (3) Purpose + Scope in one `.card--pad` w/ running-heads, linked
forms as a dim line inside the backlinks card; (4) steps table = standard `.dt`, **no italics** (`Key points` = 400
`--text-secondary`, `Reason` = 400 `--text-dim`, `#` tabular); (5) two side-by-side cards below (`8-step backlinks`
mono KZ ref + `Revision log`).
- [ ] Rebuild library + detail markup; apply all five fixes explicitly. Keep the KZ-346 → SOP write-back backlink.
- [ ] Verify: `node --check`; `grep` shows detail h1 24px/30ch, `page-head__side` Back button, `.dt` steps table, and
  **no** `font-style:italic`/`<i>` in the steps table; tests green.
- [ ] Commit: `feat(standard-work): rebuild library + SOP detail; fix title/back/scope/italics/backlinks`.

### Task 13: Sources (`views/sources.js`) — `view-rest.js` §5.7
**Files:** `views/sources.js`.
**Interfaces:** Consumes: our per-KPI source mapping. Produces: head (`Sourcing Plan` + sub); target-systems
summary card (badges + `N KPIs · M source systems · 0 manual-only`); **amber left-border banner** (double-entry
being eliminated); `BY SOURCE SYSTEM` cards (WPS / Business Central, per-KPI rows w/ `re-keyed today` amber /
`direct pull` green badges); **3-node flow** (`Source system → FMDS vault → FMDS board`, middle node sage-tinted,
arrow separators); flow note `.board-hint`.
- [ ] Rebuild markup to match.
- [ ] Verify: `node --check`; `grep` shows amber banner, by-source cards, 3-node flow; tests green.
- [ ] Commit: `feat(sources): rebuild layout — summary, amber banner, by-source, 3-node flow`.

### Task 14: Ask Mark (`views/askmark.js`) — `view-rest.js` §5.8
**Files:** `views/askmark.js`.
**Interfaces:** Consumes: red-KPI response queue (`lib/accountability.js`), thread store, `liveReply`
(`lib/agent.js`), lifecycle + response fields. Produces: head (44px avatar, serif `Mark`, sub, count pills,
`+ New Chat` primary); grid **34fr/66fr**; left = `NEEDS RESPONSE` compact `.q-card`s + `RECENT THREADS`
`.thread-item` list; right = **chat card** (thread header, scrollable messages: user muted-right bubble / Mark
white bubble+avatar / system sage bubble, docked composer Enter=send Shift+Enter=newline); **response card =
`.modal-panel`** (chart + caption, lifecycle `.life-chip` track, four response fields, footer Close/Edit).
**Shrink the action-required bar to ≈half** its old footprint (owner feedback). New Chat pushes a fresh thread.
- [ ] Rebuild markup; preserve the response-logging store writes + `liveReply` calls + `respond` hash param.
- [ ] Verify: `node --check`; `grep` shows `q-card`, `thread-item`, `modal-panel`, `life-chip`; tests green.
- [ ] Commit: `feat(ask-mark): rebuild chat-first layout — q-cards, threads, chat surface, response modal`.

### Task 15: My Day + remaining L1 views (`views/myday.js`, `views/myboard.js`, `views/odg-hub.js`, `views/login.js`) — §5.9
**Files:** `views/myday.js`, `views/myboard.js`, `views/odg-hub.js`, `views/login.js`.
**Interfaces:** Consumes: L1 persona headline KPI + drivers + reason store; `resolvePersona`. Produces: My Day
(serif greeting, **headline hero card** 2-col like Overview, amber Data-flag card, `MY ACTIVITY DRIVERS` stat-tile
grid, `THIS WEEK'S CONTEXT` reason composer + logged-reasons card). Apply the same card/table/badge idiom to
`myboard.js`, `odg-hub.js`, and re-skin `login.js` (brand mark, sage primary, warm bg).
- [ ] Rebuild markup across the four files; keep per-user L1 differentiation and the reason-log store writes.
- [ ] Verify: `node --check` all four; `grep` shows hero card + driver grid + reason composer; tests green.
- [ ] Commit: `feat(l1): rebuild My Day + myboard/odg-hub/login layouts`.

---

## Phase 3 — Verification & finish

### Task 16: Whole-app pass + branch review + finish
**Files:** none (verification) + any final nits.
- [ ] **Controller-run** browser pass across every view/role at :8770 side-by-side with the DESIGN-GUIDE
  Definition-of-Done §6 checklist + anti-pattern list; capture a short punch-list. (Browser pass is the
  controller's, not a subagent's.)
- [ ] Fix punch-list nits (token/spacing/class), keeping tests green: `fix(style): visual-parity punch-list`.
- [ ] Whole-branch code review (most-capable model) via requesting-code-review; dispatch ONE fix subagent for any
  Critical/Important findings.
- [ ] `node --test tests/*.test.mjs` green; hand the running app to the owner for aesthetic sign-off; then
  superpowers:finishing-a-development-branch (merge `feat/design-system-migration` → `main`, push `origin/FMDS`).

## Relationship to prior plans
- **Supersedes** Phase A (re-skin) + Phase C (layout rollout) of `2026-07-08-design-system-migration.md` — that plan
  was the wrong altitude (recolor, not layout rebuild).
- **Phase B (Hoshin data layer)** is already built: `data/hoshin.json` + `lib/hoshin.js` exist and are tested. Task 9
  here consumes them and adds the missing view. The board Hoshin strip (old B3) is folded into Tasks 8/8b/9.
- **Phase D (Mark live agent via SDK)** stays a separate plan (`2026-07-08-mark-agent-sdk.md`), gated on the owner's
  API key and executed after this layout work merges.

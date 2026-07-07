# Mark + Red-KPI Accountability + Interactive 8-Step — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Plan style (owner preference, overrides skill default):** tasks are specified by exact **files**, **interface signatures**, **test intent + exact commands**, and **commit points** — not full copy-paste code bodies. Implement each task by following the patterns in the existing sibling module named in "Consumes". When a signature is given, match it exactly.

**Goal:** Give FMDS OS a real AI-employee chat page (Mark), a required + tracked red-KPI accountability loop, and an interactive 8-step workspace with charts — all UI-complete behind a scripted reply seam.

**Architecture:** A shared context layer (`lib/context.js`) assembles "what Mark knows" per department; three surfaces consume it — the Ask Mark page (`views/askmark.js`), the accountability store/workflow (`lib/accountability.js`), and the enhanced 8-step view (`views/problemsolving.js`). Mark's replies flow through `lib/agent.js` `liveReply()` (scripted now; a `serve.py` proxy later). Persistence follows the existing in-memory + `localStorage` + seed pattern (`lib/reasons.js`, `lib/comments.js`).

**Tech Stack:** Vanilla ES modules, no build step, no runtime deps. Node built-in test runner (`node --test tests/*.test.mjs`). Inline SVG charts. Python `serve.py` on `:8770` for local dev/Playwright.

## Global Constraints

- **No build step, no runtime deps, no framework** — vanilla ES modules only.
- **Zero-invented-data rule** — every seeded value traces to a real WE workbook/transcript figure; illustrative data is badged.
- **Design system fixed** — dark graphite command rail + light canvas, IBM Plex, accent `#2f6bff`; RAG (`--green`/`--amber`/`--red`) reserved strictly for status.
- **Bundle-safe** — everything must survive the CSP-locked Artifact bundle: no external hosts, no inline API keys, no network dependency in Phase 1.
- **Browser-guard stores** — `localStorage` access wrapped so Node tests importing the module don't throw (see `lib/reasons.js` tail).
- **RAG source of truth** — always compute status via `ragStatus(actual, target, direction, bands)` from `lib/rag.js`; never re-implement.
- **Latest model** — Phase 2 proxy targets `claude-opus-4-8` (or newest available).

---

## Phase A — Shared logic foundation (pure, unit-tested)

### Task 1: Department context layer

**Files:**
- Create: `lib/context.js`
- Test: `tests/context.test.mjs`

**Interfaces:**
- Consumes: `ragStatus` (`lib/rag.js`), `explainKpi` (`lib/explain.js`), `byId`/`mains` (`lib/registry.js`), `byDept` (`lib/eightstep.js`); reason/comment/KZ data passed in via opts (keep pure & injectable for tests).
- Produces:
  `buildDeptContext(dept, opts = {}) → { deptId, deptName, kpis:[{id,name,rag,actual,target,unit,level,isMain,parentId,owner,explanation}], reds:[kpiId], reasons:[...], comments:[...], kzRecords:[{kzNumber,item,who,linkedKpiId,done,closed}], ownerOf(kpiId)→string }`
  `ownerFor(dept, kpi) → string` (L2 lead for main/board, `kpi.who`/rep for owned subs; falls back to `dept.lead`).

- [ ] **Step 1 — Failing test:** `tests/context.test.mjs` asserts `buildDeptContext(operationsFixture)` returns `kpis` with a computed `rag` for OTP (`red`), includes OTP in `reds`, and `ownerOf('otp')` is non-empty. Use a small inline dept fixture (2–3 KPIs) — not the real 94KB JSON.
- [ ] **Step 2 — Run, verify fail:** `node --test tests/context.test.mjs` → FAIL (module missing).
- [ ] **Step 3 — Implement** `lib/context.js` to the interface above (pure function; opts injects `reasons`/`comments`/`kzRecords`, each defaulting to `[]`).
- [ ] **Step 4 — Verify pass:** `node --test tests/context.test.mjs` → PASS.
- [ ] **Step 5 — Commit:** `feat(context): department context layer for Mark`.

### Task 2: Accountability store + lifecycle

**Files:**
- Create: `lib/accountability.js`
- Test: `tests/accountability.test.mjs`

**Interfaces:**
- Consumes: `ragStatus` (`lib/rag.js`), `ownerFor`/`buildDeptContext` (`lib/context.js`); `localStorage` (browser-guarded).
- Produces:
  `LIFECYCLE = ['detected','responded','actionUnderway','eightStepOpened','reported','recovered']`
  `redKpisNeedingResponse(dept, {includeAmber=false}) → [{kpiId, kpi, rag, owner, dueDate}]` (red-only by default per spec §10).
  `addResponse({deptId,kpiId,owner,cause,action,needs8Step,kzNumber,reportBackWhen}) → entry`
  `getResponse({deptId,kpiId}) → entry|null` · `getResponsesByDept(deptId) → [entry]`
  `advanceLifecycle({deptId,kpiId,stage}) → entry` (idempotent; stamps `{done:true,ts}`).
  `lifecycleView(entry, now?) → [{stage,label,done,ts,current}]` + `stalledDays(entry)`.
  `rollupSignal(deptId) → {redCount,answered,beingActioned,stalled}`
  `seedDemoAccountability()` — the OTP/Mexico + Jim Kozel exchange; browser auto-seed guard at tail.
  Entry shape per spec §5.5.

- [ ] **Step 1 — Failing test:** assert (a) `redKpisNeedingResponse` returns OTP for the ops fixture and omits it when its actual meets target; (b) `advanceLifecycle` to `responded` sets `answered`/lifecycle done; (c) `lifecycleView` marks the first not-done stage `current:true`; (d) `stalledDays` flags an old `actionUnderway` ts.
- [ ] **Step 2 — Run, verify fail:** `node --test tests/accountability.test.mjs` → FAIL.
- [ ] **Step 3 — Implement** `lib/accountability.js` (mirror `lib/reasons.js` for load/save/uid/seed + browser guard).
- [ ] **Step 4 — Verify pass** → PASS.
- [ ] **Step 5 — Commit:** `feat(accountability): red-KPI response store + lifecycle track`.

### Task 3: Chart additions (recovery trend, funnel, pareto)

**Files:**
- Modify: `lib/charts.js`
- Test: `tests/charts.test.mjs`

**Interfaces:**
- Produces (added to `lib/charts.js`, same style as `svgLine`/`svgBars`, returns SVG string):
  `svgRecoveryTrend(points, {target, cmIndex, width, height}) → svg` — line + dashed target + green band + vertical countermeasure marker at `cmIndex` + RAG-colored dots (via `ragStatus` per point).
  `svgFunnel(counts, {labels, width, height}) → svg` — reach-by-step bars, RAG-graded, from an 8-length `counts` array.
  `svgPareto(rows, {width, height}) → svg` — `svgBars`-style bars + a cumulative-% polyline.

- [ ] **Step 1 — Failing test:** assert each returns a string starting `"<svg"`, contains `<polyline`/`<rect` as appropriate, renders the target `stroke-dasharray`, and emits N dots/bars for N inputs. Edge: empty array → "no data" svg (match `svgLine`).
- [ ] **Step 2 — Run, verify fail** → FAIL.
- [ ] **Step 3 — Implement** the three helpers reusing the existing scale/pad helpers and `RAG_COLORS`/`ACCENT` tokens.
- [ ] **Step 4 — Verify pass** → PASS. Also `node --test tests/charts.test.mjs tests/rag.test.mjs` stays green (no regressions to `svgLine`/`svgBars`).
- [ ] **Step 5 — Commit:** `feat(charts): recovery-trend, funnel, pareto SVG helpers`.

---

## Phase B — Ask Mark page

### Task 4: Ask Mark page shell + nav + route

**Files:**
- Create: `views/askmark.js`
- Modify: `app.js` (`navFor` add item for L1+L2; `dispatchView` add `case 'mark'`; route already parses `#/dept/:id/:view`).
- Test: browser (Playwright) — no unit test for the view shell.

**Interfaces:**
- Consumes: `buildDeptContext` (`lib/context.js`), `redKpisNeedingResponse`/`rollupSignal` (`lib/accountability.js`), session/persona from `store`.
- Produces: `renderAskMark(dept, mount, session)` — two-pane workspace (left queue, right chat), matching spec §4.

- [ ] **Step 1 — Add nav + route:** `navFor` gets `{id:'mark', label:'Ask Mark', icon:'◇'}` (both roles); `dispatchView` `case 'mark': renderAskMark(dept, mount, session)`.
- [ ] **Step 2 — Implement `renderAskMark`** shell: header (Mark ident + "N action required" pill from `rollupSignal`), left queue column (cards from `redKpisNeedingResponse` — name/RAG/actual-vs-target/due/answered), right chat column placeholder (composer + empty thread). Inject a `#askmark-styles` block (pattern: `problemsolving.js` `injectStyles`).
- [ ] **Step 3 — Browser verify:** `python3 serve.py`, Playwright: login as Operations L2 → click "Ask Mark" → assert the queue lists OTP with due date and the header pill shows the red count.
- [ ] **Step 4 — Commit:** `feat(askmark): Ask Mark page shell + nav route + red queue`.

### Task 5: Scripted Mark chat grounded in context

**Files:**
- Modify: `lib/agent.js` (`liveReply` consumes `buildDeptContext`), `views/askmark.js` (wire composer → reply → thread).
- Test: `tests/agent-live.test.mjs` (assert scripted `liveReply` mentions the red KPI + its story for a known question) + browser.

**Interfaces:**
- Consumes: `buildDeptContext`.
- Produces: `liveReply(deptId, intent, ctx) → Promise<string>` now context-grounded (still no network; returns rich scripted text keyed off the context object + intent/question). Signature unchanged.

- [ ] **Step 1 — Failing test:** `liveReply('operations','explain-red',{})` resolves to a string containing "Mexico" and the OTP figures from context.
- [ ] **Step 2 — Verify fail** → FAIL.
- [ ] **Step 3 — Implement:** `liveReply` builds context, routes the question/intent to a grounded scripted answer (reuse `bakedReply` corpus + `composeMarkNote`); wire `askmark.js` composer to append user + Mark turns to an in-view thread array and re-render the chat column.
- [ ] **Step 4 — Verify pass** (unit) + browser: type "why is OTP red?" → Mark answers with the Mexico story; history persists across turns in the view.
- [ ] **Step 5 — Commit:** `feat(askmark): context-grounded scripted Mark chat`.

### Task 6: Red-KPI response card + lifecycle track

**Files:**
- Modify: `views/askmark.js` (selecting a queue item loads the card inline above the composer), `lib/accountability.js` (already provides store).
- Test: browser.

**Interfaces:**
- Consumes: `getResponse`/`addResponse`/`advanceLifecycle`/`lifecycleView` (`lib/accountability.js`), `draftStep`/`liveReply` (`lib/agent.js`) for Mark's pre-draft of field 1.
- Produces: card renderer inside `askmark.js` (4 fields per spec §5.2 + the `lifecycleView` chip track §5.3).

- [ ] **Step 1 — Implement card:** clicking a queue card renders the 4-field response form (field 1 pre-filled via Mark draft, per-dept prompt label), a "Yes/No — needs 8-step?" toggle, a report-back input, and the horizontal lifecycle track from `lifecycleView`. Two entry modes: **Submit** on the card → `addResponse` + `advanceLifecycle('responded')`; **or** answer in chat → Mark fills the card (reuse the parsed fields).
- [ ] **Step 2 — Browser verify:** select OTP → card shows Mark-drafted cause → fill "what I'm doing" → Submit → queue card flips to "answered ✓" and the track advances Detected→Responded; the header count decrements.
- [ ] **Step 3 — Commit:** `feat(askmark): red-KPI response card + lifecycle track`.

### Task 7: Escalation link (response → 8-step)

**Files:**
- Modify: `views/askmark.js` (Yes on field 3 links a KZ + deep-links), `lib/accountability.js` (`advanceLifecycle('eightStepOpened')`, store `kzNumber`).
- Test: browser.

**Interfaces:**
- Consumes: `newKZ` (`lib/eightstep.js`), existing handoff route `#/dept/:id/solve?kpi=<id>` (already honored by `renderProblemSolving`).

- [ ] **Step 1 — Implement:** field 3 = Yes → create/link a KZ tagged with `kpiId`, store `kzNumber`, advance lifecycle to `eightStepOpened`, and render a deep-link "Open KZ-### →" to `#/dept/:id/solve?kpi=<id>`.
- [ ] **Step 2 — Browser verify:** on the OTP card, choose Yes → link appears → clicking it lands on the 8-step wizard pre-opened for the Mexico sub-KPI (existing behavior) and the card's track shows the 8-step stage active.
- [ ] **Step 3 — Commit:** `feat(askmark): escalate red response into a linked 8-step`.

---

## Phase C — Interactive 8-step workspace (`views/problemsolving.js`)

### Task 8: Docked proactive Mark panel on the wizard

**Files:**
- Modify: `views/problemsolving.js` (add docked panel beside `renderWizardStep`), reuse assistant-drawer styles from `app.js`/`styles.css`.
- Test: browser.

**Interfaces:**
- Consumes: `liveReply`/`draftStep` (`lib/agent.js`), `buildDeptContext` (`lib/context.js`), active KZ + current step (module state `_activeKZ`/`_currentStep`).
- Produces: a per-step Mark panel that, on step change, opens with step-specific suggestions (Step 4 chains/branches; Step 5 scored countermeasures; Step 7 recovery status) + a composer.

- [ ] **Step 1 — Implement:** render a docked right panel in the wizard layout; on `_psGotoStep`/`_psConfirmStep`, refresh the panel with a proactive suggestion for the new step (scripted via `liveReply` with an intent like `step-help` carrying `step`+`kpi`). Accept/edit/reject buttons write suggestions into the step fields.
- [ ] **Step 2 — Browser verify:** open the OTP 8-step → Step 4 shows Mark's candidate root-cause chains proactively; moving to Step 5 refreshes to countermeasure ideas.
- [ ] **Step 3 — Commit:** `feat(8step): docked proactive Mark co-pilot per step`.

### Task 9: Charts embedded in the 8-step

**Files:**
- Modify: `views/problemsolving.js` (replace `.chart-placeholder` at Steps 1/3/7 + add Step 2 pareto), `lib/charts.js` (used).
- Test: browser (+ the Task 3 chart units already cover the SVG helpers).

**Interfaces:**
- Consumes: `svgRecoveryTrend`/`svgPareto` (`lib/charts.js`); the KPI's series (from dept data / a seeded series where the JSON lacks one — badge illustrative).

- [ ] **Step 1 — Implement:** Step 1 & 3 → `svgRecoveryTrend`/gap view; Step 2 → `svgPareto` (stratify by location/rep); Step 7 → `svgRecoveryTrend` with `cmIndex` marker showing return-to-green.
- [ ] **Step 2 — Browser verify:** each step renders a real SVG (no placeholder divs remain); Step 7 shows dots crossing red→amber→green.
- [ ] **Step 3 — Commit:** `feat(8step): embed recovery/gap/pareto charts across steps`.

### Task 10: Clean tracker — linked-red column, stall flags, funnel header

**Files:**
- Modify: `views/problemsolving.js` (`renderTrackerTable` + the `ps-tophead` header), `lib/accountability.js`/`lib/eightstep.js` (link + stall helpers), `lib/charts.js` (`svgFunnel`).
- Test: browser (+ a small unit for stall/linked derivation if pure).

**Interfaces:**
- Consumes: `svgFunnel`, `progress` (`lib/eightstep.js`), KZ `linkedKpiId` (from context/KZ records).
- Produces: `stalledDays`/linked-KPI display in the tracker rows; funnel + counts in the header.

- [ ] **Step 1 — Implement:** add a **Linked red KPI** column (RAG-colored) and a **stall flag** ("⚠ Stalled Nd at step k") to each tracker row; add total/open/closed/stalled counts + `svgFunnel` to the header.
- [ ] **Step 2 — Browser verify:** Operations tracker shows KZ rows with linked-KPI chips, at least one stall flag, and the funnel; counts match row states.
- [ ] **Step 3 — Commit:** `feat(8step): clean tracker — linked red KPI, stall flags, funnel`.

### Task 11: Retire the standalone inbox popover → queue shortcut + badge

**Files:**
- Modify: `app.js` (`toggleInbox` removed/replaced; 🔔 routes to `#/dept/:id/mark`; badge count from `rollupSignal`).
- Test: browser.

- [ ] **Step 1 — Implement:** replace the hard-coded inbox popover with a 🔔 button that routes to the Ask Mark queue; source its count from `rollupSignal(dept.id)` so it matches the page.
- [ ] **Step 2 — Browser verify:** 🔔 badge equals the Ask Mark red count; clicking it lands on the queue; no orphaned popover code remains.
- [ ] **Step 3 — Commit:** `refactor(app): inbox popover → Ask Mark queue shortcut + live badge`.

---

## Phase D — Live SDK (deferred; do only when Phase 1 signs off)

### Task 12: serve.py `/api/mark` proxy + `liveReply` swap

**Files:**
- Modify: `serve.py` (add `POST /api/mark`), `lib/agent.js` (`liveReply`: fetch `/api/mark`, fall back to scripted).
- Test: manual (local, with `ANTHROPIC_API_KEY`) + browser fallback check when the endpoint is absent.

**Interfaces:**
- `/api/mark` request `{deptId, context, messages}` → `{reply}`; holds the key server-side; calls `claude-opus-4-8`.
- `liveReply` unchanged signature; body becomes fetch-or-fallback.

- [ ] **Step 1 — Implement proxy** in `serve.py` (stdlib `http.server` POST handler; reads key from env; assembles the system prompt from the posted context).
- [ ] **Step 2 — Swap `liveReply`** to try `/api/mark`, catch → scripted reply (so the hosted bundle still works).
- [ ] **Step 3 — Verify:** with key set locally, Mark answers live; with the endpoint down, the scripted reply still renders. No UI change.
- [ ] **Step 4 — Commit:** `feat(mark): live Claude via serve.py /api/mark proxy with scripted fallback`.

---

## Self-Review

**Spec coverage:** §3 context layer → T1; §5 accountability (detect/card/track/escalate/rollup) → T2,T6,T7,T11; §4 Ask Mark page (IA/layout/chat) → T4,T5; §6.1 docked Mark → T8; §6.2 charts → T3,T9; §6.3 clean tracker → T10; §8 SDK seam → T12; §9 testing → per-task `node --test` + Playwright. No uncovered spec section.

**Placeholder scan:** no "TBD/handle errors/similar to Task N"; each task names exact files, signatures, test intent, and commands. (Per owner preference, code bodies are intentionally omitted, not deferred.)

**Type consistency:** `buildDeptContext`/`ownerFor` (T1) consumed by T2/T4/T5/T8; `LIFECYCLE`/`advanceLifecycle`/`lifecycleView`/`rollupSignal` (T2) consumed by T4/T6/T7/T11; `svgRecoveryTrend`/`svgFunnel`/`svgPareto` (T3) consumed by T9/T10; `liveReply` signature stable across T5/T8/T12. Consistent.

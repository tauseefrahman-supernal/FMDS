# Design — Mark (AI Employee), the Red-KPI Accountability Loop, and the Interactive 8-Step

**Date:** 2026-07-07
**Owner:** Tauseef Rahman (AI Strategy / Delivery)
**Status:** Approved for planning (brainstorm complete; visual companion used for all 6 UI decisions)
**Order-form anchor:** Supernal OF-002 — FMDS OS. This design delivers the two pieces the
order form promises that the prototype does not yet have: (1) the **AI employee** that reasons
over a department's context, and (2) the **red-KPI accountability loop** ("the owner is notified,
asked for the cause, and the response is posted back"), plus a real upgrade to the **8-step
problem-solving assist**.

---

## 1. Goal & problem

Two gaps in the current prototype, both named in OF-002:

1. **No AI-employee chat.** `lib/agent.js` returns hard-coded per-department strings
   (`bakedReply`) surfaced in a cramped right **drawer** (`app.js` → `toggleAssistant`). There is
   no conversation, no history, and no live model. `liveReply()` exists only as a pass-through stub.
2. **No accountability loop.** When a KPI is red there is nowhere a required, tracked response
   lives. Today's pieces are passive and scattered: a static Chief-of-Staff inbox
   (`app.js` → `toggleInbox`, 2 hard-coded items), a per-rep reason log (`lib/reasons.js`), and
   per-KPI comment threads (`lib/comments.js`). None of them require or track an owner's response.

And the **8-step** view (`views/problemsolving.js`) is a solid wizard + A3 read-view, but it is
not yet a *workspace*: charts are placeholders (`.chart-placeholder`) even though `lib/charts.js`
already ships `svgLine`/`svgBars`, and there is no side chat to brainstorm a step.

**Success = a demo for Randy where:** a red KPI produces a required response the owner answers
(on the card *or* by talking to Mark); that response is tracked stage-by-stage and rolled up to
Leadership OS; and any red can open an 8-step where Mark actively co-drives each step with charts
showing the recovery back to green.

---

## 2. Scope

**Phase 1 (this design — UI/UX).** Build all three surfaces with the model reasoning behind a
**clean seam** (`liveReply`), which returns rich **scripted** replies grounded in real WE data.
Everything is interactive and demo-ready without a network dependency.

**Phase 2 (later — harden the SDK).** Swap the seam to a real Claude call via a small local proxy
in `serve.py` (decision confirmed — see §8). No UI changes; only `liveReply`'s body changes.

**Non-goals (unchanged from OF-002 §10):** write-back agents into source systems, ADP/AD
integration, full WPS replacement, the SRR phase. Also out: any change to the login/role model,
the Sources view, or the roll-up target (Leadership OS) itself — we only *feed* it.

---

## 3. The three pieces + the shared context layer

```
                        ┌─────────────────────────────┐
                        │   lib/context.js  (NEW)      │  assembles one grounded
                        │   department context object  │  "what Mark knows" object
                        └──────────────┬──────────────┘
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
   ① Ask Mark page            ② Red-KPI accountability   ③ Interactive 8-step
   (views/askmark.js NEW)     (lib/accountability.js NEW) (views/problemsolving.js — enhanced)
   queue ⟷ chat workspace     required response + track    docked Mark + charts + clean tracker
              └────────────────────────┴────────────────────────┘
                        Mark reply seam: lib/agent.js → liveReply()
                        Phase 1 = scripted · Phase 2 = serve.py /api/mark
```

The **context layer** (`lib/context.js`, new) is the connective tissue. Given a `deptId` it returns
a single structured object Mark reasons over: the department's KPIs (with RAG via `lib/rag.js` and
explanations via `lib/explain.js`), the reason log (`lib/reasons.js`), the comment threads
(`lib/comments.js`), the KZ records (`lib/eightstep.js` → `byDept`), and the KPI→owner map. Both
scripted and live replies consume this same object, so Phase 2 changes *how* an answer is
generated, never *what context* it sees.

---

## 4. Piece ① — The "Ask Mark" page

**IA (decision A):** Mark graduates from a drawer to a **top-level page**. One Mark, three surfaces:
the full page, the docked panel on the 8-step (piece ③), and the existing quick drawer stays for
board-wide "ask about this KPI" moments.

- **New nav item** in `app.js` `navFor()` for both L1 and L2 — label "Ask Mark", icon `◇`, with a
  red count badge sourced from the accountability store (§5). Route `#/dept/:id/mark`.
- **New view** `views/askmark.js`, dispatched from `app.js` `dispatchView`.
- The **Chief-of-Staff inbox** (`toggleInbox`) is retired as a standalone popover; its notion
  ("the AI-exec layer requests context") **graduates into this page's Action-Required queue**. The
  top-bar 🔔 becomes a shortcut that routes to `#/dept/:id/mark`.

**Layout (decision A — "workspace"):** two-pane.

- **Left column — the required-response queue.** Every red/at-risk KPI needing a response, each a
  card: KPI name, RAG, actual vs target, due date, answered/not, owner. Below it, recent chat
  threads. This is the accountability home.
- **Right column — the conversation.** A running chat with message history (scripted in Phase 1).
  Selecting a queue item loads that KPI's context into the chat and surfaces its response card
  (§5) inline at the top of the composer, so the owner can **answer on the card or just tell Mark**
  — Mark extracts the same fields from prose either way.

**Header:** Mark identity ("Mark · AI Employee · <dept>") + a red "N action required" pill.

---

## 5. Piece ② — The red-KPI accountability workflow

The two-tier model (confirmed earlier): a red fires a **required lightweight response**; if the
cause needs real problem-solving the owner **escalates into a full 8-step**, and the two are linked.

### 5.1 Detection & notification
A KPI is "action-required" when `ragStatus()` returns `red` (and, configurably, `amber`) for a
board/main or owned sub-KPI. `lib/accountability.js` derives the queue from `dept.kpis` + the
KPI→owner map. Each item is framed as a request **from the AI-exec layer** ("Chief of Staff asks:
what's the cause and what are you doing?") with a due date. (Notifications are in-app for Phase 1;
no email/Slack.)

### 5.2 The response card — 4 fields (decision confirmed)
Same skeleton every department; **Mark adapts the prompt** per dept:

| # | Field | Per-dept prompt example |
|---|-------|-------------------------|
| 1 | **What's driving the red?** (Mark pre-drafts) | Ops → which location / which standard-work step · Service → which reps & accounts · Marketing → which channel · HR → incident vs data-entry artifact |
| 2 | **What are you doing about it?** | free text (Mark can suggest) |
| 3 | **Does this need an 8-step?** | Yes → open/link a KZ (escalation) · No → one-off / data blip (with reason) |
| 4 | **When will you report back?** | date / next meeting |

Mark pre-fills field 1 (and offers 2) from the context layer + meeting-grounded story (reusing the
`composeMarkNote`/`draftStep` grounding already in `lib/comments.js` / `lib/agent.js`). On submit,
Mark posts a confirmation and rolls "being actioned" up to Leadership OS.

### 5.3 The lifecycle track (decision A)
Each red carries a visible **response lifecycle**, checked off as it progresses and flagged if it
stalls:

```
Detected → Responded → Action underway → 8-step (KZ-###) → Reported (at T2/T3) → Recovered → green
```

Mark advances stages and surfaces stalls ("stuck at 'action underway' 6 days"). This track is the
single roll-up signal Leadership OS reads — it answers *"is this red actually being worked?"*, not
just *"is it red?"*.

### 5.4 Escalation link
Field 3 = Yes creates/links a KZ (via `lib/eightstep.js` `newKZ`) tagged with the KPI id, and
deep-links to the 8-step wizard (the existing `#/dept/:id/solve?kpi=<id>` handoff). The response
card's track then reflects the KZ's step progress.

### 5.5 Store
New `lib/accountability.js`, same in-memory + `localStorage` + seed pattern as `lib/reasons.js`
and `lib/comments.js`. Entry shape:

```
{ id, deptId, kpiId, owner, dueDate, answered, onTime,
  cause, action, needs8Step, kzNumber,           // the 4 fields
  reportBackWhen,
  lifecycle: { detected, responded, actionUnderway, eightStepOpened, reported, recovered },  // each: {done, ts}
  ts }
```
Seeded with the OTP-red / Mexico exchange (Jim Kozel) so the queue is populated on load.

---

## 6. Piece ③ — The interactive 8-step workspace

Enhancements to `views/problemsolving.js` (keep tracker / wizard / A3 read-view structure).

### 6.1 Docked Mark, proactive per-step co-pilot (decision A)
A docked Mark panel rides the wizard (right side, reuses the drawer styling). **On landing on a
step, Mark opens with step-specific help** — Step 4: candidate root-cause chains + branches to
test (Man/Method/Measurement), flagged as hypotheses to confirm on the floor; Step 5: pre-scored
countermeasure ideas; Step 7: "trend's been green 3 weeks, 1 more to close." The owner
accepts / edits / rejects. This is the "AI does 60–80%, human does the human part" story made
literal. Mark's suggestions come through the same `liveReply` seam (scripted Phase 1).

### 6.2 Charts — full set of four (decision A), via `lib/charts.js`
All inline SVG, bundle-safe, from the KPI's own series:

1. **KPI recovery trend** — Steps 1/3/7. Actual vs target by week, countermeasure marker, dots
   RAG-colored red→amber→green. The monitoring spine ("did it get back to green?"). `svgLine` + markers.
2. **Gap = the problem** — Steps 1 & 3. Actual-below-target with shaded gap. `svgLine` variant.
3. **Breakdown / Pareto** — Step 2. Gap stratified by location/rep/cause; Mexico is the driver.
   `svgBars` + optional cumulative overlay.
4. **Where 8-steps stall (funnel)** — tracker header. Count of KZs reaching each step; visualizes
   the Step-4 cliff (the ~19%→80% completion story in OF-002 §5). `svgBars`.

These replace the `.chart-placeholder` divs at Steps 1, 3, 7, 8 and add ② and ④.

### 6.3 The clean tracker (decision confirmed)
Keep today's columns (item, KZ#, owner, 1–8 completion dots, open/closed, A3 view) and add:

- **Linked red KPI** column — ties each KZ back to the board KPI it's fixing (red/amber/resolved).
- **Mark stall flag** — e.g. "⚠ Stalled 14d at step 1", derived from step timestamps.
- **Stall-funnel** (chart ④) + counts (total / open / closed / stalled) in the header.

This structured record *is* Mark's 8-step context (open/closed, Kaizen #, linked red, owner) so he
can answer "what's open?", "who owns KZ-361?", "which reds have no 8-step yet?".

---

## 7. Data model & modules touched

**New**
- `views/askmark.js` — the Ask Mark page (queue ⟷ chat workspace).
- `lib/accountability.js` — red-KPI detection, response store, lifecycle model, roll-up signal.
- `lib/context.js` — assembles the department context object Mark reasons over.

**Enhanced**
- `app.js` — nav item + route + badge for Ask Mark; retire standalone inbox popover; keep the drawer.
- `lib/agent.js` — richer scripted `liveReply` that consumes `lib/context.js`; keep `draftStep`.
- `views/problemsolving.js` — docked Mark, four charts, tracker columns + stall flags.
- `lib/charts.js` — add a recovery-trend helper (markers/RAG dots) and a funnel; Pareto overlay.
- `lib/comments.js` / `lib/reasons.js` — reused as-is by the context layer (no breaking changes).
- `serve.py` — Phase 2 only: `/api/mark` proxy (see §8).

**Persistence:** in-memory + `localStorage` + seed-on-first-load, matching the existing
`reasons`/`comments` pattern. No backend in Phase 1.

---

## 8. Phase 2 — the live SDK seam (decision A: local proxy via serve.py)

- Extend `serve.py` with a `POST /api/mark` endpoint that holds `ANTHROPIC_API_KEY` **server-side**
  and calls Claude (`claude-opus-4-8` / latest) with the context object from `lib/context.js` plus
  the conversation turn.
- `lib/agent.js` `liveReply()` becomes: if `/api/mark` is reachable → `fetch` it; else → the Phase 1
  scripted reply. **One code seam, two backends** (live locally for the Randy demo; scripted on the
  CSP-locked hosted Artifact, which has no server).
- No UI changes in Phase 2 — the page, card, docked panel, and charts are all built in Phase 1.

**Constraint (why this matters):** the hosted bundle is static and CSP-locked — a live key/call
cannot run inside it. The local proxy is the only place a real call runs without new infra, and it
matches how `serve.py` already serves the app on `:8770`.

---

## 9. Design system & testing

- **Design system unchanged:** dark graphite command rail + light canvas, IBM Plex, accent
  `#2f6bff`, RAG reserved strictly for status. Mark's blue is the accent; the docked panel reuses
  the drawer's styling.
- **Testing:** pure logic (`lib/accountability.js` lifecycle transitions, `lib/context.js`
  assembly, chart-series shaping) gets `node --test` units in `tests/`, matching the existing
  75-test suite. Views verified live in Playwright on `serve.py :8770` (login → Ask Mark → respond
  to a red → escalate → 8-step step 4 with Mark → recovery chart). Zero-invented-data rule holds:
  all seeds trace to real WE workbook/transcript figures.

---

## 10. Risks & open items

- **Ownership map.** The KPI→owner mapping (who must respond) isn't fully explicit in the dept
  JSON today; Phase 1 seeds it per department (L2 lead for board/main, L1 for owned sub-KPIs).
  Making it data-driven is a fast-follow.
- **Amber in the queue.** Whether at-risk (amber) KPIs also require a response, or only red, is a
  config flag — defaulting to **red-only requires a response, amber is watch-only** to avoid noise.
- **Scripted-reply breadth.** Phase-1 Mark must feel live across a few obvious questions per dept;
  we scope the scripted corpus to the demo's departments (Operations/Service first) and expand as
  boards come online.

---

## 11. Milestone mapping (OF-002)

This design directly advances **Milestone 3 (8-Step Assist)** and the **AI-employee** deliverable
on every board (M1–M6): the red-KPI response workflow is the "owner is notified, asked for cause,
response posted back" beat; the docked Mark + charts are the "surfaces problem-solving ~80% complete"
beat; the lifecycle track + roll-up is the "AI tracks whether 8-step is invoked and surfaces status"
beat.

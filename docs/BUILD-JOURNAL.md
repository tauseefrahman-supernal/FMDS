# FMDS OS / ADS — Build Journal & Conversation Tracker

> A meta-record of how this prototype was built across one long session: the arc of
> the conversation, every resource and tool used, the strategies and techniques,
> the decisions and pivots, the bugs we hit and fixed, and what we observed along
> the way. Written so a future session (new terminal) can pick up with full context.
>
> **Product:** FMDS OS — rebranded **ADS (Agentic Data & Operations Platform)**. The
> OF-003 client-facing prototype for **World Emblem**: the AI **management** layer
> (L1/L2) beneath **Leadership OS** (the AI executive layer).
> **Repo:** `/Users/tauseef/Documents/World-Emblem AI Strategy/fmds-os-prototype`
> **Hosted link (durable):** https://claude.ai/code/artifact/9244eac0-c2ca-4283-8794-0c5bf6c2f84b
> **Span:** 2026-06-30 → 2026-07-03. **Stack:** vanilla HTML + ES modules, no build
> step, no runtime deps; Node built-in test runner; Python http.server for local dev.

---

## 1. How the conversation evolved (the arc)

The prototype was not designed up front — it *converged* through ~10 waves of
direction, each triggered by a new piece of real discovery or a product insight.

| Wave | Trigger (user prompt, paraphrased) | What it produced |
|------|-------------------------------------|------------------|
| **0. Recon** | "Did we begin building any FMDS OS prototype?" | Found + retired an earlier throwaway (`prototype-fmds`). Fresh start. |
| **1. Plan** | "Help me plan my new prototype… I wrote an order form for FMDS (ADS)… pull my Granola transcript with Thomas & Naveen… how it looks for sales/service/marketing/HR/ODG… Randy is my department… read my Notion 'World-Emblem Products'." | Brainstorm → **spec** → **plan**. All 9 depts, 8-step, L1/L2 tiering. |
| **2. ROI reframe** | Naveen transcript: "use context from Naveen to improve the system… every dept a UI… enables 8-step… some depts L1+L2, some (marketing) L2 only… metric + context tracking per dept." | **ROI thesis = "removes the human poke-chain."** Metric + context per dept. |
| **3. SOP / 8-step / training** | "Every team has SOPs & standard work… ops very detailed… T3 meeting w/ Randy+Jim… problem-solving at L2 not just L1… story behind an L3 reduction… templates per dept… linked standard work… agent supports human 60–80%… training tracked per human… Carlos ↔ revenue… every board interactive… deep discovery before implementation." | Linked SOP library, digital 8-step assistant, real KZ A3s, training model. |
| **4. Build** | "Continue without the terminal… Background here… Proceed." | **Subagent-driven build** of all 9 boards + problem-solving + standard work + agent + sources. |
| **5. Ship a link** | "Lock a hosted link and share it." (local servers kept dying) | **`bundle.py`** → CSP-safe self-contained Artifact. Durable URL minted. |
| **6. UX/UI redesign** | "Design the UX/UI with our design system… interactive app for dept leaders… eliminate double entry… source→KPI mapping is the biggest artifact… L1 sees own targets/logs reasons… L2 sees who contributed & why… ops has physical boards… simple L2/L1 login." | **Operations console** redesign: login/role gate, dark command rail, IBM Plex, Overview vs KPI-Boards split. |
| **7. Kill manual entry** | "The whole point is to eliminate manual entry — get data from source systems (WPS SQL + Business Central). Only safety incidents reported on HR. Keep NO manual entry." | Every KPI got a `targetSource`; Sources → **"Sourcing Plan."** Only ~10 safety items `manualOnly`. |
| **8. Lean Product QA** | "[Lean Product Playbook] does our L1 experience match?… QA + improve… connect the KPI boards… click PPLH Mexico → metric below + agent explanation/dropdown… filter by location… each KPI has an explanation." | **`explainKpi`** (measures·source·why-now); click-in drill on every KPI. |
| **9. DxD L1 drill + bug hunt** | "[2 DxD files] go into L1 KPIs for both teams & how they connect to systems… lead sees sub-KPIs, clicks into JC & his team… Team Noel merged but the database doesn't roll up right — spot it for me… design the Service L2/L1 board… a notes section where the agent writes what's driving the green." | Service **main→team→rep→sub-KPI** drill; **found the Team Noel roll-up bug**; queued the notes section. |
| **10. Mark + comments** | "Reframe the AI assistant into **Mark** (AI employee) that opens on the side and reasons over KPIs **+ meeting transcripts** (T2/T3/huddles)… every KPI (red highlighted, green too) gets a **comment section**; on KPI boards a footer when off-track; AI **and** human leave comments; the agent reads them and rolls up 'being actioned' to leadership." | **Mark** reframe + **two-voice per-KPI comment threads** (this session's deliverable). |

**Throughline:** the story moved from *reactive firefighting* (a red waits for a
manager to notice and poke up the chain) → *predictive, closed-loop operations*
(FMDS detects → explains the story → routes the 8-step → confirms → updates SOP →
Mark tracks the action and rolls it up).

---

## 2. Resources used

**Real discovery data (zero invented numbers — the hard rule):**
- FMDS workbooks: `WE FMDS/`, `WE FMDS/FMDS New/`, `World Emblem Leadership OS (…)/`
- Two **DxD (Day-by-Day)** files → Service/Sales L1 KPIs + the Team Noel bug
- The **41 MB `sharepoint-map (1).html`** → linked Standard Work / SOP library
- **Granola** transcripts: Thomas + Naveen call; the **T3** meeting (Randy, Jim, team)
- **Notion** page: *World-Emblem Products* (order-form / product framing)
- Prior artifacts: `WE-Vault/kpis/` cascade deep-dives, `FMDS_OS_Lean_Product_Playbook.md`

**Tools & runtimes:**
- File tools (Read/Write/Edit), Bash, `git`
- **Node built-in test runner** (`node --test tests/*.mjs`) — 39 → 64 → **75 tests**
- **Python `http.server`** (`serve.py`, `no-store`) for local dev on `:8770`
- **Playwright MCP** — browser verification (login flow, screenshots, DOM asserts)
- **openpyxl** (`data_only=False`) — pulled real Excel *formulas* for roll-up logic
- **Anthropic Artifact publishing** — the durable hosted link
- `scratchpad/bundle.py` — the module→IIFE bundler for the CSP-safe single file

**MCP servers touched:** Granola, Notion, Playwright (Supabase/others available, unused here).

**Skills invoked:** `brainstorming` → `writing-plans` → `subagent-driven-development`
(implementer + reviewer per task), `frontend-design`, `artifact-design`,
`finishing-a-development-branch`.

---

## 3. Strategies & techniques that worked

1. **Zero-invented-data discipline.** Every number traces to a real workbook cell,
   transcript line, or Power BI figure. Illustrative depts are explicitly badged.
2. **Deep discovery before implementation.** Each wave produced markdown discovery
   docs under `docs/superpowers/specs/discovery/` *before* any code.
3. **TDD logic core + browser-verified views.** Pure logic (rollup, rag, registry,
   explain, comments) is unit-tested; views are verified live in Playwright.
4. **Subagent-driven development.** Fresh implementer per task, review between tasks,
   controller keeps context clean. Used again this session for the Service L1 drill.
5. **Multi-pass builds.** Big features split into serialized passes (Pass A = Service
   drill + Noel flag; Pass B = Mark + comments) to avoid same-file conflicts.
6. **Bundle-to-Artifact for a durable demo.** Local servers get culled at turn end,
   so `bundle.py` concatenates ES modules into `window.__M` IIFEs, embeds JSON +
   a `fetch` shim + a localStorage guard, and falls fonts back to a system stack
   (Artifact CSP blocks the Plex webfont). Redeploy with the **same file path →
   same URL**.
7. **Design-system-first UI.** Dark graphite command rail + light canvas, IBM Plex
   Sans/Mono, electric-blue accent `#2f6bff`, RAG reserved strictly for status.
8. **Progressive IA.** Split **Overview** (red-green summary + agent "why") from
   **KPI Boards** (level-by-level drill) once the board got dense.

---

## 4. Key decisions & pivots (with rationale)

- **ROI = "removes the poke-chain"** (Naveen). The sellable story, not feature lists.
- **L2 is the primary user;** L1 built only where real per-rep data exists (Sales,
  Service, Operations-by-location); notes-only elsewhere.
- **Problem-solving = their real 8-Step A3 = their Kaizen record** (each a `KZ-###`).
  Triggered by a red **sub**-KPI; agent pre-drafts steps 1–6; Step 6 = ODG gate;
  Step 8 = SOP write-back / Yokoten.
- **Star demo beat = Operations Mexico OTP** (real 0.750; sample-surge inflated the
  denominator; the $40K short-code standard-work breakage as the worked 8-step).
- **ODG is the adoption meter** (FMDS 93.2% vs 8-Step 18.9%) — the product thesis.
- **User correction — LSW is OUT of scope.** Leader Standard Work / cadence belongs
  to Leadership OS, not FMDS OS. Standard Work view = **SOP library only** (commit 5ba05a7).
- **User correction — NO manual entry.** I had recommended building a manual-entry
  UI; corrected: source from **WPS (floor SQL/MES) + Business Central**; only ~10
  safety-incident items are `manualOnly`.
- **User correction — Mark, not "assistant."** The agent is a named **AI employee**
  that reasons over KPIs **and** the meeting record (T2/T3/huddles) and tracks the
  actions coming out of them.

---

## 5. Bug / fix log

| Bug | Fix |
|-----|-----|
| Stale views in Playwright (module caching) | `serve.py` `no-store` header + verify on fresh ports; hash-only nav doesn't reload — use `about:blank` bounce / new port |
| Operations OTP modeled wrong (cleanup set actual to Mexico's) | Mechanism B: parent OTP actual = 0.863 (WE main), Mexico series on `otp_mexico` |
| Logistics wrongly used the Operations location board | Gated location board to `dept.id==='operations'` |
| HR TRIR 1.2 rendered as "120%" | `formatVal` keys off `unit`, not magnitude |
| Floor reasons didn't surface at L2 | `seedDemoReasons()` auto-runs on browser import |
| `target=0` safety KPI showed red at 0 incidents | Special-case `target=0` in `ragStatus` |
| Playwright `select_option` failed on HTML-markup options | Plain-text option labels |
| Local dev servers culled at turn end (recurring) | Pivot to the hosted Artifact bundle as the demo surface |
| **Team Noel roll-up bug (found *in the client's data*)** | Reported, not "fixed" — `Data Base!BQ` empty → main = Team JC only ($16.10M) vs true $29.83M; surfaced in-product as a data-quality flag + Mark note. Fix for **Ricardo**: populate `Data Base!BP/BQ` rows 11–79. |

---

## 6. Observations & lessons

- **The product designed itself through discovery.** Each real artifact (transcript,
  workbook, DxD, SharePoint map) reshaped the IA. Front-loading discovery paid off.
- **User corrections were the highest-leverage inputs.** Three ("LSW out," "no manual
  entry," "make it Mark") each redirected significant scope — cheaper to absorb early.
- **The hosted bundle is the only durable demo.** Anything served locally dies at the
  end of a turn; always rebuild + redeploy after a change you want the client to see.
- **Keep two records:** the **memory file** (state to resume) and **this journal**
  (how we got here). They serve different future questions.
- **Next frontier = Mark reading meetings.** The comment threads are wired; the real
  agent step is ingesting T2/T3/huddle transcripts so Mark reports context and tracks
  the actions against KPIs. That's the path from framing → working agent.

---

## 7. Resume checklist (new terminal)

```bash
cd "/Users/tauseef/Documents/World-Emblem AI Strategy/fmds-os-prototype"
python3 serve.py                 # local dev on http://localhost:8770  (hardcodes 8770)
node --test tests/*.test.mjs     # 75/75 expected

# Rebuild the hosted bundle after any change:
python3 scripts/bundle.py                   # → dist + wrappers + .bundle-check.js
node --check .bundle-check.js               # syntax gate
#   then rebuild wrappers dist-test.html + FMDS-OS-World-Emblem.html (see below),
#   then re-publish FMDS-OS-World-Emblem.html to the SAME artifact URL.
```

- Wrapper build: `dist-test.html` = full-page wrapper of the fragment (local verify);
  `FMDS-OS-World-Emblem.html` = `<title>`+`<meta>` prepended (the Artifact publish file).
- **Checkpoint tags:** `v3-r1-console`, `v3-r4-console`. Latest commit: Mark + comments.
- **Hosted link:** https://claude.ai/code/artifact/9244eac0-c2ca-4283-8794-0c5bf6c2f84b

### Open threads / next steps
1. **Feed Mark the meetings** — T2/T3/huddle transcripts across depts → Mark reports
   context + tracks actions against KPIs + compiles "being actioned" for the roll-up.
2. **Activity / training-tracking layer** — per-person 8-step volume, targets, SOP
   updates; L1 clear, L2 by KPI-ownership (Marketing PC/CM model) + IDMP roles;
   Training Log = RH-FR-6.2-001.
3. **Replicate Overview + KPI-Boards drill** to the remaining departments (pattern
   proven on Operations + Service).
4. **Finalize WPS→KPI mapping** once the WPS schema is available.
5. **Order form** — `Product Blueprint/FMDS-OS-Order-Form-v3.md` (Sales/Service first).

---

*See also:* `docs/superpowers/specs/` (spec + discovery), `docs/superpowers/plans/`
(implementation plan), `FMDS_OS_Lean_Product_Playbook.md` (canonical strategy),
and the memory file `fmds-os-ads-prototype.md` (v1–v7 state to resume).

---

## 8. Session 2 (2026-07-08) — Mark (AI employee) + red-KPI accountability loop + interactive 8-step

**Trigger (user):** "The major thing missing is the AI-employee chat page that can reason over the
department context… I want a live cloud SDK… the accountability loop: where do you leave an
explanation for a red KPI?… design the red-KPI workflow and track whether each step is being done…
make the 8-step tracker interactive with a side chat (call him Mark) and charts… design first, then
harden the SDK."

**Process:** `brainstorming` (visual companion — 6 UI decisions mocked in-browser) → `writing-plans`
(12-task plan, lean per owner pref: files + interfaces + test intent, no inline code) →
`subagent-driven-development` (fresh implementer + spec/quality reviewer per task, whole-branch
review at the end). Spec: `docs/superpowers/specs/2026-07-07-mark-accountability-8step-design.md`;
plan: `docs/superpowers/plans/2026-07-08-mark-accountability-8step.md`.

**The 6 design decisions (visual companion):** (1) Mark = a new **page** + docked 8-step panel +
quick drawer; (2) Ask Mark page = **workspace** (queue left / chat right); (3) red-KPI response =
**two-tier** — a required 4-field template, escalate to a full 8-step when needed; (4) tracking =
**response lifecycle** (Detected→Responded→Action-underway→8-step→Reported→Recovered); (5) charts =
**full set** (recovery trend / gap / Pareto / stall-funnel); (6) live SDK seam = **local `serve.py`
`/api/mark` proxy** (Phase 2; UI ships on scripted-but-grounded replies).

**Shipped (11 tasks, merged to `main` @ `a7c5c7b`; tests 75 → 154):**
- NEW `lib/context.js` (department context Mark reasons over), `lib/accountability.js` (red-KPI
  response store + lifecycle + escalation), `views/askmark.js` (the Ask Mark page).
- Charts added to `lib/charts.js` (`svgRecoveryTrend`/`svgFunnel`/`svgPareto`); embedded across the
  8-step; docked proactive Mark co-pilot + clean tracker (Linked-red-KPI column, honest open-age
  flags, funnel) in `views/problemsolving.js`; `lib/agent.js` `liveReply` now context-grounded with
  a `step-help` intent; `app.js` 🔔 inbox popover → live-badge shortcut to the Ask Mark queue.
- KZ↔KPI linkage seeded in `data/kz-records.json` (`linkedKpiId` on 5 real Operations KZs).

**Notable bugs caught by the review loop (not shipped):** cross-department draft leak in the response
card (`_drafts` keyed by kpiId only); `lower_better` KPIs (HR TRIR/safety) rendering **inverted,
un-badged** RAG dots on the recovery chart (direction wasn't threaded into `svgRecoveryTrend`); the
escalation deep-link opening a **blank** 8-step instead of the real linked KZ; `summarizeReds`
gluing the OTP story onto unrelated reds; a no-op lifecycle test that passed even when the transition
was neutered. Each was fixed and re-verified.

**Process notes / gotchas:** the Anthropic API had a rough window — several subagents died mid-response
(529 / server errors) and one hit a hard **session usage limit**; recovered by resuming agents from
their transcripts and, once, by the controller finishing a task directly (T7 escalation — reviewed +
unit-tested, its browser-verify done later). One task (T8) ran in a **parallel git worktree** for
speed, but the worktree was cut from an old base so `lib/agent.js` needed a hand-merge on integration
— lesson: worktree parallelism costs an integration pass; only worth it for cleanly file-disjoint work.

**Open follow-ups (non-blocking, from the whole-branch review):** rename `rollupSignal.redCount`
(counts persisted entries, not live reds) before any dashboard reads it; tighten `isHeadlineKpi`'s
loose `includes` match; extract a shared `unansweredRedCount(dept)` helper (duplicated in `app.js` +
`views/askmark.js`); persist the dock dismiss state across same-step re-renders; add a
`liveReply('step-help',{dept})` regression test; de-dupe `.mark-dock` vs `.assistant-drawer` CSS;
`signOut()` should stop the inbox poll explicitly; remove dead `.inbox-panel` CSS. Data-quality:
`data/kz-records.json` has duplicate `kzNumber`s (KZ-345, KZ-352).

**Next frontier (unchanged):** Phase 2 — wire the live Claude call behind `liveReply` via the
`serve.py /api/mark` proxy (holds the key server-side; hosted Artifact stays scripted since it's
CSP-locked).

---

## 9. Session 3 (2026-07-09) — bundle republish + Phase D backend (Mark live agent, merged; E2E gated on key)

**Trigger (user):** "Proceed with building the artifact… app will be hosted on Railway in our company
account, credentials added cleanly (env vars; the Railway environment injects a cloud API key)…
if Phase D can begin, go ahead."

**Shipped:**
- **Hosted artifact republished** with the Supernal redesign (it had been stale since 07-03, still
  showing the dark-rail UI). `bundle.py` was recreated **in-repo** at `scripts/bundle.py` (the
  scratchpad copy died with its session) and now also embeds Inter/Lora/JetBrains Mono as base64
  `@font-face` (`scripts/fonts-embedded.css`) since the redesigned CSS needs webfonts under the
  Artifact CSP. Bundle bug found+fixed on rebuild: the fragment was missing `<div id="app"></div>`.
  Verified in-browser (login → Operations L2 → all views, 0 JS errors) before publish. Same URL.
- **Phase D merged to main @ 187bf02** (plan `2026-07-08-mark-agent-sdk.md`, Tasks 1–4 via
  subagent-driven-development, every task review-clean; tests 206 JS + 29 Py):
  `POST /api/mark` in a ThreadingHTTPServer `serve.py` (Railway-ready: `0.0.0.0:$PORT`, root
  `requirements.txt` pinned `anthropic>=0.116,<1`, `railway.json`; 503 without key; 413 >2MB body;
  generic 500 + stderr traceback) → `server/mark_agent.py` (tool_runner, claude-opus-4-8, adaptive
  thinking, max_tokens 16000 — NB: tool_runner REQUIRES max_tokens; effort lives in output_config)
  + `server/mark_tools.py` (8 read-only @beta_tool tools over posted context + data/*.json)
  + `server/mark_prompt.py` (frozen STABLE_PREFIX, identity-only suffix). Frontend seam:
  `liveReply` fetch-or-fallback (30s timeout; scripted reply on ANY failure, so the CSP-locked
  Artifact + keyless dev behave exactly as before); `buildDeptContext` gained a `responses` opt so
  Mark's `get_response_status` sees the accountability store.

**Run (local live test):**
```bash
python3 -m venv server/.venv && server/.venv/bin/pip install -r requirements.txt   # once
ANTHROPIC_API_KEY=sk-… server/.venv/bin/python serve.py                            # backend+static on :8770
# open http://localhost:8770 → Ask Mark (Operations L2) → live grounded replies; no key → scripted
```

**Task 5 (E2E with real key) still open + deploy checklist (from the whole-branch review):**
(a) `/api/mark` is UNAUTHENTICATED — set a workspace spend limit on the key before the Railway
deploy (accepted-risk sign-off); (b) measure real agent latency — likely raise the client
`MARK_FETCH_TIMEOUT_MS` 30s→60–90s (streaming is the durable fix); (c) add a `cache_control`
breakpoint on `system=` and verify `usage.cache_read_input_tokens>0` (4096-token min prefix);
(d) run the agent-sdk-dev Python verifier. Follow-ups + triage detail: `.superpowers/sdd/progress.md`.

**Task 5 E2E — DONE (2026-07-09, owner key):** first live run caught a real integration bug —
@beta_tool functions returning raw dicts/lists 400 the API ('tool_result.content.0.type: Field
required'); all 8 tools now return JSON strings (`_as_json`). Verified live: OTP question →
fully grounded reply (0.863/0.750 story, KZ-337/346/348, Galls surge, zero fabrication; even
flagged that WE-main OTP has no linked open A3); Hoshin question → get_hoshin (Jim Kozel + the
6 real activities); in-app Ask Mark chat verified in Playwright; keyless 503 → scripted fallback
verified in-app. Prompt cache CONFIRMED: `cache_read_input_tokens=4019` on follow-ups. Latency
14–31s → client timeout raised 30s→90s. agent-sdk verifier: READY, no criticals; applied its
cheap hardening (max_iterations=10 cap, stop_reason surfacing in reply+usage, `anthropic~=0.116.0`,
`.python-version` 3.12 for Railway). **Remaining owner decisions before the Railway deploy:**
(a) spend limit on the key + accept (or gate with a shared-secret header) the unauthenticated
endpoint; (b) known cost-leak: a client abort doesn't cancel the server-side API call; (c)
fast-follows: cache breakpoint on messages history, streaming (SSE) for long replies.

**Follow-up punch list — DONE (2026-07-09):** all 10 logged review follow-ups applied @ d688f55 +
04d6747 (tests 212 JS / 31 Py): isHeadlineKpi exact-match (hr/it corpus values fixed to 'TRIR
Overall' / '% Uptime'), toApiMessages moved to lib/agent.js + tested, /api/mark 400s on empty
messages, shared unansweredRedCount() in lib/accountability.js, rollupSignal.redCount →
entryCount, signOut() stops the inbox poll, dead .assistant-drawer CSS removed, mark_prompt
degenerate-grammar fix, cache breakpoint on the messages history (multi-turn cache extension,
verified live: 4133-token prefix written), hoshin-test intent comments. Bundle rebuilt +
republished. **DATA-QUALITY FLAG for World Emblem (like Team Noel — surface, don't edit):**
data/kz-records.json carries duplicate kzNumbers straight from the client tracker — KZ-339
(operations AND finance), KZ-345 ×2 (operations), KZ-352 ×2 (operations). Deep-links resolve to
the first match; ask Ricardo which rows are canonical before renumbering.

**Remaining backlog (product frontiers, need owner data/direction):** feed Mark the T2/T3/huddle
meeting transcripts (Granola) → context + action tracking; activity/training-tracking layer
(RH-FR-6.2-001); WPS→KPI mapping (blocked on WPS schema); FMDS-OS-Order-Form-v3; Railway deploy
(owner: spend cap on key, then point Railway at the repo — railway.json/requirements.txt/
.python-version are in place).

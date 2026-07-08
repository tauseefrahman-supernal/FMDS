# Design-System Migration (Phase A) — match the "Supernal standard" artifact

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.
> **Plan style (owner pref):** files + interfaces + verify intent + commits; no inline code bodies.

**Goal:** Re-skin the FMDS OS prototype to the design system of the directional artifact
(`FMDS OS — Operations · Redesign`, artifact `f97b357a`) — the approved "Supernal standard" — without
changing behavior or data. Fold in two targeted UI fixes the owner called out.

**Architecture:** Adopt the artifact's shadcn-style token system (HSL `--surface-*`/`--action-*` scales →
semantic tokens) + Inter/JetBrains Mono/Lora fonts in `styles.css`, then map every existing view's
styles onto the new tokens. Pure CSS/markup-class work — the JS logic, data, and the 154-test suite are
untouched. This is the visual foundation; the **Hoshin/ocean layer (Phase B)** and **per-department
layout rollout + per-user L1 (Phase C)** are separate follow-on plans (B is gated on the owner providing
the WE 2026 Hoshin data directly).

**Tech Stack:** Vanilla ES modules, no build step, no deps; `styles.css` (single stylesheet); Node test
runner; `serve.py` on :8770; Playwright for visual verification against the artifact.

## Global Constraints
- **Match the artifact exactly** — token values, fonts, radii, motion, spacing, and the look of each
  component. The reference is the artifact file saved at
  `~/.claude/projects/-Users-tauseef-Documents-World-Emblem-AI-Strategy-fmds-os-prototype/7204a86f-62ea-46bb-b6a9-8d861ae8609b/tool-results/artifact-f97b357a-1783469794-f0d9.html`
  (368 KB, self-contained) and the extracted reference from Task 1.
- **No behavior/data/logic changes** — `node --test tests/*.test.mjs` stays **154/154** on every task.
- **RAG stays reserved for status** — map to the artifact's `--green/--amber/--red/--info` (each with
  `-bg/-border/-text`). Never use a status hue decoratively.
- **Bundle-safe fonts** — the hosted Artifact is CSP-locked (no external hosts). Fonts must be embedded
  as base64 `@font-face` (the artifact embeds Inter this way) or degrade to a system stack; no reliance
  on a Google Fonts request for the bundle.
- **Design tokens only** — no stray hex in component CSS; every color/space/radius references a token.

---

### Task 1: Extract the artifact design-system reference
**Files:** Create `docs/superpowers/specs/2026-07-08-artifact-design-system.md` (+ optionally
`styles/tokens.css` if a clean token file helps). Read-only inputs: the artifact HTML (path above) and
the current `styles.css`.
**Deliverable:** a reference doc capturing (a) the COMPLETE `:root` token set (all `--surface-*`,
`--action-*`, semantic tokens, radii, motion, shadow, `--nav-width`, fonts); (b) the component/layout
patterns to replicate — app shell/nav rail, cards, buttons, chips/badges, tables, the Ask Mark layout
(incl. the action-required bar), the problem-solving tracker + wizard subheading, the KPI-board chart,
the Hoshin strip/disk; (c) the font-embedding approach (base64 woff2) for the CSP bundle; (d) a concrete
delta list vs the current `styles.css`. Skip the base64 font blob when reading.
- [ ] Extract tokens + patterns + deltas → write the reference doc.
- [ ] Commit: `docs: artifact design-system reference (Supernal standard)`.

### Task 2: Fonts — Inter / JetBrains Mono / Lora
**Files:** Modify `styles.css` (+ a `styles/fonts.css` or inline `@font-face` if cleaner); `index.html`.
- [ ] Add the three families bundle-safe (base64 `@font-face`, values sourced from the artifact) and wire
  `--font-sans` (Inter), `--font-mono` (JetBrains Mono), `--font-serif` (Lora). Remove the IBM Plex link.
- [ ] Verify in the browser that body copy renders Inter and metrics render JetBrains Mono; tests 154/154.
- [ ] Commit: `feat(style): adopt Inter/JetBrains Mono/Lora (bundle-safe)`.

### Task 3: Token layer in styles.css
**Files:** Modify `styles.css` (the `:root` block).
- [ ] Replace/extend `:root` with the artifact's `--surface-*` + `--action-*` HSL scales and the semantic
  tokens (`--bg`, `--panel`, `--muted`, `--border/-soft/-strong`, `--accent/-hover/-soft/-text/-fg`,
  `--secondary*`, `--green/amber/red/info` + `-bg/-border/-text`, `--radius*`, `--duration*`,
  `--ease-fluid`, `--shadow*`, `--nav-width`). Keep old token NAMES aliased where existing views
  reference them, so nothing renders unstyled mid-migration.
- [ ] Verify every existing view still renders (tokens resolve, no unstyled regions); tests 154/154.
- [ ] Commit: `feat(style): adopt artifact token system (surface/action scales + semantics)`.

### Task 4: App shell re-skin
**Files:** Modify `styles.css` (+ minimal class tweaks in `app.js` `renderLayout` if needed).
- [ ] Re-skin the command rail (→ `--nav-width` 248px + the artifact's rail treatment), topbar, and
  canvas to the new tokens, matching the artifact's shell.
- [ ] Browser-verify the shell against the artifact; tests 154/154.
- [ ] Commit: `feat(style): re-skin app shell to Supernal standard`.

### Task 5: Re-skin views — boards
**Files:** `styles.css` (+ class tweaks in `views/overview.js`, `views/kpi.js`, `views/teamboard.js`,
`views/teamboard-location.js`).
- [ ] Map board cards, KPI identity cards, the KPI-board chart, tables, chips/RAG to the new tokens.
- [ ] Browser-verify boards against the artifact; tests 154/154.
- [ ] Commit: `feat(style): re-skin overview/KPI/team boards`.

### Task 6: Re-skin problem-solving + standard work (+ wizard subheading fix)
**Files:** `styles.css` (+ `views/problemsolving.js`, `views/standardwork.js`).
- [ ] Re-skin the problem-solving tracker, the 8-step wizard, the read-only A3, the docked Mark panel,
  and Standard Work to the new tokens.
- [ ] **Targeted fix:** clean up the wizard subheading row so the owner / golden-thread / "opens the
  step" / AI-draft boxes are aligned and tidy (per owner feedback).
- [ ] Browser-verify against the artifact's tracker + standard work; tests 154/154.
- [ ] Commit: `feat(style): re-skin problem-solving + standard work; tidy wizard subheading`.

### Task 7: Re-skin Ask Mark (+ shrink action-required bar) + remaining views
**Files:** `styles.css` (+ `views/askmark.js`, `views/sources.js`, `views/myday.js`, `views/myboard.js`,
`views/odg-hub.js`, `views/login.js`).
- [ ] Re-skin Ask Mark (queue, chat, response card, lifecycle track) + sources/myday/myboard/odg-hub/
  login to the new tokens.
- [ ] **Targeted fix:** reduce the Ask Mark "action required" bar to ≈half its current height/footprint
  (owner feedback: it takes ~half the page).
- [ ] Browser-verify Ask Mark against the artifact; tests 154/154.
- [ ] Commit: `feat(style): re-skin Ask Mark (smaller action bar) + remaining views`.

### Task 8: Whole-app visual verification
**Files:** none (verification only).
- [ ] Playwright pass across every view/role at :8770, side-by-side with the artifact; capture any
  mismatches as a short punch-list. Confirm `node --test tests/*.test.mjs` = 154/154 and 0 console errors.
- [ ] Commit any final token/spacing nits: `fix(style): visual-parity punch-list`.

---

## Follow-on (separate plans, not this one)
- **Phase B — Hoshin/ocean layer:** `DATA.hoshin` model (objectives + `kpiMap` + activities), per-board
  Hoshin strip, per-function Hoshin page, and the CEO **Executive Hoshin Activities** view (activity
  cards: target · milestone · supporting function · date range · owner). **Gated on the owner providing
  the WE 2026 Hoshin data directly.** Operations Hoshin is extractable from the artifact.
- **Phase C — Per-department layout rollout + per-user L1:** restructure each department's views to the
  artifact's cleaner layouts across all 9 depts; make L1 differ by user (the artifact previews a single
  layer only).

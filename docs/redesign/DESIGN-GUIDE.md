# FMDS OS — Redesign Implementation Guide

**Audience:** the Claude Code session working on this prototype (`fmds-os-prototype/`).
**Goal:** bring every page of the prototype up to the redesigned artifact's design — same tokens, same components, same layouts.
**Source of truth:** the files in `docs/redesign/reference/` are the artifact's actual working source (vanilla JS + CSS, no framework). **Do not reverse-engineer the published HTML artifact — lift from these files instead.**

How to use this guide:
1. Read "Foundations" and port `reference/tokens.css` + `reference/base.css` into `styles.css` first. Most of the visual gap closes at this layer.
2. Then go page by page ("Per-page redesign"), comparing each view's markup to the matching `reference/view-*.js` renderer. The reference files use plain template literals — the class names and inline structural styles are the spec.
3. Run the "Definition of done" checklist at the end against every page.

Design-system provenance: rules come from the Supernal design system (the same system the World Emblem Leadership OS `index.css` already uses). Anchor palette is the sage/warm-neutral set below. Status colors are semantic-only. Charts use the viz palette only.

---

## 1 · Foundations (do this first)

### 1.1 Color tokens — copy `reference/tokens.css` verbatim

Key values (HSL triplets, wrapped in `hsl()` at point of use):

| Role | Token | Value |
|---|---|---|
| Page background | `--bg` | `hsl(40 20% 97%)` — warm off-white, never pure white |
| Card / panel | `--panel` | `#ffffff` — pure white lifts off the warm page |
| Subtle fill (hover, table header) | `--bg-subtle` | `hsl(36 19% 95%)` |
| Muted fill (tracks, chips) | `--muted` | `hsl(26 19% 93%)` |
| Action (buttons, links, active nav, focus) | `--accent` | `hsl(166 28% 36%)` sage |
| Action hover / text-on-light | `--accent-hover` / `--accent-text` | `hsl(167 38% 25%)` |
| Action subtle bg (ghost hover, tints) | `hsl(var(--action-1))` | `hsl(161 33% 98%)`, border `--action-3` `hsl(162 27% 85%)` |
| Text | `--text` | `hsl(30 7% 6%)` |
| Secondary text | `--text-secondary` | `hsl(30 2% 10%)` |
| Dim text (metadata) | `--text-dim` | `hsl(35 9% 37%)` |
| Faint text (captions, axis) | `--text-faint` | `hsl(33 9% 56%)` |
| Borders | `--border` | `hsl(30 7% 6% / 0.10)` — **alpha hairlines, never solid gray hex** |
| Border soft / strong | `--border-soft` / `--border-strong` | same base at `0.08` / `0.15` |

Status (semantic ONLY — a status hue must always mean its state, never decoration):
- green `hsl(145 63% 42%)`, text-on-tint `hsl(142 72% 29%)`, bg `hsl(139 76% 97%)`, border `hsl(141 79% 85%)`
- amber `hsl(28 80% 52%)`, text `hsl(26 91% 37%)`, bg `hsl(48 100% 96%)`, border `hsl(48 97% 77%)`
- red `hsl(6 63% 46%)` (text = same), bg `hsl(0 86% 97%)`, border `hsl(0 96% 89%)`
- info `hsl(204 64% 44%)`, bg `hsl(214 99% 97%)`, border `hsl(213 97% 87%)`

Viz palette (charts and identity accents only — never on buttons/badges/status):
`--viz-single: 197 13% 52%` (default series, blue-gray) · `--viz-2: 9 37% 56%` (rust — the "story" series, e.g. Mexico) · context lines `hsl(210 2% 49% / 0.45)` · grid `hsl(30 7% 6% / 0.07)` · target line `hsl(35 9% 37% / 0.55)` dashed.

**Delete/replace:** any `--slate-*`, Tailwind-default blues (`#3b82f6`, `#2563eb`), pure `#fff` page backgrounds, solid gray borders (`#e2e8f0` etc.), and blue link color on everything. Links and interactive accents are sage.

### 1.2 Typography

| Role | Face | Where |
|---|---|---|
| Display | **Lora** 600 (500 for dept name) | Page titles (h1), section h2, the ONE hero numeral per view, brand mark monogram |
| UI / body | **Inter** 400–700 | Everything else. `font-feature-settings: "ss01","cv11"` |
| Mono | **JetBrains Mono** 400/500 | KZ numbers, source refs (`WPS`, `C104`), chips — never body text |

Scale: h1 30px (detail pages 24px — see Standard Work fix below), h2 22px serif, h3 15px/600, body 14px, meta 12–13px, captions/axis 10.5–12px.
Rules:
- **Running heads**: every section label is `11px / 600 / letter-spacing 0.08em / uppercase / --text-faint` (class `.running-head`). No bold-black section headers.
- **`font-variant-numeric: tabular-nums` on every numeric column, KPI value, and meta date.** Hero/stat values use proportional figures (no tabular).
- Body/prose max-width 65–75ch (`max-width: 65ch` on `p`). Never full-width paragraphs.
- One h1 per page. One hero (serif, large) number per view maximum.

### 1.3 Shape, elevation, spacing, motion

- Radius: 8px default (cards, buttons, inputs), 4px chips/small, 12px modal only, 9999px pills/avatars/badges.
- Shadows: cards `--shadow-sm` (`0 1px 2px hsl(30 2% 10% / 0.07)`); popovers/dropdowns `--shadow-md` + inset hairline ring; modal `--shadow-lg`. **Never** heavier shadows on flat content; never `rgba(0,0,0,…)` — shadow color is `30 2% 10%`.
- Spacing scale: 4/8/12/16/24/32/48/64. Card padding 24px, symmetric. Section breaks 48px (`.section-head` handles it). Gap between groups ≥ 1.5× gap within groups.
- Motion: 100–300ms only, `ease-in-out` for state change, `ease-out` entrances. Hover = background-color/border-color transitions at 150ms. **No entrance animations on page load, no staggered lists.**
- Focus: visible ring `0 0 0 2px var(--bg), 0 0 0 4px hsl(166 28% 36% / 0.55)` via `:focus-visible`.
- `prefers-reduced-motion`: global 0.01ms override.

---

## 2 · Shell — same on every page

Port from `reference/app.js` (`renderShell`) + `reference/base.css` (`.shell`, `.sidebar`, `.topbar`, `.canvas`).

- **Sidebar (the biggest visible change): LIGHT, not dark navy.** 248px fixed. Background `hsl(26 19% 93%)` (surface-3), hairline right border. Contents top→bottom: brand (32px sage rounded square with serif "FM" + "FMDS OS"/"WORLD EMBLEM"), Department block (running-head label, serif dept name 19px, role badge + lead), "Boards" nav, footer persona + "Switch Role / Sign Out" outline button.
- **Nav items**: 36px min-height, 13px/500, radius 8px, real inline **SVG stroke icons (1.5px stroke)** — remove the `◎ ◆ ⚑ ≣ ⛁ ◇` glyph characters. Active = `hsl(30 20% 90%)` pill bg + sage text 600. Hover = same pill bg, text darkens. A 6px red dot on Overview when a KPI needs attention.
- **Topbar**: 56px sticky, translucent page-bg + blur, hairline bottom border. Left: breadcrumb `Operations / <View>` (13px, dept bold). Right: `Ask Mark` outline button (sparkle icon), bell icon-button with red count, search input (icon inside, 240px), `Rolls up to Leadership OS` pill.
- **Canvas**: max-width 1440px, centered, padding 32px 48px 64px. Shell uses `display:flex; overflow:hidden`, content `flex:1; min-width:0; overflow-y:auto` (prevents wide tables breaking layout).
- **Inbox popover**: white card, `--shadow-md` + hairline ring, 360px. Items are **buttons** — item 1 routes to Problem-Solving (opens KZ-346), item 2 to Standard Work (opens the BWI detail).

Page header pattern (every view):
```
.page-head  (flex, space-between, align-end, margin 16px 0 32px)
  ├─ eyebrow running-head        e.g. "OPERATIONS · TEAM BOARD"
  ├─ h1 (Lora)                   e.g. "Overview"
  └─ .page-head__sub 13.5px dim  e.g. "L2 · Jim Kozel · 1 KPI needs attention"
  right side: secondary + ONE primary button max
```

---

## 3 · Component specs (shared vocabulary)

All CSS lives in `reference/base.css` + `reference/views.css`. Class names below are the spec — reuse them.

**Buttons** `.btn` — 34px min-height, radius 8, 13px/500. Variants: `--primary` (sage fill, white text; **max one per view**), `--secondary` (`hsl(30 20% 90%)` fill), `--outline` (white bg, sage border+text), `--ghost` (sage text, tint hover), `--ghost-neutral`. Primary sits rightmost in any decision group. Labels = Verb + Object ("Open 8-Step", "Submit Response") — no bare "Submit".

**Badges** `.badge` — pill, 11.5px/500, tinted bg + calibrated text + tinted border, optional 6px dot. Tones: `--green|--amber|--red|--info|--neutral|--outline`. Status text on tint MUST use the `-text` value (e.g. green text `hsl(142 72% 29%)`), never the base status color. Don't badge every row — badge only state.

**Status cell** `.status-cell` — dot + label ("On Track / At Risk / Off Track / No Data"), 12.5px/500, colored text. This is the table-status idiom (replaces colored pill-per-row).

**Chips** `.chip` — mono 10.5px, `--muted` bg, hairline border, radius 4. For provenance/meta: `WPS`, `hand-keyed`, `Mechanism B`. Sage-tinted variant for `formula`. `.hoshin-chip` — sage-tinted pill `H2` `H4`.

**Cards** `.card` — white, hairline border, radius 8, `--shadow-sm`. `card--pad` = 24px. Interactive cards: hover bg `--bg-subtle` + border strong; never put shadows on hover. **Cards are for discrete entities only** — never wrap page intro text or every paragraph in a card.

**Tables** `.table-wrap > .table-scroll > table.dt` — the single table idiom everywhere:
- wrapper: hairline border, radius 8, `overflow:hidden`, shadow-sm, white bg; `.table-scroll` gives `overflow-x:auto`
- `th`: 36px, 11px uppercase 0.06em, `--text-dim`, bg `--bg-subtle`, bottom hairline
- `td`: 10px 16px padding, hairline row dividers (`--border-soft`), last row no border
- first column 500 weight; numeric columns `.num` right-aligned tabular; row hover `--bg-subtle`
- category bands (KPI boards): full-width `td` with running-head text on `--bg-subtle`

**Segmented control** `.seg` — `--muted` track (3px padding), items 28px; selected = white bg + `--shadow-xs` + 600. Used for location tabs and chart-KPI switcher. Disabled items 45% opacity with "no data" note.

**Inputs** `.input` — white bg, `--border-input` hairline, radius 8, 13px. Placeholder `--text-faint`.

**Modal** (`.modal-overlay` + `.modal-panel`) — the click-into/popup/close pattern: scrim `hsl(30 7% 6% / 0.5)`, panel 760px max / 84vh, radius 12, `--shadow-lg`, header (title+meta left, badge + × icon-button right), scrollable body, footer right-aligned `[secondary Close][primary action]`. Dismiss: ×, Close, overlay click, Escape.

**Popover** `.popover` — white, radius 8, `--shadow-md` + inset hairline ring. Dismiss on outside click.

**Misc idioms:** `.step-track` (8 16px numbered dots, done = sage fill — tracker progress); `.life-chip` (lifecycle pills: done = sage tint, current = sage fill, todo = muted); `.q-card` (compact queue card, selected = 3px inset sage edge); `.thread-item` (recent-threads row); `.hoshin-disk` (numbered serif circle; drives = sage fill, supports = blue-gray fill, other = muted); `.q-chip` (quarter chips); `.chart-fig` (chart in subtle-bg figure + caption row + optional `illustrative` outline badge); `.drop-zone` (dashed attachment strip, sage tint on hover); `.kz-meta` (header meta row of atomic no-wrap segments with pill chips + divider ticks).

---

## 4 · Charts (lib/charts.js → port from `reference/charts.js`)

Hard rules:
- Series colors from the **viz palette only** — default single series `hsl(197 13% 52%)`; the emphasized "story" series (e.g. Mexico) rust `hsl(9 37% 56%)`; de-emphasized context lines `hsl(210 2% 49% / 0.45)`. **Never blue `#3b82f6`, never status red/green as a line color.**
- 2px lines, round caps; area wash = series color at 10% opacity; endpoint dot 3–4px radius with **2px white ring**; grid = 1px solid hairlines (never dashed); axis text 10.5px `--text-faint` tabular.
- Target = dashed 1px `hsl(35 9% 37% / 0.55)` line, labeled `Target 99%` at the **left** edge (never right, it collides with end labels).
- Multi-series: direct **end labels** (`Mexico 54%`) with vertical collision nudging + a legend; single series: **no legend** (title carries it).
- Hover: crosshair + tooltip (white card, shadow-md, running-head label + rows with swatches). Sparklines get the same tooltip.
- Sparklines (tables/tiles): ~120×34, area wash, dashed target, ringed endpoint.
- Pareto (`paretoBars`): horizontal bars, largest first, first bar rust + rest muted gray, value labels at bar end.
- Recovery chart (`stepChart` with `projected`): solid actual series, dashed projected tail with **hollow dots**, vertical "countermeasure in" marker, `illustrative` badge in the caption.
- Chart adapts per KPI (KPI Boards): seg control switches OTP (multi-location) / PPLH / Materials (single series vs target); title + subtitle + axis format change together.

---

## 5 · Per-page redesign

### 5.1 Overview (`views/overview.js`)
- Page head: eyebrow `OPERATIONS · TEAM BOARD`, h1 "Overview", sub "L2 · Jim Kozel · 1 KPI needs attention". Right: `Sources` secondary + `Open KPI Boards →` primary.
- Section running-heads: `NEEDS ATTENTION`, then `ON TRACK`.
- **Hero card** (red KPI): one wide card, 2 columns (5fr/7fr, hairline divider). Left: KPI name h3 + `Off Track` badge; **serif hero value 56px** (`86.3` with smaller `%`); "vs target **98.5%** · Mechanism B — main entered independently"; full-width sparkline w/ target line; footer = source note + ghost "Open in KPI Boards". Right: Mark's notes as a **thread** (28px round avatar "M", name + "AI Employee" + accent running-head "What's driving this", 13.5px/1.6 text), second note with `Review Draft 8-Step` outline button that deep-opens KZ-346.
- Green KPIs: `.stat-tile` cards in a grid — label + badge, 26px value, "vs target … · higher/lower is better", sparkline, source + ghost link. **No left color-bars on cards** (old design) — state lives in the badge.

### 5.2 KPI Boards (`views/teamboard-location.js`)
- Head sub: "L2 · Jim Kozel · Location model — expand OTP or PPLH for operator and line contributions". `Back to Overview` secondary.
- **Hoshin strip** card above tabs: five numbered `.hoshin-disk`s (2·4 sage = drives, 5 blue-gray = supports, 1·3 dimmed), bold one-liner "This board drives Hoshin 2 · Financial Performance and 4 · Organizational Development", dim support sentence, `Open Hoshin View →` outline button. Whole strip clickable → Hoshin view.
- Location switcher: `LOCATION` running-head + `.seg` (WE Main default, Mexico, Norcross, Houston, Canada, disabled DR/HPI with `no data`). Filter input right.
- **Adaptive chart card** (WE Main): title/subtitle/legend swap per seg selection (see §4). OTP = 5 lines with Mexico rust+wash emphasized; PPLH/Materials = single series.
- KPI table: columns `KPI | Target | Actual | Status | Target source | Trend`. KPI cell = caret button (rotates 90° open) + name + `Mechanism B` chip + `H2/H4` hoshin chips. Status = `.status-cell`. Source = `.chip`. Trend = sparkline. Expanded location sub-rows: indented, lighter bg, `hand-keyed` chips, flag notes as 12px dim text inside the row. OTP expanded also reveals a red-left-bordered "T3 OTP story" card with a 3-field grid (Denominator / Backlog / Mechanism).
- Per-location boards: summary strip card (`Houston FMDS board · 43 KPI column-pairs · 6 production lines · 1 building` + lines list + note), then the same table with `SAFETY/QUALITY/SERVICE-DELIVERY/COST/HRD` category band rows, `manual`/`formula` chips, expandable contributions (line rows) and SRR people rows with meter bars.
- Footer `.board-hint` explains WE Main/Mechanism B + chip legend.

### 5.3 Hoshin (new view — port `reference/view-hoshin.js` wholesale)
- Eyebrow "WE 2026 HOSHIN · FUNCTIONAL LEAD: JIM KOZEL", h1 "Operations Hoshin".
- Section 1: 5 objective cards (auto-fit ≥230px): disk + name + `Ops drives`/`Ops supports` badge + 1-year priority text. Ops-driven cards get sage border.
- Section 2: one card per activity plan. Header row: mapped disks, plan h3 + "Hoshin priority: …" faint line, Lead block (running-head + name), Q1–Q4 `.q-chip`s. Body: table `Target · Milestone | Support function (chip) | Accountable | Due | Status`. Footer band "Measured on this board by PPLH…".
- Close with a support-functions note card (blue-gray left border): support targets appear on that function's own Hoshin page.

### 5.4 Problem-Solving tracker (`views/problemsolving.js`)
- Head: h1 "Problem-Solving Tracker", sub "31 total · 16 open · 15 closed · 3 full A3s — Operations". Right: red sub-KPI `<select>` + `Open 8-Step (AI-Drafted)` primary.
- **AI-draft banner** (sage left border): Mark avatar + "AI-drafted 8-step ready for review — KZ-346…" + one dim line + `Review Draft 8-Step →` primary.
- Table: `Item | KZ # | Who | ODG | Start | Progress (1–8) | Status | (action)`. KZ# mono + `white-space:nowrap` (also on Start). Progress = `.step-track` dots + `6/8`. Status badges green Closed / info Active. KZ-346 row sage-tinted with `AI draft ready` chip + `Open 8-Step` outline button.
- "How the 8-step is triggered" prose card + `.board-hint` footer.

### 5.5 The 8-step A3 (the big one)
Layout (port `reference/view-solve.js` `renderKz346` + `stepBody`):
- **Header**: eyebrow, h1 `KZ-346 · Pricing Credit Memos Feb '26`, then **`.kz-meta` row** — `Owner P. Fernandez │ Golden Thread [OTP 86.3%] ▸ [OTP — Mexico 75.0% vs 98.5%] ▸ opens this 8-step │ [AI draft · steps 1–6 pre-solved · 4 confirmed]` — pill chips, tabular nums, atomic segments (nothing wraps mid-value). **No banner box** — that info lives only in this row + a right-aligned source note inside the step.
- **Horizontal step bar** `.step-bar`: 8 equal tabs (number-circle ✓ done sage / active outlined+underline, name, PDCA sublabel). No vertical rail.
- **Canvas**: full-width card, work area padded 32/40, Mark AI-assist docked right column 300px (`.eightstep__assist`: header, per-step note card, chat thread, "Ask Mark about this step" composer). Grid `1fr 300px`; assist hides <1100px.
- Step content = real A3 fields (never a "content ready" placeholder):
  1. Ultimate Goal / Standard / Current / **Gap in red callout** + gap-trend chart + `.drop-zone`
  2. What/Where/When/Who grid + prioritized problem (sage callout) + **Pareto chart**
  3. Do What / To What / By When 3-col + gap chart
  4. 5-Whys ladder rows (`Why n` + 6M `.chip` + text on subtle bg) + root cause in sage callout + `high-leverage` chip
  5. **Score-entry matrix**: text inputs + `0/1/2` selects for S/Q/C/T/Cu/Ef + bold OA rank select + `Add Countermeasure` (appends editable row, focuses it) + Nemawashi note
  6. Action register table (R/Y/G/C badges) + `Add Row` + **ODG gate** subtle card ("Submitted — awaiting ODG" amber badge + `Mark ODG-Approved` secondary)
  7. KPI/baseline/result/new-target grid + **recovery chart** (projected dashed tail, countermeasure-in marker, `illustrative` badge) + drop-zone
  8. Docs/training/Yokoten/image grid + drop-zone + **SOP write-back** sage-tinted card with `Update Standard Work` primary → routes to the BWI detail in Standard Work
- Footer nav inside canvas: `Previous` ghost left, `Confirm & Next` primary right (step 8: "Confirm Step 8 — Close KZ").

### 5.6 Standard Work (`views/standardwork.js`) — including fixes for the current state (see screenshot notes)
Library: page head (eyebrow `OPERATIONS · DOCUMENT LIBRARY`), count pills (`69 SWI` etc.) + collection badges, `.dt` table `Type | Document | Area/Product | Owner | Lang | Link` (`.doc-type` mono chips; link = `Open In-App` outline button or `link pending` outline badge), then `SOPS AVAILABLE IN-APP` running-head + featured card (sage left border, BWI + `Full content in-app` badge + purpose + meta + `Updated by KZ-346…` info badge), footer legend.

SOP detail — **the current implementation has these specific problems; fix all of them:**
1. **Title too big and wrapping** — detail-page h1 is 24px (not the 30px+ display size). Long titles stay serif but tighter: `font-size:24px; max-width:30ch`.
2. **"Back to Library" floats mid-content** — it belongs in `.page-head__side`, top right, as a `--secondary` button aligned with the title block.
3. **Scope/Linked-forms are loose under the title** — Purpose and Scope live in one `card--pad` with running-heads; linked forms render as a dim line inside the backlinks card, not free-floating chips at the top.
4. **The steps table columns are italic** — no italics anywhere. `Key points` = 400 `--text-secondary`; `Reason / why it matters` = 400 `--text-dim`. `#` column tabular. Use the standard `.dt` treatment (tinted uppercase header, hairline dividers, bordered wrap).
5. Below the table: two side-by-side cards — `8-step backlinks` (mono KZ ref + linked forms) and `Revision log`.

### 5.7 Sources (`views/sources.js`)
Head "Sourcing Plan" + sub "Where each number comes from. The number is sourced — not re-keyed." Target-systems summary card (badges + `19 KPIs · 2 source systems · 0 manual-only`), **amber left-border banner** "Double-entry being eliminated. …", `BY SOURCE SYSTEM` cards (WPS 13 / Business Central 6) with per-KPI rows + `re-keyed today` amber / `direct pull` green badges, then the 3-node flow (`Source system → FMDS vault → FMDS board`, middle node sage-tinted) with arrow separators, and the flow note as `.board-hint`.

### 5.8 Ask Mark (`views/askmark.js`) — chat-first + popup
- Head: 44px avatar + serif "Mark", sub "AI Employee · Operations · 0 stalled · 1 response logged". Right: red/amber count pills + **`+ New Chat` primary**.
- Grid 34fr/66fr. Left: `NEEDS RESPONSE` + count → **compact `.q-card`** (status-dot + KPI name, `✓ Answered`/`Respond` badge, 18px value + small rust sparkline, one meta line ending in accent-colored "Open response card"). Below: `RECENT THREADS` → `.thread-item` list (title + "Jul 8 · 3 messages"), clickable to load that conversation; active state.
- Right: **chat card** = thread header ("THREAD · Why is OTP red?"), scrollable messages (user = muted right-aligned bubble; Mark = avatar + white bubble; system confirmations = sage-tinted bubble), docked composer (Enter sends, Shift+Enter newline).
- **Response card = modal** (§3 Modal) opened from the q-card: KPI title+meta, `✓ Response submitted` badge, ×; body = WE-OTP-vs-target chart + caption, lifecycle track (`Detected ✓ › Responded ✓ › Action underway (current) › 8-step opened › Reported › Recovered`), the four response fields; footer `Close` + `Edit Response`.
- New Chat pushes a fresh thread (Mark greeting), titles itself from the first user message.

### 5.9 My Day — L1, Service/Diane (`views/myday.js`)
Sidebar/breadcrumb switch to Service · Diane · L1 badge. Serif greeting h1 "Good day, Diane." + date sub. **Headline hero card** (2-col like Overview): left = "MY HEADLINE" running-head, KPI name, serif `$116,430`, "vs target $26,960 / wk · rolls up to Team JC → Incoming Rev WE", source note; right = "8-WEEK TREND" + full-width sparkline + footnote of the weekly series. Amber-left-border **Data flag** card (Bowler note). `MY ACTIVITY DRIVERS` grid of stat tiles (value, `Target —`, sparkline; `No Data` outline badge when no target, `On Track` for HP New Quotes 11/10). `THIS WEEK'S CONTEXT`: "Log a reason" composer card (textarea + `Save Reason` primary) + "Logged reasons" card (status-dot entries, new entries prepend).

---

## 6 · Definition of done (run per page)

- [ ] Page bg `hsl(40 20% 97%)`, cards pure white, hairline alpha borders — zero solid-gray borders, zero non-token colors
- [ ] Sidebar light; SVG icons; active item = pill + sage
- [ ] One serif h1; section labels are running-heads; body ≤75ch; no italics-as-style
- [ ] All numbers in tables/meta are tabular-nums; numeric columns right-aligned
- [ ] Status appears only as `.badge`/`.status-cell` with calibrated `-text` colors; never colors a chart line or a decorative element
- [ ] Charts: viz palette, 2px lines, 10% wash, ringed endpoint, dashed neutral target labeled left, hover tooltip; single series → no legend
- [ ] Exactly one primary button per view, rightmost in its group; labels Verb+Object
- [ ] Tables use the `.dt` idiom (tinted uppercase header, hover, bordered scroll wrap)
- [ ] Interactive things look interactive (hover states, carets, cursor); non-interactive things don't
- [ ] Deep-linkable state via hash params where the artifact has it (`view`, `loc`, `chart`, `kz`, `step`, `sop`, `respond`)
- [ ] No entrance animations; reduced-motion respected; `:focus-visible` ring on everything focusable

Anti-patterns to hunt down and remove: dark navy rail; emoji/glyph nav icons; blue default accents; colored 4px left borders as the primary status signal on KPI cards; mono font for hero numbers; "AI content ready" placeholder boxes; banner boxes that restate what a chip can say; italic table columns; centered page-level buttons; more than 3 font weights fighting on one screen.

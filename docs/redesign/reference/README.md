# Redesign reference source

These are the **actual working source files** of the redesigned artifact (vanilla JS + CSS, no framework, no build step beyond concatenation). They exist so you never have to extract patterns from the published HTML artifact.

| File | What to lift from it |
|---|---|
| `tokens.css` | The complete design-token layer (colors, radius, spacing, shadows, motion, fonts). Port into `styles.css` near-verbatim — it is the foundation everything else references. |
| `base.css` | Shell (sidebar/topbar/canvas), typography defaults, buttons, badges, cards, tables (`.dt`), seg control, inputs, popover/drawer, utilities. |
| `views.css` | View-specific components: hero KPI card, stat tiles, AI-note thread, KPI-board rows/chips/status cells, step bar + A3 grids/callouts/whys, score entry, chart figures, drop zones, Hoshin disks/strip/chips/q-chips, Ask Mark q-card/thread-item/chat-surface/modal, lifecycle chips, My Day driver grid, inbox popover, `.kz-meta`. |
| `charts.js` | Chart helpers meeting the dataviz spec: `sparkline`, `lineChart` (multi-series + end labels + collision nudge), `stepChart` (gap/recovery + projected tail + countermeasure marker), `paretoBars`, `meter`, `fmtVal`, `wireChartHover` (tooltips + crosshair). |
| `app.js` | Shell renderer, nav definition (SVG icons), inbox popover with routed notification items, hash deep-link parsing (`view/loc/chart/kz/step/sop/respond`). |
| `view-overview.js` | Overview: hero red-KPI card with Mark thread, on-track stat tiles. |
| `view-kpi.js` | KPI Boards: Hoshin strip embed, location seg, adaptive chart (`CHART_META`/`weMainChart`), WE-main expandable table, per-location boards. |
| `view-hoshin.js` | Hoshin view: objective cards, activity-plan cards with target/support/accountable tables, `hoshinStrip()` + `hoshinChips()` used by KPI Boards. |
| `view-solve.js` | Tracker (step-track dots, AI-draft banner) + the full A3 wizard: horizontal step bar, per-step bodies with charts, score-entry matrix, ODG gate, SOP write-back, `.kz-meta` header, Mark assist panel with chat. |
| `view-rest.js` | Standard Work (library + SOP detail), Sources, Ask Mark (chat-first, threads, response modal), My Day (Diane). |

Notes for porting into this prototype:
- The reference renders with template literals into `#view-mount`-style containers; the prototype's per-view modules can adopt the same markup/classes with their existing data plumbing (`lib/store.js`, dept JSON). Class names + structure are the spec; the data lookups are yours.
- The reference `DATA` object mirrors `data/operations.json`, `data/service.json`, `data/kz-records.json`, `data/sops/operations-shortcode.json`, `data/eightstep-template.json` and the Hoshin content from `CEO DASHBOARD 26.xlsm → Executive Hoshin Activities` (Operations block, rows 98–140) plus the 5 objectives from `2026 Hoshin Ojectives V-3.pptx`.
- Fonts: Lora (500/600 + 500 italic), Inter (400–700), JetBrains Mono (400/500). The prototype can load them from Google Fonts; the artifact inlines them only because of its CSP.
- Read `../DESIGN-GUIDE.md` first — it explains where each piece goes and contains the per-page checklists.

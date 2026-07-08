# Design System Reference — Supernal Standard for the FMDS OS Re-skin

**Date:** 2026-07-08
**Owner:** Tauseef Rahman (AI Strategy / Delivery)
**Status:** Reference — read this before touching `styles.css` or any view
**Purpose:** This is the ONE source of truth for the re-skin. It translates the Supernal brand
palette into plain CSS custom properties for our vanilla stack (no Tailwind, no shadcn, no
React), and captures the component/layout patterns already proven in the shared FMDS OS /
Leadership OS artifact so both surfaces read as one system.

**Sources used:**
1. `~/Downloads/design-system-supernal (2)/references/supernal-palette.md` — authoritative token
   *values* (Supernal Source palette).
2. The World Emblem Leadership OS artifact (`claude.ai/code/artifact/f97b357a-…`) — a live sibling
   app already running this exact palette in vanilla CSS + template-literal JS (same shape as our
   prototype: no framework, no build step for markup). Its compiled `<style>` block is the single
   best evidence of "palette → real CSS" translation, and its rendered HTML/JS strings show the
   actual component markup (page headers, wizard subheader, Ask Mark chat, Hoshin strip/disk,
   KPI-board chart). Quoted verbatim below where useful.
3. `styles.css` (repo root) — what we are migrating *from*.

---

## 0. Framing — why this doc looks the way it does

The palette skill (`design-system` skill) targets Tailwind v4 + shadcn + React: tokens as
`--color-*` OKLCH/HSL pairs consumed via `bg-[hsl(var(--x))]` utility classes and shadcn
primitives. **None of that applies here.** FMDS OS is hand-written ES modules + one `styles.css`
file, functions returning template-literal HTML strings, manual event wiring. So:

- Tokens below are written as a **plain `:root` block** — no Tailwind config, no `@theme`.
- Every component pattern is described as **vanilla CSS classes** (BEM-ish, matching our existing
  `.card`, `.badge`, `.rag-chip` naming), not `<Card>`/`<Badge>` JSX.
- Fonts are specified as **base64 `@font-face`** (inlined `woff2` `data:` URIs) because this will
  ultimately live in a CSP-locked hosted Artifact bundle that cannot fetch Google Fonts at
  runtime — no `<link>`, no `@import`. (The palette source doc's "load via Google Fonts" guidance
  is for normal web apps; it does not apply to our deployment target.) The Leadership OS artifact
  already does exactly this — its `<style>` block opens with four `@font-face` rules pointing at
  `data:font/…;base64,…` blobs for Inter, JetBrains Mono, and Lora (both italic-500 and
  normal-500/600 cuts). We replicate the mechanism, not the literal blob (out of scope for this
  doc — the base64 payload is a build step, not a design decision).
- The Leadership OS artifact is functionally our **reference implementation**: it is the same kind
  of app (vanilla JS views rendering into an `#app`/`.shell` mount) already wearing the Supernal
  palette. Where its compiled CSS gives an exact rule, that rule is quoted as the target, not
  reinvented.

---

## 1. Token block — adopt this `:root` verbatim

This is the palette's values translated into flat CSS custom properties, plus the semantic layer
already proven correct in the Leadership OS artifact (its `:root` matches the palette source
document stop-for-stop). Comments mark anything invented/decided for FMDS OS specifically (e.g.
`--nav-width`, which departs from the artifact's 248px only if we choose to keep our current rail
width — see the Delta list, §5).

```css
:root {
  color-scheme: light;

  /* ── Action scale — hand-tuned sage, seed #436F65. Stop 7 = default action. ── */
  --action-1: 161 33% 98%;
  --action-2: 161 28% 93%;
  --action-3: 162 27% 85%;
  --action-4: 163 25% 73%;
  --action-5: 164 22% 60%;
  --action-6: 164 20% 48%;
  --action-7: 166 28% 36%;   /* default action: buttons, links, focus rings */
  --action-8: 167 38% 25%;
  --action-9: 169 54% 15%;
  --action-10: 168 74% 6%;

  /* ── Surface scale — warm-neutral ladder, hues drift 26–40° across stops ── */
  --surface-1: 40 20% 97%;    /* page background */
  --surface-2: 36 19% 95%;    /* bg-subtle, table header, card-hover */
  --surface-3: 26 19% 93%;    /* muted, code-block-bg, sidebar-background */
  --surface-4: 30 20% 90%;    /* secondary (default), surface-hover */
  --surface-5: 30 10% 80%;    /* secondary-hover, text-disabled */
  --surface-6: 32 10% 72%;    /* secondary-active */
  --surface-7: 33 9% 56%;     /* text-placeholder / text-faint */
  --surface-7a: 35 9% 37%;    /* tertiary text (muted-foreground) */
  --surface-8: 38 6% 26%;     /* indicator-default text */
  --surface-10: 30 2% 10%;    /* text-secondary (light mode) */
  --surface-11: 30 7% 6%;     /* text-primary / foreground; border alpha base */

  /* ── Semantic — surfaces ── */
  --bg: hsl(var(--surface-1));
  --bg-subtle: hsl(var(--surface-2));
  --panel: #ffffff;                 /* surface-card: pure white lifts off warm page */
  --muted: hsl(var(--surface-3));
  --surface-hover: hsl(var(--surface-4));
  --table-header-bg: hsl(var(--surface-2));

  /* ── Semantic — borders (foreground-stop-at-low-alpha hairline pattern) ── */
  --border-soft: hsl(var(--surface-11) / 0.08);
  --border: hsl(var(--surface-11) / 0.10);
  --border-input: hsl(var(--surface-11) / 0.12);
  --border-strong: hsl(var(--surface-11) / 0.15);

  /* ── Semantic — text ── */
  --text: hsl(var(--surface-11));
  --text-secondary: hsl(var(--surface-10));
  --text-dim: hsl(var(--surface-7a));
  --text-faint: hsl(var(--surface-7));
  --text-disabled: hsl(var(--surface-5));

  /* ── Semantic — action (primary button/link ladder) ── */
  --accent: hsl(var(--action-7));
  --accent-hover: hsl(var(--action-8));
  --accent-active: hsl(var(--action-9));
  --accent-text: hsl(var(--action-8));        /* ghost/outline label color */
  --accent-subtle-bg: hsl(var(--action-3));
  --accent-soft: hsl(var(--action-7) / 0.10);
  --accent-fg: #ffffff;

  /* ── Secondary button ladder ── */
  --secondary: hsl(var(--surface-4));
  --secondary-hover: hsl(var(--surface-5));
  --secondary-active: hsl(var(--surface-6));

  /* ── Status — RAG, semantic-only (never decorative) ── */
  --green: hsl(145 63% 42%);
  --green-text: hsl(142 72% 29%);
  --green-bg: hsl(139 76% 97%);
  --green-border: hsl(141 79% 85%);
  --amber: hsl(28 80% 52%);
  --amber-text: hsl(26 91% 37%);
  --amber-bg: hsl(48 100% 96%);
  --amber-border: hsl(48 97% 77%);
  --red: hsl(6 63% 46%);
  --red-text: hsl(6 63% 46%);          /* aliased — already dark enough */
  --red-bg: hsl(0 86% 97%);
  --red-border: hsl(0 96% 89%);
  --info: hsl(204 64% 44%);
  --info-text: hsl(204 64% 44%);       /* aliased */
  --info-bg: hsl(214 99% 97%);
  --info-border: hsl(213 97% 87%);

  /* ── Viz palette — identity/decoration/charts ONLY, never UI/status controls ── */
  --viz-single: 197 13% 52%;   /* Blue-Gray — default single-series / primary identity */
  --viz-1: 30 58% 64%;         /* Warm Peach */
  --viz-2: 9 37% 56%;          /* Rust — used for emphasis series (e.g. flagged location) */
  --viz-3: 64 13% 45%;         /* Olive */
  --viz-4: 345 22% 48%;        /* Mauve */
  --viz-5: 166 13% 54%;        /* Sage */
  --viz-6: 19 45% 72%;         /* Light Peach */
  --viz-7: 210 2% 49%;         /* Neutral Gray — "uncategorized" slot, also chart context-lines */
  --viz-single-bg: hsl(197 9% 93%);

  /* Secondary decorative accent used by the sibling Leadership OS app for Hoshin
     "supports" disks and quarter chips — keep it available for our Hoshin view too. */
  --we-sky: 197 13% 52%;
  --we-sky-bg: 197 9% 93%;

  /* ── Sidebar (10 tokens; light spec — surface-3 fill, sage active state) ── */
  --sidebar-bg: hsl(var(--surface-3));
  --sidebar-fg: hsl(var(--surface-7a));
  --sidebar-border: hsl(var(--surface-11) / 0.08);
  --sidebar-accent: hsl(var(--surface-4));
  --sidebar-active-bg: hsl(var(--surface-4));
  --sidebar-active-fg: hsl(var(--action-7));

  /* ── Radius — "Balanced" posture ── */
  --radius-sm: 4px;
  --radius: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* ── Spacing scale ── */
  --sp-1: 4px;  --sp-2: 8px;   --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px;  --sp-7: 48px; --sp-8: 64px;

  /* ── Elevation — palette-derived shadow color (dark neutral, not black) ── */
  --shadow-color: 30 2% 10%;
  --shadow-xs: 0 1px 1px 0 hsl(var(--shadow-color) / 0.05);
  --shadow-sm: 0 1px 2px 0 hsl(var(--shadow-color) / 0.07);
  --shadow: 0 1px 3px 0 hsl(var(--shadow-color) / 0.10), 0 1px 2px -1px hsl(var(--shadow-color) / 0.08);
  --shadow-md: 0 4px 6px -1px hsl(var(--shadow-color) / 0.10), 0 2px 4px -2px hsl(var(--shadow-color) / 0.08);
  --shadow-lg: 0 10px 15px -3px hsl(var(--shadow-color) / 0.10), 0 4px 6px -4px hsl(var(--shadow-color) / 0.08);
  --shadow-ring: inset 0 0 0 1px hsl(var(--surface-11) / 0.07);
  --ring: 0 0 0 2px var(--bg), 0 0 0 4px hsl(var(--action-7) / 0.55);

  /* ── Motion ── */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-standard: 200ms;
  --duration-expressive: 300ms;
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);

  /* ── Type families ── */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-serif: "Lora", Georgia, "Times New Roman", serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;

  /* ── Shell geometry ── */
  --nav-width: 248px;
  --top-bar-height: 56px;
  --width-content: 1440px;
}
```

Notes on fidelity to the palette source:
- Dark mode is **deliberately omitted**. Both the Leadership OS artifact and FMDS OS run
  committed-light (`color-scheme: light` hardcoded), so there is no `.dark` override block to
  carry over. If dark mode is ever wanted, the palette doc's dark-mode HSL column has every value
  already worked out — this is a "not yet," not a "can't."
- `--red-text` and `--info-text`/`--green-text` etc. are **not always simple aliases** — per the
  palette doc's "Critical distinction," `--green-text`/`--amber-text` are separately calibrated
  from the base `--green`/`--amber` tokens (darker, AA-safe on the tinted `-bg`). `--red-text` and
  `--info-text` *are* straight aliases of their base tokens (already dark enough). Do not collapse
  `-text` into the base token for green/amber — that was the whole reason the tier exists.
  Never use `--green`/`--amber` (the base/icon tokens) as text color on a `-bg` chip.

---

## 2. Typography

| Role | Family | Weights used | Applied to |
|---|---|---|---|
| Display / serif | Lora | 500, 600 (+ 500 italic) | `h1`, `h2`, hero KPI numerals, Hoshin disk glyphs, chat/comment avatar initials |
| Sans (default) | Inter | 400–700 | `h3`, `h4`, all body/UI text, buttons, table cells |
| Mono | JetBrains Mono | 400, 500 | `code`, KPI/metric values, chips (`.chip`, `.q-chip`), KZ numbers, tabular data |

Type scale observed in the artifact (adopt as-is — it is noticeably more editorial/larger-serif
than our current IBM Plex scale):

```css
h1 { font-family: var(--font-serif); font-weight: 600; font-size: 30px; letter-spacing: -0.01em; }
h2 { font-family: var(--font-serif); font-weight: 600; font-size: 22px; }
h3 { font-size: 15px; font-weight: 600; letter-spacing: -0.005em; }   /* sans */
h4 { font-size: 13px; font-weight: 600; }                              /* sans */
body { font-family: var(--font-sans); font-size: 14px; line-height: 1.5; font-feature-settings: "ss01", "cv11"; }
code, .mono { font-family: var(--font-mono); font-size: 12px; }
```

Running heads (section labels — the editorial "kicker" that replaces our uppercase `<h4>`
convention):

```css
.running-head {
  font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-faint);
}
```

Hero numeral pattern (used for the big headline KPI value on Overview/My Day):

```css
.hero-kpi__value {
  font-family: var(--font-serif); font-weight: 600; font-size: 56px; line-height: 1.05;
  letter-spacing: -0.02em; color: var(--text);
}
```

### Font embedding for the CSP bundle

Google Fonts `<link>`/`@import` will not load inside a locked-down hosted Artifact. Use base64
`@font-face` — same mechanism the Leadership OS artifact already ships:

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400 700;               /* variable-range weight, one file covers 400–700 */
  font-display: swap;
  src: url(data:font/woff2;base64,AAEAAAA...) format("woff2");
}
@font-face {
  font-family: "JetBrains Mono";
  font-style: normal;
  font-weight: 400 500;
  font-display: swap;
  src: url(data:font/woff2;base64,AAEAAAA...) format("woff2");
}
@font-face {
  font-family: "Lora";
  font-style: normal;
  font-weight: 500 600;
  font-display: swap;
  src: url(data:font/woff2;base64,AAEAAAA...) format("woff2");
}
@font-face {
  font-family: "Lora";
  font-style: italic;
  font-weight: 500;
  font-display: swap;
  src: url(data:font/woff2;base64,AAEAAAA...) format("woff2");
}
```

Four `@font-face` blocks total (Inter regular-range, JetBrains Mono regular-range, Lora
normal 500–600, Lora italic 500). Subset to Latin + the glyphs actually used (numerals, currency,
±%, em-dash, bullet, arrows) to keep the base64 payload small — this is a bundle-size decision to
make at implementation time, not a design decision, so the actual base64 blob is intentionally
**not** produced by this doc. Fallback stack for pre-load / failure stays system fonts
(`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` for Inter;
`Georgia, "Times New Roman", serif` for Lora; `"SFMono-Regular", Consolas, monospace` for mono) —
already reflected in the `--font-*` stacks in §1.

---

## 3. Component & layout patterns to replicate

All class names below are verbatim from the Leadership OS artifact's compiled `<style>` block and
its rendered markup — treat them as the target class names for our re-skin (rename our current
`.rail`/`.rag-chip`/etc. to match, so the two apps share one mental model).

### 3.1 App shell / nav rail

```css
.shell { display: flex; overflow: hidden; height: 100vh; }
.content-area { flex: 1; min-width: 0; overflow-y: auto; display: flex; flex-direction: column; }
.canvas { max-width: var(--width-content); width: 100%; margin: 0 auto; padding: var(--sp-6) var(--sp-7) var(--sp-8); }

.sidebar {
  width: var(--nav-width); flex-shrink: 0; height: 100vh;
  background: var(--sidebar-bg);              /* surface-3, warm light fill — NOT dark graphite */
  border-right: 1px solid var(--sidebar-border);
  display: flex; flex-direction: column;
  padding: var(--sp-4) var(--sp-3);
}
```

This is the single biggest structural break from our current prototype: **the rail is light**
(`surface-3`, a warm off-white), not the dark-graphite `--ink-900` command rail we have today. See
§5 delta list.

Brand mark, department context block, and nav item:

```css
.brand__mark {
  width: 32px; height: 32px; border-radius: var(--radius);
  background: var(--accent); color: var(--accent-fg);
  display: grid; place-items: center;
  font-family: var(--font-serif); font-weight: 600; font-size: 14px;
}
.dept-block__name { font-family: var(--font-serif); font-weight: 600; font-size: 19px; color: var(--text); }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  min-height: 36px; padding: 0 var(--sp-3);
  border-radius: var(--radius); background: none; color: var(--sidebar-fg);
  font-size: 13px; font-weight: 500;
}
.nav-item:hover { background: var(--sidebar-accent); color: var(--text-secondary); }
.nav-item.is-active { background: var(--sidebar-active-bg); color: var(--sidebar-active-fg); font-weight: 600; }
.nav-item .nav-flag { margin-left: auto; width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--red); }
```

Note the active nav state is a **filled pill** (`surface-4` bg, sage text), not our current
left-edge accent bar (`.rail-link--active::before`). Persona footer uses a viz-color avatar disk
(`background: hsl(var(--viz-single))`), matching the "identity marker" rule from the palette doc.

### 3.2 Topbar

```css
.topbar {
  position: sticky; top: 0; z-index: 100;
  height: var(--top-bar-height);
  padding: 0 var(--sp-7);
  background: hsl(var(--surface-1) / 0.88);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-soft);
}
.crumb { font-size: 13px; color: var(--text-faint); }
.crumb b { color: var(--text); font-weight: 600; }
```

Same translucent-blur sticky topbar idea we already have (`.topbar` in our `styles.css`), just
re-tokened.

### 3.3 Cards

```css
.card { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.card--pad { padding: var(--sp-5); }
.card--interactive { cursor: pointer; transition: background-color var(--duration-fast) ease-in-out, border-color var(--duration-fast) ease-in-out; }
.card--interactive:hover { background: var(--bg-subtle); border-color: var(--border-strong); }
```

Only one radius (`--radius`, 8px) for the standard card — no separate `--radius-lg` card variant
like our current `.card` (14px). `--radius-lg` (12px) still exists in the scale but is not used on
the plain card; reserve it for larger surfaces (drawer corners, big illustrative blocks) if needed.

### 3.4 Buttons

```css
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 34px; padding: 0 var(--sp-4); border-radius: var(--radius); border: 0; font-size: 13px; font-weight: 500; }
.btn--primary { background: var(--accent); color: var(--accent-fg); }
.btn--primary:hover { background: var(--accent-hover); }
.btn--primary:active { background: var(--accent-active); }
.btn--secondary { background: var(--secondary); color: var(--text-secondary); }
.btn--outline { background: var(--panel); color: var(--accent-text); border: 1px solid var(--accent); }
.btn--ghost { background: none; color: var(--accent-text); }
.btn--ghost:hover { background: var(--accent-subtle-bg); }
.btn--ghost-neutral { background: none; color: var(--text-dim); }
.btn--sm { min-height: 28px; padding: 0 var(--sp-3); font-size: 12px; }
```

Five variants total: `primary` / `secondary` / `outline` / `ghost` / `ghost-neutral`. Our current
set (`primary` / `ghost` / `outline` / `success`) drops `success` as a button variant — a
button is never colored green/red/amber for state; that is what badges are for (see below). No
border on `.btn` by default (border: 0) except `outline`.

### 3.5 Badges (status) and chips (metadata)

```css
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: var(--radius-full); font-size: 11.5px; font-weight: 500; border: 1px solid transparent; }
.badge--green  { background: var(--green-bg);  color: var(--green-text);  border-color: var(--green-border); }
.badge--amber  { background: var(--amber-bg);  color: var(--amber-text);  border-color: var(--amber-border); }
.badge--red    { background: var(--red-bg);    color: var(--red-text);    border-color: var(--red-border); }
.badge--info   { background: var(--info-bg);   color: var(--info-text);   border-color: var(--info-border); }
.badge--neutral{ background: var(--muted);     color: hsl(var(--surface-8)); border-color: var(--border-soft); }
.badge--outline{ background: none; color: var(--text-dim); border-color: var(--border); }
.badge .dot { width: 6px; height: 6px; border-radius: var(--radius-full); }
```

`.chip` is the mono, metadata-labeling counterpart to `.badge` (KZ numbers, categories) — not
status-colored:

```css
.chip {
  display: inline-flex; align-items: center; padding: 1px 7px;
  border-radius: var(--radius-sm); border: 1px solid var(--border);
  background: var(--muted); color: hsl(var(--surface-8));
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 500; letter-spacing: 0.02em;
}
```

Row-level RAG dot (used in KPI-board table cells, more compact than a full badge):

```css
.status-cell { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 500; }
.status-cell .dot { width: 7px; height: 7px; border-radius: var(--radius-full); }
.status-cell--green  { color: var(--green-text); } .status-cell--green .dot  { background: var(--green); }
.status-cell--amber  { color: var(--amber-text); } .status-cell--amber .dot  { background: var(--amber); }
.status-cell--red    { color: var(--red-text); }   .status-cell--red .dot    { background: var(--red); }
.status-cell--nodata { color: var(--text-faint); } .status-cell--nodata .dot { background: var(--text-disabled); }
```

This directly maps onto our current `.rag-chip` — rename/restyle in place, same 4-state set
(green/amber/red/nodata), same rule: RAG dot fill uses the base status token, RAG text uses the
separately-calibrated `-text` token, never the base token as text color.

### 3.6 Tables

```css
.table-wrap { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--panel); box-shadow: var(--shadow-sm); }
table.dt { width: 100%; border-collapse: collapse; font-size: 13px; }
table.dt th {
  height: 36px; padding: 0 var(--sp-4); text-align: left;
  background: var(--table-header-bg);
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--text-dim); border-bottom: 1px solid var(--border);
}
table.dt td { padding: 10px var(--sp-4); border-bottom: 1px solid var(--border-soft); }
table.dt tbody tr:hover { background: var(--bg-subtle); }
table.dt td:first-child { font-weight: 500; }
table.dt .num, table.dt th.num { text-align: right; font-variant-numeric: tabular-nums; }
```

KPI-board specific row types (drill-down tree table — directly usable for our Team Board / KPI
Boards views):

```css
.kpi-cat td { background: var(--bg-subtle); padding: 6px var(--sp-4); }              /* category divider row */
.kpi-cat span { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-faint); }
.kpi-name__caret { width: 22px; height: 22px; border-radius: var(--radius-sm); color: var(--text-faint); transition: transform var(--duration-fast) ease-in-out; }
.kpi-name__caret.is-open { transform: rotate(90deg); }
tr.kpi-sub td { background: hsl(var(--surface-1) / 0.6); }                            /* expanded sub-row, tinted */
tr.kpi-sub td:first-child { padding-left: 48px; font-weight: 400; color: var(--text-secondary); }  /* indent */
```

### 3.7 Ask Mark layout (chat + action-required bar)

Two-column grid: thread/action rail on the left, live conversation on the right.

```css
.chat { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: var(--sp-5); align-items: start; }
.chat__thread { display: flex; flex-direction: column; gap: var(--sp-4); }
.msg { display: flex; gap: var(--sp-3); max-width: 720px; }
.msg--user { align-self: flex-end; flex-direction: row-reverse; }
.msg__bubble { padding: var(--sp-3) var(--sp-4); border-radius: var(--radius); background: var(--panel); border: 1px solid var(--border); font-size: 13.5px; line-height: 1.6; color: var(--text-secondary); }
.msg--user .msg__bubble { background: var(--muted); border-color: transparent; color: var(--text); }
```

The artifact's actual "Ask Mark" page header pairs two count badges with the primary CTA —
this is the concrete "action-required bar" pattern to copy:

```html
<div class="page-head__side">
  <span class="badge badge--red"><span class="dot"></span>${count} action required</span>
  <span class="badge badge--amber"><span class="dot"></span>${count} being actioned</span>
  <button class="btn btn--primary" id="new-chat">+ New Chat</button>
</div>
```

Below the header, a narrower left column runs an "Action required" running-head over an
interactive red-accent card (the single most urgent open ask), sized at
`grid-template-columns: minmax(280px, 38fr) 62fr` for that page specifically (overriding the
default `.chat` 300px-fixed-right split):

```html
<div class="section-head" style="margin-top:0"><span class="running-head">Action required</span></div>
<section class="card card--pad card--interactive" style="border-left:3px solid var(--red)">
  <div style="display:flex; align-items:center; justify-content:space-between">
    <h4>${kpi}</h4>
    <span class="badge badge--red"><span class="dot"></span>Off Track</span>
  </div>
  <div style="font-size:20px; font-weight:600" class="tnum">${actual} <span class="faint" style="font-size:13px">vs target ${target}</span></div>
  <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-faint)">
    <span>Due ${due} · <span style="color:var(--green-text)">✓ Answered</span></span>
    <span>Owner: ${owner}</span>
  </div>
</section>
```

A "response lifecycle" chip row (draft → submitted → rolled-up, etc.) tracks progress on the
right side, using the same is-done/is-now pattern as the 8-step tracker (§3.8):

```css
.life-chip { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-full); font-size: 11.5px; font-weight: 500; background: var(--muted); color: var(--text-faint); border: 1px solid var(--border-soft); }
.life-chip.is-done { background: hsl(var(--action-1)); color: var(--accent-text); border-color: hsl(var(--action-3)); }
.life-chip.is-now  { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); font-weight: 600; }
```

This maps directly onto our existing `.assistant-drawer` — but note the artifact treats Ask Mark
as a **full page/view**, not a slide-in drawer. Worth deciding explicitly whether we keep the
drawer pattern (quick access from any view) or promote Ask Mark to its own nav item with this
richer layout (recommended — we already have `.assistant-drawer__ident`, `.cmt-thread` etc. that
map onto `.msg`/`.ai-note`, this is a restyle not a rebuild).

### 3.8 Problem-solving tracker + 8-step wizard subheader

List/tracker view — compact step-progress dots inline in a table row:

```css
.step-track { display: inline-flex; align-items: center; gap: 3px; }
.step-track__dot { width: 16px; height: 16px; border-radius: var(--radius-full); font-size: 9px; font-weight: 600; background: var(--muted); color: var(--text-faint); border: 1px solid var(--border); }
.step-track__dot.is-done { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }
.step-track__dot.is-next { border-color: var(--accent); color: var(--accent-text); background: var(--panel); }
```

Summary strip above the tracker table:

```css
.ps-summary { display: flex; gap: var(--sp-6); align-items: baseline; }
.ps-summary__stat b { font-size: 22px; font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }
```

The **wizard subheader** (single most important pattern to replicate exactly — this is the "owner
/ golden-thread / opens-step / AI-draft" row the brief calls out, quoted verbatim from the
artifact's KZ-346 8-step page):

```html
<div class="page-head" style="margin-bottom:16px">
  <div>
    <span class="running-head page-head__eyebrow">8-Step Problem Solving A3 · ${source}</span>
    <h1>KZ-346 · Pricing Credit Memos Feb '26</h1>
    <p class="page-head__sub">
      Owner P. Fernandez · Golden Thread: OTP <b style="color:var(--red-text)">86.3%</b>
      ▸ OTP — Mexico <b style="color:var(--red-text)">75.0% vs 98.5%</b> opens this 8-step
      · <span class="badge badge--info"><span class="dot"></span>AI draft — steps 1–6 pre-solved · 4 confirmed</span>
    </p>
  </div>
  <div class="page-head__side">
    <button class="btn btn--secondary" data-back>Back to Tracker</button>
  </div>
</div>
```

Read the anatomy of that one `<p class="page-head__sub">` line — it is doing five jobs in one
sentence, editorial-style, rather than five separate metadata fields:
1. **Owner** (plain text, name only — no badge/avatar clutter at this density)
2. **Golden Thread** — the roll-up chain rendered inline as `Main KPI value ▸ Sub-KPI value`, with
   the failing number(s) bolded and colored `var(--red-text)` directly in running text (not a
   separate badge per number)
3. **"opens this 8-step"** — the causal verb connecting the red number to the artifact you're
   looking at
4. **AI-draft state** as a trailing `badge--info` chip: "AI draft — steps 1–6 pre-solved · 4
   confirmed" — this is the "latest updated" look the brief flags: the draft/confirmed count is
   the freshness signal, not a timestamp
5. A single secondary button ("Back to Tracker") on the opposite side — no other chrome

Horizontal step bar directly below the subheader (replaces a vertical rail-style stepper):

```css
.step-bar { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; margin-bottom: var(--sp-4); }
.step-tab {
  display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 8px;
  padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--panel); color: var(--text-dim); font-size: 12px;
}
.step-tab.is-active { border-color: var(--accent); background: hsl(var(--action-1)); box-shadow: inset 0 -2px 0 var(--accent); }
.step-tab.is-done .step-tab__n { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }
.step-tab__pdca { font-size: 10px; letter-spacing: 0.06em; color: var(--text-faint); }  /* Plan/Do/Check/Act label */
```

Full wizard body is a 3-column grid when AI assist is present: 240px step rail | 1fr A3 body |
300px assist panel (`.eightstep--assist { grid-template-columns: 240px 1fr 300px; }`, collapsing
to hide the assist column under 1200px). The AI-draft banner sits as a callout card above the
table on the tracker page:

```css
.ai-draft-banner { display: flex; align-items: center; gap: var(--sp-4); padding: var(--sp-4) var(--sp-5); border-left: 3px solid var(--accent); }
```

```html
<section class="card ai-draft-banner">
  <div class="ai-note__avatar" style="width:36px;height:36px;font-size:15px">M</div>
  <div style="flex:1">
    <b>AI-drafted 8-step ready for review — KZ-346 · Pricing Credit Memos Feb '26</b>
    <div class="muted" style="font-size:12.5px">Mark pre-solved planning steps 1–6 from the red Mexico OTP sub-KPI, the Short-Code Order Entry SOP, and prior similar KZ-339. You review, edit and confirm.</div>
  </div>
  <button class="btn btn--primary" data-open-kz>Review Draft 8-Step →</button>
</section>
```

The assist rail itself is Mark's per-step sidebar chat (`.eightstep__assist`, `.assist-head`,
`.assist-note`, `.assist-thread`) — same `.msg__bubble` primitive as Ask Mark, just narrower and
scrollable (`max-height: 320px`).

### 3.9 KPI-board chart

Multi-series SVG line chart (`lineChart()`), always inside a `.card`, with a fixed color grammar
that is the clearest real-world proof of "RAG = status only, viz = decoration/data":

```js
const VIZ = {
  single: 'hsl(197 13% 52%)',          // = --viz-single. Default/primary series (e.g. company-wide)
  singleSoft: 'hsl(197 13% 52% / 0.10)',
  rust: 'hsl(9 37% 56%)',              // = --viz-2. Emphasis series (the flagged/red-driving location)
  rustSoft: 'hsl(9 37% 56% / 0.10)',
  contextLine: 'hsl(210 2% 49% / 0.45)', // = --viz-7 at low alpha. Non-highlighted comparison series
  grid: 'hsl(30 7% 6% / 0.07)',          // = --surface-11 (foreground) at 7% — gridlines
  target: 'hsl(35 9% 37% / 0.55)',       // = --surface-7a (text-dim) at 55% — dashed target line
};
```

Concrete usage (weekly OTP by location — this is the exact pattern for any "main KPI trend with
one flagged sub-driver" chart in our KPI Boards / Team Board views):

```js
lineChart({
  target: 0.985, fmtY: v => Math.round(v * 100) + '%',
  series: [
    { name: 'Norcross', data: …, color: VIZ.contextLine },
    { name: 'Houston',  data: …, color: VIZ.contextLine },
    { name: 'Canada',   data: …, color: VIZ.contextLine },
    { name: 'WE Main',  data: …, color: VIZ.single },
    { name: 'Mexico',   data: …, color: VIZ.rust, soft: VIZ.rustSoft, emphasis: true },
  ],
});
```

Rules to carry over: dashed target line always `VIZ.target` (never a status color, even though
it's "the goal"); unflagged comparison series desaturate to `contextLine`; **at most one** series
gets the rust/emphasis treatment — it marks "this is the thing driving the story," not a status.
Never color a chart series red/amber/green for RAG state — RAG belongs on the row's `.status-cell`
dot next to the chart, not inside it. Row-level inline sparkline (`sparkline()`/`.spark`) follows
the same rule at small size: `VIZ.single` line + soft-fill area, plain dashed `VIZ.target` line,
no RAG color ever inside the SVG itself. Axis/gridline text uses `.chart-axis` (10.5px,
`--text-faint`) and `.chart-end-label` (11px, `--text-dim`) — both sans, tabular-nums.

### 3.10 Hoshin strip / disk

Compact cross-link card shown at the top of KPI Boards, pointing at the Hoshin (strategy) view:

```css
.hoshin-disk {
  display: inline-grid; place-items: center; border-radius: var(--radius-full);
  background: var(--muted); color: var(--text-faint);
  font-weight: 600; font-family: var(--font-serif);   /* serif numeral, not sans/mono */
  border: 1px solid var(--border);
}
.hoshin-disk--drives   { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }
.hoshin-disk--supports { background: hsl(var(--we-sky)); border-color: hsl(var(--we-sky)); color: hsl(var(--action-9)); }
```

Three disk states: neutral (this objective is not an Operations Hoshin at all — muted gray, dimmed
to `opacity: 0.45` via `.hoshin-strip__item.is-dim`), `--drives` (this dept's primary Hoshin —
filled `--accent`), `--supports` (secondary — filled `--we-sky`, the dedicated blue-gray
decorative accent). Rendered as a numbered row of small disks (26px in the strip, sized
parametrically via a `size` arg — `30px` default) via:

```js
function hoshinDisk(n, mode, size = 30) {
  const cls = mode === 'drives' ? 'hoshin-disk--drives' : mode === 'supports' ? 'hoshin-disk--supports' : '';
  return `<span class="hoshin-disk ${cls}" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.42)}px">${n}</span>`;
}
```

The strip itself is a clickable card:

```css
.hoshin-strip { display: flex; align-items: center; gap: var(--sp-5); padding: var(--sp-4) var(--sp-5); margin-bottom: var(--sp-5); cursor: pointer; }
.hoshin-strip:hover { background: var(--bg-subtle); border-color: var(--border-strong); }
.hoshin-strip__disks { display: flex; gap: 6px; }
```

```html
<section class="card hoshin-strip" role="button" tabindex="0" data-go-hoshin aria-label="Open the Operations Hoshin view">
  <div class="hoshin-strip__disks">${disks}</div>
  <div class="hoshin-strip__text">
    <b>This board drives Hoshin 2 · Financial Performance and 4 · Organizational Development</b>
    <span class="muted">OTP, PPLH and Materials roll into the labor-efficiency, material and indirect-labor activity plans. Operations also supports 5 · New Customer Acquisition.</span>
  </div>
  <span class="btn btn--outline btn--sm" style="pointer-events:none">Open Hoshin View →</span>
</section>
```

Per-row Hoshin tag (`.hoshin-chip`, tiny pill next to a KPI name showing which Hoshin number it
rolls into) and per-activity-plan `.q-chip` (quarter/timeline chip, `is-on` state lit with
`--we-sky-bg`) round out the Hoshin vocabulary — both reuse the same "action-1 tinted pill with
action-3 border" recipe as `.life-chip.is-done`.

---

## 4. Aesthetic principles — "magazine, not dashboard"

1. **Editorial posture, not a SaaS dashboard.** Generous whitespace over density; a serif carries
   moments that deserve weight (titles, hero numerals, disk glyphs, running narrative like the
   Golden Thread line) while Inter carries everything functional. Confident, quiet, adult — not
   playful, not cramped.
2. **Prose over grids of tiny fields where possible.** The wizard subheader (§3.8) is the clearest
   example: owner, root-cause chain, and freshness are one flowing sentence with inline emphasis,
   not five stat tiles. Reach for this pattern whenever a view is tempted to add "one more small
   metadata box."
3. **RAG is reserved for status, full stop.** Green/amber/red/info never appear as a chart series
   color, a button variant, a nav highlight, or a decorative accent — only on `.badge`,
   `.status-cell`, `border-left` accent bars on state-driven cards, and RAG-state chips. If
   something needs a splash of color that isn't reporting a state, it reaches for the viz palette
   or the accent sage — never RAG.
4. **Viz palette = identity + decoration + charts, never UI chrome.** `--viz-single` /
   `--we-sky` mark avatars (AI employee "M" disk, human initials) and chart series; `--viz-2`
   (rust) marks the one emphasized/flagged series in a multi-line chart. None of the 8 viz stops
   ever appear on a button, alert, or status badge — that would break the "viz = identity" contract
   everywhere else it's used.
5. **One accent, sage, used sparingly and consistently.** `--accent` (`action-7`) is the single
   interactive color: primary buttons, active nav pill text, focus rings, links, "driving Hoshin"
   disk fill, in-progress step-tab highlight. It does not multiply into secondary "brand" colors
   for variety — restraint is the point.
6. **Borders are hairlines, not strokes.** Every border is the foreground color (`surface-11`) at
   low alpha (8–15%) rather than a separately-chosen gray — this is why edges read as crisp and
   quiet rather than heavy, even at 1px.
7. **Numbers are always tabular and often mono.** Anything that will be scanned in a column
   (targets, actuals, KZ numbers, dates in tables) gets `font-variant-numeric: tabular-nums`
   (`.tnum` utility) and, for true metric/target values, the JetBrains Mono family.
8. **Cards float subtly, not dramatically.** `--shadow-sm` (barely-there) is the default card
   elevation; `--shadow-md`/`--shadow-lg` are reserved for true overlays (popovers, drawers) —
   nothing on the canvas itself needs a heavy shadow to read as "a card."

---

## 5. Delta list — concrete changes vs. current `styles.css`

### Token renames / restructure
| Current | New | Note |
|---|---|---|
| `--ink-900…600` (dark rail ramp) | *(removed — rail goes light)* | See "Rail" below — biggest single visual change |
| `--canvas` | `--bg` | page background, same role, now `surface-1` (warmer, `40 20% 97%` vs current flat `#f5f7fa`) |
| `--surface` | `--panel` | card/input background; stays pure white |
| `--surface-2` | `--bg-subtle` | table-header/hover tint |
| `--line` | `--border-soft` / `--border` | current single hairline splits into a 4-tier alpha system (`soft`/default/`input`/`strong`) — pick the tier per use, don't default everything to one |
| `--line-strong` | `--border-strong` | |
| `--text` | `--text` | same name, new value (`surface-11`, near-black-warm vs current `#0f151c`) |
| `--text-muted` | `--text-dim` / `--text-faint` | current single muted tier splits into two (`text-dim` = `surface-7a`, `text-faint` = `surface-7`) — audit every `var(--text-muted)` use and pick the right one |
| `--accent` (`#2f6bff`, electric blue) | `--accent` (`hsl(166 28% 36%)`, sage) | **hue change, not just value** — every blue reference in the file becomes sage |
| `--accent-tint`, `--accent-tint-2` | `--accent-subtle-bg` (`action-3`), `--accent-soft` (`action-7/10%`) | |
| `--accent-hover` | `--accent-hover` (`action-8`) | |
| *(none)* | `--accent-active` (`action-9`) | new — button `:active` state, we don't have one today |
| `--green`/`--amber`/`--red`/`--nodata` (+ `-bg`) | `--green`/`--amber`/`--red` (+ `-bg`, `-border`) + new `-text` tier | current code uses the base token as both dot fill AND text color — must split to `-text` for text per the palette's AA rule; `--nodata` → `--text-disabled`/`--text-faint` depending on context |
| `--slate-50…900` ramp | *(retire — replaced by `--surface-1…11` + semantic aliases)* | anywhere `--slate-*` is hardcoded needs remapping to the closest semantic token, not a 1:1 numeric rename |
| `--font` | `--font-sans` | IBM Plex Sans → Inter |
| `--font-mono` | `--font-mono` | IBM Plex Mono → JetBrains Mono (same role) |
| *(none)* | `--font-serif` | new — Lora, needed for h1/h2/hero numerals/disk glyphs, nothing today uses a serif |
| `--r`, `--r-lg` | `--radius`, `--radius-lg` | values change: 8/14px → 8/12px; also add `--radius-sm` (4px, was already named but was 5px) and `--radius-full` (pill, was implicit `999px` literal everywhere) |
| `--shadow-sm/--shadow/--shadow-lg` | same names | recompute — new shadow uses `--shadow-color: 30 2% 10%` (warm near-black) instead of flat `rgba(15,21,28,…)`; also gains `--shadow-xs`, `--shadow-md`, `--shadow-ring` tiers we don't have |
| `--ease`, `--t-fast`, `--t` | `--ease-fluid`, `--duration-instant/fast/standard/expressive` | current 2-speed system (120ms/170ms) becomes a 4-step named scale (100/150/200/300ms) |
| *(none)* | `--nav-width` (248px), `--top-bar-height` (56px), `--width-content` (1440px) | new — formalizes what's currently hardcoded (`236px` rail width, `56px` topbar, `1320px` canvas max-width) as tokens |
| *(none)* | `--viz-single…7` (+ `-bg`), `--we-sky`, `--we-sky-bg` | wholly new — we have no decorative/identity palette today; every avatar currently uses `--ink-600` or `--accent` flat |

### Font swap
- IBM Plex Sans → **Inter** (UI/body), loaded via inlined base64 `@font-face` (see §2), not the
  current `<link>` in `index.html` — that link must be removed and replaced with the inline
  `@font-face` block once bundled for the CSP target.
- IBM Plex Mono → **JetBrains Mono** (metrics/KZ numbers/code), same embedding approach.
- **New:** Lora (serif) added for h1/h2 and hero numerals — nothing in the current file uses a
  serif at all; `index.html`'s current font `<link>` needs a third family added (as base64, per
  above) plus new `h1`/`h2` rules pointing at it.

### Structural / component deltas, per current view
- **`.rail` → `.sidebar`:** flips from dark graphite gradient (`--ink-900`→`--ink-800`) to a
  light warm fill (`--sidebar-bg` = `surface-3`). This cascades: `--rail-fg`/`--rail-fg-bright`
  (white-on-dark text) are retired entirely in favor of `--sidebar-fg`/`--text-secondary`
  (dark-on-light); `.role-badge`'s blue/green rgba-on-dark chips need re-tuning for a light fill;
  `.rail__mark` → `.brand__mark` gets a serif glyph instead of mono; active nav state moves from a
  left-edge accent bar (`::before`) to a **filled pill** (`.nav-item.is-active`).
- **`.login`:** the dark `--ink-900` brand-side gradient panel either needs to stay dark
  (intentional contrast moment — acceptable, the artifact's own login isn't in scope so this is
  our call) or be re-themed; if kept dark, its blue accent glow (`radial-gradient(…rgba(47,107,255…`)
  must become sage (`rgba` version of `action-7`).
- **`.card`, `.card--flat` → `.card`, `.card--pad`:** current two-tier (14px-radius-with-padding
  vs 8px-radius-flat) collapses to one card shape (`--radius`, 8px) with padding as a separate
  modifier (`.card--pad`) — audit every `.card--flat` usage, it likely just becomes `.card`
  without `--pad`.
- **`.rag-chip--*` → `.status-cell--*` (inline) + `.badge--*` (standalone):** current single
  pill-shaped chip class splits into two purposes — a compact inline dot+text for table cells
  (`.status-cell`) and a fuller pill badge for headers/summaries (`.badge`). Every current
  `.rag-chip` usage needs to be sorted into one bucket or the other.
- **`.badge--*` variants:** current set (`accent`/`warning`/`success`/`info`/`doc`/`outline`/
  `illustrative`) maps onto the new `green`/`amber`/`red`/`info`/`neutral`/`outline` set —
  `warning`→`amber`, `success`→`green`, `doc`/`illustrative` collapse into `neutral` or `outline`
  depending on context (no dedicated "illustrative italic" badge in the new system — if that
  affordance is still needed, add it as a local modifier, not a system token).
- **`.btn--success`:** retire. No status-colored button in the new system (see aesthetic principle
  4) — a "confirm as resolved" action should be `.btn--primary` with a checkmark icon, or a
  `.badge--green` next to a neutral button, not a green button.
- **KPI Boards / Team Board (`.kpi-layout`, `.kpi-list`, `.rep-card`, `.contributor-row`):**
  restructure toward the artifact's tree-table pattern — `.kpi-cat` category divider rows,
  `.kpi-name__caret` expand affordance (rotating caret, not a plain `▶`/`▼` text glyph), `tr.kpi-sub`
  tinted+indented sub-rows, chart embedded in an expandable card above the table (`lineChart()`
  pattern, §3.9) rather than in a side panel.
- **Problem-Solving / 8-step (`.eightstep`, `.step-item`):** current vertical rail
  (`grid-template-columns: 260px 1fr`) stays structurally similar but subheader must be rebuilt as
  the prose `page-head__sub` pattern (§3.8) instead of separate metadata rows; add the horizontal
  `.step-bar`/`.step-tab` (currently we only have the vertical `.eightstep__rail`/`.step-item`
  list — the artifact's tracker page uses horizontal dots (`.step-track`) and the detail page uses
  a full horizontal `.step-bar`, we have neither today) and the 3rd "assist" column when AI-drafted.
- **Ask Mark (`.assistant-drawer`):** decide drawer-vs-full-page (see §3.7) — if kept as a drawer,
  at minimum restyle `.assistant-drawer__reply` off `font-family: var(--font-mono)` (current) onto
  `.msg__bubble`'s sans/serif-mixed treatment, and add the action-required badge pair to whatever
  header it has.
- **Hoshin:** wholly new view for us if it doesn't exist yet — everything in §3.10 is additive,
  not a migration, unless an equivalent already exists that this reference should instead be
  diffed against (check before implementing).
- **Sources view (`.src-*` classes):** system badges/pills currently use ad-hoc `rgba(31,157,87,…)`
  literals for their green/amber borders — replace with `--green-border`/`--amber-border` tokens
  directly; `.src-flow__node` diagram nodes should adopt `.flow`/`.flow__node` naming and tokens
  from §3 rather than keeping bespoke `--accent-tint-2` references.
- **Comment threads (`.cmt-*`):** avatar gradients (`linear-gradient(140deg, var(--accent), #6f4bff)`)
  hardcode a purple that doesn't exist in the new palette — replace with a flat viz-identity color
  (`hsl(var(--viz-single))`, matching the artifact's `.ai-note__avatar`/`.persona__avatar` pattern)
  rather than inventing a new gradient.

### What stays the same (no action needed)
- Overall shell shape (fixed-width sidebar + scrolling content column + sticky topbar) — same
  skeleton, just re-tokened and re-lit.
- Spacing scale approach (a named `--sp-*` ladder) — values change (4/8/12/16/20/24/32/40/48 →
  4/8/12/16/24/32/48/64) but the pattern of using named steps everywhere instead of raw px is
  already correct and carries over unchanged.
- `prefers-reduced-motion` handling, `.sr-only`, tabular-nums-for-numbers discipline — all correct
  today, keep as-is.

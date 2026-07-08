/**
 * lib/charts.js — inline SVG chart generators
 * Returns SVG strings; zero external dependencies.
 * RAG palette sourced from styles.css CSS variables (matched verbatim).
 */

import { ragStatus } from './rag.js';

// ─── Design-system colour tokens ───────────────────────────────────────────
// Prefer CSS custom properties so charts track the design system;
// hex fallbacks make unit tests and edge cases safe.
function _cssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

const RAG_COLORS = {
  get green()  { return _cssVar('--green',  '#1f9d57'); },
  get amber()  { return _cssVar('--amber',  '#e07a12'); },
  get red()    { return _cssVar('--red',    '#d92d3a'); },
  get nodata() { return _cssVar('--slate-400', '#b6c0cd'); },
};
const ACCENT = { get value() { return _cssVar('--accent', 'hsl(166 28% 36%)'); } };
const SLATE  = {
  get 200() { return _cssVar('--slate-200', '#e3e8ef'); },
  get 300() { return _cssVar('--slate-300', '#d3dae4'); },
  get 600() { return _cssVar('--slate-600', '#59636f'); },
};

/**
 * svgLine(points, opts) → SVG string
 *
 * @param {Array<number|null>} points  — 1-D array of values (nulls = gap)
 * @param {object}  opts
 * @param {number}  [opts.target]     — optional horizontal target line
 * @param {number}  [opts.width=280]
 * @param {number}  [opts.height=72]
 * @param {string}  [opts.color]      — stroke colour; defaults to ACCENT
 * @param {boolean} [opts.mini=false] — suppress axes/labels
 */
export function svgLine(points, opts = {}) {
  const {
    target  = null,
    width   = 280,
    height  = 72,
    color   = ACCENT.value,
    mini    = false,
  } = opts;

  const PAD_L = mini ? 4 : 28;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = mini ? 4 : 24;

  const W = width  - PAD_L - PAD_R;
  const H = height - PAD_T - PAD_B;

  // Filter to numeric values for scale
  const numeric = points.filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (numeric.length === 0) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="10" fill="${SLATE[600]}">no data</text>
    </svg>`;
  }

  let minV = Math.min(...numeric);
  let maxV = Math.max(...numeric);
  if (target !== null) {
    minV = Math.min(minV, target);
    maxV = Math.max(maxV, target);
  }
  if (maxV === minV) { maxV = minV + 1; } // avoid zero-range

  const scaleX = (i)  => PAD_L + (i / (points.length - 1 || 1)) * W;
  const scaleY = (v)  => PAD_T + H - ((v - minV) / (maxV - minV)) * H;

  // Build polyline segments (skip nulls as gaps)
  let segments = [];
  let current  = [];
  points.forEach((v, i) => {
    if (typeof v === 'number' && !Number.isNaN(v)) {
      current.push(`${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`);
    } else {
      if (current.length > 1) segments.push(current.join(' '));
      current = [];
    }
  });
  if (current.length > 1) segments.push(current.join(' '));

  // Dot positions for all numeric points
  const dots = points
    .map((v, i) => (typeof v === 'number' && !Number.isNaN(v))
      ? `<circle cx="${scaleX(i).toFixed(1)}" cy="${scaleY(v).toFixed(1)}" r="2.5" fill="${color}"/>`
      : '')
    .join('');

  // Target line
  const targetLine = target !== null
    ? `<line x1="${PAD_L}" y1="${scaleY(target).toFixed(1)}" x2="${PAD_L + W}" y2="${scaleY(target).toFixed(1)}"
           stroke="${RAG_COLORS.amber}" stroke-width="1" stroke-dasharray="4,3" opacity="0.85"/>`
    : '';

  // Y-axis labels (mini suppresses)
  let yLabels = '';
  if (!mini) {
    const fmt = (v) => {
      if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
      if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
      return v.toFixed(v < 10 ? 1 : 0);
    };
    yLabels = [minV, maxV].map(v =>
      `<text x="${PAD_L - 3}" y="${scaleY(v).toFixed(1) - 0 + 3}" text-anchor="end" font-size="9" fill="${SLATE[600]}">${fmt(v)}</text>`
    ).join('');
  }

  const polylines = segments
    .map(pts => `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>`)
    .join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="none"/>
  ${targetLine}
  ${polylines}
  ${dots}
  ${yLabels}
</svg>`;
}

/**
 * svgBars(rows, opts) → SVG string
 *
 * @param {Array<{label:string, value:number|null, rag?:string}>} rows
 * @param {object} opts
 * @param {number} [opts.width=280]
 * @param {number} [opts.barHeight=20]
 * @param {number} [opts.gap=6]
 */
export function svgBars(rows, opts = {}) {
  const {
    width     = 280,
    barHeight = 20,
    gap       = 6,
  } = opts;

  const PAD_L = 90;  // label area
  const PAD_R = 40;  // value area
  const PAD_T = 8;

  const trackW = width - PAD_L - PAD_R;
  const totalH = PAD_T + rows.length * (barHeight + gap);

  const numeric = rows
    .map(r => r.value)
    .filter(v => typeof v === 'number' && !Number.isNaN(v));

  const maxV = numeric.length ? Math.max(...numeric) : 1;

  const bars = rows.map((row, i) => {
    const y      = PAD_T + i * (barHeight + gap);
    const cx     = PAD_L;
    const cy     = y + barHeight / 2 + 4; // text baseline
    const val    = (typeof row.value === 'number' && !Number.isNaN(row.value)) ? row.value : null;
    const barW   = val !== null ? Math.max(2, (val / maxV) * trackW) : 0;
    const fill   = row.rag ? RAG_COLORS[row.rag] || SLATE[200] : VIZ.single;
    const valStr = val !== null
      ? (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toFixed(1))
      : '—';

    return `
    <text x="${cx - 4}" y="${cy}" text-anchor="end" font-size="10" fill="${SLATE[600]}" dominant-baseline="middle"
          style="overflow:hidden;text-overflow:ellipsis">${row.label.slice(0, 14)}</text>
    <rect x="${cx}" y="${y}" width="${trackW}" height="${barHeight}" rx="3" fill="${SLATE[200]}"/>
    ${val !== null ? `<rect x="${cx}" y="${y}" width="${barW.toFixed(1)}" height="${barHeight}" rx="3" fill="${fill}" opacity="0.85"/>` : ''}
    <text x="${cx + trackW + 4}" y="${cy}" font-size="10" fill="${SLATE[600]}" dominant-baseline="middle">${valStr}</text>`;
  }).join('');

  return `<svg width="${width}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
  ${bars}
</svg>`;
}

// ─── Shared helpers for the charts below ───────────────────────────────────
// Factored out so svgRecoveryTrend/svgFunnel/svgPareto don't re-derive the
// "no data" placeholder or linear-interpolation math independently.

// "No data" placeholder — matches svgLine's empty-state markup verbatim.
function _noDataSvg(width, height) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="10" fill="${SLATE[600]}">no data</text>
    </svg>`;
}

// Linear interpolation: maps v from domain [d0,d1] onto range [r0,r1].
function _scale(v, d0, d1, r0, r1) {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

// Escape text before inserting into an SVG <text> node so a label containing
// &, <, >, or " (e.g. a location/KPI name) can't break the markup.
function _escXml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * svgRecoveryTrend(points, opts) → SVG string
 *
 * Line chart for tracking a red-KPI's recovery toward target after a
 * countermeasure lands: trend line + dashed target line + a light green
 * "in-band" zone at/above target + a vertical dashed marker for when the
 * countermeasure went in + RAG-coloured dots per point (via `ragStatus`).
 *
 * @param {Array<number|null>} points   — 1-D array of values (nulls = gap)
 * @param {object}  opts
 * @param {number}  [opts.target]       — target value; drives dashed line, green band, dot colour
 * @param {number}  [opts.cmIndex]      — index of the point where the countermeasure went live
 * @param {string}  [opts.direction='higher_better'] — RAG direction for dot colour
 *                                        ('lower_better' inverts, e.g. safety/turnover KPIs)
 * @param {number}  [opts.width=280]
 * @param {number}  [opts.height=90]
 */
export function svgRecoveryTrend(points, opts = {}) {
  const {
    target    = null,
    cmIndex   = null,
    direction = 'higher_better',
    width     = 280,
    height    = 90,
  } = opts;

  const PAD_L = 28;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 24;

  const W = width  - PAD_L - PAD_R;
  const H = height - PAD_T - PAD_B;

  const numeric = points.filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (numeric.length === 0) return _noDataSvg(width, height);

  let minV = Math.min(...numeric);
  let maxV = Math.max(...numeric);
  if (target !== null) {
    minV = Math.min(minV, target);
    maxV = Math.max(maxV, target);
  }
  if (maxV === minV) { maxV = minV + 1; } // avoid zero-range

  const scaleX = (i) => PAD_L + _scale(i, 0, points.length - 1 || 1, 0, W);
  const scaleY = (v) => PAD_T + H - _scale(v, minV, maxV, 0, H);

  // Trend polyline segments (skip nulls as gaps), same pattern as svgLine.
  let segments = [];
  let current  = [];
  points.forEach((v, i) => {
    if (typeof v === 'number' && !Number.isNaN(v)) {
      current.push(`${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`);
    } else {
      if (current.length > 1) segments.push(current.join(' '));
      current = [];
    }
  });
  if (current.length > 1) segments.push(current.join(' '));
  const polylines = segments
    .map(pts => `<polyline points="${pts}" fill="none" stroke="${ACCENT.value}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>`)
    .join('');

  // Light green "in-band" (good) zone — ABOVE the target line for
  // higher_better metrics (higher values are good), BELOW it for
  // lower_better metrics (e.g. HR TRIR/turnover, target 0 — lower values are
  // good). Previously always shaded above target regardless of direction,
  // which read backwards for lower_better KPIs (the whole plot could shade
  // green while the dots were correctly red).
  let band = '';
  if (target !== null) {
    const bandTop    = direction === 'lower_better' ? scaleY(target) : PAD_T;
    const bandBottom = direction === 'lower_better' ? PAD_T + H : scaleY(target);
    band = `<rect x="${PAD_L}" y="${bandTop.toFixed(1)}" width="${W}" height="${Math.max(0, bandBottom - bandTop).toFixed(1)}" fill="${RAG_COLORS.green}" opacity="0.12"/>`;
  }

  // Dashed target line.
  const targetLine = target !== null
    ? `<line x1="${PAD_L}" y1="${scaleY(target).toFixed(1)}" x2="${PAD_L + W}" y2="${scaleY(target).toFixed(1)}"
           stroke="${RAG_COLORS.amber}" stroke-width="1" stroke-dasharray="4,3" opacity="0.9"/>`
    : '';

  // Vertical dashed "countermeasure in" marker.
  const cmMarker = (cmIndex !== null && cmIndex !== undefined && cmIndex >= 0 && cmIndex < points.length)
    ? `<line x1="${scaleX(cmIndex).toFixed(1)}" y1="${PAD_T}" x2="${scaleX(cmIndex).toFixed(1)}" y2="${PAD_T + H}"
           stroke="${SLATE[600]}" stroke-width="1" stroke-dasharray="2,2" opacity="0.7" data-marker="countermeasure"/>`
    : '';

  // Dots coloured per point via ragStatus (green/amber/red/nodata), honouring
  // the KPI's direction so lower_better metrics (safety TRIR, turnover) aren't
  // inverted (a rising TRIR must read red, not green).
  const dots = points
    .map((v, i) => {
      if (typeof v !== 'number' || Number.isNaN(v)) return '';
      const status = ragStatus(v, target, direction);
      const fill = RAG_COLORS[status] || ACCENT.value;
      return `<circle cx="${scaleX(i).toFixed(1)}" cy="${scaleY(v).toFixed(1)}" r="2.5" fill="${fill}"/>`;
    })
    .join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="none"/>
  ${band}
  ${targetLine}
  ${cmMarker}
  ${polylines}
  ${dots}
</svg>`;
}

/**
 * svgFunnel(counts, opts) → SVG string
 *
 * Vertical bar funnel showing how many KZs (kaizen zones / affected items)
 * reach each step of the 8-step problem-solving process. Bars are RAG-graded
 * against the starting count (step 1), so a steep downstream drop-off reads
 * as red while steps still close to full reach read green.
 *
 * @param {Array<number|null>} counts   — reach count per step (typically 8-length)
 * @param {object}  opts
 * @param {string[]} [opts.labels]      — step labels; default D1..Dn
 * @param {number}  [opts.width=280]
 * @param {number}  [opts.height=140]
 */
export function svgFunnel(counts, opts = {}) {
  const {
    labels = [],
    width  = 280,
    height = 140,
  } = opts;

  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 14;
  const PAD_B = 22; // room for step labels

  const numeric = counts.filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (numeric.length === 0) return _noDataSvg(width, height);

  const n = counts.length;
  const W = width  - PAD_L - PAD_R;
  const H = height - PAD_T - PAD_B;

  const gap  = 4;
  const barW = Math.max(2, (W - gap * (n - 1)) / n);
  const maxV = Math.max(...numeric);
  // Charts use the viz palette only — never a RAG status hue as a bar fill.
  // Emphasize the step with the largest drop-off (the "story" in a retention
  // funnel) in the rust viz-accent; the rest render in the neutral viz single.
  let dropIdx = -1, maxDrop = -Infinity;
  for (let i = 1; i < counts.length; i++) {
    if (typeof counts[i] === 'number' && typeof counts[i - 1] === 'number') {
      const d = counts[i - 1] - counts[i];
      if (d > maxDrop) { maxDrop = d; dropIdx = i; }
    }
  }

  const bars = counts.map((v, i) => {
    const x    = PAD_L + i * (barW + gap);
    const val  = (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
    const barH = val !== null ? Math.max(1, _scale(val, 0, maxV, 0, H)) : 0;
    const y    = PAD_T + (H - barH);
    const fill   = val === null ? VIZ.muted : (i === dropIdx ? VIZ.rust : VIZ.single);
    const label  = labels[i] != null ? String(labels[i]) : `D${i + 1}`;
    const valStr = val !== null ? String(val) : '—';

    return `
    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="2" fill="${fill}" opacity="0.85"/>
    <text x="${(x + barW / 2).toFixed(1)}" y="${Math.max(9, y - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="${SLATE[600]}">${valStr}</text>
    <text x="${(x + barW / 2).toFixed(1)}" y="${(height - 6).toFixed(1)}" text-anchor="middle" font-size="9" fill="${SLATE[600]}">${_escXml(label)}</text>`;
  }).join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${bars}
</svg>`;
}

/**
 * svgPareto(rows, opts) → SVG string
 *
 * Pareto chart: svgBars-style horizontal bars, sorted descending by value,
 * overlaid with a cumulative-% polyline tracing the running total across
 * rows (classic 80/20 view of top contributors).
 *
 * Every input row gets exactly one bar (mirrors svgFunnel's one-mark-per-index
 * convention): valid values are sorted descending; null/non-numeric rows are
 * kept represented as zero-width "—" placeholders after the valid ones, so a
 * category with missing data never silently vanishes from the chart.
 *
 * @param {Array<{label:string, value:number|null}>} rows
 * @param {object} opts
 * @param {number} [opts.width=280]
 * @param {number} [opts.height]        — defaults to fit all rows
 * @param {number} [opts.barHeight=20]
 * @param {number} [opts.gap=6]
 */
export function svgPareto(rows, opts = {}) {
  const {
    width     = 280,
    height    = null,
    barHeight = 20,
    gap       = 6,
  } = opts;

  const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);

  if (!rows.some(r => isNum(r.value))) return _noDataSvg(width, height || 90);

  // One bar per input row: valid values descending first, null/non-numeric
  // rows kept (represented as placeholders) after them.
  const ordered = rows
    .map(r => ({ label: r.label, value: r.value, valid: isNum(r.value) }))
    .sort((a, b) => {
      if (a.valid && b.valid) return b.value - a.value;
      if (a.valid !== b.valid) return a.valid ? -1 : 1; // valid before placeholder
      return 0; // both placeholders: preserve input order (stable sort)
    });

  const PAD_L = 90; // label area
  const PAD_R = 40; // value area
  const PAD_T = 8;

  const trackW = width - PAD_L - PAD_R;
  const totalH = height || (PAD_T + ordered.length * (barHeight + gap));
  const validVals = ordered.filter(r => r.valid).map(r => r.value);
  const total  = validVals.reduce((s, v) => s + v, 0) || 1;
  const maxV   = validVals.length ? Math.max(...validVals) : 1;

  let running = 0;
  const cumPoints = [];

  const bars = ordered.map((row, i) => {
    const y   = PAD_T + i * (barHeight + gap);
    const cy  = y + barHeight / 2 + 4; // text baseline
    const val = row.valid ? row.value : null;
    // Zero-width placeholder bar for null/non-numeric rows (analogous to
    // svgFunnel's zero-height placeholder), so mark count == input length.
    const barW = val !== null ? Math.max(2, _scale(val, 0, maxV, 0, trackW)) : 0;

    // Cumulative % tracks only valid contributors.
    if (val !== null) {
      running += val;
      const cumPct = running / total;
      cumPoints.push(`${(PAD_L + cumPct * trackW).toFixed(1)},${(y + barHeight / 2).toFixed(1)}`);
    }

    const valStr = val !== null
      ? (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toFixed(1))
      : '—';

    return `
    <text x="${PAD_L - 4}" y="${cy}" text-anchor="end" font-size="10" fill="${SLATE[600]}" dominant-baseline="middle">${_escXml(row.label.slice(0, 14))}</text>
    <rect x="${PAD_L}" y="${y}" width="${barW.toFixed(1)}" height="${barHeight}" rx="3" fill="${val !== null ? ACCENT.value : SLATE[200]}" opacity="0.85"/>
    <text x="${PAD_L + trackW + 4}" y="${cy}" font-size="10" fill="${SLATE[600]}" dominant-baseline="middle">${valStr}</text>`;
  }).join('');

  const cumLine = `<polyline points="${cumPoints.join(' ')}" fill="none" stroke="${ACCENT.value}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  const cumDots = cumPoints
    .map(p => {
      const [x, y] = p.split(',');
      return `<circle cx="${x}" cy="${y}" r="2" fill="${ACCENT.value}"/>`;
    })
    .join('');

  return `<svg width="${width}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
  ${bars}
  ${cumLine}
  ${cumDots}
</svg>`;
}

/* ═══════════════════════════════════════════════════════════════════════
 * Viz-palette chart helpers — dataviz spec (docs/redesign/DESIGN-GUIDE.md
 * §4), ported additively from docs/redesign/reference/charts.js for the
 * not-yet-rebuilt views (KPI Boards adaptive chart, 8-step A3 gap/pareto/
 * recovery charts) to consume once their own layout tasks land.
 *
 * 2px round-cap lines · area wash = series color @ 10% · grid = 1px SOLID
 * hairline (never dashed) · target = dashed 1px neutral line, left-anchored
 * label · endpoint dot ringed in the panel color · hover = crosshair + white
 * tooltip card. Colors resolve through the same getComputedStyle-backed
 * _cssVar() pattern as RAG_COLORS/ACCENT/SLATE above, so every value tracks
 * the --viz- and --surface- tokens — never a hardcoded hex, never blue
 * #3b82f6, never a status hue (--red/--green/--amber) as a line/series
 * color. (meter() below is the one deliberate exception: it's a status
 * meter, not a chart line, so it uses --red/--amber/--green by design —
 * same semantics as every existing .badge--red/.status-cell in this app.)
 * ═══════════════════════════════════════════════════════════════════════ */

const VIZ = {
  get single()      { return `hsl(${_cssVar('--viz-single', '197 13% 52%')})`; },
  get singleSoft()  { return `hsl(${_cssVar('--viz-single', '197 13% 52%')} / 0.10)`; },
  get rust()        { return `hsl(${_cssVar('--viz-2', '9 37% 56%')})`; },
  get rustSoft()    { return `hsl(${_cssVar('--viz-2', '9 37% 56%')} / 0.10)`; },
  get contextLine() { return `hsl(${_cssVar('--viz-7', '210 2% 49%')} / 0.45)`; },
  get muted()       { return `hsl(${_cssVar('--viz-7', '210 2% 49%')} / 0.35)`; },
  get grid()        { return `hsl(${_cssVar('--surface-11', '30 7% 6%')} / 0.07)`; },
  get target()      { return `hsl(${_cssVar('--surface-7a', '35 9% 37%')} / 0.55)`; },
  get panel()       { return _cssVar('--panel', '#ffffff'); },
};
export { VIZ };

/* Scale a 1-D series into {x,y,v,i} pixel points for a plot frame. Distinct
   from svgLine's inline scaleX/scaleY closures above — lineChart/stepChart/
   sparkline need the point objects themselves (not just a path string) for
   end-label placement, collision-nudge math, and the area-wash polygon. */
function _scalePts(series, w, h, pad, lo, hi) {
  const n = series.length;
  return series.map((v, i) => {
    const x = pad.l + (i / Math.max(1, n - 1)) * (w - pad.l - pad.r);
    const y = v == null ? null : pad.t + (1 - (v - lo) / (hi - lo || 1)) * (h - pad.t - pad.b);
    return { x, y, v, i };
  });
}

function _pathFromPts(pts) {
  let d = '';
  pts.forEach(p => { if (p.y == null) return; d += (d ? ' L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); });
  return d;
}

/**
 * fmtVal(v, unit) → display string for a raw metric value. Shared by the
 * chart hover tooltips (wireChartHover) and sparkline hover labels.
 */
export function fmtVal(v, unit) {
  if (v == null) return '—';
  if (unit === 'ratio') return (v * 100).toFixed(1) + '%';
  if (unit === '$/wk' || unit === '$' || unit === '$/mo') return '$' + Math.round(v).toLocaleString('en-US');
  if (unit === 'pcs/hr') return v.toFixed(1);
  if (unit === 'hrs') return v.toFixed(1) + ' hrs';
  if (unit === 'count') return String(v);
  if (unit === 'rate') return String(v);
  return typeof v === 'number' ? v.toLocaleString('en-US') : String(v);
}

/**
 * sparkline(series, opts) → SVG string — spec-compliant ~120×34 table/tile
 * trend line: area wash, dashed target, endpoint dot ringed in the panel
 * color. New export — no prior helper filled this role; the 20 existing
 * `svgLine(..., {mini:true})` call sites across views are untouched and
 * keep rendering exactly as before until their view's rebuild task swaps
 * them over.
 *
 * @param {Array<number|null>} series
 * @param {object} [opts]
 * @param {number} [opts.w=120]
 * @param {number} [opts.h=34]
 * @param {number} [opts.target]     — optional dashed reference line
 * @param {string} [opts.color]      — defaults to VIZ.single
 * @param {string} [opts.soft]       — area-wash color; defaults to VIZ.singleSoft
 * @param {string[]} [opts.labels]   — per-point labels for the hover tooltip
 * @param {string} [opts.fmt]        — unit passed to fmtVal on hover
 * @param {string} [opts.name]       — series name for aria-label / hover
 */
export function sparkline(series, opts = {}) {
  const w = opts.w || 120, h = opts.h || 34;
  const color = opts.color || VIZ.single;
  const soft = opts.soft || VIZ.singleSoft;
  const vals = series.filter(v => v != null);
  if (!vals.length) return `<svg class="spark" width="${w}" height="${h}" aria-hidden="true"></svg>`;
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (opts.target != null) { lo = Math.min(lo, opts.target); hi = Math.max(hi, opts.target); }
  const span = (hi - lo) || Math.abs(hi) * 0.1 || 1;
  lo -= span * 0.12; hi += span * 0.12;
  const pad = { l: 2, r: 5, t: 3, b: 3 };
  const pts = _scalePts(series, w, h, pad, lo, hi);
  const d = _pathFromPts(pts);
  const last = [...pts].reverse().find(p => p.y != null);
  const area = d ? d + ` L${last.x.toFixed(1)} ${h - pad.b} L${pts[0].x.toFixed(1)} ${h - pad.b} Z` : '';
  let targetLine = '';
  if (opts.target != null) {
    const ty = pad.t + (1 - (opts.target - lo) / (hi - lo)) * (h - pad.t - pad.b);
    targetLine = `<line x1="${pad.l}" x2="${w - pad.r}" y1="${ty.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="3 3"/>`;
  }
  const hover = opts.labels ? `data-spark='${_escXml(JSON.stringify({ s: series, labels: opts.labels, fmt: opts.fmt || 'raw', name: opts.name || '' }))}'` : '';
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${hover} role="img" aria-label="${_escXml(opts.name || 'trend')}">
    ${area ? `<path d="${area}" fill="${soft}"/>` : ''}
    ${targetLine}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="3" fill="${color}" stroke="${VIZ.panel}" stroke-width="2"/>
  </svg>`;
}

/**
 * lineChart(cfg) → SVG string — multi-series weekly-trend chart (e.g. OTP by
 * location). Direct end labels per series with vertical collision nudging;
 * a left-anchored dashed neutral target line labeled "Target N%" (left, not
 * right, so it never collides with the end labels); hover wiring via
 * `data-linechart` (see wireChartHover).
 *
 * Series colors — including which series is the emphasized "story" line vs.
 * a de-emphasized context line — are supplied by the caller via
 * `cfg.series[].color`; per-view rebuild tasks should source them from the
 * exported `VIZ` object (VIZ.single / VIZ.rust / VIZ.rustSoft /
 * VIZ.contextLine) so every chart keeps resolving through the token layer.
 * The swatch `.legend` block shown only for multi-series charts is
 * call-site markup built from `.legend`/`.legend__item`/`.legend__swatch`
 * (already ported into styles.css) — matching reference/view-kpi.js, which
 * builds it next to its `lineChart()` call rather than inside the SVG
 * generator itself; that per-view wiring is out of scope for this port.
 *
 * @param {object} cfg
 * @param {Array<{name:string,data:Array<number|null>,color:string,soft?:string,emphasis?:boolean}>} cfg.series
 * @param {string[]} cfg.xLabels
 * @param {number} [cfg.target]
 * @param {function} [cfg.fmtY]
 * @param {number} [cfg.w=760]
 * @param {number} [cfg.h=260]
 * @param {number} [cfg.yTicks=4]
 * @param {string} [cfg.fmt]    — unit forwarded through the hover payload to fmtVal
 * @param {string} [cfg.label] — aria-label
 */
export function lineChart(cfg) {
  const w = cfg.w || 760, h = cfg.h || 260;
  const pad = { l: 44, r: 96, t: 14, b: 26 };
  let lo = Infinity, hi = -Infinity;
  cfg.series.forEach(s => s.data.forEach(v => { if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
  if (cfg.target != null) { lo = Math.min(lo, cfg.target); hi = Math.max(hi, cfg.target); }
  const span = hi - lo; lo -= span * 0.08; hi += span * 0.08;
  const yTicks = cfg.yTicks || 4;
  let grid = '', axis = '';
  for (let t = 0; t <= yTicks; t++) {
    const val = lo + (t / yTicks) * (hi - lo);
    const y = pad.t + (1 - t / yTicks) * (h - pad.t - pad.b);
    grid += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="${VIZ.grid}" stroke-width="1"/>`;
    axis += `<text x="${pad.l - 8}" y="${y + 3.5}" text-anchor="end" class="chart-axis">${cfg.fmtY ? cfg.fmtY(val) : Math.round(val)}</text>`;
  }
  const n = cfg.series[0].data.length;
  let xAxis = '';
  cfg.xLabels.forEach((lb, i) => {
    const x = pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
    xAxis += `<text x="${x}" y="${h - 6}" text-anchor="middle" class="chart-axis">${_escXml(lb)}</text>`;
  });
  let targetLine = '';
  const endYs = [];
  if (cfg.target != null) {
    const ty = pad.t + (1 - (cfg.target - lo) / (hi - lo)) * (h - pad.t - pad.b);
    targetLine = `<line x1="${pad.l}" x2="${w - pad.r}" y1="${ty}" y2="${ty}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="${pad.l + 8}" y="${ty - 5}" class="chart-axis" style="font-weight:600">Target ${cfg.fmtY ? cfg.fmtY(cfg.target) : cfg.target}</text>`;
  }
  let lines = '', endLabels = '';
  cfg.series.forEach(s => {
    const pts = _scalePts(s.data, w, h, pad, lo, hi);
    const last = [...pts].reverse().find(p => p.y != null);
    lines += `<path d="${_pathFromPts(pts)}" fill="none" stroke="${s.color}" stroke-width="${s.emphasis ? 2.5 : 2}" stroke-linecap="round" stroke-linejoin="round" ${s.emphasis ? '' : 'opacity="0.85"'}/>`;
    if (s.emphasis) {
      const ptsArea = _pathFromPts(pts) + ` L${last.x.toFixed(1)} ${h - pad.b} L${pts[0].x.toFixed(1)} ${h - pad.b} Z`;
      lines = `<path d="${ptsArea}" fill="${s.soft || 'transparent'}"/>` + lines;
    }
    if (last) {
      lines += `<circle cx="${last.x}" cy="${last.y}" r="${s.emphasis ? 4 : 3}" fill="${s.color}" stroke="${VIZ.panel}" stroke-width="2"/>`;
      // Collision-nudged end labels — keep a running list of used y-positions
      // and push any label within 13px of an existing one further down.
      let ly = last.y;
      endYs.sort((a, b) => a - b).forEach(prev => { if (Math.abs(ly - prev) < 13) ly = prev + 13; });
      endYs.push(ly);
      endLabels += `<text x="${w - pad.r + 8}" y="${ly + 3.5}" class="chart-end-label" style="${s.emphasis ? 'font-weight:600' : ''}">${_escXml(s.name)} ${cfg.fmtY ? cfg.fmtY(last.v) : last.v}</text>`;
    }
  });
  const hoverData = _escXml(JSON.stringify({
    series: cfg.series.map(s => ({ name: s.name, data: s.data, color: s.color })),
    xLabels: cfg.xLabels, fmt: cfg.fmt || 'ratio',
    pad, w, h, lo, hi,
  }));
  return `<div class="linechart-wrap"><svg class="linechart" viewBox="0 0 ${w} ${h}" data-linechart='${hoverData}' role="img" aria-label="${_escXml(cfg.label || 'line chart')}">
    ${grid}${axis}${xAxis}${targetLine}${lines}${endLabels}
    <line class="lc-crosshair" y1="${pad.t}" y2="${h - pad.b}" stroke="${VIZ.target}" stroke-width="1" style="display:none"/>
  </svg></div>`;
}

/**
 * stepChart(series, opts) → SVG string — the A3 gap/recovery chart: a solid
 * actual series plotted against a dashed target line, with an optional
 * dashed hollow-dot `projected` tail appended after a vertical
 * "countermeasure in" marker. Used both for the plain gap chart (Step 1 —
 * no `projected`) and the recovery chart (Step 7 — with `projected`).
 *
 * The `illustrative` caption badge that pairs with a projected/recovery
 * chart is call-site markup (see reference view-solve.js's `chartFig`
 * wrapper, which adds a `<figcaption class="chart-fig__cap">` with a
 * `badge badge--outline` reading "illustrative") — out of scope for this
 * port, which is the SVG generator only; the 8-step A3 view task (not yet
 * built) wires that wrapper using the already-ported `.chart-fig`/
 * `.chart-fig__cap` classes.
 *
 * @param {Array<number>} series           — actual values
 * @param {object} [opts]
 * @param {number} [opts.w=640]
 * @param {number} [opts.h=170]
 * @param {number} [opts.target]
 * @param {Array<number>} [opts.projected] — dashed hollow-dot tail after series
 * @param {string[]} [opts.xLabels]
 * @param {function} [opts.fmtY]
 * @param {string} [opts.label]            — aria-label
 */
export function stepChart(series, opts = {}) {
  const w = opts.w || 640, h = opts.h || 170;
  const pad = { l: 46, r: 16, t: 14, b: 24 };
  const tail = opts.projected || [];
  const all = series.concat(tail);
  let lo = Math.min(...all), hi = Math.max(...all);
  if (opts.target != null) { lo = Math.min(lo, opts.target); hi = Math.max(hi, opts.target); }
  const span = (hi - lo) || 1; lo -= span * 0.1; hi += span * 0.1;
  const n = all.length;
  const X = i => pad.l + (i / Math.max(1, n - 1)) * (w - pad.l - pad.r);
  const Y = v => pad.t + (1 - (v - lo) / (hi - lo)) * (h - pad.t - pad.b);
  const fmt = opts.fmtY || (v => Math.round(v * 100) + '%');
  let grid = '', axis = '';
  for (let t = 0; t <= 3; t++) {
    const val = lo + (t / 3) * (hi - lo), y = Y(val);
    grid += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="${VIZ.grid}" stroke-width="1"/>`;
    axis += `<text x="${pad.l - 8}" y="${y + 3.5}" text-anchor="end" class="chart-axis">${fmt(val)}</text>`;
  }
  let xAxis = '';
  (opts.xLabels || []).forEach((lb, i) => {
    if (i % Math.ceil(n / 10) !== 0 && i !== n - 1) return;
    xAxis += `<text x="${X(i)}" y="${h - 6}" text-anchor="middle" class="chart-axis">${_escXml(lb)}</text>`;
  });
  let targetLine = '';
  if (opts.target != null) {
    const ty = Y(opts.target);
    targetLine = `<line x1="${pad.l}" x2="${w - pad.r}" y1="${ty}" y2="${ty}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="${pad.l + 8}" y="${ty - 5}" class="chart-axis" style="font-weight:600">Target ${fmt(opts.target)}</text>`;
  }
  const actualPts = series.map((v, i) => ({ x: X(i), y: Y(v) }));
  const dActual = actualPts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  const area = dActual + ` L${actualPts[actualPts.length - 1].x.toFixed(1)} ${h - pad.b} L${actualPts[0].x.toFixed(1)} ${h - pad.b} Z`;
  let tailSvg = '', marker = '';
  if (tail.length) {
    const tp = tail.map((v, j) => ({ x: X(series.length + j), y: Y(v) }));
    const start = actualPts[actualPts.length - 1];
    const dTail = 'M' + start.x.toFixed(1) + ' ' + start.y.toFixed(1) + tp.map(p => ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
    tailSvg = `<path d="${dTail}" fill="none" stroke="${VIZ.single}" stroke-width="2" stroke-dasharray="3 4" stroke-linecap="round"/>`
      + tp.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${VIZ.panel}" stroke="${VIZ.single}" stroke-width="1.5"/>`).join('');
    marker = `<line x1="${start.x.toFixed(1)}" x2="${start.x.toFixed(1)}" y1="${pad.t}" y2="${h - pad.b}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="2 3"/>
      <text x="${start.x.toFixed(1)}" y="${pad.t + 2}" text-anchor="middle" class="chart-axis" style="font-weight:600" dy="-2">countermeasure in</text>`;
  }
  const last = actualPts[actualPts.length - 1];
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${_escXml(opts.label || 'actual vs target')}">
    ${grid}${axis}${xAxis}${targetLine}
    <path d="${area}" fill="${VIZ.singleSoft}"/>
    <path d="${dActual}" fill="none" stroke="${VIZ.single}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${tailSvg}${marker}
    <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="3.5" fill="${VIZ.single}" stroke="${VIZ.panel}" stroke-width="2"/>
  </svg>`;
}

/**
 * paretoBars(rows, opts) → SVG string — largest-first horizontal bars for
 * the 8-step A3's "where is the gap coming from" chart: the first (largest)
 * bar is rust (VIZ.rust), the rest are muted neutral gray, with value
 * labels at the bar end. Rows are expected pre-sorted largest-first by the
 * caller (matches reference/charts.js — row[0] always gets the emphasis
 * treatment regardless of its actual value).
 *
 * Distinct from the existing `svgPareto` export above (left untouched): that
 * one adds a cumulative-% polyline overlay for a classic 80/20 pareto and is
 * still used as-is; this is the plainer "gap contribution, largest first"
 * bar chart the A3 needs.
 *
 * @param {Array<{label:string, value:number}>} rows
 * @param {object} [opts]
 * @param {number} [opts.w=640]
 * @param {function} [opts.fmt]   — value label formatter; default "N.N pts"
 * @param {string} [opts.label]   — aria-label
 */
export function paretoBars(rows, opts = {}) {
  const w = opts.w || 640, rowH = 34, pad = { l: 96, r: 60, t: 6, b: 6 };
  const h = pad.t + pad.b + rows.length * rowH;
  const max = Math.max(...rows.map(r => r.value), 0.0001);
  const fmt = opts.fmt || (v => (v * 100).toFixed(1) + ' pts');
  const bars = rows.map((r, i) => {
    const y = pad.t + i * rowH;
    const bw = Math.max(2, (r.value / max) * (w - pad.l - pad.r));
    const emphasized = i === 0;
    return `
      <text x="${pad.l - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" class="chart-axis" style="${emphasized ? 'font-weight:600;fill:var(--text)' : ''}">${_escXml(r.label)}</text>
      <rect x="${pad.l}" y="${y + 7}" width="${bw.toFixed(1)}" height="${rowH - 14}" rx="4"
        fill="${emphasized ? VIZ.rust : VIZ.muted}"/>
      <text x="${pad.l + bw + 8}" y="${y + rowH / 2 + 4}" class="chart-axis" style="${emphasized ? 'font-weight:600;fill:var(--text)' : ''}">${fmt(r.value)}</text>`;
  }).join('');
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${_escXml(opts.label || 'gap breakdown')}">${bars}</svg>`;
}

/**
 * meter(pct, tone) → HTML string — actual-vs-target status meter: a
 * severity fill on a same-ramp track. Uses --red/--amber/--green directly,
 * exactly like every other RAG status affordance in this app (`.badge--red`,
 * `.status-cell`, `.rag-chip--*`) — this is a status indicator, not a chart
 * line/series, so the "no status hue as a line color" rule does not apply
 * to it (see the file-header note above).
 *
 * @param {number} pct   — 0..1 fill fraction (clamped)
 * @param {'red'|'amber'|'green'} [tone]
 */
export function meter(pct, tone) {
  const clamped = Math.max(0, Math.min(1, pct));
  const fill = tone === 'red' ? 'var(--red)' : tone === 'amber' ? 'var(--amber)' : 'var(--green)';
  const track = tone === 'red' ? 'var(--red-bg)' : tone === 'amber' ? 'var(--amber-bg)' : 'var(--green-bg)';
  return `<div class="meter" style="background:${track}"><span style="width:${(clamped * 100).toFixed(1)}%;background:${fill}"></span></div>`;
}

/**
 * wireChartHover(root, tipEl) → void — hover crosshair + tooltip wiring for
 * every `[data-spark]` and `[data-linechart]` element under `root`. Call
 * once after render. Tooltip = white card with a running-head label plus,
 * for line charts, one swatch+value row per series; sparklines get the same
 * tooltip with a single value.
 *
 * @param {ParentNode} root   — container to scope the query (e.g. the view's <el>)
 * @param {HTMLElement} tipEl — the tooltip card element (toggled via style.display, positioned via style.left/top)
 */
export function wireChartHover(root, tipEl) {
  root.querySelectorAll('[data-spark]').forEach(svg => {
    const cfg = JSON.parse(svg.dataset.spark);
    svg.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect();
      const i = Math.round(((e.clientX - r.left) / r.width) * (cfg.s.length - 1));
      const v = cfg.s[i];
      if (v == null) { tipEl.style.display = 'none'; return; }
      tipEl.innerHTML = `<span class="running-head">${_escXml(cfg.labels[i] || '')}</span>${_escXml(fmtVal(v, cfg.fmt))}`;
      tipEl.style.display = 'block';
      tipEl.style.left = Math.min(e.clientX + 12, innerWidth - 150) + 'px';
      tipEl.style.top = (e.clientY - 40) + 'px';
    });
    svg.addEventListener('mouseleave', () => { tipEl.style.display = 'none'; });
  });
  root.querySelectorAll('[data-linechart]').forEach(svg => {
    const cfg = JSON.parse(svg.dataset.linechart);
    const cross = svg.querySelector('.lc-crosshair');
    svg.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect();
      const sx = cfg.w / r.width;
      const px = (e.clientX - r.left) * sx;
      const n = cfg.series[0].data.length;
      const frac = (px - cfg.pad.l) / (cfg.w - cfg.pad.l - cfg.pad.r);
      const i = Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1))));
      const cx = cfg.pad.l + (i / (n - 1)) * (cfg.w - cfg.pad.l - cfg.pad.r);
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx);
      cross.style.display = '';
      const rows = cfg.series.map(s =>
        `<div class="tip-row"><span class="legend__swatch" style="background:${s.color}"></span>${_escXml(s.name)}<b class="tnum">${_escXml(fmtVal(s.data[i], cfg.fmt))}</b></div>`).join('');
      tipEl.innerHTML = `<span class="running-head">${_escXml(cfg.xLabels[i])}</span>${rows}`;
      tipEl.style.display = 'block';
      tipEl.style.left = Math.min(e.clientX + 14, innerWidth - 200) + 'px';
      tipEl.style.top = (e.clientY - 20) + 'px';
    });
    svg.addEventListener('mouseleave', () => { tipEl.style.display = 'none'; cross.style.display = 'none'; });
  });
}

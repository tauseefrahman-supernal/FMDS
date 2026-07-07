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
const ACCENT = { get value() { return _cssVar('--accent', '#2f6bff'); } };
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
    const fill   = row.rag ? RAG_COLORS[row.rag] || SLATE[200] : ACCENT.value;
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

  // Light green band at/above target.
  const band = target !== null
    ? `<rect x="${PAD_L}" y="${PAD_T}" width="${W}" height="${Math.max(0, scaleY(target) - PAD_T).toFixed(1)}" fill="${RAG_COLORS.green}" opacity="0.12"/>`
    : '';

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
  // Grade each step's reach against the starting count (step 1), not the max,
  // so the funnel reads as a retention curve rather than a min-max normalize.
  const base = (typeof counts[0] === 'number' && counts[0] > 0) ? counts[0] : maxV;

  const bars = counts.map((v, i) => {
    const x    = PAD_L + i * (barW + gap);
    const val  = (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
    const barH = val !== null ? Math.max(1, _scale(val, 0, maxV, 0, H)) : 0;
    const y    = PAD_T + (H - barH);
    const status = val !== null ? ragStatus(val, base, 'higher_better', { green: 0.8, amber: 0.5 }) : 'nodata';
    const fill   = RAG_COLORS[status] || ACCENT.value;
    const label  = labels[i] != null ? String(labels[i]) : `D${i + 1}`;
    const valStr = val !== null ? String(val) : '—';

    return `
    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="2" fill="${fill}" opacity="0.85"/>
    <text x="${(x + barW / 2).toFixed(1)}" y="${Math.max(9, y - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="${SLATE[600]}">${valStr}</text>
    <text x="${(x + barW / 2).toFixed(1)}" y="${(height - 6).toFixed(1)}" text-anchor="middle" font-size="9" fill="${SLATE[600]}">${label}</text>`;
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

/**
 * lib/charts.js — inline SVG chart generators
 * Returns SVG strings; zero external dependencies.
 * RAG palette sourced from styles.css CSS variables (matched verbatim).
 */

const RAG_COLORS = {
  green:  '#2f9e44',
  amber:  '#e8590c',
  red:    '#e03131',
  nodata: '#adb5bd',
};

const ACCENT  = '#3b5bdb';
const SLATE   = { 200: '#e9ecef', 300: '#dee2e6', 600: '#868e96' };

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
    color   = ACCENT,
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
    const fill   = row.rag ? RAG_COLORS[row.rag] || SLATE[200] : ACCENT;
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

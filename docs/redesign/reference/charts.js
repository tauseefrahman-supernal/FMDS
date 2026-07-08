/* ═══ Chart helpers — dataviz spec: 2px lines, 10% area wash, hairline solid
   grid, ≥8px end markers with 2px surface ring, hover crosshair+tooltip. ═══ */

const VIZ = {
  single: 'hsl(197 13% 52%)',
  singleSoft: 'hsl(197 13% 52% / 0.10)',
  rust: 'hsl(9 37% 56%)',
  rustSoft: 'hsl(9 37% 56% / 0.10)',
  contextLine: 'hsl(210 2% 49% / 0.45)',
  grid: 'hsl(30 7% 6% / 0.07)',
  target: 'hsl(35 9% 37% / 0.55)',
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Scale a series into pixel points */
function scalePts(series, w, h, pad, lo, hi) {
  const n = series.length;
  return series.map((v, i) => {
    const x = pad.l + (i / Math.max(1, n - 1)) * (w - pad.l - pad.r);
    const y = v == null ? null : pad.t + (1 - (v - lo) / (hi - lo || 1)) * (h - pad.t - pad.b);
    return { x, y, v, i };
  });
}

function pathFrom(pts) {
  let d = '';
  pts.forEach(p => { if (p.y == null) return; d += (d ? ' L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); });
  return d;
}

/* Sparkline with optional target reference line + endpoint marker.
   opts: {w,h,target,color,soft,lo,hi,labels(array for tooltip),fmt} */
function sparkline(series, opts = {}) {
  const w = opts.w || 120, h = opts.h || 36;
  const color = opts.color || VIZ.single;
  const soft = opts.soft || VIZ.singleSoft;
  const vals = series.filter(v => v != null);
  if (!vals.length) return `<svg class="spark" width="${w}" height="${h}" aria-hidden="true"></svg>`;
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (opts.target != null) { lo = Math.min(lo, opts.target); hi = Math.max(hi, opts.target); }
  const span = (hi - lo) || Math.abs(hi) * 0.1 || 1;
  lo -= span * 0.12; hi += span * 0.12;
  const pad = { l: 2, r: 5, t: 3, b: 3 };
  const pts = scalePts(series, w, h, pad, lo, hi);
  const d = pathFrom(pts);
  const last = [...pts].reverse().find(p => p.y != null);
  const area = d ? d + ` L${last.x.toFixed(1)} ${h - pad.b} L${pts[0].x.toFixed(1)} ${h - pad.b} Z` : '';
  let targetLine = '';
  if (opts.target != null) {
    const ty = pad.t + (1 - (opts.target - lo) / (hi - lo)) * (h - pad.t - pad.b);
    targetLine = `<line x1="${pad.l}" x2="${w - pad.r}" y1="${ty.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="3 3"/>`;
  }
  const hover = opts.labels ? `data-spark='${esc(JSON.stringify({ s: series, labels: opts.labels, fmt: opts.fmt || 'raw', name: opts.name || '' }))}'` : '';
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${hover} role="img" aria-label="${esc(opts.name || 'trend')}">
    ${area ? `<path d="${area}" fill="${soft}"/>` : ''}
    ${targetLine}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="3" fill="${color}" stroke="var(--panel)" stroke-width="2"/>
  </svg>`;
}

/* Format helpers */
function fmtVal(v, unit) {
  if (v == null) return '—';
  if (unit === 'ratio') return (v * 100).toFixed(1) + '%';
  if (unit === '$/wk' || unit === '$' || unit === '$/mo') return '$' + Math.round(v).toLocaleString('en-US');
  if (unit === 'pcs/hr') return v.toFixed(1);
  if (unit === 'hrs') return v.toFixed(1) + ' hrs';
  if (unit === 'count') return String(v);
  if (unit === 'rate') return String(v);
  return typeof v === 'number' ? v.toLocaleString('en-US') : String(v);
}

/* Big multi-series line chart (weekly OTP by location).
   series: [{name, data, color, width, emphasis}], xLabels, target */
function lineChart(cfg) {
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
    xAxis += `<text x="${x}" y="${h - 6}" text-anchor="middle" class="chart-axis">${esc(lb)}</text>`;
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
    const pts = scalePts(s.data, w, h, pad, lo, hi);
    const last = [...pts].reverse().find(p => p.y != null);
    lines += `<path d="${pathFrom(pts)}" fill="none" stroke="${s.color}" stroke-width="${s.emphasis ? 2.5 : 2}" stroke-linecap="round" stroke-linejoin="round" ${s.emphasis ? '' : 'opacity="0.85"'}/>`;
    if (s.emphasis) {
      const ptsArea = pathFrom(pts) + ` L${last.x.toFixed(1)} ${h - pad.b} L${pts[0].x.toFixed(1)} ${h - pad.b} Z`;
      lines = `<path d="${ptsArea}" fill="${s.soft || 'transparent'}"/>` + lines;
    }
    if (last) {
      lines += `<circle cx="${last.x}" cy="${last.y}" r="${s.emphasis ? 4 : 3}" fill="${s.color}" stroke="var(--panel)" stroke-width="2"/>`;
      // collision-nudged end labels
      let ly = last.y;
      endYs.sort((a, b) => a - b).forEach(prev => { if (Math.abs(ly - prev) < 13) ly = prev + 13; });
      endYs.push(ly);
      endLabels += `<text x="${w - pad.r + 8}" y="${ly + 3.5}" class="chart-end-label" style="${s.emphasis ? 'font-weight:600' : ''}">${esc(s.name)} ${cfg.fmtY ? cfg.fmtY(last.v) : last.v}</text>`;
    }
  });
  const hoverData = esc(JSON.stringify({
    series: cfg.series.map(s => ({ name: s.name, data: s.data, color: s.color })),
    xLabels: cfg.xLabels, fmt: cfg.fmt || 'ratio',
    pad, w, h, lo, hi,
  }));
  return `<div class="linechart-wrap"><svg class="linechart" viewBox="0 0 ${w} ${h}" data-linechart='${hoverData}' role="img" aria-label="${esc(cfg.label || 'line chart')}">
    ${grid}${axis}${xAxis}${targetLine}${lines}${endLabels}
    <line class="lc-crosshair" y1="${pad.t}" y2="${h - pad.b}" stroke="${VIZ.target}" stroke-width="1" style="display:none"/>
  </svg></div>`;
}

/* A3 step chart — single series vs dashed target; optional projected recovery
   tail (dashed, hollow dots) after a countermeasure-in marker. */
function stepChart(series, opts = {}) {
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
    xAxis += `<text x="${X(i)}" y="${h - 6}" text-anchor="middle" class="chart-axis">${esc(lb)}</text>`;
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
      + tp.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="var(--panel)" stroke="${VIZ.single}" stroke-width="1.5"/>`).join('');
    marker = `<line x1="${start.x.toFixed(1)}" x2="${start.x.toFixed(1)}" y1="${pad.t}" y2="${h - pad.b}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="2 3"/>
      <text x="${start.x.toFixed(1)}" y="${pad.t + 2}" text-anchor="middle" class="chart-axis" style="font-weight:600" dy="-2">countermeasure in</text>`;
  }
  const last = actualPts[actualPts.length - 1];
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.label || 'actual vs target')}">
    ${grid}${axis}${xAxis}${targetLine}
    <path d="${area}" fill="${VIZ.singleSoft}"/>
    <path d="${dActual}" fill="none" stroke="${VIZ.single}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${tailSvg}${marker}
    <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="3.5" fill="${VIZ.single}" stroke="var(--panel)" stroke-width="2"/>
  </svg>`;
}

/* Pareto bars — gap contribution by family member, largest first */
function paretoBars(rows, opts = {}) {
  const w = opts.w || 640, rowH = 34, pad = { l: 96, r: 60, t: 6, b: 6 };
  const h = pad.t + pad.b + rows.length * rowH;
  const max = Math.max(...rows.map(r => r.value), 0.0001);
  const fmt = opts.fmt || (v => (v * 100).toFixed(1) + ' pts');
  const bars = rows.map((r, i) => {
    const y = pad.t + i * rowH;
    const bw = Math.max(2, (r.value / max) * (w - pad.l - pad.r));
    const emphasized = i === 0;
    return `
      <text x="${pad.l - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" class="chart-axis" style="${emphasized ? 'font-weight:600;fill:var(--text)' : ''}">${esc(r.label)}</text>
      <rect x="${pad.l}" y="${y + 7}" width="${bw.toFixed(1)}" height="${rowH - 14}" rx="4"
        fill="${emphasized ? VIZ.rust : 'hsl(210 2% 49% / 0.35)'}"/>
      <text x="${pad.l + bw + 8}" y="${y + rowH / 2 + 4}" class="chart-axis" style="${emphasized ? 'font-weight:600;fill:var(--text)' : ''}">${fmt(r.value)}</text>`;
  }).join('');
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.label || 'gap breakdown')}">${bars}</svg>`;
}

/* Meter bar: actual vs target, severity fill on same-ramp track */
function meter(pct, tone) {
  const clamped = Math.max(0, Math.min(1, pct));
  const fill = tone === 'red' ? 'var(--red)' : tone === 'amber' ? 'var(--amber)' : 'var(--green)';
  const track = tone === 'red' ? 'var(--red-bg)' : tone === 'amber' ? 'var(--amber-bg)' : 'var(--green-bg)';
  return `<div class="meter" style="background:${track}"><span style="width:${(clamped * 100).toFixed(1)}%;background:${fill}"></span></div>`;
}

/* Hover layer wiring — call once after render */
function wireChartHover(root, tipEl) {
  root.querySelectorAll('[data-spark]').forEach(svg => {
    const cfg = JSON.parse(svg.dataset.spark);
    svg.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect();
      const i = Math.round(((e.clientX - r.left) / r.width) * (cfg.s.length - 1));
      const v = cfg.s[i];
      if (v == null) { tipEl.style.display = 'none'; return; }
      tipEl.innerHTML = `<span class="running-head">${esc(cfg.labels[i] || '')}</span>${esc(fmtVal(v, cfg.fmt))}`;
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
        `<div class="tip-row"><span class="legend__swatch" style="background:${s.color}"></span>${esc(s.name)}<b class="tnum">${esc(fmtVal(s.data[i], cfg.fmt))}</b></div>`).join('');
      tipEl.innerHTML = `<span class="running-head">${esc(cfg.xLabels[i])}</span>${rows}`;
      tipEl.style.display = 'block';
      tipEl.style.left = Math.min(e.clientX + 14, innerWidth - 200) + 'px';
      tipEl.style.top = (e.clientY - 20) + 'px';
    });
    svg.addEventListener('mouseleave', () => { tipEl.style.display = 'none'; cross.style.display = 'none'; });
  });
}

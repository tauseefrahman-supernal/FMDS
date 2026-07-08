/**
 * views/odg-hub.js — ODG Method Hub (dedicated board)
 *
 * renderOdgHub(dept, mount)
 *
 * ODG is the method hub, not a plain KPI table. This dedicated board shows:
 *  1. Headline adoption gap — FMDS 93.2% vs 8-Step 18.9% — as prominent stats
 *  2. SRR-by-department as bars (Operations ~50%, others 0)
 *  3. Training-plan-vs-actual by the 8 programs as bars
 *  4. Link to KZ tracker (#/dept/odg/solve)
 *
 * Data is read from dept (odg.json) — no invented numbers.
 * Design: $150M-clean; reuses shared CSS classes.
 *
 * Task 7 re-skin note: these adoption/SRR/training bars are comparisons
 * across departments/programs against a single ramp target — not a per-row
 * on/off-track gate — so per design-system principle "RAG is reserved for
 * status, full stop" they render in the viz palette (identity/decoration)
 * rather than red/amber/green. vizBars() below is a small local renderer
 * (mirrors lib/charts.js svgBars()'s layout math) that resolves bar fill
 * from a viz token instead of the RAG palette; the shared svgBars() stays
 * untouched since other, already-migrated boards legitimately use it for
 * real per-row RAG status.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(ratio) {
  if (ratio == null) return '—';
  return (ratio * 100).toFixed(1) + '%';
}

// Resolve a CSS custom property from the live document (falls back to a
// plain hex when no DOM is present, e.g. under node --check / tests) —
// same pattern as lib/charts.js's _cssVar().
function _cssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// Local bar renderer using the viz-identity palette (never RAG hues) —
// see module header. `rows` is [{label, value}]; every bar in a given call
// shares one viz token (a single comparable metric across categories, like
// the artifact's default single-series line color), not a per-row status.
function vizBars(rows, { width = 480, barHeight = 22, gap = 7, vizVar = '--viz-single' } = {}) {
  const PAD_L = 90, PAD_R = 40, PAD_T = 8;
  const trackW = width - PAD_L - PAD_R;
  const totalH = PAD_T + rows.length * (barHeight + gap);
  const numeric = rows.map(r => r.value).filter(v => typeof v === 'number' && !Number.isNaN(v));
  const maxV = numeric.length ? Math.max(...numeric) : 1;

  // --muted / --text-dim are already complete `hsl(...)` values in
  // styles.css; the --viz-* tokens are bare "H S% L%" triples that still
  // need the hsl() wrapper (same distinction lib/charts.js's RAG_COLORS vs.
  // its viz usage draws).
  const trackFill = _cssVar('--muted', '#e9e5df');
  const labelFill = _cssVar('--text-dim', '#5f594e');
  const barFill   = `hsl(${_cssVar(vizVar, '197 13% 52%')})`;

  const bars = rows.map((row, i) => {
    const y    = PAD_T + i * (barHeight + gap);
    const cx   = PAD_L;
    const cy   = y + barHeight / 2 + 4;
    const val  = (typeof row.value === 'number' && !Number.isNaN(row.value)) ? row.value : null;
    const barW = val !== null ? Math.max(2, (val / maxV) * trackW) : 0;
    const valStr = val !== null ? (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toFixed(1)) : '—';

    return `
    <text x="${cx - 4}" y="${cy}" text-anchor="end" font-size="10" fill="${labelFill}" dominant-baseline="middle">${row.label.slice(0, 14)}</text>
    <rect x="${cx}" y="${y}" width="${trackW}" height="${barHeight}" rx="3" fill="${trackFill}"/>
    ${val !== null ? `<rect x="${cx}" y="${y}" width="${barW.toFixed(1)}" height="${barHeight}" rx="3" fill="${barFill}" opacity="0.9"/>` : ''}
    <text x="${cx + trackW + 4}" y="${cy}" font-size="10" fill="${labelFill}" dominant-baseline="middle">${valStr}</text>`;
  }).join('');

  return `<svg width="${width}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

// ─── Adoption headline section ───────────────────────────────────────────────

function renderAdoptionHeadline(dept) {
  const h = dept.headline || {};
  const fmds      = h.fmdsAdoption     ?? null;
  const eightStep = h.eightStepAdoption ?? null;
  const gap       = (fmds != null && eightStep != null) ? fmds - eightStep : null;

  return `
    <section class="odg-section card" style="margin-bottom:24px">
      <div class="odg-section-label">Adoption Gap — the Product Thesis</div>
      <p class="text-muted text-small mt-1 mb-4" style="max-width:560px;line-height:1.55">
        FMDS awareness is near-universal; 8-Step problem-solving is barely started.
        Closing this gap is what the OS exists to do.
      </p>
      <div style="display:flex;gap:32px;flex-wrap:wrap;align-items:flex-end">
        <div class="odg-stat-block">
          <div class="odg-stat-label">FMDS Adoption</div>
          <div class="odg-stat-value" style="color:hsl(var(--viz-single))">${pct(fmds)}</div>
          <div class="odg-stat-sub text-muted">93.2% trained on FMDS framework</div>
        </div>
        <div class="odg-stat-block">
          <div class="odg-stat-label">8-Step Usage</div>
          <div class="odg-stat-value" style="color:hsl(var(--viz-2))">${pct(eightStep)}</div>
          <div class="odg-stat-sub text-muted">18.9% actively using 8-Step</div>
        </div>
        ${gap != null ? `
        <div class="odg-stat-block">
          <div class="odg-stat-label">Adoption Gap</div>
          <div class="odg-stat-value" style="color:hsl(var(--viz-7))">${pct(gap)}</div>
          <div class="odg-stat-sub text-muted">method awareness vs method use</div>
        </div>` : ''}
      </div>
    </section>`;
}

// ─── SRR by department (bar chart) ───────────────────────────────────────────

function renderSrrBars(dept) {
  // Pull srr sub-KPIs from kpis array
  const srrKpi = dept.kpis.find(k => k.id === 'srr_overall');
  const subs = srrKpi ? srrKpi.contributors : [];

  const rows = subs.map(cid => {
    const k = dept.kpis.find(x => x.id === cid);
    if (!k) return null;
    return { label: k.name.replace('SRR — ', ''), value: k.actual };
  }).filter(Boolean);

  if (!rows.length) return '';

  const overallActual = srrKpi ? srrKpi.actual : null;

  return `
    <section class="odg-section card" style="margin-bottom:24px">
      <div class="odg-section-label">Strategic Review Rhythm (SRR) — by Department</div>
      <p class="text-muted text-small mt-1 mb-3" style="line-height:1.55">
        Overall: <strong>${pct(overallActual)}</strong> adoption (target 100%).
        Operations is the only department running SRR (~50%). All others read 0 —
        confirm whether true non-adoption or not-yet-scored.
        <span class="badge badge--warning" style="margin-left:6px">Source: ODG FMDS Board</span>
      </p>
      <div style="overflow-x:auto">
        ${vizBars(rows.map(r => ({
          label: r.label,
          value: typeof r.value === 'number' ? Math.round(r.value * 100) : null,
        })), { width: 480, barHeight: 22, gap: 7 })}
      </div>
      <p class="text-muted" style="font-size:0.68rem;margin-top:4px">Values shown as % (0–100)</p>
    </section>`;
}

// ─── Training plan vs actual by program (bar chart) ──────────────────────────

function renderTrainingBars(dept) {
  // Use the structured trainingPrograms array from odg.json.
  // (Target for all programs is 10% monthly ramp, per the data note in the
  // prose below — these are progress-vs-ramp comparison bars across
  // programs, not a per-program RAG gate, so they render on the viz palette.)
  const programs = dept.trainingPrograms || [];
  if (!programs.length) return '';

  const rows = programs.map(p => ({
    label: p.name,
    value: typeof p.adoption === 'number' ? Math.round(p.adoption * 100) : null,
  }));

  return `
    <section class="odg-section card" style="margin-bottom:24px">
      <div class="odg-section-label">Training Plan vs Actual — by Program</div>
      <p class="text-muted text-small mt-1 mb-3" style="line-height:1.55">
        Monthly ramp target 10% per program. Cumulative adoption (latest wk24) shown.
        FMDS and SRR (program) outperform; 8-Step and JIT/IDMP lag.
        <span class="badge" style="margin-left:6px">Source: ODG FMDS Board</span>
      </p>
      <div style="overflow-x:auto">
        ${vizBars(rows, { width: 480, barHeight: 22, gap: 7, vizVar: '--viz-5' })}
      </div>
      <p class="text-muted" style="font-size:0.68rem;margin-top:4px">Values shown as % (0–100). Target: 10%.</p>
    </section>`;
}

// ─── KZ tracker link ─────────────────────────────────────────────────────────

function renderKzLink(dept) {
  return `
    <section class="odg-section card" style="margin-bottom:24px">
      <div class="odg-section-label">KZ / 8-Step Tracker</div>
      <p class="text-muted text-small mt-1 mb-3" style="line-height:1.55">
        The KZ tracker covers all departments (~34 real records). ODG provides support
        and oversight. Use the Problem-Solving view to browse by department, review
        progress, or open a new 8-step.
      </p>
      <a href="#/dept/${dept.id}/solve" class="btn btn--primary" style="display:inline-block">
        Open KZ Tracker &amp; 8-Step Wizard →
      </a>
    </section>`;
}

// ─── Gaps note ───────────────────────────────────────────────────────────────

function renderGaps(dept) {
  if (!dept.gaps || !dept.gaps.length) return '';
  const items = dept.gaps.map(g => `<li>${g}</li>`).join('');
  return `
    <section class="odg-section card" style="margin-bottom:24px;border-left:3px solid var(--amber)">
      <div class="odg-section-label" style="color:var(--amber)">Known Data Gaps</div>
      <ul class="text-muted text-small mt-2" style="padding-left:18px;line-height:1.7">${items}</ul>
    </section>`;
}

// ─── Inline styles ────────────────────────────────────────────────────────────

const ODG_STYLES = `
  .odg-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 4px;
  }

  .odg-stat-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 140px;
  }

  .odg-stat-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-dim);
  }

  .odg-stat-value {
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .odg-stat-sub {
    font-size: 0.72rem;
    margin-top: 2px;
    max-width: 160px;
    line-height: 1.4;
  }
`;

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderOdgHub(dept, mount) {
  // Inject styles once
  if (!document.getElementById('odg-hub-styles')) {
    const el = document.createElement('style');
    el.id = 'odg-hub-styles';
    el.textContent = ODG_STYLES;
    document.head.appendChild(el);
  }

  const html = `
    <div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px">
        <div>
          <h2 style="margin:0">${dept.name} — Method Hub</h2>
          <p class="text-muted text-small mt-1">
            Organizational Development Group · Training adoption, SRR, KZ tracker, SOP library
          </p>
        </div>
        <a href="#/dept/${dept.id}/kpi" class="btn btn--ghost" style="font-size:0.8rem">
          KPI View →
        </a>
      </div>

      ${renderAdoptionHeadline(dept)}
      ${renderSrrBars(dept)}
      ${renderTrainingBars(dept)}
      ${renderKzLink(dept)}
      ${renderGaps(dept)}
    </div>`;

  mount.innerHTML = html;
}

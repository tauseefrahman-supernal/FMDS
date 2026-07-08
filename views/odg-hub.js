/**
 * views/odg-hub.js — ODG Method Hub (dedicated board)
 *
 * renderOdgHub(dept, mount)
 *
 * ODG is the method hub, not a plain KPI table. This dedicated board shows:
 *  1. Headline adoption gap — FMDS vs 8-Step — as `.stat-tile` cards
 *  2. SRR-by-department as a comparison bar chart
 *  3. Training-plan-vs-actual by the 8 programs as a comparison bar chart
 *  4. Link to KZ tracker (#/dept/odg/solve)
 *
 * Data is read from dept (data/odg.json) — no invented numbers.
 *
 * Re-skinned per §5.9 of docs/redesign/DESIGN-GUIDE.md ("apply the same
 * card/table/badge idiom to odg-hub.js") onto the shared `.page-head`,
 * `.card`/`.card--pad`, `.running-head`, `.section-head`, `.badge`, and
 * `.stat-tile` classes — the old custom `.odg-section`/`.odg-stat-*` CSS
 * (injected via a runtime <style> tag) is gone; every rule now comes from
 * the ported design-system classes in styles.css.
 *
 * SRR-by-department and training-by-program stay as comparison bar charts
 * (not a `.dt` status table): both are readings of many entities against
 * ONE shared reference point, not a per-row on/off-track gate, and — for
 * training specifically — the "target" (0.1 = a 10%/month RAMP RATE) is not
 * even the same kind of number as the "actual" (a CUMULATIVE adoption
 * percentage), so a naive ragStatus(actual, target) ratio would read every
 * program as wildly "green" regardless of how it's really doing. SRR's
 * contributors do carry a real, comparable target (1.0 = 100% per
 * department), but its own `note` field flags real doubt about whether the
 * five departments reading exactly 0% are truly non-adopters or simply
 * not-yet-scored — grading that as a hard "Off Track" would overstate
 * confidence the source data itself doesn't have. Both charts therefore
 * render via the shared `svgBars()` export from lib/charts.js with NO
 * per-row `rag` (a single identity color, not a status hue) rather than the
 * RAG-only `meter()`/`.status-cell` idiom used for the app's real per-row
 * status pages — same conclusion the pre-rebuild file reached, now drawn
 * from the shared chart library instead of a private `vizBars()` clone.
 */

import { svgBars } from '../lib/charts.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pct(ratio) {
  if (ratio == null) return '—';
  return (ratio * 100).toFixed(1) + '%';
}

// ─── Adoption headline — `.stat-tile` cards, no badge (these two numbers are
// descriptive headline stats, not target-graded KPIs in the source data). ──

function renderAdoptionHeadline(dept) {
  const h = dept.headline || {};
  const fmds      = h.fmdsAdoption      ?? null;
  const eightStep = h.eightStepAdoption ?? null;
  const gap       = (fmds != null && eightStep != null) ? fmds - eightStep : null;

  return `
    <div class="section-head" style="margin-top:0"><span class="running-head">Adoption gap — the product thesis</span></div>
    <p class="muted" style="max-width:70ch; margin-bottom:16px; line-height:1.55">
      FMDS awareness is near-universal; 8-Step problem-solving is barely started.
      Closing this gap is what the OS exists to do.
    </p>
    <div class="stat-grid" style="margin-bottom:32px">
      <section class="card stat-tile">
        <div class="stat-tile__top"><span class="stat-tile__label">FMDS Adoption</span></div>
        <div class="stat-tile__value">${pct(fmds)}</div>
        <div class="stat-tile__vs">Trained on the FMDS framework</div>
      </section>
      <section class="card stat-tile">
        <div class="stat-tile__top"><span class="stat-tile__label">8-Step Usage</span></div>
        <div class="stat-tile__value">${pct(eightStep)}</div>
        <div class="stat-tile__vs">Actively using 8-Step problem-solving</div>
      </section>
      ${gap != null ? `
      <section class="card stat-tile">
        <div class="stat-tile__top"><span class="stat-tile__label">Adoption Gap</span></div>
        <div class="stat-tile__value">${pct(gap)}</div>
        <div class="stat-tile__vs">Method awareness vs method use</div>
      </section>` : ''}
    </div>`;
}

// ─── SRR by department (comparison bar chart) ───────────────────────────────

function renderSrrBars(dept) {
  const srrKpi = dept.kpis.find((k) => k.id === 'srr_overall');
  const contributorIds = srrKpi ? srrKpi.contributors : [];
  const rows = contributorIds.map((cid) => {
    const k = dept.kpis.find((x) => x.id === cid);
    if (!k) return null;
    return { label: k.name.replace('SRR — ', ''), value: typeof k.actual === 'number' ? Math.round(k.actual * 100) : null };
  }).filter(Boolean);
  if (!rows.length) return '';

  const targetPct = srrKpi && srrKpi.target != null ? pct(srrKpi.target) : '100%';

  return `
    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">Strategic Review Rhythm (SRR) — by department</span>
      <p class="muted" style="margin:8px 0 16px; font-size:13.5px; line-height:1.55">
        Overall: <b class="tnum">${pct(srrKpi ? srrKpi.actual : null)}</b> adoption (target ${targetPct}).
        Operations is the only department running SRR (~50%); all others read 0% —
        confirm whether that is true non-adoption or not-yet-scored.
        <span class="badge badge--amber" style="margin-left:6px">Source: ODG FMDS Board</span>
      </p>
      <div style="overflow-x:auto">${svgBars(rows, { width: 520, barHeight: 22, gap: 7 })}</div>
      <p class="faint" style="font-size:11.5px; margin-top:6px">Values shown as % (0–100).</p>
    </section>`;
}

// ─── Training plan vs actual by program (comparison bar chart) ─────────────

function renderTrainingBars(dept) {
  const programs = dept.trainingPrograms || [];
  if (!programs.length) return '';

  const rows = programs.map((p) => ({
    label: p.name,
    value: typeof p.adoption === 'number' ? Math.round(p.adoption * 100) : null,
  }));

  return `
    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">Training plan vs actual — by program</span>
      <p class="muted" style="margin:8px 0 16px; font-size:13.5px; line-height:1.55">
        Monthly ramp target 10% per program; cumulative adoption (latest week) shown.
        FMDS and SRR (as a program) outperform; 8-Step and JIT/IDMP lag.
        <span class="badge badge--neutral" style="margin-left:6px">Source: ODG FMDS Board</span>
      </p>
      <div style="overflow-x:auto">${svgBars(rows, { width: 520, barHeight: 22, gap: 7 })}</div>
      <p class="faint" style="font-size:11.5px; margin-top:6px">Values shown as % (0–100). Monthly ramp target: 10%.</p>
    </section>`;
}

// ─── KZ tracker link ─────────────────────────────────────────────────────────

function renderKzLink(dept) {
  return `
    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">KZ / 8-step tracker</span>
      <p class="muted" style="margin:8px 0 16px; font-size:13.5px; line-height:1.55">
        The KZ tracker covers all departments. ODG provides support and oversight.
        Use Problem-Solving to browse by department, review progress, or open a new 8-step.
      </p>
      <a href="#/dept/${esc(dept.id)}/solve" class="btn btn--primary">Open KZ Tracker &amp; 8-Step Wizard →</a>
    </section>`;
}

// ─── Known data gaps ─────────────────────────────────────────────────────────

function renderGaps(dept) {
  if (!dept.gaps || !dept.gaps.length) return '';
  const items = dept.gaps.map((g) => `<li>${esc(g)}</li>`).join('');
  return `
    <section class="card card--pad" style="border-left:3px solid var(--amber)">
      <b style="font-size:13px; color:var(--amber-text)">Known data gaps</b>
      <ul class="muted" style="margin:10px 0 0; padding-left:18px; font-size:13px; line-height:1.7">${items}</ul>
    </section>`;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderOdgHub(dept, mount) {
  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Adoption &amp; SRR</span>
        <h1>Method Hub</h1>
        <p class="page-head__sub">Training adoption, SRR, KZ tracker, SOP library</p>
      </div>
      <div class="page-head__side">
        <a href="#/dept/${esc(dept.id)}/kpi" class="btn btn--secondary">KPI View →</a>
      </div>
    </div>

    ${renderAdoptionHeadline(dept)}
    ${renderSrrBars(dept)}
    ${renderTrainingBars(dept)}
    ${renderKzLink(dept)}
    ${renderGaps(dept)}`;
}

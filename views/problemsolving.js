/**
 * views/problemsolving.js — 8-Step Problem-Solving View
 *
 * renderProblemSolving(dept, mount)
 *
 * Two surfaces (kept distinct — per spec):
 *   1. Tracker table — all KZ records for this dept (byDept filter)
 *   2. 8-Step wizard — paginated A3, one page per step, with:
 *        - golden-thread header (L3→L2→L1 chain via contributorsOf)
 *        - agent first-pass draft (bakedReply 'draft-step')
 *        - tick-to-confirm advances step dot
 *        - Step 4: 5-Whys + 6M fishbone
 *        - Step 6: action register table (Plan/Start/Due/Responsible/Status R-Y-G-C)
 *        - Step 8: links governing SOP from data/sops/
 */

import { byDept, newKZ, progress } from '../lib/eightstep.js';
import { contributorsOf, mains }   from '../lib/registry.js';
import { ragStatus }               from '../lib/rag.js';
import { bakedReply }              from '../lib/agent.js';

// ─── State (module-level, reset each render) ─────────────────────────────────
let _activeKZ     = null;   // the KZ being solved in the wizard
let _currentStep  = 1;      // 1–8 (the wizard page shown)
let _stepData     = {};     // user-entered values per step
let _kzRecords    = [];     // all records for this dept
let _template     = null;   // eightstep-template.json
let _dept         = null;
let _mount        = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ragChip(status) {
  const label = { green: '● On Track', amber: '● At Risk', red: '● Off Track', nodata: '— No Data' }[status];
  return `<span class="rag-chip rag-chip--${status}">${label}</span>`;
}

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && unit.includes('$')) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || (v > 0 && v < 2)) return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000) return v.toLocaleString();
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function pdcaColor(pdca) {
  return { PLAN: '#1864ab', DO: '#2f9e44', CHECK: '#e8590c', ACT: '#7048e8' }[pdca] || '#6c757d';
}

// ─── Step-dot progress strip ─────────────────────────────────────────────────

function stepDotStrip(kz, clickable = false, activeStep = null) {
  const steps = kz.steps || {};
  return Array.from({ length: 8 }, (_, i) => {
    const n    = i + 1;
    const done = !!steps[String(n)];
    const isActive = activeStep === n;
    const cls  = done ? 'step-dot step-dot--done' : (isActive ? 'step-dot step-dot--active' : 'step-dot');
    const onclick = clickable
      ? `onclick="window._psGotoStep(${n})" title="Step ${n}"`
      : `title="Step ${n}: ${done ? 'done' : 'not done'}"`;
    return `<span class="${cls}" ${onclick}>${n}</span>`;
  }).join('');
}

// ─── Golden-thread header ─────────────────────────────────────────────────────

function renderGoldenThread(dept, kpi) {
  if (!kpi || !dept.kpis) return '';

  const contributors = contributorsOf(dept, kpi.id);

  // Build chain: WE main → location contributors → deeper if any
  const chainItems = [`<span class="gt-node gt-node--l1">L1 Leadership OS</span>`];

  // Dept main
  const mainKpis = mains(dept);
  if (mainKpis.length) {
    const m = mainKpis[0];
    const rag = ragStatus(m.actual, m.target, m.direction || 'higher_better');
    chainItems.push(`<span class="gt-node gt-node--l2">${dept.name} — ${m.name} ${ragChip(rag)}</span>`);
  }

  // The specific KPI
  if (kpi && kpi !== mainKpis[0]) {
    const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
    chainItems.push(`<span class="gt-node gt-node--l3">${kpi.name} ${formatVal(kpi.actual, kpi.unit)} vs ${formatVal(kpi.target, kpi.unit)} ${ragChip(rag)}</span>`);
  }

  // Contributors (locations / sub-KPIs)
  if (contributors.length) {
    const redContributors = contributors.filter(c => {
      const rag = ragStatus(c.actual, c.target, c.direction || 'higher_better');
      return rag === 'red' || rag === 'amber';
    });
    const displayList = (redContributors.length ? redContributors : contributors).slice(0, 3);
    displayList.forEach(c => {
      const rag = ragStatus(c.actual, c.target, c.direction || 'higher_better');
      chainItems.push(`<span class="gt-node gt-node--l4">${c.name} ${formatVal(c.actual, c.unit)} ${ragChip(rag)}</span>`);
    });
  }

  return `
    <div class="golden-thread">
      <div class="gt-label">Golden Thread</div>
      <div class="gt-chain">
        ${chainItems.join('<span class="gt-arrow">▸</span>')}
      </div>
    </div>`;
}

// ─── Tracker table ────────────────────────────────────────────────────────────

function renderTrackerTable(records, dept) {
  if (!records.length) {
    return `<p class="text-muted" style="padding:16px 0">No 8-step records for ${dept.name} yet.</p>`;
  }

  const rows = records.map(kz => {
    const p = progress(kz);
    const statusBadge = kz.closed
      ? `<span class="badge badge--success">Closed</span>`
      : kz.active
        ? `<span class="badge badge--info">Active</span>`
        : `<span class="badge">—</span>`;
    const odgBadge = kz.odgSupport
      ? `<span class="badge badge--accent">ODG</span>`
      : `<span class="text-muted" style="font-size:0.75rem">—</span>`;

    return `
      <tr>
        <td>
          <div style="font-weight:500;font-size:0.875rem">${kz.title || kz.kzNumber}</div>
          ${kz.title !== kz.kzNumber ? `<div class="text-muted" style="font-size:0.75rem">${kz.kzNumber}</div>` : ''}
        </td>
        <td class="text-mono text-muted" style="white-space:nowrap">${kz.kzNumber}</td>
        <td style="font-size:0.875rem">${kz.who || '—'}</td>
        <td>${odgBadge}</td>
        <td class="text-muted" style="font-size:0.8rem">${kz.start || '—'}</td>
        <td>
          <div class="step-dots" style="display:flex;gap:3px;align-items:center">
            ${stepDotStrip(kz)}
          </div>
          <div class="text-muted" style="font-size:0.7rem;margin-top:3px">${p.done}/8</div>
        </td>
        <td>${statusBadge}</td>
      </tr>`;
  }).join('');

  return `
    <div style="overflow-x:auto">
      <table class="kpi-table" style="width:100%">
        <thead>
          <tr>
            <th>Item</th>
            <th>KZ #</th>
            <th>Who</th>
            <th>ODG</th>
            <th>Start</th>
            <th style="min-width:160px">Progress (1–8)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ─── Red KPI selector ────────────────────────────────────────────────────────

function renderRedKpiSelector(dept) {
  if (!dept.kpis) return '';

  const redKpis = dept.kpis.filter(k => {
    const rag = ragStatus(k.actual, k.target, k.direction || 'higher_better');
    return rag === 'red' || rag === 'amber';
  });

  if (!redKpis.length) {
    return `<p class="text-muted">No red or amber KPIs currently — no 8-step needed.</p>`;
  }

  const ragLabel = { green: '● Green', amber: '▲ Amber', red: '● Red', nodata: '— No data' };
  const options = redKpis.map(k => {
    const rag = ragStatus(k.actual, k.target, k.direction || 'higher_better');
    return `<option value="${k.id}">${ragLabel[rag] || rag} — ${k.name} (${formatVal(k.actual, k.unit)} vs ${formatVal(k.target, k.unit)})</option>`;
  }).join('');

  return `
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <select id="ps-kpi-select" style="padding:7px 10px;border:1px solid var(--slate-300);border-radius:var(--radius);font-size:0.875rem;background:#fff">
        <option value="">— Select a red KPI —</option>
        ${options}
      </select>
      <button id="ps-open-btn" class="btn btn--primary" onclick="window._psOpenWizard()">
        Open 8-Step
      </button>
    </div>`;
}

// ─── 5-Whys + 6M fishbone (Step 4) ──────────────────────────────────────────

function render5Whys6M(stepDef, kzDraftText) {
  const whyFields = ['why1','why2','why3','why4','why5'].map((key, i) => `
    <div class="form-group">
      <label class="form-label">Why ${i + 1}</label>
      <input type="text" class="form-input" data-field="${key}" placeholder="${stepDef.fields.find(f=>f.key===key)?.hint || ''}"
             value="${(_stepData[4] && _stepData[4][key]) || ''}">
    </div>`).join('');

  const m6Categories = ['Man', 'Method', 'Machine', 'Material', 'Environment', 'Measurement'];
  const fishboneRows = m6Categories.map(cat => `
    <tr>
      <td style="font-weight:500;width:130px;color:var(--slate-600)">${cat}</td>
      <td><input type="text" class="form-input" data-field="fishbone_${cat.toLowerCase()}"
                 placeholder="How does ${cat} contribute?"
                 value="${(_stepData[4] && _stepData[4][`fishbone_${cat.toLowerCase()}`]) || ''}"></td>
    </tr>`).join('');

  return `
    <div class="fishbone-block">
      <div class="two-col" style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div>
          <h4 style="font-size:0.85rem;font-weight:600;margin-bottom:12px;color:var(--slate-700)">5-Whys</h4>
          ${whyFields}
          <div class="form-group">
            <label class="form-label">Root Cause (confirmed)</label>
            <textarea class="form-input" data-field="rootCause" rows="3" placeholder="The single systemic root cause">${(_stepData[4] && _stepData[4].rootCause) || ''}</textarea>
          </div>
        </div>
        <div>
          <h4 style="font-size:0.85rem;font-weight:600;margin-bottom:12px;color:var(--slate-700)">6M Fishbone</h4>
          <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
            ${fishboneRows}
          </table>
        </div>
      </div>
    </div>`;
}

// ─── Action register (Step 6) ────────────────────────────────────────────────

function renderActionRegister() {
  const statusColors = { R: '#e03131', Y: '#e8590c', G: '#2f9e44', C: '#228be6' };
  const statusLabels = { R: 'Behind', Y: 'At Risk', G: 'On Track', C: 'Completed' };

  const savedRows = (_stepData[6] && _stepData[6].actionRows) || Array.from({length:5}, (_,i) => ({
    no: i+1, plan: '', startDate: '', dueDate: '', responsible: '', status: 'R'
  }));

  const rows = savedRows.map((row, i) => `
    <tr>
      <td class="text-center text-mono" style="width:40px">${row.no}</td>
      <td><input type="text" class="form-input" data-ar-field="plan" data-ar-row="${i}" value="${row.plan}" placeholder="What needs to be done"></td>
      <td><input type="date" class="form-input" data-ar-field="startDate" data-ar-row="${i}" value="${row.startDate}" style="min-width:120px"></td>
      <td><input type="date" class="form-input" data-ar-field="dueDate" data-ar-row="${i}" value="${row.dueDate}" style="min-width:120px"></td>
      <td><input type="text" class="form-input" data-ar-field="responsible" data-ar-row="${i}" value="${row.responsible}" placeholder="Name"></td>
      <td>
        <select class="form-input" data-ar-field="status" data-ar-row="${i}" style="min-width:90px">
          ${Object.keys(statusColors).map(s =>
            `<option value="${s}" ${row.status===s?'selected':''} style="color:${statusColors[s]}">${s} — ${statusLabels[s]}</option>`
          ).join('')}
        </select>
      </td>
    </tr>`).join('');

  const legend = Object.entries(statusLabels).map(([k,v]) =>
    `<span style="color:${statusColors[k]};font-weight:600">${k}</span>=<span style="color:var(--slate-600)">${v}</span>`
  ).join(' · ');

  return `
    <div>
      <div style="overflow-x:auto">
        <table class="kpi-table" style="width:100%;font-size:0.85rem">
          <thead>
            <tr>
              <th style="width:40px">No.</th>
              <th>Implementation Plan</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Responsible</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="action-register-body">${rows}</tbody>
        </table>
      </div>
      <div style="font-size:0.75rem;color:var(--slate-500);margin-top:8px">
        Status: ${legend}
      </div>
      <button class="btn btn--outline" style="margin-top:8px;font-size:0.8rem" onclick="window._psAddActionRow()">+ Add Row</button>
    </div>`;
}

// ─── SOP link (Step 8) ───────────────────────────────────────────────────────

function renderSopLink(dept) {
  const SOP_MAP = {
    operations: { id: 'operations-shortcode', title: 'Short-Code Order Entry — Remake Jobs', linkedKpi: 'OTP' },
    service:    { id: 'service-prospecting',  title: 'Prospecting & Quote Follow-Up Standard Work', linkedKpi: 'Incoming Rev WE' },
    sales:      { id: 'service-prospecting',  title: 'Prospecting & Quote Follow-Up Standard Work', linkedKpi: 'Incoming Rev WE Outside' },
  };
  const sop = SOP_MAP[dept.id];
  if (!sop) {
    return `<p class="text-muted">No SOP embedded for ${dept.name} yet. Submit a WMS SW Update Request and link it above.</p>`;
  }
  return `
    <div class="sop-link-block" style="border:1px solid var(--slate-200);border-radius:var(--radius);padding:16px;background:var(--slate-50)">
      <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--slate-500);margin-bottom:6px">Governing Standard Work</div>
      <div style="font-weight:600;font-size:0.95rem;margin-bottom:4px">${sop.title}</div>
      <div class="text-muted" style="font-size:0.8rem">Linked KPI: ${sop.linkedKpi}</div>
      <a href="#/dept/${dept.id}/sop" style="display:inline-block;margin-top:10px;font-size:0.85rem;color:var(--accent)">
        Open in Standard Work view →
      </a>
    </div>`;
}

// ─── Generic field renderer ───────────────────────────────────────────────────

function renderGenericFields(stepDef, stepN) {
  const saved = _stepData[stepN] || {};
  return stepDef.fields.map(f => {
    const val = saved[f.key] || '';
    if (f.key === 'actionRegister') return renderActionRegister();
    if (f.columns) return ''; // action register handled above
    const isLong = f.hint && f.hint.length > 80;
    const input = isLong
      ? `<textarea class="form-input" data-field="${f.key}" rows="4" placeholder="${f.hint}">${val}</textarea>`
      : `<input type="text" class="form-input" data-field="${f.key}" placeholder="${f.hint}" value="${val}">`;
    return `
      <div class="form-group">
        <label class="form-label">${f.label}</label>
        ${input}
      </div>`;
  }).join('');
}

// ─── Wizard step page ─────────────────────────────────────────────────────────

function renderWizardStep(dept, kpi, stepN, template) {
  const stepDef = template.steps[stepN - 1];
  if (!stepDef) return `<p class="text-muted">Step ${stepN} not found in template.</p>`;

  const kzNum    = _activeKZ.kzNumber;
  const pdca     = stepDef.pdca;
  const draftText = bakedReply(dept.id, 'draft-step', { step: stepN, kpi: kpi?.name || 'KPI', deptId: dept.id });
  const stepsDone = { ..._activeKZ.steps };

  // Golden thread
  const thread = renderGoldenThread(dept, kpi);

  // PDCA badge
  const pdcaBadge = `<span class="pdca-badge" style="background:${pdcaColor(pdca)};color:#fff;padding:2px 8px;border-radius:3px;font-size:0.7rem;font-weight:700;letter-spacing:0.05em">${pdca}</span>`;

  // Step-specific content
  let bodyContent = '';
  if (stepN === 4) {
    bodyContent = render5Whys6M(stepDef, draftText);
  } else if (stepN === 6) {
    bodyContent = renderActionRegister();
  } else if (stepN === 8) {
    bodyContent = renderGenericFields(stepDef, stepN) + renderSopLink(dept);
  } else {
    bodyContent = renderGenericFields(stepDef, stepN);
  }

  // Navigation
  const prevBtn = stepN > 1
    ? `<button class="btn btn--outline" onclick="window._psGotoStep(${stepN-1})">← Previous</button>`
    : '';
  const nextBtn = stepN < 8
    ? `<button class="btn btn--primary" onclick="window._psConfirmStep(${stepN})">Confirm & Next →</button>`
    : `<button class="btn btn--primary btn--success" onclick="window._psConfirmStep(${stepN})">Confirm Step 8 — Close KZ</button>`;

  return `
    <div class="wizard-panel" data-step="${stepN}">

      ${thread}

      <div class="wizard-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-top:16px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            ${pdcaBadge}
            <span class="text-muted" style="font-size:0.8rem">Step ${stepN} of 8</span>
          </div>
          <h3 style="margin:0;font-size:1.1rem">Step ${stepN}: ${stepDef.name}</h3>
          <p class="text-muted" style="margin:4px 0 0;font-size:0.85rem">${stepDef.description}</p>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div class="text-mono text-muted" style="font-size:0.75rem">${kzNum}</div>
          <div class="step-dots" style="display:flex;gap:4px;margin-top:6px">
            ${stepDotStrip(_activeKZ, true, stepN)}
          </div>
        </div>
      </div>

      <div style="margin:20px 0;padding:14px 16px;background:var(--accent-light);border-left:3px solid var(--accent);border-radius:0 var(--radius) var(--radius) 0">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--accent);margin-bottom:6px">Agent Draft — Review before confirming</div>
        <pre style="margin:0;font-size:0.8rem;white-space:pre-wrap;font-family:inherit;color:var(--slate-700);line-height:1.5">${draftText}</pre>
      </div>

      <div class="wizard-fields" style="margin-top:16px">
        ${bodyContent}
      </div>

      <div class="wizard-nav" style="display:flex;justify-content:space-between;margin-top:24px;padding-top:16px;border-top:1px solid var(--slate-200)">
        ${prevBtn}
        <div style="display:flex;gap:8px">
          ${nextBtn}
        </div>
      </div>
    </div>`;
}

// ─── Main render ──────────────────────────────────────────────────────────────

async function doRender() {
  if (!_dept || !_mount) return;

  // Fetch records if needed
  if (!_kzRecords.length) {
    try {
      const res = await fetch('data/kz-records.json');
      const all = await res.json();
      _kzRecords = byDept(all, _dept.id);
    } catch (e) {
      console.warn('Could not load kz-records.json', e);
    }
  }

  // Fetch template if needed
  if (!_template) {
    try {
      const res = await fetch('data/eightstep-template.json');
      _template = await res.json();
    } catch (e) {
      console.warn('Could not load eightstep-template.json', e);
    }
  }

  let content;

  if (!_activeKZ) {
    // ── Tracker view ─────────────────────────────────────────────────────────
    const openItems    = _kzRecords.filter(k => !k.closed).length;
    const closedItems  = _kzRecords.filter(k => k.closed).length;

    content = `
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="margin:0 0 4px">Problem-Solving Tracker</h2>
            <p class="text-muted" style="margin:0;font-size:0.85rem">
              ${_kzRecords.length} total · ${openItems} open · ${closedItems} closed — ${_dept.name}
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:0.8rem;color:var(--slate-500)">Open a new 8-step on a red KPI:</span>
            ${renderRedKpiSelector(_dept)}
          </div>
        </div>

        ${renderTrackerTable(_kzRecords, _dept)}

        <div style="margin-top:24px;padding:14px 16px;background:var(--slate-50);border:1px solid var(--slate-200);border-radius:var(--radius)">
          <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--slate-500);margin-bottom:4px">About this tracker</div>
          <p class="text-muted" style="margin:0;font-size:0.8rem">
            Extracted from the 8-Step Problem Solving Tracker workbook (${new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'})}).
            Operations has the most active items (30 rows). Finance and Sales have 3 and 1 respectively.
            Marketing, IT, and HR tabs were empty in the source workbook.
          </p>
        </div>
      </div>`;
  } else {
    // ── Wizard view ───────────────────────────────────────────────────────────
    const kpiId  = _activeKZ._kpiId;
    const kpi    = kpiId && _dept.kpis ? _dept.kpis.find(k => k.id === kpiId) : null;
    const tmpl   = _template || { steps: [] };

    content = `
      <div>
        <div style="margin-bottom:16px">
          <button class="btn btn--outline" onclick="window._psCloseWizard()" style="font-size:0.8rem">
            ← Back to tracker
          </button>
        </div>
        ${renderWizardStep(_dept, kpi, _currentStep, tmpl)}
      </div>`;
  }

  _mount.innerHTML = `
    <div class="ps-view">
      ${content}
    </div>`;

  attachHandlers();
}

// ─── Event handlers (attached after each render) ──────────────────────────────

function attachHandlers() {
  // Expose globals for onclick= handlers (no bundler, so window._ pattern)
  window._psOpenWizard = () => {
    const sel = document.getElementById('ps-kpi-select');
    const kpiId = sel && sel.value;
    if (!kpiId) { alert('Please select a KPI first.'); return; }
    const kpi = _dept.kpis ? _dept.kpis.find(k => k.id === kpiId) : null;
    _activeKZ = newKZ({
      item: kpi?.name || 'Problem',
      who: _dept.lead || '',
      deptId: _dept.id,
    });
    _activeKZ._kpiId = kpiId;
    _currentStep = 1;
    _stepData = {};
    doRender();
  };

  window._psCloseWizard = () => {
    _activeKZ    = null;
    _currentStep = 1;
    _stepData    = {};
    doRender();
  };

  window._psGotoStep = (n) => {
    _saveCurrentStepInputs();
    _currentStep = n;
    doRender();
  };

  window._psConfirmStep = (n) => {
    _saveCurrentStepInputs();
    // Flip step dot
    if (_activeKZ) {
      _activeKZ.steps[String(n)] = true;
    }
    if (n === 8) {
      // Close the KZ
      if (_activeKZ) { _activeKZ.closed = true; _activeKZ.active = false; }
      _kzRecords = [_activeKZ, ..._kzRecords];
      _activeKZ  = null;
      _currentStep = 1;
      _stepData  = {};
    } else {
      _currentStep = n + 1;
    }
    doRender();
  };

  window._psAddActionRow = () => {
    const tbody = document.getElementById('action-register-body');
    if (!tbody) return;
    const n = tbody.querySelectorAll('tr').length + 1;
    if (n > 10) return; // max 10 rows per template
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="text-center text-mono" style="width:40px">${n}</td>
      <td><input type="text" class="form-input" data-ar-field="plan" data-ar-row="${n-1}" placeholder="What needs to be done"></td>
      <td><input type="date" class="form-input" data-ar-field="startDate" data-ar-row="${n-1}" style="min-width:120px"></td>
      <td><input type="date" class="form-input" data-ar-field="dueDate" data-ar-row="${n-1}" style="min-width:120px"></td>
      <td><input type="text" class="form-input" data-ar-field="responsible" data-ar-row="${n-1}" placeholder="Name"></td>
      <td>
        <select class="form-input" data-ar-field="status" data-ar-row="${n-1}" style="min-width:90px">
          <option value="R">R — Behind</option>
          <option value="Y">Y — At Risk</option>
          <option value="G" selected>G — On Track</option>
          <option value="C">C — Completed</option>
        </select>
      </td>`;
    tbody.appendChild(row);
  };
}

function _saveCurrentStepInputs() {
  if (!_activeKZ) return;
  const panel = document.querySelector('.wizard-panel');
  if (!panel) return;
  const stepN = parseInt(panel.dataset.step, 10);
  const saved = {};

  // Regular fields
  panel.querySelectorAll('[data-field]').forEach(el => {
    saved[el.dataset.field] = el.value;
  });

  // Action register rows
  const arRows = [];
  const tbody = document.getElementById('action-register-body');
  if (tbody) {
    tbody.querySelectorAll('tr').forEach((tr, i) => {
      const rowData = { no: i+1 };
      tr.querySelectorAll('[data-ar-field]').forEach(el => {
        rowData[el.dataset.arField] = el.value;
      });
      arRows.push(rowData);
    });
    if (arRows.length) saved.actionRows = arRows;
  }

  _stepData[stepN] = saved;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PS_STYLES = `
  .ps-view { max-width: 960px; }

  /* Golden thread */
  .golden-thread {
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    padding: 10px 14px;
    margin-bottom: 0;
  }
  .gt-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--slate-500);
    margin-bottom: 6px;
  }
  .gt-chain {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 0.82rem;
  }
  .gt-node {
    padding: 3px 8px;
    border-radius: var(--radius);
    background: #fff;
    border: 1px solid var(--slate-200);
    white-space: nowrap;
  }
  .gt-node--l1 { color: var(--slate-500); font-size: 0.75rem; }
  .gt-node--l2 { font-weight: 500; }
  .gt-node--l3 { font-weight: 600; }
  .gt-node--l4 { border-color: var(--red-light, #ffd8d8); }
  .gt-arrow { color: var(--slate-400); font-size: 0.75rem; }

  /* Step dots */
  .step-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid var(--slate-300);
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--slate-400);
    cursor: default;
    transition: all 0.15s;
  }
  .step-dot--done {
    background: var(--green);
    border-color: var(--green);
    color: #fff;
  }
  .step-dot--active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  [onclick].step-dot { cursor: pointer; }
  [onclick].step-dot:hover { opacity: 0.8; transform: scale(1.1); }

  /* Wizard panel */
  .wizard-panel {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
  }

  /* Form elements */
  .form-group { margin-bottom: 14px; }
  .form-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--slate-700);
    margin-bottom: 5px;
  }
  .form-input {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid var(--slate-300);
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--slate-900);
    background: #fff;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .form-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-light);
  }
  textarea.form-input { resize: vertical; }

  /* Fishbone */
  .fishbone-block table td { padding: 5px 0 5px 4px; }

  /* SOP link */
  .sop-link-block { margin-top: 20px; }

  /* Tracker */
  .kpi-table th, .kpi-table td { font-size: 0.85rem; }

  /* Badges */
  .badge--success { background: #d3f9d8; color: #2f9e44; }
  .badge--info    { background: #dbe4ff; color: #364fc7; }
  .badge--accent  { background: var(--accent-light); color: var(--accent); }

  /* Buttons */
  .btn--success { background: var(--green) !important; }
  .btn--outline {
    background: transparent;
    border: 1px solid var(--slate-300);
    color: var(--slate-700);
    padding: 7px 14px;
    border-radius: var(--radius);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.1s;
  }
  .btn--outline:hover { background: var(--slate-100); }
  .btn--primary {
    background: var(--accent);
    border: none;
    color: #fff;
    padding: 7px 14px;
    border-radius: var(--radius);
    font-size: 0.875rem;
    cursor: pointer;
    transition: opacity 0.1s;
  }
  .btn--primary:hover { opacity: 0.88; }
`;

(function injectStyles() {
  if (document.getElementById('ps-styles')) return;
  const el = document.createElement('style');
  el.id = 'ps-styles';
  el.textContent = PS_STYLES;
  document.head.appendChild(el);
})();

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderProblemSolving(dept, mount)
 *
 * @param {object} dept   — department data object (from data/<id>.json)
 * @param {Element} mount — DOM element to render into
 */
export async function renderProblemSolving(dept, mount) {
  // Reset state for new dept
  _dept      = dept;
  _mount     = mount;
  _activeKZ  = null;
  _currentStep = 1;
  _stepData  = {};
  _kzRecords = [];
  _template  = null;

  mount.innerHTML = `<p class="text-muted" style="padding:24px 0">Loading problem-solving data…</p>`;
  await doRender();
}

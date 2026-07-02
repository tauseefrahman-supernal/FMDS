/**
 * views/standardwork.js — Standard Work view
 *
 * renderStandardWork(dept, mount)
 *
 * SOP library — list embedded BWIs from data/sops/ (per dept);
 * opening one shows the Main Step → Key Points → Reason table + revision log.
 * Shows "Updated by KZ-###" backlink where an 8-step Step 8 linked a SOP.
 *
 * NOTE: Leader Standard Work / cadence is intentionally OUT of scope here.
 * FMDS OS is the role-based operator interface for data + problem-solving,
 * not a leader-routine tracker (that belongs to Leadership OS).
 */

// ─── SOP registry per department ─────────────────────────────────────────────
// Maps deptId → list of SOP file paths available in data/sops/
const DEPT_SOPS = {
  operations: ['data/sops/operations-shortcode.json'],
  service:    ['data/sops/service-prospecting.json'],
  sales:      ['data/sops/service-prospecting.json'],
  hr:         [],
  odg:        [],
  marketing:  [],
  logistics:  [],
  it:         [],
  finance:    [],
};

// KZ backlinks: sopId → array of KZ references where Step 8 updated this SOP
const SOP_KZ_BACKLINKS = {
  'operations-shortcode': [
    { kzNumber: 'KZ-346', title: 'Pricing Credit Memos (Galls Color)', step: 8 },
  ],
  'service-prospecting': [
    { kzNumber: 'KZ-303', title: 'HP Quote-to-Order (Alison Diaco)', step: 8 },
  ],
};

// ─── State (module-level, reset each render) ──────────────────────────────────
let _dept       = null;
let _mount      = null;
let _sopCache   = {};   // path → parsed JSON
let _lswData    = null;
let _activeSop  = null; // currently open SOP object or null (list mode)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function freqColor(freq) {
  if (!freq) return 'var(--slate-400)';
  const f = freq.toLowerCase();
  if (f.includes('daily') || f.includes('4x') || f.includes('2x')) return 'var(--accent)';
  if (f.includes('weekly') || f.includes('bi-week')) return '#2f9e44';
  if (f.includes('monthly') || f.includes('3x/mo')) return '#e8590c';
  return 'var(--slate-500)';
}

function freqGroup(freq) {
  if (!freq) return 'Other';
  const f = freq.toLowerCase();
  if (f.includes('daily') || f.includes('4x') || f.includes('2x')) return 'Daily';
  if (f.includes('weekly') || f.includes('bi-week')) return 'Weekly';
  if (f === 'monthly' || f.includes('3x/mo')) return 'Monthly';
  return 'Other';
}

// ─── SOP list view ────────────────────────────────────────────────────────────

function renderSopList(sopObjects) {
  if (!sopObjects.length) {
    return `
      <div class="sw-empty">
        <p class="text-muted">No embedded SOPs for ${escHtml(_dept.name)} yet.</p>
        <p class="text-muted" style="font-size:0.8rem;margin-top:6px">
          SOPs are embedded from discovery files. See <code>data/sops/</code> for the full library.
        </p>
      </div>`;
  }

  const cards = sopObjects.map(sop => {
    const backlinks = SOP_KZ_BACKLINKS[sop.id] || [];
    const blHtml = backlinks.length
      ? backlinks.map(bl => `
          <span class="kz-backlink" title="Step ${bl.step} of ${escHtml(bl.kzNumber)} updated this SOP">
            Updated by <strong>${escHtml(bl.kzNumber)}</strong> — ${escHtml(bl.title)}
          </span>`).join('')
      : '';

    return `
      <div class="sop-card" onclick="window._swOpenSop(${escHtml(JSON.stringify(sop.id))})">
        <div class="sop-card__top">
          <div>
            <span class="badge badge--doc">${escHtml(sop.docType || 'BWI')}</span>
            <h3 class="sop-card__title">${escHtml(sop.title)}</h3>
          </div>
          <span class="sop-card__arrow">→</span>
        </div>
        <p class="sop-card__purpose text-muted">${escHtml(sop.purpose)}</p>
        <div class="sop-card__meta">
          <span class="text-muted" style="font-size:0.75rem">${sop.steps.length} steps</span>
          ${sop.revisions && sop.revisions.length
            ? `<span class="text-muted" style="font-size:0.75rem">Rev ${escHtml(sop.revisions[sop.revisions.length-1].revision)} · ${escHtml(sop.revisions[sop.revisions.length-1].date)}</span>`
            : ''}
        </div>
        ${blHtml ? `<div class="sop-card__backlinks">${blHtml}</div>` : ''}
      </div>`;
  }).join('');

  return `<div class="sop-list">${cards}</div>`;
}

// ─── SOP detail view ──────────────────────────────────────────────────────────

function renderSopDetail(sop) {
  const backlinks = SOP_KZ_BACKLINKS[sop.id] || [];

  const stepsHtml = sop.steps.map(step => `
    <tr>
      <td class="sw-step-n">${step.n}</td>
      <td class="sw-step-main">${escHtml(step.mainStep)}</td>
      <td class="sw-step-kp">${escHtml(step.keyPoints)}</td>
      <td class="sw-step-reason">${escHtml(step.reason)}</td>
    </tr>`).join('');

  const revisionsHtml = sop.revisions && sop.revisions.length
    ? sop.revisions.map(r => `
        <tr>
          <td class="text-mono" style="font-size:0.8rem;white-space:nowrap">${escHtml(r.date)}</td>
          <td style="font-size:0.8rem">${escHtml(r.revision)}</td>
          <td style="font-size:0.8rem">${escHtml(r.description)}</td>
          <td style="font-size:0.8rem;color:var(--slate-500)">${escHtml(r.requester || '')}</td>
        </tr>`).join('')
    : `<tr><td colspan="4" class="text-muted" style="font-size:0.8rem">No revisions logged.</td></tr>`;

  const backlinksHtml = backlinks.length
    ? `
      <div class="sop-detail__backlinks">
        <div class="sw-section-label">8-Step Backlinks</div>
        ${backlinks.map(bl => `
          <div class="kz-backlink-detail">
            <strong>${escHtml(bl.kzNumber)}</strong>
            <span>${escHtml(bl.title)}</span>
            <span class="text-muted" style="font-size:0.75rem">Step ${bl.step} — Standardize</span>
          </div>`).join('')}
      </div>`
    : '';

  const linkedForms = sop.linkedForms && sop.linkedForms.length
    ? `<div style="margin-top:8px;font-size:0.8rem;color:var(--slate-600)">
        <span style="font-weight:600">Linked forms: </span>
        ${sop.linkedForms.map(f => `<span class="badge badge--outline">${escHtml(f)}</span>`).join(' ')}
       </div>`
    : '';

  return `
    <div class="sop-detail">
      <button class="btn btn--outline" style="margin-bottom:20px;font-size:0.8rem"
              onclick="window._swCloseSop()">← Back to library</button>

      <div class="sop-detail__header">
        <span class="badge badge--doc">${escHtml(sop.docType || 'BWI')}</span>
        <h2 style="margin-top:8px">${escHtml(sop.title)}</h2>
        <div class="sop-detail__meta text-muted">
          ${sop.deptId ? `Dept: <strong>${escHtml(sop.deptId)}</strong>` : ''}
          ${sop.scope ? `· Scope: ${escHtml(sop.scope)}` : ''}
        </div>
        ${linkedForms}
      </div>

      <div class="sop-detail__purpose">
        <div class="sw-section-label">Purpose</div>
        <p style="font-size:0.875rem;color:var(--slate-700)">${escHtml(sop.purpose)}</p>
        ${sop.note ? `<p class="text-muted" style="font-size:0.8rem;margin-top:6px">${escHtml(sop.note)}</p>` : ''}
      </div>

      <div class="sop-detail__steps">
        <div class="sw-section-label">Standard Work Steps</div>
        <div style="overflow-x:auto">
          <table class="sw-table">
            <thead>
              <tr>
                <th style="width:36px">#</th>
                <th style="min-width:160px">Main Step</th>
                <th style="min-width:220px">Key Points</th>
                <th>Reason / Why It Matters</th>
              </tr>
            </thead>
            <tbody>${stepsHtml}</tbody>
          </table>
        </div>
      </div>

      ${backlinksHtml}

      <div class="sop-detail__revisions">
        <div class="sw-section-label">Revision Log</div>
        <div style="overflow-x:auto">
          <table class="sw-table" style="font-size:0.8rem">
            <thead>
              <tr>
                <th style="width:100px">Date</th>
                <th style="width:60px">Rev</th>
                <th>Description</th>
                <th style="width:140px">Requester</th>
              </tr>
            </thead>
            <tbody>${revisionsHtml}</tbody>
          </table>
        </div>
        ${sop.elaborated ? `<p class="text-muted" style="font-size:0.75rem;margin-top:6px">Elaborated by: ${escHtml(sop.elaborated)}</p>` : ''}
      </div>
    </div>`;
}

// ─── LSW cadence view ─────────────────────────────────────────────────────────

function renderLswCadence(lsw) {
  const groups = ['Daily', 'Weekly', 'Monthly', 'Other'];

  // Group rows
  const byGroup = {};
  groups.forEach(g => { byGroup[g] = []; });
  (lsw.cadenceRows || []).forEach(row => {
    const g = freqGroup(row.frequency);
    (byGroup[g] = byGroup[g] || []).push(row);
  });

  const groupHtml = groups.map(g => {
    const rows = byGroup[g];
    if (!rows || !rows.length) return '';
    const color = freqColor(rows[0].frequency);

    const rowsHtml = rows.map(row => `
      <tr>
        <td>
          <span class="lsw-activity">${escHtml(row.activity)}</span>
          ${row.specificDay ? `<span class="text-muted" style="display:block;font-size:0.72rem;margin-top:2px">${escHtml(row.specificDay)}</span>` : ''}
        </td>
        <td>
          <span class="lsw-freq-chip" style="background:${color}1a;color:${color};border-color:${color}33">
            ${escHtml(row.frequency)}
          </span>
        </td>
        <td style="font-size:0.8rem">${escHtml(row.workType || '')}</td>
        <td>
          <span class="lsw-focus-chip">${escHtml(row.focus || '')}</span>
        </td>
        <td style="font-size:0.78rem;color:var(--slate-600)">${escHtml(row.description || '')}</td>
      </tr>`).join('');

    return `
      <div class="lsw-group">
        <div class="lsw-group-label" style="color:${color}">${g}</div>
        <div style="overflow-x:auto">
          <table class="sw-table">
            <thead>
              <tr>
                <th style="min-width:200px">Activity</th>
                <th style="width:100px">Frequency</th>
                <th style="width:110px">Work Type</th>
                <th style="width:110px">Focus</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>`;
  }).join('');

  const timeModel = lsw.timeAllocationModel;
  const timeHtml = timeModel && timeModel.buckets
    ? `
      <div class="lsw-time-model">
        <div class="sw-section-label">Time Allocation Model</div>
        <p class="text-muted" style="font-size:0.8rem;margin-bottom:10px">${escHtml(timeModel.note)}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${timeModel.buckets.map(b => `
            <div class="lsw-time-bucket">
              <div class="lsw-time-pct">${Math.round(b.pct * 100)}%</div>
              <div class="lsw-time-label">${escHtml(b.label)}</div>
              ${b.illustrative ? `<span class="badge badge--illustrative">illustrative</span>` : ''}
            </div>`).join('')}
        </div>
      </div>`
    : '';

  return `
    <div class="lsw-section">
      <div class="lsw-meta text-muted" style="font-size:0.8rem;margin-bottom:16px">
        Source: ${escHtml(lsw.source || '_lsw.json')} · Roles: ${escHtml((lsw.roles || []).join(', '))}
      </div>
      ${groupHtml}
      ${timeHtml}
    </div>`;
}

// ─── Main render ──────────────────────────────────────────────────────────────

async function doRender() {
  if (!_dept || !_mount) return;

  // Determine which SOPs to load for this dept
  const sopPaths = DEPT_SOPS[_dept.id] || [];
  const sopObjects = [];

  for (const path of sopPaths) {
    if (!_sopCache[path]) {
      try {
        const res = await fetch(path);
        _sopCache[path] = await res.json();
      } catch (e) {
        console.warn('Could not load SOP:', path, e);
      }
    }
    if (_sopCache[path]) sopObjects.push(_sopCache[path]);
  }

  // Build view
  let mainContent;

  if (_activeSop) {
    const sop = sopObjects.find(s => s.id === _activeSop);
    mainContent = sop
      ? renderSopDetail(sop)
      : `<p class="text-muted">SOP "${escHtml(_activeSop)}" not found.</p>`;
  } else {
    mainContent = `
      <div class="sw-library">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
          <div>
            <h2 style="margin:0 0 4px">SOP Library</h2>
            <p class="text-muted" style="margin:0;font-size:0.85rem">
              Embedded BWIs for ${escHtml(_dept.name)} — ${sopObjects.length} document${sopObjects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        ${renderSopList(sopObjects)}
      </div>`;
  }

  _mount.innerHTML = `
    <div class="sw-view">
      ${mainContent}
    </div>`;

  attachSwHandlers(sopObjects);
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function attachSwHandlers(sopObjects) {
  window._swOpenSop = (sopId) => {
    _activeSop = sopId;
    doRender();
  };

  window._swCloseSop = () => {
    _activeSop = null;
    doRender();
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SW_STYLES = `
  .sw-view { max-width: 920px; }

  .sw-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--slate-500);
    margin-bottom: 10px;
    margin-top: 20px;
  }

  /* SOP list */
  .sop-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sop-card {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    cursor: pointer;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: var(--shadow-sm);
  }

  .sop-card:hover {
    box-shadow: var(--shadow);
    border-color: var(--slate-300);
  }

  .sop-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .sop-card__title {
    margin-top: 6px;
    font-size: 0.95rem;
  }

  .sop-card__arrow {
    font-size: 1.1rem;
    color: var(--slate-400);
    flex-shrink: 0;
    margin-top: 4px;
  }

  .sop-card__purpose {
    font-size: 0.82rem;
    margin-bottom: 10px;
    line-height: 1.45;
  }

  .sop-card__meta {
    display: flex;
    gap: 12px;
  }

  .sop-card__backlinks {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .kz-backlink {
    display: inline-block;
    font-size: 0.75rem;
    padding: 3px 8px;
    background: #e7f5ff;
    border: 1px solid #a5d8ff;
    border-radius: var(--radius);
    color: #1971c2;
  }

  .sw-empty {
    padding: 24px 0;
  }

  /* Badges */
  .badge--doc {
    background: #f3f0ff;
    color: #6741d9;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 3px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .badge--outline {
    background: transparent;
    border: 1px solid var(--slate-300);
    color: var(--slate-600);
    font-size: 0.72rem;
    padding: 1px 6px;
    border-radius: var(--radius);
    font-weight: 500;
  }

  .badge--illustrative {
    background: #fff9db;
    color: #c79a00;
    font-size: 0.68rem;
    padding: 1px 6px;
    border-radius: var(--radius);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* SOP detail */
  .sop-detail__header {
    margin-bottom: 20px;
  }

  .sop-detail__meta {
    font-size: 0.82rem;
    margin-top: 6px;
  }

  .sop-detail__purpose {
    margin-bottom: 20px;
  }

  .sop-detail__steps { margin-bottom: 24px; }
  .sop-detail__revisions { margin-bottom: 24px; }

  .sop-detail__backlinks {
    margin-bottom: 24px;
  }

  .kz-backlink-detail {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: #e7f5ff;
    border: 1px solid #a5d8ff;
    border-radius: var(--radius);
    font-size: 0.82rem;
    color: #1971c2;
    margin-bottom: 6px;
  }

  /* Standard work table */
  .sw-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .sw-table th {
    text-align: left;
    padding: 8px 10px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--slate-500);
    border-bottom: 2px solid var(--slate-200);
    background: var(--slate-50);
  }

  .sw-table td {
    padding: 10px;
    border-bottom: 1px solid var(--slate-100);
    vertical-align: top;
    line-height: 1.45;
  }

  .sw-table tr:last-child td { border-bottom: none; }
  .sw-table tr:hover td { background: var(--slate-50); }

  .sw-step-n {
    font-weight: 700;
    color: var(--accent);
    font-size: 0.95rem;
    text-align: center;
    width: 36px;
  }

  .sw-step-main { font-weight: 600; color: var(--slate-800); }

  .sw-step-kp { color: var(--slate-700); font-size: 0.82rem; }

  .sw-step-reason { color: var(--slate-600); font-size: 0.8rem; font-style: italic; }

  /* LSW cadence */
  .lsw-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .lsw-group-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 2px solid currentColor;
    opacity: 0.85;
  }

  .lsw-group {
    margin-bottom: 8px;
  }

  .lsw-activity {
    font-weight: 500;
    font-size: 0.85rem;
    color: var(--slate-800);
  }

  .lsw-freq-chip {
    display: inline-block;
    padding: 2px 7px;
    border: 1px solid;
    border-radius: var(--radius);
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .lsw-focus-chip {
    display: inline-block;
    padding: 2px 6px;
    background: var(--slate-100);
    border-radius: var(--radius);
    font-size: 0.72rem;
    color: var(--slate-600);
    white-space: nowrap;
  }

  .lsw-meta { margin-bottom: 4px; }

  /* Time allocation model */
  .lsw-time-model {
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    margin-top: 8px;
  }

  .lsw-time-bucket {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    padding: 12px 16px;
    min-width: 160px;
  }

  .lsw-time-pct {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -0.02em;
  }

  .lsw-time-label {
    font-size: 0.8rem;
    color: var(--slate-600);
  }
`;

(function injectStyles() {
  if (document.getElementById('sw-styles')) return;
  const el = document.createElement('style');
  el.id = 'sw-styles';
  el.textContent = SW_STYLES;
  document.head.appendChild(el);
})();

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderStandardWork(dept, mount)
 *
 * @param {object} dept   — department data object
 * @param {Element} mount — DOM element to render into
 */
export async function renderStandardWork(dept, mount) {
  _dept      = dept;
  _mount     = mount;
  _activeSop = null;

  mount.innerHTML = `<p class="text-muted" style="padding:24px 0">Loading standard work…</p>`;
  await doRender();
}

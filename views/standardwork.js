/**
 * views/standardwork.js — Standard Work view (linked SOP library)
 *
 * renderStandardWork(dept, mount)
 *
 * Two-panel layout:
 *  1. LINKED LIBRARY  — per-department document list loaded from data/sop-library.json.
 *     Header shows doc-count chips by type + connected-drive badges.
 *     List is searchable / filterable by doc type; grouped by doc type.
 *     Each row: type badge · title · area/product · owner · lang tag · SharePoint deep-link.
 *
 *  2. EMBEDDED SOPs (in-app)  — 2–3 SOPs with full content in data/sops/*.json.
 *     Shown at the top as "available in-app" cards. Opening one shows the
 *     Main Step → Key Points → Reason table + revision log + KZ backlinks.
 *
 * Leader Standard Work cadence (data/sops/_lsw.json) is rendered in the ODG
 * department view as an embedded SOP card — it was the existing behaviour and is
 * preserved.  Non-ODG departments do not show the cadence panel.
 */

// ─── SOP (full-content) registry per department ───────────────────────────────
const DEPT_SOPS = {
  operations: ['data/sops/operations-shortcode.json'],
  service:    ['data/sops/service-prospecting.json'],
  sales:      [],
  hr:         [],
  odg:        ['data/sops/_lsw.json'],
  marketing:  [],
  logistics:  [],
  it:         [],
  finance:    [],
};

// KZ backlinks: sopId → array of KZ references (Step 8 updated this SOP)
const SOP_KZ_BACKLINKS = {
  'operations-shortcode': [
    { kzNumber: 'KZ-346', title: 'Pricing Credit Memos (Galls Color)', step: 8 },
  ],
  'service-prospecting': [
    { kzNumber: 'KZ-303', title: 'HP Quote-to-Order (Alison Diaco)', step: 8 },
  ],
};

// Drive display metadata — a decorative identity classification (which
// SharePoint drive a doc lives in), not a status, so it rides the viz palette
// per design-system spec §3/§4 ("viz = identity + decoration, never status").
const DRIVE_META = {
  WMS_SOP:         { label: 'WMS SOP',        stop: 'single', desc: 'World Emblem Management System — 868 docs, operational SWIs' },
  QA_SOP:          { label: 'QA SOP',         stop: '5',      desc: 'Quality Assurance — 2,525 ISO-coded procedures (PR/FR/DA/IN)' },
  ODG_LSW:         { label: 'ODG LSW (live)', stop: '2',      desc: 'ODG Leader Standard Work — live drive' },
  ODG_LSW_Archive: { label: 'ODG LSW Archive',stop: '4',      desc: 'ODG Leader Standard Work — 98 historical files by role/location' },
};

// Doc-type display order and colours — 10 categories, likewise identity/
// decoration (never status), so each cycles through a distinct viz stop.
const DOC_TYPE_ORDER = ['Policy', 'BWI', 'SWI', 'Procedure', 'Form', 'Work-Instruction', 'LSW', 'Template', 'Checklist', 'Kaizen-A3'];

const DOC_TYPE_VIZ_STOP = {
  'Policy':           '1',
  'BWI':              '4',
  'SWI':              'single',
  'Procedure':        '5',
  'Form':             '6',
  'Work-Instruction': '2',
  'LSW':              '3',
  'Template':         '7',
  'Checklist':        '5',
  'Kaizen-A3':        '1',
};

// {bg, color, border} CSS-value triplets, one per viz stop — built once so
// call sites can keep using the same shape they always have.
function vizTriplet(stop) {
  return { bg: `var(--viz-${stop}-bg)`, color: `hsl(var(--viz-${stop}))`, border: `hsl(var(--viz-${stop}) / 0.35)` };
}
const DOC_TYPE_COLORS = {};
for (const [type, stop] of Object.entries(DOC_TYPE_VIZ_STOP)) DOC_TYPE_COLORS[type] = vizTriplet(stop);
const DOC_TYPE_FALLBACK = { bg: 'var(--muted)', color: 'hsl(var(--surface-8))', border: 'var(--border)' };

// ─── State ────────────────────────────────────────────────────────────────────
let _dept      = null;
let _mount     = null;
let _sopCache  = {};     // path → parsed JSON (full-content SOPs)
let _libData   = null;   // sop-library.json content (cached)
let _activeSop = null;   // currently open SOP id (detail view) or null
let _filter    = '';     // search string
let _typeFilter = '';    // active doc-type filter ('' = all)

// ─── Utilities ────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function typeBadge(docType) {
  const c = DOC_TYPE_COLORS[docType] || DOC_TYPE_FALLBACK;
  return `<span class="chip" style="background:${c.bg};color:${c.color};border:1px solid ${c.border}">${escHtml(docType)}</span>`;
}

function driveBadge(drive) {
  const m = DRIVE_META[drive];
  if (!m) return `<span class="chip">${escHtml(drive)}</span>`;
  const c = vizTriplet(m.stop);
  return `<span class="chip" title="${escHtml(m.desc)}" style="background:${c.bg};color:${c.color};border:1px solid ${c.border}">${escHtml(m.label)}</span>`;
}

// Language is metadata, not status — a light viz-identity tint keeps EN/ES/
// bilingual visually distinct without borrowing a RAG hue.
function langTag(lang) {
  if (!lang) return '';
  const stops = { EN: 'single', ES: '1', bilingual: '5' };
  const c = vizTriplet(stops[lang] || '7');
  return `<span class="chip" style="background:${c.bg};color:${c.color};border:1px solid ${c.border}">${escHtml(lang)}</span>`;
}

// Cadence frequency → {bg,text,border} token triplet. (Previously built the
// chip's background/border by string-concatenating an alpha suffix onto a
// var(--x) reference, e.g. `${color}1a` — invalid CSS that silently dropped
// the declaration. Real -bg/-text/-border tiers fix the rendering, not just
// the token choice.)
function freqTokens(freq) {
  if (!freq) return { bg: 'var(--muted)', text: 'var(--text-faint)', border: 'var(--border)' };
  const f = freq.toLowerCase();
  if (f.includes('daily') || f.includes('4x') || f.includes('2x')) return { bg: 'hsl(var(--action-1))', text: 'var(--accent-text)', border: 'hsl(var(--action-3))' };
  if (f.includes('weekly') || f.includes('bi-week')) return { bg: 'var(--green-bg)', text: 'var(--green-text)', border: 'var(--green-border)' };
  if (f.includes('monthly') || f.includes('3x/mo')) return { bg: 'var(--amber-bg)', text: 'var(--amber-text)', border: 'var(--amber-border)' };
  return { bg: 'var(--muted)', text: 'var(--text-dim)', border: 'var(--border)' };
}

function freqGroup(freq) {
  if (!freq) return 'Other';
  const f = freq.toLowerCase();
  if (f.includes('daily') || f.includes('4x') || f.includes('2x')) return 'Daily';
  if (f.includes('weekly') || f.includes('bi-week')) return 'Weekly';
  if (f === 'monthly' || f.includes('3x/mo')) return 'Monthly';
  return 'Other';
}

// ─── A. LINKED LIBRARY (from sop-library.json) ───────────────────────────────

function buildCountChips(counts) {
  // Produce an ordered chip set from the count keys that look like *_total or *_BWI etc.
  const chips = [];
  const snap = [
    ['WMS_SOP_BWI', 'BWI'],
    ['WMS_SOP_SWI', 'SWI'],
    ['WMS_SOP_Procedure', 'Procedure'],
    ['WMS_SOP_total', 'WMS docs'],
    ['QA_SOP_PO_total', 'QA-PO docs'],
    ['QA_SOP_RH_total', 'QA-RH docs'],
    ['QA_SOP_SI_total', 'QA-SI docs'],
    ['QA_SOP_AC_total', 'QA-AC docs'],
    ['QA_SOP_MT_total', 'QA-MT docs'],
    ['QA_SOP_AD_total', 'QA-AD docs'],
    ['QA_SOP_LG_total', 'QA-LG docs'],
    ['QA_SOP_VE_total', 'QA-VE docs'],
    ['QA_SOP_MK_total', 'QA-MK docs'],
    ['QA_SOP_FI_total', 'QA-FI docs'],
    ['ODG_LSW_live_files', 'LSW (live)'],
    ['ODG_LSW_Archive_total', 'LSW Archive'],
    ['FMDS_new_templates', null],
  ];
  for (const [key, label] of snap) {
    if (counts[key] !== undefined && counts[key] !== null && counts[key] !== 0) {
      if (label === null) continue; // array-type, skip chip
      chips.push(`<span class="sw-count-chip">${counts[key]} <span class="sw-count-label">${escHtml(label)}</span></span>`);
    }
  }
  return chips.join('');
}

function renderLibrarySection(deptLib) {
  const docs = deptLib.documents || [];
  const drives = deptLib.drives || [];

  // Filter by search + type
  const search = _filter.toLowerCase();
  const filtered = docs.filter(d => {
    if (_typeFilter && d.docType !== _typeFilter) return false;
    if (!search) return true;
    return (
      (d.title || '').toLowerCase().includes(search) ||
      (d.area || '').toLowerCase().includes(search) ||
      (d.product || '').toLowerCase().includes(search) ||
      (d.owner || '').toLowerCase().includes(search) ||
      (d.docType || '').toLowerCase().includes(search)
    );
  });

  // Group by docType
  const byType = {};
  DOC_TYPE_ORDER.forEach(t => { byType[t] = []; });
  filtered.forEach(d => {
    (byType[d.docType] = byType[d.docType] || []).push(d);
  });

  const totalDocs = docs.length;
  const typeCounts = {};
  docs.forEach(d => { typeCounts[d.docType] = (typeCounts[d.docType] || 0) + 1; });

  // Type filter tabs
  const typeTabsHtml = DOC_TYPE_ORDER
    .filter(t => typeCounts[t])
    .map(t => {
      const active = _typeFilter === t;
      const c = DOC_TYPE_COLORS[t] || {};
      return `<button class="sw-type-tab${active ? ' sw-type-tab--active' : ''}"
        style="${active ? `background:${c.bg};color:${c.color};border-color:${c.border}` : ''}"
        onclick="window._swSetTypeFilter(${escHtml(JSON.stringify(t))})">${escHtml(t)} <span class="sw-type-tab-count">${typeCounts[t]}</span></button>`;
    }).join('');

  const clearTabHtml = _typeFilter
    ? `<button class="sw-type-tab sw-type-tab--clear" onclick="window._swSetTypeFilter('')">✕ clear</button>`
    : '';

  // Rows grouped by doc type
  const groupsHtml = DOC_TYPE_ORDER.map(t => {
    const rows = byType[t];
    if (!rows || !rows.length) return '';
    const c = DOC_TYPE_COLORS[t] || {};

    const rowsHtml = rows.map(doc => {
      const isInApp = !!doc.embeddedInApp;
      const linkHtml = doc.href
        ? `<a class="sw-sharepoint-link" href="${escHtml(doc.href)}" target="_blank" rel="noopener">Open in SharePoint ↗</a>`
        : isInApp
          ? `<span class="sw-inapp-badge" title="Full SOP available in-app">In-app ↓</span>`
          : `<span class="sw-link-pending" title="SharePoint URL not yet mapped">link pending</span>`;

      const repBadge = doc.representative
        ? `<span class="sw-rep-badge" title="Representative entry — only aggregate count was enumerated in the discovery">representative</span>`
        : '';

      return `
        <tr class="sw-lib-row${doc.representative ? ' sw-lib-row--rep' : ''}">
          <td class="sw-lib-type">${typeBadge(doc.docType)}</td>
          <td class="sw-lib-title">
            <span class="sw-lib-title-text">${escHtml(doc.title)}</span>
            ${repBadge}
            ${doc.note ? `<span class="sw-lib-note" title="${escHtml(doc.note)}">ℹ</span>` : ''}
          </td>
          <td class="sw-lib-area">
            ${doc.area ? `<span class="sw-lib-area-text">${escHtml(doc.area)}</span>` : ''}
            ${doc.product ? `<span class="sw-lib-product">${escHtml(doc.product)}</span>` : ''}
          </td>
          <td class="sw-lib-owner">${doc.owner ? escHtml(doc.owner) : '<span class="text-muted">—</span>'}</td>
          <td class="sw-lib-lang">${langTag(doc.lang)}</td>
          <td class="sw-lib-link">${linkHtml}</td>
        </tr>`;
    }).join('');

    return `
      <div class="sw-lib-group">
        <div class="sw-lib-group-header" style="border-left:3px solid ${c.border || DOC_TYPE_FALLBACK.border}">
          <span class="sw-lib-group-label" style="color:${c.color || DOC_TYPE_FALLBACK.color}">${t}</span>
          <span class="sw-lib-group-count">${rows.length}</span>
        </div>
        <div style="overflow-x:auto">
          <table class="sw-lib-table">
            <thead>
              <tr>
                <th style="width:90px">Type</th>
                <th>Document</th>
                <th style="min-width:160px">Area / Product</th>
                <th style="width:130px">Owner</th>
                <th style="width:72px">Lang</th>
                <th style="width:140px">Link</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>`;
  }).join('');

  const noResultsHtml = filtered.length === 0
    ? `<div class="sw-lib-empty">No documents match the current filter.</div>`
    : '';

  return `
    <div class="sw-lib-section">
      <div class="sw-lib-header">
        <div class="sw-lib-header-left">
          <div class="sw-count-chips">${buildCountChips(deptLib.counts)}</div>
          <div class="sw-drive-badges">${drives.map(driveBadge).join('')}</div>
        </div>
        <div class="sw-lib-search-wrap">
          <input class="sw-lib-search" type="text" placeholder="Search documents…"
                 value="${escHtml(_filter)}"
                 oninput="window._swSetFilter(this.value)" />
        </div>
      </div>

      <div class="sw-type-tabs">${typeTabsHtml}${clearTabHtml}</div>

      <div class="sw-lib-count text-muted" style="font-size:0.78rem;margin-bottom:12px">
        Showing ${filtered.length} of ${totalDocs} documents
        ${_filter ? ` matching <strong>${escHtml(_filter)}</strong>` : ''}
        ${_typeFilter ? ` filtered to <strong>${escHtml(_typeFilter)}</strong>` : ''}
      </div>

      ${groupsHtml}
      ${noResultsHtml}

      <div class="sw-lib-note-footer">
        <span>
          <span class="sw-rep-badge">representative</span>
          = inferred from aggregate counts only — exact title not enumerated in the discovery
        </span>
        <span style="margin-left:16px">
          <span class="sw-link-pending">link pending</span>
          = doc confirmed in SharePoint; deep-link not yet mapped
        </span>
      </div>
    </div>`;
}

// ─── B. EMBEDDED SOPs (in-app full content) ───────────────────────────────────

function renderSopList(sopObjects) {
  if (!sopObjects.length) return '';

  const cards = sopObjects.map(sop => {
    const backlinks = SOP_KZ_BACKLINKS[sop.id] || [];
    const blHtml = backlinks.length
      ? backlinks.map(bl => `
          <span class="kz-backlink" title="Step ${bl.step} of ${escHtml(bl.kzNumber)} updated this SOP">
            Updated by <strong>${escHtml(bl.kzNumber)}</strong> — ${escHtml(bl.title)}
          </span>`).join('')
      : '';

    const isLsw = sop.id === '_lsw' || (sop.cadenceRows);

    return `
      <div class="sop-card" onclick="window._swOpenSop(${escHtml(JSON.stringify(sop.id))})">
        <div class="sop-card__top">
          <div>
            ${typeBadge(isLsw ? 'LSW' : (sop.docType || 'BWI'))}
            <span class="sw-inapp-badge" style="margin-left:6px">Full content in-app</span>
            <h3 class="sop-card__title">${escHtml(sop.title)}</h3>
          </div>
          <span class="sop-card__arrow">→</span>
        </div>
        <p class="sop-card__purpose text-muted">${escHtml(isLsw ? (sop.note || 'Leader Standard Work cadence') : sop.purpose)}</p>
        <div class="sop-card__meta">
          ${!isLsw && sop.steps ? `<span class="text-muted" style="font-size:0.75rem">${sop.steps.length} steps</span>` : ''}
          ${isLsw && sop.cadenceRows ? `<span class="text-muted" style="font-size:0.75rem">${sop.cadenceRows.length} cadence activities</span>` : ''}
          ${sop.revisions && sop.revisions.length
            ? `<span class="text-muted" style="font-size:0.75rem">Rev ${escHtml(sop.revisions[sop.revisions.length-1].revision)} · ${escHtml(sop.revisions[sop.revisions.length-1].date)}</span>`
            : ''}
        </div>
        ${blHtml ? `<div class="sop-card__backlinks">${blHtml}</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div class="sw-section-label" style="margin-top:28px">SOPs Available In-App</div>
    <p class="text-muted" style="font-size:0.8rem;margin-bottom:12px">
      These documents have full step-by-step content embedded. Click to open.
    </p>
    <div class="sop-list">${cards}</div>`;
}

function renderSopDetail(sop) {
  const isLsw = !!(sop.cadenceRows);
  if (isLsw) return renderLswDetail(sop);

  const backlinks = SOP_KZ_BACKLINKS[sop.id] || [];

  const stepsHtml = (sop.steps || []).map(step => `
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
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">Standard Work · ${escHtml(sop.docType || 'BWI')}${sop.deptId ? ` · ${escHtml(sop.deptId)}` : ''}</span>
          <h1 style="max-width:36ch">${escHtml(sop.title)}</h1>
          ${sop.scope ? `<p class="page-head__sub">Scope: ${escHtml(sop.scope)}</p>` : ''}
          ${linkedForms}
        </div>
        <div class="page-head__side">
          <button class="btn btn--secondary" onclick="window._swCloseSop()">← Back to Library</button>
        </div>
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

// ─── C. LSW detail view (for ODG embedded _lsw.json) ──────────────────────────

function renderLswDetail(lsw) {
  const groups = ['Daily', 'Weekly', 'Monthly', 'Other'];
  const byGroup = {};
  groups.forEach(g => { byGroup[g] = []; });
  (lsw.cadenceRows || []).forEach(row => {
    const g = freqGroup(row.frequency);
    (byGroup[g] = byGroup[g] || []).push(row);
  });

  const groupHtml = groups.map(g => {
    const rows = byGroup[g];
    if (!rows || !rows.length) return '';
    const t = freqTokens(rows[0].frequency);

    const rowsHtml = rows.map(row => `
      <tr>
        <td>
          <span class="lsw-activity">${escHtml(row.activity)}</span>
          ${row.specificDay ? `<span class="text-muted" style="display:block;font-size:0.72rem;margin-top:2px">${escHtml(row.specificDay)}</span>` : ''}
        </td>
        <td>
          <span class="lsw-freq-chip" style="background:${t.bg};color:${t.text};border-color:${t.border}">
            ${escHtml(row.frequency)}
          </span>
        </td>
        <td style="font-size:0.8rem">${escHtml(row.workType || '')}</td>
        <td><span class="lsw-focus-chip">${escHtml(row.focus || '')}</span></td>
        <td style="font-size:0.78rem;color:var(--text-dim)">${escHtml(row.description || '')}</td>
      </tr>`).join('');

    return `
      <div class="lsw-group">
        <div class="lsw-group-label" style="color:${t.text}">${g}</div>
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
    <div class="sop-detail">
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">Standard Work · LSW</span>
          <h1 style="max-width:36ch">${escHtml(lsw.title)}</h1>
          <p class="page-head__sub">Source: ${escHtml(lsw.source || '_lsw.json')} · Roles: ${escHtml((lsw.roles || []).join(', '))}</p>
        </div>
        <div class="page-head__side">
          <button class="btn btn--secondary" onclick="window._swCloseSop()">← Back to Library</button>
        </div>
      </div>

      <div class="lsw-section" style="margin-top:20px">
        ${groupHtml}
        ${timeHtml}
      </div>
    </div>`;
}

// ─── D. Main render ───────────────────────────────────────────────────────────

async function loadLibData() {
  if (_libData) return _libData;
  try {
    const res = await fetch('data/sop-library.json');
    _libData = await res.json();
  } catch (e) {
    console.warn('Could not load sop-library.json:', e);
    _libData = null;
  }
  return _libData;
}

async function doRender() {
  if (!_dept || !_mount) return;

  // Load full-content SOPs
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

  // Load library data
  const libData = await loadLibData();
  const deptLib = libData && libData.departments && libData.departments[_dept.id];

  // ── Detail view ──
  if (_activeSop) {
    const sop = sopObjects.find(s => s.id === _activeSop);
    _mount.innerHTML = `
      <div class="sw-view">
        ${sop
          ? renderSopDetail(sop)
          : `<p class="text-muted">SOP "${escHtml(_activeSop)}" not found.</p>`}
      </div>`;
    attachSwHandlers(sopObjects);
    return;
  }

  // ── Library + embedded SOPs view ──
  const headerHtml = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${escHtml(_dept.name)} · Document Library</span>
        <h1>Standard Work</h1>
        <p class="page-head__sub">Per-department document library — SharePoint-linked. Embedded SOPs open in-app.</p>
      </div>
    </div>`;

  const libraryHtml = deptLib
    ? renderLibrarySection(deptLib)
    : `<div class="sw-lib-empty">No library data for ${escHtml(_dept.name)} yet.</div>`;

  const embeddedHtml = renderSopList(sopObjects);

  _mount.innerHTML = `
    <div class="sw-view">
      ${headerHtml}
      <div class="sw-section-label">Document Library</div>
      ${libraryHtml}
      ${embeddedHtml}
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
  window._swSetFilter = (val) => {
    _filter = val;
    doRender();
  };
  window._swSetTypeFilter = (val) => {
    _typeFilter = val === _typeFilter ? '' : val;  // toggle
    doRender();
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SW_STYLES = `
  .sw-view { max-width: 960px; }

  .sw-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-faint);
    margin-bottom: 10px;
    margin-top: 20px;
  }

  /* ── Library section ── */
  .sw-lib-section { margin-bottom: 32px; }

  .sw-lib-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  .sw-lib-header-left { display: flex; flex-direction: column; gap: 8px; }

  .sw-count-chips { display: flex; flex-wrap: wrap; gap: 6px; }

  .sw-count-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--muted);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px 10px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text);
    font-family: var(--font-mono);
  }

  .sw-count-label {
    font-weight: 400;
    color: var(--text-faint);
    font-family: var(--font-sans);
  }

  .sw-drive-badges { display: flex; flex-wrap: wrap; gap: 6px; }

  /* ── Type filter tabs ── */
  .sw-type-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .sw-type-tab {
    display: inline-block;
    padding: 3px 10px;
    border: 1px solid var(--slate-200);
    border-radius: 999px;
    background: var(--slate-50);
    color: var(--slate-600);
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.12s;
  }

  .sw-type-tab:hover { border-color: var(--slate-400); }
  .sw-type-tab--active { font-weight: 700; }
  .sw-type-tab--clear { color: var(--slate-500); font-style: italic; }

  .sw-type-tab-count {
    display: inline-block;
    background: var(--slate-200);
    border-radius: 999px;
    padding: 0 5px;
    font-size: 0.68rem;
    margin-left: 3px;
  }

  /* ── Search ── */
  .sw-lib-search-wrap { flex-shrink: 0; }

  .sw-lib-search {
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 0.83rem;
    background: var(--panel);
    color: var(--text);
    width: 220px;
    outline: none;
    transition: border-color 0.12s;
  }

  .sw-lib-search:focus { border-color: var(--accent); }

  /* ── Grouped rows ── */
  .sw-lib-group { margin-bottom: 20px; }

  .sw-lib-group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--slate-50);
    border-radius: var(--radius);
    margin-bottom: 8px;
  }

  .sw-lib-group-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .sw-lib-group-count {
    display: inline-block;
    background: var(--slate-200);
    border-radius: 999px;
    padding: 0 7px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--slate-600);
  }

  /* ── Library table ── */
  .sw-lib-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.83rem;
  }

  .sw-lib-table th {
    text-align: left;
    padding: 6px 10px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--slate-500);
    border-bottom: 2px solid var(--slate-200);
    background: var(--slate-50);
  }

  .sw-lib-table td {
    padding: 9px 10px;
    border-bottom: 1px solid var(--slate-100);
    vertical-align: top;
    line-height: 1.4;
  }

  .sw-lib-table tr:last-child td { border-bottom: none; }
  .sw-lib-table tr:hover td { background: var(--slate-50); }
  .sw-lib-row--rep td { opacity: 0.75; }

  /* ── Column cells ── */
  .sw-lib-title-text { font-weight: 500; color: var(--slate-800); }

  .sw-lib-area-text { font-size: 0.8rem; color: var(--slate-700); display: block; }

  .sw-lib-product {
    display: inline-block;
    margin-top: 2px;
    font-size: 0.7rem;
    padding: 1px 5px;
    background: var(--slate-100);
    border-radius: var(--radius);
    color: var(--slate-600);
  }

  .sw-lib-owner { font-size: 0.78rem; color: var(--slate-600); }

  .sw-lib-note {
    display: inline-block;
    cursor: help;
    color: var(--slate-400);
    font-size: 0.78rem;
    margin-left: 4px;
  }

  /* ── Link / badge states ── */
  .sw-sharepoint-link {
    display: inline-block;
    padding: 3px 8px;
    background: hsl(var(--action-1));
    color: var(--accent-text);
    border: 1px solid hsl(var(--action-3));
    border-radius: var(--radius);
    font-size: 0.72rem;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.12s;
  }

  .sw-sharepoint-link:hover { background: hsl(var(--action-2)); }

  .sw-link-pending {
    display: inline-block;
    padding: 3px 8px;
    background: var(--muted);
    color: var(--text-faint);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    font-size: 0.72rem;
    font-style: italic;
    white-space: nowrap;
  }

  .sw-inapp-badge {
    display: inline-block;
    padding: 2px 7px;
    background: var(--green-bg);
    color: var(--green-text);
    border: 1px solid var(--green-border);
    border-radius: var(--radius);
    font-size: 0.68rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: default;
  }

  .sw-rep-badge {
    display: inline-block;
    padding: 1px 5px;
    background: var(--amber-bg);
    color: var(--amber-text);
    border: 1px solid var(--amber-border);
    border-radius: var(--radius);
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: default;
  }

  .sw-lib-empty {
    padding: 20px 0;
    color: var(--slate-500);
    font-size: 0.85rem;
  }

  .sw-lib-note-footer {
    margin-top: 14px;
    font-size: 0.73rem;
    color: var(--slate-500);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  /* ── Embedded SOP cards ── */
  .sop-list { display: flex; flex-direction: column; gap: 12px; }

  .sop-card {
    background: var(--panel);
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    cursor: pointer;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: var(--shadow-sm);
  }

  .sop-card:hover { box-shadow: var(--shadow); border-color: var(--slate-300); }

  .sop-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .sop-card__title { margin-top: 6px; font-size: 0.95rem; }

  .sop-card__arrow { font-size: 1.1rem; color: var(--slate-400); flex-shrink: 0; margin-top: 4px; }

  .sop-card__purpose { font-size: 0.82rem; margin-bottom: 10px; line-height: 1.45; }

  .sop-card__meta { display: flex; gap: 12px; }

  .sop-card__backlinks { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }

  .kz-backlink {
    display: inline-block;
    font-size: 0.75rem;
    padding: 3px 8px;
    background: var(--info-bg);
    border: 1px solid var(--info-border);
    border-radius: var(--radius);
    color: var(--info-text);
  }

  /* ── SOP detail ── */
  .sop-detail__purpose { margin-bottom: 20px; }
  .sop-detail__steps { margin-bottom: 24px; }
  .sop-detail__revisions { margin-bottom: 24px; }
  .sop-detail__backlinks { margin-bottom: 24px; }

  .kz-backlink-detail {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--info-bg);
    border: 1px solid var(--info-border);
    border-radius: var(--radius);
    font-size: 0.82rem;
    color: var(--info-text);
    margin-bottom: 6px;
  }

  /* ── Standard work table ── */
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

  .sw-step-n { font-weight: 700; color: var(--accent-text); font-size: 0.95rem; text-align: center; width: 36px; font-family: var(--font-mono); }
  .sw-step-main { font-weight: 600; color: var(--slate-800); }
  .sw-step-kp { color: var(--slate-700); font-size: 0.82rem; }
  .sw-step-reason { color: var(--slate-600); font-size: 0.8rem; font-style: italic; }

  /* ── LSW cadence ── */
  .lsw-section { display: flex; flex-direction: column; gap: 24px; }
  .lsw-group { margin-bottom: 8px; }
  .lsw-group-label {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; margin-bottom: 8px;
    padding-bottom: 6px; border-bottom: 2px solid currentColor; opacity: 0.85;
  }
  .lsw-activity { font-weight: 500; font-size: 0.85rem; color: var(--slate-800); }
  .lsw-freq-chip {
    display: inline-block; padding: 2px 7px;
    border: 1px solid; border-radius: var(--radius);
    font-size: 0.72rem; font-weight: 600; white-space: nowrap;
  }
  .lsw-focus-chip {
    display: inline-block; padding: 2px 6px;
    background: var(--slate-100); border-radius: var(--radius);
    font-size: 0.72rem; color: var(--slate-600); white-space: nowrap;
  }
  .lsw-time-model {
    background: var(--slate-50); border: 1px solid var(--slate-200);
    border-radius: var(--radius-lg); padding: 16px 20px; margin-top: 8px;
  }
  .lsw-time-bucket {
    display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
    background: var(--panel); border: 1px solid var(--slate-200);
    border-radius: var(--radius); padding: 12px 16px; min-width: 160px;
  }
  .lsw-time-pct { font-family: var(--font-serif); font-size: 1.6rem; font-weight: 600; color: var(--text); letter-spacing: -0.02em; }
  .lsw-time-label { font-size: 0.8rem; color: var(--slate-600); }
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
  _filter    = '';
  _typeFilter = '';

  mount.innerHTML = `<p class="text-muted" style="padding:24px 0">Loading standard work…</p>`;
  await doRender();
}

/**
 * views/standardwork.js — Standard Work view (linked SOP library + SOP detail)
 *
 * renderStandardWork(dept, mount)
 *
 * Markup rebuilt to the §5.6 Standard Work idiom (docs/redesign/DESIGN-GUIDE.md
 * + docs/redesign/reference/view-rest.js) — the shared `.dt` table / `.card`
 * `--pad`/`--interactive` / `.chip` / `.badge` / `.count-pill` / `.doc-type` /
 * `.page-head` components every other rebuilt view (views/kpi.js is the model
 * cited for this task) already uses. Every class here comes from the ported
 * base/view-component CSS in styles.css — no local `<style>` injection, unlike
 * the pre-rebuild file, which shipped ~390 lines of now-redundant scoped CSS.
 * Data lookups (data/sop-library.json, data/sops/*.json, the LSW cadence
 * grouping, the KZ→SOP backlink map) and behavior (search-filter, open/close
 * an embedded SOP) are unchanged from before this rebuild — only the markup,
 * plus real fixes, moved:
 *
 *   - LIBRARY: one flat `.dt` table (Type|Document|Area/Product|Owner|Lang|
 *     Link) per the reference — the pre-rebuild file's per-doc-type grouped
 *     mini-tables + type-filter tabs are gone; that grouping/tab layer isn't
 *     in the reference or DESIGN-GUIDE spec, and dropping it is a markup
 *     simplification, not a data loss (every doc still renders, just in one
 *     table instead of ten). The search-filter behavior is kept, re-wired to
 *     the flat table.
 *   - Per-type/per-drive/per-lang VIZ-PALETTE COLOR CODING is gone. The
 *     reference's `.doc-type` is a single flat mono-chip style, not a
 *     per-type-colored one — matching it removes DOC_TYPE_COLORS/vizTriplet/
 *     typeBadge/driveBadge/langTag entirely in favor of the plain `.doc-type`/
 *     `.chip`/`.badge--neutral` classes already ported. Zero data lost — type,
 *     drive, and lang strings still render, just uncolored.
 *   - BUG-shaped anti-pattern fix: `freqTokens()` tinted LSW cadence
 *     frequency chips green/amber/accent by daily-vs-weekly-vs-monthly — i.e.
 *     RAG-adjacent hues used decoratively on a non-status field, exactly the
 *     "RAG hues are status-only, never decorative" anti-pattern the redesign
 *     spec calls out. Cadence frequency is now a plain mono `.chip`, no color.
 *   - The `href`-based "Open in SharePoint ↗" link branch is gone: every one
 *     of the 72 real documents across all 9 departments has `href: null` (the
 *     discovery only ever recorded a webUrl for zero docs) — that branch was
 *     dead code before this rebuild too. Matching the reference's real
 *     two-state link cell (`Open In-App` / `link pending`) loses nothing.
 *   - SOP DETAIL fixes all five §5.6 problems (see sopDetailHTML below):
 *     (1) h1 24px/30ch, (2) Back-to-Library moved into `.page-head__side` as
 *     `--secondary`, (3) Purpose+Scope share one `.card--pad` with
 *     running-heads and linked forms move into the backlinks card as a dim
 *     line, (4) steps table is the standard `.dt` with zero italics
 *     (`Key points` 400/`--text-secondary`, `Reason` 400/`--text-dim`, `#`
 *     via `.tnum`), (5) 8-step backlinks + Revision log render as two
 *     side-by-side `.card`s below the table.
 *   - `?sop=<id>` deep-link now consumed: app.js's router comment has long
 *     documented `sop` as "reserved for opening a specific Standard Work SOP
 *     detail (Task 12 — standardwork.js)" — no prior view ever parsed it.
 *     This rebuild reads it the same way problemsolving.js reads `?kpi=`/
 *     `?kz=` (split the hash on `?`, URLSearchParams) and pre-opens the
 *     matching embedded SOP if the id is real for this department; otherwise
 *     it falls through to the library, same as no param at all.
 *   - KNOWN DATA BUG FIXED: data/sops/_lsw.json had no `id` field, so its
 *     embedded-SOP card's `data-open-sop` id resolved to an empty string —
 *     clicking it silently no-opened (the click handler now guards on a
 *     falsy id too, belt-and-suspenders). Fixed by adding `"id": "_lsw"` to
 *     the JSON — matching the `sop.cadenceRows` shape check already used to
 *     detect "this embedded SOP is the LSW cadence, not a stepped BWI" and
 *     the DEPT_SOPS→_lsw.json wiring that already expected an id.
 *   - The real KZ→SOP write-back backlinks (SOP_KZ_BACKLINKS — KZ-346 on the
 *     operations Short-Code BWI, KZ-303 on the service Prospecting BWI) are
 *     unchanged and still render on both the library's featured card(s) (as
 *     an `Updated by <KZ> …` info badge) and the SOP detail's "8-step
 *     backlinks" card.
 *   - Frozen-dept handling needs no in-view logic: app.js's navFor() never
 *     shows the Standard Work nav item for a frozen dept at all (unchanged),
 *     so this view only needs its existing graceful "no library data yet"
 *     fallback for the (currently theoretical) case of a dept with no
 *     sop-library.json entry.
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

// Drive display metadata (label + tooltip) for the library's collection
// badges — identity-only, rendered as plain `.badge--neutral`, never a
// status hue.
const DRIVE_META = {
  WMS_SOP:         { label: 'WMS SOP',         desc: 'World Emblem Management System — 868 docs, operational SWIs' },
  QA_SOP:          { label: 'QA SOP',          desc: 'Quality Assurance — 2,525 ISO-coded procedures (PR/FR/DA/IN)' },
  ODG_LSW:         { label: 'ODG LSW (live)',  desc: 'ODG Leader Standard Work — live drive' },
  ODG_LSW_Archive: { label: 'ODG LSW Archive', desc: 'ODG Leader Standard Work — 98 historical files by role/location' },
};

// ─── Module-scope fetch caches (persist across renderStandardWork calls) ─────
let _sopCache = {}; // path → parsed JSON (full-content SOPs)
let _libData  = null; // sop-library.json content

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Cadence frequency → one of 4 display bands. Pure data grouping (no color) —
// used to break the LSW detail's cadence rows into Daily/Weekly/Monthly/Other
// sections, same grouping the pre-rebuild file used.
function freqGroup(freq) {
  if (!freq) return 'Other';
  const f = freq.toLowerCase();
  if (f.includes('daily') || f.includes('4x') || f.includes('2x')) return 'Daily';
  if (f.includes('weekly') || f.includes('bi-week')) return 'Weekly';
  if (f === 'monthly' || f.includes('3x/mo')) return 'Monthly';
  return 'Other';
}

function matchesSearch(doc, search) {
  return (
    (doc.title || '').toLowerCase().includes(search) ||
    (doc.area || '').toLowerCase().includes(search) ||
    (doc.product || '').toLowerCase().includes(search) ||
    (doc.owner || '').toLowerCase().includes(search) ||
    (doc.docType || '').toLowerCase().includes(search)
  );
}

function lastRevision(sop) {
  return (sop.revisions && sop.revisions.length) ? sop.revisions[sop.revisions.length - 1] : null;
}

// A library row's `sopDataPath` is the join key back to the loaded
// full-content SOP object (DEPT_SOPS) — resolves to its real `.id` (the id
// `data-open-sop` needs) so the row's "Open In-App" button opens the exact
// SOP the row describes.
function embeddedSopId(doc) {
  if (!doc.embeddedInApp || !doc.sopDataPath) return null;
  const cached = _sopCache[doc.sopDataPath];
  return (cached && cached.id) || null;
}

// ─── A. LINKED LIBRARY (from sop-library.json) ───────────────────────────────

function buildCountPills(counts) {
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
  ];
  return snap
    .filter(([key]) => typeof counts[key] === 'number' && counts[key] > 0)
    .map(([key, label]) => `<span class="count-pill"><b>${counts[key]}</b>${esc(label)}</span>`)
    .join('');
}

function driveBadgeHTML(drive) {
  const m = DRIVE_META[drive];
  return m
    ? `<span class="badge badge--neutral" title="${esc(m.desc)}">${esc(m.label)}</span>`
    : `<span class="badge badge--neutral">${esc(drive)}</span>`;
}

function docRowHTML(doc) {
  const repBadge = doc.representative
    ? `<span class="badge badge--amber" style="font-size:10px">representative</span>`
    : '';
  const noteIcon = doc.note
    ? `<span title="${esc(doc.note)}" style="cursor:help;color:var(--text-faint);margin-left:4px">&#9432;</span>`
    : '';
  const sopId = embeddedSopId(doc);
  const linkCell = (doc.embeddedInApp && sopId)
    ? `<button class="btn btn--outline btn--sm" data-open-sop="${esc(sopId)}">Open In-App</button>`
    : `<span class="badge badge--outline">link pending</span>`;

  return `
    <tr>
      <td><span class="doc-type">${esc(doc.docType)}</span></td>
      <td>${esc(doc.title)}${repBadge}${noteIcon}</td>
      <td style="color:var(--text-dim)">
        ${doc.area ? esc(doc.area) : ''}
        ${doc.product ? `<div class="faint" style="font-size:11.5px">${esc(doc.product)}</div>` : ''}
      </td>
      <td style="color:var(--text-dim)">${doc.owner ? esc(doc.owner) : '—'}</td>
      <td>${doc.lang ? `<span class="chip">${esc(doc.lang)}</span>` : ''}</td>
      <td>${linkCell}</td>
    </tr>`;
}

// ─── B. EMBEDDED SOPs (in-app full content) — library "featured" cards ──────

function featuredSopMeta(sop, isLsw) {
  if (isLsw) {
    const n = (sop.cadenceRows || []).length;
    return n ? `${n} cadence activities` : '';
  }
  const rev = lastRevision(sop);
  return [
    sop.steps && sop.steps.length ? `${sop.steps.length} steps` : '',
    rev ? `Rev ${rev.revision} · ${rev.date}` : '',
  ].filter(Boolean).join(' · ');
}

function featuredSopsHTML(sopObjects) {
  if (!sopObjects.length) return '';

  const cards = sopObjects.map((sop) => {
    const isLsw = !!sop.cadenceRows;
    const docType = isLsw ? 'LSW' : (sop.docType || 'BWI');
    const purpose = isLsw ? (sop.note || 'Leader Standard Work cadence') : sop.purpose;
    const meta = featuredSopMeta(sop, isLsw);
    const backlinks = SOP_KZ_BACKLINKS[sop.id] || [];

    return `
    <section class="card card--pad sop-feature card--interactive" data-open-sop="${esc(sop.id)}" role="button" tabindex="0">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
        <span class="doc-type">${esc(docType)}</span>
        <span class="badge badge--green">Full content in-app</span>
        <span style="margin-left:auto; color:var(--text-faint)">&rarr;</span>
      </div>
      <h3>${esc(sop.title)}</h3>
      <p style="margin:8px 0; font-size:13.5px; color:var(--text-secondary); max-width:100ch">${esc(purpose)}</p>
      <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap">
        ${meta ? `<span class="source-note">${esc(meta)}</span>` : ''}
        ${backlinks.map((bl) => `<span class="badge badge--info"><span class="dot"></span>Updated by ${esc(bl.kzNumber)} — ${esc(bl.title)}</span>`).join('')}
      </div>
    </section>`;
  }).join('');

  return `
    <div class="section-head"><span class="running-head">SOPs available in-app</span></div>
    <div class="grid">${cards}</div>`;
}

// ─── C. Library page ─────────────────────────────────────────────────────────

function libraryHTML(dept, state) {
  const deptLib = state.deptLib;
  const search = state.filterText.trim().toLowerCase();

  const searchBox = `
    <div class="page-head__side">
      <input class="input" id="sw-search" style="width:220px" type="search" placeholder="Search documents" aria-label="Search documents" value="${esc(state.filterText)}">
    </div>`;

  const head = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Document Library</span>
        <h1>Standard Work</h1>
        <p class="page-head__sub">Per-department document library — SharePoint-linked. Embedded SOPs open in-app.</p>
      </div>
      ${searchBox}
    </div>`;

  if (!deptLib) {
    return `${head}<p style="padding:24px 0; color:var(--text-faint)">No library data for ${esc(dept.name)} yet.</p>${featuredSopsHTML(state.sopObjects)}`;
  }

  const docs = deptLib.documents || [];
  const filtered = search ? docs.filter((d) => matchesSearch(d, search)) : docs;
  const rows = filtered.length
    ? filtered.map(docRowHTML).join('')
    : `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-faint)">No documents match "${esc(state.filterText)}"</td></tr>`;

  const countPills = buildCountPills(deptLib.counts || {});
  const collectionBadges = (deptLib.drives || []).map(driveBadgeHTML).join(' ');

  return `
    ${head}

    <div class="doc-counts" style="margin-bottom:24px">
      ${countPills}
      <span style="flex:1"></span>
      ${collectionBadges}
    </div>

    <div class="table-wrap"><div class="table-scroll">
      <table class="dt">
        <thead><tr><th>Type</th><th style="min-width:320px">Document</th><th>Area / Product</th><th>Owner</th><th>Lang</th><th>Link</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div></div>

    ${featuredSopsHTML(state.sopObjects)}

    <p class="board-hint"><b>representative</b> = inferred from aggregate counts only — exact title not enumerated in the discovery. <b>link pending</b> = doc confirmed in SharePoint; deep-link not yet mapped.</p>`;
}

// ─── D. SOP detail page — fixes all 5 named §5.6 problems ───────────────────

function sopDetailHTML(sop) {
  if (sop.cadenceRows) return lswDetailHTML(sop);

  const backlinks = SOP_KZ_BACKLINKS[sop.id] || [];
  const linkedForms = sop.linkedForms || [];
  const rev = lastRevision(sop);
  const eyebrow = ['Standard Work', sop.docType || 'BWI', rev ? `Rev ${rev.revision}` : null, rev ? rev.date : null]
    .filter(Boolean).join(' · ');

  const stepsRows = (sop.steps || []).map((st) => `
    <tr>
      <td class="tnum">${esc(st.n)}</td>
      <td>${esc(st.mainStep)}</td>
      <td style="font-weight:400; color:var(--text-secondary)">${esc(st.keyPoints)}</td>
      <td style="font-weight:400; color:var(--text-dim)">${esc(st.reason)}</td>
    </tr>`).join('');

  const backlinksBody = backlinks.length
    ? backlinks.map((bl) => `<p style="margin:10px 0 0; font-size:13.5px"><span style="font-family:var(--font-mono); color:var(--text-dim)">${esc(bl.kzNumber)}</span> · ${esc(bl.title)} · Step ${esc(bl.step)} — Standardize</p>`).join('')
    : `<p style="margin:10px 0 0; font-size:13px; color:var(--text-faint)">No 8-step write-back linked yet.</p>`;
  const linkedFormsLine = linkedForms.length
    ? `<p style="margin:6px 0 0; font-size:12.5px; color:var(--text-faint)">Linked forms: ${linkedForms.map(esc).join(' · ')}</p>`
    : '';

  const revisionsBody = (sop.revisions && sop.revisions.length)
    ? sop.revisions.map((r) => `<p style="margin:10px 0 0; font-size:13px"><b class="tnum">${esc(r.date)}</b> · Rev ${esc(r.revision)} — <span style="color:var(--text-dim)">${esc(r.description)}</span></p>`).join('')
    : `<p style="margin:10px 0 0; font-size:13px; color:var(--text-faint)">No revisions logged.</p>`;
  const elaboratedLine = sop.elaborated
    ? `<p style="margin:8px 0 0; font-size:11.5px; color:var(--text-faint)">Elaborated by: ${esc(sop.elaborated)}</p>`
    : '';

  return `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(eyebrow)}</span>
        <h1 style="font-size:24px; max-width:30ch">${esc(sop.title)}</h1>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-back-to-library>Back to Library</button>
      </div>
    </div>

    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">Purpose</span>
      <p style="margin:8px 0 16px; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${esc(sop.purpose)}</p>
      <span class="running-head">Scope</span>
      <p style="margin:8px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${esc(sop.scope)}</p>
    </section>

    <div class="section-head"><span class="running-head">Standard work steps</span></div>
    <div class="table-wrap"><div class="table-scroll">
      <table class="dt">
        <thead><tr><th style="width:36px">#</th><th style="min-width:220px">Main step</th><th style="min-width:280px">Key points</th><th style="min-width:280px">Reason / why it matters</th></tr></thead>
        <tbody>${stepsRows}</tbody>
      </table>
    </div></div>

    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); margin-top:24px">
      <section class="card card--pad">
        <span class="running-head">8-step backlinks</span>
        ${backlinksBody}
        ${linkedFormsLine}
      </section>
      <section class="card card--pad">
        <span class="running-head">Revision log</span>
        ${revisionsBody}
        ${elaboratedLine}
      </section>
    </div>

    ${sop.note ? `<p class="board-hint">${esc(sop.note)}</p>` : ''}`;
}

// ─── E. LSW cadence detail (ODG's embedded _lsw.json) ───────────────────────

function lswDetailHTML(lsw) {
  const groups = ['Daily', 'Weekly', 'Monthly', 'Other'];
  const byGroup = {};
  groups.forEach((g) => { byGroup[g] = []; });
  (lsw.cadenceRows || []).forEach((row) => {
    byGroup[freqGroup(row.frequency)].push(row);
  });

  const groupsHtml = groups.map((g) => {
    const rows = byGroup[g];
    if (!rows.length) return '';
    const rowsHtml = rows.map((row) => `
      <tr>
        <td>${esc(row.activity)}${row.specificDay ? `<div style="font-size:11.5px; color:var(--text-faint); margin-top:2px">${esc(row.specificDay)}</div>` : ''}</td>
        <td><span class="chip">${esc(row.frequency)}</span></td>
        <td style="color:var(--text-secondary)">${row.workType ? esc(row.workType) : '—'}</td>
        <td>${row.focus ? `<span class="chip">${esc(row.focus)}</span>` : '—'}</td>
        <td style="color:var(--text-dim)">${esc(row.description || '')}</td>
      </tr>`).join('');
    return `
      <div class="section-head"><span class="running-head">${esc(g)} cadence</span></div>
      <div class="table-wrap"><div class="table-scroll">
        <table class="dt">
          <thead><tr><th style="min-width:200px">Activity</th><th style="width:100px">Frequency</th><th style="width:120px">Work type</th><th style="width:110px">Focus</th><th>Description</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div></div>`;
  }).join('');

  const timeModel = lsw.timeAllocationModel;
  const timeHtml = (timeModel && timeModel.buckets && timeModel.buckets.length)
    ? `
      <div class="section-head"><span class="running-head">Time allocation model</span></div>
      <section class="card card--pad">
        ${timeModel.note ? `<p style="margin:0 0 12px; font-size:13px; color:var(--text-dim)">${esc(timeModel.note)}</p>` : ''}
        <div style="display:flex; gap:24px; flex-wrap:wrap">
          ${timeModel.buckets.map((b) => `
            <div>
              <div style="font-family:var(--font-serif); font-size:22px; font-weight:600; color:var(--text)">${Math.round(b.pct * 100)}%</div>
              <div style="font-size:12.5px; color:var(--text-dim)">${esc(b.label)}${b.illustrative ? ' <span class="chip" title="Illustrative — placeholder, not a live tracked number">illustrative</span>' : ''}</div>
            </div>`).join('')}
        </div>
      </section>`
    : '';

  return `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">Standard Work · LSW</span>
        <h1 style="font-size:24px; max-width:30ch">${esc(lsw.title)}</h1>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-back-to-library>Back to Library</button>
      </div>
    </div>

    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">Overview</span>
      <p style="margin:8px 0 16px; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${esc(lsw.note || '')}</p>
      <span class="running-head">Source &amp; roles</span>
      <p style="margin:8px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${esc(lsw.source || '—')} · Roles: ${esc((lsw.roles || []).join(', ') || '—')}</p>
    </section>

    ${groupsHtml}
    ${timeHtml}`;
}

// ─── F. Data loading ─────────────────────────────────────────────────────────

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

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderStandardWork(dept, mount)
 *
 * @param {object} dept   — department data object
 * @param {Element} mount — DOM element to render into
 */
export async function renderStandardWork(dept, mount) {
  const state = {
    activeSopId: null,
    filterText: '',
    sopObjects: [],
    deptLib: null,
  };

  mount.innerHTML = `<p style="padding:24px 0; color:var(--text-faint)">Loading standard work…</p>`;

  // Load this department's full-content SOPs.
  const sopPaths = DEPT_SOPS[dept.id] || [];
  for (const path of sopPaths) {
    if (!_sopCache[path]) {
      try {
        const res = await fetch(path);
        _sopCache[path] = await res.json();
      } catch (e) {
        console.warn('Could not load SOP:', path, e);
      }
    }
    if (_sopCache[path]) state.sopObjects.push(_sopCache[path]);
  }

  // Load the shared library index.
  const libData = await loadLibData();
  state.deptLib = (libData && libData.departments && libData.departments[dept.id]) || null;

  // `?sop=<id>` deep-link (see app.js's documented hash-param vocabulary) —
  // pre-opens the matching embedded SOP's detail view if it's real for this
  // department; otherwise falls through to the library, same as no param.
  const hashQuery = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  const preselectSopId = new URLSearchParams(hashQuery).get('sop');
  if (preselectSopId && state.sopObjects.some((s) => s.id === preselectSopId)) {
    state.activeSopId = preselectSopId;
  }

  function paint() {
    const prevInput = mount.querySelector('#sw-search');
    const hadFocus = !!prevInput && document.activeElement === prevInput;
    const selStart = hadFocus ? prevInput.selectionStart : null;

    const sop = state.activeSopId ? state.sopObjects.find((s) => s.id === state.activeSopId) : null;
    mount.innerHTML = state.activeSopId
      ? (sop ? sopDetailHTML(sop) : `<p style="padding:24px 0; color:var(--text-faint)">SOP "${esc(state.activeSopId)}" not found.</p>`)
      : libraryHTML(dept, state);

    if (hadFocus) {
      const inp = mount.querySelector('#sw-search');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(selStart, selStart); } catch { /* no-op */ }
      }
    }
  }

  mount.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-back-to-library]');
    if (backBtn) { state.activeSopId = null; paint(); return; }

    const openBtn = e.target.closest('[data-open-sop]');
    if (openBtn) {
      const id = openBtn.dataset.openSop;
      if (!id) return; // guard — an embedded SOP object missing a real id
      state.activeSopId = id;
      paint();
    }
  });

  // Keyboard activation for the `role="button"` featured SOP card(s).
  mount.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-open-sop][role="button"]');
    if (card) { e.preventDefault(); card.click(); }
  });

  mount.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'sw-search') {
      state.filterText = e.target.value;
      paint();
    }
  });

  paint();
}

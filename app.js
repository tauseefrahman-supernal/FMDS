/**
 * app.js — hash router + store wiring for FMDS OS prototype
 *
 * Routes:
 *   #/                       → home (placeholder)
 *   #/dept/:id/:view         → one of: team | kpi | my | solve | sop
 *
 * Left-rail views per department:
 *   Team Board      — always visible
 *   KPI             — always visible
 *   My Board        — only when dept.hasL1 === true
 *   Problem-Solving — always visible
 *   Standard Work   — always visible
 */

import { createStore }        from './lib/store.js';
import { renderTeamBoard }    from './views/teamboard.js';
import { renderLocationBoard } from './views/teamboard-location.js';
import { renderKpi }          from './views/kpi.js';
import { renderMyBoard }      from './views/myboard.js';

const app   = document.getElementById('app');
const store = createStore({ departments: [], dept: null });

// ─── Boot: load departments index ──────────────────────────────────────────
async function boot() {
  try {
    const res   = await fetch('data/departments.json');
    const depts = await res.json();
    store.set({ departments: depts });
  } catch (err) {
    console.error('Failed to load departments.json', err);
  }
  route();
}

// ─── Router ────────────────────────────────────────────────────────────────
async function route() {
  const hash  = location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean); // e.g. ['dept','service','team']

  if (parts[0] === 'dept' && parts[1]) {
    const deptId   = parts[1];
    const view     = parts[2] || 'team';
    await loadDeptView(deptId, view);
  } else {
    renderHome();
  }
}

// ─── Load dept JSON + route to view ────────────────────────────────────────
async function loadDeptView(deptId, view) {
  let dept = store.get().deptCache?.[deptId];

  if (!dept) {
    try {
      const res = await fetch(`data/${deptId}.json`);
      if (!res.ok) throw new Error(`${res.status}`);
      dept = await res.json();
      // cache in store
      const cache = store.get().deptCache || {};
      cache[deptId] = dept;
      store.set({ dept, deptCache: cache });
    } catch (err) {
      app.innerHTML = `<div class="container" style="padding-top:48px">
        <p class="text-muted">Could not load data for <strong>${deptId}</strong>. (${err.message})</p>
        <a href="#/">← Home</a></div>`;
      return;
    }
  } else {
    store.set({ dept });
  }

  const departments = store.get().departments;
  const deptMeta    = departments.find(d => d.id === deptId) || {};

  // Merge hasL1 from departments index into dept object
  const deptFull = { ...dept, hasL1: deptMeta.hasL1 ?? false };

  renderLayout(deptFull, view);
}

// ─── Layout: shell + left rail + view mount ────────────────────────────────
function renderLayout(dept, activeView) {
  const views = [
    { id: 'team',  label: 'Team Board' },
    { id: 'kpi',   label: 'KPI' },
    ...(dept.hasL1 ? [{ id: 'my', label: 'My Board' }] : []),
    { id: 'solve', label: 'Problem-Solving' },
    { id: 'sop',   label: 'Standard Work' },
  ];

  const navLinks = views.map(v => `
    <a href="#/dept/${dept.id}/${v.id}"
       class="nav-link ${activeView === v.id ? 'nav-link--active' : ''}">
      ${v.label}
    </a>`).join('');

  app.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div class="container" style="display:flex;align-items:center;gap:16px;height:100%">
          <a href="#/" class="app-logo">FMDS OS</a>
          <span class="text-muted" style="font-size:0.75rem">▸</span>
          <span style="font-weight:600;color:var(--slate-800)">${dept.name}</span>
          <span style="margin-left:auto;font-size:0.75rem;color:var(--slate-500)">
            ▲ rolls up to Leadership OS
          </span>
        </div>
      </header>
      <div class="app-body container">
        <nav class="left-rail" id="left-rail">
          <div class="nav-section-label">Views</div>
          ${navLinks}
        </nav>
        <main class="view-mount" id="view-mount"></main>
      </div>
    </div>`;

  const mount = document.getElementById('view-mount');
  dispatchView(dept, activeView, mount);
}

// ─── View dispatcher ────────────────────────────────────────────────────────
function dispatchView(dept, view, mount) {
  // Location-model departments (Mechanism B) get the location-aware board
  const isLocationDept = dept.layerModel === 'location' || dept.mechanism === 'independent';
  switch (view) {
    case 'team':
      isLocationDept ? renderLocationBoard(dept, mount) : renderTeamBoard(dept, mount);
      break;
    case 'kpi':   renderKpi(dept, mount);       break;
    case 'my':    renderMyBoard(dept, mount);   break;
    case 'solve':
      mount.innerHTML = `<div class="card mt-6">
        <h2>Problem-Solving</h2>
        <p class="text-muted mt-2">8-step wizard + KZ tracker — Phase 5 (Task 11).</p>
      </div>`;
      break;
    case 'sop':
      mount.innerHTML = `<div class="card mt-6">
        <h2>Standard Work</h2>
        <p class="text-muted mt-2">SOP library + LSW cadence — Phase 5 (Task 12).</p>
      </div>`;
      break;
    default:
      renderTeamBoard(dept, mount);
  }
}

// ─── Home (placeholder for Task 14) ────────────────────────────────────────
function renderHome() {
  const departments = store.get().departments;

  if (!departments.length) {
    app.innerHTML = `<div class="container" style="padding-top:48px">
      <p class="text-muted">Loading…</p></div>`;
    return;
  }

  const cards = departments.map(d => {
    const rag = d.headlineActual != null && d.headlineTarget != null
      ? (d.headlineActual >= d.headlineTarget ? 'green' : 'red')
      : 'nodata';
    const frozen = d.frozen
      ? `<span class="badge badge--warning" style="margin-left:auto">Frozen</span>` : '';
    return `
      <a href="#/dept/${d.id}/team" class="dept-card ${d.frozen ? 'dept-card--frozen' : ''}">
        <div class="dept-card__header">
          <span class="dept-card__name">${d.name}</span>
          ${frozen}
        </div>
        <div class="dept-card__meta text-muted">${d.lead || 'TBD'}</div>
        <div class="dept-card__kpi mt-2">
          <span class="rag-chip rag-chip--${rag}" style="font-size:0.8rem">
            ${d.headlineKpi}
          </span>
        </div>
      </a>`;
  }).join('');

  app.innerHTML = `
    <div class="app-header">
      <div class="container" style="display:flex;align-items:center;height:100%">
        <span class="app-logo">FMDS OS</span>
        <span style="margin-left:auto;font-size:0.75rem;color:var(--slate-500)">
          ▲ rolls up to Leadership OS
        </span>
      </div>
    </div>
    <div class="container" style="padding-top:32px">
      <h1 style="margin-bottom:8px">World Emblem — Department Boards</h1>
      <p class="text-muted mb-6">Click a department to open its board.</p>
      <div class="dept-grid">${cards}</div>
    </div>`;
}

// ─── Styles for shell layout ────────────────────────────────────────────────
const shellStyles = `
  .app-shell { display:flex; flex-direction:column; min-height:100vh; }

  .app-header {
    height: 52px;
    border-bottom: 1px solid var(--slate-200);
    background: #fff;
    position: sticky; top: 0; z-index: 10;
  }

  .app-logo {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--accent);
    letter-spacing: -0.01em;
    text-decoration: none;
  }

  .app-body {
    display: flex;
    gap: 0;
    align-items: flex-start;
    padding-top: 0;
  }

  .left-rail {
    width: 180px;
    flex-shrink: 0;
    padding: 24px 16px 24px 0;
    position: sticky;
    top: 52px;
    max-height: calc(100vh - 52px);
    overflow-y: auto;
  }

  .nav-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--slate-500);
    margin-bottom: 8px;
    padding-left: 10px;
  }

  .nav-link {
    display: block;
    padding: 7px 10px;
    border-radius: var(--radius);
    font-size: 0.875rem;
    color: var(--slate-700);
    text-decoration: none;
    transition: background 0.1s, color 0.1s;
    margin-bottom: 2px;
  }

  .nav-link:hover { background: var(--slate-100); color: var(--slate-900); }

  .nav-link--active {
    background: var(--accent-light);
    color: var(--accent);
    font-weight: 600;
  }

  .view-mount {
    flex: 1;
    min-width: 0;
    padding: 24px 0 48px 24px;
    border-left: 1px solid var(--slate-200);
  }

  /* Home grid */
  .dept-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .dept-card {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-lg);
    padding: 20px;
    text-decoration: none;
    color: inherit;
    transition: box-shadow 0.15s, border-color 0.15s;
    box-shadow: var(--shadow-sm);
  }

  .dept-card:hover {
    box-shadow: var(--shadow);
    border-color: var(--slate-300);
  }

  .dept-card--frozen { opacity: 0.5; pointer-events: none; }

  .dept-card__header { display:flex; align-items:center; }
  .dept-card__name { font-weight: 600; font-size: 0.95rem; color: var(--slate-900); }
  .dept-card__meta { font-size: 0.78rem; }
`;

const styleEl = document.createElement('style');
styleEl.textContent = shellStyles;
document.head.appendChild(styleEl);

// ─── Init ───────────────────────────────────────────────────────────────────
addEventListener('hashchange', route);
boot();

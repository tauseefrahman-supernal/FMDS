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

import { createStore }            from './lib/store.js';
import { renderTeamBoard }        from './views/teamboard.js';
import { renderLocationBoard }    from './views/teamboard-location.js';
import { renderOdgHub }           from './views/odg-hub.js';
import { renderKpi }              from './views/kpi.js';
import { renderMyBoard }          from './views/myboard.js';
import { renderProblemSolving }   from './views/problemsolving.js';
import { renderStandardWork }     from './views/standardwork.js';
import { bakedReply }             from './lib/agent.js';

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

// ─── Layout: shell + left rail + view mount + agent panel ──────────────────
function renderLayout(dept, activeView) {
  // Finance (frozen) gets KPI-only nav — no PS or standard work until Phase 2
  const isFrozen = dept.frozen === true;
  const views = [
    { id: 'team',  label: 'Team Board' },
    { id: 'kpi',   label: 'KPI' },
    ...(dept.hasL1 ? [{ id: 'my', label: 'My Board' }] : []),
    ...(!isFrozen ? [{ id: 'solve', label: 'Problem-Solving' }] : []),
    ...(!isFrozen ? [{ id: 'sop',   label: 'Standard Work' }] : []),
  ];

  const navLinks = views.map(v => `
    <a href="#/dept/${dept.id}/${v.id}"
       class="nav-link ${activeView === v.id ? 'nav-link--active' : ''}">
      ${v.label}
    </a>`).join('');

  // HR agent-poke CTA only shown on HR department
  const agentPokeBtn = dept.id === 'hr'
    ? `<button class="agent-poke-btn" onclick="window._agentPoke()">
         Ping Clarissa (ADP poke)
       </button>`
    : '';

  // Marketing: Hermes agent note in the agent panel
  const hermesAgentNote = dept.id === 'marketing'
    ? `<div style="margin-top:8px;padding:8px 10px;border:1px solid var(--accent-light);border-radius:var(--radius);background:var(--accent-light);font-size:0.75rem;color:var(--accent)">
         <strong>Hermes agent layer open</strong><br>
         Carlos's Hermes agent can connect to this board as the Marketing automation layer.
       </div>`
    : '';

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
        <aside class="agent-panel" id="agent-panel">
          <div class="agent-panel__header">
            <span class="agent-panel__title">AI Assistant</span>
            <span class="agent-panel__dept text-muted">${dept.name}</span>
          </div>
          <div class="agent-panel__intents">
            <button class="agent-intent-btn" onclick="window._agentAsk('explain-red')">
              Why is the headline KPI red?
            </button>
            <button class="agent-intent-btn" onclick="window._agentAsk('find-sop')">
              Find governing SOP
            </button>
            ${agentPokeBtn}
          </div>
          ${hermesAgentNote}
          <div class="agent-panel__input-row">
            <input id="agent-input" class="agent-input" type="text"
                   placeholder="Ask about this board…"
                   onkeydown="if(event.key==='Enter') window._agentSubmit()">
            <button class="agent-send-btn" onclick="window._agentSubmit()">Ask</button>
          </div>
          <div class="agent-panel__response" id="agent-response">
            <p class="text-muted" style="font-size:0.8rem;padding:8px 0">
              Ask a question or choose a shortcut above.
            </p>
          </div>
        </aside>
      </div>
    </div>`;

  const mount = document.getElementById('view-mount');
  dispatchView(dept, activeView, mount);
  attachAgentHandlers(dept);
}

// ─── View dispatcher ────────────────────────────────────────────────────────
function dispatchView(dept, view, mount) {
  // ODG gets its dedicated method hub as the team view
  if (dept.id === 'odg' && view === 'team') {
    renderOdgHub(dept, mount);
    return;
  }
  // Location-model departments (Mechanism B) get the location-aware board
  const isLocationDept = dept.layerModel === 'location' || dept.mechanism === 'independent';
  switch (view) {
    case 'team':
      isLocationDept ? renderLocationBoard(dept, mount) : renderTeamBoard(dept, mount);
      break;
    case 'kpi':   renderKpi(dept, mount);       break;
    case 'my':    renderMyBoard(dept, mount);   break;
    case 'solve':
      renderProblemSolving(dept, mount);
      break;
    case 'sop':
      renderStandardWork(dept, mount);
      break;
    default:
      // ODG: fall back to method hub for unknown views too
      if (dept.id === 'odg') { renderOdgHub(dept, mount); return; }
      renderTeamBoard(dept, mount);
  }
}

// ─── Agent panel handlers ───────────────────────────────────────────────────
function attachAgentHandlers(dept) {
  const responseEl = document.getElementById('agent-response');
  if (!responseEl) return;

  function showResponse(text) {
    responseEl.innerHTML = `
      <div class="agent-response-bubble">
        <div class="agent-response-label">FMDS Agent</div>
        <pre class="agent-response-text">${escHtml(text)}</pre>
      </div>`;
  }

  window._agentAsk = (intent) => {
    const reply = bakedReply(dept.id, intent, { kpi: dept.headlineKpi });
    showResponse(reply);
  };

  window._agentPoke = () => {
    const reply = bakedReply(dept.id, 'agent-poke', {});
    showResponse(reply);
  };

  window._agentSubmit = () => {
    const input = document.getElementById('agent-input');
    const question = input ? input.value.trim() : '';
    if (!question) return;

    // Route free-text questions to the best intent
    let intent = 'explain-red';
    const q = question.toLowerCase();
    if (q.includes('sop') || q.includes('standard work') || q.includes('bwi')) {
      intent = 'find-sop';
    } else if (q.includes('adp') || q.includes('poke') || q.includes('clarissa')) {
      intent = 'agent-poke';
    }
    const reply = bakedReply(dept.id, intent, { kpi: dept.headlineKpi, question });
    showResponse(reply);
    if (input) input.value = '';
  };
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

// ─── Styles for shell layout + agent panel ─────────────────────────────────
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
    /* right border handled by agent panel */
  }

  /* ── Agent panel — right-docked, visually distinct from 8-step wizard ── */
  .agent-panel {
    width: 280px;
    flex-shrink: 0;
    padding: 20px 0 48px 16px;
    border-left: 1px solid var(--slate-200);
    position: sticky;
    top: 52px;
    max-height: calc(100vh - 52px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .agent-panel__header {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--slate-200);
  }

  .agent-panel__title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .agent-panel__dept {
    font-size: 0.75rem;
  }

  .agent-panel__intents {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .agent-intent-btn {
    text-align: left;
    padding: 7px 10px;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    background: var(--slate-50);
    font-size: 0.78rem;
    color: var(--slate-700);
    cursor: pointer;
    transition: background 0.1s, border-color 0.1s;
    font-family: inherit;
  }

  .agent-intent-btn:hover {
    background: var(--accent-light);
    border-color: var(--accent);
    color: var(--accent);
  }

  .agent-poke-btn {
    text-align: left;
    padding: 7px 10px;
    border: 1px solid #ffd8a8;
    border-radius: var(--radius);
    background: #fff9f0;
    font-size: 0.78rem;
    color: #c7620a;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.1s;
  }

  .agent-poke-btn:hover { background: #fff3e0; }

  .agent-panel__input-row {
    display: flex;
    gap: 6px;
  }

  .agent-input {
    flex: 1;
    min-width: 0;
    padding: 6px 9px;
    border: 1px solid var(--slate-300);
    border-radius: var(--radius);
    font-size: 0.8rem;
    font-family: inherit;
    color: var(--slate-900);
    background: #fff;
  }

  .agent-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-light);
  }

  .agent-send-btn {
    padding: 6px 10px;
    border: none;
    border-radius: var(--radius);
    background: var(--accent);
    color: #fff;
    font-size: 0.78rem;
    cursor: pointer;
    font-family: inherit;
    flex-shrink: 0;
    transition: opacity 0.1s;
  }

  .agent-send-btn:hover { opacity: 0.88; }

  .agent-panel__response {
    flex: 1;
  }

  .agent-response-bubble {
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    padding: 10px 12px;
  }

  .agent-response-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 6px;
  }

  .agent-response-text {
    font-size: 0.78rem;
    white-space: pre-wrap;
    font-family: inherit;
    color: var(--slate-700);
    line-height: 1.55;
    margin: 0;
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

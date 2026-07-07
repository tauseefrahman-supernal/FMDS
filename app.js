/**
 * app.js — hash router + store wiring for FMDS OS prototype
 *
 * Routes:
 *   #/                       → home (placeholder)
 *   #/dept/:id/:view         → one of: team | kpi | my | solve | sop | mark
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
import { renderOverview }         from './views/overview.js';
import { renderOdgHub }           from './views/odg-hub.js';
import { renderKpi }              from './views/kpi.js';
import { renderMyBoard }          from './views/myboard.js';
import { renderMyDay }            from './views/myday.js';
import { renderProblemSolving }   from './views/problemsolving.js';
import { renderStandardWork }     from './views/standardwork.js';
import { renderSources }          from './views/sources.js';
import { renderAskMark }          from './views/askmark.js';
import { renderLogin, resolvePersona } from './views/login.js';
import { bakedReply }             from './lib/agent.js';
import { redKpisNeedingResponse, getResponse } from './lib/accountability.js';

const app   = document.getElementById('app');
const store = createStore({ departments: [], dept: null, session: null });

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

// Role-aware home view for a session
function homeViewFor(session) {
  return session.role === 'L1' ? 'my' : 'team';
}

// ─── Router ────────────────────────────────────────────────────────────────
async function route() {
  const hash  = location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean); // e.g. ['dept','service','team']
  const session = store.get().session;

  // No session → login gate (always), except explicit #/login
  if (!session) {
    showLogin();
    return;
  }

  if (parts[0] === 'login') {
    showLogin();
    return;
  }

  if (parts[0] === 'dept' && parts[1]) {
    const deptId = parts[1];
    // Strip any ?query suffix from the view segment (e.g. "solve?kpi=rev_jc" → "solve")
    const view   = (parts[2] || homeViewFor(session)).split('?')[0];
    await loadDeptView(deptId, view);
  } else {
    // Authenticated but no route → send to the session's home
    location.hash = `#/dept/${session.deptId}/${homeViewFor(session)}`;
  }
}

// ─── Login gate ──────────────────────────────────────────────────────────────
function showLogin() {
  const departments = store.get().departments;
  if (!departments.length) {
    app.innerHTML = `<div class="container" style="padding-top:48px"><p class="text-muted">Loading…</p></div>`;
    return;
  }
  renderLogin(app, ({ deptId, role, persona }) => {
    store.set({ session: { deptId, role, persona } });
    const target = `#/dept/${deptId}/${role === 'L1' ? 'my' : 'team'}`;
    // If the hash won't change (already on target), route() won't fire via hashchange.
    if (location.hash === target) route();
    else location.hash = target;
  }, departments);
}

function signOut() {
  store.set({ session: null, dept: null });
  if (location.hash === '#/login') showLogin();
  else location.hash = '#/login';   // hashchange → route() → showLogin()
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

// ─── Nav definitions per role ──────────────────────────────────────────────
function navFor(dept, role) {
  const isFrozen = dept.frozen === true;
  if (role === 'L1') {
    return [
      { id: 'my',    label: 'My Day',          icon: '◎' },
      { id: 'kpi',   label: 'My Targets',      icon: '◆' },
      { id: 'solve', label: 'Problem-Solving', icon: '⚑' },
      { id: 'sop',   label: 'Standard Work',   icon: '≣' },
      { id: 'mark',  label: 'Ask Mark',        icon: '◇' },
    ];
  }
  // L2
  return [
    { id: 'team',  label: 'Overview',        icon: '▤' },
    { id: 'kpi',   label: 'KPI Boards',      icon: '◆' },
    ...(!isFrozen ? [{ id: 'solve', label: 'Problem-Solving', icon: '⚑' }] : []),
    ...(!isFrozen ? [{ id: 'sop',   label: 'Standard Work',   icon: '≣' }] : []),
    { id: 'sources', label: 'Sources', icon: '⛁' },
    ...(!isFrozen ? [{ id: 'mark', label: 'Ask Mark', icon: '◇' }] : []),
  ];
}

function viewLabel(dept, role, view) {
  const item = navFor(dept, role).find(v => v.id === view);
  return item ? item.label : view;
}

// ─── Ask Mark queue count ───────────────────────────────────────────────────
// Mirrors views/askmark.js's header "N action required": live reds
// (redKpisNeedingResponse) that have NOT yet had a response submitted
// (getResponse(...).answered). Deliberately NOT rollupSignal().redCount —
// that counts persisted response entries, a different number from the queue.
function askMarkActionRequiredCount(dept) {
  return redKpisNeedingResponse(dept).filter((item) =>
    !(getResponse({ deptId: dept.id, kpiId: item.kpiId }) || {}).answered
  ).length;
}

// ─── Layout: dark command rail + light canvas + top bar ────────────────────
function renderLayout(dept, activeView) {
  const session = store.get().session;
  const persona = session.persona || resolvePersona(dept, session.role) || { name: dept.name, label: '' };
  const role    = session.role;
  const nav     = navFor(dept, role);

  const railLinks = nav.map(v => `
    <a href="#/dept/${dept.id}/${v.id}"
       class="rail-link ${activeView === v.id ? 'rail-link--active' : ''}">
      <span class="rail-link__icon">${v.icon}</span>${v.label}
    </a>`).join('');

  const roleBadgeClass = role === 'L1' ? 'role-badge role-badge--l1' : 'role-badge';
  const initials = persona.name.split(/[\s/]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // 🔔 is a shortcut into the Ask Mark queue — gated the same way the "Ask
  // Mark" nav item is (off on frozen departments), so it never routes
  // somewhere that isn't reachable from the rail.
  const canAskMark  = nav.some(v => v.id === 'mark');
  const inboxCount  = canAskMark ? askMarkActionRequiredCount(dept) : 0;
  const inboxBtnHtml = canAskMark ? `
          <button class="inbox-btn" id="inbox-btn" title="Ask Mark — action required">
            🔔${inboxCount > 0 ? `<span class="inbox-btn__count" id="inbox-btn-count">${inboxCount}</span>` : ''}
          </button>` : '';

  app.innerHTML = `
    <div class="app-shell">
      <nav class="rail">
        <div class="rail__brand">
          <div class="rail__mark">FM</div>
          <div class="rail__wordmark">FMDS OS<small>World Emblem</small></div>
        </div>

        <div class="rail__context">
          <div class="rail__ctx-label">Department</div>
          <div class="rail__ctx-dept">${dept.name}</div>
          <div class="rail__ctx-row">
            <span class="${roleBadgeClass}">${role}</span>
            <span class="rail__persona">${persona.name}</span>
          </div>
        </div>

        <div class="rail__nav">
          <div class="rail__nav-label">Resources</div>
          ${railLinks}
        </div>

        <div class="rail__footer">
          <div class="rail__footer-persona">
            <div class="rail__avatar">${initials}</div>
            <div class="rail__footer-meta">
              <div class="rail__footer-name">${persona.name}</div>
              <div class="rail__footer-sub">${persona.label || ''}</div>
            </div>
          </div>
          <button class="rail__signout" id="rail-signout">⤺ Switch role / Sign out</button>
        </div>
      </nav>

      <div class="app-main">
        <header class="topbar">
          <div class="crumb">
            <span class="crumb__dept">${dept.name}</span>
            <span class="crumb__sep">▸</span>
            <span class="crumb__view">${viewLabel(dept, role, activeView)}</span>
          </div>
          <button class="topbar-btn assistant-btn" id="assistant-btn" title="Mark — your AI employee">◇ Ask Mark</button>${inboxBtnHtml}
          <div class="topbar__search">
            <input type="search" placeholder="Search this board…" aria-label="Search">
          </div>
          <span class="rollup-tag">▲ rolls up to <b>Leadership OS</b></span>
        </header>

        <main class="canvas">
          <div class="view-mount" id="view-mount"></div>
        </main>
      </div>
    </div>`;

  const mount = document.getElementById('view-mount');
  dispatchView(dept, activeView, mount);

  // Rail sign-out
  const signoutBtn = document.getElementById('rail-signout');
  if (signoutBtn) signoutBtn.addEventListener('click', signOut);

  // 🔔 → Ask Mark queue shortcut (standalone Chief-of-Staff popover retired;
  // the bell now routes into the same queue the "Ask Mark" nav item opens,
  // with a live badge kept in sync by polling — the queue can change from
  // inside the Ask Mark view itself, which repaints only its own mount, not
  // this topbar).
  const inboxBtn = document.getElementById('inbox-btn');
  if (inboxBtn) {
    inboxBtn.addEventListener('click', () => { location.hash = `#/dept/${dept.id}/mark`; });
    startInboxBadgePoll(dept);
  } else {
    stopInboxBadgePoll();
  }

  // AI Assistant drawer toggle
  const assistantBtn = document.getElementById('assistant-btn');
  if (assistantBtn) assistantBtn.addEventListener('click', () => toggleAssistant(dept));
}

// ─── 🔔 live badge poll ─────────────────────────────────────────────────────
// The Ask Mark queue is backed by localStorage (lib/accountability.js) and
// can be mutated by the Ask Mark view without a route change (submitting a
// response calls its own local re-render, not renderLayout()). Poll rather
// than wire a cross-view event so this stays a single-file change.
let _inboxPollTimer = null;

function stopInboxBadgePoll() {
  if (_inboxPollTimer) { clearInterval(_inboxPollTimer); _inboxPollTimer = null; }
}

function startInboxBadgePoll(dept) {
  stopInboxBadgePoll();
  _inboxPollTimer = setInterval(() => {
    const btn = document.getElementById('inbox-btn');
    if (!btn) { stopInboxBadgePoll(); return; } // topbar re-rendered elsewhere (route change)
    const count = askMarkActionRequiredCount(dept);
    let countEl = document.getElementById('inbox-btn-count');
    if (count > 0) {
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.className = 'inbox-btn__count';
        countEl.id = 'inbox-btn-count';
        btn.appendChild(countEl);
      }
      countEl.textContent = String(count);
    } else if (countEl) {
      countEl.remove();
    }
  }, 800);
}

// ─── AI Assistant right drawer ──────────────────────────────────────────────
function toggleAssistant(dept) {
  const existing = document.getElementById('assistant-drawer');
  if (existing) { existing.remove(); return; }

  const pokeBtn = dept.id === 'hr'
    ? `<button class="assistant-shortcut assistant-shortcut--poke" data-intent="agent-poke">Ping Clarissa (ADP poke)</button>`
    : '';

  const drawer = document.createElement('div');
  drawer.id = 'assistant-drawer';
  drawer.className = 'assistant-drawer';
  drawer.innerHTML = `
    <div class="assistant-drawer__head">
      <div class="assistant-drawer__ident">
        <div class="assistant-drawer__avatar">M</div>
        <div>
          <div class="assistant-drawer__name">Mark</div>
          <div class="assistant-drawer__role">AI Employee · <span class="assistant-drawer__dept">${dept.name}</span></div>
        </div>
      </div>
      <button class="assistant-drawer__close" id="assistant-close">×</button>
    </div>

    <div class="assistant-drawer__reads">
      Mark reasons over your <b>KPI data</b> and the <b>meeting record</b> — weekly
      <b>T2</b> (leadership), <b>T3</b> (exec review) and team <b>huddles</b> — to explain
      what's driving each number and track the actions coming out of those meetings.
    </div>

    <div class="assistant-drawer__shortcuts">
      <button class="assistant-shortcut" data-intent="explain-red">Why is the headline KPI red?</button>
      <button class="assistant-shortcut" data-intent="find-sop">Find governing SOP</button>
      ${pokeBtn}
    </div>

    <div class="assistant-drawer__reply" id="assistant-reply"></div>

    <div class="assistant-drawer__ask">
      <textarea id="assistant-input" rows="3" placeholder="Ask about this board…"></textarea>
      <button class="btn btn--primary assistant-ask-btn" id="assistant-ask">Ask</button>
    </div>`;

  document.querySelector('.app-main').appendChild(drawer);

  // Close button
  document.getElementById('assistant-close').addEventListener('click', () => {
    document.getElementById('assistant-drawer')?.remove();
  });

  // Shortcut buttons
  document.querySelectorAll('.assistant-shortcut').forEach(btn => {
    btn.addEventListener('click', () => {
      const reply = bakedReply(dept.id, btn.dataset.intent, {});
      document.getElementById('assistant-reply').textContent = reply;
    });
  });

  // Ask button
  document.getElementById('assistant-ask').addEventListener('click', () => {
    const input = document.getElementById('assistant-input').value.trim();
    if (!input) return;
    const reply = bakedReply(dept.id, 'explain-red', { kpi: input });
    document.getElementById('assistant-reply').textContent = reply;
  });
}

// ─── View dispatcher ────────────────────────────────────────────────────────
function dispatchView(dept, view, mount) {
  const session = store.get().session;

  // ODG gets its dedicated method hub as the team view
  if (dept.id === 'odg' && view === 'team') {
    renderOdgHub(dept, mount);
    return;
  }

  switch (view) {
    // 'team' → Overview surface for all departments (role-scoped red/green summary + agent)
    case 'team':
      renderOverview(dept, mount, session);
      break;

    // 'kpi' → detailed KPI Boards:
    //   Operations → location board (Mechanism B) with operator contribution drill
    //   Others     → existing KPI view
    case 'kpi':
      dept.id === 'operations'
        ? renderLocationBoard(dept, mount)
        : renderKpi(dept, mount);
      break;

    case 'sources': renderSources(dept, mount); break;
    case 'my': {
      if (session && session.role === 'L1') {
        renderMyDay(dept, mount, session.persona);
      } else {
        renderMyBoard(dept, mount);
      }
      break;
    }
    case 'solve':
      renderProblemSolving(dept, mount);
      break;
    case 'sop':
      renderStandardWork(dept, mount);
      break;
    case 'mark':
      renderAskMark(dept, mount, session);
      break;
    default:
      // ODG: fall back to method hub for unknown views too
      if (dept.id === 'odg') { renderOdgHub(dept, mount); return; }
      renderOverview(dept, mount, session);
  }
}


// ─── Init ───────────────────────────────────────────────────────────────────
addEventListener('hashchange', route);
boot();

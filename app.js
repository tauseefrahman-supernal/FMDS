/**
 * app.js — hash router + store wiring for FMDS OS prototype
 *
 * Routes:
 *   #/                       → home (placeholder)
 *   #/dept/:id/:view         → one of: team | kpi | hoshin | my | solve | sop | sources | mark
 *
 * Left-rail views per department:
 *   Team Board      — always visible
 *   KPI             — always visible
 *   My Board        — only when dept.hasL1 === true
 *   Problem-Solving — always visible
 *   Standard Work   — always visible
 *
 * Deep-link params: our hash is path-based (#/dept/:id/:view), NOT the
 * reference's flat query-string scheme (#view=kpi&loc=...) — that stays the
 * router model. Extra deep-link data rides as a query string appended to the
 * view segment, e.g. "#/dept/operations/solve?kpi=rev_jc&kz=346" or
 * "#/dept/operations/kpi?loc=houston&chart=otp". route() only strips that
 * suffix to resolve the view id (`parts[2].split('?')[0]`) — it never
 * mutates `location.hash` itself, so the full query string survives
 * unmangled all the way to the rendered view. Each view is responsible for
 * reading the params it cares about off `location.hash` directly (the
 * pattern views/problemsolving.js and views/askmark.js already use for
 * `kpi`/`kz`). Full vocabulary this scheme supports, per the redesign spec:
 *   kpi, kz      — ALREADY consumed (problemsolving.js R3 handoff, askmark.js)
 *   loc, chart   — reserved for the KPI-board location/chart-switcher deep
 *                  link (Task 8/8b — teamboard-location.js etc.)
 *   step         — reserved for opening the 8-step A3 on a specific step
 *                  (Task 11 — problemsolving.js wizard)
 *   sop          — reserved for opening a specific Standard Work SOP detail
 *                  (Task 12 — standardwork.js)
 *   respond      — reserved for opening the Ask Mark response modal (Task 14
 *                  — askmark.js)
 * No app.js change is needed to "unlock" the reserved params — they already
 * pass through; the consuming views just don't parse them yet.
 */

import { createStore }            from './lib/store.js';
import { renderLocationBoard }    from './views/teamboard-location.js';
import { renderOverview }         from './views/overview.js';
import { renderHoshin }           from './views/hoshin.js';
import { renderOdgHub }           from './views/odg-hub.js';
import { renderKpi }              from './views/kpi.js';
import { renderMyBoard }          from './views/myboard.js';
import { renderMyDay }            from './views/myday.js';
import { renderProblemSolving }   from './views/problemsolving.js';
import { renderStandardWork }     from './views/standardwork.js';
import { renderSources }          from './views/sources.js';
import { renderAskMark }          from './views/askmark.js';
import { renderLogin, resolvePersona } from './views/login.js';
import { unansweredRedCount } from './lib/accountability.js';

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
  stopInboxBadgePoll();
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

// ─── SVG nav/topbar icons ───────────────────────────────────────────────────
// Ported from docs/redesign/reference/app.js's ICONS set (1.5px stroke,
// 16x16 viewBox, currentColor) — replaces the old single-character glyph
// icons per the redesign spec (no glyph nav icons).
const ICONS = {
  overview: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M1.5 6h13M6 6v9"/></svg>',
  kpi:      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 13.5V9M6 13.5V5.5M10 13.5V8M14 13.5V3"/></svg>',
  hoshin:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.25"/></svg>',
  solve:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 14V2.5M3 2.5h9.5l-2 3.5 2 3.5H3"/></svg>',
  sop:      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 1.5h6.5L13.5 4.5V14.5h-9.5z"/><path d="M6 6.5h4M6 9h4M6 11.5h2.5"/></svg>',
  sources:  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="3.5" rx="5.5" ry="2"/><path d="M2.5 3.5v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2"/></svg>',
  mark:     '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.5l1.8 4.7L14.5 8l-4.7 1.8L8 14.5 6.2 9.8 1.5 8l4.7-1.8z"/></svg>',
  myday:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>',
  search:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
  bell:     '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2a4 4 0 0 0-4 4c0 3-1.5 4.5-1.5 4.5h11S12 10.5 12 6a4 4 0 0 0-4-4zM6.5 13a1.5 1.5 0 0 0 3 0"/></svg>',
  up:       '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 13V3M4 7l4-4 4 4"/></svg>',
};

// ─── Nav definitions per role ──────────────────────────────────────────────
// `icon` is a key into ICONS above (rendered as inline SVG in renderLayout).
// Item ids/labels/gating (which items appear per dept/role, incl. the
// frozen-dept solve/sop/mark cut) are UNCHANGED from before this rebuild —
// only the icon representation moved from a glyph char to an ICONS key.
function navFor(dept, role) {
  const isFrozen = dept.frozen === true;
  if (role === 'L1') {
    return [
      { id: 'my',    label: 'My Day',          icon: 'myday' },
      { id: 'kpi',   label: 'My Targets',      icon: 'kpi' },
      { id: 'solve', label: 'Problem-Solving', icon: 'solve' },
      { id: 'sop',   label: 'Standard Work',   icon: 'sop' },
      { id: 'mark',  label: 'Ask Mark',        icon: 'mark' },
    ];
  }
  // L2
  return [
    { id: 'team',  label: 'Overview',        icon: 'overview' },
    { id: 'kpi',   label: 'KPI Boards',      icon: 'kpi' },
    // Hoshin: informational policy-deployment surface, gated like Overview/KPI
    // Boards/Sources (visible even on frozen depts) rather than like the
    // operational tools (solve/sop/mark) — a frozen dept still has a real
    // Hoshin page (objective cards + functional lead), it just has no active
    // 8-step/SOP/Ask-Mark workflows.
    { id: 'hoshin', label: 'Hoshin',         icon: 'hoshin' },
    ...(!isFrozen ? [{ id: 'solve', label: 'Problem-Solving', icon: 'solve' }] : []),
    ...(!isFrozen ? [{ id: 'sop',   label: 'Standard Work',   icon: 'sop' }] : []),
    { id: 'sources', label: 'Sources', icon: 'sources' },
    ...(!isFrozen ? [{ id: 'mark', label: 'Ask Mark', icon: 'mark' }] : []),
  ];
}

function viewLabel(dept, role, view) {
  const item = navFor(dept, role).find(v => v.id === view);
  return item ? item.label : view;
}

// ─── Layout: light sidebar + topbar + canvas ────────────────────────────────
function renderLayout(dept, activeView) {
  const session = store.get().session;
  const persona = session.persona || resolvePersona(dept, session.role) || { name: dept.name, label: '' };
  const role    = session.role;
  const nav     = navFor(dept, role);

  // Both the bell and the topbar "Ask Mark" button open the Ask Mark
  // queue/view — gated the same way the "Ask Mark" nav item is (off on
  // frozen departments), so neither ever routes somewhere unreachable from
  // the sidebar nav.
  const canAskMark   = nav.some(v => v.id === 'mark');
  const askMarkCount = canAskMark ? unansweredRedCount(dept) : 0;

  const navHtml = nav.map(v => {
    const icon = ICONS[v.icon] || '';
    // 6px red flag: the reference puts this on the "Overview" nav item
    // (its id 'overview'; ours 'team') when a KPI needs attention. L1's
    // home item is "My Day" — a different surface, not an Overview — so it
    // intentionally does not carry this flag.
    const flag = (v.id === 'team' && askMarkCount > 0)
      ? `<span class="nav-flag" title="${askMarkCount} KPI${askMarkCount === 1 ? '' : 's'} need attention"></span>`
      : '';
    return `
      <a href="#/dept/${dept.id}/${v.id}" class="nav-item ${activeView === v.id ? 'is-active' : ''}">
        ${icon}${v.label}${flag}
      </a>`;
  }).join('');

  const roleBadgeClass = role === 'L1' ? 'role-badge role-badge--l1' : 'role-badge';
  const initials = persona.name.split(/[\s/]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const askMarkBtnHtml = canAskMark ? `
          <button class="btn btn--outline btn--sm" id="assistant-btn" title="Mark — your AI employee">${ICONS.mark} Ask Mark</button>` : '';
  const bellHtml = canAskMark ? `
          <button class="icon-btn" id="inbox-btn" aria-label="Ask Mark — action required" title="Ask Mark — action required">
            ${ICONS.bell}${askMarkCount > 0 ? `<span class="icon-btn__count" id="inbox-btn-count">${askMarkCount}</span>` : ''}
          </button>` : '';

  app.innerHTML = `
    <div class="shell">
      <nav class="sidebar" aria-label="Board navigation">
        <div class="brand">
          <div class="brand__mark">FM</div>
          <div>
            <div class="brand__name">FMDS OS</div>
            <div class="brand__sub">World Emblem</div>
          </div>
        </div>

        <div class="dept-block">
          <span class="running-head">Department</span>
          <div class="dept-block__name">${dept.name}</div>
          <div class="dept-block__meta">
            <span class="${roleBadgeClass}">${role}</span>
            ${persona.name}
          </div>
        </div>

        <div class="nav">
          <span class="running-head">Boards</span>
          ${navHtml}
        </div>

        <div class="sidebar__footer">
          <div class="persona">
            <div class="persona__avatar">${initials}</div>
            <div>
              <div class="persona__name">${persona.name}</div>
              <div class="persona__role">${persona.label || ''}</div>
            </div>
          </div>
          <button class="signout" id="rail-signout">Switch Role / Sign Out</button>
        </div>
      </nav>

      <div class="content-area">
        <header class="topbar">
          <div class="crumb"><b>${dept.name}</b><span class="crumb__sep">/</span>${viewLabel(dept, role, activeView)}</div>
          <div class="topbar__spacer"></div>
          ${askMarkBtnHtml}
          ${bellHtml}
          <div class="topbar__search">${ICONS.search}<input type="search" placeholder="Search this board…" aria-label="Search this board"></div>
          <span class="rollup-tag">${ICONS.up}Rolls up to <b>Leadership OS</b></span>
        </header>

        <main class="canvas">
          <div class="view-mount" id="view-mount"></div>
        </main>
      </div>
    </div>`;

  const mount = document.getElementById('view-mount');
  dispatchView(dept, activeView, mount);

  // Sidebar sign-out
  const signoutBtn = document.getElementById('rail-signout');
  if (signoutBtn) signoutBtn.addEventListener('click', signOut);

  // 🔔 → Ask Mark queue shortcut (standalone Chief-of-Staff popover stays
  // retired; the bell routes into the same queue the "Ask Mark" nav item
  // opens, with a live badge kept in sync by polling — the queue can change
  // from inside the Ask Mark view itself, which repaints only its own
  // mount, not this topbar).
  const inboxBtn = document.getElementById('inbox-btn');
  if (inboxBtn) {
    inboxBtn.addEventListener('click', () => { location.hash = `#/dept/${dept.id}/mark`; });
    startInboxBadgePoll(dept);
  } else {
    stopInboxBadgePoll();
  }

  // Topbar "Ask Mark" button → same destination as the bell/nav item (the
  // full Ask Mark workspace). This replaces the old mini AI-assistant
  // drawer this button used to toggle (see task report for why).
  const assistantBtn = document.getElementById('assistant-btn');
  if (assistantBtn) assistantBtn.addEventListener('click', () => { location.hash = `#/dept/${dept.id}/mark`; });
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
    const count = unansweredRedCount(dept);
    let countEl = document.getElementById('inbox-btn-count');
    if (count > 0) {
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.className = 'icon-btn__count';
        countEl.id = 'inbox-btn-count';
        btn.appendChild(countEl);
      }
      countEl.textContent = String(count);
    } else if (countEl) {
      countEl.remove();
    }
  }, 800);
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

    case 'hoshin':
      renderHoshin(dept, mount);
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

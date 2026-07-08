/* ═══ FMDS OS redesign — shell + router ═══ */

const ICONS = {
  overview: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M1.5 6h13M6 6v9"/></svg>',
  kpi: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 13.5V9M6 13.5V5.5M10 13.5V8M14 13.5V3"/></svg>',
  solve: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 14V2.5M3 2.5h9.5l-2 3.5 2 3.5H3"/></svg>',
  sop: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 1.5h6.5L13.5 4.5V14.5h-9.5z"/><path d="M6 6.5h4M6 9h4M6 11.5h2.5"/></svg>',
  sources: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="3.5" rx="5.5" ry="2"/><path d="M2.5 3.5v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2"/></svg>',
  mark: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.5l1.8 4.7L14.5 8l-4.7 1.8L8 14.5 6.2 9.8 1.5 8l4.7-1.8z"/></svg>',
  myday: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>',
  hoshin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><circle cx="8" cy="8" r="3.5"/><circle cx="8" cy="8" r="0.8" fill="currentColor"/></svg>',
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3v10M3 8h10"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
  bell: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2a4 4 0 0 0-4 4c0 3-1.5 4.5-1.5 4.5h11S12 10.5 12 6a4 4 0 0 0-4-4zM6.5 13a1.5 1.5 0 0 0 3 0"/></svg>',
  arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  caret: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3.5L10.5 8 6 12.5"/></svg>',
  up: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 13V3M4 7l4-4 4 4"/></svg>',
};

const NAV = [
  { id: 'overview', label: 'Overview', icon: 'overview', flag: true },
  { id: 'kpi', label: 'KPI Boards', icon: 'kpi' },
  { id: 'hoshin', label: 'Hoshin', icon: 'hoshin' },
  { id: 'solve', label: 'Problem-Solving', icon: 'solve' },
  { id: 'sop', label: 'Standard Work', icon: 'sop' },
  { id: 'sources', label: 'Sources', icon: 'sources' },
  { id: 'mark', label: 'Ask Mark', icon: 'mark' },
  { id: 'myday', label: 'My Day', icon: 'myday', section: 'L1 Preview — Service' },
];

const state = { view: 'overview', loc: 'we', kzOpen: 'tracker', openRows: {}, step: 4 };

/* Deep-link support: #view=kpi&loc=houston&rows=otp,houston-5&kz=346&sop=1&step=6 */
(function initFromHash() {
  const h = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (h.get('view')) state.view = h.get('view');
  if (h.get('loc')) state.loc = h.get('loc');
  if (h.get('kz')) state.kzOpen = 'kz346';
  if (h.get('sop')) state.sopOpen = true;
  if (h.get('step')) state.step = +h.get('step');
  if (h.get('chart')) state.chartKpi = h.get('chart');
  if (h.get('respond')) state.markModal = true;
  (h.get('rows') || '').split(',').filter(Boolean).forEach(r => { state.openRows[r] = true; });
})();

function statusBadge(s, txt) {
  const map = { green: ['green', 'On Track'], amber: ['amber', 'At Risk'], red: ['red', 'Off Track'], nodata: ['outline', 'No Data'] };
  const [cls, label] = map[s] || map.nodata;
  const dot = s === 'nodata' ? '' : '<span class="dot"></span>';
  return `<span class="badge badge--${cls === 'outline' ? 'outline' : cls}">${dot}${txt || label}</span>`;
}
function statusCell(s, txt) {
  return `<span class="status-cell status-cell--${s}"><span class="dot"></span>${txt}</span>`;
}
function pct(v, d = 1) { return v == null ? '—' : (v * 100).toFixed(d) + '%'; }

/* ═══ Shell ═══ */
function renderShell() {
  const navHtml = NAV.map(n => `
    ${n.section ? `<div class="running-head" style="padding:16px 8px 8px">${n.section}</div>` : ''}
    <button class="nav-item ${state.view === n.id ? 'is-active' : ''}" data-nav="${n.id}">
      ${ICONS[n.icon]}${n.label}${n.flag ? '<span class="nav-flag" title="1 KPI needs attention"></span>' : ''}
    </button>`).join('');

  const isL1 = state.view === 'myday';
  document.getElementById('app').innerHTML = `
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
        <div class="dept-block__name">${isL1 ? DATA.myDay.dept : 'Operations'}</div>
        <div class="dept-block__meta">
          <span class="badge ${isL1 ? 'badge--info' : 'badge--neutral'}" style="font-size:10.5px">${isL1 ? 'L1' : 'L2'}</span>
          ${isL1 ? DATA.myDay.persona : DATA.dept.lead}
        </div>
      </div>
      <div class="nav">
        <span class="running-head">Boards</span>
        ${navHtml}
      </div>
      <div class="sidebar__footer">
        <div class="persona">
          <div class="persona__avatar">${isL1 ? 'D' : 'JK'}</div>
          <div>
            <div class="persona__name">${isL1 ? DATA.myDay.persona : DATA.dept.lead}</div>
            <div class="persona__role">${isL1 ? DATA.myDay.role : DATA.dept.roleLabel}</div>
          </div>
        </div>
        <button class="signout">Switch Role / Sign Out</button>
      </div>
    </nav>
    <div class="content-area">
      <header class="topbar">
        <div class="crumb"><b>${isL1 ? DATA.myDay.dept : 'Operations'}</b><span class="crumb__sep">/</span>${NAV.find(n => n.id === state.view).label}</div>
        <div class="topbar__spacer"></div>
        <button class="btn btn--outline btn--sm" id="ask-mark-btn">${ICONS.mark} Ask Mark</button>
        <div style="position:relative">
          <button class="icon-btn" id="inbox-btn" aria-label="Chief of Staff inbox">${ICONS.bell}<span class="icon-btn__count">2</span></button>
        </div>
        <div class="topbar__search">${ICONS.search}<input type="search" placeholder="Search this board" aria-label="Search this board"></div>
        <span class="rollup-tag">${ICONS.up} Rolls up to <b>Leadership OS</b></span>
      </header>
      <main class="canvas" id="canvas"></main>
    </div>
  </div>
  <div class="chart-tip" id="chart-tip"></div>`;

  document.querySelectorAll('[data-nav]').forEach(b =>
    b.addEventListener('click', () => { state.view = b.dataset.nav; renderShell(); }));
  document.getElementById('inbox-btn').addEventListener('click', toggleInbox);
  document.getElementById('ask-mark-btn').addEventListener('click', () => { state.view = 'mark'; renderShell(); });

  const canvas = document.getElementById('canvas');
  VIEWS[state.view](canvas);
  wireChartHover(canvas, document.getElementById('chart-tip'));
}

/* ═══ Chief of Staff inbox popover ═══ */
function toggleInbox() {
  const existing = document.getElementById('inbox-panel');
  if (existing) { existing.remove(); return; }
  const host = document.getElementById('inbox-btn').parentElement;
  const panel = document.createElement('div');
  panel.id = 'inbox-panel';
  panel.className = 'popover inbox-panel';
  panel.innerHTML = `
    <div class="inbox-panel__head">
      <div class="inbox-panel__title">Leadership OS · Chief of Staff</div>
      <div class="inbox-panel__sub">Requests context from Operations</div>
    </div>
    <button class="inbox-item inbox-item--link" data-inbox-go="solve"><span class="inbox-item__dot"></span><div>
      <div class="inbox-item__body">Confirm the root cause on your red headline KPI before the Monday roll-up review.</div>
      <div class="inbox-item__from">Chief of Staff · due Mon 9:00 · opens Problem-Solving</div></div></button>
    <button class="inbox-item inbox-item--link" data-inbox-go="sop"><span class="inbox-item__dot"></span><div>
      <div class="inbox-item__body">Attach the governing standard work for this week's countermeasure.</div>
      <div class="inbox-item__from">Chief of Staff · this week · opens Standard Work</div></div></button>`;
  host.appendChild(panel);
  panel.querySelectorAll('[data-inbox-go]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    state.view = b.dataset.inboxGo;
    if (state.view === 'solve') { state.kzOpen = 'kz346'; state.step = 4; }
    if (state.view === 'sop') state.sopOpen = true;
    panel.remove();
    renderShell();
  }));
  setTimeout(() => {
    const close = e => { if (!panel.contains(e.target)) { panel.remove(); document.removeEventListener('click', close); } };
    document.addEventListener('click', close);
  }, 0);
}

const VIEWS = {};

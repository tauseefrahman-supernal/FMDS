/* ═══ Hoshin — WE 2026 objectives + Operations activity plans ═══ */

function hoshinDisk(n, mode, size) {
  const s = size || 30;
  const cls = mode === 'drives' ? 'hoshin-disk--drives' : mode === 'supports' ? 'hoshin-disk--supports' : '';
  return `<span class="hoshin-disk ${cls}" style="width:${s}px;height:${s}px;font-size:${Math.round(s * 0.42)}px">${n}</span>`;
}

/* Compact alignment strip used on KPI Boards */
function hoshinStrip() {
  const H = DATA.hoshin;
  const disks = H.objectives.map(o => `
    <span class="hoshin-strip__item ${o.ops ? '' : 'is-dim'}" title="${o.name} — ${o.ops ? (o.ops === 'drives' ? 'Operations drives this' : 'Operations supports this') : 'not an Operations Hoshin'}">
      ${hoshinDisk(o.n, o.ops, 26)}
    </span>`).join('');
  return `
  <section class="card hoshin-strip" role="button" tabindex="0" data-go-hoshin aria-label="Open the Operations Hoshin view">
    <div class="hoshin-strip__disks">${disks}</div>
    <div class="hoshin-strip__text">
      <b>This board drives Hoshin 2 · Financial Performance and 4 · Organizational Development</b>
      <span class="muted">OTP, PPLH and Materials roll into the labor-efficiency, material and indirect-labor activity plans. Operations also supports 5 · New Customer Acquisition.</span>
    </div>
    <span class="btn btn--outline btn--sm" style="pointer-events:none">Open Hoshin View ${ICONS.arrow}</span>
  </section>`;
}

function hoshinChips(kpiId) {
  const maps = DATA.hoshin.kpiMap[kpiId];
  if (!maps) return '';
  return maps.map(n => `<span class="hoshin-chip" title="Rolls into Hoshin ${n} — ${DATA.hoshin.objectives[n - 1].name}">H${n}</span>`).join('');
}

VIEWS.hoshin = function (el) {
  const H = DATA.hoshin;
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  const objectiveCards = H.objectives.map(o => `
    <section class="card card--pad hoshin-obj ${o.ops ? 'hoshin-obj--ops' : ''}">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px">
        ${hoshinDisk(o.n, o.ops, 32)}
        <h4 style="flex:1">${o.name}</h4>
        ${o.ops ? `<span class="badge ${o.ops === 'drives' ? 'badge--info' : 'badge--neutral'}">${o.ops === 'drives' ? 'Ops drives' : 'Ops supports'}</span>` : ''}
      </div>
      <p style="margin:0; font-size:12.5px; line-height:1.55; color:var(--text-dim)">${o.oneYear}</p>
    </section>`).join('');

  const activityBlocks = H.activities.map((a, i) => {
    const timeline = quarters.map(q => {
      const active = a.targets.some(t => t.due.includes(q)) || a.targets.some(t => t.due === 'FY26');
      return `<span class="q-chip ${active ? 'is-on' : ''}">${q}</span>`;
    }).join('');
    return `
    <section class="card" style="margin-bottom:16px">
      <div class="hoshin-act__head">
        <div style="display:flex; gap:6px">${a.maps.map(n => hoshinDisk(n, 'drives', 24)).join('')}</div>
        <div style="flex:1; min-width:0">
          <h3>${a.plan}</h3>
          <span class="faint" style="font-size:12px">Hoshin priority: ${a.priority}</span>
        </div>
        <div class="hoshin-act__lead">
          <span class="running-head">Lead</span>
          <b>${a.lead}</b>
        </div>
        <div class="hoshin-act__timeline">${timeline}</div>
      </div>
      <div class="table-scroll">
        <table class="dt">
          <thead><tr>
            <th style="min-width:340px">Target · Milestone</th><th>Support function</th><th>Accountable</th><th>Due</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${a.targets.map(t => `<tr>
              <td>${t.text}</td>
              <td><span class="chip">${t.support}</span></td>
              <td class="muted">${t.owner}</td>
              <td class="muted tnum" style="white-space:nowrap">${t.due}</td>
              <td><span class="status-cell status-cell--green"><span class="dot"></span>On Plan</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${a.kpis.length ? `<div class="hoshin-act__foot">Measured on this board by ${a.kpis.map(k => `<b>${(DATA.kpis[k] || { name: k.toUpperCase() }).name}</b>`).join(' · ')}</div>` : ''}
    </section>`;
  }).join('');

  el.innerHTML = `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">WE 2026 Hoshin · Functional Lead: ${H.deptLead}</span>
      <h1>Operations Hoshin</h1>
      <p class="page-head__sub">Company objectives, the Operations activity plans that move them, and the accountable lead behind every target.</p>
    </div>
    <div class="page-head__side">
      <button class="btn btn--secondary" data-go="kpi">KPI Boards</button>
    </div>
  </div>

  <div class="section-head" style="margin-top:0"><span class="running-head">1-year Hoshin priorities (2026) — company-wide</span></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">${objectiveCards}</div>

  <div class="section-head"><span class="running-head">Operations activity plans — every target tracked to an owner</span></div>
  ${activityBlocks}

  <section class="card card--pad" style="border-left:3px solid hsl(var(--we-sky))">
    <span class="running-head">Support functions</span>
    <p style="margin:8px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${H.supportNote}</p>
  </section>`;

  el.querySelector('[data-go]').addEventListener('click', () => { state.view = 'kpi'; renderShell(); });
};

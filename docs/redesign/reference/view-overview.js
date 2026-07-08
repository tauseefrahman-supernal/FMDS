/* ═══ Overview — role-scoped red/green summary with grounded AI read ═══ */
VIEWS.overview = function (el) {
  const otp = DATA.kpis.otp, pplh = DATA.kpis.pplh, mat = DATA.kpis.materials;
  const wkLabels = DATA.weeks.map(w => 'Wk ' + w);

  el.innerHTML = `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">Operations · Team Board</span>
      <h1>Overview</h1>
      <p class="page-head__sub">L2 · Jim Kozel · 1 KPI needs attention</p>
    </div>
    <div class="page-head__side">
      <button class="btn btn--secondary" data-go="sources">Sources</button>
      <button class="btn btn--primary" data-go="kpi">Open KPI Boards ${ICONS.arrow}</button>
    </div>
  </div>

  <div class="section-head" style="margin-top:0"><span class="running-head">Needs attention</span></div>
  <section class="card hero-kpi" aria-label="OTP headline KPI">
    <div class="hero-kpi__main">
      <div class="hero-kpi__label">
        <h3>${otp.name}</h3>
        ${statusBadge('red')}
      </div>
      <div class="hero-kpi__value">86.3<small>%</small></div>
      <div class="hero-kpi__vs">vs target <b>98.5%</b> · Mechanism B — main entered independently</div>
      <div style="flex:1; display:flex; align-items:center; min-height:80px">
        ${sparkline(otp.series, { w: 380, h: 88, target: otp.target, name: 'OTP weekly, weeks 1–13', labels: otp.series.map((_, i) => 'Wk ' + (i + 1)), fmt: 'ratio' }).replace('<svg class="spark"', '<svg class="spark" style="width:100%;height:auto"')}
      </div>
      <div class="hero-kpi__foot">
        <span class="source-note">COO Board · target from WPS</span>
        <button class="btn btn--ghost btn--sm" data-go="kpi">Open in KPI Boards ${ICONS.arrow}</button>
      </div>
    </div>
    <div class="hero-kpi__side">
      <div class="ai-note">
        <div class="ai-note__avatar">M</div>
        <div class="ai-note__body">
          <div class="ai-note__head"><b>Mark</b><span class="muted">AI Employee</span><span class="running-head" style="color:var(--accent-text)">What's driving this</span></div>
          <div class="ai-note__text">
            <p>${DATA.kpis.otp.story.text}</p>
            <p>${DATA.kpis.otp.story.text2}</p>
          </div>
        </div>
      </div>
      <div class="ai-note">
        <div class="ai-note__avatar">M</div>
        <div class="ai-note__body">
          <div class="ai-note__head"><b>Mark</b><span class="when">Jul 3</span></div>
          <div class="ai-note__text">
            <p>Picked this up from last T3 (Jim + Ops) — Mexico was flagged as the driver. I've pre-drafted an 8-step on the Mexico OTP sub-KPI (steps 1–6 seeded from KZ-346, the $40K short-code event) so the team starts at ~70%. It's waiting in Problem-Solving.</p>
          </div>
          <div style="margin-top:8px"><button class="btn btn--outline btn--sm" data-go-kz>Review Draft 8-Step</button></div>
        </div>
      </div>
    </div>
  </section>

  <div class="section-head"><span class="running-head">On track</span></div>
  <div class="stat-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))">
    ${[pplh, mat].map(k => `
      <section class="card stat-tile">
        <div class="stat-tile__top">
          <span class="stat-tile__label">${k.name}</span>
          ${statusBadge('green')}
        </div>
        <div class="stat-tile__value">${k.unit === 'ratio' ? pct(k.actual) : k.actual}<small>${k.unit === 'ratio' ? '' : k.unit}</small></div>
        <div class="stat-tile__vs">vs target ${k.unit === 'ratio' ? pct(k.target) : k.target} · ${k.direction === 'lower_better' ? 'lower is better' : 'higher is better'}</div>
        <div class="stat-tile__spark">${sparkline(k.series, { w: 280, h: 40, target: k.target, name: k.name, labels: k.series.map((_, i) => 'Wk ' + (i + 1)), fmt: k.unit })}</div>
        <div class="hero-kpi__foot" style="padding-top:8px">
          <span class="source-note">${k.source}</span>
          <button class="btn btn--ghost btn--sm" data-go="kpi">Open in KPI Boards ${ICONS.arrow}</button>
        </div>
      </section>`).join('')}
  </div>

  <p class="board-hint"><b>Overview</b> shows department main KPIs by status. Red and amber cards include Mark's grounded explanation. Use <b>KPI Boards</b> for the full level-by-level breakdown with trends and operator contributions.</p>`;

  el.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { state.view = b.dataset.go; renderShell(); }));
  const kzBtn = el.querySelector('[data-go-kz]');
  if (kzBtn) kzBtn.addEventListener('click', () => { state.view = 'solve'; state.kzOpen = 'kz346'; state.step = 4; renderShell(); });
};

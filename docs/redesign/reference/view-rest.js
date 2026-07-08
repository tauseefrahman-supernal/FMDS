/* ═══ Standard Work ═══ */
VIEWS.sop = function (el) {
  if (state.sopOpen) return renderSopDetail(el);
  const rows = DATA.sops.docs.map(d => `
    <tr>
      <td><span class="doc-type">${d.type}</span></td>
      <td>${d.name}${d.rep ? ' <span class="badge badge--amber" style="font-size:10px">representative</span>' : ''}</td>
      <td class="muted">${d.area}${d.tag ? `<div class="faint" style="font-size:11.5px">${d.tag}</div>` : ''}</td>
      <td class="muted">${d.owner || '—'}</td>
      <td><span class="chip">${d.lang}</span></td>
      <td>${d.link === 'inapp'
        ? '<button class="btn btn--outline btn--sm" data-open-sop>Open In-App</button>'
        : '<span class="badge badge--outline">link pending</span>'}</td>
    </tr>`).join('');

  el.innerHTML = `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">Operations · Document Library</span>
      <h1>Standard Work</h1>
      <p class="page-head__sub">Per-department document library, SharePoint-linked. Embedded SOPs open in-app.</p>
    </div>
    <div class="page-head__side">
      <input class="input" style="width:220px" type="search" placeholder="Search documents" aria-label="Search documents">
    </div>
  </div>

  <div class="doc-counts" style="margin-bottom:24px">
    ${DATA.sops.counts.map(c => `<span class="count-pill"><b>${c.n}</b>${c.label}</span>`).join('')}
    <span style="flex:1"></span>
    ${DATA.sops.collections.map(c => `<span class="badge badge--neutral">${c}</span>`).join(' ')}
  </div>

  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr><th>Type</th><th style="min-width:320px">Document</th><th>Area / Product</th><th>Owner</th><th>Lang</th><th>Link</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div></div>

  <div class="section-head"><span class="running-head">SOPs available in-app</span></div>
  <section class="card card--pad sop-feature card--interactive" data-open-sop role="button" tabindex="0">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
      <span class="doc-type">BWI</span>
      <span class="badge badge--green">Full content in-app</span>
      <span style="margin-left:auto" class="faint">${ICONS.arrow}</span>
    </div>
    <h3>${DATA.sops.feature.name}</h3>
    <p style="margin:8px 0; font-size:13.5px; color:var(--text-secondary); max-width:100ch">${DATA.sops.feature.purpose}</p>
    <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap">
      <span class="source-note">${DATA.sops.feature.meta}</span>
      <span class="badge badge--info"><span class="dot"></span>Updated by ${DATA.sops.feature.updatedBy}</span>
    </div>
  </section>

  <p class="board-hint"><b>representative</b> = inferred from aggregate counts only — exact title not enumerated in the discovery. <b>link pending</b> = doc confirmed in SharePoint; deep-link not yet mapped.</p>`;

  el.querySelectorAll('[data-open-sop]').forEach(b => b.addEventListener('click', () => { state.sopOpen = true; VIEWS.sop(el); }));
};

function renderSopDetail(el) {
  const S = SOP_DETAIL;
  el.innerHTML = `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">Standard Work · ${S.docType} · Rev 01 · 2026-07-01</span>
      <h1 style="font-size:24px; max-width:30ch">${S.title}</h1>
    </div>
    <div class="page-head__side"><button class="btn btn--secondary" data-back>Back to Library</button></div>
  </div>

  <section class="card card--pad" style="margin-bottom:24px">
    <span class="running-head">Purpose</span>
    <p style="margin:8px 0 16px; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${S.purpose}</p>
    <span class="running-head">Scope</span>
    <p style="margin:8px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${S.scope}</p>
  </section>

  <div class="section-head"><span class="running-head">Standard work steps</span></div>
  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr><th style="width:36px">#</th><th style="min-width:220px">Main step</th><th style="min-width:280px">Key points</th><th style="min-width:280px">Reason / why it matters</th></tr></thead>
      <tbody>
        ${S.steps.map(st => `<tr>
          <td class="tnum">${st.n}</td>
          <td>${st.mainStep}</td>
          <td style="font-weight:400; color:var(--text-secondary)">${st.keyPoints}</td>
          <td style="font-weight:400; color:var(--text-dim)">${st.reason}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div></div>

  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); margin-top:24px">
    <section class="card card--pad">
      <span class="running-head">8-step backlinks</span>
      <p style="margin:10px 0 0; font-size:13.5px"><span class="mono muted">KZ-346</span> · Pricing Credit Memos (Galls Color) · Step 8 — Standardize</p>
      <p style="margin:6px 0 0; font-size:12.5px; color:var(--text-faint)">Linked forms: ${S.linkedForms.join(' · ')}</p>
    </section>
    <section class="card card--pad">
      <span class="running-head">Revision log</span>
      ${S.revisions.map(r => `<p style="margin:10px 0 0; font-size:13px"><b class="tnum">${r.date}</b> · Rev ${r.revision} — <span class="muted">${r.description}</span></p>`).join('')}
    </section>
  </div>`;
  el.querySelector('[data-back]').addEventListener('click', () => { state.sopOpen = false; VIEWS.sop(el); });
}

/* ═══ Sources ═══ */
VIEWS.sources = function (el) {
  const S = DATA.sources;
  el.innerHTML = `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">Operations · Data Lineage</span>
      <h1>Sourcing Plan</h1>
      <p class="page-head__sub">Where each number comes from. The number is sourced — not re-keyed.</p>
    </div>
    <div class="page-head__side"><button class="btn btn--secondary" data-go="kpi">KPI Boards</button></div>
  </div>

  <section class="card card--pad" style="display:flex; align-items:center; gap:20px; flex-wrap:wrap; margin-bottom:16px">
    <span class="running-head">Target source systems</span>
    <span class="badge badge--neutral">WPS</span>
    <span class="badge badge--neutral">Business Central</span>
    <span class="muted" style="font-size:13px; margin-left:auto">${S.summary}</span>
  </section>

  <section class="card card--pad" style="border-left:3px solid var(--amber); margin-bottom:32px">
    <b style="font-size:13.5px; color:var(--amber-text)">Double-entry being eliminated.</b>
    <span style="font-size:13.5px; color:var(--text-secondary)"> ${S.banner}</span>
  </section>

  <div class="section-head"><span class="running-head">By source system</span></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
    ${S.systems.map(sys => `
      <section class="card">
        <div style="display:flex; align-items:baseline; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--border-soft)">
          <h3>${sys.name}</h3><span class="muted" style="font-size:12.5px">${sys.kpis} KPIs</span>
        </div>
        <div style="padding:12px 24px 16px">
          ${sys.items.map(it => {
            const sourced = S.alreadySourced.includes(it);
            return `<div style="display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--border-soft); font-size:13px">
              <span style="flex:1; min-width:0">${it}</span>
              ${sourced
                ? '<span class="badge badge--green"><span class="dot"></span>direct pull</span>'
                : '<span class="badge badge--amber"><span class="dot"></span>re-keyed today</span>'}
            </div>`;
          }).join('')}
        </div>
      </section>`).join('')}
  </div>

  <div class="section-head"><span class="running-head">Target data flow — single entry point</span></div>
  <section class="flow">
    ${S.flow.map((n, i) => `
      ${i > 0 ? `<span class="flow__arrow">${ICONS.arrow}</span>` : ''}
      <div class="flow__node ${i === 1 ? 'flow__node--accent' : ''}">
        <h4>${n.title}</h4><p>${n.sub}</p>
      </div>`).join('')}
  </section>
  <p class="board-hint">${S.flowNote}</p>`;
  el.querySelector('[data-go]').addEventListener('click', () => { state.view = 'kpi'; renderShell(); });
};

/* ═══ Ask Mark — chat-first workspace with response popup ═══ */
VIEWS.mark = function (el) {
  const M = DATA.askMark;
  const q = M.queue[0];
  if (!state.markThreads) {
    state.markThreads = [{ title: 'Why is OTP (On-Time %) red?', when: 'Jul 8', msgs: M.chat.slice() }];
    state.markActive = 0;
  }
  const active = state.markThreads[state.markActive];
  const lifecycle = M.lifecycle.map((st, i) => {
    const cls = i < M.lifecycleAt ? 'is-done' : i === M.lifecycleAt ? 'is-now' : '';
    return `<span class="life-chip ${cls}">${i < M.lifecycleAt ? '✓ ' : ''}${st}</span>`;
  }).join('<span class="faint" style="padding:0 2px">›</span>');

  const responseModal = !state.markModal ? '' : `
  <div class="modal-overlay" data-modal-close></div>
  <div class="modal-panel" role="dialog" aria-modal="true" aria-label="Response card — ${q.kpi}">
    <div class="modal-panel__head">
      <div>
        <h3>${q.kpi}</h3>
        <span class="faint" style="font-size:12px">${q.actual} vs ${q.target} · Due ${q.due} · Owner ${q.owner}</span>
      </div>
      <div style="display:flex; align-items:center; gap:10px">
        <span class="badge badge--green">✓ Response submitted · ${q.owner}</span>
        <button class="icon-btn" data-modal-close aria-label="Close response card">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>
        </button>
      </div>
    </div>
    <div class="modal-panel__body">
      ${stepChart(DATA.kpis.otp.weekly.we, { w: 720, h: 120, target: 0.985, xLabels: DATA.weeks.map(w => 'Wk ' + w), label: 'WE OTP weekly vs target' })}
      <div class="chart-fig__cap" style="margin:2px 0 20px">WE Main weekly OTP vs the 98.5% target, weeks 15–23 — the number this response answers for.</div>
      <span class="running-head">Response lifecycle</span>
      <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin:8px 0 20px">${lifecycle}</div>
      <div class="field-list">
        <div class="field"><span class="field__label">What's driving the red?</span><span class="field__value">${M.response.cause}</span></div>
        <div class="field"><span class="field__label">What are you doing about it?</span><span class="field__value">${M.response.action}</span></div>
        <div class="field" style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
          <span><span class="field__label">Needs an 8-step?</span><br><span class="field__value">${M.response.eightStep}</span></span>
          <span><span class="field__label">Report back</span><br><span class="field__value">${M.response.reportBack}</span></span>
        </div>
      </div>
    </div>
    <div class="modal-panel__foot">
      <button class="btn btn--secondary" data-modal-close>Close</button>
      <button class="btn btn--primary">Edit Response</button>
    </div>
  </div>`;

  el.innerHTML = `
  <div class="page-head">
    <div style="display:flex; gap:16px; align-items:center">
      <div class="ai-note__avatar" style="width:44px; height:44px; font-size:18px">M</div>
      <div>
        <h1 style="font-size:24px">Mark</h1>
        <p class="page-head__sub" style="margin-top:2px">AI Employee · Operations · ${M.subline}</p>
      </div>
    </div>
    <div class="page-head__side">
      <span class="badge badge--red"><span class="dot"></span>${M.pills.actionRequired} action required</span>
      <span class="badge badge--amber"><span class="dot"></span>${M.pills.beingActioned} being actioned</span>
      <button class="btn btn--primary" id="new-chat">${ICONS.plus} New Chat</button>
    </div>
  </div>

  <div class="chat" style="grid-template-columns: minmax(260px, 34fr) 66fr">
    <div>
      <div class="section-head" style="margin-top:0">
        <span class="running-head">Needs response</span>
        <span class="badge badge--neutral" style="font-size:10.5px">1</span>
      </div>
      <button class="q-card" data-open-response aria-haspopup="dialog">
        <div class="q-card__row">
          <span class="status-cell status-cell--red"><span class="dot"></span>${q.kpi}</span>
          ${q.answered ? '<span class="badge badge--green" style="font-size:10.5px">✓ Answered</span>' : '<span class="badge badge--red" style="font-size:10.5px">Respond</span>'}
        </div>
        <div class="q-card__row" style="align-items:flex-end">
          <span class="q-card__value tnum">${q.actual} <small>vs ${q.target}</small></span>
          ${sparkline(DATA.kpis.otp.series, { w: 96, h: 28, target: DATA.kpis.otp.target, name: 'OTP trend', labels: DATA.kpis.otp.series.map((_, i) => 'Wk ' + (i + 1)), fmt: 'ratio', color: VIZ.rust, soft: VIZ.rustSoft })}
        </div>
        <div class="q-card__meta">Due ${q.due} · Owner ${q.owner} · <b style="color:var(--accent-text)">Open response card</b></div>
      </button>

      <div class="section-head"><span class="running-head">Recent threads</span></div>
      <div style="display:grid; gap:8px">
        ${state.markThreads.map((t, i) => `
          <button class="thread-item ${i === state.markActive ? 'is-active' : ''}" data-thread="${i}">
            <span class="thread-item__title">${t.title}</span>
            <span class="thread-item__meta">${t.when} · ${t.msgs.length} message${t.msgs.length === 1 ? '' : 's'}</span>
          </button>`).join('')}
      </div>
    </div>

    <section class="card chat-surface">
      <div class="chat-surface__head">
        <span class="running-head">Thread</span>
        <b style="font-size:13px">${active.title}</b>
      </div>
      <div class="chat__thread chat-surface__scroll" id="mark-thread">
        ${renderMarkThread(active.msgs)}
      </div>
      <div class="chat__composer" style="padding: 12px 20px 20px; margin:0">
        <textarea class="input" rows="2" id="mark-input" placeholder="${M.composerPlaceholder}" aria-label="${M.composerPlaceholder}"></textarea>
        <button class="btn btn--primary" id="mark-send" style="align-self:flex-end">Send</button>
      </div>
    </section>
  </div>
  ${responseModal}`;

  /* Queue card → response popup */
  const openBtn = el.querySelector('[data-open-response]');
  openBtn.addEventListener('click', () => { state.markModal = true; VIEWS.mark(el); });
  el.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', () => { state.markModal = false; VIEWS.mark(el); }));
  if (state.markModal) {
    const onKey = e => { if (e.key === 'Escape') { state.markModal = false; document.removeEventListener('keydown', onKey); VIEWS.mark(el); } };
    document.addEventListener('keydown', onKey);
  }

  /* Threads */
  el.querySelectorAll('[data-thread]').forEach(b => b.addEventListener('click', () => {
    state.markActive = +b.dataset.thread; VIEWS.mark(el);
  }));
  el.querySelector('#new-chat').addEventListener('click', () => {
    state.markThreads.unshift({
      title: 'New thread', when: 'Today',
      msgs: [{ from: 'mark', text: "New thread. Ask me about any KPI on this board — I reason over the live numbers and the T2/T3 meeting record. Where do you want to start?" }],
    });
    state.markActive = 0;
    VIEWS.mark(el);
    el.querySelector('#mark-input').focus();
  });

  /* Composer */
  const input = el.querySelector('#mark-input'), send = el.querySelector('#mark-send');
  const submit = () => {
    const text = input.value.trim();
    if (!text) return;
    const t = state.markThreads[state.markActive];
    if (t.title === 'New thread') t.title = text.length > 42 ? text.slice(0, 42) + '…' : text;
    t.msgs.push({ from: 'user', text });
    t.msgs.push({ from: 'mark', text: "From the live trail: WE OTP sits at 86.3% vs 98.5% with Mexico as the drag (75.0%, sample-surge denominator). The response is logged and the countermeasure runs through KZ-346 — BWI updated, training in flight, WMS short-code check due Mar 10. I report the next movement at the T3 review." });
    VIEWS.mark(el);
    const scroller = el.querySelector('#mark-thread'); if (scroller) scroller.scrollTop = scroller.scrollHeight;
    el.querySelector('#mark-input').focus();
  };
  send.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
};

function renderMarkThread(msgs) {
  return msgs.map(m => m.from === 'user'
    ? `<div class="msg msg--user"><div class="msg__bubble">${m.text}</div></div>`
    : `<div class="msg">
        <div class="ai-note__avatar">M</div>
        <div class="msg__bubble" ${m.system ? 'style="background:hsl(var(--action-1)); border-color:hsl(var(--action-3))"' : ''}>
          <p>${m.text}</p>${m.text2 ? `<p>${m.text2}</p>` : ''}
        </div>
      </div>`).join('');
}

/* ═══ My Day (L1) — Service rep Diane, real prototype data ═══ */
VIEWS.myday = function (el) {
  const D = DATA.myDay, H = D.headline;
  const reasons = (state.mydayReasons || (state.mydayReasons = D.reasons.slice()));

  el.innerHTML = `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">Service · L1 · Team JC</span>
      <h1>${D.greeting}</h1>
      <p class="page-head__sub">${D.subline}</p>
    </div>
  </div>

  <section class="card hero-kpi" aria-label="My headline target">
    <div class="hero-kpi__main">
      <div class="hero-kpi__label">
        <div><span class="running-head">My headline</span><h3 style="margin-top:4px">${H.name}</h3></div>
        ${statusBadge('green')}
      </div>
      <div class="hero-kpi__value">$116<small>,430</small></div>
      <div class="hero-kpi__vs">vs target <b>$26,960 / wk</b> · rolls up to Team JC → Incoming Rev WE</div>
      <div class="hero-kpi__foot">
        <span class="source-note">HubSpot · weekly actuals, weeks 1–8</span>
      </div>
    </div>
    <div class="hero-kpi__side" style="display:flex; flex-direction:column; gap:12px">
      <span class="running-head">8-week trend</span>
      ${sparkline(H.series, { w: 560, h: 120, target: H.target, name: 'Diane weekly Incoming Rev WEI', labels: H.weeks, fmt: '$/wk' }).replace('<svg class="spark"', '<svg class="spark" style="width:100%;height:auto"')}
      <span class="faint" style="font-size:12px">${D.footnote}</span>
    </div>
  </section>

  <section class="card card--pad" style="margin-top:16px; border-left:3px solid var(--amber); display:flex; gap:8px; align-items:baseline">
    <b style="font-size:13px; color:var(--amber-text); white-space:nowrap">Data flag</b>
    <span style="font-size:13.5px; color:var(--text-secondary)">${D.banner}</span>
  </section>

  <div class="section-head"><span class="running-head">My activity drivers</span></div>
  <div class="driver-grid">
    ${D.drivers.map(d => `
      <section class="card stat-tile" style="padding:16px">
        <div class="stat-tile__top">
          <span class="stat-tile__label">${d.name}</span>
          ${d.status === 'green' ? statusBadge('green') : '<span class="badge badge--outline">No Data</span>'}
        </div>
        <div class="stat-tile__value">${d.unit === '$' ? '$' + (d.value / 1000) + 'k' : d.value}</div>
        <div class="stat-tile__vs">Target ${d.target == null ? '—' : d.target}</div>
        <div class="stat-tile__spark">${sparkline(d.series, { w: 200, h: 32, target: d.target, name: d.name + ' trend', labels: d.series.map((_, i) => 'Day ' + (i + 1)), fmt: 'raw' })}</div>
      </section>`).join('')}
  </div>

  <div class="section-head"><span class="running-head">This week's context</span></div>
  <div class="chat" style="grid-template-columns: 3fr 2fr">
    <section class="card card--pad">
      <h4 style="margin-bottom:12px">Log a reason for this week's numbers</h4>
      <div class="field-list">
        <textarea class="input" id="reason-input" rows="3" placeholder="e.g. 3 quotes short — 2 accounts rescheduled to Thu"></textarea>
        <div style="display:flex; justify-content:flex-end"><button class="btn btn--primary" id="reason-save">Save Reason</button></div>
      </div>
    </section>
    <section class="card card--pad" id="week-context">
      <span class="running-head">Logged reasons</span>
      <div id="reason-list" style="margin-top:12px; display:grid; gap:12px">
        ${reasons.map(r => reasonEntry(r)).join('')}
      </div>
    </section>
  </div>`;

  el.querySelector('#reason-save').addEventListener('click', () => {
    const t = el.querySelector('#reason-input').value.trim();
    if (!t) return;
    reasons.unshift({ author: D.persona, status: 'amber', text: t });
    VIEWS.myday(el);
    wireChartHover(el, document.getElementById('chart-tip'));
  });
};

function reasonEntry(r) {
  const tone = r.status === 'red' ? 'red' : r.status === 'amber' ? 'amber' : 'green';
  return `<div style="display:flex; gap:10px">
    <span class="status-cell status-cell--${tone}" style="margin-top:2px"><span class="dot"></span></span>
    <div>
      <div style="font-size:13px; line-height:1.55; color:var(--text-secondary)">${r.text}</div>
      <div class="faint" style="font-size:11.5px; margin-top:2px">${r.author} · this week</div>
    </div>
  </div>`;
}

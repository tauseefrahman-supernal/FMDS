/**
 * lib/agent.js — Agent panel: canned context-grounded replies + stub live relay
 *
 * Exports:
 *   bakedReply(deptId, intent, ctx) → string
 *   liveReply(deptId, intent, ctx)  → string  (Phase 5b: calls Claude; falls back to baked)
 *
 * Intents:
 *   'explain-red'  — why a KPI is red (context-grounded per dept)
 *   'draft-step'   — first-pass draft for an 8-step step (uses ctx.step, ctx.kpi)
 *   'find-sop'     — relevant SOP/BWI for the current KPI/department
 */

// ─── Context corpus ─────────────────────────────────────────────────────────

const DEPT_CONTEXT = {
  operations: {
    headline: 'OTP (On-Time %)',
    redStory: `WE OTP is red (0.863 Mar vs 0.985 target) primarily because Mexico is dragging the main.
Mexico ran 0.39–0.55 on weekly OTP from ~week 15 onward. Two compounding factors:
1. Denominator inflation — a Galls color program surge (1,917-sample backlog) was included in the OTP denominator, making the percentage look worse than absolute pieces alone would suggest.
2. Standard-work gap — the $40K short-code breakage on the Galls color remake run (KZ-346) produced preventable credits and further inflated the denominator.
Houston (0.977) and Norcross (0.955) remain near target. Canada (0.926) is amber.
Jim Kozel's open question: which part of the standard work broke? (See BWI: Short-Code Order Entry — operations-shortcode SOP.)`,
    sopId: 'operations-shortcode',
    sopTitle: 'Short-Code Order Entry — Standard Work for Remake Jobs',
    redKpi: 'OTP',
    redActual: 0.863,
    redTarget: 0.985,
  },
  finance: {
    headline: 'Cash Conversion',
    redStory: `Finance is currently frozen (Phase 2 — NetSuite sunset + restructure in progress).
The three active 8-step items address AR/billing discrepancies:
KZ-327 (AR Billing, P. Fernandez — closed), KZ-339 (Credit & Rebill, A. Gonzalez — closed),
KZ-340 (AR 8-Step, J. Kozel — 1/8 steps done, early stage).
The root cause pattern across both closed items: order-entry or onboarding errors producing credits.
No current headline KPI is live — await Phase 2 NetSuite data migration.`,
    sopId: null,
    sopTitle: null,
    redKpi: 'AR Discrepancies',
    redActual: null,
    redTarget: 0,
  },
  sales: {
    headline: 'Incoming Rev WE Outside',
    redStory: `Sales board-of-record target is $45,869/wk (live COO board cell BY/row25).
Weekly revenue is volatile — the 8-week series shows swings from $26K to $465K.
KZ-328 (Sales Approval, T. Morando) addresses the root cause: no standardized
new-account onboarding checklist → preventable order-entry errors → $95,163 in
December credits. Countermeasures (weekly cross-functional onboarding call,
standardized checklist, CRM logging) are in progress but behind (R-status).
KZ-303 (HP Quote-to-Order, Alison Diaco) tracks the Hero's Pride shortfall:
Sep gap $80,859 from lack of a quote-to-order follow-up process.`,
    sopId: 'service-prospecting',
    sopTitle: 'Prospecting & Quote Follow-Up Standard Work',
    redKpi: 'Incoming Rev WE Outside',
    redActual: 290841,
    redTarget: 45869,
  },
  hr: {
    headline: 'TRIR',
    redStory: `TRIR Feb spiked to 30.80 (target 0) — this is a real cached value and the most likely
explanation is a genuine safety-incident month, but confirm with Clarissa that it is not
a data-entry artifact. Jan was 1.03, Mar recovered to 1.20.
ADP does not expose a usable API — the agent-poke workflow pings the HR owner (Clarissa)
on Slack, validates the number, then posts to the board. Turnover (0.43%/mo vs 2.0% target)
and Satisfaction (4.42–4.61 vs 4.50 target) are within range.
No HR-specific 8-step is open in the tracker (HR tab was blank in workbook).`,
    sopId: null,
    sopTitle: null,
    redKpi: 'TRIR',
    redActual: 30.80,
    redTarget: 0,
  },
  odg: {
    headline: 'FMDS Adoption',
    redStory: `The headline gap: FMDS adoption 93.2% vs target 100%, but the sharper signal is
8-Step adoption at only 18.9% — meaning most departments are not yet running closed-loop
problem-solving to the 8-step standard. SRR (Standard Rate Review) is 8.3% overall;
Operations is the outlier at ~50%, all others near 0%.
ODG is the coaching department — Jim/Eric own the 8-step coaching cadence.
No specific ODG 8-step KZ is active; ODG tracks all other departments' KZs.`,
    sopId: null,
    sopTitle: null,
    redKpi: '8-Step Adoption',
    redActual: 0.189,
    redTarget: 1.0,
  },
  service: {
    headline: 'Incoming Rev WE',
    redStory: `Service board-of-record: Incoming Rev WE $252,661/wk (Power BI, this week actual).
Total (WE + HPI) is $289,416/wk. HPI sub-total is $36,755/wk.
Team JC is at $160,578/wk; Team Noel at $128,838/wk. CSAT WEI 4.94, HPI 4.62.
The "time-with-customer" metric is flagged — it is not directly in the board sheet;
it is sourced from Calls/Meetings counts, which can be inflated by short touchpoints.
No specific Service 8-step is active in the KZ tracker.`,
    sopId: 'service-prospecting',
    sopTitle: 'Prospecting & Quote Follow-Up Standard Work',
    redKpi: 'Incoming Rev WE',
    redActual: 252661,
    redTarget: 252661,
  },
  marketing: {
    headline: 'WEI Total Leads Revenue',
    redStory: `Marketing board is illustrative — no live actuals connected yet (Phase 7).
Lead revenue and pipeline figures are pending Carlos's data integration.
Carlos's Hermes agent is the planned automation layer for this department.`,
    sopId: null,
    sopTitle: null,
    redKpi: 'WEI Total Leads Revenue',
    redActual: null,
    redTarget: null,
  },
  it: {
    headline: 'Uptime',
    redStory: `IT board is illustrative — uptime and ticket-closure actuals not yet live (Phase 7).
IT uses lower_better direction for ticket closure time (target 240 min; illustrative actual 200 min → green).
No IT-specific 8-step is open in the tracker (IT tab was blank in workbook).`,
    sopId: null,
    sopTitle: null,
    redKpi: 'Uptime',
    redActual: null,
    redTarget: 0.998,
  },
  logistics: {
    headline: 'WE Shipping Margin',
    redStory: `Logistics board is illustrative — shipping margin actuals not yet live (Phase 7).
Logistics KZ items in Operations tracker (e.g. KZ-330 Undelivered Packages,
KZ-349 Logistics Issues Feb, KZ-359 Shipment not delivered) are classified
under Operations deptId as they originate from Gabriela Lopez / E. Wang at the plant level.`,
    sopId: null,
    sopTitle: null,
    redKpi: 'WE Shipping Margin',
    redActual: null,
    redTarget: 0.52,
  },
};

// ─── 8-step draft templates ─────────────────────────────────────────────────

const STEP_DRAFTS = {
  1: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    return `Step 1 — Clarify the Problem (draft for ${kpi})

Ultimate Goal: Achieve and sustain ${dc.headline || kpi} at or above the ${dc.redTarget != null ? dc.redTarget : 'target'} threshold consistently.

Standard: ${dc.redTarget != null ? dc.redTarget : '[enter target]'} (board-of-record target).

Current Situation: ${dc.redActual != null ? dc.redActual : '[enter actual]'} (latest period actual).

Gap = Problem: ${dc.redActual != null && dc.redTarget != null ? `Actual (${dc.redActual}) is below target (${dc.redTarget}).` : '[actual minus target — quantify the gap]'}

Chart: Trend line showing actual vs target for the past 8 weeks. (Attach to this A3.)

[Review and edit the above before confirming — these are agent-drafted first-pass values.]`;
  },

  2: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    return `Step 2 — Break Down the Problem (draft for ${kpi})

Stratify the gap by: location, time period, job type, product line, team.

${deptId === 'operations' ? `For OTP: Mexico location is the primary driver (0.39–0.55 weekly vs 0.985 target).
Norcross/Houston are near target. Breakdown: sample-type orders vs standard production orders.
Point of occurrence: Mexico plant — remake order entry (short-code routing step).` : ''}
${deptId === 'sales' ? `For Sales credits: December account-onboarding events (new customers set up without checklist).
Point of occurrence: Order-entry step when setting up a new account.` : ''}
${deptId !== 'operations' && deptId !== 'sales' ? `Identify: What (which metric sub-component), Where (which location/team/step), When (which period), Who (which owner/role).
Narrow to the single point of occurrence where the gap originates.` : ''}

Prioritized Problem at point of occurrence: [confirm after stratification]

[Review and edit before confirming.]`;
  },

  3: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    return `Step 3 — Objective (draft for ${kpi})

Do What: Increase / restore ${dc.headline || kpi} to target.

To What: ${dc.redTarget != null ? dc.redTarget : '[target value]'} (${dc.headline || kpi}).

By When: [Enter target date — recommended: end of current quarter or next review cycle].

Chart: Target line overlaid on the KPI trend — showing current gap and the improvement trajectory needed.

[Review and edit before confirming.]`;
  },

  4: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    return `Step 4 — Root Cause / 5-Whys + 6M Fishbone (draft for ${kpi})

Why 1: [Directly observable symptom — what you can see happening]
Why 2: [Why did Why 1 occur?]
Why 3: [Why did Why 2 occur?]
Why 4: [Why did Why 3 occur?]
Why 5: [Root systemic cause — the "bone" to treat]

6M Fishbone classification:
  Man      — [Is there a skill/knowledge/behavior gap?]
  Method   — [Is there a missing or unclear standard work step?]
  Machine  — [Is there a system/equipment issue?]
  Material — [Is there a material or input quality issue?]
  Environment — [Is there a workspace or external factor?]
  Measurement — [Is there a data/tracking issue?]

Root Cause (confirmed): [State the single systemic root cause supported by the 5-Whys and 6M analysis.]

${deptId === 'operations' ? `[Operations OTP hint: The T3 story points to Method — a missing/ambiguous standard work step for short-code selection on remake orders (Galls color program). Confirm by walking the actual order-entry process step by step.]` : ''}
${deptId === 'sales' ? `[Sales hint: The T3 story points to Method — no standardized new-account onboarding checklist or accountability for quote follow-up. Confirm: was there a standard and was it not followed, or was there no standard at all?]` : ''}

[Review and complete all 5-Whys before confirming.]`;
  },

  5: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    return `Step 5 — Brainstorm Countermeasures (draft for ${kpi})

Countermeasure Candidates (against the confirmed root cause):
  1. Create / update the standard work step that was missing or unclear.
  2. Train all affected staff on the updated process.
  3. Add a verification checkpoint (e.g. dual-entry check, supervisor sign-off) at the point of occurrence.
  4. Build a poka-yoke (error-proofing) into the system (e.g. dropdown validation, auto-alert).
  5. Schedule a recurring audit of the process at the point of occurrence (daily/weekly until stable).

Prioritization: [Select 1–3 countermeasures most likely to address the root cause quickly and sustainably. Mark each as Easy/Hard and Fast/Slow to implement.]

[Review and score countermeasures before confirming. Do not implement until Step 5 is confirmed.]`;
  },

  6: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    return `Step 6 — Action Register (draft for ${kpi})

| No. | Implementation Plan                        | Start Date | Due Date | Responsible | Status |
|-----|--------------------------------------------|------------|----------|-------------|--------|
| 1   | [Countermeasure 1 — specific action]        |            |          |             | R      |
| 2   | [Countermeasure 2 — specific action]        |            |          |             | R      |
| 3   | [Countermeasure 3 — verification step]      |            |          |             | R      |

Status key: R = Behind | Y = At Risk | G = On Track | C = Completed

[Fill in all columns before confirming. Status must be updated at each board meeting. Each row should be actionable enough for the Responsible person to execute without further clarification.]`;
  },

  7: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    return `Step 7 — Monitor Results & Processes (draft for ${kpi})

Measurement — Start (baseline): ${dc.redActual != null ? dc.redActual : '[baseline actual at problem confirmation]'}

Measurement — End (result): [actual after implementing countermeasures — fill in at close]

New Target (if revised): ${dc.redTarget != null ? dc.redTarget : '[confirm target — unchanged unless root cause redefined the baseline]'}

KPI: ${dc.headline || kpi}

Chart — Actual vs Target: [Attach updated trend chart showing before/after countermeasure implementation. Use the same chart format as Step 3 to make comparison clear.]

[Monitor weekly until the metric is stable at or above target for at least 4 consecutive periods. Do not close until this condition is met.]`;
  },

  8: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    return `Step 8 — Standardize Successful Process (draft for ${kpi})

Process Documents Created/Updated:
  - [BWI/SWI title] — [Created / Revised] — Link: [SharePoint / WMS]
  ${dc.sopId ? `- ${dc.sopTitle} (${dc.sopId}) — the governing SOP for this improvement.` : ''}
  - Submit WMS SW Update Request ticket: [ticket number]

Training on New Process(es):
  - Who was trained: [list names/roles]
  - When: [training date(s)]
  - Format: [in-person walk / video / on-the-job demo]

Yokoten Plan (cross-pollination):
  - Share improvement at: [next T3 board meeting / department all-hands]
  - Communicate to other locations: [Mexico / Norcross / Houston / Canada as applicable]
  - Document in ODG's 8-step tracker as "closed + shared"

Improvement Image or Chart:
  - Before/after visual confirming the process change. [Attach photograph or updated KPI chart.]

[Complete all sections before marking Step 8 confirmed. This step closes the KZ.]`;
  },
};

// ─── SOP lookup ─────────────────────────────────────────────────────────────

const SOP_LOOKUP = {
  operations: {
    id: 'operations-shortcode',
    title: 'Short-Code Order Entry — Standard Work for Remake Jobs',
    path: 'data/sops/operations-shortcode.json',
    linkedKpi: 'OTP',
    note: 'This BWI addresses the root cause of the Feb–Mar 2026 Galls color credit event (KZ-346). See Step 8 of any Operations remake-order 8-step.',
  },
  service: {
    id: 'service-prospecting',
    title: 'Prospecting & Quote Follow-Up Standard Work',
    path: 'data/sops/service-prospecting.json',
    linkedKpi: 'Incoming Rev WE',
    note: 'Governs the rep-level prospecting cadence and quote follow-up 3-touch rule.',
  },
  sales: {
    id: 'service-prospecting',
    title: 'Prospecting & Quote Follow-Up Standard Work',
    path: 'data/sops/service-prospecting.json',
    linkedKpi: 'Incoming Rev WE Outside',
    note: 'The same 3-touch rule applies to outside sales (Tony/Nick/Michael/Jamie). KZ-303 countermeasure #5 converts this to an LSW.',
  },
};

// ─── Agent-poke scripted beat (HR) ─────────────────────────────────────────

function agentPokeHR() {
  return `[Agent poke — ADP data validation]

Agent: "ADP does not expose a usable API. Pinging HR owner (Clarissa) on Slack now."

Slack DM → Clarissa:
  "Hi Clarissa — the FMDS board is missing this week's TRIR actual from ADP.
   Could you drop the number here so I can post it to the board? Thanks."

[Awaiting response…]

On receipt → validate: is the value numeric? Is it in the expected range (0–35)?
If Feb-style spike (>10): flag for review before posting — "TRIR spike detected. Confirm this is not a data-entry error before I post."
If confirmed: post to HR board TRIR row → status: G / Y / R as appropriate.

[This is a scripted demo of the ADP agent-poke flow. Live wiring is Phase 5b.]`;
}

// ─── Main export: bakedReply ─────────────────────────────────────────────────

/**
 * bakedReply(deptId, intent, ctx) → string
 *
 * @param {string} deptId   — department id (e.g. 'operations')
 * @param {string} intent   — one of: 'explain-red' | 'draft-step' | 'find-sop' | 'agent-poke'
 * @param {object} ctx      — optional context: { step: 1–8, kpi: 'OTP', kzNumber: 'KZ-325' }
 * @returns {string}        — context-grounded canned reply
 */
export function bakedReply(deptId, intent, ctx = {}) {
  const dc = DEPT_CONTEXT[deptId];

  switch (intent) {
    case 'explain-red': {
      if (!dc) return `No context available for department "${deptId}".`;
      return `Why is ${ctx.kpi || dc.redKpi || 'the KPI'} red?\n\n${dc.redStory}`;
    }

    case 'draft-step': {
      const stepNum = parseInt(ctx.step, 10);
      if (!stepNum || stepNum < 1 || stepNum > 8) {
        return `draft-step requires ctx.step (1–8). Got: ${ctx.step}`;
      }
      const draftFn = STEP_DRAFTS[stepNum];
      if (!draftFn) return `No draft template for step ${stepNum}.`;
      return draftFn({ ...ctx, deptId });
    }

    case 'find-sop': {
      const sop = SOP_LOOKUP[deptId];
      if (!sop) {
        return `No SOP currently embedded for ${deptId}. Check data/sops/ for available documents, or consult the Standard Work view.`;
      }
      return `Governing SOP for ${deptId} / ${ctx.kpi || sop.linkedKpi}:

Title:  ${sop.title}
File:   ${sop.path}
Linked KPI: ${sop.linkedKpi}
Note:   ${sop.note}

Open the Standard Work view to see the full BWI (Main Step → Key Points → Reason format).`;
    }

    case 'agent-poke': {
      if (deptId === 'hr') return agentPokeHR();
      return `Agent poke is currently only scripted for HR (ADP data validation). Other departments use board-direct or Power BI sources.`;
    }

    default:
      return `Unknown intent "${intent}". Available: explain-red | draft-step | find-sop | agent-poke`;
  }
}

/**
 * liveReply(deptId, intent, ctx) → string
 *
 * Phase 5b: will call Claude API when a key is present.
 * For now, delegates to bakedReply so nothing depends on the network.
 */
export async function liveReply(deptId, intent, ctx = {}) {
  // Phase 5b: check for ANTHROPIC_API_KEY in environment; if present, call Claude.
  // For Phase 5a: fall back to baked always.
  return bakedReply(deptId, intent, ctx);
}

/**
 * lib/agent.js — Agent panel: canned context-grounded replies + stub live relay
 *
 * Exports:
 *   bakedReply(deptId, intent, ctx) → string
 *   liveReply(deptId, intent, ctx)  → Promise<string>  (Ask Mark: tries the real
 *                                    backend agent first — POST /api/mark with
 *                                    {deptId, context: buildDeptContext(...),
 *                                    messages: ctx.messages} — and falls back to
 *                                    the scripted, context-grounded reply built
 *                                    from lib/context.js on ANY failure: no
 *                                    `fetch` global, a rejected/timed-out fetch,
 *                                    or a non-OK response. The fallback is exactly
 *                                    what this module produced before the backend
 *                                    existed, so keyless local dev and the
 *                                    CSP-locked hosted Artifact bundle (where
 *                                    fetch is shimmed to reject) behave identically
 *                                    to the pre-backend prototype.)
 *
 * Intents:
 *   'explain-red'  — why a KPI is red (context-grounded per dept)
 *   'draft-step'   — first-pass draft for an 8-step step (uses ctx.step, ctx.kpi)
 *   'find-sop'     — relevant SOP/BWI for the current KPI/department
 *   'ask'          — free-text Ask Mark chat (ctx.dept + ctx.question); routes to
 *                    the mentioned KPI when the question names one, otherwise
 *                    summarizes the department's current reds
 *   'step-help'    — proactive, per-step co-pilot suggestion for the docked panel
 *                    on the 8-step wizard (uses ctx.step, ctx.kpi/ctx.kpiActual/
 *                    ctx.kpiTarget, ctx.kz; ctx.question for the composer free-text
 *                    follow-up). Returns a structured object (not a plain string —
 *                    see stepHelpFor() below) so the panel can render per-idea
 *                    Add/Dismiss actions. liveReply short-circuits this intent to
 *                    bakedReply even when ctx.dept is supplied, since step-help
 *                    always needs the structured object, never grounded prose.
 */

import { buildDeptContext } from './context.js';
import { composeMarkNote } from './comments.js';

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
    redKpi: 'TRIR Overall', // exact data/hr.json KPI name (isHeadlineKpi is exact-match)
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
    redKpi: 'Incoming Revenue WE', // matches data/service.json KPI name so isHeadlineKpi fires when Service goes red
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
    redKpi: '% Uptime', // exact data/it.json KPI name (isHeadlineKpi is exact-match)
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
    // Prefer the selected KPI's own actual/target (passed by the wizard) over dept-level context
    const actual = ctx.kpiActual !== undefined && ctx.kpiActual !== null ? ctx.kpiActual : dc.redActual;
    const target = ctx.kpiTarget !== undefined && ctx.kpiTarget !== null ? ctx.kpiTarget : dc.redTarget;
    return `Step 1 — Clarify the Problem (draft for ${kpi})

Ultimate Goal: Achieve and sustain ${kpi} at or above the ${target != null ? target : 'target'} threshold consistently.

Standard: ${target != null ? target : '[enter target]'} (board-of-record target).

Current Situation: ${actual != null ? actual : '[enter actual]'} (latest period actual).

Gap = Problem: ${actual != null && target != null ? `Actual (${actual}) is below target (${target}).` : '[actual minus target — quantify the gap]'}

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
    const target = ctx.kpiTarget !== undefined && ctx.kpiTarget !== null ? ctx.kpiTarget : dc.redTarget;
    return `Step 3 — Objective (draft for ${kpi})

Do What: Increase / restore ${kpi} to target.

To What: ${target != null ? target : '[target value]'} (${kpi}).

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
    const actual = ctx.kpiActual !== undefined && ctx.kpiActual !== null ? ctx.kpiActual : dc.redActual;
    const target = ctx.kpiTarget !== undefined && ctx.kpiTarget !== null ? ctx.kpiTarget : dc.redTarget;
    return `Step 7 — Monitor Results & Processes (draft for ${kpi})

Measurement — Start (baseline): ${actual != null ? actual : '[baseline actual at problem confirmation]'}

Measurement — End (result): [actual after implementing countermeasures — fill in at close]

New Target (if revised): ${target != null ? target : '[confirm target — unchanged unless root cause redefined the baseline]'}

KPI: ${kpi}

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

// ─── Docked co-pilot: per-step proactive help ───────────────────────────────
// stepHelpFor() powers the 'step-help' intent for the docked Mark panel beside
// the 8-step wizard. Unlike bakedReply's other intents (which return plain
// strings for the chat drawer), 'step-help' returns a structured object so the
// panel can render one Add/Dismiss action per idea and write accepted text
// straight into the wizard's own fields:
//
//   { step, headline, note, items: [ {type, label, ...} ] }
//
// item.type is one of:
//   'chain'         — a candidate 5-Whys chain (step 4). { whys:[{n,text,category}], rootCause }
//   'altbranch'     — an alternative root-cause branch to test (step 4). { category, text }
//   'countermeasure'— a pre-scored countermeasure idea (step 5). { text, S,Q,C,T,Cu,Ef,OA }
//   'recovery'      — recovery-status framing for Results (step 7). { text }
//   'action'        — a suggested action-register row (step 6). { text }
//   'nudge'         — a brief grounded suggestion for a single field. { text, field }
//   'note'          — a plain scripted answer to a free-form composer question. { text }
//
// Every idea is scripted from DEPT_CONTEXT + the KPI passed in ctx — no network.

function genericWhyChain(kpiName, dc) {
  const hint = dc.redStory ? dc.redStory.split('\n')[0].trim() : `${kpiName} is off target.`;
  return [
    { n: 1, text: hint, category: 'Method' },
    { n: 2, text: `Confirm the exact process step where ${kpiName} actually breaks down (Genchi Genbutsu — go see it happen).`, category: 'Method' },
    { n: 3, text: `Check whether a standard exists for that step, and whether it's being followed.`, category: 'Man' },
    { n: 4, text: `If a standard exists, confirm it's followed consistently across owners/shifts/locations.`, category: 'Man' },
    { n: 5, text: `Root cause (hypothesis): a gap between the documented standard and what's actually happening at the point of occurrence.`, category: 'Method' }
  ];
}

function step4ChainFor(deptId, kpiName, dc) {
  if (deptId === 'operations') {
    return [
      { n: 1, text: `${kpiName} weekly actual runs well below target at the Mexico location (0.39–0.55 vs 0.985).`, category: 'Measurement' },
      { n: 2, text: 'The OTP denominator includes the Galls color program backlog (1,917 samples) alongside standard production.', category: 'Method' },
      { n: 3, text: 'Remake/backlog orders route through the same short-code order-entry flow as standard production orders.', category: 'Method' },
      { n: 4, text: 'The short-code order-entry standard work has no distinct path or exception handling for remake/sample jobs.', category: 'Method' },
      { n: 5, text: 'Root cause (hypothesis): a gap in the short-code order-entry standard work for remake-job routing and denominator classification.', category: 'Method' }
    ];
  }
  if (deptId === 'sales') {
    return [
      { n: 1, text: `${kpiName} shows large swings tied to December credit events ($95,163).`, category: 'Method' },
      { n: 2, text: 'The credits trace to new-account onboarding — accounts set up without a standard checklist.', category: 'Method' },
      { n: 3, text: 'No standardized new-account onboarding checklist exists for outside sales reps.', category: 'Method' },
      { n: 4, text: 'Without a checklist, order-entry errors on new accounts surface only after the fact, as a credit rather than a prevented error.', category: 'Man' },
      { n: 5, text: 'Root cause (hypothesis): missing standard work for new-account onboarding at the point of order entry.', category: 'Method' }
    ];
  }
  return genericWhyChain(kpiName, dc);
}

function altBranchesFor(deptId, kpiName) {
  if (deptId === 'operations') {
    return [
      { category: 'Man', text: 'Alternative: is this a training gap — do Mexico order-entry staff know how to flag remake/sample orders differently from standard production?' },
      { category: 'Measurement', text: 'Alternative: should backlog/sample pieces even count in the OTP denominator, or is the metric itself mis-defined for this program?' }
    ];
  }
  if (deptId === 'sales') {
    return [
      { category: 'Man', text: 'Alternative: is this a training/accountability gap for reps, rather than a missing checklist?' },
      { category: 'Measurement', text: 'Alternative: are credits being attributed to the right root event (onboarding vs. quote-to-order follow-up)?' }
    ];
  }
  return [
    { category: 'Man', text: `Alternative: is there a skill or training gap behind ${kpiName}, rather than a process gap?` },
    { category: 'Measurement', text: `Alternative: is ${kpiName} itself measured/sourced correctly, or could the number be a data artifact?` }
  ];
}

function step4Help(deptId, kpiName) {
  const dc = DEPT_CONTEXT[deptId] || {};
  const chain = step4ChainFor(deptId, kpiName, dc);
  const alts = altBranchesFor(deptId, kpiName);
  const rootCause = chain[chain.length - 1].text.replace(/^Root cause \(hypothesis\):\s*/i, '');
  return {
    step: 4,
    headline: `Candidate root-cause chain for ${kpiName}`,
    note: 'Hypotheses only — confirm each Why at the point of occurrence (Genchi Genbutsu) before locking the root cause.',
    items: [
      { type: 'chain', label: 'Add chain to Step 4', whys: chain, rootCause },
      ...alts.map(b => ({ type: 'altbranch', category: b.category, label: `Add as ${b.category} branch`, text: b.text }))
    ]
  };
}

function step5Help(deptId, kpiName) {
  const ideas = deptId === 'operations'
    ? [
        { text: "Add a distinct short-code path for remake/sample orders so they don't silently inflate the standard-production denominator.", S: 2, Q: 2, C: 1, T: 1, Cu: 2, Ef: 2, OA: 2 },
        { text: 'Daily Mexico OTP check-in until the metric is stable, tied to the short-code standard-work rollout.', S: 2, Q: 2, C: 2, T: 2, Cu: 2, Ef: 2, OA: 2 },
        { text: 'System validation (poka-yoke) flag on order entry whenever a remake/sample code is used.', S: 2, Q: 2, C: 0, T: 1, Cu: 2, Ef: 1, OA: 1 }
      ]
    : deptId === 'sales'
      ? [
          { text: 'Stand up a standardized new-account onboarding checklist before first order entry.', S: 2, Q: 2, C: 2, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Weekly cross-functional onboarding call to catch gaps before they become credits.', S: 2, Q: 2, C: 1, T: 2, Cu: 2, Ef: 2, OA: 2 },
          { text: 'CRM logging requirement so onboarding steps are auditable per account.', S: 1, Q: 2, C: 1, T: 1, Cu: 1, Ef: 1, OA: 1 }
        ]
      : [
          { text: `Daily/weekly check on ${kpiName} at the point of occurrence until it's stable.`, S: 2, Q: 2, C: 2, T: 2, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Add a verification checkpoint (supervisor sign-off) before the process step completes.', S: 2, Q: 2, C: 1, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: "Build a system validation so the error can't be entered in the first place.", S: 2, Q: 2, C: 0, T: 1, Cu: 2, Ef: 2, OA: 1 }
        ];
  return {
    step: 5,
    headline: `Pre-scored countermeasure ideas for ${kpiName}`,
    note: 'Scored 0–2 on Safety/Quality/Cost/Time/Customer/Effective. Treat Overall as a starting point — confirm with the team (Nemawashi) before locking it in.',
    items: ideas.map(i => ({ type: 'countermeasure', label: 'Add to matrix', ...i }))
  };
}

function step7Help(kpiName, actual, target) {
  const t = target != null ? target : 'target';
  const text = `Recovery status: watch ${kpiName} weekly and don't close this KZ until it is stable at or above ${t} for at least 4 consecutive periods.` +
    (actual != null ? ` Baseline at problem confirmation was ${actual}.` : '');
  return {
    step: 7,
    headline: `Recovery framing for ${kpiName}`,
    note: "Don't close Step 7 on a single good week — the standard is sustained stability, not a one-off.",
    items: [{ type: 'recovery', label: 'Add to Result Narrative', text }]
  };
}

function genericStepHelp(deptId, stepN, kpiName, actual, target) {
  const textByStep = {
    1: `Frame the gap in one line: "${kpiName} actual ${actual != null ? actual : '[actual]'} vs standard ${target != null ? target : '[target]'}."`,
    2: `Stratify before naming a prioritized problem — narrow ${kpiName} to the one location/team/step where the gap actually originates.`,
    3: `Set a By-When date you can defend at the next review — recommend end of the current review cycle for ${kpiName}.`,
    6: `Turn each scored countermeasure into one action row with a named owner and a real due date — a vague owner stalls at R (Behind).`,
    8: `Yokoten plan: name the other locations/teams that share this process and should hear about this fix.`
  };
  const fieldByStep = { 1: 'gap', 2: 'prioritizedProblem', 3: 'byWhen', 8: 'yokoten' };
  const text = textByStep[stepN] || `Keep this step grounded in ${kpiName} — cite the actual number, not a general statement.`;
  const item = stepN === 6
    ? { type: 'action', label: 'Add as action row', text }
    : { type: 'nudge', label: 'Add to field', field: fieldByStep[stepN] || null, text };
  return {
    step: stepN,
    headline: `Mark's nudge — Step ${stepN}`,
    note: null,
    items: [item]
  };
}

function answerQuestion(deptId, stepN, kpiName, question) {
  const dc = DEPT_CONTEXT[deptId] || {};
  const grounding = dc.redStory
    ? dc.redStory.split('\n')[0].trim()
    : `I don't have deeper scripted context beyond the ${kpiName} KPI data for this department.`;
  return `On ${kpiName} (Step ${stepN}): ${grounding}\n\n` +
    `(This composer answers from the same scripted context as the "Why is the headline KPI red?" shortcut. ` +
    `For anything beyond that, use the Ask Mark drawer or confirm on the floor.)`;
}

/**
 * stepHelpFor(deptId, stepN, ctx) → { step, headline, note, items }
 * ctx: { kpi (name or object via kpi.name), kpiActual, kpiTarget, question }
 */
function stepHelpFor(deptId, stepN, ctx = {}) {
  const dc = DEPT_CONTEXT[deptId] || {};
  const kpiObj = ctx.kpi && typeof ctx.kpi === 'object' ? ctx.kpi : null;
  const kpiName = (kpiObj && kpiObj.name) || (typeof ctx.kpi === 'string' ? ctx.kpi : null) || dc.redKpi || 'the KPI';
  const actual = ctx.kpiActual != null ? ctx.kpiActual : (kpiObj && kpiObj.actual != null ? kpiObj.actual : dc.redActual);
  const target = ctx.kpiTarget != null ? ctx.kpiTarget : (kpiObj && kpiObj.target != null ? kpiObj.target : dc.redTarget);

  if (ctx.question) {
    return {
      step: stepN,
      headline: `Re: "${ctx.question}"`,
      note: null,
      items: [{ type: 'note', text: answerQuestion(deptId, stepN, kpiName, ctx.question) }]
    };
  }

  switch (stepN) {
    case 4: return step4Help(deptId, kpiName);
    case 5: return step5Help(deptId, kpiName);
    case 7: return step7Help(kpiName, actual, target);
    default: return genericStepHelp(deptId, stepN, kpiName, actual, target);
  }
}

// ─── Main export: bakedReply ─────────────────────────────────────────────────

/**
 * bakedReply(deptId, intent, ctx) → string
 *
 * @param {string} deptId   — department id (e.g. 'operations')
 * @param {string} intent   — one of: 'explain-red' | 'draft-step' | 'find-sop' | 'agent-poke' | 'step-help'
 * @param {object} ctx      — optional context: { step: 1–8, kpi: 'OTP', kzNumber: 'KZ-325' }
 * @returns {string|object} — context-grounded canned reply; 'step-help' returns a
 *                            structured { step, headline, note, items } object (see stepHelpFor above)
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

    case 'step-help': {
      const stepNum = parseInt(ctx.step, 10);
      if (!stepNum || stepNum < 1 || stepNum > 8) {
        return { step: ctx.step, headline: 'Mark', note: null, items: [{ type: 'note', text: `step-help requires ctx.step (1–8). Got: ${ctx.step}` }] };
      }
      return stepHelpFor(deptId, stepNum, ctx);
    }

    default:
      return `Unknown intent "${intent}". Available: explain-red | draft-step | find-sop | agent-poke | step-help`;
  }
}

// ─── Ask Mark: context-grounded chat helpers ────────────────────────────────
// These back liveReply's ctx.dept branch. Pure — no DOM, no fetch — so they
// stay unit-testable in plain Node alongside the rest of lib/agent.js.

/** First segment of a KPI name before any parenthetical, e.g. "OTP (On-Time %)" → "OTP". */
function shortName(name) {
  const m = /^([^(]+)/.exec(String(name == null ? '' : name));
  return (m ? m[1] : String(name == null ? '' : name)).trim();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * findMentionedKpi(kpis, question) → matching kpi from buildDeptContext().kpis, or null.
 * Whole-word match against the KPI's id or its short (pre-parenthesis) name, so
 * "why is OTP red?" matches a kpi named "OTP (On-Time %)" but a generic question
 * like "what is red?" does not accidentally match on a stray word.
 *
 * When more than one KPI matches (e.g. both "OTP" and "OTP — Mexico" match a
 * question naming the Mexico sub-KPI, since "OTP" is itself a whole word inside
 * "OTP — Mexico"), prefer whichever MATCHED TOKEN is longest — not whichever
 * KPI's full display name happens to be longest — so the more specific match wins.
 */
function findMentionedKpi(kpis, question) {
  if (!question) return null;
  const q = String(question).toLowerCase();
  let match = null;
  let matchLen = 0;
  for (const kpi of kpis || []) {
    const id = String(kpi.id || '').toLowerCase();
    const short = shortName(kpi.name).toLowerCase();
    const idHit = id.length > 1 && new RegExp(`\\b${escapeRegExp(id)}\\b`, 'i').test(q);
    const shortHit = short.length > 1 && new RegExp(`\\b${escapeRegExp(short)}\\b`, 'i').test(q);
    const hitLen = Math.max(idHit ? id.length : 0, shortHit ? short.length : 0);
    if (hitLen > matchLen) {
      match = kpi;
      matchLen = hitLen;
    }
  }
  return match;
}

/** True when `kpi` is the department's headline red-story KPI (DEPT_CONTEXT corpus). */
function isHeadlineKpi(dc, kpi) {
  if (!dc || !dc.redKpi || !kpi) return false;
  const redKpi = String(dc.redKpi).toLowerCase();
  return shortName(kpi.name).toLowerCase() === redKpi || String(kpi.name || '').toLowerCase() === redKpi;
}

/** Most recent (max ts) entry of a list, or null. Tolerates missing/unsorted ts. */
function latestByTs(items) {
  if (!items || !items.length) return null;
  return items.slice().sort((a, b) => String(b.ts || '').localeCompare(String(a.ts || '')))[0];
}

/**
 * trailLines(deptCtx, kpiId) → string[]
 * The live "trail" Mark reads off this KPI — the floor reason log, the KPI
 * comment thread, and any open 8-step linked to it. Each is drawn from the
 * externally-owned stores threaded through buildDeptContext (reasons/comments/
 * kzRecords), so the reply reflects what a human sees on the board, not a
 * canned string. Omits any line whose source is absent.
 */
function trailLines(deptCtx, kpiId) {
  const lines = [];

  const reason = latestByTs((deptCtx.reasons || []).filter((r) => r.kpiId === kpiId));
  if (reason && reason.text) lines.push(`Latest floor note (${reason.author || 'rep'}): ${reason.text}`);

  const comment = latestByTs((deptCtx.comments || []).filter((c) => c.kpiId === kpiId));
  if (comment && comment.text) {
    const who = comment.author || (comment.role === 'ai' ? 'Mark' : 'team');
    lines.push(`Latest thread note (${who}): ${comment.text}`);
  }

  const kz = (deptCtx.kzRecords || []).find((k) => k.linkedKpiId === kpiId && !k.closed);
  if (kz && kz.kzNumber) lines.push(`Open 8-step: ${kz.kzNumber} (${kz.done}/8 steps).`);

  return lines;
}

/**
 * Grounded answer about one specific KPI: live rag/actual/target + Mark's own
 * note, then the live trail (floor note / thread note / open 8-step) read off
 * deptCtx, then — only when this red KPI is the dept's headline story — the
 * richer static corpus narrative.
 */
function replyForKpi(dept, dc, kpi, deptCtx) {
  const rawKpi = ((dept && dept.kpis) || []).find((k) => k.id === kpi.id) || {};
  const note = composeMarkNote(rawKpi, kpi.rag);
  const ragLabel = { red: 'red', amber: 'amber', green: 'green', nodata: 'not yet reporting data' }[kpi.rag] || kpi.rag;
  const lines = [`${kpi.name} is currently ${ragLabel}.`, note, `Owner: ${kpi.owner}.`];
  lines.push(...trailLines(deptCtx, kpi.id));
  if (dc && kpi.rag === 'red' && isHeadlineKpi(dc, kpi)) {
    lines.push(dc.redStory);
  }
  return lines.join('\n\n');
}

/** Grounded summary of every red KPI currently open in the department. */
function summarizeReds(deptCtx, dc) {
  const { reds, kpis, deptName } = deptCtx;
  if (!reds.length) {
    return `Good news — ${deptName} has no red KPIs right now. Everything tracked is at or above target.`;
  }
  const redKpis = kpis.filter((k) => reds.includes(k.id));
  const lines = redKpis.map((k) => {
    const trail = trailLines(deptCtx, k.id);
    const trailBit = trail.length ? ` — ${trail.join(' ')}` : '';
    return `• ${k.name} — ${k.explanation.why} (owner: ${k.owner})${trailBit}`;
  });
  let out = `You have ${reds.length} red${reds.length === 1 ? '' : 's'} right now in ${deptName}:\n${lines.join('\n')}`;
  // Only glue on the static headline narrative when a CURRENT red actually is
  // the headline/story KPI — otherwise (e.g. OTP green but PPLH reds) the story
  // would be hardcoded, not grounded.
  if (dc && dc.redStory && redKpis.some((k) => isHeadlineKpi(dc, k))) out += `\n\n${dc.redStory}`;
  return out;
}

/** Route a grounded ctx.dept question/intent to the right scripted answer. */
function groundedReply(deptId, intent, ctx, deptCtx) {
  const dc = DEPT_CONTEXT[deptId];

  let mentioned = null;
  if (ctx.kpi) {
    mentioned = deptCtx.kpis.find((k) => k.id === ctx.kpi || k.name === ctx.kpi) || null;
  }
  if (!mentioned) mentioned = findMentionedKpi(deptCtx.kpis, ctx.question);
  if (mentioned) return replyForKpi(ctx.dept, dc, mentioned, deptCtx);

  // Intents with no live-data shape of their own still use the static corpus.
  if (intent === 'find-sop' || intent === 'draft-step' || intent === 'agent-poke') {
    return bakedReply(deptId, intent, ctx);
  }

  // Default for 'ask' / 'explain-red' / an unmatched free-text question:
  // summarize the department's current reds and who owns them.
  return summarizeReds(deptCtx, dc);
}

const MARK_ENDPOINT = '/api/mark';
// Live E2E measured ~31s for a real Operations question (opus, medium effort,
// several tool round-trips) — 30s silently cut off real replies while the
// server kept spending. 90s gives honest headroom; streaming is the real fix.
const MARK_FETCH_TIMEOUT_MS = 90000;

/**
 * fetchLiveReply(deptId, context, messages) → Promise<string|null>
 *
 * POSTs to the Mark backend (server/mark_agent.py, via serve.py's
 * POST /api/mark) and resolves the reply text on success, or `null` on ANY
 * failure — this function never throws. Callers treat `null` as the sole
 * signal to fall back to the scripted reply. Failure modes covered:
 *   - no `fetch` global at all (older runtimes; some Node test contexts)
 *   - `fetch` present but rejecting (network error, or the CSP-locked hosted
 *     Artifact bundle where fetch is shimmed to reject every call)
 *   - non-OK status (e.g. 503 when ANTHROPIC_API_KEY is not set server-side,
 *     or 500 on an agent-loop error)
 *   - a malformed 200 body (missing/non-string `reply`)
 *   - a slow backend — aborted after MARK_FETCH_TIMEOUT_MS
 */
async function fetchLiveReply(deptId, context, messages) {
  if (typeof fetch !== 'function') return null;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), MARK_FETCH_TIMEOUT_MS) : null;
  try {
    const res = await fetch(MARK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deptId, context, messages }),
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (!res || !res.ok) return null;
    const data = await res.json();
    return data && typeof data.reply === 'string' ? data.reply : null;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * toApiMessages(msgs) → [{role, content}]
 *
 * Shapes an in-view thread's msgs ({role:'me'|'mark', text, system?}) into the
 * backend's conversation-history contract ({role:'user'|'assistant', content}).
 * Drops the locally-injected "system confirmation" bubbles (submitResponse /
 * openEightStepForKpi push these with system:true — they never came from the
 * model, so replaying them as assistant turns would misrepresent the
 * conversation to Claude) and drops any messages before the first real user
 * turn (a greeted new thread opens with a scripted Mark intro; the Anthropic
 * Messages API requires the first turn to be 'user', so a leading assistant
 * turn would make every send on that thread fail server-side and silently
 * fall back to the scripted reply instead of actually reaching Mark).
 */
export function toApiMessages(msgs) {
  const real = (msgs || []).filter((m) => !m.system);
  const firstUser = real.findIndex((m) => m.role === 'me');
  if (firstUser === -1) return [];
  return real.slice(firstUser).map((m) => ({
    role: m.role === 'me' ? 'user' : 'assistant',
    content: m.text,
  }));
}

/**
 * liveReply(deptId, intent, ctx) → Promise<string>
 *
 * When ctx.dept is supplied, builds this department's live context
 * (lib/context.js buildDeptContext, now also threading ctx.responses — the
 * accountability response-lifecycle entries — so the backend's
 * get_response_status tool has real data) and tries the real backend agent
 * first (fetchLiveReply, above). On any failure it falls back to the same
 * grounded-but-scripted reply this module always produced, keyed off
 * ctx.question / intent / ctx.kpi — mentioning real live figures (actual,
 * target, owner) rather than generic text. When ctx.dept is absent, falls
 * back to bakedReply so existing callers (the agent drawer) are unaffected.
 * The live path requires ctx.messages (a non-empty [{role,content}] array,
 * e.g. built via toApiMessages) — without it the backend rejects the call
 * and this falls back to groundedReply.
 */
export async function liveReply(deptId, intent, ctx = {}) {
  // 'step-help' always returns stepHelpFor's structured {step,headline,note,items}
  // object for the docked wizard panel — never grounded prose, never worth a
  // network round-trip — so short-circuit to bakedReply here even when
  // ctx.dept is supplied (the wizard dock passes ctx.dept alongside
  // ctx.kpi/ctx.step).
  if (intent === 'step-help') return bakedReply(deptId, intent, ctx);
  if (!ctx.dept) return bakedReply(deptId, intent, ctx);
  const deptCtx = buildDeptContext(ctx.dept, {
    reasons: ctx.reasons,
    comments: ctx.comments,
    kzRecords: ctx.kzRecords,
    responses: ctx.responses,
  });
  const live = await fetchLiveReply(deptId, deptCtx, ctx.messages || []);
  if (live != null) return live;
  return groundedReply(deptId, intent, ctx, deptCtx);
}

// ─── Structured draft prefill (steps 1–6) ─────────────────────────────────────
// The 8-step wizard, opened on a RED SUB-KPI, presents an agent DRAFT the human
// reviews & edits — not a blank form. draftStep() returns structured field values
// (not just narrative text) so each editable field can be pre-populated.
//
// The draft is grounded in three inputs (matching the Jul-3 design intent):
//   1. the red KPI's own data (name/actual/target/story)
//   2. a relevant SOP from the department's Standard Work (SOP_LOOKUP / sop-library)
//   3. a prior similar completed KZ (passed in as ctx.priorKZ) — its root cause,
//      countermeasures and actions seed the draft so the human starts at ~60–80%.

/**
 * draftStep(deptId, stepN, ctx) → { source, prefilled, fields }
 *   fields: object of { fieldKey: value } for steps 1,2,3,7,8
 *   For step 4: { whys:[{n,text,category}], rootCause }
 *   For step 5: { countermeasures:[{text,S,Q,C,T,Cu,Ef,OA}] }
 *   For step 6: { actionRows:[{no,plan,startDate,dueDate,responsible,status}], odgGate }
 *
 * ctx: { kpi, kpiActual, kpiTarget, kpiUnit, kpiStory, priorKZ, sop }
 *   priorKZ — a prior completed KZ record (with .content) to borrow structure from
 *   sop     — { id, title } governing SOP for this department/KPI
 */
export function draftStep(deptId, stepN, ctx = {}) {
  const dc = DEPT_CONTEXT[deptId] || {};
  const kpi = ctx.kpi || dc.redKpi || 'the KPI';
  const actual = ctx.kpiActual != null ? ctx.kpiActual : dc.redActual;
  const target = ctx.kpiTarget != null ? ctx.kpiTarget : dc.redTarget;
  const prior = ctx.priorKZ && ctx.priorKZ.content ? ctx.priorKZ.content : null;
  const priorNum = ctx.priorKZ ? ctx.priorKZ.kzNumber : null;
  const sop = ctx.sop || SOP_LOOKUP[deptId] || null;
  const fmt = (v) => (v == null ? '' : String(v));

  const src = {
    kpi,
    priorKZ: priorNum,
    sop: sop ? sop.title : null,
    line: `Drafted from: red KPI "${kpi}"${actual != null && target != null ? ` (${actual} vs ${target})` : ''}` +
          (priorNum ? ` · prior similar KZ ${priorNum}` : '') +
          (sop ? ` · SOP "${sop.title}"` : '')
  };

  switch (stepN) {
    case 1: return {
      prefilled: true, source: src,
      fields: {
        ultimateGoal: `Ensure ${kpi} consistently meets standard — sustain customer satisfaction and trust.`,
        standard: target != null ? `${target} (board-of-record target)` : '',
        current: actual != null ? `${actual} (latest period actual)` : '',
        gap: actual != null && target != null ? `Actual ${actual} vs standard ${target} — this gap is the problem.` : '',
        chart: 'Actual-vs-target trend, last 8 periods (attach).'
      }
    };

    case 2: return {
      prefilled: true, source: src,
      fields: {
        stratification: deptId === 'operations'
          ? 'By location: Mexico is the primary driver (0.39–0.55 weekly vs target). Norcross/Houston near target. By job type: sample/remake orders vs standard production. Genchi Genbutsu → the remake order-entry (short-code) step.'
          : deptId === 'sales'
            ? 'By event: December new-account onboarding (accounts set up without a checklist). Genchi Genbutsu → the order-entry step when setting up a non-standard account.'
            : 'Break by what (metric sub-component) / where (location, team, step) / when (period) / who (owner). Go and see at the point of occurrence.',
        prioritizedProblem: prior ? prior.step2.prioritizedProblem : '[confirm the single prioritized problem after stratification]'
      }
    };

    case 3: return {
      prefilled: true, source: src,
      fields: {
        doWhat: prior ? `Eliminate the prioritized problem (cf. ${priorNum}: "${prior.step3.doWhat}")` : `Eliminate the prioritized problem driving ${kpi}`,
        toWhat: target != null ? `${target}` : (prior ? prior.step3.toWhat : '[target value]'),
        byWhen: '[end of current review cycle]',
        chart: 'Elimination of prioritized problem overlaid on the big-problem gap.'
      }
    };

    case 4: {
      // Highest-leverage, most-often-rejected step — seed a rigorous 5-Whys ladder.
      // Borrow the prior KZ's chain shape but flag every line for human confirmation.
      const cats = ['Man', 'Method', 'Machine', 'Material', 'Environment'];
      let whys;
      if (prior && prior.step4 && prior.step4.whys) {
        whys = prior.step4.whys.map((w) => ({
          n: w.n,
          text: `${w.text}  ← from ${priorNum}; confirm at the actual point of occurrence`,
          category: w.category
        }));
      } else {
        whys = cats.map((c, i) => ({
          n: i + 1,
          text: i === 0 ? `[Observable symptom in ${kpi}]` : `[Why did Why ${i} occur?]`,
          category: c
        }));
      }
      return {
        prefilled: true, source: src,
        whys,
        rootCause: prior && prior.step4 ? `${prior.step4.rootCause}  ← candidate from ${priorNum}; verify with Genchi Genbutsu before accepting` : '[state the single systemic root cause confirmed by the 5-Whys + 6M]',
        note: 'Step 4 is the highest-leverage step and the one most often rejected on review. Every drafted line is a hypothesis — walk the actual process (Genchi Genbutsu) and confirm or replace each before advancing.'
      };
    }

    case 5: {
      let cms;
      if (prior && prior.step5 && prior.step5.countermeasures) {
        cms = prior.step5.countermeasures.map((c) => ({ ...c }));
      } else {
        cms = [
          { text: 'Create / update the standard-work step that was missing or unclear', S: 2, Q: 2, C: 2, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Train all affected staff on the updated process', S: 2, Q: 2, C: 2, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Add a verification checkpoint (dual-entry / supervisor sign-off) at point of occurrence', S: 2, Q: 2, C: 1, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Build a poka-yoke (system validation / auto-alert)', S: 2, Q: 2, C: 0, T: 1, Cu: 2, Ef: 2, OA: 1 }
        ];
      }
      return {
        prefilled: true, source: src,
        countermeasures: cms,
        note: 'Score each 0–2 on Safety/Quality/Cost/Time/Customer/Effective, then set the Overall priority. Build consensus (Nemawashi) with all impacted stakeholders before committing.'
      };
    }

    case 6: {
      let rows;
      if (prior && prior.step6 && prior.step6.actionRows) {
        rows = prior.step6.actionRows.map((r) => ({ ...r, startDate: '', dueDate: '', status: 'R' }));
      } else {
        rows = [
          { no: 1, plan: '[Countermeasure 1 — specific action]', startDate: '', dueDate: '', responsible: '', status: 'R' },
          { no: 2, plan: '[Countermeasure 2 — specific action]', startDate: '', dueDate: '', responsible: '', status: 'R' },
          { no: 3, plan: '[Verification step]', startDate: '', dueDate: '', responsible: '', status: 'R' }
        ];
      }
      return {
        prefilled: true, source: src,
        actionRows: rows,
        odgGate: { status: 'pending', reviewer: 'Eric / Allison (ODG)', note: 'Submit this plan to the ODG gate for review before implementation begins.' }
      };
    }

    // Steps 7 & 8 are DO/CHECK/ACT — captured after implementation, not pre-drafted.
    default: return { prefilled: false, source: src, fields: {} };
  }
}

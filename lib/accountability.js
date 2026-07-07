/**
 * lib/accountability.js — red-KPI accountability workflow (store + lifecycle)
 *
 * A red fires a required lightweight response from the KPI's owner (the
 * 4-field response card, spec §5.2); the owner's answer is tracked through a
 * visible response lifecycle (spec §5.3) that is the single roll-up signal
 * Leadership OS reads — "is this red actually being worked?", not just "is it
 * red?". In-memory + localStorage-backed, same load/save/uid/seed pattern as
 * lib/reasons.js and lib/comments.js.
 *
 * Detection is deliberately NOT persisted as its own store write: a KPI's
 * red/amber status is always read live off the department data via
 * buildDeptContext() (lib/context.js), so redKpisNeedingResponse() reflects
 * the current board on every call. Only once an owner responds does a
 * tracked entry exist in the store.
 *
 * Entry shape (spec §5.5):
 *   { id, deptId, kpiId, owner, dueDate, answered, onTime,
 *     cause, action, needs8Step, kzNumber,           // the 4 fields
 *     reportBackWhen,
 *     lifecycle: { detected, responded, actionUnderway, eightStepOpened, reported, recovered },
 *       // each stage: { done: boolean, ts: string|null }
 *     ts }
 *
 *   id:             string (crypto.randomUUID or Date.now fallback)
 *   deptId:         string  — e.g. 'operations'
 *   kpiId:          string  — e.g. 'otp'
 *   owner:          string  — who must answer (lib/context.js ownerFor)
 *   dueDate:        ISO 8601 string — response SLA deadline, stamped at creation
 *   answered:       boolean — a response has been submitted
 *   onTime:         boolean — response landed within the SLA window
 *   cause:          string  — field 1, "what's driving the red?"
 *   action:         string  — field 2, "what are you doing about it?"
 *   needs8Step:     boolean — field 3, "does this need an 8-step?"
 *   kzNumber:       string|null — linked KZ (8-step) number when needs8Step
 *   reportBackWhen: string|null — field 4, "when will you report back?"
 *   ts:             ISO 8601 string — when the response was recorded
 */

import { buildDeptContext } from './context.js';

const LS_KEY    = 'fmds_accountability';
const SEED_FLAG = 'fmds_accountability_seeded';

// Phase 1 assumption (not sourced from real data): a red is asked to be
// answered within this many days of being flagged. Purely a UI/queue framing
// device — no invented business figures ride on it.
const RESPONSE_SLA_DAYS = 2;

// Phase 1 assumption: a response is flagged "stalled" once its most recently
// completed lifecycle stage is older than this many days, echoing the
// "stuck at 'action underway' N days" framing in spec §5.3.
const STALL_THRESHOLD_DAYS = 3;

export const LIFECYCLE = [
  'detected', 'responded', 'actionUnderway', 'eightStepOpened', 'reported', 'recovered',
];

const STAGE_LABELS = {
  detected:       'Detected',
  responded:      'Responded',
  actionUnderway: 'Action underway',
  eightStepOpened: '8-step opened',
  reported:       'Reported',
  recovered:      'Recovered',
};

// ─── Storage plumbing (mirrors lib/reasons.js) ─────────────────────────────

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch { return []; }
}

function save(entries) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(entries)); } catch { /* quota */ }
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
}

function addDays(iso, days) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function makeLifecycle(ts, doneStages = []) {
  const lc = {};
  for (const stage of LIFECYCLE) {
    lc[stage] = doneStages.includes(stage) ? { done: true, ts } : { done: false, ts: null };
  }
  return lc;
}

// ─── Detection ──────────────────────────────────────────────────────────────

/**
 * redKpisNeedingResponse(dept, { includeAmber = false } = {}) →
 *   [{ kpiId, kpi, rag, owner, dueDate }]
 *
 * Red-only by default (spec §10 decision: amber is watch-only, no queue
 * noise). Reads live off buildDeptContext(dept), which already computes
 * per-KPI rag + owner — no separate ragStatus/ownerFor call needed here.
 */
export function redKpisNeedingResponse(dept, { includeAmber = false } = {}) {
  const ctx = buildDeptContext(dept);
  const wanted = includeAmber ? ['red', 'amber'] : ['red'];
  const dueDate = addDays(new Date().toISOString(), RESPONSE_SLA_DAYS);
  return ctx.kpis
    .filter((k) => wanted.includes(k.rag))
    .map((k) => ({
      kpiId: k.id,
      kpi: k.name,
      rag: k.rag,
      owner: k.owner,
      dueDate,
    }));
}

// ─── Response store ─────────────────────────────────────────────────────────

/**
 * addResponse({deptId,kpiId,owner,cause,action,needs8Step,kzNumber,reportBackWhen}) → entry
 *
 * Records the owner's 4-field response. Submitting a response is, by
 * definition, the "detected" and "responded" moment for the tracked entry
 * (nothing is persisted before this call — see module header), so both
 * stages are stamped done at the same ts. dueDate/onTime are stamped using
 * the same SLA window redKpisNeedingResponse() frames the queue with.
 */
export function addResponse({ deptId, kpiId, owner, cause, action, needs8Step, kzNumber, reportBackWhen }) {
  const now = new Date().toISOString();
  const entry = {
    id: uid(),
    deptId,
    kpiId,
    owner: owner || '',
    dueDate: addDays(now, RESPONSE_SLA_DAYS),
    answered: true,
    onTime: true,
    cause: cause || '',
    action: action || '',
    needs8Step: !!needs8Step,
    kzNumber: kzNumber || null,
    reportBackWhen: reportBackWhen || null,
    lifecycle: makeLifecycle(now, ['detected', 'responded']),
    ts: now,
  };
  const entries = load();
  entries.push(entry);
  save(entries);
  return entry;
}

// Sort newest-first by ts, tie-breaking on original array position (last
// inserted wins) so two entries stamped within the same millisecond still
// resolve deterministically to "most recent" rather than to insertion order.
function newestFirst(entries) {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.ts.localeCompare(a.e.ts) || b.i - a.i)
    .map(({ e }) => e);
}

// Index of the most recent entry matching deptId+kpiId (same "most recent"
// semantics as getResponse/newestFirst above), or -1. A KPI can accumulate
// more than one entry over time (e.g. it recovers, then goes red again) —
// advanceLifecycle must always progress the latest one, not just the first
// match in array order.
function latestIndex(entries, deptId, kpiId) {
  let bestIdx = -1;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.deptId !== deptId || e.kpiId !== kpiId) continue;
    if (bestIdx === -1 || e.ts.localeCompare(entries[bestIdx].ts) >= 0) bestIdx = i;
  }
  return bestIdx;
}

/** getResponse({deptId,kpiId}) → entry|null — most recent entry for the KPI, or null. */
export function getResponse({ deptId, kpiId }) {
  const matches = load().filter((e) => e.deptId === deptId && e.kpiId === kpiId);
  if (!matches.length) return null;
  return newestFirst(matches)[0];
}

/** getResponsesByDept(deptId) → [entry] — all entries for a dept, newest first. */
export function getResponsesByDept(deptId) {
  return newestFirst(load().filter((e) => e.deptId === deptId));
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────

/**
 * advanceLifecycle({deptId,kpiId,stage}) → entry|null
 *
 * Idempotent: advancing an already-done stage is a no-op (ts is not
 * re-stamped). Unknown stage names are ignored (entry returned unchanged).
 * Advancing to 'responded' also flips the top-level `answered` flag, so a
 * bare entry (e.g. one seeded without going through addResponse) reads
 * consistently once it reaches that stage.
 */
export function advanceLifecycle({ deptId, kpiId, stage }) {
  const entries = load();
  const idx = latestIndex(entries, deptId, kpiId);
  if (idx === -1) return null;
  const entry = entries[idx];
  if (LIFECYCLE.includes(stage)) {
    const current = entry.lifecycle && entry.lifecycle[stage];
    if (!current || !current.done) {
      const now = new Date().toISOString();
      entry.lifecycle = entry.lifecycle || makeLifecycle(null);
      entry.lifecycle[stage] = { done: true, ts: now };
      if (stage === 'responded') entry.answered = true;
    }
  }
  entries[idx] = entry;
  save(entries);
  return entry;
}

/**
 * linkEightStep({deptId,kpiId,kzNumber}) → entry|null
 *
 * Escalates an EXISTING response entry (one addResponse() has already
 * created) into a linked 8-step: stamps needs8Step true, records kzNumber
 * (overwriting any prior value — callers are expected to have already
 * resolved the correct number, e.g. reusing an existing open KZ already
 * tagged to this KPI via kzRecords' linkedKpiId, before calling this), and
 * advances the lifecycle to 'eightStepOpened' via advanceLifecycle() so the
 * idempotency/ts-stamping rule stays in one place. This is the single path
 * for BOTH escalating at submit time (Field 3 = Yes) and escalating later
 * from an already-answered response that hasn't opened its 8-step yet (e.g.
 * a seeded entry with a kzNumber already attached but eightStepOpened still
 * pending). No-op — returns null — if no response entry exists yet for
 * deptId+kpiId (addResponse() must run first).
 */
export function linkEightStep({ deptId, kpiId, kzNumber }) {
  const entries = load();
  const idx = latestIndex(entries, deptId, kpiId);
  if (idx === -1) return null;
  const entry = entries[idx];
  entry.needs8Step = true;
  if (kzNumber) entry.kzNumber = kzNumber;
  entries[idx] = entry;
  save(entries);
  return advanceLifecycle({ deptId, kpiId, stage: 'eightStepOpened' });
}

/**
 * lifecycleView(entry, now = new Date()) → [{stage,label,done,ts,current}]
 *
 * Walks LIFECYCLE in order; the first not-done stage is flagged
 * current:true (the next milestone to complete). If every stage is done,
 * no stage is current. `now` is accepted for interface symmetry with
 * stalledDays() but not otherwise used here — stage display doesn't depend
 * on the clock, only on which stages are done.
 */
export function lifecycleView(entry, now = new Date()) {
  const lifecycle = (entry && entry.lifecycle) || {};
  let currentAssigned = false;
  return LIFECYCLE.map((stage) => {
    const st = lifecycle[stage] || { done: false, ts: null };
    const isCurrent = !st.done && !currentAssigned;
    if (isCurrent) currentAssigned = true;
    return { stage, label: STAGE_LABELS[stage], done: !!st.done, ts: st.ts || null, current: isCurrent };
  });
}

/**
 * stalledDays(entry, now = new Date()) → whole number of days since the
 * most recently completed lifecycle stage's ts (0 if nothing has been
 * completed yet, or if the most recent stage just happened).
 */
export function stalledDays(entry, now = new Date()) {
  const lifecycle = (entry && entry.lifecycle) || {};
  let lastTs = null;
  for (const stage of LIFECYCLE) {
    const st = lifecycle[stage];
    if (st && st.done && st.ts) lastTs = st.ts;
  }
  if (!lastTs) return 0;
  const nowMs = (now instanceof Date ? now : new Date(now)).getTime();
  const diffMs = nowMs - new Date(lastTs).getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

// ─── Roll-up signal ─────────────────────────────────────────────────────────

/**
 * rollupSignal(deptId) → {redCount, answered, beingActioned, stalled}
 *
 * Summarizes the persisted response entries for a dept — i.e. reds that
 * already have an accountability record, not a live board scan (use
 * redKpisNeedingResponse() for that). beingActioned counts entries at or
 * past 'actionUnderway' that haven't reached 'recovered'; stalled counts
 * those whose progress has gone quiet past STALL_THRESHOLD_DAYS.
 */
export function rollupSignal(deptId) {
  const entries = getResponsesByDept(deptId);
  const redCount = entries.length;
  const answered = entries.filter((e) => e.answered).length;
  const beingActioned = entries.filter(
    (e) => e.lifecycle && e.lifecycle.actionUnderway && e.lifecycle.actionUnderway.done
      && !(e.lifecycle.recovered && e.lifecycle.recovered.done)
  ).length;
  const stalled = entries.filter(
    (e) => !(e.lifecycle && e.lifecycle.recovered && e.lifecycle.recovered.done)
      && stalledDays(e) > STALL_THRESHOLD_DAYS
  ).length;
  return { redCount, answered, beingActioned, stalled };
}

// ─── Seed ───────────────────────────────────────────────────────────────────

/**
 * seedDemoAccountability() — the real OTP/Mexico exchange (Jim Kozel, dept
 * lead, Operations). WE main OTP is red (0.863 vs 0.985 target) because
 * Mexico dragged it down (weekly OTP 0.39–0.55 from ~week 15), denominator
 * inflated by the Galls color sample-volume surge (1,917-sample backlog)
 * plus the $40K short-code standard-work gap tracked as KZ-346 (Pricing
 * Credit Memos). Every figure here is real (data/operations.json,
 * data/sops/operations-shortcode.json) — zero invented numbers.
 * Lifecycle is advanced through 'responded'/'actionUnderway' only —
 * 'eightStepOpened' is deliberately left not-done even though a KZ is
 * already linked, so the demo queue still shows "open the 8-step" as the
 * next step.
 */
export function seedDemoAccountability() {
  if (localStorage.getItem(SEED_FLAG)) return;
  const entry = addResponse({
    deptId: 'operations',
    kpiId: 'otp',
    owner: 'Jim Kozel',
    cause: 'WE main OTP is red (0.863 vs 0.985 target) primarily because Mexico is dragging it down — '
      + 'Mexico ran 0.39–0.55 weekly OTP from ~week 15, and the denominator was inflated by the Galls '
      + 'color sample-volume surge (1,917-sample backlog). The $40K short-code standard-work gap on the '
      + 'Galls color remake (KZ-346, Pricing Credit Memos) is the piece Jim wants root-caused.',
    action: 'Overtime deployed at Mexico to work the backlog; corrected the short-code order-entry '
      + 'standard work (BWI) so remake jobs stop mis-routing into preventable credits.',
    needs8Step: true,
    kzNumber: 'KZ-346',
    reportBackWhen: 'Next T3 review',
  });
  advanceLifecycle({ deptId: entry.deptId, kpiId: entry.kpiId, stage: 'actionUnderway' });
  localStorage.setItem(SEED_FLAG, '1');
}

// Auto-seed on first import in the browser, so the accountability queue has
// a populated demo entry even if no view has triggered a response yet.
// Browser-guarded so Node tests (which import this module without a
// localStorage global) don't throw.
if (typeof localStorage !== 'undefined') {
  try { seedDemoAccountability(); } catch { /* localStorage unavailable */ }
}

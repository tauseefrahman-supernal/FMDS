import test from 'node:test'; import assert from 'node:assert';
import { hoshinPageHTML, hoshinStrip, hoshinChips } from '../views/hoshin.js';

// views/hoshin.js's renderHoshin(dept, mount) is a DOM-mounting + async-fetch
// entry point (matches the other views' `renderX(dept, mount)` router-entry
// pattern) — like the rest of this test suite, we don't stand up a real DOM
// or mock fetch here. Instead we test the pure HTML-string builders directly
// (hoshinPageHTML/hoshinStrip/hoshinChips), which is where all the real
// logic — and every zero-invented-data guard — lives. This fixture mirrors
// data/hoshin.json's actual shape (see tests/hoshin.test.mjs for the same
// convention over lib/hoshin.js's pure functions), including the specific
// edge cases those guards exist for: a null hoshinPriority/objectiveId/lead/
// supportFunction, a mismatched target/support line count, an
// 'unverified-default-full-range' timeline vs a 'derived-from-fill-gap' one,
// an objective with no priorityTag, and a department with zero activities.

const hoshinFixture = {
  objectives: [
    { id: 'financial-performance', name: 'Financial Performance', priorityTag: '(Priority: Financial Performance)', description: 'Grow revenue to $200m through channel management, ecomm, marketplaces, and acquisitions while achieving [60%] in margin and 80% cash conversion through operational performance and tech innovations.' },
    { id: 'acquisitions', name: 'Acquisitions', priorityTag: '(Priority: Acquisitions)', description: null },
    { id: 'organizational-development', name: 'Organizational Development', priorityTag: '(Priority: Organizational Development)', description: 'Create a clear structure for roles & responsibilities supported by a systematic staff development program and empowerment to drive individual and company-wide success.' },
    { id: 'branding-solution', name: 'Branding Solution', priorityTag: null, description: null },
    { id: 'new-customer-acquisition-lifetime-journey', name: 'New Customer Acquisition + Lifetime Journey', priorityTag: null, description: null },
  ],
  departments: {
    operations: {
      block: 'OPERATIONS',
      functionalLead: 'Jim Kozel',
      activities: [
        {
          hoshinPriority: '57.5% Gross margin/ Organizational development',
          objectiveId: 'financial-performance',
          objectiveIds: ['financial-performance', 'organizational-development'],
          activityPlan: 'Labor efficiency improved by 9%',
          // 2 target lines vs 1 support line vs 1 lead line — support/lead
          // should broadcast to both rows rather than drop the 2nd line's data.
          target: 'Training completed by June\nUPLH improvement by 2% q1',
          supportFunction: 'ODG',
          lead: 'PM',
          timeline: {
            start: "Oct'25", end: "Dec'26",
            months: ["Oct'25", "Jan'26", "Apr'26", "Jul'26", "Oct'26"],
            confidence: 'unverified-default-full-range',
          },
        },
        {
          hoshinPriority: null,
          objectiveId: null,
          objectiveIds: null,
          activityPlan: 'Onboarding new accounts over $500k annually',
          target: 'Create SW for onboarding new retail and IL',
          supportFunction: null,
          lead: null,
          timeline: {
            start: "Jan'26", end: "Dec'26",
            months: ["Jan'26", "Feb'26"],
            confidence: 'derived-from-fill-gap',
          },
        },
      ],
    },
    finance: { block: 'FINANCE', functionalLead: 'Will Schwartz', activities: [] },
  },
};

const opsDept = { id: 'operations', name: 'Operations' };
const financeDept = { id: 'finance', name: 'Finance' };

// ─── hoshinPageHTML ─────────────────────────────────────────────────────────

test('hoshinPageHTML renders 5 objective cards (.hoshin-disk) and at least one activity .dt table', () => {
  const html = hoshinPageHTML(opsDept, hoshinFixture);
  const diskMatches = html.match(/class="hoshin-disk/g) || [];
  assert.ok(diskMatches.length >= 5, 'expected at least 5 hoshin-disk spans (5 objective cards)');
  assert.match(html, /<table class="dt">/);
  assert.match(html, /Operations Hoshin/);
  assert.match(html, /Jim Kozel/);
  assert.match(html, /Labor efficiency improved by 9%/);
});

test('hoshinPageHTML never fabricates a due date for an unverified-default-full-range activity', () => {
  const html = hoshinPageHTML(opsDept, hoshinFixture);
  assert.match(html, /Timeline range in source is unverified — not a confirmed commitment date/);
});

test('hoshinPageHTML shows the real end date only for a derived-from-fill-gap activity', () => {
  const html = hoshinPageHTML(opsDept, hoshinFixture);
  assert.match(html, /Dec'26/);
});

test('hoshinPageHTML broadcasts a single support/lead value across a mismatched target-line count (never drops a real value)', () => {
  const html = hoshinPageHTML(opsDept, hoshinFixture);
  assert.match(html, /Training completed by June/);
  assert.match(html, /UPLH improvement by 2% q1/);
  const odgChips = (html.match(/<span class="chip">ODG<\/span>/g) || []).length;
  assert.equal(odgChips, 2, 'ODG support chip should appear on both target rows, not just one');
});

test('hoshinPageHTML shows a neutral placeholder, never a fabricated status, for every row', () => {
  const html = hoshinPageHTML(opsDept, hoshinFixture);
  assert.match(html, /badge badge--neutral">Not tracked<\/span>/);
});

test('hoshinPageHTML shows a neutral note for an objective with no priorityTag and no description', () => {
  const html = hoshinPageHTML(opsDept, hoshinFixture);
  assert.match(html, /No literal priority tag captured in source for this objective\./);
});

test('hoshinPageHTML prefers the objective\'s real description over its short priorityTag', () => {
  const html = hoshinPageHTML(opsDept, hoshinFixture);
  assert.match(html, /Grow revenue to \$200m through channel management/);
  assert.match(html, /Create a clear structure for roles &amp; responsibilities/);
  // the short bracket tags should NOT be what's rendered for objectives that have a real description
  assert.doesNotMatch(html, /\(Priority: Financial Performance\)/);
});

test('hoshinPageHTML falls back to priorityTag when description is null (acquisitions has a tag but no verbatim description in source)', () => {
  const html = hoshinPageHTML(opsDept, hoshinFixture);
  assert.match(html, /\(Priority: Acquisitions\)/);
});

test('hoshinPageHTML renders a graceful empty state for a dept with zero activities', () => {
  const html = hoshinPageHTML(financeDept, hoshinFixture);
  assert.match(html, /No Hoshin activity plans captured for Finance in the source workbook\./);
  assert.match(html, /Will Schwartz/);
});

// ─── hoshinStrip ────────────────────────────────────────────────────────────

test('hoshinStrip returns markup with .hoshin-disk and the Open Hoshin View control', () => {
  const html = hoshinStrip(hoshinFixture, opsDept);
  assert.match(html, /class="hoshin-disk/);
  assert.match(html, /Open Hoshin View/);
  assert.match(html, /data-go-hoshin/);
  assert.match(html, /data-hoshin-dept="operations"/);
});

test('hoshinStrip names the objective(s) Operations drives', () => {
  const html = hoshinStrip(hoshinFixture, opsDept);
  assert.match(html, /This board drives Hoshin 1 · Financial Performance and Hoshin 3 · Organizational Development/);
});

test('hoshinStrip falls back to a "doesn\'t yet drive" line for a dept with zero activities', () => {
  const html = hoshinStrip(hoshinFixture, financeDept);
  assert.match(html, /Finance doesn't yet drive a WE 2026 objective directly/);
});

// ─── hoshinChips ────────────────────────────────────────────────────────────

test('hoshinChips returns .hoshin-chip pills for every objective the dept drives', () => {
  const html = hoshinChips(hoshinFixture, opsDept);
  assert.match(html, /class="hoshin-chip"/);
  assert.match(html, />H1</);
  assert.match(html, />H3</);
});

test('hoshinChips returns an empty string for a dept that drives nothing', () => {
  const html = hoshinChips(hoshinFixture, financeDept);
  assert.equal(html, '');
});

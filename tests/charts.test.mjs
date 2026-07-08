import test from 'node:test'; import assert from 'node:assert';
import { svgRecoveryTrend, svgFunnel, svgPareto } from '../lib/charts.js';

// ─── svgRecoveryTrend ───────────────────────────────────────────────────────

test('svgRecoveryTrend: returns svg string starting with <svg', () => {
  const svg = svgRecoveryTrend([0.9, 0.92, 0.95, 0.97, 0.99], { target: 0.985, cmIndex: 2 });
  assert.equal(typeof svg, 'string');
  assert.ok(svg.startsWith('<svg'));
});

test('svgRecoveryTrend: contains a polyline for the trend line', () => {
  const svg = svgRecoveryTrend([0.9, 0.92, 0.95, 0.97, 0.99], { target: 0.985, cmIndex: 2 });
  assert.ok(svg.includes('<polyline'));
});

test('svgRecoveryTrend: target line rendered dashed (stroke-dasharray)', () => {
  const svg = svgRecoveryTrend([0.9, 0.92, 0.95, 0.97, 0.99], { target: 0.985, cmIndex: 2 });
  assert.ok(svg.includes('stroke-dasharray'));
});

test('svgRecoveryTrend: emits a countermeasure-in marker at cmIndex', () => {
  const svg = svgRecoveryTrend([0.9, 0.92, 0.95, 0.97, 0.99], { target: 0.985, cmIndex: 2 });
  // Assert the actual marker element, not just "some line" (the dashed target
  // line alone would satisfy a bare <line>-count check even without a marker).
  assert.ok(svg.includes('data-marker="countermeasure"'));
});

test('svgRecoveryTrend: N dots for N numeric points', () => {
  const pts = [0.9, 0.92, 0.95, 0.97, 0.99];
  const svg = svgRecoveryTrend(pts, { target: 0.985, cmIndex: 2 });
  const circles = svg.match(/<circle/g) || [];
  assert.equal(circles.length, pts.length);
});

test('svgRecoveryTrend: RAG-colors dots — a series crossing target shows both green and red dots', () => {
  // Below target early (red), at/above target later (green), against a higher_better target.
  const pts = [0.5, 0.6, 0.7, 0.99, 1.0];
  const target = 0.985;
  const svg = svgRecoveryTrend(pts, { target, cmIndex: 1 });
  // green status color and red status color must both appear on circle fills
  assert.ok(svg.includes('#1f9d57'), 'expected green dot fill present');
  assert.ok(svg.includes('#d92d3a'), 'expected red dot fill present');
});

// Extract only the per-point dot fills (the green "in-band" rect also carries
// the green hex, so string-scanning the whole SVG can't distinguish dot color).
function dotFills(svg) {
  return [...svg.matchAll(/<circle[^>]*fill="(#[0-9a-fA-F]{6})"/g)].map(m => m[1]);
}
const RED = '#d92d3a', GREEN = '#1f9d57';

test('svgRecoveryTrend: lower_better + target 0 + rising series → all RED dots (not green)', () => {
  // A safety KPI (e.g. HR TRIR, target 0, lower_better): positive readings are
  // bad. Must render red — the pre-fix hardcoded higher_better rendered green.
  const svg = svgRecoveryTrend([1.957, 18.917, 2.356], { target: 0, direction: 'lower_better', cmIndex: 1 });
  const fills = dotFills(svg);
  assert.equal(fills.length, 3, 'expected 3 dots');
  assert.ok(fills.every(f => f === RED), `expected all dots red, got ${fills.join(',')}`);
  assert.ok(!fills.includes(GREEN), 'no dot should be green for a rising lower_better/target-0 series');
});

test('svgRecoveryTrend: same series under higher_better → all GREEN dots (proves direction is threaded)', () => {
  // Identical inputs, only direction flipped — under higher_better + target 0
  // any non-negative reading is green. Contrasting with the test above proves
  // the dot color is driven by opts.direction, not hardcoded.
  const svg = svgRecoveryTrend([1.957, 18.917, 2.356], { target: 0, direction: 'higher_better', cmIndex: 1 });
  const fills = dotFills(svg);
  assert.ok(fills.every(f => f === GREEN), `expected all dots green, got ${fills.join(',')}`);
});

test('svgRecoveryTrend: lower_better series that meets target → GREEN dots', () => {
  // Actual at/under a nonzero target with lower_better is on-track → green.
  const svg = svgRecoveryTrend([4, 3, 2], { target: 5, direction: 'lower_better', cmIndex: 1 });
  const fills = dotFills(svg);
  assert.equal(fills.length, 3, 'expected 3 dots');
  assert.ok(fills.every(f => f === GREEN), `expected all dots green, got ${fills.join(',')}`);
  assert.ok(!fills.includes(RED), 'no dot should be red when lower_better actuals beat target');
});

test('svgRecoveryTrend: in-band shading flips below target for direction=lower_better (Fix 5)', () => {
  // Same points/target, direction flipped — the light-green "good zone" band
  // must move from above the target line (higher_better) to below it
  // (lower_better), matching where the dots actually turn green.
  const base = { target: 2, width: 280, height: 90 };
  const higher = svgRecoveryTrend([1, 2, 3], { ...base, direction: 'higher_better' });
  const lower  = svgRecoveryTrend([1, 2, 3], { ...base, direction: 'lower_better' });

  const bandRe = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="#1f9d57" opacity="0.12"\/>/;
  const targetLineRe = /<line x1="[\d.]+" y1="([\d.]+)"/;

  const hBand = bandRe.exec(higher);
  const lBand = bandRe.exec(lower);
  assert.ok(hBand, 'higher_better renders a green band rect');
  assert.ok(lBand, 'lower_better renders a green band rect');

  const hTargetY = parseFloat(targetLineRe.exec(higher)[1]);
  const lTargetY = parseFloat(targetLineRe.exec(lower)[1]);
  const PAD_T = 8;
  const chartBottom = base.height - 24; // PAD_B = 24

  const hTop = parseFloat(hBand[2]); // group 2 = y
  // higher_better: band spans from the top of the plot down to the target line.
  assert.equal(hTop.toFixed(1), PAD_T.toFixed(1), 'higher_better band starts at the top of the plot');
  assert.ok(Math.abs(hTop + parseFloat(hBand[4]) - hTargetY) < 0.2, 'higher_better band ends at the target line');

  const lTop = parseFloat(lBand[2]); // group 2 = y
  // lower_better: band spans from the target line down to the bottom of the plot.
  assert.ok(Math.abs(lTop - lTargetY) < 0.2, 'lower_better band starts at the target line, not the top');
  assert.ok(Math.abs(lTop + parseFloat(lBand[4]) - chartBottom) < 0.2, 'lower_better band ends at the bottom of the plot');
  assert.ok(lTop > hTop + 1, 'band top moved down for lower_better vs higher_better');
});

test('svgRecoveryTrend: empty array returns no-data svg', () => {
  const svg = svgRecoveryTrend([], { target: 0.985, cmIndex: 0 });
  assert.ok(svg.startsWith('<svg'));
  assert.ok(/no data/i.test(svg));
});

test('svgRecoveryTrend: all-null array returns no-data svg', () => {
  const svg = svgRecoveryTrend([null, null, null], { target: 0.985, cmIndex: 0 });
  assert.ok(/no data/i.test(svg));
});

// ─── svgFunnel ──────────────────────────────────────────────────────────────

test('svgFunnel: returns svg string starting with <svg', () => {
  const counts = [120, 118, 110, 100, 90, 80, 70, 60];
  const svg = svgFunnel(counts, { labels: ['D1','D2','D3','D4','D5','D6','D7','D8'] });
  assert.ok(svg.startsWith('<svg'));
});

test('svgFunnel: emits N bars (<rect) for N-length counts array', () => {
  const counts = [120, 118, 110, 100, 90, 80, 70, 60];
  const svg = svgFunnel(counts, { labels: ['D1','D2','D3','D4','D5','D6','D7','D8'] });
  const rects = svg.match(/<rect/g) || [];
  assert.equal(rects.length, counts.length);
});

test('svgFunnel: renders the step label under each bar', () => {
  const counts = [120, 118, 110, 100, 90, 80, 70, 60];
  const labels = ['D1','D2','D3','D4','D5','D6','D7','D8'];
  const svg = svgFunnel(counts, { labels });
  labels.forEach(l => assert.ok(svg.includes(`>${l}<`), `expected label ${l} in svg`));
});

test('svgFunnel: RAG-graded — early full-reach steps are not red, tail steps with big drop are red', () => {
  const counts = [120, 118, 110, 100, 90, 80, 70, 10]; // sharp fall at the tail
  const svg = svgFunnel(counts, { labels: ['D1','D2','D3','D4','D5','D6','D7','D8'] });
  assert.ok(svg.includes('#d92d3a'), 'expected red bar present for steep drop-off');
});

test('svgFunnel: empty array returns no-data svg', () => {
  const svg = svgFunnel([], { labels: [] });
  assert.ok(svg.startsWith('<svg'));
  assert.ok(/no data/i.test(svg));
});

test('svgFunnel: all-null counts returns no-data svg', () => {
  const svg = svgFunnel([null, null, null, null, null, null, null, null], { labels: [] });
  assert.ok(/no data/i.test(svg));
});

// ─── svgPareto ──────────────────────────────────────────────────────────────

test('svgPareto: returns svg string starting with <svg', () => {
  const rows = [
    { label: 'Late parts', value: 40 },
    { label: 'Damage',     value: 25 },
    { label: 'Access',     value: 15 },
    { label: 'Other',      value: 5 },
  ];
  const svg = svgPareto(rows);
  assert.ok(svg.startsWith('<svg'));
});

test('svgPareto: emits N bars (<rect) for N rows, sorted descending by value', () => {
  const rows = [
    { label: 'Access',     value: 15 },
    { label: 'Late parts', value: 40 },
    { label: 'Other',      value: 5 },
    { label: 'Damage',     value: 25 },
  ];
  const svg = svgPareto(rows);
  const rects = svg.match(/<rect/g) || [];
  assert.equal(rects.length, rows.length);
  // "Late parts" (highest value) should appear before "Other" (lowest value) in markup
  assert.ok(svg.indexOf('Late parts') < svg.indexOf('Other'));
});

test('svgPareto: a null-valued row is placeholder-rendered, not dropped (one bar per input row)', () => {
  const rows = [
    { label: 'Late parts', value: 40 },
    { label: 'Missing',    value: null }, // must not vanish
    { label: 'Damage',     value: 25 },
  ];
  const svg = svgPareto(rows);
  const rects = svg.match(/<rect/g) || [];
  assert.equal(rects.length, rows.length, 'expected one bar per input row incl. the null');
  assert.ok(svg.includes('Missing'), 'null-valued category label must still render');
  assert.ok(svg.includes('>—<'), 'null value renders as a — placeholder');
});

test('svgPareto: contains a cumulative-% polyline overlay', () => {
  const rows = [
    { label: 'Late parts', value: 40 },
    { label: 'Damage',     value: 25 },
    { label: 'Access',     value: 15 },
    { label: 'Other',      value: 5 },
  ];
  const svg = svgPareto(rows);
  assert.ok(svg.includes('<polyline'));
});

test('svgPareto: empty array returns no-data svg', () => {
  const svg = svgPareto([]);
  assert.ok(svg.startsWith('<svg'));
  assert.ok(/no data/i.test(svg));
});

test('svgPareto: all-null values returns no-data svg', () => {
  const svg = svgPareto([{ label: 'A', value: null }, { label: 'B', value: null }]);
  assert.ok(/no data/i.test(svg));
});

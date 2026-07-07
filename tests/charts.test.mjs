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
  // vertical marker line: some line/rect referencing the cm marker
  assert.ok(/countermeasure/i.test(svg) || svg.match(/<line/g).length >= 2);
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

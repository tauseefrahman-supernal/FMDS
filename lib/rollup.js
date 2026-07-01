export function rollup(method, childValues = []) {
  const vals = childValues.filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (method === 'sum') return vals.reduce((a, b) => a + b, 0);
  if (method === 'avg') return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  return null; // 'independent' + 'manual' are not derived from children
}

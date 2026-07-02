export function ragStatus(actual, target, direction = 'higher_better',
                          bands = { green: 1.0, amber: 0.95 }) {
  if (actual == null || target == null || Number.isNaN(actual) || Number.isNaN(target)) return 'nodata';
  // Special case: target === 0 (e.g. safety metrics TRIR/DART where 0 incidents = perfect)
  if (target === 0) {
    if (direction === 'lower_better') return actual <= 0 ? 'green' : 'red';
    return actual >= 0 ? 'green' : 'red';
  }
  const ratio = direction === 'higher_better' ? actual / target : target / actual;
  if (ratio >= bands.green) return 'green';
  if (ratio >= bands.amber) return 'amber';
  return 'red';
}

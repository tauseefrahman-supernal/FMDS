export function ragStatus(actual, target, direction = 'higher_better',
                          bands = { green: 1.0, amber: 0.95 }) {
  if (actual == null || target == null || Number.isNaN(actual) || Number.isNaN(target)) return 'nodata';
  const ratio = direction === 'higher_better' ? actual / target : target / actual;
  if (ratio >= bands.green) return 'green';
  if (ratio >= bands.amber) return 'amber';
  return 'red';
}

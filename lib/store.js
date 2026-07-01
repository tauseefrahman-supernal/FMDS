export function createStore(initial = {}) {
  let state = initial; const subs = new Set();
  const notify = () => subs.forEach(fn => fn(state));
  return {
    get: () => state,
    set: (patch) => { state = { ...state, ...patch }; notify(); },
    update: (fn) => { state = fn(state); notify(); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
  };
}

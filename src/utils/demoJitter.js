// Production / native: the measured distance is used as-is.
//
// The web dev/test build overrides this (demoJitter.web.js) to fake movement so
// the warmer/colder loop can be exercised from a desk. Metro resolves the
// platform-specific file automatically, keeping this production path clean.
export function applyDemoJitter(distanceM) {
  return distanceM;
}

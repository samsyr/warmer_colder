// WEB DEV / MANUAL-TESTING ONLY (see README "Running on web").
//
// On web you can't physically walk, so nudge the measured distance by up to
// +/-25 m each reading. That makes the warmer/colder trend change while sitting
// still, which is enough to test the loop. Never used in production — native
// uses demoJitter.js (identity).
export function applyDemoJitter(distanceM) {
  const reported = Math.max(0, distanceM + (Math.random() * 50 - 25));
  console.log(
    `[web demo] measured ${distanceM.toFixed(1)} m -> reported ${reported.toFixed(1)} m`
  );
  return reported;
}

// Core warmer/colder loop (spec §3, §4, §11). UI-independent so the rules are
// easy to reason about and test.

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  CONTROL_INTERVAL_MS,
  ARRIVAL_RADIUS_M,
  MIN_DELTA_M,
  SPEAK_ON_NO_CHANGE,
} from '../config';
import { haversineMeters } from '../utils/geo';
import { say, sayAndWait } from '../utils/speech';
import { UI } from '../i18n';
import { appendPoint, resetTrack } from '../utils/track';
import { voicePhrases as phrases } from '../voices';

/**
 * @param {{latitude:number, longitude:number}} target
 * @param {() => void} onArrive called once when the user reaches the target
 */
export function useWarmerColder(target, onArrive) {
  const [status, setStatus] = useState('idle'); // idle | tracking | arrived | error
  const [distance, setDistance] = useState(null);
  const [trend, setTrend] = useState(null); // 'warmer' | 'colder' | 'same' | null
  const [pointCount, setPointCount] = useState(0);
  const [notice, setNotice] = useState(null); // non-fatal status message
  const [error, setError] = useState(null); // fatal message

  const lastDistance = useRef(null); // last committed distance; trend baseline
  const lastStatus = useRef('warmer'); // resolves dead-band readings; never 'same'
  const intervalRef = useRef(null);
  const inFlight = useRef(false);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(async () => {
    if (inFlight.current) return; // guard against overlapping reads
    inFlight.current = true;
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const here = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      const d = haversineMeters(here, target);
      const dRounded = Math.round(d);
      setDistance(dRounded);
      setNotice(null);

      await appendPoint(here, dRounded);
      setPointCount((c) => c + 1);

      // Arrival check.
      if (d <= ARRIVAL_RADIUS_M) {
        say(phrases.arrived);
        setStatus('arrived');
        stop();
        onArrive && onArrive();
        return;
      }

      // Trend vs. the last committed control point. There is no "no change"
      // state: a dead-band reading inherits the last status (default 'warmer')
      // AND its distance, so the spoken/shown number never contradicts the word.
      if (lastDistance.current == null) {
        lastDistance.current = dRounded;
        setTrend(null);
        say(phrases.first(dRounded));
      } else {
        const delta = lastDistance.current - d; // positive => closer than baseline
        if (delta > MIN_DELTA_M) {
          lastStatus.current = 'warmer';
          lastDistance.current = dRounded;
          setTrend('warmer');
          say(phrases.warmer(dRounded));
        } else if (delta < -MIN_DELTA_M) {
          lastStatus.current = 'colder';
          lastDistance.current = dRounded;
          setTrend('colder');
          say(phrases.colder(dRounded));
        } else {
          // No significant change since the baseline: reuse its distance and
          // status. UI always updates; voice only if SPEAK_ON_NO_CHANGE.
          setTrend(lastStatus.current);
          setDistance(lastDistance.current);
          if (SPEAK_ON_NO_CHANGE) {
            say(phrases[lastStatus.current](lastDistance.current));
          }
        }
      }
    } catch (e) {
      // A single failed reading must not end the session.
      setNotice(UI.hook.noticeSkipped);
    } finally {
      inFlight.current = false;
    }
  }, [target, onArrive, stop]);

  const start = useCallback(async () => {
    setError(null);
    setNotice(null);

    const { status: perm } =
      await Location.requestForegroundPermissionsAsync();
    if (perm !== 'granted') {
      setError(UI.hook.errPermission);
      setStatus('error');
      return;
    }

    await resetTrack();
    lastDistance.current = null;
    lastStatus.current = 'warmer';
    setPointCount(0);
    setTrend(null);
    setDistance(null);
    setStatus('tracking');
    await sayAndWait(phrases.start);

    await tick(); // first reading immediately
    intervalRef.current = setInterval(tick, CONTROL_INTERVAL_MS);
  }, [tick]);

  // Clean up the interval if the component unmounts.
  useEffect(() => stop, [stop]);

  return {
    status,
    distance,
    trend,
    pointCount,
    notice,
    error,
    start,
    stop,
  };
}

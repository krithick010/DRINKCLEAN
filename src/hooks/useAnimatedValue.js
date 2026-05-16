import { useEffect, useRef, useState } from "react";

export function useAnimatedValue(value, duration = 600) {
  const targetValue = Number(value);
  const [animatedValue, setAnimatedValue] = useState(Number.isFinite(targetValue) ? targetValue : null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!Number.isFinite(targetValue)) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      setAnimatedValue(null);
      return () => {};
    }

    const startValue = Number.isFinite(animatedValue) ? animatedValue : targetValue;
    const delta = targetValue - startValue;

    if (delta === 0) {
      setAnimatedValue(targetValue);
      return () => {};
    }

    const startedAt = performance.now();

    const tick = (now) => {
      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startValue + delta * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration]);

  return animatedValue;
}

import { useEffect, useRef } from "react";

// Below this width, the dog blinks through frames 4–8 on a timer instead
// of tracking the cursor/finger — matches the `md` layout breakpoint.
const PHONE_QUERY = "(max-width: 767px)";
const REST_INDEX = 3; // frame-04, resting/eyes-open pose
const BLINK_PEAK_INDEX = 7; // frame-08, furthest point of the blink
const BLINK_FRAME_MS = 120; // a blink, but not a flick
const PAUSE_MIN_MS = 2200;
const PAUSE_MAX_MS = 4500;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useFrameScrub(frameUrls: string[], onScrub?: () => void) {
  const imgRef = useRef<HTMLImageElement>(null);
  const onScrubRef = useRef(onScrub);
  onScrubRef.current = onScrub;
  const rafRef = useRef<number | null>(null);
  const pendingIndexRef = useRef<number | null>(null);

  useEffect(() => {
    frameUrls.forEach((url) => {
      const preload = new Image();
      preload.src = url;
    });
  }, [frameUrls]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || frameUrls.length === 0) return;

    let cleanupLoop: (() => void) | null = null;
    let cleanupInteractive: (() => void) | null = null;

    const startLoop = () => {
      let cancelled = false;
      let timeoutId: number | null = null;
      const schedule = (fn: () => void, delay: number) => {
        timeoutId = window.setTimeout(fn, delay);
      };

      // closing then reopening: 4,5,6,7,8,7,6,5,4
      const blinkSequence: number[] = [];
      for (let i = REST_INDEX; i <= BLINK_PEAK_INDEX; i++) blinkSequence.push(i);
      for (let i = BLINK_PEAK_INDEX - 1; i >= REST_INDEX; i--) blinkSequence.push(i);

      const playBlink = (step: number) => {
        if (cancelled) return;
        if (step >= blinkSequence.length) {
          rest();
          return;
        }
        img.src = frameUrls[blinkSequence[step]];
        schedule(() => playBlink(step + 1), BLINK_FRAME_MS);
      };

      const rest = () => {
        if (cancelled) return;
        img.src = frameUrls[REST_INDEX];
        const pause = PAUSE_MIN_MS + Math.random() * (PAUSE_MAX_MS - PAUSE_MIN_MS);
        schedule(() => playBlink(0), pause);
      };

      rest();

      return () => {
        cancelled = true;
        if (timeoutId !== null) window.clearTimeout(timeoutId);
      };
    };

    const stopLoop = () => {
      cleanupLoop?.();
      cleanupLoop = null;
    };

    const startInteractive = () => {
      const applyPendingFrame = () => {
        rafRef.current = null;
        const index = pendingIndexRef.current;
        if (index === null) return;
        pendingIndexRef.current = null;
        img.src = frameUrls[index];
      };

      const applyClientX = (clientX: number) => {
        const ratio = clamp(clientX / window.innerWidth, 0, 1);
        const index = Math.round(ratio * (frameUrls.length - 1));
        pendingIndexRef.current = index;
        onScrubRef.current?.();
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(applyPendingFrame);
        }
      };

      const handleMouseMove = (event: MouseEvent) => applyClientX(event.clientX);
      const handleTouchMove = (event: TouchEvent) => {
        const touch = event.touches[0];
        if (touch) applyClientX(touch.clientX);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    };

    const applyMode = (isPhone: boolean) => {
      stopLoop();
      cleanupInteractive?.();
      cleanupInteractive = isPhone ? null : startInteractive();
      if (isPhone) cleanupLoop = startLoop();
    };

    const mql = window.matchMedia(PHONE_QUERY);
    applyMode(mql.matches);
    const handleChange = (event: MediaQueryListEvent) => applyMode(event.matches);
    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
      stopLoop();
      cleanupInteractive?.();
    };
  }, [frameUrls]);

  return imgRef;
}

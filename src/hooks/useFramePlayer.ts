import { useEffect, useRef } from "react";

const TURN_MS = 850; // a full turn takes the same time, whatever the frame count

// Plays the frames forward to the last one while `open`, and back to the first
// when closed. Interruptible: it always walks from wherever it currently is.
export function useFramePlayer(frameUrls: string[], open: boolean) {
  const imgRef = useRef<HTMLImageElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const last = frameUrls.length - 1;
    const target = open ? last : 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      indexRef.current = target;
      img.src = frameUrls[target];
      return;
    }

    const stepMs = TURN_MS / last;
    let timer: number | null = null;
    const step = () => {
      const current = indexRef.current;
      if (current === target) return;
      const next = current + (target > current ? 1 : -1);
      indexRef.current = next;
      img.src = frameUrls[next];
      timer = window.setTimeout(step, stepMs);
    };
    step();

    return () => {
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [open, frameUrls]);

  return imgRef;
}

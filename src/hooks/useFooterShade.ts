import { useEffect, useRef } from "react";

const MAX_OPACITY = 0.35;

// Fades a shade in over the rail as the footer slides up, so the light rail
// and the dark footer don't clash. Fully shaded once the footer is all in view.
export function useFooterShade() {
  const shadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shade = shadeRef.current;
    const footer = document.querySelector("footer");
    if (!shade || !footer) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = footer.getBoundingClientRect();
      const progress = Math.min(Math.max((window.innerHeight - top) / height, 0), 1);
      shade.style.opacity = String(progress * MAX_OPACITY);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return shadeRef;
}

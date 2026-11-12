import { useEffect, useRef } from "react";

// For a `position: sticky` element taller than the screen: sets `top` so it
// sticks once its bottom edge reaches the bottom of the screen, letting the
// next section slide up over it.
export function usePinAtBottom<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      el.style.top = `${Math.min(0, window.innerHeight - el.offsetHeight)}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return ref;
}

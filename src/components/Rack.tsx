import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFramePlayer } from "../hooks/useFramePlayer";
import { GARMENTS, garmentFrameUrls, type Garment } from "../wardrobe";

// Slot widths as a fraction of the garment image width (--w).
// Rest: everything side-on. Open: one piece faces front, the rest bunch up like curtains.
const SLOT = { rest: "var(--c0)", bunched: "var(--c1)", open: "0.92" };
// Same ratios as numbers (desktop values) — only used to work out which way each piece slides.
const RATIO = { rest: 0.4, bunched: 0.3, open: 0.92 };

const FADE_BOTTOM = {
  maskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
  WebkitMaskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
};

const HOVER_DELAY_MS = 120; // hover intent before a piece opens
const LEAVE_DELAY_MS = 220; // grace period when the cursor leaves the rail
const SETTLE_MS = 420; // ignore hover changes while the rail is sliding

function slotCentres(active: number | null) {
  const widths = GARMENTS.map((_, i) =>
    active === null ? RATIO.rest : i === active ? RATIO.open : RATIO.bunched
  );
  const total = widths.reduce((a, b) => a + b, 0);
  let x = -total / 2;
  return widths.map((w) => {
    const centre = x + w / 2;
    x += w;
    return centre;
  });
}

interface HangerProps {
  garment: Garment;
  index: number;
  open: boolean;
  slot: string;
  preload: boolean;
  swingRef: (el: HTMLDivElement | null) => void;
  onHover: (index: number | null) => void;
  onToggle: (index: number) => void;
}

function Hanger({ garment, index, open, slot, preload, swingRef, onHover, onToggle }: HangerProps) {
  const frameUrls = useMemo(() => garmentFrameUrls(garment), [garment]);
  const imgRef = useFramePlayer(frameUrls, open);
  const pointerType = useRef("mouse");

  useEffect(() => {
    if (!preload) return;
    frameUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [preload, frameUrls]);

  return (
    <li
      className="relative h-[calc(var(--w)*4/3+2.25rem)] shrink-0 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{ width: `calc(var(--w) * ${slot})`, zIndex: open ? 10 : undefined }}
    >
      <button
        type="button"
        aria-pressed={open}
        aria-label={`${garment.name} in ${garment.colour}`}
        className="absolute inset-0 z-20 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-caramel-600 focus-visible:ring-offset-4 focus-visible:ring-offset-bone-100"
        onPointerEnter={(event) => {
          pointerType.current = event.pointerType;
          if (event.pointerType === "mouse") onHover(index);
        }}
        onPointerDown={(event) => (pointerType.current = event.pointerType)}
        onClick={() => {
          // Mouse users open by hovering; taps and the keyboard toggle.
          if (pointerType.current !== "mouse" || !open) onToggle(index);
          pointerType.current = "keyboard";
        }}
      />

      {/* the hanging piece, centred on its slot and free to overflow it */}
      <div className="pointer-events-none absolute left-1/2 top-0 w-[var(--w)] -translate-x-1/2">
        <div ref={swingRef} className="origin-top">
          <svg
            aria-hidden
            viewBox="0 0 24 34"
            className="mx-auto h-9 w-6 text-coffee-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M12 34V22c0-4 7-5 7-12 0-5-3.5-8-7-8S5 4.5 5 8" />
          </svg>
          <img
            ref={imgRef}
            src={frameUrls[0]}
            alt=""
            width={480}
            height={640}
            loading="lazy"
            draggable={false}
            style={garment.cutAtBottom ? FADE_BOTTOM : undefined}
            className="-mt-3 aspect-[3/4] w-full select-none object-contain drop-shadow-[0_18px_22px_rgba(27,18,11,0.22)]"
          />
        </div>
      </div>
    </li>
  );
}

export default function Rack() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const swingEls = useRef<(HTMLDivElement | null)[]>([]);
  const [preload, setPreload] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  // --- hover intent: avoids flicker while pieces slide under the cursor ---
  const hovered = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const settlingUntil = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  const schedule = useCallback((delay: number) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      const wait = settlingUntil.current - performance.now();
      if (wait > 0) {
        schedule(wait);
        return;
      }
      if (hovered.current !== activeRef.current) setActive(hovered.current);
    }, delay);
  }, []);

  const handleHover = useCallback(
    (index: number | null) => {
      hovered.current = index;
      schedule(index === null ? LEAVE_DELAY_MS : HOVER_DELAY_MS);
    },
    [schedule]
  );

  const handleToggle = useCallback((index: number) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setActive((current) => (current === index ? null : index));
  }, []);

  useEffect(() => () => void (timer.current !== null && window.clearTimeout(timer.current)), []);

  // Tap outside the rail closes the open piece (touch screens).
  useEffect(() => {
    if (active === null) return;
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && !railRef.current?.contains(event.target as Node)) setActive(null);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setActive(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  // --- curtain swing: each piece sways the opposite way to how its slot moved ---
  const previous = useRef<number | null>(null);
  useLayoutEffect(() => {
    const before = slotCentres(previous.current);
    const after = slotCentres(active);
    previous.current = active;
    settlingUntil.current = performance.now() + SETTLE_MS;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    after.forEach((centre, i) => {
      const el = swingEls.current[i];
      const moved = centre - before[i];
      if (!el || Math.abs(moved) < 0.01) return;
      const a = Math.max(-6, Math.min(6, moved * 9)); // degrees, bigger move = bigger sway
      el.animate(
        [
          { transform: "rotate(0deg)" },
          { transform: `rotate(${a}deg)`, offset: 0.3 },
          { transform: `rotate(${-a * 0.45}deg)`, offset: 0.6 },
          { transform: `rotate(${a * 0.15}deg)`, offset: 0.82 },
          { transform: "rotate(0deg)" },
        ],
        { duration: 1100, easing: "ease-out" }
      );
    });
  }, [active]);

  // Only fetch the turn frames once the rail is close to the screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPreload(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = active === null ? null : GARMENTS[active];

  return (
    <section
      id="rail"
      ref={sectionRef}
      aria-labelledby="rail-title"
      className="relative z-10 overflow-hidden rounded-t-[2rem] bg-bone-100 pb-24 pt-20 shadow-[0_-30px_60px_-30px_rgba(27,18,11,0.4)] md:rounded-t-[3rem] md:pb-32 md:pt-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-10">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-caramel-600 sm:text-sm">The first rail</p>
          <h2
            id="rail-title"
            className="mt-3 font-display text-[clamp(2rem,1.3rem+3vw,4rem)] font-medium leading-[1.05] tracking-tight text-coffee-950"
          >
            Five pieces for <em className="italic">colder</em> walks.
          </h2>
          <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-coffee-700 md:text-lg">
            Knits, fleece and a proper raincoat, each cut to move with the dog wearing it.{" "}
            <span className="scrub-hint-mouse">Hover over a piece to take it off the rail.</span>
            <span className="scrub-hint-touch">Tap a piece to take it off the rail.</span>
          </p>
        </div>

        <div className="relative mt-14 md:mt-20">
          {/* the rail itself, with wall brackets at each end */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-3 rounded-full bg-gradient-to-b from-caramel-300 via-caramel-500 to-coffee-800 shadow-[0_6px_10px_-4px_rgba(27,18,11,0.45)]" />
          <div aria-hidden className="absolute -top-3 left-3 hidden h-7 w-2 rounded-sm bg-coffee-800 sm:block" />
          <div aria-hidden className="absolute -top-3 right-3 hidden h-7 w-2 rounded-sm bg-coffee-800 sm:block" />

          <ul
            ref={railRef}
            onPointerLeave={(event) => event.pointerType === "mouse" && handleHover(null)}
            className="relative -mt-0.5 flex justify-center [--c0:0.36] [--c1:0.21] [--w:200px] sm:[--c0:0.4] sm:[--c1:0.3] sm:[--w:270px] lg:[--w:340px]"
          >
            {GARMENTS.map((garment, i) => (
              <Hanger
                key={garment.id}
                garment={garment}
                index={i}
                open={active === i}
                slot={active === null ? SLOT.rest : active === i ? SLOT.open : SLOT.bunched}
                preload={preload}
                swingRef={(el) => (swingEls.current[i] = el)}
                onHover={handleHover}
                onToggle={handleToggle}
              />
            ))}
          </ul>

          <p aria-live="polite" className="mt-8 flex min-h-[3.5rem] flex-col items-center text-center">
            {current ? (
              <>
                <span className="font-display text-xl leading-tight text-coffee-950 md:text-2xl">{current.name}</span>
                <span className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-caramel-600">{current.colour}</span>
              </>
            ) : (
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-coffee-800/60">
                <span className="scrub-hint-mouse">Hover to turn</span>
                <span className="scrub-hint-touch">Tap to turn</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

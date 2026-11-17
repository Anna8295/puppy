import { useEffect, useRef, useState, type FormEvent } from "react";
import NotifyDialog from "./NotifyDialog";
import { PET_FRAME_URLS } from "../petFrames";

interface OfferPopupProps {
  // The visitor already gave an email in the hero form: don't ask again.
  signedUp: boolean;
  onSignedUp: () => void;
}

// True once the rail has scrolled at least halfway up the screen, false again
// when the visitor goes back up to the hero (which has its own email form).
function useRailInView() {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const update = () => {
      const rail = document.getElementById("rail");
      if (rail) setInView(rail.getBoundingClientRect().top < window.innerHeight * 0.5);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return inView;
}

// A gentle "15% off" card in the corner. It only appears once the visitor has
// moved past the hero, waits a moment, and stays gone once closed.
export default function OfferPopup({ signedUp, onSignedUp }: OfferPopupProps) {
  const railInView = useRailInView();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Wait a little after reaching the rail, so it doesn't jump in mid-scroll.
  useEffect(() => {
    if (!railInView || ready) return;
    const timer = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, [railInView, ready]);

  const visible = ready && railInView && !dismissed && !signedUp;

  // While hidden, keep the card out of the tab order and away from screen readers.
  const asideRef = useRef<HTMLElement>(null);
  useEffect(() => {
    asideRef.current?.toggleAttribute("inert", !visible);
  }, [visible]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
    const value = email.trim();
    input.value = value;
    if (!value || !input.checkValidity()) {
      input.reportValidity();
      return;
    }
    // Portfolio project: nothing is sent or stored. Clear the field and explain why.
    setEmail("");
    onSignedUp();
    setDialogOpen(true);
  };

  return (
    <>
      <aside
        aria-label="Opening offer"
        ref={asideRef}
        aria-hidden={!visible}
        className={`fixed inset-x-4 bottom-4 z-40 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[22rem] md:right-10 md:bottom-10 ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-[1.5rem] bg-bone-100 p-5 pr-12 text-coffee-950 shadow-[0_24px_60px_-20px_rgba(27,18,11,0.6)] ring-1 ring-coffee-950/5 sm:p-6 sm:pr-12">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Close the offer"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-coffee-800/60 transition-colors hover:bg-coffee-950/5 hover:text-coffee-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-caramel-600"
          >
            <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-sand-300 ring-2 ring-sand-300">
              <img src={PET_FRAME_URLS[3]} alt="" className="h-full w-full scale-[1.7] object-cover object-[50%_22%]" />
            </div>
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-caramel-600">Opening offer</p>
              <p className="font-display text-2xl font-medium leading-tight tracking-tight">
                15% off your <em className="italic">first</em> order
              </p>
            </div>
          </div>

          <p className="mt-3 font-body text-sm leading-relaxed text-coffee-700">
            Like what’s on the rail? Join the list and we’ll send a code when we open.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex items-stretch gap-2">
            <label htmlFor="offer-email" className="sr-only">
              Your email
            </label>
            <input
              id="offer-email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your email"
              className="min-w-0 flex-1 border-b border-clay-600/60 bg-transparent py-1.5 font-body text-sm text-coffee-950 placeholder:text-coffee-800/50 transition-colors focus-visible:border-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-600"
            />
            <button
              type="submit"
              className="shrink-0 bg-caramel-500 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-sand-100 transition-colors hover:bg-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coffee-950"
            >
              Get 15%
            </button>
          </form>
          <p className="mt-2 font-body text-[0.7rem] text-coffee-800/70">
            Demo only: nothing is sent or stored, and there’s no real code.
          </p>
        </div>
      </aside>
      <NotifyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}

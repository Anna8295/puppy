import { useEffect, useRef } from "react";
import { PET_FRAME_URLS } from "../petFrames";

interface NotifyDialogProps {
  open: boolean;
  onClose: () => void;
}

// Cord & Coat is a portfolio project, so the "Notify me" form never sends anything.
// This tells the visitor so — kindly, and in the shop's voice.
export default function NotifyDialog({ open, onClose }: NotifyDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      primaryRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const goToRail = () => {
    onClose();
    document.getElementById("rail")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="notify-dialog-title"
      aria-describedby="notify-dialog-text"
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="dialog-pop w-[min(26rem,calc(100vw-2rem))] overflow-visible rounded-[1.75rem] bg-bone-100 p-0 text-coffee-950 shadow-[0_30px_80px_-20px_rgba(27,18,11,0.6)] backdrop:bg-coffee-950/45 backdrop:backdrop-blur-sm"
    >
      <div className="relative px-6 pb-6 pt-14 text-center sm:px-8 sm:pb-8">
        {/* the puppy peeking over the top of the card */}
        <div className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-sand-300 shadow-[0_10px_24px_-8px_rgba(27,18,11,0.5)] ring-4 ring-bone-100">
          <img src={PET_FRAME_URLS[3]} alt="" className="h-full w-full scale-[1.7] object-cover object-[50%_22%]" />
        </div>

        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-caramel-600">A small confession</p>
        <h2 id="notify-dialog-title" className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight">
          No emails will be <em className="italic">fetched</em>.
        </h2>
        <div id="notify-dialog-text" className="mt-3 space-y-2 font-body text-[0.95rem] leading-relaxed text-coffee-700">
          <p>
            Cord &amp; Coat is a pretend shop — a portfolio project made for fun. There’s no mailing list, so nothing
            will ever land in your inbox.
          </p>
          <p>We didn’t keep your address either. The jumpers are still nice to look at, though.</p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={goToRail}
            className="px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-coffee-800 underline-offset-4 transition-colors hover:text-caramel-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-600"
          >
            See the rail
          </button>
          <button
            ref={primaryRef}
            type="button"
            onClick={onClose}
            className="bg-caramel-500 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-sand-100 transition-colors hover:bg-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coffee-950"
          >
            Fair enough
          </button>
        </div>
      </div>
    </dialog>
  );
}

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { GARMENTS, garmentFrameUrls } from "../wardrobe";
import { preparePhoto, tryOn, TryOnError, type PreparedPhoto, type TryOnErrorCode } from "../tryOn";

interface TryOnDialogProps {
  open: boolean;
  onClose: () => void;
  /** the piece that was open on the rail, if any */
  garmentId?: string;
}

const ERRORS: Record<TryOnErrorCode, string> = {
  unreadable: "We couldn’t open that photo. Try a JPEG or PNG.",
  small: "That photo is a little small. Try a bigger one.",
  visitor: "That’s your three try-ons for today. The fitting room opens again tomorrow.",
  site: "The fitting room is full for today: we make 40 free pictures a day. Come back tomorrow.",
  quota: "The fitting room is full for today: we make 40 free pictures a day. Come back tomorrow.",
  slow: "One at a time, please. Wait a minute, then try again.",
  failed: "Something went wrong on our side. Please try again.",
};

// shown one after another while the picture is made (about 5 seconds)
const STEPS = ["Measuring the chest…", "Finding the leg holes…", "Folding the collar…", "Smoothing the fur…"];

const BUTTON =
  "bg-caramel-600 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-sand-100 transition-colors hover:bg-coffee-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coffee-950";
const QUIET =
  "font-mono text-xs uppercase tracking-[0.15em] text-coffee-800 underline-offset-4 transition-colors hover:text-caramel-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-600";

export default function TryOnDialog({ open, onClose, garmentId }: TryOnDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [garment, setGarment] = useState(garmentId ?? GARMENTS[0].id);
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ image: string; garment: string } | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // opening from a piece on the rail picks that piece
  useEffect(() => {
    if (open && garmentId) setGarment(garmentId);
  }, [open, garmentId]);

  // the preview is a blob: URL of the prepared photo; free it when replaced
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1600);
    return () => window.clearInterval(timer);
  }, [busy]);

  const takePhoto = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const prepared = await preparePhoto(file);
      setPhoto(prepared);
      setPreview(URL.createObjectURL(prepared.blob));
      setResult(null);
      setShowBefore(false);
    } catch (e) {
      setError(ERRORS[e instanceof TryOnError ? e.code : "unreadable"]);
    }
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    void takePhoto(event.target.files?.[0]);
    event.target.value = ""; // choosing the same file again still counts
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void takePhoto(event.dataTransfer.files[0]);
  };

  const dress = async () => {
    if (!photo || busy) return;
    setBusy(true);
    setError(null);
    try {
      const made = await tryOn(photo, garment);
      setResult({ image: made.image, garment });
      setRemaining(made.remaining);
      setShowBefore(false);
    } catch (e) {
      const code = e instanceof TryOnError ? e.code : "failed";
      setError(ERRORS[code]);
      if (code === "visitor" || code === "site" || code === "quota") setRemaining(0);
    } finally {
      setBusy(false);
    }
  };

  const dressed = result ? GARMENTS.find((g) => g.id === result.garment) : null;
  const shown = result && !showBefore ? result.image : preview;
  const outOfTries = remaining === 0;
  const sameAsShown = result?.garment === garment;
  const picked = GARMENTS.find((g) => g.id === garment)!;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="dialog-pop max-h-[calc(100dvh-2rem)] w-[min(52rem,calc(100vw-2rem))] overflow-y-auto rounded-[1.75rem] bg-bone-100 p-0 text-coffee-950 shadow-[0_30px_80px_-20px_rgba(27,18,11,0.6)] backdrop:bg-coffee-950/45 backdrop:backdrop-blur-sm"
    >
      <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the fitting room"
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-bone-100/90 text-coffee-800 transition-colors hover:text-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-caramel-600"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* the photo: drop zone, then the photo or the dressed picture */}
        <div>
          {shown ? (
            <figure className="relative overflow-hidden rounded-2xl bg-sand-300">
              <img
                src={shown}
                alt={
                  result && !showBefore
                    ? `Your dog wearing the ${dressed!.name} in ${dressed!.colour}, made by AI`
                    : "Your photo"
                }
                className={`block w-full object-cover max-md:max-h-[40dvh] transition-[filter] duration-500 ${busy ? "blur-[2px] brightness-90" : ""}`}
              />
              {busy && (
                <div className="absolute inset-0 grid place-items-center bg-coffee-950/25">
                  <span className="rounded-full bg-bone-100 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-coffee-950 shadow-lg">
                    {STEPS[step]}
                  </span>
                </div>
              )}
              {result && !busy && (
                <span className="absolute left-3 top-3 rounded-full bg-bone-100/90 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-coffee-950">
                  {showBefore ? "Before" : "Made by AI"}
                </span>
              )}
            </figure>
          ) : (
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex aspect-[4/3] cursor-pointer md:aspect-[3/4] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-caramel-600 ${
                dragging ? "border-caramel-600 bg-sand-100" : "border-sand-500 bg-sand-100/60 hover:border-caramel-500"
              }`}
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-10 w-10 text-caramel-600" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.3-2h6l1.3 2h1.2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
                <circle cx="12" cy="12.5" r="3.5" />
              </svg>
              <span className="font-display text-xl font-medium leading-tight">Choose or take a photo</span>
              <span className="max-w-[16rem] font-body text-sm leading-relaxed text-coffee-700">
                The whole dog in view, facing you or side-on, in good light.
              </span>
              <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
            </label>
          )}

          {photo && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <label className={`${QUIET} cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-caramel-600`}>
                Change photo
                <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
              </label>
              {result && !busy && (
                <button type="button" aria-pressed={showBefore} onClick={() => setShowBefore((b) => !b)} className={QUIET}>
                  {showBefore ? "Show the outfit" : "Show before"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* the controls */}
        <div className="flex flex-col">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-caramel-600">The fitting room</p>
          <h2 id={titleId} className="mt-2 pr-10 font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            Try it on <em className="italic">your</em> dog.
          </h2>
          <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-coffee-700">
            Add a photo, pick a piece, and AI dresses your dog in about five seconds.
          </p>

          <fieldset className="mt-6">
            <legend className="font-mono text-xs uppercase tracking-[0.15em] text-coffee-800">Pick a piece</legend>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {GARMENTS.map((g) => (
                <label
                  key={g.id}
                  className="group relative cursor-pointer rounded-xl bg-sand-100 p-1 ring-2 ring-transparent transition has-[:checked]:bg-bone-100 has-[:checked]:ring-caramel-600 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-coffee-950"
                >
                  <input
                    type="radio"
                    name="garment"
                    value={g.id}
                    checked={garment === g.id}
                    onChange={() => setGarment(g.id)}
                    aria-label={`${g.name}, ${g.colour}`}
                    className="sr-only"
                  />
                  <img src={garmentFrameUrls(g).at(-1)} alt="" className="aspect-[3/4] w-full object-contain" />
                </label>
              ))}
            </div>
            <p aria-live="polite" className="mt-3 flex flex-col">
              <span className="font-display text-lg leading-tight">{picked.name}</span>
              <span className="mt-0.5 font-mono text-xs uppercase tracking-[0.15em] text-caramel-600">{picked.colour}</span>
            </p>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button type="button" onClick={dress} disabled={!photo || busy || outOfTries || sameAsShown} className={BUTTON}>
              {busy ? "Dressing…" : result ? "Try this one" : "Dress my dog"}
            </button>
            {result && !busy && (
              <a href={result.image} download={`cord-and-coat-${result.garment}.jpg`} className={QUIET}>
                Download
              </a>
            )}
          </div>

          <div aria-live="polite" className="mt-3 min-h-[1.5rem] font-body text-sm leading-relaxed">
            {error ? (
              <p className="text-caramel-600">{error}</p>
            ) : remaining !== null && remaining > 0 ? (
              <p className="text-coffee-700">
                {remaining === 1 ? "One more try-on left today." : `${remaining} more try-ons left today.`}
              </p>
            ) : null}
          </div>

          <p className="mt-auto border-t border-sand-300 pt-4 font-body text-xs leading-relaxed text-coffee-700">
            Your photo is made smaller and its location data removed in your browser, then sent to Cloudflare’s AI to
            make the picture. Nothing is kept. Dogs only, please: no people in the photo. Three try-ons per visitor a
            day.{" "}
            <a href={`${import.meta.env.BASE_URL}privacy.html#try-on`} className="underline decoration-caramel-500/50 underline-offset-4 hover:text-caramel-600">
              Privacy
            </a>
          </p>
        </div>
      </div>
    </dialog>
  );
}

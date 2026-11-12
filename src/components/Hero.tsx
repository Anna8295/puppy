import { useState, type FormEvent } from "react";
import NotifyDialog from "./NotifyDialog";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setDialogOpen(true);
  };

  return (
    <section className="relative z-10 min-h-[100svh] md:flex md:items-center md:pl-[4vw] xl:pl-[6vw]">
      <div className="absolute inset-x-0 top-[55vh] bottom-0 overflow-y-auto rounded-t-[2rem] bg-bone-100/40 p-6 shadow-[0_20px_50px_-20px_rgba(27,18,11,0.45)] ring-1 ring-coffee-950/5 backdrop-blur-xl sm:p-7 md:static md:inset-auto md:max-w-lg md:overflow-visible md:rounded-2xl xl:max-w-2xl xl:rounded-none xl:bg-transparent xl:p-0 xl:shadow-none xl:ring-0 xl:backdrop-blur-none">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-caramel-600 sm:text-sm xl:text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-caramel-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-caramel-600" />
          </span>
          Opening Winter 2026
        </p>

        <h1 className="mt-3 max-w-sm text-[clamp(1.875rem,1.1rem+3.6vw,4.5rem)] font-display font-medium leading-[1.05] tracking-tight text-coffee-950 sm:mt-4 md:mt-5 xl:mt-6 xl:max-w-none xl:text-[clamp(3.5rem,2rem+3vw,6.5rem)]">
          Dressed for every <em className="font-display italic">walk</em>.
        </h1>

        <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-coffee-700 sm:mt-4 sm:text-base md:mt-5 md:text-lg xl:mt-6 xl:max-w-lg xl:text-xl">
          Cable knits, teddy fleece and a proper raincoat for dogs with character. Our first rail is almost ready.
        </p>

        <form
          id="notify"
          onSubmit={handleSubmit}
          className="mt-4 max-w-sm border-t border-clay-600/30 pt-4 sm:mt-5 sm:pt-5 md:mt-8 xl:mt-10 xl:max-w-md xl:pt-6"
        >
          <label
            htmlFor="notify-email"
            className="block font-mono text-xs uppercase tracking-[0.2em] text-coffee-800 xl:text-xs"
          >
            Get the opening notice
          </label>
          <div className="mt-3 flex items-stretch gap-3 xl:mt-4 xl:gap-4">
            <input
              id="notify-email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your email"
              className="min-w-0 flex-1 border-b border-clay-600/60 bg-transparent py-1.5 font-body text-sm text-coffee-950 placeholder:text-coffee-800/50 transition-colors focus-visible:border-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-600 disabled:opacity-60 sm:py-2 sm:text-base xl:py-2 xl:text-base"
            />
            <button
              type="submit"
              className="shrink-0 bg-caramel-500 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-sand-100 transition-colors hover:bg-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coffee-950 sm:px-5 sm:py-2 sm:text-sm xl:px-6 xl:py-2 xl:text-sm"
            >
              Notify me
            </button>
          </div>
        </form>
        <NotifyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      </div>
    </section>
  );
}

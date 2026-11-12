const LINK =
  "transition-colors hover:text-caramel-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-300";

function scrollToTop(event: React.MouseEvent) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer className="relative z-10 -mt-8 overflow-hidden rounded-t-[2rem] bg-coffee-950 text-bone-100 md:-mt-12 md:rounded-t-[3rem]">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8 md:px-10 md:pt-20">
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-sm">
            <a href="#top" onClick={scrollToTop} className={`font-display text-3xl tracking-tight md:text-4xl ${LINK}`}>
              Cord &amp; Coat
            </a>
            <p className="mt-4 text-sm leading-relaxed text-bone-300/80">
              Knits, fleece and raincoats for dogs who take their walks seriously. Hand-picked, slightly fussy,
              always warm.
            </p>
          </div>

          <nav aria-label="Footer" className="font-mono text-xs uppercase tracking-[0.2em] text-bone-300">
            <ul className="flex flex-wrap gap-x-8 gap-y-4">
              <li>
                <a href="#rail" className={LINK}>
                  The rail
                </a>
              </li>
              <li>
                <a href="#notify" className={LINK}>
                  Get notified
                </a>
              </li>
              <li>
                <a href="#top" onClick={scrollToTop} className={LINK}>
                  Back to top ↑
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div aria-hidden className="mt-14 flex items-center gap-4 text-caramel-400/70">
          <span className="h-px flex-1 bg-bone-100/15" />
          <svg viewBox="0 0 40 22" className="h-5 w-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7.5V6a2.5 2.5 0 1 1 2.5 2.5" />
            <path d="M20 8.5 3 19h34L20 8.5Z" />
          </svg>
          <span className="h-px flex-1 bg-bone-100/15" />
        </div>

        <div className="mt-6 flex flex-col gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-300/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Cord &amp; Coat · a portfolio project, not a real shop</p>
          <p>
            Made with React &amp; a very good puppy ·{" "}
            <a href="https://github.com/Anna8295/puppy" target="_blank" rel="noopener noreferrer" className={LINK}>
              Source
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

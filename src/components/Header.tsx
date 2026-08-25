export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-6 sm:px-8 md:px-10">
      <span className="font-display text-lg tracking-tight text-coffee-950">
        Cord <span className="text-caramel-600">&amp;</span> Coat
      </span>
      <a
        href="#notify"
        className="hidden font-mono text-xs uppercase tracking-[0.2em] text-coffee-800 transition-colors hover:text-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-600 sm:inline-block"
      >
        Get notified
      </a>
    </header>
  );
}

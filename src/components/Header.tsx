interface HeaderProps {
  solid: boolean;
}

export default function Header({ solid }: HeaderProps) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 transition-[background-color,padding,box-shadow] duration-300 sm:px-8 md:px-10 ${
        solid
          ? "bg-bone-100/80 py-4 shadow-[0_1px_0_rgba(27,18,11,0.08)] backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="font-display text-lg tracking-tight text-coffee-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-600"
      >
        Cord <span className="text-caramel-600">&amp;</span> Coat
      </a>
      <nav className="hidden items-center gap-6 sm:flex">
        <a
          href="#rail"
          className="font-mono text-xs uppercase tracking-[0.2em] text-coffee-800 transition-colors hover:text-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-600"
        >
          The rail
        </a>
        <a
          href="#notify"
          className="font-mono text-xs uppercase tracking-[0.2em] text-coffee-800 transition-colors hover:text-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-600"
        >
          Get notified
        </a>
      </nav>
    </header>
  );
}

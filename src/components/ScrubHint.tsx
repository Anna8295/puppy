interface ScrubHintProps {
  visible: boolean;
}

export default function ScrubHint({ visible }: ScrubHintProps) {
  return (
    <div
      aria-hidden
      className={`fixed bottom-6 right-5 z-10 hidden items-center gap-2 rounded-full bg-bone-100/70 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-coffee-800 backdrop-blur-sm transition-opacity duration-700 md:flex md:right-10 ${
        visible ? "opacity-70" : "opacity-0"
      }`}
    >
      <span className="scrub-hint-mouse">Move your cursor to look around</span>
      <span className="scrub-hint-touch">Drag to look around</span>
      <span className="text-caramel-600">↔</span>
    </div>
  );
}

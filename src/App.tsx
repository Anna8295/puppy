import { useCallback, useEffect, useState } from "react";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PetFrames from "./components/PetFrames";
import Rack from "./components/Rack";
import ScrubHint from "./components/ScrubHint";
import { useFooterShade } from "./hooks/useFooterShade";
import { usePinAtBottom } from "./hooks/usePinAtBottom";
import { useFrameScrub } from "./hooks/useFrameScrub";
import { PET_FRAME_URLS } from "./petFrames";

function useScrolledPast(fraction: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const update = () => setPast(window.scrollY > window.innerHeight * fraction);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [fraction]);
  return past;
}

export default function App() {
  const [hasScrubbed, setHasScrubbed] = useState(false);
  const handleScrub = useCallback(() => setHasScrubbed(true), []);
  const imgRef = useFrameScrub(PET_FRAME_URLS, handleScrub);
  const scrolled = useScrolledPast(0.4);
  const mainRef = usePinAtBottom<HTMLElement>();
  const shadeRef = useFooterShade();

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="fixed inset-0 bg-gradient-to-b from-sand-700 via-sand-500 to-sand-300" />
      <PetFrames imgRef={imgRef} />
      <Header solid={scrolled} />
      {/* Phones: the hero stays put while the rail slides over it, then the rail
          stays put (pinned at its bottom edge) while the footer slides over it. */}
      <main ref={mainRef} className="max-md:sticky">
        <Hero />
        <Rack />
        <div
          ref={shadeRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-coffee-950 opacity-0 md:hidden"
        />
      </main>
      <Footer />
      <ScrubHint visible={!hasScrubbed && !scrolled} />
      <GrainOverlay />
    </div>
  );
}

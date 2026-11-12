import { useCallback, useEffect, useState } from "react";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PetFrames from "./components/PetFrames";
import Rack from "./components/Rack";
import ScrubHint from "./components/ScrubHint";
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

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="fixed inset-0 bg-gradient-to-b from-sand-700 via-sand-500 to-sand-300" />
      <PetFrames imgRef={imgRef} />
      <Header solid={scrolled} />
      <main>
        <Hero />
        <Rack />
      </main>
      <Footer />
      <ScrubHint visible={!hasScrubbed && !scrolled} />
      <GrainOverlay />
    </div>
  );
}

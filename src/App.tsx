import { useCallback, useState } from "react";
import GrainOverlay from "./components/GrainOverlay";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PetFrames from "./components/PetFrames";
import ScrubHint from "./components/ScrubHint";
import { useFrameScrub } from "./hooks/useFrameScrub";
import { PET_FRAME_URLS } from "./petFrames";

export default function App() {
  const [hasScrubbed, setHasScrubbed] = useState(false);
  const handleScrub = useCallback(() => setHasScrubbed(true), []);
  const imgRef = useFrameScrub(PET_FRAME_URLS, handleScrub);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sand-700 via-sand-500 to-sand-300">
      <PetFrames imgRef={imgRef} />
      <Header />
      <Hero />
      <ScrubHint visible={!hasScrubbed} />
      <GrainOverlay />
    </div>
  );
}

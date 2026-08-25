import type { RefObject } from "react";
import { PET_FRAME_URLS } from "../petFrames";

interface PetFramesProps {
  imgRef: RefObject<HTMLImageElement>;
}

export default function PetFrames({ imgRef }: PetFramesProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden md:inset-auto md:right-[4vw] md:-top-[8vh] md:-bottom-[8vh] md:h-auto md:overflow-visible xl:right-[clamp(2rem,8vw,12rem)] xl:top-[1vh] xl:-bottom-[6vh] xl:h-auto">
      <img
        ref={imgRef}
        src={PET_FRAME_URLS[0]}
        alt=""
        className="h-full w-full scale-150 object-cover object-[50%_12%] md:w-auto md:scale-100 xl:drop-shadow-[0_30px_40px_rgba(27,18,11,0.28)]"
      />
    </div>
  );
}

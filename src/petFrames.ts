export const PET_FRAME_COUNT = 46;

export const PET_FRAME_URLS = Array.from({ length: PET_FRAME_COUNT }, (_, i) =>
  `/frames/frame-${String(i + 1).padStart(2, "0")}.webp`
);

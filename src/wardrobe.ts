export interface Garment {
  id: string;
  name: string;
  colour: string;
  frameCount: number;
  /** The source images run off the bottom edge, so the hem gets a soft fade instead of a hard cut. */
  cutAtBottom?: boolean;
}

// Frames live in public/wardrobe/<id>/01.webp … NN.webp.
// Each sequence is a quarter turn: 01 = side view, last = front view.
export const GARMENTS: Garment[] = [
  { id: "blue", name: "Cable Knit Jumper", colour: "Sky", frameCount: 16, cutAtBottom: true },
  { id: "beige", name: "Teddy Fleece Vest", colour: "Oat", frameCount: 16, cutAtBottom: true },
  { id: "lines", name: "Striped Roll-Neck", colour: "Cream & Rust", frameCount: 22, cutAtBottom: true },
  { id: "yellow", name: "Rain Slicker", colour: "Mustard", frameCount: 22, cutAtBottom: true },
  { id: "green", name: "Cable Knit Jumper", colour: "Moss", frameCount: 25 },
];

export function garmentFrameUrls(garment: Garment) {
  return Array.from(
    { length: garment.frameCount },
    (_, i) => `${import.meta.env.BASE_URL}wardrobe/${garment.id}/${String(i + 1).padStart(2, "0")}.webp`
  );
}

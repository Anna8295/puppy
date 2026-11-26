// "Try it on your dog": prepares the visitor's photo in the browser and sends
// it to the try-on Worker (worker/), which dresses the dog with AI.

/** Where the Worker lives (VITE_TRY_ON_URL in .env.production / .env.development). */
export const tryOnUrl = (): string => import.meta.env.VITE_TRY_ON_URL ?? "";

export type TryOnErrorCode =
  | "unreadable" // not an image the browser can open (e.g. HEIC on desktop)
  | "small" // too small to dress
  | "visitor" // this visitor's try-ons for today are used up
  | "site" // the whole site's try-ons for today are used up
  | "quota" // Cloudflare's free allowance for today is used up
  | "slow" // too many at once
  | "failed"; // anything else

export class TryOnError extends Error {
  constructor(public code: TryOnErrorCode) {
    super(`try-on: ${code}`);
  }
}

export interface PreparedPhoto {
  blob: Blob;
  width: number;
  height: number;
}

const MAX_SIDE = 1024;
const MIN_SIDE = 256;
const STEP = 16; // the image model wants sizes in multiples of 16

/**
 * Output size for a photo: longest side at most 1024 px, both sides multiples
 * of 16, or null if the photo is too small to dress.
 */
export function fitSize(width: number, height: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const w = Math.floor((width * scale) / STEP) * STEP;
  const h = Math.floor((height * scale) / STEP) * STEP;
  return w < MIN_SIDE || h < MIN_SIDE ? null : { width: w, height: h };
}

/**
 * Shrinks the photo and redraws it as a new JPEG. Redrawing applies the
 * phone's rotation and drops everything else in the file, including the GPS
 * location phones save with each photo, so only the pixels are ever sent.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new TryOnError("unreadable");
  }
  const size = fitSize(bitmap.width, bitmap.height);
  if (!size) {
    bitmap.close();
    throw new TryOnError("small");
  }
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#fff"; // transparent PNGs get a white background, not black
  context.fillRect(0, 0, size.width, size.height);
  context.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!blob) throw new TryOnError("unreadable");
  return { blob, ...size };
}

const SERVER_ERRORS: Record<string, TryOnErrorCode> = {
  visitor: "visitor",
  site: "site",
  quota: "quota",
  slow: "slow",
  photo: "unreadable",
};

/** Sends the photo and the garment id; resolves to the picture (a data: URL) and the try-ons left today. */
export async function tryOn(photo: PreparedPhoto, garment: string): Promise<{ image: string; remaining: number }> {
  const form = new FormData();
  form.append("garment", garment);
  form.append("width", String(photo.width));
  form.append("height", String(photo.height));
  form.append("photo", photo.blob, "dog.jpg");

  let response: Response;
  try {
    response = await fetch(`${tryOnUrl()}/try-on`, { method: "POST", body: form, signal: AbortSignal.timeout(60_000) });
  } catch {
    throw new TryOnError("failed");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.image !== "string") throw new TryOnError(SERVER_ERRORS[data.error] ?? "failed");
  return { image: `data:image/jpeg;base64,${data.image}`, remaining: Number(data.remaining ?? 0) };
}

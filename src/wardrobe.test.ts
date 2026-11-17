import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PET_FRAME_COUNT, PET_FRAME_URLS } from "./petFrames";
import { GARMENTS, garmentFrameUrls } from "./wardrobe";

// URLs start with the site's base path (/puppy/); on disk the files live in public/.
const BASE = import.meta.env.BASE_URL;
const publicPath = (url: string) => resolve(__dirname, "../public", url.slice(BASE.length));

describe("garmentFrameUrls", () => {
  it("builds one zero-padded URL per frame, in order", () => {
    const urls = garmentFrameUrls({ id: "test", name: "Test", colour: "Grey", frameCount: 12 });

    expect(urls).toHaveLength(12);
    expect(urls[0]).toBe(`${BASE}wardrobe/test/01.webp`);
    expect(urls[9]).toBe(`${BASE}wardrobe/test/10.webp`);
    expect(urls[11]).toBe(`${BASE}wardrobe/test/12.webp`);
  });
});

describe("wardrobe data", () => {
  it("gives every garment a unique id", () => {
    const ids = GARMENTS.map((garment) => garment.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Catches a typo in wardrobe.ts or a frame missing after re-exporting from Figma.
  it.each(GARMENTS)("has every frame of $name ($colour) in public/", (garment) => {
    const missing = garmentFrameUrls(garment).filter((url) => !existsSync(publicPath(url)));
    expect(missing).toEqual([]);
  });
});

describe("puppy frames", () => {
  it(`has all ${PET_FRAME_COUNT} hero frames in public/`, () => {
    expect(PET_FRAME_URLS).toHaveLength(PET_FRAME_COUNT);
    const missing = PET_FRAME_URLS.filter((url) => !existsSync(publicPath(url)));
    expect(missing).toEqual([]);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { fitSize, tryOn, TryOnError } from "./tryOn";

const photo = { blob: new Blob(["jpeg"], { type: "image/jpeg" }), width: 768, height: 1024 };

describe("fitSize", () => {
  it("shrinks big phone photos to at most 1024 px, in steps of 16", () => {
    expect(fitSize(4284, 5712)).toEqual({ width: 768, height: 1024 });
    expect(fitSize(4000, 3000)).toEqual({ width: 1024, height: 768 });
    expect(fitSize(1000, 700)).toEqual({ width: 992, height: 688 });
  });

  it("refuses photos too small to dress", () => {
    expect(fitSize(300, 200)).toBeNull();
  });
});

describe("tryOn", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const answer = (status: number, body: unknown) => {
    vi.stubEnv("VITE_TRY_ON_URL", "https://try-on.example");
    const fetch = vi.fn(async () => new Response(JSON.stringify(body), { status }));
    vi.stubGlobal("fetch", fetch);
    return fetch;
  };

  it("sends the photo, garment and size, and returns the picture", async () => {
    const fetch = answer(200, { image: "AAAA", remaining: 2 });
    await expect(tryOn(photo, "blue")).resolves.toEqual({ image: "data:image/jpeg;base64,AAAA", remaining: 2 });

    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://try-on.example/try-on");
    const form = init.body as FormData;
    expect(form.get("garment")).toBe("blue");
    expect(form.get("width")).toBe("768");
    expect(form.get("height")).toBe("1024");
    expect(form.get("photo")).toBeInstanceOf(Blob);
  });

  it.each([
    ["visitor", "visitor"],
    ["site", "site"],
    ["quota", "quota"],
    ["slow", "slow"],
    ["photo", "unreadable"],
    ["something new", "failed"],
  ])("turns the server's %s error into %s", async (server, code) => {
    answer(429, { error: server });
    await expect(tryOn(photo, "blue")).rejects.toEqual(new TryOnError(code as never));
  });

  it("reports a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    await expect(tryOn(photo, "blue")).rejects.toMatchObject({ code: "failed" });
  });
});

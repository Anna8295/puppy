# Cord & Coat

"Opening soon" landing page for Cord & Coat, a small shop for dog clothes. Built with React, TypeScript, Tailwind, and Vite.

The hero features a scrubbable dog image sequence — move your cursor (desktop) to look around, or watch it blink on its own (phone). Below it, "the first rail" shows five garments: hover (or tap) one to turn it to the front while the others slide aside.

**Live:** https://anna8295.github.io/puppy/

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Pushing to `main` deploys automatically to GitHub Pages via GitHub Actions.

## Garment images

Source frames exported from Figma live in `wardrobe-source/<piece>/1.png … N.png` (1 = side view, N = front view). The web versions in `public/wardrobe/` are aligned, resized WebP copies of those frames. Piece names, colours and frame counts are in `src/wardrobe.ts`.

## Security notes

- Static site, no backend, no secrets. Fonts are bundled (no Google Fonts request).
- A Content-Security-Policy is added as a `<meta>` tag at build time (`vite.config.ts`).
- GitHub Pages can't send custom headers, so `frame-ancestors`, `X-Content-Type-Options` and `Permissions-Policy` aren't set. HSTS is sent by GitHub Pages itself. To get the full set, put the site behind a host or proxy that allows headers (e.g. Cloudflare, Netlify).
- The "Notify me" form doesn't send data anywhere yet. Before connecting it to a mailing-list service, add a privacy policy and a consent line under the form.

# Cord & Coat

"Opening soon" landing page for Cord & Coat, a made-up shop for dog clothes. It's a portfolio project built with React, TypeScript, Tailwind and Vite, and it isn't a real business.

**Live:** https://anna8295.github.io/puppy/

## What's on the page

- **Hero:** a dog image sequence you can scrub through. On desktop, move your cursor to make the puppy look around. On a phone, it blinks on its own.
- **The first rail:** five garments hanging on a clothes rail. Hover over one (or tap it) to turn it to the front while the others slide aside like curtains.
- **Footer:** links, a privacy link and a note that this is a portfolio project.
- **Scrolling on phones:** the sections stack like cards. The hero stays put while the rail slides over it. The rail then stays put while the footer slides over it, and dims slightly as the footer comes up.
- **Privacy page** (`privacy.html`): a short, plain-language page saying what the site does and doesn't do with visitor data.

## Development

```sh
npm install
npm run dev       # local dev server
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

Pushing to `main` deploys automatically to GitHub Pages via GitHub Actions.

## Project structure

```
index.html, privacy.html   the two pages (both are Vite entry points)
src/App.tsx                main page layout
src/privacy.tsx            privacy page
src/components/            Header, Hero, Rack (the rail), Footer, NotifyDialog, …
src/hooks/                 frame players, phone scroll pinning, footer shade
src/wardrobe.ts            garment names, colours and frame counts
public/frames/             puppy image sequence
public/wardrobe/           garment image sequences (WebP)
wardrobe-source/           original garment frames exported from Figma
```

## Garment images

Source frames exported from Figma live in `wardrobe-source/<piece>/1.png … N.png` (1 = side view, N = front view). The web versions in `public/wardrobe/` are aligned, resized WebP copies of those frames. Piece names, colours and frame counts are in `src/wardrobe.ts`.

## Privacy and security notes

- Static site, no backend, no secrets.
- No cookies, analytics or third-party services. Fonts are bundled with the site, so there's no Google Fonts request.
- The "Notify me" form never sends or stores anything. A note under it says so. Submitting clears the field and opens a dialog explaining that no email will arrive. If it's ever connected to a real mailing-list service, update the privacy page and add a consent line under the form first.
- The site is hosted on GitHub Pages, which logs visitors' IP addresses. The privacy page says this.
- A Content-Security-Policy is added as a `<meta>` tag at build time (`vite.config.ts`) on both pages.
- GitHub Pages can't send custom headers, so `frame-ancestors`, `X-Content-Type-Options` and `Permissions-Policy` aren't set. HSTS is sent by GitHub Pages itself. To get the full set, put the site behind a host or proxy that allows headers (e.g. Cloudflare, Netlify).

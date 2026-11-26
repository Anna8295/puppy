# Cord & Coat

[![Test and deploy](https://github.com/Anna8295/puppy/actions/workflows/deploy.yml/badge.svg)](https://github.com/Anna8295/puppy/actions/workflows/deploy.yml)

"Opening soon" landing page for Cord & Coat, a made-up shop for dog clothes. It's a portfolio project, not a real business.

**Live:** https://anna8295.github.io/puppy/

**Built with:** React 18, TypeScript, Tailwind CSS, Vite · tested with Vitest, React Testing Library, Playwright and axe-core · deployed to GitHub Pages with GitHub Actions

## What this project shows

- **Interaction design:** image sequences scrubbed by the cursor, a clothes rail where pieces turn to the front on hover or tap, and sections that stack like cards while scrolling on phones.
- **Mobile-first layout:** separate desktop and phone layouts, tested at both sizes.
- **Testing at every level:** unit, component, end-to-end and accessibility tests, run on every push. A failing test stops the deploy.
- **Accessibility:** keyboard support, labelled controls, focus handling in dialogs, and WCAG 2.1 AA colour contrast, checked automatically.
- **Privacy and security:** no cookies, tracking or third-party requests while browsing, self-hosted fonts, a Content-Security-Policy and a plain-language privacy page.
- **AI on a free plan:** a fitting room that dresses the visitor's own dog in a piece from the rail, using an image model on Cloudflare's free tier, with daily limits so it stays free.

## What's on the page

- **Hero:** a dog image sequence you can scrub through. On desktop, move your cursor to make the puppy look around. On a phone, it blinks on its own.
- **The first rail:** five garments hanging on a clothes rail. Hover over one (or tap it) to turn it to the front while the others slide aside like curtains.
- **Offer pop-up:** a small "15% off your first order" card that slides in at the bottom corner once you scroll down to the rail (never over the hero, which has its own email form). It hides again if you scroll back up, stays closed once closed, and doesn't appear if you already signed up in the hero. The offer is pretend, like the shop.
- **Fitting room ("Try it on your dog"):** under the rail. Upload or take a photo of your dog, pick a piece, and AI (FLUX.2 [klein] on Cloudflare Workers AI) dresses the dog in it in about five seconds. You can compare before and after and download the picture. Three try-ons per visitor a day, 40 for the whole site.
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

Pushing to `main` runs all the tests and, only if they pass, deploys to GitHub Pages via GitHub Actions.

## Testing

```sh
npm test               # everything: unit + end-to-end
npm run test:unit      # Vitest: unit and component tests
npm run test:watch     # Vitest in watch mode while coding
npm run test:coverage  # Vitest with a coverage report (coverage/index.html)
npm run test:e2e       # Playwright: end-to-end + accessibility, desktop and phone
npm run test:e2e:ui    # Playwright's interactive UI
```

The first time, install the test browser with `npx playwright install chromium`.

The tests come in layers, from fast and narrow to slow and realistic:

| Layer | Tool | Where | What it checks |
| --- | --- | --- | --- |
| Unit | Vitest | `src/*.test.ts` | Frame URLs are built correctly, and every puppy and garment frame they point to exists in `public/`. |
| Component | Vitest + React Testing Library (jsdom) | `src/components/*.test.tsx` | The email forms accept and refuse the right input, the dialog is honest and focuses its button, the 15% pop-up shows and hides at the right moments, and the rail works with the keyboard. |
| End-to-end | Playwright (Chromium, desktop and Pixel 7) | `e2e/` | The real production build in a real browser: no console errors or CSP-blocked files, no sideways scrolling on phones, hover and tap on the rail, the pop-up while scrolling, the fitting room (with the AI faked), navigation to the privacy page and back. |
| Accessibility | axe-core in Playwright | `e2e/accessibility.spec.ts` | WCAG 2.1 AA rules (contrast, labels, ARIA, headings) on the home page, the pop-up, the dialog and the privacy page, plus using the pop-up by keyboard alone. |

Component tests describe behaviour the way a visitor sees it (labels, roles, text) rather than implementation details, so they survive restyling. Things jsdom can't do, such as layout, scrolling and real hover, are left to the end-to-end tests.

On GitHub, every push and pull request runs the whole suite. The Playwright HTML report, with traces and screenshots of anything that failed, is uploaded as a build artifact.

## Project structure

```
index.html, privacy.html   the two pages (both are Vite entry points)
src/App.tsx                main page layout
src/privacy.tsx            privacy page
src/components/            Header, Hero, Rack (the rail), OfferPopup, NotifyDialog, Footer, …
src/hooks/                 frame players, phone scroll pinning, footer shade
src/wardrobe.ts            garment names, colours and frame counts
src/tryOn.ts               fitting room: photo preparation and the call to the Worker
worker/                    Cloudflare Worker for the fitting room (see below)
src/**/*.test.ts(x)        unit and component tests (Vitest)
src/test/setup.ts          test setup: jest-dom matchers, browser APIs jsdom lacks
e2e/                       end-to-end and accessibility tests (Playwright)
public/frames/             puppy image sequence
public/wardrobe/           garment image sequences (WebP)
wardrobe-source/           original garment frames exported from Figma
```

## Garment images

Source frames exported from Figma live in `wardrobe-source/<piece>/1.png … N.png` (1 = side view, N = front view). The web versions in `public/wardrobe/` are aligned, resized WebP copies of those frames. Piece names, colours and frame counts are in `src/wardrobe.ts`.

## Fitting room (Cloudflare Worker)

The AI runs in a small Cloudflare Worker in [`worker/`](worker/), on the free plan. It receives the photo and a garment id, adds that garment's front view (`worker/garments/`) and a description of its cut (`worker/src/garments.js`), and asks `@cf/black-forest-labs/flux-2-klein-4b` for the picture. Each one costs about 126 of the 10,000 free Neurons a day, an allowance shared with the account's other Workers, so the Worker allows 40 a day for the whole site and 3 per visitor (counted in Workers KV), plus 2 a minute. It only answers this site.

The site finds it through `VITE_TRY_ON_URL` in `.env.production` and `.env.development`; without it, the fitting room button is hidden. The address is also added to the Content-Security-Policy's `connect-src`.

```sh
cd worker
npm install
npx wrangler login   # once
npx wrangler deploy  # after changing the Worker, a description or a garment image
```

Pushing to `main` deploys the site, not the Worker. When you add a garment, add its front view to `worker/garments/`, its description to `worker/src/garments.js`, and deploy the Worker. The descriptions matter: without "no sleeves", the model knits sleeves down the dog's legs.

## Privacy and security notes

- No secrets in the repository. The site is static; the only backend is the fitting room Worker.
- No cookies, analytics or third-party services while browsing. Fonts are bundled with the site, so there's no Google Fonts request.
- The fitting room only contacts Cloudflare when the visitor presses "Dress my dog". The photo is shrunk and redrawn in the browser first, which removes the GPS location and camera details phones save in photos. Neither the site nor the Worker keeps the photo or the picture; the Worker only keeps daily counters under a hash of the visitor's IP address and the date, which expire after two days. The privacy page explains this.
- The email forms (in the hero and the 15% pop-up) never send or stores anything, and there is no real discount code. A note under each one says so. Submitting clears the field and opens a dialog explaining that no email or code will arrive. If it's ever connected to a real mailing-list service, update the privacy page and add a consent line under the form first.
- The site is hosted on GitHub Pages, which logs visitors' IP addresses. The privacy page says this.
- A Content-Security-Policy is added as a `<meta>` tag at build time (`vite.config.ts`) on both pages.
- GitHub Pages can't send custom headers, so `frame-ancestors`, `X-Content-Type-Options` and `Permissions-Policy` aren't set. HSTS is sent by GitHub Pages itself. To get the full set, put the site behind a host or proxy that allows headers (e.g. Cloudflare, Netlify).

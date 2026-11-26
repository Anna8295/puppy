import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages can't send custom response headers, so the Content-Security-Policy
// is set with a <meta> tag. Build only: the dev server needs inline scripts.
// (frame-ancestors, HSTS, X-Content-Type-Options and Permissions-Policy can't be set
// from a meta tag — see the security notes in the README.)
// connect-src also allows the "Try it on your dog" Worker; img-src allows blob:
// for the photo preview (the picture itself comes back as a data: URL).
const csp = (tryOnUrl: string) => [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${tryOnUrl ? ` ${new URL(tryOnUrl).origin}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

function contentSecurityPolicy(tryOnUrl: string): Plugin {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: () => [
      { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: csp(tryOnUrl) }, injectTo: "head-prepend" },
    ],
  };
}

export default defineConfig(({ mode }) => ({
  base: "/puppy/",
  plugins: [react(), contentSecurityPolicy(loadEnv(mode, process.cwd()).VITE_TRY_ON_URL ?? "")],
  build: {
    rollupOptions: {
      input: { main: "index.html", privacy: "privacy.html" },
    },
  },
}));

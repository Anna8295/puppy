import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages can't send custom response headers, so the Content-Security-Policy
// is set with a <meta> tag. Build only: the dev server needs inline scripts.
// (frame-ancestors, HSTS, X-Content-Type-Options and Permissions-Policy can't be set
// from a meta tag — see the security notes in the README.)
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

function contentSecurityPolicy(): Plugin {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: () => [
      { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" },
    ],
  };
}

export default defineConfig({
  base: "/puppy/",
  plugins: [react(), contentSecurityPolicy()],
});

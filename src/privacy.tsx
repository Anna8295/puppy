import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts";
import "./index.css";
import Footer from "./components/Footer";

const HOME = import.meta.env.BASE_URL;
const UPDATED = "13 November 2026";

const LINK =
  "underline decoration-caramel-500/50 underline-offset-4 transition-colors hover:text-caramel-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-600";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-medium tracking-tight text-coffee-950 md:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bone-100">
      <header className="flex items-center justify-between px-5 py-6 sm:px-8 md:px-10">
        <a href={HOME} className={`font-display text-lg tracking-tight text-coffee-950 ${LINK} no-underline`}>
          Cord <span className="text-caramel-600">&amp;</span> Coat
        </a>
        <a href={HOME} className="font-mono text-xs uppercase tracking-[0.2em] text-coffee-800 hover:text-caramel-600">
          ← Back to the rail
        </a>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-32 pt-10 font-body text-base leading-relaxed text-coffee-700 sm:px-8 md:pt-16 md:text-lg">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-caramel-600 sm:text-sm">Privacy</p>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] font-medium leading-[1.05] tracking-tight text-coffee-950">
          The short version: we keep nothing.
        </h1>
        <p className="mt-6">
          Cord &amp; Coat is not a real shop. It is a portfolio project, built to show design and front-end work. There
          are no accounts, no orders and no mailing list.
        </p>

        <Section title="Who runs this site">
          <p>
            This site is made and run by{" "}
            <a className={LINK} href="https://github.com/Anna8295" target="_blank" rel="noopener noreferrer">
              Anna8295 on GitHub
            </a>
            . You can get in touch through that GitHub profile.
          </p>
        </Section>

        <Section title="What this site does not do">
          <ul className="list-disc space-y-2 pl-5 marker:text-caramel-500">
            <li>No cookies.</li>
            <li>No analytics, tracking pixels or advertising.</li>
            <li>No third-party services: fonts and images are served from this site, not from Google or anyone else.</li>
            <li>Nothing is saved in your browser’s storage.</li>
          </ul>
        </Section>

        <Section title="The email field">
          <p>
            The “Get the opening notice” form is a demo. When you press “Notify me”, the address is checked in your
            browser, cleared, and a message explains that no email will ever be sent. The address is never sent to a
            server and never stored.
          </p>
        </Section>

        <Section title="Hosting">
          <p>
            The site is hosted on GitHub Pages, run by GitHub, Inc. in the United States. Like any web host, GitHub
            receives the technical details your browser sends when it loads a page (such as your IP address, browser
            type and the time of the request). GitHub states that it logs visitors’ IP addresses for security purposes.
            This site has no access to those logs.
          </p>
          <p>
            Because GitHub is based in the US, this data is processed outside Switzerland and the EU. You can read how
            GitHub handles it in the{" "}
            <a
              className={LINK}
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub General Privacy Statement
            </a>
            .
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Under the Swiss Federal Act on Data Protection (nFADP) and, where it applies, the EU GDPR, you can ask what
            personal data is held about you and have it corrected or deleted. This site itself holds no personal data
            about you. For the hosting logs, contact GitHub using the privacy statement linked above.
          </p>
        </Section>

        <p className="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-coffee-800/60">Last updated {UPDATED}</p>
      </main>

      <Footer />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivacyPage />
  </StrictMode>
);

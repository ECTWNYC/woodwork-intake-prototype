"use client";

interface LandingIntroProps {
  onStart: () => void;
}

const trustBullets = [
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: "100% online intake",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    label: "Licensed clinician review",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
    label: "Discreet shipping if prescribed",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    label: "Treatment requires approval",
  },
];

export default function LandingIntro({ onStart }: LandingIntroProps) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700/80 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-300">
              Health Intake Prototype
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex flex-col gap-7">

          {/* Hero card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-7 py-9 text-center">
            {/* Abstract privacy icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-800/60 bg-teal-900/40">
              <svg
                className="h-8 w-8 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold leading-snug tracking-tight text-zinc-50 mb-3">
              Better sex starts with private,<br className="hidden sm:block" /> clinician-reviewed care
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              Complete a private online intake. A licensed clinician will review whether ED treatment may be safe and appropriate for you.
            </p>
          </div>

          {/* Trust bullets */}
          <div className="grid grid-cols-2 gap-2">
            {trustBullets.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-900/60 text-teal-400">
                  {item.icon}
                </span>
                <span className="text-xs font-medium leading-snug text-zinc-300">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="w-full rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              Start private intake
            </button>
            <p className="text-xs text-zinc-500">
              Takes about 8–10 minutes. Some questions may be skipped based on your answers. Not everyone will be eligible.
            </p>
          </div>

          {/* Privacy reassurance */}
          <div className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5">
            <svg
              className="h-4 w-4 mt-0.5 shrink-0 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs leading-relaxed text-zinc-500">
              Your health information is used for care review and is not used to update your Grindr profile.
            </p>
          </div>

        </div>
      </main>

      {/* Disclaimer footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-zinc-600">
          Outside-in prototype. Not affiliated with Woodwork or Grindr. Not clinical, legal, or compliance advice.
        </p>
      </footer>
    </div>
  );
}

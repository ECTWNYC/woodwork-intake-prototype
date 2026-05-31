"use client";

import { useState } from "react";

interface WaitlistFlowProps {
  selectedState: string;
  onChangeState: () => void;
}

const TREATMENT_OPTIONS = [
  { value: "", label: "Select one (optional)" },
  { value: "ed", label: "ED (erectile dysfunction) treatment" },
  { value: "sermorelin", label: "Sermorelin / growth hormone therapy" },
  { value: "weight", label: "Weight management" },
  { value: "other", label: "Other / not sure" },
];

export default function WaitlistFlow({
  selectedState,
  onChangeState,
}: WaitlistFlowProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [treatmentInterest, setTreatmentInterest] = useState("");
  const [consented, setConsented] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = email.trim() !== "" && consented;

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
        <div className="w-full max-w-md flex flex-col gap-6">

          {!submitted ? (
            <>
              {/* State badge */}
              <div className="flex items-center gap-2 self-start rounded-full border border-amber-800/60 bg-amber-950/40 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-amber-400">
                  Illustrative — not available in {selectedState} in this prototype
                </span>
              </div>

              {/* Heading */}
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold leading-snug text-zinc-50">
                  Get notified when Woodwork launches in your state
                </h1>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Leave your contact information and we'll let you know when care becomes available where you live.
                </p>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-4">

                {/* State — prefilled, read-only */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-300">State</label>
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-500">
                    {selectedState}
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="wl-email" className="text-sm font-medium text-zinc-300">
                    Email address <span className="text-teal-400">*</span>
                  </label>
                  <input
                    id="wl-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="wl-phone" className="text-sm font-medium text-zinc-300">
                    Phone number{" "}
                    <span className="text-zinc-600 font-normal">(optional)</span>
                  </label>
                  <input
                    id="wl-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Treatment interest */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="wl-interest" className="text-sm font-medium text-zinc-300">
                    Treatment interest{" "}
                    <span className="text-zinc-600 font-normal">(optional)</span>
                  </label>
                  <select
                    id="wl-interest"
                    value={treatmentInterest}
                    onChange={(e) => setTreatmentInterest(e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none"
                  >
                    {TREATMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional marketing consent */}
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Optional marketing consent</p>
                <label
                  htmlFor="wl-consent"
                  className={[
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-all",
                    consented
                      ? "border-teal-500 bg-teal-950/60"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-500",
                  ].join(" ")}
                >
                  <input
                    id="wl-consent"
                    type="checkbox"
                    checked={consented}
                    onChange={(e) => setConsented(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={[
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      consented
                        ? "border-teal-500 bg-teal-500"
                        : "border-zinc-600 bg-transparent",
                    ].join(" ")}
                  >
                    {consented && (
                      <svg className="h-3 w-3 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={["text-sm leading-snug", consented ? "text-teal-100" : "text-zinc-300"].join(" ")}>
                    I agree to receive optional marketing communications from Grindr LLC, including communications about Woodwork and related Grindr products or services, by email or text. Consent is not required to use Woodwork or any other Grindr product or service. Message and data rates may apply. Reply STOP to opt out of texts.
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={!canSubmit}
                  className="w-full rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Join waitlist
                </button>

                {/* Change state */}
                <button
                  type="button"
                  onClick={onChangeState}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-500 hover:text-zinc-200"
                >
                  Choose a different state
                </button>

              </div>
            </>
          ) : (
            /* Confirmation */
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-teal-800 bg-teal-950/40 px-6 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-900/60 text-3xl">
                  ✅
                </div>
                <h2 className="text-xl font-semibold text-teal-100">
                  You're on the waitlist
                </h2>
                <p className="text-sm leading-relaxed text-teal-300/80">
                  This is a prototype waitlist confirmation for{" "}
                  <span className="font-semibold text-teal-200">{selectedState}</span>.
                  In production, users would be notified when care becomes available in their state.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                <p className="text-sm leading-relaxed text-zinc-400">
                  You are not starting a medical intake yet. Treatment availability and eligibility will be reviewed when care is available in your state.
                </p>
              </div>

              <button
                type="button"
                onClick={onChangeState}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-500 hover:text-zinc-200"
              >
                Choose a different state
              </button>
            </div>
          )}

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

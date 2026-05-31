"use client";

import { useState, useCallback } from "react";
import ProgressBar from "./ProgressBar";
import StepCard from "./StepCard";
import OptionButton from "./OptionButton";
import RationalePanel from "./RationalePanel";
import LandingIntro from "./LandingIntro";
import WaitlistFlow from "./WaitlistFlow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Answers = Record<string, string | string[]>;
type HardStopReason = "safety" | "medication" | "drug";

interface StepConfig {
  title: string;
  tag?: string;
  rationale: { headline: string; body: string; insight?: string };
  render: (
    answers: Answers,
    setAnswer: (key: string, value: string | string[]) => void,
    onJoinWaitlist?: () => void
  ) => React.ReactNode;
  canContinue?: (answers: Answers) => boolean;
  shouldSkip?: (answers: Answers) => boolean;
  isHardStop?: (answers: Answers) => boolean;
}

// ---------------------------------------------------------------------------
// Helper sub-components
// ---------------------------------------------------------------------------

function InfoBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm leading-relaxed text-zinc-400">
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-900/60 text-xs font-bold text-teal-400">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function InputField({
  label, id, type = "text", placeholder, value, onChange, required = false, hint,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}{required && <span className="ml-1 text-teal-400">*</span>}
      </label>
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
      {hint && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
  );
}

function SelectField({
  label, id, value, onChange, options, required = false,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}{required && <span className="ml-1 text-teal-400">*</span>}
      </label>
      <select
        id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none"
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function CheckRow({
  id, label, checked, onChange,
}: {
  id: string; label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-all duration-150",
        checked ? "border-teal-500 bg-teal-950/60" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500",
      ].join(" ")}
    >
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={["mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
        checked ? "border-teal-500 bg-teal-500" : "border-zinc-600 bg-transparent"].join(" ")}>
        {checked && (
          <svg className="h-3 w-3 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className={["text-sm leading-snug", checked ? "text-teal-100" : "text-zinc-300"].join(" ")}>
        {label}
      </span>
    </label>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-zinc-800" />
      <span className="text-xs font-medium tracking-widest text-zinc-600 uppercase">{label}</span>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>
  );
}

function QuestionLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-zinc-200">{children}</p>
      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-select helpers
// ---------------------------------------------------------------------------

function toggleMulti(current: string[], value: string): string[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

// Exclusive-none toggle: selecting "none" deselects everything; selecting anything else deselects "none"
function toggleExclusive(current: string[], value: string, noneKey = "none"): string[] {
  if (value === noneKey) return current.includes(noneKey) ? [] : [noneKey];
  const withoutNone = current.filter((v) => v !== noneKey);
  return withoutNone.includes(value) ? withoutNone.filter((v) => v !== value) : [...withoutNone, value];
}

function hasAny(arr: string[], values: string[]): boolean {
  return values.some((v) => arr.includes(v));
}

// ---------------------------------------------------------------------------
// US states
// ---------------------------------------------------------------------------

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Washington D.C.",
];

const AVAILABLE_STATES = [
  "California","Florida","Texas","New York","Illinois","Georgia","Arizona",
  "Colorado","Washington","Oregon","Nevada","Massachusetts","Pennsylvania","Ohio",
];

// ---------------------------------------------------------------------------
// Hard-stop value sets (sample prototype logic — not clinical guidance)
// ---------------------------------------------------------------------------

const HARD_STOP_TX_REACTIONS = ["heart_attack_stroke", "severe_low_bp_reaction", "priapism"];
const HARD_STOP_CV_SAFETY = ["no_sex_advised", "heart_attack_6mo", "severe_low_bp"];
const HARD_STOP_CV_SYMPTOMS = ["chest_pain_stairs"];
const HARD_STOP_MEDICATIONS = ["nitrate_pills", "nitrate_iv", "nitroglycerin", "riociguat", "isosorbide"];
const HARD_STOP_DRUGS = ["poppers"];

// ---------------------------------------------------------------------------
// HardStop screen
// ---------------------------------------------------------------------------

function HardStop({
  reason,
  onStartOver,
  onGoBack,
}: {
  reason: HardStopReason;
  onStartOver: () => void;
  onGoBack: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700/80 text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-300">Health Intake Prototype</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-red-900/60 bg-red-950/30 px-6 py-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/40 text-2xl">⚠️</div>
            <h2 className="text-xl font-bold text-red-200">You may not be eligible for this online care path</h2>
            <p className="text-sm leading-relaxed text-red-300/80">
              Your safety comes first. Based on your responses, this prototype routes you away from the online intake and recommends speaking with an in-person clinician about safer options.
            </p>
          </div>

          {(reason === "medication" || reason === "drug") && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
              <p className="text-sm leading-relaxed text-zinc-400">
                Using ED medications such as sildenafil or tadalafil with certain medications or recreational drugs can dangerously affect heart and blood pressure.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Safety resources</p>
            <p className="text-sm leading-relaxed text-zinc-400">
              If you believe you may be experiencing a life-threatening emergency, call <span className="font-semibold text-zinc-200">911</span>.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              If you need mental health or substance-use support, call or text <span className="font-semibold text-zinc-200">988</span>.
            </p>
          </div>

          <p className="text-xs leading-relaxed text-zinc-600">
            This is sample safety routing for prototype purposes only. Actual eligibility logic would need to come from clinical, legal, and compliance review.
          </p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onGoBack}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-zinc-100"
            >
              Go back and review my answers
            </button>
            <button
              type="button"
              onClick={onStartOver}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-2.5 text-sm text-zinc-600 transition-all hover:text-zinc-400"
            >
              Start over
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-zinc-600">
          Outside-in prototype. Not affiliated with Woodwork or Grindr. Not clinical, legal, or compliance advice.
        </p>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step definitions — 18-step ED intake
// ---------------------------------------------------------------------------

function buildSteps(): StepConfig[] {
  return [

    // ── 0. Before you start ────────────────────────────────────────────────
    {
      title: "Before you start",
      tag: "Intake overview",
      rationale: {
        headline: "Set expectations before asking anything",
        body: "Leading with a brief orientation reduces form anxiety and signals transparency. Users who understand what they're signing up for — including that some questions may be skipped based on their answers — may be less likely to abandon mid-flow.",
        insight: "The hypothesis: users who see what to expect before step 1 are less likely to drop off early. Previewing time-to-complete and process steps is a low-cost intervention worth testing against a control.",
      },
      render: () => (
        <div className="flex flex-col gap-5">
          <InfoBlock>
            <p className="text-zinc-300 font-medium mb-2">This intake usually takes about 8–10 minutes.</p>
            <p>Your answers may determine which follow-up questions you see. A licensed clinician will review your intake and determine whether ED treatment may be safe and appropriate for you. You won't be charged until a clinician has reviewed your intake and approved a care plan.</p>
          </InfoBlock>
          <NumberedList items={[
            "Answer clinical questions about your sexual health and medical history",
            "A licensed clinician reviews your intake (typically within 24–48 hours)",
            "If appropriate, you'll receive an ED care plan and treatment options",
            "If approved, your prescription ships from a licensed pharmacy within 3–5 business days",
          ]} />
          <InfoBlock>
            <p className="text-xs text-zinc-500">Your data is protected under HIPAA. Nothing you share is sold or used for advertising.</p>
          </InfoBlock>
        </div>
      ),
    },

    // ── 1. State availability ──────────────────────────────────────────────
    {
      title: "Where do you live?",
      tag: "State availability",
      rationale: {
        headline: "Route unavailable-state users to demand capture, not clinical intake",
        body: "Unavailable-state users should not answer sensitive clinical questions if care cannot be provided. Routing them to a waitlist avoids unnecessary sensitive data collection, reduces confusion, and creates a clean state-level demand signal. State availability copy should confirm whether the user can proceed — not introduce care-model concepts. At this step, users need a clear yes or no on availability, nothing more.",
        insight: "Note: state availability here is illustrative sample logic for prototype purposes. Actual availability would need to come from Woodwork's live eligibility rules, clinical operations, or legal/compliance source of truth.",
      },
      render: (answers, setAnswer, onJoinWaitlist) => {
        const state = (answers.state as string) || "";
        const isAvailable = AVAILABLE_STATES.includes(state);
        const isUnavailable = state !== "" && !isAvailable;
        return (
          <div className="flex flex-col gap-5">
            <SelectField
              label="State of residence" id="state" value={state}
              onChange={(v) => setAnswer("state", v)}
              options={US_STATES.map((s) => ({ value: s, label: s }))} required
            />
            <p className="text-xs leading-relaxed text-zinc-600">
              For prototype purposes, state availability is illustrative. Actual availability would need to come from Woodwork's live eligibility rules, clinical operations, or legal/compliance source of truth.
            </p>
            {isAvailable && (
              <div className="flex items-center gap-2 rounded-xl border border-teal-800 bg-teal-950/60 px-4 py-3">
                <span className="text-lg">✅</span>
                <p className="text-sm text-teal-300">In this prototype, {state} is treated as an available state. You can continue to the online intake.</p>
              </div>
            )}
            {isUnavailable && (
              <div className="flex flex-col gap-4 rounded-xl border border-amber-800 bg-amber-950/40 px-5 py-5">
                <div>
                  <p className="text-sm font-semibold text-amber-300 mb-1">Not available in {state} in this prototype</p>
                  <p className="text-sm leading-relaxed text-amber-400/80">
                    In this prototype, {state} is treated as an unavailable state. Instead of asking clinical questions, this prototype routes users to a waitlist path.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => onJoinWaitlist?.()}
                    className="w-full rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-500">
                    Join waitlist
                  </button>
                  <button type="button" onClick={() => setAnswer("state", "")}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-500 hover:text-zinc-200">
                    Choose a different state
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      },
      canContinue: (answers) => AVAILABLE_STATES.includes(answers.state as string),
    },

    // ── 2. ED motivation ─────────────────────────────────────────────────
    {
      title: "Your treatment goal",
      tag: "Motivation",
      rationale: {
        headline: "Motivation framing increases engagement and personalizes the care path",
        body: "Understanding why a user is seeking treatment now — not just what symptoms they have — helps the clinician frame the care plan in language that resonates. Users who feel understood are more likely to adhere to treatment.",
        insight: "Asking about motivation also surfaces the emotional context behind ED: performance anxiety, relationship dynamics, spontaneity. These are real factors in treatment satisfaction that clinical questions alone don't capture.",
      },
      render: (answers, setAnswer) => {
        const opts = [
          { value: "spontaneous", label: "I want to have more spontaneous sex" },
          { value: "harder_longer", label: "I want to stay harder for longer" },
          { value: "stress_free", label: "I want sex to feel easy and stress-free" },
          { value: "all_above", label: "All of the above" },
        ];
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <QuestionLabel>What is the main reason you're looking for treatment now?</QuestionLabel>
              <div className="flex flex-col gap-2">
                {opts.map((o) => (
                  <OptionButton key={o.value} label={o.label}
                    selected={answers.edMotivation === o.value}
                    onClick={() => setAnswer("edMotivation", o.value)} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-teal-800 bg-teal-950/40 px-5 py-4">
              <p className="text-sm font-semibold text-teal-200 mb-1.5">Most ED treatment is built for straight men, not us.</p>
              <p className="text-sm leading-relaxed text-teal-300/80">With Woodwork, users get access to board-certified and culturally trained clinicians who understand LGBTQ+ health needs.</p>
            </div>
          </div>
        );
      },
      canContinue: (answers) => !!answers.edMotivation,
    },

    // ── 3. ED symptom pattern ─────────────────────────────────────────────
    {
      title: "ED symptom pattern",
      tag: "Symptoms",
      rationale: {
        headline: "Symptom frequency contextualizes severity and appropriate care path",
        body: "Understanding how often ED occurs helps the clinician distinguish situational from chronic ED. This affects treatment approach, dosing, and expectations. Capturing it early also signals to the user that the intake is tailored to them — not a generic health form.",
        insight: "The hypothesis is that users who see symptom-specific questions early feel the intake is clinically appropriate, not generic — which may improve completion quality and honest self-reporting.",
      },
      render: (answers, setAnswer) => {
        const opts = [
          { value: "every_time", label: "Every time" },
          { value: "more_than_half", label: "More than half of the time" },
          { value: "occasionally", label: "Occasionally" },
          { value: "rarely", label: "Rarely" },
          { value: "never", label: "Never" },
        ];
        return (
          <div className="flex flex-col gap-5">
            <QuestionLabel>Do you ever have a problem getting or maintaining an erection that's hard and satisfying enough for sex?</QuestionLabel>
            <div className="flex flex-col gap-2">
              {opts.map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={answers.edFrequency === o.value}
                  onClick={() => setAnswer("edFrequency", o.value)} />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => !!answers.edFrequency,
    },

    // ── 3. Erection context ───────────────────────────────────────────────
    {
      title: "Erection context",
      tag: "Symptoms",
      rationale: {
        headline: "Masturbation and morning erections differentiate psychogenic from physiological ED",
        body: "Erections during masturbation or sleep that are firm suggest the vascular system is functional — pointing toward psychogenic or situational ED. Poor erections in all contexts suggest physiological causes. This distinction informs the care path, not just the prescription.",
        insight: "These questions are clinically standard in ED evaluation and may help avoid unnecessary medication-first approaches when psychological or lifestyle interventions are more appropriate.",
      },
      render: (answers, setAnswer) => {
        const mastOpts = [
          { value: "never", label: "Never" },
          { value: "rarely", label: "Rarely" },
          { value: "sometimes", label: "Sometimes" },
          { value: "yes_always", label: "Yes, always" },
        ];
        const morningOpts = [
          { value: "yes_regularly", label: "Yes, regularly" },
          { value: "no_rarely_never", label: "No, rarely or never" },
        ];
        return (
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <QuestionLabel>When masturbating, does your erection remain hard as long as you would like?</QuestionLabel>
              <div className="flex flex-col gap-2">
                {mastOpts.map((o) => (
                  <OptionButton key={o.value} label={o.label}
                    selected={answers.masturbationErection === o.value}
                    onClick={() => setAnswer("masturbationErection", o.value)} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <QuestionLabel sub="These are erections during sleep or right after waking, without sexual activity.">
                Do you get "morning wood"?
              </QuestionLabel>
              <div className="flex flex-col gap-2">
                {morningOpts.map((o) => (
                  <OptionButton key={o.value} label={o.label}
                    selected={answers.morningWood === o.value}
                    onClick={() => setAnswer("morningWood", o.value)} />
                ))}
              </div>
            </div>
          </div>
        );
      },
      canContinue: (answers) => !!(answers.masturbationErection && answers.morningWood),
    },

    // ── 4. Prior ED treatment history ─────────────────────────────────────
    {
      title: "Prior ED treatment",
      tag: "Treatment history",
      rationale: {
        headline: "Prior treatment history prevents redundant care and surfaces contraindications",
        body: "Knowing what a user has already tried — and with what results — allows the clinician to avoid repeating ineffective treatments, flag prior adverse reactions, and recommend step-up or alternative care. It also establishes clinical context for dosing decisions.",
        insight: "This step is a branch point: users who select a prior treatment will see conditional follow-up questions about effectiveness and reactions. Users who select 'None of the below' skip those questions.",
      },
      render: (answers, setAnswer) => {
        const selected = (answers.priorTreatment as string[]) || [];
        const opts = [
          { value: "none", label: "None of the below" },
          { value: "viagra", label: "Viagra / sildenafil" },
          { value: "cialis", label: "Cialis / tadalafil" },
          { value: "levitra", label: "Levitra / vardenafil" },
          { value: "staxyn", label: "Staxyn / vardenafil" },
          { value: "stendra", label: "Stendra / avanafil" },
          { value: "other_med", label: "A medication or supplement not listed here" },
          { value: "other_device", label: "Penile surgery, injections, vacuum pump, or prosthesis" },
        ];
        return (
          <div className="flex flex-col gap-4">
            <QuestionLabel>Have you tried any of the following treatments?</QuestionLabel>
            <p className="text-xs text-zinc-500">Select all that apply.</p>
            <div className="flex flex-col gap-2">
              {opts.map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={selected.includes(o.value)}
                  onClick={() => setAnswer("priorTreatment", toggleExclusive(selected, o.value))} />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => ((answers.priorTreatment as string[]) || []).length > 0,
    },

    // ── 5. Prior treatment follow-ups (CONDITIONAL) ───────────────────────
    {
      title: "Prior treatment experience",
      tag: "Treatment history",
      rationale: {
        headline: "Treatment effectiveness and adverse reactions are direct clinical inputs",
        body: "Prior reactions to ED medications are among the most important safety inputs in this intake. Severe adverse reactions — including cardiovascular events, priapism, or severe hypotension — are contraindications to repeat prescribing. This step is shown only when a prior treatment was selected.",
        insight: "Conditional follow-ups reduce unnecessary question fatigue for users with no prior treatment history, while capturing critical safety data for those who do. This is a core pattern in clinical intake design.",
      },
      shouldSkip: (answers) => {
        const sel = (answers.priorTreatment as string[]) || [];
        return sel.length === 0 || (sel.length === 1 && sel[0] === "none");
      },
      isHardStop: (answers) => {
        const reactions = (answers.priorTxReactions as string[]) || [];
        return hasAny(reactions, HARD_STOP_TX_REACTIONS);
      },
      render: (answers, setAnswer) => {
        const reactions = (answers.priorTxReactions as string[]) || [];
        const effOpts = [
          { value: "ineffective", label: "Ineffective" },
          { value: "moderate", label: "Moderately effective" },
          { value: "full", label: "Fully effective" },
        ];
        const reactionOpts = [
          { value: "none", label: "None of the below" },
          { value: "severe_allergy", label: "Severe allergic reaction" },
          { value: "heart_attack_stroke", label: "Heart attack, stroke, or heart rhythm disorder" },
          { value: "severe_low_bp_reaction", label: "Severely low blood pressure" },
          { value: "vision_hearing", label: "Vision or hearing changes or loss" },
          { value: "seizures", label: "Seizures" },
          { value: "priapism", label: "Persistent or painful erection lasting more than 4 hours" },
          { value: "headache", label: "Headache" },
          { value: "stomach", label: "Upset stomach" },
          { value: "flushing", label: "Skin flushing or mild rash" },
          { value: "insomnia", label: "Trouble sleeping" },
          { value: "muscle", label: "Muscle aches" },
          { value: "runny_nose", label: "Runny nose or sinus congestion" },
        ];
        return (
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <QuestionLabel>How effective was the selected treatment for you?</QuestionLabel>
              <div className="flex flex-col gap-2">
                {effOpts.map((o) => (
                  <OptionButton key={o.value} label={o.label}
                    selected={answers.priorTxEffectiveness === o.value}
                    onClick={() => setAnswer("priorTxEffectiveness", o.value)} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <QuestionLabel>Did the selected treatment cause any of the following reactions?</QuestionLabel>
              <p className="text-xs text-zinc-500">Select all that apply.</p>
              <div className="flex flex-col gap-2">
                {reactionOpts.map((o) => (
                  <OptionButton key={o.value} label={o.label}
                    selected={reactions.includes(o.value)}
                    onClick={() => setAnswer("priorTxReactions", toggleExclusive(reactions, o.value))} />
                ))}
              </div>
            </div>
          </div>
        );
      },
      canContinue: (answers) =>
        !!answers.priorTxEffectiveness && ((answers.priorTxReactions as string[]) || []).length > 0,
    },

    // ── 6. Basic eligibility ──────────────────────────────────────────────
    {
      title: "Basic eligibility",
      tag: "Eligibility",
      rationale: {
        headline: "Collect biometric context before clinical history",
        body: "DOB, sex assigned at birth, height, and weight are foundational to dosing calculations. Capturing them here — before health history — mirrors how a clinical chart is structured and reduces cognitive load by grouping similar questions.",
        insight: "Structured fields with clear labels are expected to produce fewer data-entry errors than free-text alternatives. Errors in DOB or weight directly delay clinical review — making input quality a clinical concern, not just a UX one. Note: clinical safety attestations (e.g. pregnancy, contraindications) should be conditional based on sex assigned at birth, product line, and clinical/legal review — not shown universally.",
      },
      render: (answers, setAnswer) => {
        const attest = (answers.eligibilityAttest as string[]) || [];
        return (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-3">
              <SelectField label="Birth month" id="dob_month" value={(answers.dob_month as string) || ""}
                onChange={(v) => setAnswer("dob_month", v)} required
                options={[
                  { value: "01", label: "January" }, { value: "02", label: "February" },
                  { value: "03", label: "March" }, { value: "04", label: "April" },
                  { value: "05", label: "May" }, { value: "06", label: "June" },
                  { value: "07", label: "July" }, { value: "08", label: "August" },
                  { value: "09", label: "September" }, { value: "10", label: "October" },
                  { value: "11", label: "November" }, { value: "12", label: "December" },
                ]} />
              <SelectField label="Day" id="dob_day" value={(answers.dob_day as string) || ""}
                onChange={(v) => setAnswer("dob_day", v)} required
                options={Array.from({ length: 31 }, (_, i) => ({
                  value: String(i + 1).padStart(2, "0"), label: String(i + 1),
                }))} />
              <SelectField label="Year" id="dob_year" value={(answers.dob_year as string) || ""}
                onChange={(v) => setAnswer("dob_year", v)} required
                options={Array.from({ length: 80 }, (_, i) => {
                  const y = new Date().getFullYear() - 18 - i;
                  return { value: String(y), label: String(y) };
                })} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-300">Sex assigned at birth <span className="text-teal-400">*</span></span>
              <div className="grid grid-cols-3 gap-2">
                {["Male", "Female", "Intersex"].map((opt) => (
                  <OptionButton key={opt} label={opt} selected={answers.sex === opt}
                    onClick={() => setAnswer("sex", opt)} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-zinc-300">Height <span className="text-teal-400">*</span></span>
                <div className="flex gap-2">
                  <input type="number" min={1} max={8} placeholder="ft"
                    value={(answers.height_ft as string) || ""}
                    onChange={(e) => setAnswer("height_ft", e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                  <input type="number" min={0} max={11} placeholder="in"
                    value={(answers.height_in as string) || ""}
                    onChange={(e) => setAnswer("height_in", e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                </div>
                <p className="text-xs text-zinc-600">feet / inches</p>
              </div>
              <InputField label="Weight" id="weight" type="number" placeholder="lbs"
                value={(answers.weight as string) || ""}
                onChange={(v) => setAnswer("weight", v)} required hint="pounds" />
            </div>
            <SectionDivider label="Eligibility attestations" />
            <div className="flex flex-col gap-2">
              {[
                { key: "adult", label: "I am at least 18 years old." },
                { key: "noclinicalguarantee", label: "I understand this intake does not guarantee treatment. A licensed clinician will determine whether treatment may be appropriate." },
                { key: "accurate", label: "I confirm the information I provide is accurate and complete to the best of my knowledge." },
              ].map((item) => (
                <CheckRow key={item.key} id={`attest_${item.key}`} label={item.label}
                  checked={attest.includes(item.key)}
                  onChange={(checked) =>
                    setAnswer("eligibilityAttest", checked ? [...attest, item.key] : attest.filter((v) => v !== item.key))
                  } />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => {
        const attest = (answers.eligibilityAttest as string[]) || [];
        return !!(answers.dob_month && answers.dob_day && answers.dob_year && answers.sex && answers.height_ft && answers.weight && attest.length === 3);
      },
    },

    // ── 7. CV / sexual activity safety screen ─────────────────────────────
    {
      title: "Cardiovascular and sexual activity safety",
      tag: "Safety screening",
      rationale: {
        headline: "Cardiovascular and sexual activity safety is a clinical prerequisite, not a formality",
        body: "ED medications affect cardiovascular function. For users with active heart failure, recent heart attack, severe hypotension, or who have been advised not to have sex, the online intake path is inappropriate. This screen routes those users to an ineligible screen — not to protect the business from liability, but because their safety depends on in-person clinical evaluation.",
        insight: "This screen demonstrates to regulators, clinicians, and users that the intake is a genuine clinical triage. Hard-stop routing is a trust signal, not just a safety gate. This is sample hard-stop logic — actual criteria require clinical and compliance review.",
      },
      isHardStop: (answers) => {
        const sel = (answers.cvSafety as string[]) || [];
        return hasAny(sel, HARD_STOP_CV_SAFETY);
      },
      render: (answers, setAnswer) => {
        const selected = (answers.cvSafety as string[]) || [];
        const opts = [
          { value: "none", label: "None of the below" },
          { value: "no_sex_advised", label: "You have been advised by a clinician not to have sex for any reason" },
          { value: "heart_attack_6mo", label: "A prior heart attack or heart failure in the past 6 months" },
          { value: "clotting_disorder", label: "Any clotting or bleeding disorder" },
          { value: "stroke", label: "Stroke or severe insufficiency of the autonomous nervous system" },
          { value: "severe_low_bp", label: "Severe low blood pressure" },
          { value: "sickle_cell", label: "Sickle cell anemia, myeloma, or leukemia" },
          { value: "retinitis", label: "Retinitis pigmentosa or anterior ischemic optic neuropathy" },
          { value: "ihss", label: "Idiopathic hypertrophic subaortic sclerosis" },
          { value: "pulmonary_htn", label: "Pulmonary hypertension" },
        ];
        return (
          <div className="flex flex-col gap-4">
            <QuestionLabel>Have you ever had, or do you currently have, any of the following?</QuestionLabel>
            <p className="text-xs text-zinc-500">Select all that apply.</p>
            <div className="flex flex-col gap-2">
              {opts.map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={selected.includes(o.value)}
                  onClick={() => setAnswer("cvSafety", toggleExclusive(selected, o.value))} />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => ((answers.cvSafety as string[]) || []).length > 0,
    },

    // ── 8. CV risk factors ────────────────────────────────────────────────
    {
      title: "Cardiovascular risk factors",
      tag: "Safety screening",
      rationale: {
        headline: "Cardiovascular risk profiling informs dosing and follow-up recommendation",
        body: "High blood pressure, diabetes, high cholesterol, and family history of cardiac disease are all known to co-occur with ED and affect treatment options. Capturing these here allows the clinician to contextualize the prescription, recommend monitoring, or flag cases that warrant additional evaluation.",
        insight: "This step is also a branch point: selecting high blood pressure, diabetes, or high cholesterol triggers a conditional follow-up screen with additional clinical detail questions.",
      },
      render: (answers, setAnswer) => {
        const selected = (answers.cvRiskFactors as string[]) || [];
        const opts = [
          { value: "none", label: "None of the below" },
          { value: "high_cholesterol", label: "High cholesterol" },
          { value: "family_heart_father", label: "My father had a heart attack or heart disease at 55 years or younger" },
          { value: "family_heart_mother", label: "My mother had a heart attack or heart disease at 65 years or younger" },
          { value: "diabetes", label: "Diabetes, pre-diabetes, or glucose intolerance" },
          { value: "high_bp", label: "High blood pressure" },
        ];
        return (
          <div className="flex flex-col gap-4">
            <QuestionLabel>Do you have any of the following cardiovascular risk factors?</QuestionLabel>
            <p className="text-xs text-zinc-500">Select all that apply.</p>
            <div className="flex flex-col gap-2">
              {opts.map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={selected.includes(o.value)}
                  onClick={() => setAnswer("cvRiskFactors", toggleExclusive(selected, o.value))} />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => ((answers.cvRiskFactors as string[]) || []).length > 0,
    },

    // ── 9. CV follow-ups (CONDITIONAL) ────────────────────────────────────
    {
      title: "Cardiovascular details",
      tag: "Safety screening",
      rationale: {
        headline: "Conditional follow-ups surface clinically significant details without universal question fatigue",
        body: "Blood pressure readings, A1C values, and cardiovascular symptoms are only asked when relevant risk factors were disclosed. This demonstrates conditional logic in clinical intake: ask precise follow-up questions when the clinical picture warrants them, and skip them when they don't apply.",
        insight: "ED can be an early symptom of systemic cardiovascular disease. The chest pain on exertion question is a direct screen for that relationship — and a hard-stop trigger if present.",
      },
      shouldSkip: (answers) => {
        const sel = (answers.cvRiskFactors as string[]) || [];
        return !hasAny(sel, ["high_bp", "diabetes", "high_cholesterol"]);
      },
      isHardStop: (answers) => {
        const symptoms = (answers.cvSymptoms as string[]) || [];
        return hasAny(symptoms, HARD_STOP_CV_SYMPTOMS);
      },
      render: (answers, setAnswer) => {
        const riskFactors = (answers.cvRiskFactors as string[]) || [];
        const hasHighBP = riskFactors.includes("high_bp");
        const hasDiabetes = riskFactors.includes("diabetes");
        const cvSymptoms = (answers.cvSymptoms as string[]) || [];
        const hba1cOpts = [
          { value: "less_7", label: "Less than 7%" },
          { value: "7_to_79", label: "7%–7.9%" },
          { value: "8_to_89", label: "8%–8.9%" },
          { value: "gt_9", label: "Greater than 9%" },
          { value: "not_sure", label: "Not sure" },
        ];
        const symptomOpts = [
          { value: "none", label: "None of the below" },
          { value: "arrhythmia", label: "Abnormal heart beats or heart rhythm, rapid, irregular, or unusually slow" },
          { value: "calf_pain", label: "Severe cramping or pain in the calves or thighs with exercise" },
          { value: "syncope", label: "Any unexplained fainting, dizziness, or lightheadedness" },
          { value: "chest_pain_stairs", label: "Chest pain or shortness of breath while walking up 2 flights of stairs" },
        ];
        return (
          <div className="flex flex-col gap-7">
            {hasHighBP && (
              <div className="flex flex-col gap-3">
                <QuestionLabel>In what range has your blood pressure reading been within the past 3–6 months?</QuestionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Systolic (top number)" id="systolic" type="number" placeholder="e.g. 130"
                    value={(answers.systolic as string) || ""} onChange={(v) => setAnswer("systolic", v)} required />
                  <InputField label="Diastolic (bottom number)" id="diastolic" type="number" placeholder="e.g. 85"
                    value={(answers.diastolic as string) || ""} onChange={(v) => setAnswer("diastolic", v)} required />
                </div>
              </div>
            )}
            {hasDiabetes && (
              <div className="flex flex-col gap-3">
                <QuestionLabel>In the past 3 months, what was your hemoglobin A1C value?</QuestionLabel>
                <div className="flex flex-col gap-2">
                  {hba1cOpts.map((o) => (
                    <OptionButton key={o.value} label={o.label}
                      selected={answers.hba1c === o.value}
                      onClick={() => setAnswer("hba1c", o.value)} />
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <QuestionLabel sub="Erectile dysfunction can be an early sign of hardening of the arteries. This can affect the heart and cause heart attacks.">
                Do you have any of the following symptoms?
              </QuestionLabel>
              <div className="flex flex-col gap-2">
                {symptomOpts.map((o) => (
                  <OptionButton key={o.value} label={o.label}
                    selected={cvSymptoms.includes(o.value)}
                    onClick={() => setAnswer("cvSymptoms", toggleExclusive(cvSymptoms, o.value))} />
                ))}
              </div>
            </div>
          </div>
        );
      },
      canContinue: (answers) => {
        const riskFactors = (answers.cvRiskFactors as string[]) || [];
        if (riskFactors.includes("high_bp") && (!answers.systolic || !answers.diastolic)) return false;
        if (riskFactors.includes("diabetes") && !answers.hba1c) return false;
        return ((answers.cvSymptoms as string[]) || []).length > 0;
      },
    },

    // ── 10. Penile health screen ──────────────────────────────────────────
    {
      title: "Penile health",
      tag: "Health history",
      rationale: {
        headline: "Penile health conditions affect treatment selection and clinical risk",
        body: "Conditions like Peyronie's disease, foreskin tightness, or pain with erections may affect whether ED medications are appropriate, or whether other interventions should be considered first. This screen captures these conditions before prescription issuance.",
      },
      render: (answers, setAnswer) => {
        const selected = (answers.penileHealth as string[]) || [];
        const opts = [
          { value: "none", label: "None of the below" },
          { value: "peyronie", label: "A marked curve or bend in the penis that interferes with sex or Peyronie's disease" },
          { value: "tight_foreskin", label: "Foreskin that is too tight" },
          { value: "prolonged_erection", label: "Prolonged erections lasting longer than four hours" },
          { value: "fibrous", label: "Fibrous tissue in the penis, lumps or bumps under the skin that feel hard" },
          { value: "pain", label: "Pain with erections or with ejaculation" },
        ];
        return (
          <div className="flex flex-col gap-4">
            <QuestionLabel>Do you have any of the following conditions?</QuestionLabel>
            <p className="text-xs text-zinc-500">Select all that apply.</p>
            <div className="flex flex-col gap-2">
              {opts.map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={selected.includes(o.value)}
                  onClick={() => setAnswer("penileHealth", toggleExclusive(selected, o.value))} />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => ((answers.penileHealth as string[]) || []).length > 0,
    },

    // ── 11. ED medication allergy screening ───────────────────────────────
    {
      title: "Medication allergies",
      tag: "Allergy screening",
      rationale: {
        headline: "ED medication allergy screening is a clinical prerequisite before prescribing",
        body: "Known allergies to PDE5 inhibitors (sildenafil, tadalafil, vardenafil, avanafil) are a contraindication to prescribing those medications. Asking about other allergies also captures relevant clinical context — dye or ingredient allergies can affect compounded formulations.",
        insight: "This is sample allergy-screening logic for prototype purposes. A 'Yes' to a known ED medication allergy routes to the ineligible screen in this prototype. Actual eligibility routing for allergies would require clinical, legal, and compliance validation.",
      },
      isHardStop: (answers) => answers.edMedAllergy === "yes",
      render: (answers, setAnswer) => (
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <QuestionLabel>
              Do you have a known medication allergy to Viagra/sildenafil, Cialis/tadalafil, Levitra/vardenafil, or Stendra/avanafil?
            </QuestionLabel>
            <div className="flex flex-col gap-2">
              {[
                { value: "no", label: "No" },
                { value: "yes", label: "Yes" },
                { value: "not_sure", label: "Not sure" },
              ].map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={answers.edMedAllergy === o.value}
                  onClick={() => setAnswer("edMedAllergy", o.value)} />
              ))}
            </div>
            <p className="text-xs text-zinc-600">
              Selecting "Yes" routes to a sample ineligible screen in this prototype. Actual eligibility routing for allergies requires clinical, legal, and compliance review.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <QuestionLabel>
              Do you have any other allergies, such as medications, foods, dyes, or ingredients?
            </QuestionLabel>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "no", label: "No" },
                { value: "yes", label: "Yes" },
              ].map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={answers.otherAllergy === o.value}
                  onClick={() => setAnswer("otherAllergy", o.value)} />
              ))}
            </div>
            {answers.otherAllergy === "yes" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="other-allergy-details" className="text-sm font-medium text-zinc-300">
                  Please provide details, including the allergy and your reaction. <span className="text-teal-400">*</span>
                </label>
                <textarea
                  id="other-allergy-details"
                  value={(answers.otherAllergyDetails as string) || ""}
                  onChange={(e) => setAnswer("otherAllergyDetails", e.target.value)}
                  rows={3}
                  placeholder="e.g. Penicillin — hives and difficulty breathing"
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                />
              </div>
            )}
          </div>
        </div>
      ),
      canContinue: (answers) => {
        if (!answers.edMedAllergy) return false;
        if (!answers.otherAllergy) return false;
        if (answers.otherAllergy === "yes" && !(answers.otherAllergyDetails as string)?.trim()) return false;
        return true;
      },
    },

    // ── 12. Medication contraindications ──────────────────────────────────
    {
      title: "Current medications",
      tag: "Contraindications",
      rationale: {
        headline: "Nitrate contraindications are the most critical drug interaction in ED care",
        body: "PDE5 inhibitors combined with nitrates or riociguat can cause life-threatening drops in blood pressure. This is an absolute contraindication. The intake must screen for this before any prescription is considered. Even occasional use counts.",
        insight: "This is sample contraindication logic for prototype purposes. Actual contraindication screening would need to be defined and maintained by clinical and pharmacy teams.",
      },
      isHardStop: (answers) => {
        const sel = (answers.medicationContraindications as string[]) || [];
        return hasAny(sel, HARD_STOP_MEDICATIONS);
      },
      render: (answers, setAnswer) => {
        const selected = (answers.medicationContraindications as string[]) || [];
        const opts = [
          { value: "none", label: "None of the below" },
          { value: "nitrate_pills", label: "Nitrate pills except nitroglycerin under the tongue, such as BiDil, isosorbide, Dilatrate, Imdur, Ismo, Isordil, Monoket" },
          { value: "nitrate_iv", label: "Nitrate IVs, patches, or ointments, such as nitroprusside, Nipride, nitroglycerin patch/ointment, Nitro-Bid, Nitro-Dur" },
          { value: "nitric_oxide", label: "Supplements that boost nitric oxide" },
          { value: "nitroglycerin", label: "Nitroglycerin under the tongue, spray or tablet" },
          { value: "riociguat", label: "Adempas / riociguat, used to treat pulmonary hypertension" },
          { value: "alpha_blocker", label: "Any alpha blocker" },
          { value: "isosorbide", label: "Isosorbide mononitrate or isosorbide dinitrate" },
        ];
        return (
          <div className="flex flex-col gap-4">
            <QuestionLabel>Do you use any of the following?</QuestionLabel>
            <p className="text-xs text-zinc-500">Please select any medication or supplement that you use, even if it is occasional use.</p>
            <div className="flex flex-col gap-2">
              {opts.map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={selected.includes(o.value)}
                  onClick={() => setAnswer("medicationContraindications", toggleExclusive(selected, o.value))} />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => ((answers.medicationContraindications as string[]) || []).length > 0,
    },

    // ── 12. Recreational drug contraindications ───────────────────────────
    {
      title: "Recreational drug use",
      tag: "Contraindications",
      rationale: {
        headline: "Poppers are a direct contraindication to ED medications in MSM populations",
        body: "Amyl nitrate (poppers) is used recreationally by a significant portion of MSM users — and creates the same dangerous hypotensive interaction as pharmaceutical nitrates. Asking about this without stigma is clinically necessary and signals cultural competency. This is a medication safety question, not a moral judgment.",
        insight: "Failing to screen for poppers use in a gay-first platform is not a neutral omission — it is a clinical gap that puts users at risk. This is sample screening logic for prototype purposes.",
      },
      isHardStop: (answers) => {
        const sel = (answers.recreationalDrugs as string[]) || [];
        return hasAny(sel, HARD_STOP_DRUGS);
      },
      render: (answers, setAnswer) => {
        const selected = (answers.recreationalDrugs as string[]) || [];
        const opts = [
          { value: "none", label: "None of the below" },
          { value: "meth", label: "Methamphetamines or amphetamines, including crystal meth" },
          { value: "poppers", label: "Poppers or Rush, including amyl nitrate or butyl nitrate" },
          { value: "cocaine", label: "Cocaine" },
          { value: "mdma", label: "Molly, MDMA, or ecstasy" },
          { value: "other_drug", label: "Other drug, prescription medication not prescribed by a clinician, or prescription medicine not used in the way it was written by a clinician" },
        ];
        return (
          <div className="flex flex-col gap-4">
            <QuestionLabel>In the past 6 months, have you used any of these recreational drugs?</QuestionLabel>
            <p className="text-xs text-zinc-500">Select all that apply.</p>
            <div className="flex flex-col gap-2">
              {opts.map((o) => (
                <OptionButton key={o.value} label={o.label}
                  selected={selected.includes(o.value)}
                  onClick={() => setAnswer("recreationalDrugs", toggleExclusive(selected, o.value))} />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => ((answers.recreationalDrugs as string[]) || []).length > 0,
    },

    // ── 13. Other medical history and HIV/AIDS ────────────────────────────
    {
      title: "Other medical history",
      tag: "Health history",
      rationale: {
        headline: "HIV status and medications affect drug metabolism and appropriate treatment",
        body: "HIV protease inhibitors are CYP3A4 inhibitors that significantly increase plasma levels of sildenafil and similar drugs, raising the risk of adverse effects. Capturing HIV status and medication names allows the clinician to adjust dosing or flag contraindications. The HIV question is clinical, not discriminatory.",
        insight: "This platform serves a predominantly MSM user base. Asking about HIV status and medications with clinical framing — rather than avoiding it — is both medically necessary and a signal of competence and trust.",
      },
      render: (answers, setAnswer) => {
        const otherHistory = (answers.otherMedHistory as string[]) || [];
        const hivMeds = (answers.hivMeds as string[]) || [];
        const historyOpts = [
          { value: "none", label: "None of the below" },
          { value: "prostate_radiation", label: "Surgery or radiation to the prostate or pelvis" },
          { value: "neuro", label: "Multiple sclerosis, spinal injuries, paralysis, or neurological diseases" },
          { value: "kidney", label: "Kidney transplant or any condition affecting the kidney" },
          { value: "liver", label: "Liver disease characterized by abnormal liver labs" },
          { value: "ulcers", label: "Stomach, intestinal, or bowel ulcers" },
          { value: "prostate_cancer", label: "Prostate or bladder cancer" },
          { value: "arrhythmia", label: "Heart arrhythmias" },
          { value: "ibd", label: "Inflammatory bowel disease such as Crohn's or ulcerative colitis" },
          { value: "heart_abnormality", label: "Any acquired congenital or developmental abnormalities of the heart, including heart murmurs" },
        ];
        return (
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <QuestionLabel>Have you ever had, or do you currently have, any of the following?</QuestionLabel>
              <p className="text-xs text-zinc-500">Select all that apply.</p>
              <div className="flex flex-col gap-2">
                {historyOpts.map((o) => (
                  <OptionButton key={o.value} label={o.label}
                    selected={otherHistory.includes(o.value)}
                    onClick={() => setAnswer("otherMedHistory", toggleExclusive(otherHistory, o.value))} />
                ))}
              </div>
            </div>

            <SectionDivider label="HIV / AIDS" />

            <div className="flex flex-col gap-3">
              <QuestionLabel>Have you ever had, or do you currently have HIV or AIDS?</QuestionLabel>
              <div className="grid grid-cols-2 gap-2">
                {["No", "Yes"].map((opt) => (
                  <OptionButton key={opt} label={opt}
                    selected={answers.hivStatus === opt.toLowerCase()}
                    onClick={() => setAnswer("hivStatus", opt.toLowerCase())} />
                ))}
              </div>
            </div>

            {answers.hivStatus === "yes" && (
              <div className="flex flex-col gap-4">
                <QuestionLabel>Do you take any medications to manage your HIV/AIDS?</QuestionLabel>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "hiv_protease", label: "HIV protease inhibitors" },
                    { value: "hiv_other", label: "Other" },
                  ].map((o) => (
                    <OptionButton key={o.value} label={o.label}
                      selected={hivMeds.includes(o.value)}
                      onClick={() => setAnswer("hivMeds", toggleMulti(hivMeds, o.value))} />
                  ))}
                </div>
                {hivMeds.includes("hiv_other") && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="hiv-meds-other" className="text-sm font-medium text-zinc-300">
                      Please list the current medications you use to manage your HIV/AIDS.
                    </label>
                    <textarea
                      id="hiv-meds-other"
                      value={(answers.hivMedsOther as string) || ""}
                      onChange={(e) => setAnswer("hivMedsOther", e.target.value)}
                      rows={3}
                      placeholder="List medications here"
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
      canContinue: (answers) => {
        if (((answers.otherMedHistory as string[]) || []).length === 0) return false;
        if (!answers.hivStatus) return false;
        if (answers.hivStatus === "yes" && ((answers.hivMeds as string[]) || []).length === 0) return false;
        return true;
      },
    },

    // ── 16. Profile & contact ─────────────────────────────────────────────
    {
      title: "Profile & contact",
      tag: "Your profile",
      rationale: {
        headline: "Contact information enables clinical communication and care coordination",
        body: "Legal name, preferred name, and contact details are required for prescription issuance, shipping, and clinician follow-up. Preferred name allows the care team to communicate respectfully — an important inclusion signal for LGBTQ+ users.",
        insight: "Asking for preferred name alongside legal name is a common LGBTQ+ health inclusion practice. It allows clinicians and pharmacies to use the name a user actually goes by, while preserving legal name for prescription and billing requirements.",
      },
      render: (answers, setAnswer) => {
        const genderOpts = [
          { value: "man", label: "Man" },
          { value: "woman", label: "Woman" },
          { value: "nonbinary", label: "Non-binary" },
          { value: "trans_man", label: "Transgender man" },
          { value: "trans_woman", label: "Transgender woman" },
          { value: "genderqueer", label: "Genderqueer / gender fluid" },
          { value: "not_listed", label: "An identity not listed here" },
          { value: "prefer_not", label: "Prefer not to say" },
        ];
        return (
          <div className="flex flex-col gap-5">
            <InputField label="Legal name" id="legalName" placeholder="As it appears on your ID"
              value={(answers.legalName as string) || ""}
              onChange={(v) => setAnswer("legalName", v)} required />
            <InputField label="Preferred name" id="preferredName" placeholder="What should we call you?"
              value={(answers.preferredName as string) || ""}
              onChange={(v) => setAnswer("preferredName", v)} />
            <InputField label="Email" id="profileEmail" type="email" placeholder="you@example.com"
              value={(answers.profileEmail as string) || ""}
              onChange={(v) => setAnswer("profileEmail", v)} required />
            <InputField label="Phone" id="profilePhone" type="tel" placeholder="(555) 000-0000"
              value={(answers.profilePhone as string) || ""}
              onChange={(v) => setAnswer("profilePhone", v)} required />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-300">Gender identity <span className="text-xs font-normal text-zinc-500">(optional)</span></span>
              <div className="flex flex-col gap-2">
                {genderOpts.map((o) => (
                  <OptionButton key={o.value} label={o.label}
                    selected={answers.genderIdentity === o.value}
                    onClick={() => setAnswer("genderIdentity", o.value)} />
                ))}
              </div>
            </div>
          </div>
        );
      },
      canContinue: (answers) => !!(
        (answers.legalName as string)?.trim() &&
        (answers.profileEmail as string)?.trim() &&
        (answers.profilePhone as string)?.trim()
      ),
    },

    // ── 17. Required consent ──────────────────────────────────────────────
    {
      title: "Required consent",
      tag: "Consent",
      rationale: {
        headline: "Granular consent is designed to build trust and reflect genuine informed agreement",
        body: "A single 'I agree to everything' checkbox is more anxiety-inducing than clearly labeled, specific consent items. Breaking consent into labeled components helps users understand exactly what they're agreeing to. Consent language should be accurate about how notices are delivered — 'opportunity to review' is more precise than 'receipt' when the notice is provided as a linked document rather than separately delivered.",
        insight: "The hypothesis is that granular, plain-language consent items reduce avoidable post-enrollment questions about what users agreed to — and signal good faith to regulators. Keeping optional marketing consent (Grindr LLC) separate from required care consents preserves trust in a sensitive health context: users should never feel that marketing opt-in is a condition of receiving care.",
      },
      render: (answers, setAnswer) => {
        const consented = (answers.consent as string[]) || [];
        const items: { key: string; label: React.ReactNode }[] = [
          {
            key: "telehealth",
            label: "I consent to telehealth services and understand care is delivered asynchronously by independent licensed clinicians.",
          },
          {
            key: "hipaa",
            label: (
              <>
                I acknowledge that I have had the opportunity to review the{" "}
                <a href="#" onClick={(e) => e.stopPropagation()}
                  className="underline underline-offset-2 text-teal-400 hover:text-teal-300">
                  Notice of Privacy Practices
                </a>{" "}
                and consent to the use and disclosure of my health information as described.
              </>
            ),
          },
          {
            key: "rx",
            label: "I understand that a prescription may or may not be issued following clinical review, and that a prescription is not guaranteed.",
          },
          {
            key: "payment",
            label: "I understand that my payment method may be collected before clinical approval, but payment will not be processed unless my care plan is approved.",
          },
          {
            key: "age",
            label: "I certify that I am 18 years of age or older and that all information I have provided is accurate to the best of my knowledge.",
          },
        ];
        return (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-400">Please read and confirm each item. All are required to proceed.</p>
            {items.map((item) => (
              <CheckRow key={item.key} id={`consent_${item.key}`} label={item.label}
                checked={consented.includes(item.key)}
                onChange={(checked) =>
                  setAnswer("consent", checked ? [...consented, item.key] : consented.filter((v) => v !== item.key))
                } />
            ))}
            <SectionDivider label="Optional marketing consent" />
            <CheckRow
              id="consent_marketing"
              label="I agree to receive optional marketing communications from Grindr LLC, including communications about Woodwork and related Grindr products or services, by email or text. Consent is not required to use Woodwork or any other Grindr product or service. Message and data rates may apply. Reply STOP to opt out of texts."
              checked={answers.marketingConsent === "yes"}
              onChange={(checked) => setAnswer("marketingConsent", checked ? "yes" : "")}
            />
            <p className="text-xs leading-relaxed text-zinc-600">
              Care-related communications — including intake confirmation, clinician review status, and prescription updates — are sent regardless of this selection and are separate from marketing communications.
            </p>
          </div>
        );
      },
      canContinue: (answers) => ((answers.consent as string[]) || []).length === 5,
    },

    // ── 15. Review intake ─────────────────────────────────────────────────
    {
      title: "Review your intake",
      tag: "Review",
      rationale: {
        headline: "A review screen before submit is designed to increase confidence",
        body: "Giving users a summary of their answers before final submission creates a natural checkpoint. Users can catch errors, feel informed rather than rushed, and submit with higher confidence — potentially reducing avoidable post-submit support contacts.",
        insight: "A pre-submission review screen may reduce avoidable intake amendment support tickets by giving users a chance to review information before submission. Whether this improves NPS at the confirmation step is worth measuring post-launch.",
      },
      render: (answers) => {
        const edFreqLabels: Record<string, string> = {
          every_time: "Every time", more_than_half: "More than half of the time",
          occasionally: "Occasionally", rarely: "Rarely", never: "Never",
        };
        const mastLabels: Record<string, string> = {
          never: "Never", rarely: "Rarely", sometimes: "Sometimes", yes_always: "Yes, always",
        };
        const morningLabels: Record<string, string> = {
          yes_regularly: "Yes, regularly", no_rarely_never: "No, rarely or never",
        };
        const priorTxLabels: Record<string, string> = {
          none: "None", viagra: "Viagra / sildenafil", cialis: "Cialis / tadalafil",
          levitra: "Levitra / vardenafil", staxyn: "Staxyn / vardenafil", stendra: "Stendra / avanafil",
          other_med: "Other medication/supplement", other_device: "Surgery / device / injection",
        };
        const effLabels: Record<string, string> = { ineffective: "Ineffective", moderate: "Moderately effective", full: "Fully effective" };

        function displayMulti(key: string, labelMap?: Record<string, string>): string {
          const vals = (answers[key] as string[]) || [];
          if (vals.length === 0) return "—";
          if (labelMap) return vals.map((v) => labelMap[v] || v).join(", ");
          return vals.join(", ");
        }

        const genderLabels: Record<string, string> = {
          man: "Man", woman: "Woman", nonbinary: "Non-binary",
          trans_man: "Transgender man", trans_woman: "Transgender woman",
          genderqueer: "Genderqueer / gender fluid", not_listed: "An identity not listed here",
          prefer_not: "Prefer not to say",
        };

        const rows: { label: string; value: string }[] = [
          { label: "Legal name", value: (answers.legalName as string) || "—" },
          { label: "Preferred name", value: (answers.preferredName as string) || "—" },
          { label: "Email", value: (answers.profileEmail as string) || "—" },
          { label: "Phone", value: (answers.profilePhone as string) || "—" },
          { label: "Gender identity", value: answers.genderIdentity ? (genderLabels[answers.genderIdentity as string] || "—") : "—" },
          { label: "Marketing consent", value: answers.marketingConsent === "yes" ? "Opted in" : "Not opted in" },
          { label: "State", value: (answers.state as string) || "—" },
          { label: "Date of birth", value: answers.dob_month ? `${answers.dob_month}/${answers.dob_day}/${answers.dob_year}` : "—" },
          { label: "Sex assigned at birth", value: (answers.sex as string) || "—" },
          { label: "Height", value: answers.height_ft ? `${answers.height_ft}' ${answers.height_in || 0}"` : "—" },
          { label: "Weight", value: answers.weight ? `${answers.weight} lbs` : "—" },
          { label: "ED frequency", value: edFreqLabels[answers.edFrequency as string] || "—" },
          { label: "Masturbation erection", value: mastLabels[answers.masturbationErection as string] || "—" },
          { label: "Morning wood", value: morningLabels[answers.morningWood as string] || "—" },
          { label: "Prior treatment", value: displayMulti("priorTreatment", priorTxLabels) },
          { label: "Treatment effectiveness", value: effLabels[answers.priorTxEffectiveness as string] || "Not applicable" },
          { label: "Treatment reactions", value: displayMulti("priorTxReactions") || "Not applicable" },
          { label: "CV safety screen", value: displayMulti("cvSafety") },
          { label: "CV risk factors", value: displayMulti("cvRiskFactors") },
          { label: "Blood pressure", value: answers.systolic ? `${answers.systolic}/${answers.diastolic} mmHg` : "Not applicable" },
          { label: "Hemoglobin A1C", value: (answers.hba1c as string) || "Not applicable" },
          { label: "CV symptoms", value: displayMulti("cvSymptoms") || "Not applicable" },
          { label: "Penile health", value: displayMulti("penileHealth") },
          { label: "Medication contraindications", value: displayMulti("medicationContraindications") },
          { label: "Recreational drug use", value: displayMulti("recreationalDrugs") },
          { label: "Other medical history", value: displayMulti("otherMedHistory") },
          { label: "HIV status", value: answers.hivStatus === "yes" ? "Yes" : answers.hivStatus === "no" ? "No" : "—" },
          { label: "HIV medications", value: displayMulti("hivMeds") || "Not applicable" },
        ];

        return (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-400">Review your answers before submitting. Once submitted, you'll receive a confirmation.</p>
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
              {rows.map((row, i) => (
                <div key={row.label}
                  className={["flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-3",
                    i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-900/40"].join(" ")}>
                  <span className="text-xs font-medium text-zinc-500 sm:w-44 shrink-0">{row.label}</span>
                  <span className="text-sm text-zinc-200">{row.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },

    // ── 16. Submission confirmation ────────────────────────────────────────
    {
      title: "Intake submitted",
      tag: "Confirmation",
      rationale: {
        headline: "Post-submit confidence is a product moment, not an afterthought",
        body: "The confirmation screen is the last memory users have of the intake experience. A clear intake ID, explicit status, realistic timeline, and concrete next steps leave users feeling confident — not wondering 'did that work?'",
        insight: "Health app NPS scores are disproportionately driven by the post-submit moment. A polished confirmation screen with a unique ID and timeline has the same trust impact as a full rebrand.",
      },
      render: () => {
        const intakeId = `WW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-teal-800 bg-teal-950/40 px-6 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-900/60 text-3xl">✅</div>
              <h3 className="text-xl font-semibold text-teal-100">You're all set</h3>
              <p className="text-sm text-teal-300/80">Your intake has been submitted and is pending clinical review.</p>
              <div className="rounded-lg border border-teal-700/60 bg-teal-900/40 px-4 py-2">
                <p className="text-xs font-medium text-teal-500 uppercase tracking-widest">Intake ID</p>
                <p className="text-lg font-mono font-bold text-teal-200">{intakeId}</p>
              </div>
            </div>
            <div className="grid gap-3">
              {[
                { icon: "📧", title: "Confirmation sent", body: "A confirmation has been sent to the contact associated with your account." },
                { icon: "🩺", title: "Clinical review: 24–48 hours", body: "A licensed clinician will review your intake. You'll be notified when your review is complete." },
                { icon: "💊", title: "If approved: care plan & prescription", body: "Your clinician will outline a personalized ED care plan. Payment is only collected at this stage." },
                { icon: "🚚", title: "Shipping: 3–5 business days", body: "After approval and payment, your medication ships from a licensed pharmacy." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5">
                  <span className="text-xl leading-none">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
                    <p className="text-xs leading-relaxed text-zinc-500 mt-0.5">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },

    // ── 17. Payment timing transparency ───────────────────────────────────
    {
      title: "About payment",
      tag: "Payment clarity",
      rationale: {
        headline: "Payment timing should be an explicit trust signal, not fine print",
        body: "Burying payment timing in terms of service is a trust anti-pattern. Making it a dedicated screen communicates respect for the user's financial autonomy and may reduce post-approval payment surprises. It is also important to distinguish clearly between collecting a payment method (which may happen before approval) and processing a payment (which should only happen after approval) — conflating the two is a common source of user confusion and disputes.",
        insight: "The hypothesis is that making 'you only pay after approval' an explicit, featured commitment — rather than burying it in terms of service — may improve conversion and reduce payment disputes. This is a testable claim, not an established benchmark.",
      },
      render: () => (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-teal-800 bg-teal-950/40 px-5 py-5">
            <p className="text-sm font-bold text-teal-200 mb-1">You will not be charged today.</p>
            <p className="text-sm text-teal-300/80">Payment is only collected after a licensed clinician has reviewed your intake and issued a care plan. If you're not approved, you owe nothing.</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">When charges occur</p>
            {[
              { step: "Now", status: "free", label: "Intake submitted", detail: "No charge" },
              { step: "24–48h", status: "pending", label: "Clinical review", detail: "No charge" },
              { step: "After approval", status: "charge", label: "Care plan accepted", detail: "First charge occurs here" },
              { step: "Monthly", status: "recurring", label: "Ongoing subscription", detail: "Cancel anytime" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="flex flex-col items-center w-16 shrink-0">
                  <span className="text-xs text-zinc-600">{item.step}</span>
                  <span className={["mt-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    item.status === "charge" ? "bg-amber-900/60 text-amber-300" : "bg-zinc-800 text-zinc-400"].join(" ")}>
                    {item.status === "free" || item.status === "pending" ? "Free" : item.status === "charge" ? "Paid" : "Sub"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <InfoBlock>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Pricing varies by care plan. Your clinician will outline costs in your care plan before any charge is made. You'll have an opportunity to review and accept before payment is processed.
            </p>
          </InfoBlock>
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// IntakeFlow — main orchestrator
// ---------------------------------------------------------------------------

export default function IntakeFlow() {
  const [showLanding, setShowLanding] = useState(true);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showHardStop, setShowHardStop] = useState(false);
  const [hardStopReason, setHardStopReason] = useState<HardStopReason>("safety");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  // Must be declared before any early return to satisfy the Rules of Hooks.
  const setAnswer = useCallback(
    (key: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  if (showLanding) return <LandingIntro onStart={() => setShowLanding(false)} />;

  if (showWaitlist) {
    return (
      <WaitlistFlow
        selectedState={answers.state as string}
        onChangeState={() => { setShowWaitlist(false); setStep(1); }}
      />
    );
  }

  const allSteps = buildSteps();
  const current = allSteps[step];

  const resetAll = () => {
    setStep(0); setAnswers({}); setShowHardStop(false); setShowWaitlist(false); setShowLanding(true);
  };

  if (showHardStop) {
    return (
      <HardStop
        reason={hardStopReason}
        onStartOver={resetAll}
        onGoBack={() => setShowHardStop(false)}
      />
    );
  }

  // Visible step computation (excludes shouldSkip steps from progress count)
  const visibleIndices = allSteps.map((_, i) => i).filter((i) => !allSteps[i].shouldSkip?.(answers));
  const visiblePosition = visibleIndices.indexOf(step) + 1;
  const visibleTotal = visibleIndices.length;

  const canContinue = !current.canContinue || current.canContinue(answers);
  const isLastStep = step === allSteps.length - 1;
  const isReviewStep = step === 18; // index 18 = "Review intake" — submit happens here

  function handleContinue() {
    if (current.isHardStop?.(answers)) {
      const reason: HardStopReason = step === 13 ? "medication" : step === 14 ? "drug" : "safety";
      setHardStopReason(reason);
      setShowHardStop(true);
      return;
    }
    if (isLastStep) return;
    let next = step + 1;
    while (next < allSteps.length && allSteps[next].shouldSkip?.(answers)) next++;
    if (next < allSteps.length) setStep(next);
  }

  function handleBack() {
    if (step === 0) return;
    let prev = step - 1;
    while (prev >= 0 && allSteps[prev].shouldSkip?.(answers)) prev--;
    if (prev >= 0) setStep(prev);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700/80 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-300">Health Intake Prototype</span>
            </div>
            <div className="flex-1 max-w-xs">
              <ProgressBar current={visiblePosition} total={visibleTotal} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl px-4 py-8">
          <div className="flex gap-8 lg:gap-12">
            {/* Step content */}
            <div className="flex-1 min-w-0">
              <StepCard tag={current.tag} title={current.title}>
                {current.render(answers, setAnswer, () => setShowWaitlist(true))}
              </StepCard>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <button type="button" onClick={handleBack} disabled={step === 0}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                {!isLastStep && (
                  <button type="button" onClick={handleContinue} disabled={!canContinue}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40">
                    {isReviewStep ? "Submit intake" : "Continue"}
                    {!isReviewStep && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                )}

                {isLastStep && (
                  <button type="button" onClick={resetAll}
                    className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-zinc-100">
                    Start over
                  </button>
                )}
              </div>
            </div>

            {/* Rationale panel — desktop only */}
            <div className="hidden lg:block w-72 xl:w-80 shrink-0">
              <div className="sticky top-24">
                <RationalePanel headline={current.rationale.headline} body={current.rationale.body} insight={current.rationale.insight} />
              </div>
            </div>
          </div>

          {/* Rationale panel — mobile */}
          <div className="mt-8 lg:hidden">
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-300">
                <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Design rationale
              </summary>
              <div className="mt-3">
                <RationalePanel headline={current.rationale.headline} body={current.rationale.body} insight={current.rationale.insight} />
              </div>
            </details>
          </div>
        </div>
      </main>

      {/* Disclaimer footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <p className="mx-auto max-w-5xl text-center text-xs leading-relaxed text-zinc-600">
          Outside-in prototype. Not affiliated with Woodwork or Grindr. Not clinical, legal, or compliance advice.
        </p>
      </footer>
    </div>
  );
}

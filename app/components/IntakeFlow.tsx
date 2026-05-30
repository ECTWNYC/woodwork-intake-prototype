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

interface StepConfig {
  title: string;
  tag?: string;
  rationale: {
    headline: string;
    body: string;
    insight?: string;
  };
  render: (answers: Answers, setAnswer: (key: string, value: string | string[]) => void, onJoinWaitlist?: () => void) => React.ReactNode;
  canContinue?: (answers: Answers) => boolean;
}

// ---------------------------------------------------------------------------
// Helper sub-components (defined inline — they are step-specific UI patterns)
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
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  hint,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="ml-1 text-teal-400">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
      {hint && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
  );
}

function TextareaField({
  label,
  id,
  placeholder,
  value,
  onChange,
  hint,
}: {
  label: string;
  id: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
      />
      {hint && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
  );
}

function SelectField({
  label,
  id,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="ml-1 text-teal-400">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-all duration-150",
        checked
          ? "border-teal-500 bg-teal-950/60"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500",
      ].join(" ")}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={[
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          checked ? "border-teal-500 bg-teal-500" : "border-zinc-600 bg-transparent",
        ].join(" ")}
      >
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

// ---------------------------------------------------------------------------
// Helpers for multi-select answers
// ---------------------------------------------------------------------------

function toggleMulti(current: string[], value: string): string[] {
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}

// ---------------------------------------------------------------------------
// US States
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
// Step definitions
// ---------------------------------------------------------------------------

function buildSteps(): StepConfig[] {
  return [
    // -------------------------------------------------------------------------
    // Step 1 — Before you start
    // -------------------------------------------------------------------------
    {
      title: "Before you start",
      tag: "Intake overview",
      rationale: {
        headline: "Set expectations before asking anything",
        body: "Leading with a brief orientation reduces form anxiety and signals transparency. Users who understand what they're signing up for before they begin may be less likely to abandon mid-flow.",
        insight: "The hypothesis: users who see what to expect before step 1 are less likely to drop off early. Previewing time-to-complete and process steps is a low-cost intervention worth testing against a control.",
      },
      render: () => (
        <div className="flex flex-col gap-5">
          <InfoBlock>
            <p className="text-zinc-300 font-medium mb-2">
              This intake takes about 5–7 minutes.
            </p>
            <p>
              A licensed clinician will review your information and determine whether you are a candidate for sermorelin therapy. You won't be charged until a clinician has reviewed your intake and approved a care plan.
            </p>
          </InfoBlock>
          <NumberedList
            items={[
              "Answer questions about your health history and goals",
              "A clinician reviews your intake (typically within 24–48 hours)",
              "If approved, you'll receive a care plan and payment options",
              "Your prescription ships within 3–5 business days of approval",
            ]}
          />
          <InfoBlock>
            <p className="text-xs text-zinc-500">
              Your data is protected under HIPAA. Nothing you share is sold or used for advertising.
            </p>
          </InfoBlock>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // Step 2 — How care works
    // -------------------------------------------------------------------------
    {
      title: "How care works",
      tag: "Care model",
      rationale: {
        headline: "Demystify the clinical process upfront",
        body: "Explaining the care model early reduces the cognitive load of wondering 'what happens next?' as users move through intake. It also sets accurate expectations about the async review model, reducing post-submit anxiety.",
        insight: "The goal is to reduce avoidable 'what happens next?' support contacts by answering that question proactively within the flow — before users have a reason to reach out.",
      },
      render: () => (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-zinc-400">
            Woodwork operates as an asynchronous telehealth platform. Your care is handled by licensed, independent clinicians — not algorithms.
          </p>
          <div className="grid gap-3">
            {[
              {
                icon: "📋",
                title: "You complete intake",
                body: "Answer questions about your health, goals, and history at your own pace.",
              },
              {
                icon: "🩺",
                title: "A clinician reviews",
                body: "A licensed provider reviews your intake, usually within 24–48 hours.",
              },
              {
                icon: "💊",
                title: "Care plan & prescription",
                body: "If you're a candidate, the clinician writes a care plan and prescription.",
              },
              {
                icon: "🚚",
                title: "Medication ships to you",
                body: "Your medication is dispensed by a licensed compounding pharmacy.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5"
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
                  <p className="text-xs leading-relaxed text-zinc-500 mt-0.5">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // Step 3 — State availability
    // -------------------------------------------------------------------------
    {
      title: "Where do you live?",
      tag: "State availability",
      rationale: {
        headline: "Route unavailable-state users to demand capture, not clinical intake",
        body: "Unavailable-state users should not answer sensitive clinical questions if care cannot be provided. Routing them to a waitlist avoids unnecessary sensitive data collection, reduces confusion, and creates a clean state-level demand signal.",
        insight: "Note: state availability here is illustrative sample logic for prototype purposes. Actual availability would need to come from Woodwork's live eligibility rules, clinical operations, or legal/compliance source of truth.",
      },
      render: (answers, setAnswer, onJoinWaitlist) => {
        const state = (answers.state as string) || "";
        const isAvailable = AVAILABLE_STATES.includes(state);
        const isUnavailable = state !== "" && !isAvailable;
        return (
          <div className="flex flex-col gap-5">
            <SelectField
              label="State of residence"
              id="state"
              value={state}
              onChange={(v) => setAnswer("state", v)}
              options={US_STATES.map((s) => ({ value: s, label: s }))}
              required
            />
            <p className="text-xs leading-relaxed text-zinc-600">
              For prototype purposes, state availability is illustrative. Actual availability would need to come from Woodwork's live eligibility rules, clinical operations, or legal/compliance source of truth.
            </p>
            {isAvailable && (
              <div className="flex items-center gap-2 rounded-xl border border-teal-800 bg-teal-950/60 px-4 py-3">
                <span className="text-lg">✅</span>
                <p className="text-sm text-teal-300">
                  In this prototype, {state} is treated as an available state. You're good to continue.
                </p>
              </div>
            )}
            {isUnavailable && (
              <div className="flex flex-col gap-4 rounded-xl border border-amber-800 bg-amber-950/40 px-5 py-5">
                <div>
                  <p className="text-sm font-semibold text-amber-300 mb-1">
                    Not available in {state} in this prototype
                  </p>
                  <p className="text-sm leading-relaxed text-amber-400/80">
                    In this prototype, {state} is treated as an unavailable state. Join the waitlist to see how the demand capture flow works.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onJoinWaitlist?.()}
                    className="w-full rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-500"
                  >
                    Join waitlist
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer("state", "")}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-500 hover:text-zinc-200"
                  >
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

    // -------------------------------------------------------------------------
    // Step 4 — Evaluated for sermorelin
    // -------------------------------------------------------------------------
    {
      title: "You're being evaluated for sermorelin",
      tag: "Treatment context",
      rationale: {
        headline: "Name the treatment before asking about it",
        body: "Users should know what they're being evaluated for before being asked about eligibility criteria. Transparency about the specific therapy builds informed consent and may reduce post-approval surprises.",
        insight: "The hypothesis is that naming the medication early — including what it is and isn't — reduces avoidable clinical support contacts from patients surprised by what they enrolled in. This is worth tracking post-launch.",
      },
      render: () => (
        <div className="flex flex-col gap-5">
          <InfoBlock>
            <p className="text-sm leading-relaxed text-zinc-300 mb-3">
              <span className="font-semibold text-teal-300">Sermorelin</span> is a growth hormone-releasing hormone (GHRH) analog. It stimulates the pituitary gland to naturally produce and release growth hormone.
            </p>
            <BulletList
              items={[
                "FDA-regulated peptide therapy, available via prescription",
                "Administered via subcutaneous self-injection (like insulin)",
                "Not a controlled substance",
                "Compounded by a licensed pharmacy based on your prescription",
              ]}
            />
          </InfoBlock>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              What sermorelin is not
            </p>
            <BulletList
              items={[
                "Not synthetic HGH (human growth hormone)",
                "Not a steroid or anabolic compound",
                "Not a cure or guaranteed treatment",
              ]}
            />
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Results vary. A licensed clinician will review whether sermorelin is appropriate for your specific situation.
          </p>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // Step 5 — Main goals
    // -------------------------------------------------------------------------
    {
      title: "What are your main goals?",
      tag: "Goals",
      rationale: {
        headline: "Capture goals to personalize the care plan",
        body: "Asking for goals signals that care will be tailored — not one-size-fits-all. This also gives clinicians richer context for the initial care plan. Multi-select allows users to be honest about their full picture.",
        insight: "The hypothesis is that users who articulate their goals during intake may be more likely to follow through with a multi-month protocol. This is a design bet worth validating with longitudinal engagement data.",
      },
      render: (answers, setAnswer) => {
        const selected = (answers.goals as string[]) || [];
        const options = [
          { value: "muscle", label: "Build lean muscle", icon: "💪" },
          { value: "energy", label: "Improve energy & vitality", icon: "⚡" },
          { value: "sleep", label: "Better sleep quality", icon: "😴" },
          { value: "fat", label: "Support fat loss", icon: "🔥" },
          { value: "recovery", label: "Faster recovery", icon: "🏃" },
          { value: "libido", label: "Improve libido", icon: "❤️" },
          { value: "mood", label: "Mood & mental clarity", icon: "🧠" },
          { value: "aging", label: "Healthy aging", icon: "🌿" },
        ];
        return (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-500">Select all that apply</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {options.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  icon={opt.icon}
                  selected={selected.includes(opt.value)}
                  onClick={() =>
                    setAnswer("goals", toggleMulti(selected, opt.value))
                  }
                />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => ((answers.goals as string[]) || []).length > 0,
    },

    // -------------------------------------------------------------------------
    // Step 6 — Duration of concerns
    // -------------------------------------------------------------------------
    {
      title: "How long have you experienced these concerns?",
      tag: "Duration",
      rationale: {
        headline: "Duration signals clinical urgency and protocol framing",
        body: "Understanding how long symptoms have been present helps clinicians frame the care plan and set appropriate timelines. It also reassures users that their experience is being taken seriously, not dismissed.",
        insight: "The hypothesis is that patients who feel their symptom timeline is acknowledged are more likely to feel heard — even in async models. Whether that translates to satisfaction scores is worth measuring post-launch.",
      },
      render: (answers, setAnswer) => {
        const options = [
          { value: "lt3m", label: "Less than 3 months", description: "Recent onset" },
          { value: "3to12m", label: "3–12 months", description: "Several months" },
          { value: "1to3y", label: "1–3 years", description: "Over a year" },
          { value: "3yplus", label: "3+ years", description: "Chronic or long-standing" },
        ];
        return (
          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                description={opt.description}
                selected={answers.duration === opt.value}
                onClick={() => setAnswer("duration", opt.value)}
              />
            ))}
          </div>
        );
      },
      canContinue: (answers) => !!answers.duration,
    },

    // -------------------------------------------------------------------------
    // Step 7 — Basic eligibility
    // -------------------------------------------------------------------------
    {
      title: "Basic eligibility",
      tag: "Eligibility",
      rationale: {
        headline: "Collect biometric context before clinical history",
        body: "DOB, sex assigned at birth, height, and weight are foundational to dosing calculations. Capturing them here — before health history — mirrors how a clinical chart is structured and reduces cognitive load by grouping similar questions.",
        insight: "Structured fields with clear labels are expected to produce fewer data-entry errors than free-text alternatives. Errors in DOB or weight directly delay clinical review — making input quality a clinical concern, not just a UX one.",
      },
      render: (answers, setAnswer) => {
        const attest = (answers.eligibilityAttest as string[]) || [];
        return (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-3">
              <SelectField
                label="Birth month"
                id="dob_month"
                value={(answers.dob_month as string) || ""}
                onChange={(v) => setAnswer("dob_month", v)}
                options={[
                  { value: "01", label: "January" },
                  { value: "02", label: "February" },
                  { value: "03", label: "March" },
                  { value: "04", label: "April" },
                  { value: "05", label: "May" },
                  { value: "06", label: "June" },
                  { value: "07", label: "July" },
                  { value: "08", label: "August" },
                  { value: "09", label: "September" },
                  { value: "10", label: "October" },
                  { value: "11", label: "November" },
                  { value: "12", label: "December" },
                ]}
                required
              />
              <SelectField
                label="Day"
                id="dob_day"
                value={(answers.dob_day as string) || ""}
                onChange={(v) => setAnswer("dob_day", v)}
                options={Array.from({ length: 31 }, (_, i) => ({
                  value: String(i + 1).padStart(2, "0"),
                  label: String(i + 1),
                }))}
                required
              />
              <SelectField
                label="Year"
                id="dob_year"
                value={(answers.dob_year as string) || ""}
                onChange={(v) => setAnswer("dob_year", v)}
                options={Array.from({ length: 80 }, (_, i) => {
                  const y = new Date().getFullYear() - 18 - i;
                  return { value: String(y), label: String(y) };
                })}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-300">
                Sex assigned at birth <span className="text-teal-400">*</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {["Male", "Female", "Intersex"].map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={answers.sex === opt}
                    onClick={() => setAnswer("sex", opt)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-zinc-300">
                  Height <span className="text-teal-400">*</span>
                </span>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min={1}
                      max={8}
                      placeholder="ft"
                      value={(answers.height_ft as string) || ""}
                      onChange={(e) => setAnswer("height_ft", e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min={0}
                      max={11}
                      placeholder="in"
                      value={(answers.height_in as string) || ""}
                      onChange={(e) => setAnswer("height_in", e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-600">feet / inches</p>
              </div>
              <InputField
                label="Weight"
                id="weight"
                type="number"
                placeholder="lbs"
                value={(answers.weight as string) || ""}
                onChange={(v) => setAnswer("weight", v)}
                required
                hint="pounds"
              />
            </div>

            <SectionDivider label="Eligibility attestations" />

            <div className="flex flex-col gap-2">
              {[
                { key: "adult", label: "I confirm I am 18 years of age or older" },
                { key: "nopregnant", label: "I am not currently pregnant or nursing" },
                { key: "nocontraindicate", label: "I have no known active cancer diagnosis" },
              ].map((item) => (
                <CheckRow
                  key={item.key}
                  id={`attest_${item.key}`}
                  label={item.label}
                  checked={attest.includes(item.key)}
                  onChange={(checked) =>
                    setAnswer(
                      "eligibilityAttest",
                      checked
                        ? [...attest, item.key]
                        : attest.filter((v) => v !== item.key)
                    )
                  }
                />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) => {
        const attest = (answers.eligibilityAttest as string[]) || [];
        return !!(
          answers.dob_month &&
          answers.dob_day &&
          answers.dob_year &&
          answers.sex &&
          answers.height_ft &&
          answers.weight &&
          attest.length === 3
        );
      },
    },

    // -------------------------------------------------------------------------
    // Step 8 — Health history
    // -------------------------------------------------------------------------
    {
      title: "Health history",
      tag: "Medical history",
      rationale: {
        headline: "Structured history is designed to reduce clinician follow-up time",
        body: "A well-structured health history screen that uses checkboxes rather than free-text may reduce clinician review time and limit ambiguous responses. The framing 'select any that apply' is less alarming than 'do you have...' for each condition individually.",
        insight: "The hypothesis is that structured intake reduces avoidable clinician follow-up messages — the kind that arise when a free-text answer is incomplete or ambiguous. This is a meaningful post-launch metric to track.",
      },
      render: (answers, setAnswer) => {
        const selected = (answers.healthHistory as string[]) || [];
        const conditions = [
          "Type 1 or Type 2 diabetes",
          "Thyroid disorder (hypo or hyper)",
          "Cardiovascular disease or history of heart attack",
          "Sleep apnea (diagnosed)",
          "Autoimmune condition",
          "Kidney or liver disease",
          "History of cancer (any type)",
          "Psychiatric diagnosis (depression, anxiety, bipolar, etc.)",
          "Pituitary disorder",
          "None of the above",
        ];
        return (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-400">
              Select any conditions that apply to you. This helps the clinician understand your full health picture.
            </p>
            <div className="flex flex-col gap-2">
              {conditions.map((condition) => (
                <CheckRow
                  key={condition}
                  id={`hh_${condition}`}
                  label={condition}
                  checked={selected.includes(condition)}
                  onChange={(checked) =>
                    setAnswer(
                      "healthHistory",
                      checked
                        ? [...selected.filter((v) => v !== "None of the above"), condition].filter(
                            (v) => !(condition === "None of the above" ? v !== "None of the above" : false)
                          )
                        : selected.filter((v) => v !== condition)
                    )
                  }
                />
              ))}
            </div>
          </div>
        );
      },
      canContinue: (answers) =>
        ((answers.healthHistory as string[]) || []).length > 0,
    },

    // -------------------------------------------------------------------------
    // Step 9 — Additional clinician note
    // -------------------------------------------------------------------------
    {
      title: "Anything else the clinician should know?",
      tag: "Clinical context",
      rationale: {
        headline: "An open text field signals genuine clinical interest",
        body: "Offering a free-text field after structured questions communicates that the clinician is a real person who reads chart notes — not an algorithm making binary decisions. Users often share the most clinically relevant information here.",
        insight: "In async telehealth, the free-text note field has the highest per-character clinical value of any intake field. Patients surface medication allergies, prior treatment failures, and nuanced symptoms that structured questions miss.",
      },
      render: (answers, setAnswer) => (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-400">
            This is optional, but encouraged. Share anything that feels relevant — medications you're currently taking, supplements, past treatments, concerns, or questions.
          </p>
          <TextareaField
            label="Note to your clinician"
            id="clinicianNote"
            placeholder="e.g., I've been on testosterone therapy for 6 months and wondering about stacking sermorelin…"
            value={(answers.clinicianNote as string) || ""}
            onChange={(v) => setAnswer("clinicianNote", v)}
            hint="Optional. Your clinician will read this before reviewing your intake."
          />
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // Step 10 — Contact information
    // -------------------------------------------------------------------------
    {
      title: "Contact information",
      tag: "Contact",
      rationale: {
        headline: "Collect contact after clinical investment, not before",
        body: "Asking for contact information after users have invested time in the intake — rather than at the start — may reduce friction and anxiety. Users are more likely to share accurate contact details once they've decided they want care.",
        insight: "The hypothesis is that users who have committed to the intake before being asked for contact details are more willing to share accurate information. Gating on contact info at step 1 may deter users before they've experienced any value.",
      },
      render: (answers, setAnswer) => (
        <div className="flex flex-col gap-4">
          <InputField
            label="Email address"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={(answers.email as string) || ""}
            onChange={(v) => setAnswer("email", v)}
            required
            hint="Used to send your care plan and intake confirmation"
          />
          <InputField
            label="Phone number"
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={(answers.phone as string) || ""}
            onChange={(v) => setAnswer("phone", v)}
            required
            hint="For urgent clinical communications only. We don't cold-call."
          />
        </div>
      ),
      canContinue: (answers) =>
        !!(answers.email && answers.phone),
    },

    // -------------------------------------------------------------------------
    // Step 11 — Legal name + optional preferred name / gender identity
    // -------------------------------------------------------------------------
    {
      title: "Legal name",
      tag: "Identity",
      rationale: {
        headline: "Separate legal identity from lived identity",
        body: "Legal name is required for prescription processing. But collecting preferred name and gender identity alongside it — as clearly optional fields — signals inclusion and care team personalization. The framing matters: 'What should your care team call you?' is warmer than 'Preferred name.'",
        insight: "Research on inclusive health experiences suggests that asking patients how they'd like to be addressed is associated with higher perceived trust and cultural safety. This field is a low-effort signal that care will be personalized.",
      },
      render: (answers, setAnswer) => (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Legal first name"
              id="firstName"
              placeholder="First"
              value={(answers.firstName as string) || ""}
              onChange={(v) => setAnswer("firstName", v)}
              required
              hint="As it appears on your ID"
            />
            <InputField
              label="Legal last name"
              id="lastName"
              placeholder="Last"
              value={(answers.lastName as string) || ""}
              onChange={(v) => setAnswer("lastName", v)}
              required
            />
          </div>

          <SectionDivider label="Optional — how your care team addresses you" />

          <InputField
            label="Preferred name"
            id="preferredName"
            placeholder="What should your care team call you?"
            value={(answers.preferredName as string) || ""}
            onChange={(v) => setAnswer("preferredName", v)}
            hint="Optional. Shown to your clinician and care team."
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">
              Gender identity{" "}
              <span className="text-zinc-600 font-normal">(optional)</span>
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                "Man",
                "Woman",
                "Non-binary",
                "Prefer to self-describe",
                "Prefer not to say",
              ].map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={answers.genderIdentity === opt}
                  onClick={() => setAnswer("genderIdentity", opt)}
                />
              ))}
            </div>
            {answers.genderIdentity === "Prefer to self-describe" && (
              <InputField
                label="Self-described gender identity"
                id="genderSelfDescribe"
                placeholder="Describe in your own words"
                value={(answers.genderSelfDescribe as string) || ""}
                onChange={(v) => setAnswer("genderSelfDescribe", v)}
              />
            )}
          </div>
        </div>
      ),
      canContinue: (answers) =>
        !!(answers.firstName && answers.lastName),
    },

    // -------------------------------------------------------------------------
    // Step 12 — Required consent
    // -------------------------------------------------------------------------
    {
      title: "Required consent",
      tag: "Consent",
      rationale: {
        headline: "Granular consent is designed to build trust and reflect genuine informed agreement",
        body: "A single 'I agree to everything' checkbox is more anxiety-inducing than clearly labeled, specific consent items. Breaking consent into labeled components helps users understand exactly what they're agreeing to.",
        insight: "The hypothesis is that granular, plain-language consent items reduce avoidable post-enrollment questions about what users agreed to — and signal good faith to regulators. Neither effect is guaranteed. This is not legal advice.",
      },
      render: (answers, setAnswer) => {
        const consented = (answers.consent as string[]) || [];
        const items = [
          {
            key: "telehealth",
            label: "I consent to telehealth services and understand care is delivered asynchronously by independent licensed clinicians.",
          },
          {
            key: "hipaa",
            label: "I acknowledge receipt of the Notice of Privacy Practices and consent to the use of my health information as described.",
          },
          {
            key: "rx",
            label: "I understand that a prescription may or may not be issued following clinical review, and that a prescription is not guaranteed.",
          },
          {
            key: "payment",
            label: "I understand that payment is not collected until after clinical approval of my care plan.",
          },
          {
            key: "age",
            label: "I certify that I am 18 years of age or older and that all information I have provided is accurate to the best of my knowledge.",
          },
        ];
        return (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-400">
              Please read and confirm each item. All are required to proceed.
            </p>
            {items.map((item) => (
              <CheckRow
                key={item.key}
                id={`consent_${item.key}`}
                label={item.label}
                checked={consented.includes(item.key)}
                onChange={(checked) =>
                  setAnswer(
                    "consent",
                    checked
                      ? [...consented, item.key]
                      : consented.filter((v) => v !== item.key)
                  )
                }
              />
            ))}
          </div>
        );
      },
      canContinue: (answers) =>
        ((answers.consent as string[]) || []).length === 5,
    },

    // -------------------------------------------------------------------------
    // Step 13 — Review intake
    // -------------------------------------------------------------------------
    {
      title: "Review your intake",
      tag: "Review",
      rationale: {
        headline: "A review screen before submit is designed to increase confidence",
        body: "Giving users a summary of their answers before final submission creates a natural checkpoint. Users can catch errors, feel informed rather than rushed, and submit with higher confidence — potentially reducing avoidable post-submit support contacts.",
        insight: "A pre-submission review screen may reduce avoidable intake amendment support tickets by giving users a chance to review information before submission. Whether this improves NPS at the confirmation step is worth measuring post-launch.",
      },
      render: (answers) => {
        const goalMap: Record<string, string> = {
          muscle: "Build lean muscle",
          energy: "Improve energy & vitality",
          sleep: "Better sleep quality",
          fat: "Support fat loss",
          recovery: "Faster recovery",
          libido: "Improve libido",
          mood: "Mood & mental clarity",
          aging: "Healthy aging",
        };
        const durationMap: Record<string, string> = {
          lt3m: "Less than 3 months",
          "3to12m": "3–12 months",
          "1to3y": "1–3 years",
          "3yplus": "3+ years",
        };
        const rows = [
          { label: "State", value: answers.state as string },
          {
            label: "Date of birth",
            value: answers.dob_month
              ? `${answers.dob_month}/${answers.dob_day}/${answers.dob_year}`
              : "—",
          },
          { label: "Sex assigned at birth", value: answers.sex as string },
          {
            label: "Height",
            value: answers.height_ft
              ? `${answers.height_ft}' ${answers.height_in || 0}"`
              : "—",
          },
          { label: "Weight", value: answers.weight ? `${answers.weight} lbs` : "—" },
          {
            label: "Goals",
            value: ((answers.goals as string[]) || [])
              .map((g) => goalMap[g] || g)
              .join(", ") || "—",
          },
          { label: "Duration", value: durationMap[answers.duration as string] || "—" },
          { label: "Legal name", value: answers.firstName ? `${answers.firstName} ${answers.lastName}` : "—" },
          { label: "Preferred name", value: (answers.preferredName as string) || "Not provided" },
          { label: "Gender identity", value: (answers.genderSelfDescribe as string) || (answers.genderIdentity as string) || "Not provided" },
          { label: "Email", value: answers.email as string },
          { label: "Phone", value: answers.phone as string },
          {
            label: "Health conditions",
            value: ((answers.healthHistory as string[]) || []).join(", ") || "—",
          },
          {
            label: "Clinician note",
            value: (answers.clinicianNote as string) || "None provided",
          },
        ];
        return (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-400">
              Review your answers before submitting. Once submitted, you'll receive a confirmation email.
            </p>
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className={[
                    "flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-3",
                    i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-900/40",
                  ].join(" ")}
                >
                  <span className="text-xs font-medium text-zinc-500 sm:w-36 shrink-0">
                    {row.label}
                  </span>
                  <span className="text-sm text-zinc-200">{row.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },

    // -------------------------------------------------------------------------
    // Step 14 — Submission confirmation
    // -------------------------------------------------------------------------
    {
      title: "Intake submitted",
      tag: "Confirmation",
      rationale: {
        headline: "Post-submit confidence is a product moment, not an afterthought",
        body: "The confirmation screen is the last memory users have of the intake experience. A clear intake ID, explicit status, realistic timeline, and concrete next steps leave users feeling confident — not wondering 'did that work?'",
        insight: "Health app NPS scores are disproportionately driven by the post-submit moment. A polished confirmation screen with a unique ID and timeline has the same trust impact as a full rebrand.",
      },
      render: (answers) => {
        const intakeId = `WW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const name = (answers.preferredName as string) || (answers.firstName as string) || "there";
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-teal-800 bg-teal-950/40 px-6 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-900/60 text-3xl">
                ✅
              </div>
              <h3 className="text-xl font-semibold text-teal-100">
                You're all set, {name}
              </h3>
              <p className="text-sm text-teal-300/80">
                Your intake has been submitted and is pending clinical review.
              </p>
              <div className="rounded-lg border border-teal-700/60 bg-teal-900/40 px-4 py-2">
                <p className="text-xs font-medium text-teal-500 uppercase tracking-widest">
                  Intake ID
                </p>
                <p className="text-lg font-mono font-bold text-teal-200">
                  {intakeId}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { icon: "📧", title: "Confirmation email sent", body: `A copy of your intake has been sent to ${answers.email || "your email"}.` },
                { icon: "🩺", title: "Clinical review: 24–48 hours", body: "A licensed clinician will review your intake. You'll be notified by email when your review is complete." },
                { icon: "💊", title: "If approved: care plan & prescription", body: "Your clinician will outline a personalized care plan. Payment is only collected at this stage." },
                { icon: "🚚", title: "Shipping: 3–5 business days", body: "After approval and payment, your medication ships from a licensed compounding pharmacy." },
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

    // -------------------------------------------------------------------------
    // Step 15 — Payment timing transparency
    // -------------------------------------------------------------------------
    {
      title: "About payment",
      tag: "Payment clarity",
      rationale: {
        headline: "Payment timing should be an explicit trust signal, not fine print",
        body: "Burying payment timing in terms of service is a trust anti-pattern. Making it a dedicated screen communicates respect for the user's financial autonomy and eliminates post-approval payment surprises — a top driver of chargebacks and negative reviews.",
        insight: "The hypothesis is that making 'you only pay after approval' an explicit, featured commitment — rather than burying it in terms of service — may improve conversion and reduce payment disputes. This is a testable claim, not an established benchmark.",
      },
      render: () => (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-teal-800 bg-teal-950/40 px-5 py-5">
            <p className="text-sm font-bold text-teal-200 mb-1">
              You will not be charged today.
            </p>
            <p className="text-sm text-teal-300/80">
              Payment is only collected after a licensed clinician has reviewed your intake and issued a care plan. If you're not approved, you owe nothing.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              When charges occur
            </p>
            {[
              { step: "Now", status: "free", label: "Intake submitted", detail: "No charge" },
              { step: "24–48h", status: "pending", label: "Clinical review", detail: "No charge" },
              { step: "After approval", status: "charge", label: "Care plan accepted", detail: "First charge occurs here" },
              { step: "Monthly", status: "recurring", label: "Ongoing subscription", detail: "Cancel anytime" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="flex flex-col items-center w-16 shrink-0">
                  <span className="text-xs text-zinc-600">{item.step}</span>
                  <span
                    className={[
                      "mt-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      item.status === "free" || item.status === "pending"
                        ? "bg-zinc-800 text-zinc-400"
                        : item.status === "charge"
                        ? "bg-amber-900/60 text-amber-300"
                        : "bg-zinc-800 text-zinc-400",
                    ].join(" ")}
                  >
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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  // Must be declared before any early return to satisfy the Rules of Hooks.
  const setAnswer = useCallback(
    (key: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  if (showLanding) {
    return <LandingIntro onStart={() => setShowLanding(false)} />;
  }

  if (showWaitlist) {
    return (
      <WaitlistFlow
        selectedState={answers.state as string}
        onChangeState={() => { setShowWaitlist(false); setStep(2); }}
      />
    );
  }

  const steps = buildSteps();
  const current = steps[step];
  const totalSteps = steps.length;

  const canContinue =
    !current.canContinue || current.canContinue(answers);

  const isLastStep = step === totalSteps - 1;
  const isReviewStep = step === 12; // index 12 = "Review intake" — submit happens here

  function handleContinue() {
    if (!isLastStep) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
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
              <span className="text-sm font-semibold text-zinc-300">
                Health Intake Prototype
              </span>
            </div>
            <div className="flex-1 max-w-xs">
              <ProgressBar current={step + 1} total={totalSteps} />
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
              <StepCard
                tag={current.tag}
                title={current.title}
              >
                {current.render(answers, setAnswer, () => setShowWaitlist(true))}
              </StepCard>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 0}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                {!isLastStep && (
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isReviewStep ? "Submit intake" : "Continue"}
                    {!isReviewStep && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                )}

                {isLastStep && (
                  <button
                    type="button"
                    onClick={() => { setStep(0); setAnswers({}); setShowWaitlist(false); setShowLanding(true); }}
                    className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-zinc-100"
                  >
                    Start over
                  </button>
                )}
              </div>
            </div>

            {/* Rationale panel — desktop only */}
            <div className="hidden lg:block w-72 xl:w-80 shrink-0">
              <div className="sticky top-24">
                <RationalePanel
                  headline={current.rationale.headline}
                  body={current.rationale.body}
                  insight={current.rationale.insight}
                />
              </div>
            </div>
          </div>

          {/* Rationale panel — mobile (below content) */}
          <div className="mt-8 lg:hidden">
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-300">
                <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Design rationale
              </summary>
              <div className="mt-3">
                <RationalePanel
                  headline={current.rationale.headline}
                  body={current.rationale.body}
                  insight={current.rationale.insight}
                />
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

# Woodwork Intake — Outside-In Prototype

An interactive, polished prototype of a redesigned ED (erectile dysfunction) health intake flow. Built as a product marketing (PMM) artifact to demonstrate how a regulated consumer health intake could improve trust, completion quality, safety screening, and post-submit confidence through intentional UX design.

> **Disclaimer:** Outside-in prototype. Not affiliated with Woodwork or Grindr. Not clinical, legal, or compliance advice.

---

## What this prototype demonstrates

### 1. ED-specific clinical screening
The prototype distinguishes between a generic health intake and an ED-specific clinical screening flow. It demonstrates symptom pattern questions, prior treatment history, cardiovascular safety screening, medication and recreational drug contraindications, and conditional branching — the kind of structure needed before ED medication can responsibly be prescribed.

### 2. Trust at every step
- Payment timing is surfaced explicitly: payment method collection and payment processing are treated as distinct events
- Granular, plain-language consent items replace a single "I agree" checkbox
- Clinical safety questions come before any payment or prescription step

### 3. Conditional follow-ups and hard-stop safety routing
Prior treatment follow-ups appear only when a prior treatment has been selected. Cardiovascular detail questions appear only when relevant risk factors are disclosed. If a user discloses a major contraindication (nitrate medication, recent heart attack, poppers use, etc.), the flow routes them to an ineligible screen rather than continuing intake. All branching and hard-stop routing is prototype logic — actual eligibility criteria require clinical, legal, compliance, and product validation.

### 4. Lifecycle clarity
The confirmation screen includes a unique intake ID, explicit review timeline (24–48h), and a clear "what happens next" sequence — eliminating post-submit anxiety.

### 5. Marketing-to-clinical trust bridge
The landing intro screen creates a smoother transition from consumer marketing to clinical intake. Before users answer any sensitive questions, it establishes privacy expectations, surfaces the clinician review model, makes clear that treatment requires approval, and provides explicit next-step clarity. This reduces the cognitive gap between "I saw an ad" and "I am now a patient completing a medical intake."

### 6. PMM rationale embedded
A side panel on every step explains the strategic reasoning behind each design choice. On mobile it collapses under a "Design rationale" disclosure. This makes the prototype self-annotating for stakeholder reviews.

---

## Strategic rationale

| Design choice | PMM reasoning |
|---|---|
| State gate at step 2 | Unavailability before heavy form investment → waitlist moment, not rage-quit. **Note:** state availability is illustrative sample logic. Actual availability would need to come from Woodwork's live eligibility rules, clinical operations, or legal/compliance source of truth. |
| ED symptom questions before treatment history | Establishes clinical context before asking about prior treatment — mirrors a real clinical encounter |
| Prior treatment follow-ups are conditional | Only users who have tried ED treatment see follow-up questions; reduces question fatigue for others |
| Poppers question included without stigma | Amyl nitrate creates the same dangerous interaction as pharmaceutical nitrates; failing to screen for it in an MSM-focused platform is a clinical gap |
| CV safety screen hard-stops | Routes users with major contraindications out of the intake — a trust signal, not just a safety gate |
| Payment transparency as final step | Removes the "hidden charge" perception; distinguishes payment method collection from payment processing |
| Pre-submit review screen | May reduce avoidable intake amendment support tickets by giving users a chance to review information before submission |
| 8–10 minute time estimate | More accurate for a comprehensive ED intake with conditional branching; sets honest expectations |

---

## Flow — 18 modules

1. Landing intro (pre-flow trust bridge)
2. Before you start
3. State availability / waitlist path
4. ED symptom pattern
5. Erection context: masturbation and morning erections
6. Prior ED treatment history
7. Prior treatment effectiveness and reactions *(conditional — shown only if prior treatment selected)*
8. Basic eligibility — DOB, sex assigned at birth, height, weight, attestations
9. Cardiovascular and sexual activity safety screen *(hard-stop triggers)*
10. Cardiovascular risk factors
11. Blood pressure / diabetes / cholesterol follow-ups *(conditional — shown only if relevant risk factors selected)*
12. Penile health screen
13. Medication contraindications *(hard-stop triggers)*
14. Recreational drug contraindications *(hard-stop triggers)*
15. Other medical history and HIV/AIDS screen
16. Required consent (granular, plain-language)
17. Review intake (pre-submission summary)
18. Submission confirmation (intake ID, status, timeline, next steps)
19. Payment timing transparency

---

## Components

| Component | Purpose |
|---|---|
| `IntakeFlow` | Client component orchestrating step state, answers, skip logic, hard-stop routing, and layout |
| `LandingIntro` | Pre-flow consumer trust screen with headline, trust bullets, CTA, and privacy note |
| `WaitlistFlow` | Demand capture screen for unavailable-state users |
| `ProgressBar` | Animated step N-of-M progress indicator reflecting only visible (non-skipped) steps |
| `StepCard` | Consistent step wrapper with tag chip and title |
| `OptionButton` | Single or multi-select answer button with check indicator |
| `RationalePanel` | Side panel showing PMM design rationale per step |

---

## How to run locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Requirements:** Node 18+, npm 9+.

---

## Tech stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4**
- **Geist** font (via `next/font/google`)

No external UI libraries. No backend. All state is local React state — this is a pure prototype.

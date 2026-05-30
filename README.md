# Woodwork Intake — Outside-In Prototype

An interactive, polished prototype of a redesigned consumer health intake flow for a sermorelin telehealth product. Built as a product marketing (PMM) artifact to demonstrate how trust, completion quality, and post-submit confidence can be improved through intentional UX design.

> **Disclaimer:** Outside-in prototype. Not affiliated with Woodwork or Grindr. Not clinical, legal, or compliance advice.

---

## What this prototype demonstrates

### 1. Completion quality over speed
Each step is designed to elicit higher-quality responses — structured biometric fields, multi-select goal pickers, and a free-text clinician note — rather than rushing users to the end.

### 2. Trust at every step
- Payment timing is surfaced early (consent) and given its own dedicated final screen
- Granular, plain-language consent items replace a single "I agree" checkbox
- The care model is explained before any clinical questions are asked

### 3. Lifecycle clarity
The confirmation screen includes a unique intake ID, explicit review timeline (24–48h), and a clear "what happens next" sequence — eliminating post-submit anxiety.

### 4. Inclusive identity capture
Legal name is collected for prescriptions; preferred name and gender identity are optional, clearly labeled fields — signaling inclusion without gatekeeping.

### 5. Marketing-to-clinical trust bridge
The landing intro screen creates a smoother transition from consumer marketing to clinical intake. Before users answer any sensitive questions, it establishes privacy expectations, surfaces the clinician review model, makes clear that treatment requires approval, and provides explicit next-step clarity. This reduces the cognitive gap between "I saw an ad" and "I am now a patient completing a medical intake."

### 6. PMM rationale embedded
A side panel on every step explains the strategic reasoning behind each design choice. On mobile it collapses under a "Design rationale" disclosure. This makes the prototype self-annotating for stakeholder reviews.

---

## Strategic rationale

| Design choice | PMM reasoning |
|---|---|
| Contact info at step 10, not step 1 | Users share more accurate contact details after clinical investment |
| State gate at step 3 | Unavailability before heavy form investment → waitlist moment, not rage-quit. **Note:** state availability is illustrative sample logic. Actual availability would need to come from Woodwork's live eligibility rules, clinical operations, or legal/compliance source of truth. |
| Separate "How care works" step | Async telehealth requires more upfront model explanation than synchronous care |
| Sermorelin named before eligibility questions | Informed consent foundation; reduces post-approval surprise |
| Goals multi-select | Signals personalization; may give clinicians richer context; designed to support adherence |
| Payment transparency as final step | Removes the "hidden charge" perception; highest-ROI trust signal |
| Pre-submit review screen | May reduce avoidable intake amendment support tickets by giving users a chance to review information before submission |

---

## Flow — 15 steps

1. Before you start
2. How care works
3. State availability
4. You are being evaluated for sermorelin
5. Main goals (multi-select)
6. Duration of concerns
7. Basic eligibility — DOB, sex assigned at birth, height, weight, eligibility attestations
8. Health history (structured multi-select)
9. Additional clinician note (free text)
10. Contact information
11. Legal name + optional preferred name and gender identity
12. Required consent (granular, plain-language)
13. Review intake (pre-submission summary)
14. Submission confirmation (intake ID, status, timeline, next steps)
15. Payment timing transparency

---

## Components

| Component | Purpose |
|---|---|
| `IntakeFlow` | Client component orchestrating step state, answers, and layout |
| `ProgressBar` | Animated step N-of-M progress indicator with percentage |
| `StepCard` | Consistent step wrapper with tag chip, title, and subtitle |
| `OptionButton` | Single or multi-select answer button with check indicator |
| `RationalePanel` | Side panel showing PMM design rationale per step |

All primitives are composable — `OptionButton` and `CheckRow` work for both single-select and multi-select patterns.

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

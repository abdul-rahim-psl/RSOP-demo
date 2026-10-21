# RSOP Visualizer: Detailed Plan

## Contents

- [1. Goal and audience](#1-goal-and-audience)
- [2. Sources and accuracy rules](#2-sources-and-accuracy-rules)
  - [2.1 Sources](#21-sources)
  - [2.2 Content rules](#22-content-rules)
- [3. Learning design](#3-learning-design)
  - [3.1 Learning goals](#31-learning-goals)
  - [3.2 The learner's path](#32-the-learners-path)
  - [3.3 Three layers per step](#33-three-layers-per-step)
- [4. Pages](#4-pages)
  - [4.1 Start here](#41-start-here)
  - [4.2 The basics](#42-the-basics)
  - [4.3 Bill inquiry](#43-bill-inquiry)
  - [4.4 Bill payment](#44-bill-payment)
  - [4.5 What if](#45-what-if)
  - [4.6 After the payment](#46-after-the-payment)
  - [4.7 Glossary](#47-glossary)
- [5. The flow player](#5-the-flow-player)
  - [5.1 Layout](#51-layout)
  - [5.2 Controls](#52-controls)
  - [5.3 Side panels](#53-side-panels)
  - [5.4 Alternatives and parallel notifications](#54-alternatives-and-parallel-notifications)
  - [5.5 Smaller screens](#55-smaller-screens)
  - [5.6 Without JavaScript](#56-without-javascript)
- [6. Flow data](#6-flow-data)
  - [6.1 Types](#61-types)
  - [6.2 Lanes](#62-lanes)
  - [6.3 Inquiry flow, step by step](#63-inquiry-flow-step-by-step)
  - [6.4 Payment flow, step by step](#64-payment-flow-step-by-step)
  - [6.5 RSOP's records](#65-rsops-records)
  - [6.6 Sample data](#66-sample-data)
- [7. Tech stack and project layout](#7-tech-stack-and-project-layout)
  - [7.1 Stack](#71-stack)
  - [7.2 Project layout](#72-project-layout)
  - [7.3 Implementation notes](#73-implementation-notes)
- [8. Visual design](#8-visual-design)
- [9. Accessibility and motion](#9-accessibility-and-motion)
- [10. Quality checks](#10-quality-checks)
- [11. Delivery plan](#11-delivery-plan)
- [12. Open questions](#12-open-questions)

The short version is in [executive-summary.md](executive-summary.md).

## 1. Goal and audience

- **Goal.** A frontend-only, interactive guide to the two flows of the RSOP demo, bill inquiry and bill payment, for someone with no background in Raast, instant payments or RTGS.
- **Audience.** New team members, business stakeholders and demo audiences. Assume they know what a bank app and a bill are, and nothing more.
- **Out of scope for now.** A backend, live messages, real Raast connectivity, sign-in and analytics.
- **Built to grow.** The player plays a plain list of steps. Today that list is static data; a later version could feed it a log from the running demo.

## 2. Sources and accuracy rules

### 2.1 Sources

| Source | Used for | Where |
|---|---|---|
| Open Connect RAAST Orchestration Demo (Paysys Labs, 20 Oct 2026), "the doc" | The two flows, their step numbers, RSOP's records and states, retries and duplicates, demo checks, open mappings | [Open_Connect_RAAST_Inquiry_and_Bill_Payment.docx](Open_Connect_RAAST_Inquiry_and_Bill_Payment.docx) |
| Raast learning notes (finished 2026-10-04) | Background: Raast, PRISM+, clearing vs settlement, the players, the glossary. Every fact there is sourced in its `sources.md` | [learning/IPS-RAAST-RTGS/deep-research/](../../learning/IPS-RAAST-RTGS/deep-research/) |
| CMA TS 082 002, P2P message flow (Apr 2021) | What Raast does inside a payment (validate, block funds, post, reject), the codes AUTH, NAUT, ACSP and RJCT, the timeout case | [learning/IPS-RAAST-RTGS/](../../learning/IPS-RAAST-RTGS/) |
| abdulrahimio | The stack, CSS tokens, theme toggle and motion style | [abdulrahimio/](../../abdulrahimio/) |

The CMA documents describe Raast as designed in 2020–21, so the live system may differ. The guide uses them only for "behind the scenes" notes, never for the demo's own steps.

### 2.2 Content rules

1. **The doc is the authority for the two flows.** The guide shows the doc's steps in the doc's order, with the doc's numbers. Anything added from elsewhere (Raast internals, settlement) appears as a behind-the-scenes note that names its source. The doc itself is not edited; disagreements go to its owner.
2. **Demo behaviour is labelled as demo behaviour.** Every flow page says: "This is the agreed design for a demo with a mock biller, not a published Raast service."
3. **Background facts come only from the learning notes.** Each keeps its source, and every figure carries its as-of date (for example "Jan–Mar 2026").
4. **Open mappings stay visibly open.** The doc lists these as still to confirm: the pacs.008 element for the inquiry ID, the correlation fields, the mock API schemas, the rejection reason mapping and the inquiry expiry policy. The guide shows business fields only ("Inquiry ID", "Amount"), marked "field to be confirmed" where relevant. It shows no ISO 20022 element paths and no reason codes until they are confirmed.
5. **Spelling.**
   - "Raast", as SBP writes it. The doc writes "RAAST".
   - Message names in ISO lower case: "pacs.008". The doc writes "PACS.008".
   - Status codes as Raast's design spec writes them (see [open question 1](#12-open-questions)).
6. **Fictional sample data only.** No real institution names, logos or branding. SBP, RPP, Raast, Paysys and Open Connect appear as plain-text names.

## 3. Learning design

### 3.1 Learning goals

| # | After about 15 minutes, a newcomer can explain… | Taught in |
|---|---|---|
| 1 | What Raast is, and how it differs from PRISM+, the State Bank's RTGS | The basics; After the payment |
| 2 | Who the five parties in the demo are, and what each one does | Start here; both flows |
| 3 | Why the inquiry comes first, and why RSOP stores the inquiry ID and amount | Bill inquiry (steps 5, 7, 10); Bill payment (step 4) |
| 4 | What pacs.008 and pacs.002 are, and what AUTH, NAUT, ACSP and RJCT mean | The basics; Bill payment |
| 5 | Why the bill is marked paid only after ACSP, and why a failed bill marking does not undo the payment | Bill payment (steps 16–21); What if |
| 6 | Why a repeated message must never pay a bill twice | Bill payment (step 19); What if |

These are also the acceptance test (see [section 10](#10-quality-checks)).

### 3.2 The learner's path

- **Chapters in order, each one standing alone.** Start here → The basics → Bill inquiry → Bill payment → What if → After the payment. The glossary is for reference at any time. Every chapter has its own URL and ends with a "Next" link. The header marks the current chapter.
- **About 15 minutes in total.** Each chapter shows its reading time (2–4 minutes).
- **One story throughout.** Sara pays a PKR 4,350.00 property-tax bill. The same data appears on every page, so learners recognise the numbers as they move.
- **One cast.** The same five actor icons and colours everywhere.
- **Light analogies, each used once.** The inquiry ID is "a ticket number for the question *how much do I owe?*". Raast is "a switchboard between banks". PRISM+ holds "the banks' own accounts at the State Bank".
- **Tap-to-explain terms.** Every technical term links to its glossary entry in a popup.

### 3.3 Three layers per step

Each step has three layers, from simplest to most detailed:

1. **Caption** (always visible): one or two plain sentences on who does what, and why.
2. **Panels**: the message being sent, RSOP's records and Sara's phone.
3. **Under the hood** (collapsed `<details>`): the message name and status code, the doc's own wording for the step, and behind-the-scenes notes with their sources.

There is no global beginner/expert switch. One page serves both: beginners read the captions, and experts open what they need.

## 4. Pages

| Route | Chapter | Phase |
|---|---|---|
| `/` | Start here | 1 |
| `/basics` | The basics | 1 |
| `/inquiry` | Bill inquiry | 1 |
| `/payment` | Bill payment | 1 |
| `/what-if` | What if | 2 |
| `/settlement` | After the payment | 2 |
| `/glossary` | Glossary | 1 |

### 4.1 Start here

- **Headline question:** "How does a government bill get paid in seconds?"
- **The story in four sentences.** Sara opens her bank app, picks the Demo Municipal Authority and types her bill reference. The app shows PKR 4,350.00. She taps Pay. Seconds later the app says paid, and the authority's records say paid too. Five parties made that happen.
- **The cast**: five actor cards (icon, name, one-line job). An accent token runs along them once, Customer → Bank → Raast → RSOP → Biller, in the same motion style as abdulrahimio's pipeline.

  | Actor | One-line job |
  |---|---|
  | Customer (Sara) | Wants to pay a government bill from her bank app |
  | Payment Bank | Sara's bank. Talks to Raast for her |
  | Raast | Pakistan's national instant payment system, run for the State Bank of Pakistan. Carries messages between the parties and gives the final word on a payment |
  | Open Connect (RSOP) | The orchestration platform between Raast and government billers. Routes inquiries, remembers them, and approves or refuses payments |
  | Government Biller (mock) | Stands in for a government institution's billing system. Looks up bills and marks them paid |

- **Two questions, two flows.** "How much do I owe?" leads to Bill inquiry; "Pay it" leads to Bill payment.
- **Chapter list** with reading times, plus two buttons: "Start with the basics" and "Skip to the flows".
- **Demo disclaimer** (content rule 2).

### 4.2 The basics

Six short sections, each about one screen long. Facts come from the learning notes; the file name (01–04) is given for each.

1. **Why banks need a hub.** Six banks linked directly need 15 links, but through a hub they need 6. A small animated mesh-to-star diagram shows this (a concept, no figures).
2. **Meet Raast.** The national instant payment system: 24x7, owned by SBP and run by its subsidiary RPP, live since January 2021. It carries person-to-person, merchant and bulk payments. Headline figure: 742M payments worth PKR 23.3T in Jan–Mar 2026 (00, 02).
3. **Meet the RTGS.** PRISM+ is the State Bank's system, where the banks' own accounts live. It settles big payments one at a time, with final effect, on business days. PRISM+ replaced PRISM on 16 June 2025 (00, 02).
4. **Two layers, two clocks.** An animation of the two layers. In Raast, payments clear one by one, in seconds, 24x7. At each cut-off, one net amount per bank settles in PRISM+. This section defines clearing vs settlement (00, 03).
5. **Messages are forms.** ISO 20022 messages are standard electronic forms. A pacs.008 is a payment instruction and a pacs.002 is a status reply. Four chips introduce the statuses the learner will meet: AUTH, NAUT, ACSP and RJCT (04).
6. **Where RSOP fits.** In an ordinary Raast payment, the payee's bank checks the payment and answers yes (AUTH) or no (NAUT). In this demo, RSOP takes that seat for government bills: it checks the payment against the earlier inquiry and answers. This comparison is inferred from the doc and CMA TS 082 002, where the payee's bank is "FI-2", and the page says so.

### 4.3 Bill inquiry

- **Intro.** Before paying, the bank asks how much is owed. The answer comes with a unique inquiry ID, which ties the later payment to this question.
- **The flow player** with the 11 steps in [section 6.3](#63-inquiry-flow-step-by-step).
- **Takeaways.** No money moves. RSOP remembers the ID and the amount. The bank keeps the ID for the payment.

### 4.4 Bill payment

- **Intro**, then the **outcome picker**: "What does Sara's bank send?"

  | Outcome | Inquiry ID | Amount | Path |
  |---|---|---|---|
  | Exact amount | INQ-8F2C41 | PKR 4,350.00 | Approved: steps 1–4, 11–21 |
  | Wrong amount | INQ-8F2C41 | PKR 4,000.00 | Refused: steps 1–10 |
  | Unknown inquiry ID | INQ-000000 | PKR 4,350.00 | Refused: steps 1–10 |

  Changing the outcome restarts the player at step 1.
- **The flow player** with the 21 steps in [section 6.4](#64-payment-flow-step-by-step).
- **Takeaways.** RSOP checks the payment before Raast finishes it. The bill is marked paid only after ACSP. The two notifications are independent.

### 4.5 What if

Phase 2. Each scenario is a short flow played in the same player.

| Scenario | What happens | Lesson | Source |
|---|---|---|---|
| The bank sends the same pacs.008 twice | RSOP does not reserve or apply the payment a second time. The exact reply to the repeat is still to confirm | Repeated messages are harmless | The doc: retries and duplicate messages |
| ACSP arrives twice | The payment is already DONE. The second ACSP changes nothing and creates no second bill-marking task | Same | The doc |
| Two payments race for one bill | The first reserves the inquiry. The second finds it no longer eligible and is refused (NAUT) | Reservation is atomic | The doc; the NAUT outcome is inferred from its eligibility check |
| Bill marking times out | The payment stays DONE. The notification stays pending and is retried with the same payment reference. The biller marks the bill paid only once | The payment result and the notification are tracked separately | The doc |
| ACSP never arrives | The payment stays AWAITING_ACSP. A new payment for this bill waits until the status is resolved. In Raast's design, a participant can ask for a payment's status (pacs.028) | Don't guess; resolve the status | The doc; learning notes 03 and 04 |
| RSOP answers too late | Raast times out, unblocks the funds and rejects the payment to both sides | RSOP must answer within Raast's timeout | CMA TS 082 002 §3.2.3. Shown as Raast's design, not demo behaviour |

### 4.6 After the payment

Phase 2.

- **What does ACSP mean?** "AcceptedSettlementInProcess" (CMA TS 082 002). Raast has accepted and posted the payment, but the banks' real money moves later.
- **Animation.** Raast positions move through the day as many payments clear, including Sara's: Demo Bank −4,350, the receiving side +4,350. At the cut-off, each bank has one net amount, and PRISM+ settles them all as one all-or-none batch from the banks' Raast reserves. The result is final, in central-bank money (learning notes 02, 03).
- **Prefunding and the cap.** A bank cannot send more than it has reserved at SBP, so the net settlement cannot fail.
- **Nights and weekends.** Raast clears 24x7, but PRISM+ settles on business days. That is why banks keep enough in reserve before weekends.
- **No cycle count.** Two cycles a day was true in May 2021; the current number under PRISM+ was not found. The page says "at each cut-off" and gives no count.
- **The receiving side stays unnamed** until [open question 5](#12-open-questions) is answered.

### 4.7 Glossary

- **Terms:** Raast, RTGS, PRISM+, SBP, RPP, RSOP, Open Connect, participant, clearing, settlement, net settlement, position, reserve and debit cap, cut-off, ISO 20022, pacs.008, pacs.002, AUTH, NAUT, ACSP, RJCT, inquiry ID, payment reference, bill marking, idempotent, mock.
- **Each entry:** a plain meaning in one or two sentences, plus its source.
- **The same entries power the popups** (see [section 7.3](#73-implementation-notes)).
- **Optional appendix:** "If you know Mojaloop", the mapping table from learning notes 04.

## 5. The flow player

### 5.1 Layout

```
┌───────────────────────────────────────────────────────────────────────┐
│ Bill payment                              Outcome: [ Exact amount ▾ ] │
├─────────────────────────────────────────────┬─────────────────────────┤
│  Sara   Demo Bank   Raast    RSOP   Biller  │ WHAT'S BEING SENT       │
│   │──1─────►│         │       │       │     │ pacs.008 · payment      │
│   │         │──2──●──►│       │       │     │ Inquiry ID  INQ-8F2C41  │
│   │         │         │─3────►│       │     │ Amount    PKR 4,350.00  │
│   ┆         ┆         ┆       ┆       ┆     ├─────────────────────────┤
│                                             │ WHAT RSOP REMEMBERS     │
├─────────────────────────────────────────────┤ INQ-8F2C41  OPEN        │
│ Step 2 of 15 · Demo Bank → Raast            │                         │
│ Sara's bank sends the payment to Raast.     ├─────────────────────────┤
│ It carries the inquiry ID.                  │ SARA'S PHONE            │
│ ▸ Under the hood                            │ Processing…             │
│ [◀ Back]  [▶ Play]  [Next ▶]                │                         │
└─────────────────────────────────────────────┴─────────────────────────┘
```

- **Diagram (left).** Five lane headers (icon and name) stay in view while the diagram scrolls. Below them run the lifelines, with one row per step.
  - Past steps are drawn solid. The current step is in the accent colour, with a token travelling along its arrow. Future steps are faint, so the whole map stays visible.
  - Requests are solid arrows and replies are dashed, as in the doc. An internal step is a note box on its lane.
  - The diagram scrolls to keep the current row in view.
- **Caption card (below the diagram).** It shows "Step 5 of 15", the arrow ("RSOP → Raast"), the caption, the "Under the hood" disclosure and the controls.
- **Panels (right).** See [section 5.3](#53-side-panels).

### 5.2 Controls

- **Next and Back.** When the player has focus, → and ← step through it, and Home and End jump to the first and last step.
- **Play and Pause** advance one step every 3.5 seconds. Playback stops at the end and pauses when the learner interacts. It is off when reduced motion is on.
- **Step dots** jump to any step, and **Restart** goes back to step 1.
- **Deep links.** `#step-11` uses the doc's step number, and `?outcome=wrong-amount` picks the outcome. Reloading the page restores both.

### 5.3 Side panels

1. **What's being sent.** The message name with its plain meaning, for example "pacs.008: a payment instruction". The fields appear as a two-column list with business names. A pacs.002 shows a status chip: AUTH and ACSP in green with a tick, NAUT and RJCT in red with a cross, always with the code and a word. An internal step shows "No message: this happens inside RSOP".
2. **What RSOP remembers.** Two small tables, inquiries and payment attempts (see [section 6.5](#65-rsops-records)). Cells that change on the current step are highlighted briefly.
3. **Sara's phone.** A phone frame showing her screen at this step: enter bill, fetching, bill shown, confirm, processing, paid or rejected. There is no bank branding.

All panel content is rendered at build time, one version per step; the script only shows the current one.

### 5.4 Alternatives and parallel notifications

- **Alternatives.** In the payment flow, steps 1–4 are shared. After that comes either Alternative 1 (steps 5–10, refused) or Alternative 2 (steps 11–21, approved), chosen by the outcome picker. The path not taken stays on screen as a collapsed, labelled band, for example "Alternative 1: validation failed. Not taken this time", so the learner sees that both exist.
- **Numbering.** Each step keeps the doc's number as a small badge ("doc 11"). The caption shows the learner's place on their own path: "Step 5 of 15" on the approved path (doc steps 1–4 and 11–21) and "Step 5 of 10" on the refused path (doc steps 1–10).
- **Parallel notifications.** Two pairs of steps can arrive in either order, as the doc states: 7–8 with 9–10, and 14–15 with 16–17.
  - The player wraps each pair in an "at the same time" band and plays them in the doc's order by default.
  - A "Swap arrival order" toggle replays them the other way round, to show that neither side waits for the other.
  - This is the same thing the doc's Mermaid source expresses with `par`.

### 5.5 Smaller screens

| Width | Layout |
|---|---|
| 1100px and wider | Diagram on the left, panels on the right |
| 720–1099px | Diagram at full width, panels below as tabs (Message, RSOP, Phone) |
| Below 720px | Five lanes don't fit, so the diagram becomes a vertical list of step cards. Each card shows two coloured actor chips, the arrow kind and the caption. The panels sit under the current card as tabs |

abdulrahimio's pipeline uses the same 720px breakpoint. Every page keeps 16px side gutters, with no horizontal scrolling at 360px.

```
┌────────────────────────────┐
│ Bill payment    Step 2/15  │
├────────────────────────────┤
│ ✓ 1  Sara → Demo Bank      │
│ ● 2  Demo Bank → Raast     │
│      pacs.008 · payment    │
│      Sara's bank sends the │
│      payment to Raast.     │
│      [Message][RSOP][Phone]│
│ ○ 3  Raast → RSOP          │
│ ○ 4  RSOP checks the bill  │
├────────────────────────────┤
│ [◀ Back] [▶ Play] [Next ▶] │
└────────────────────────────┘
```

### 5.6 Without JavaScript

The full diagram renders as static HTML with every step visible and numbered, followed by the captions as an ordered list. Both alternatives are shown. JavaScript then turns this into the player. The static version also serves printing and search engines.

## 6. Flow data

### 6.1 Types

The block structure mirrors the doc's Mermaid source (`alt`, `par`, `Note`), so turning a flow back into Mermaid for the parity check is a direct walk.

```ts
export type ActorId = 'customer' | 'bank' | 'raast' | 'rsop' | 'biller';
export type Status = 'AUTH' | 'NAUT' | 'ACSP' | 'RJCT';
export type Outcome = 'exact' | 'wrong-amount' | 'unknown-id';
export type Screen = 'enter-bill' | 'fetching' | 'bill-shown' | 'confirm' | 'processing' | 'paid' | 'rejected';

export interface Actor {
  id: ActorId;
  name: string;        // lane header, e.g. "Open Connect (RSOP)"
  job: string;         // one plain sentence for the cast cards
}

export interface Lane {
  actor: ActorId;
  alias: string;       // the doc's Mermaid alias: C, B, R, O, G
  docName: string;     // the doc's participant name, e.g. "RAAST API Gateway"
}

export interface Step {
  n: number;           // the doc's step number
  from: ActorId;
  to: ActorId;         // equal to `from` for an internal step
  kind: 'request' | 'reply' | 'internal';  // follows the doc's arrow: ->> solid, -->> dashed
  docLabel: string;    // the doc's Mermaid text, verbatim (used by the parity check)
  label: string;       // short text drawn on the arrow
  caption: string;     // plain language, at most 40 words
  message?: Message;
  records?: RecordChange[];
  screen?: Screen;     // Sara's phone from this step on
  hood?: Note[];       // "Under the hood" notes
}

export interface Message {
  name: string;        // "pacs.008", "Bill Inquiry API"
  meaning: string;     // "a payment instruction"
  status?: Status;
  reason?: string;     // plain-language refusal reason
  fields: { label: string; value: string; toConfirm?: boolean }[];
}

export interface RecordChange {
  table: 'inquiries' | 'payments';
  key: string;         // inquiry ID or payment reference
  set: Record<string, string>;
}

export interface Note {
  text: string;
  source: string;      // e.g. "CMA TS 082 002 §3.2.1" or "The doc"
}

export type Block =
  | { type: 'step'; step: Step }
  | { type: 'note'; over: [ActorId, ActorId]; text: string }
  | { type: 'alt'; branches: { title: string; taken: 'refused' | 'approved'; blocks: Block[] }[] }
  | { type: 'par'; lanes: { title: string; blocks: Block[] }[] };

export interface Flow {
  id: 'inquiry' | 'payment';
  title: string;
  lanes: Lane[];
  blocks: Block[];
}
```

- `inquiryFlow` is a constant. `paymentFlow(outcome)` returns the payment flow with that outcome's sample values and captions; the step structure is the same for every outcome.
- `path(flow, outcome, swapped)` flattens the blocks into the ordered steps the player walks.

### 6.2 Lanes

| Actor | Alias | Inquiry lane (doc) | Payment lane (doc) |
|---|---|---|---|
| `customer` | C | Customer (declared as `actor`) | Customer |
| `bank` | B | Payment Bank | Payment Bank |
| `raast` | R | RAAST API Gateway | RAAST |
| `rsop` | O | Open Connect (RSOP) | Open Connect (RSOP) |
| `biller` | G | Government Biller (Mock) | Government Biller (Mock) |

The guide's lane headers say "Raast API Gateway" and "Raast" (content rule 5). The doc's names are kept in `docName` for the parity check.

### 6.3 Inquiry flow, step by step

"Doc text" is the doc's Mermaid label, verbatim.

| # | Arrow | Doc text | Caption | Panels and notes |
|---|---|---|---|---|
| 1 | Customer → Bank | Select institution and enter bill reference | Sara picks who she owes, the Demo Municipal Authority, and types the reference printed on her property-tax bill. | Phone: enter bill |
| 2 | Bank → Raast | Bill Inquiry API (institution, bill reference) | Her bank asks Raast how much is owed on this bill. Banks reach Raast through its API gateway. | Message: Bill Inquiry request (institution, bill reference). Phone: fetching. Hood: the API gateway is Raast's single entry point for participants' systems (learning notes 02) |
| 3 | Raast → RSOP | Forward Bill Inquiry request | The gateway passes the question to RSOP, the platform that knows how to reach each government biller. | Message: same request |
| 4 | RSOP → Biller | Call mock Bill Inquiry web service | RSOP asks the municipal authority's billing system. In this demo, a mock stands in for it. | Message: Bill Inquiry web service call |
| 5 | Biller (internal) | Retrieve bill and generate unique inquiry identifier | The biller finds the bill and creates an inquiry ID: a unique ticket number for this question. | Hood: the ID's format is the mock biller's choice; the doc only requires it to be unique |
| 6 | Biller → RSOP (reply) | Bill details, amount, currency, unique inquiry identifier | The answer goes back to RSOP: what the bill is for, PKR 4,350.00, and the inquiry ID. | Message: bill details, amount, currency, inquiry ID |
| 7 | RSOP (internal) | Persist identifier and amount pair<br/>with institution, bill reference and status OPEN | Before passing the answer on, RSOP writes down the inquiry ID and the amount. Later it will approve only a payment that matches both. | Records: inquiry added, OPEN. Hood: amounts are compared exactly, in paisa, never as floating-point numbers (the doc) |
| 8 | RSOP → Raast (reply) | Bill details, amount, currency, unique inquiry identifier | RSOP sends the answer back to the gateway, with the inquiry ID unchanged. | Message: same response |
| 9 | Raast → Bank (reply) | Return Bill Inquiry response | The gateway hands the answer to Sara's bank. | Message: same response |
| 10 | Bank (internal) | Retain inquiry identifier for PACS.008 payment | The bank keeps the inquiry ID. It will put it inside the payment, so the payment can be matched to this bill. | |
| 11 | Bank → Customer (reply) | Display bill details and payable amount | Sara sees the bill and the amount. Nothing has been paid yet, and the bill is not marked paid. | Phone: bill shown |

### 6.4 Payment flow, step by step

Captions are for the "Exact amount" outcome; step 4 and step 5 change with the outcome (see the table after this one).

| # | Arrow | Doc text | Caption | Panels and notes |
|---|---|---|---|---|
| 1 | Customer → Bank | Confirm bill payment | Sara checks the amount and taps Pay. | Phone: confirm, then processing |
| 2 | Bank → Raast | PACS.008 (inquiry identifier, amount, payment reference) | Her bank sends a payment instruction, a pacs.008, to Raast. It carries the inquiry ID, the amount and a new payment reference. | Message: pacs.008. Inquiry ID (field to be confirmed), amount, payment reference |
| 3 | Raast → RSOP | Forward PACS.008 with same identifier and amount | Raast forwards the payment to RSOP, which answers for the government side. | Hood: before forwarding, Raast checks the message format, signature and the sender's rights, then blocks the amount against Demo Bank's position and limit (CMA TS 082 002 §3.2.1) |
| 4 | RSOP (internal) | Retrieve inquiry and validate identifier and amount pair<br/>Check inquiry is eligible for payment | RSOP looks up the inquiry ID, compares the amount exactly, and checks that the bill can still be paid. Everything matches. | Hood: Raast is waiting for this answer. In Raast's design, no answer in time means Raast rejects the payment itself (CMA TS 082 002 §3.2.3) |
| | **alt: RSOP validation failed** | | | |
| 5 | RSOP → Raast (reply) | PACS.002 / NAUTH (rejection reason) | RSOP says no: a status message, pacs.002, with the code NAUT and the reason. | Message: pacs.002, NAUT, plain reason. Hood: Raast's spec names this code NAUT; the doc writes NAUTH ([open question 1](#12-open-questions)) |
| 6 | Raast (internal) | Reject transaction | Raast cancels the payment and releases the money it had set aside. | Hood: Raast rejects the payment and unblocks the funds blocked at step 3 (CMA TS 082 002 §3.2.2) |
| | **par: Notify Payment Bank** | | | |
| 7 | Raast → Bank (reply) | PACS.002 / RJCT | Raast tells Sara's bank the payment was rejected. | Message: pacs.002, RJCT |
| 8 | Bank → Customer (reply) | Payment rejected | Sara sees that the payment did not go through. Her bill is still unpaid. | Phone: rejected |
| | **and: Notify RSOP** | | | |
| 9 | Raast → RSOP (reply) | PACS.002 / RJCT | Raast tells RSOP the same. This can arrive before or after step 7. | Message: pacs.002, RJCT |
| 10 | RSOP (internal) | Mark payment attempt REJECTED | RSOP records the failed attempt. It does not contact the biller: nothing was paid. | Records: payment attempt added, REJECTED |
| | **Note over RSOP and Biller** | Do not call Bill Marking web service | | Shown as a note box |
| | **else: RSOP validation successful** | | | |
| 11 | RSOP (internal) | Reserve inquiry for this payment<br/>Set status AWAITING_ACSP | RSOP ties the inquiry to this payment, so no other payment can use it, and waits for Raast's final word. | Records: inquiry reserved; payment attempt added, AWAITING_ACSP. Hood: the reservation is atomic (the doc) |
| 12 | RSOP → Raast (reply) | PACS.002 / AUTH | RSOP says yes: a pacs.002 with the code AUTH. | Message: pacs.002, AUTH |
| 13 | Raast (internal) | Accept and settle transaction | Raast accepts the payment and records it between the two sides. The banks' real money moves a little later, in PRISM+. | Hood: Raast posts the payment. Demo Bank's position goes down and the receiving side's goes up; the money settles at the next cycle in PRISM+ (learning notes 03) |
| | **par: Notify Payment Bank** | | | |
| 14 | Raast → Bank (reply) | PACS.002 / ACSP | Raast tells Sara's bank: accepted, settlement in process. | Message: pacs.002, ACSP. Hood: ACSP stands for AcceptedSettlementInProcess (CMA TS 082 002) |
| 15 | Bank → Customer (reply) | Payment successful | Sara sees "Payment successful". | Phone: paid |
| | **and: Notify RSOP** | | | |
| 16 | Raast → RSOP (reply) | PACS.002 / ACSP | Raast tells RSOP the same. This can arrive before or after step 14: neither side waits for the other. | Message: pacs.002, ACSP |
| 17 | RSOP (internal) | Correlate payment and mark payment DONE<br/>Persist bill-marking task | RSOP matches the ACSP to the payment by its reference, marks the payment DONE, and saves a to-do: tell the biller. | Records: DONE, bill notification pending. Hood: the task is saved before the call, so a crash or timeout cannot lose it (the doc) |
| 18 | RSOP → Biller | Call mock Bill Marking web service<br/>(inquiry identifier, amount, payment reference) | RSOP tells the biller the bill is paid, quoting the inquiry ID, the amount and the payment reference. | Message: Bill Marking call. Hood: if this call times out, the payment stays DONE and the notification is retried with the same payment reference (the doc) |
| 19 | Biller (internal) | Mark bill paid idempotently | The biller marks the bill paid. If the same request comes again, the bill is still paid only once. | |
| 20 | Biller → RSOP (reply) | Bill marking confirmation | The biller confirms. | Message: confirmation |
| 21 | RSOP (internal) | Mark bill notification COMPLETE | RSOP ticks off the to-do. The payment and the bill notification are both complete. | Records: bill notification COMPLETE |

Outcome-specific captions:

| Outcome | Step 4 | Step 5 reason |
|---|---|---|
| Exact amount | As above | (not reached) |
| Wrong amount | RSOP finds the inquiry, but the payment says PKR 4,000.00 and the bill says PKR 4,350.00. The amounts do not match. | "Amount does not match" |
| Unknown inquiry ID | RSOP has no inquiry with this ID, so it cannot tell which bill the payment is for. | "Unknown inquiry" |

### 6.5 RSOP's records

The panel shows two tables.

- **Inquiries:** Inquiry ID, Institution, Bill reference, Amount, Currency, Status, Reserved for.
- **Payment attempts:** Payment reference, Inquiry ID, Amount, Status, Bill notification.

| After | Inquiries | Payment attempts |
|---|---|---|
| Inquiry step 7 | INQ-8F2C41 added, OPEN | |
| Payment step 10 (refused) | Unchanged | PAY-20261021-000187 added, REJECTED |
| Payment step 11 | INQ-8F2C41 reserved for PAY-20261021-000187 | PAY-20261021-000187 added, AWAITING_ACSP |
| Payment step 17 | | DONE; bill notification pending |
| Payment step 21 | | Bill notification COMPLETE |

- The state names are the doc's: OPEN, AWAITING_ACSP, DONE, REJECTED and COMPLETE. "Pending" for the notification is also the doc's word.
- The doc names no inquiry status after payment, so the panel shows only the reservation.
- The doc records a refused attempt when RJCT arrives (step 10), not when RSOP sends NAUT (step 5).
- Amounts are stored in paisa and displayed as PKR with two decimals.

### 6.6 Sample data

All values are fictional.

| Item | Value |
|---|---|
| Customer | Sara |
| Payment bank | Demo Bank |
| Institution | Demo Municipal Authority (mock), property tax |
| Bill reference | PT-2026-004512 |
| Amount | PKR 4,350.00 (stored as 435000 paisa) |
| Inquiry ID | INQ-8F2C41 (illustrative; the real format is the mock biller's choice) |
| Payment reference | PAY-20261021-000187 |
| Wrong-amount outcome | PKR 4,000.00 |
| Unknown-ID outcome | INQ-000000 |

## 7. Tech stack and project layout

### 7.1 Stack

| Concern | Choice | Same as abdulrahimio |
|---|---|---|
| Framework | Astro 7.3 (`astro@^7.3.5`), static output | Yes |
| Language | TypeScript, extending `astro/tsconfigs/strict` | Yes |
| Styling | Hand-written CSS: tokens in `src/styles/global.css`, plus a scoped `<style>` per component | Yes |
| Interactivity | Vanilla TypeScript in Astro `<script>` tags, bundled by Astro; no UI framework | Yes |
| Theme | Light and dark tokens. The toggle follows the system until the visitor picks a theme; the pick is saved in localStorage and applied before first paint | Copied |
| Fonts | System sans for body text, self-hosted Instrument Serif italic for display, `ui-monospace` for message names | Yes, plus mono |
| Runtime dependencies | `astro` only. abdulrahimio's `fast-xml-parser` is for its feeds and is not needed | Yes |
| Node | 22.12 or newer (22.21.1 is installed) | Yes |
| Hosting | `npm run dev` locally; later `vercel --prod`, as with abdulrahimio | Yes |
| Checks | `npm run build` and `npm run check:flows` (Node's built-in test runner, no extra dependencies) | New |

Not used: React, Vue, Svelte, Tailwind, Mermaid (the guide draws its own diagram from the data), animation libraries and analytics.

### 7.2 Project layout

```
RSOP demo/
├── docs/                          # this plan and the doc (already here)
├── public/
│   ├── favicon.svg
│   └── fonts/instrument-serif-italic.woff2
├── src/
│   ├── layouts/Base.astro         # head, pre-paint theme script, header, footer
│   ├── components/
│   │   ├── Header.astro           # chapter nav and ThemeToggle
│   │   ├── ThemeToggle.astro      # copied from abdulrahimio
│   │   ├── Footer.astro           # demo disclaimer, link to sources
│   │   ├── Cast.astro             # five actor cards and the run-once token
│   │   ├── ActorIcon.astro        # inline SVG per actor
│   │   ├── FlowPlayer.astro       # diagram, caption, controls and panels
│   │   ├── MessagePanel.astro
│   │   ├── RecordsPanel.astro
│   │   ├── PhonePanel.astro
│   │   ├── StatusChip.astro       # AUTH, NAUT, ACSP, RJCT with icon and text
│   │   ├── Term.astro             # tap-to-explain glossary term
│   │   └── TwoLayers.astro        # Raast and PRISM+ animation
│   ├── data/
│   │   ├── actors.ts
│   │   ├── sample.ts              # Sara's bill, IDs, outcomes
│   │   ├── flows/inquiry.ts
│   │   ├── flows/payment.ts       # paymentFlow(outcome)
│   │   ├── flows/what-if.ts       # Phase 2
│   │   ├── glossary.ts
│   │   └── sources.ts
│   ├── lib/
│   │   ├── flow.ts                # types, path(), validate()
│   │   ├── mermaid.ts             # Flow → Mermaid text
│   │   └── player.ts              # client-side stepping
│   ├── pages/
│   │   ├── index.astro
│   │   ├── basics.astro
│   │   ├── inquiry.astro
│   │   ├── payment.astro
│   │   ├── what-if.astro
│   │   ├── settlement.astro
│   │   └── glossary.astro
│   └── styles/global.css          # abdulrahimio tokens, plus status and actor tokens
├── tests/
│   ├── flows.test.ts              # invariants and Mermaid parity
│   └── fixtures/                  # the doc's two Mermaid sources, as .mmd files
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

### 7.3 Implementation notes

- **One script for all players.** Astro bundles a component's `<script>` once per page, so the player script starts every `[data-player]` element it finds. This lets the three payment outcomes share one page.
- **No client-side templating.** All step content is rendered at build time. The script only sets `data-state` (past, current, next) and `hidden`.
- **The token** is a CSS-animated element on the current arrow. The arrow's width is passed to its keyframes through a custom property.
- **Tests run without a build step.**
  - `src/data` and `src/lib` use only TypeScript syntax that Node can strip: no `enum`, no `namespace`.
  - Imports carry explicit `.ts` extensions, which Astro's base tsconfig allows (`allowImportingTsExtensions`).
  - Checked 2026-10-21: Node 22.21.1 runs a `.ts` file with no flags.
  - The script is `node --test tests/flows.test.ts`.
- **Mermaid fixtures.** The fixtures are copied once from the doc: unzip the .docx and read `word/document.xml`, since pandoc is not installed. Copy them again whenever the doc changes.
- **Glossary popovers** use the HTML `popover` attribute and appear as a card at the bottom of the viewport. This avoids CSS anchor positioning, which browsers support unevenly.
- **The theme** script and toggle are copied from abdulrahimio unchanged.

## 8. Visual design

- **Base.** abdulrahimio's tokens and type: a warm off-white or near-black background, Instrument Serif italic headings and a system sans body, so the guide reads as the same hand.
- **Accent.** abdulrahimio's accent marks "where you are now": the current step, the travelling token and the active lane header.
- **New tokens.**
  - Status colours: `--ok` (AUTH, ACSP), `--fail` (NAUT, RJCT) and `--wait` (pending, AWAITING_ACSP), each with a soft background. Each colour is always paired with an SVG icon and the code as text.
  - Five muted actor tints for lane headers and chips, with light and dark values checked for contrast (see [section 9](#9-accessibility-and-motion)).
- **Arrows.** Requests are solid and replies dashed, as in the doc. Internal steps are note boxes on their lane.
- **Motion.** One travelling token per step (about 600 ms, ease-in-out). The acting lane header lights up, and changed record cells flash softly. This is abdulrahimio's "the accent travels and lights things up" language.
- **Icons.** Inline stroke SVGs, one per actor: a person, a bank, a hub (Raast), a router (RSOP) and a government building (the biller).
- **Phone frame.** A plain rounded rectangle; the screens are ordinary HTML.

## 9. Accessibility and motion

- **Keyboard.** Every control is a button. ← and → step through the player when it has focus, and focus rings are visible.
- **Screen readers.**
  - The caption region is `aria-live="polite"` and announces, for example, "Step 5 of 15: RSOP to Raast. RSOP says yes…".
  - The diagram's text equivalent is the ordered list from [section 5.6](#56-without-javascript).
  - Status chips are read as words, for example "Status: approved, AUTH".
- **Reduced motion.** With `prefers-reduced-motion`, there is no travelling token and no flashing; the current step is simply highlighted, and autoplay is off.
- **Colour is never the only signal.** Statuses carry an icon, the code and a word. Arrows differ by line style, not only by colour.
- **Contrast.** Text meets 4.5:1 and graphics 3:1, in both themes.
- **Zoom and width.** The pages stay usable at 200% zoom and at 360px wide.

## 10. Quality checks

| Check | How | When |
|---|---|---|
| Builds cleanly | `npm run build` (strict TypeScript) | Every change |
| Flow invariants | `npm run check:flows`: steps numbered 1–11 and 1–21 with no gaps; every step's actors are lanes in its flow; every step has a caption of at most 40 words; every pacs.002 has a status | Every change |
| Parity with the doc | Turn each flow into Mermaid and compare it with the doc's Mermaid source, ignoring whitespace | Every change; refresh the fixtures when the doc changes |
| Looks right | Screenshots at 360, 768 and 1280px in light and dark, of every page and several player steps | Each checkpoint |
| Accessibility | A keyboard-only walk through both flows, a pass with reduced motion on, and a Lighthouse accessibility score of 95 or more | End of Phases 1 and 2 |
| Facts | Every background claim on the basics and settlement pages has an entry in `sources.ts` pointing at the learning notes | End of Phases 1 and 2 |
| Teaches | Two or three people new to Raast use the guide, then answer the six goal questions in [section 3.1](#31-learning-goals) without help | End of Phase 2 |

## 11. Delivery plan

Each step ends with something to check in the browser before the next one starts.

1. **Scaffold.** Create the Astro project in `RSOP demo/`. Copy the base layout, tokens and ThemeToggle from abdulrahimio, and add empty chapter pages with navigation. *Check:* `npm run dev` runs, and the toggle works in both themes.
2. **Flow data.** Actors, sample data and the inquiry flow, plus the check script with the Mermaid parity test. *Check:* `npm run check:flows` passes.
3. **Static diagram.** FlowPlayer renders the inquiry flow without JavaScript. *Check:* it matches the doc's inquiry diagram step for step.
4. **Player.** Stepping, the token, the caption, the three panels, deep links and keyboard control. **Review checkpoint with you**: this is the core experience, and everything else builds on it.
5. **Payment flow.** `paymentFlow(outcome)`, the outcome picker, the alternative bands and the parallel bands with the swap. *Check:* all three outcomes walk end to end and match the doc's payment diagram.
6. **Start here, The basics and the glossary**, with Cast, TwoLayers and the Term popups, plus the phone layout everywhere. **Phase 1 review.**
7. **Phase 2.** What if, After the payment, the accessibility pass and the newcomer test. **Phase 2 review.**
8. **Optional.** A Vercel preview (production only on your go-ahead), "copy as Mermaid", a short quiz per chapter, and an overlay comparing the flow with an ordinary Raast payment.

The working loop is the same as for abdulrahimio: I build and share screenshots, you check a local preview, we iterate, and you commit.

## 12. Open questions

| # | Question | Why it matters | Default until answered |
|---|---|---|---|
| 1 | **NAUT or NAUTH?** The doc writes `NAUTH`. CMA TS 082 002 (Raast's P2P message flow, Apr 2021) writes `pacs.002 - NAUT`. ISO 20022 transaction status codes are 1–4 characters (from the ISO schema, not re-checked for this plan) | The guide teaches the code newcomers will meet in real messages | Show `NAUT`; keep the doc's text verbatim under "Under the hood"; ask the doc's owner to align |
| 2 | Which pacs.008 element carries the inquiry ID? (open in the doc) | Experts would expect to see the element path | Show "Inquiry ID" as a business field marked "field to be confirmed" |
| 3 | Which rejection reason codes apply? (open in the doc) | The NAUT panel shows a reason | Plain-language reasons only: "Unknown inquiry", "Amount does not match", "Inquiry not eligible" |
| 4 | What is the inquiry expiry policy? (open in the doc) | It would be a natural What-if scenario | Leave it out until confirmed |
| 5 | Which Raast participant receives the money for a government bill? | The settlement chapter shows positions moving between participants | Say "the government's receiving side" without naming a participant |
| 6 | Should `RSOP demo/` be the project root? | Setup | Yes, with `docs/` staying where it is |
| 7 | Neutral look, or Paysys Labs / Open Connect branding? | Look and footer | Neutral, with names in plain text only |
| 8 | What is the user-facing title? | Header and browser tab | "Paying a government bill on Raast" (working title) |
| 9 | Its own git repository? Hosted where? | Sharing | Its own repository; local only until Phase 1 is approved |

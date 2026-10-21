# RSOP Visualizer: Executive Summary

## Contents

- [In one minute](#in-one-minute)
- [At a glance](#at-a-glance)
- [What a newcomer will learn](#what-a-newcomer-will-learn)
- [What they will see](#what-they-will-see)
- [How it is built](#how-it-is-built)
- [Delivery phases](#delivery-phases)
- [Decisions needed](#decisions-needed)
- [Risks](#risks)

The full plan is in [details.md](details.md).

## In one minute

- **What.** An interactive, frontend-only guide to how a government bill is looked up and paid over Raast, Pakistan's instant payment system, with Open Connect acting as RSOP in the middle.
- **For whom.** Someone who has never heard of Raast, instant payments or an RTGS. After about 15 minutes they should be able to explain both flows.
- **The core.** A *flow player* that plays the two sequence diagrams from the Open Connect doc one step at a time. A token travels between the parties, and a plain-language caption explains each step. Side panels show the message, what RSOP remembers, and what the customer sees on their phone.
- **Around it.** Short chapters on the basics (Raast, the RTGS, clearing vs settlement), what can go wrong, and what happens to the money after the payment.
- **How.** The same stack as abdulrahimio: Astro 7, TypeScript and hand-written CSS, built as a static site with no backend.

## At a glance

| | |
|---|---|
| **Source of truth** | The flows in [Open_Connect_RAAST_Inquiry_and_Bill_Payment.docx](Open_Connect_RAAST_Inquiry_and_Bill_Payment.docx); background from the [Raast learning notes](../../learning/IPS-RAAST-RTGS/deep-research/00-big-picture.md) |
| **Stack** | Astro 7.3 static site, strict TypeScript, hand-written CSS, vanilla TypeScript for the interactive parts |
| **Backend** | None. The flows are scripted data played in the browser |
| **Location** | `RSOP demo/` becomes the project root; `docs/` stays where it is |
| **Phase 1** | Start page, the basics, bill inquiry, bill payment (three outcomes), glossary |
| **Phase 2** | What-if scenarios, settlement chapter, accessibility pass, test with newcomers |

## What a newcomer will learn

After about 15 minutes, a newcomer can explain:

1. What Raast is, and how it differs from PRISM+, the State Bank's RTGS.
2. Who the five parties in the demo are, and what each one does.
3. Why the inquiry comes first, and why RSOP stores the inquiry ID and amount.
4. What pacs.008 and pacs.002 are, and what AUTH, NAUT, ACSP and RJCT mean.
5. Why the bill is marked paid only after ACSP, and why a failed bill marking does not undo the payment.
6. Why a repeated message must never pay a bill twice.

These six questions are also the acceptance test. Two or three people new to Raast use the guide, then answer them without help.

## What they will see

| Chapter | What it does | Phase |
|---|---|---|
| Start here | The story in one minute: Sara pays a property-tax bill from her bank app. Meet the five parties | 1 |
| The basics | Raast and the RTGS, clearing vs settlement, why banks need a hub; one animated two-layer picture | 1 |
| Bill inquiry | The doc's 11-step inquiry flow, played step by step | 1 |
| Bill payment | The doc's 21-step payment flow. The learner picks the outcome: exact amount, wrong amount or unknown inquiry ID | 1 |
| What if | Repeated messages, two payments racing for one bill, bill marking timing out | 2 |
| After the payment | What "ACSP: accepted, settlement in process" means, and how the banks settle later in PRISM+ | 2 |
| Glossary | Every term, also a tap-to-explain popup wherever the term appears | 1 |

Step numbers match the doc's diagrams, so the guide and the doc can be read side by side.

The flow player on a desktop (phones get a vertical list of step cards instead):

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

## How it is built

- Astro 7.3, strict TypeScript and hand-written CSS, with the light/dark tokens and theme toggle carried over from abdulrahimio.
- The two flows are typed data files transcribed from the doc. One Astro component draws any flow as a sequence diagram, and a small vanilla TypeScript script steps through it. There is no React, Tailwind or Mermaid; Astro is the only dependency.
- Without JavaScript the page shows the full numbered diagram; with JavaScript it becomes the player.
- On every build, a check compares the flow data with the doc's Mermaid source, so the guide cannot quietly drift from the agreed flow.
- The player takes a plain list of steps, so a later version could play real messages from the running demo.

## Delivery phases

| Phase | Scope | Done when |
|---|---|---|
| 0 · Scaffold | Project, layout, tokens, theme toggle | The empty site runs locally in both themes |
| 1 · Core | The flow player on the inquiry flow first (review with you), then the payment flow, start page, basics and glossary | You can walk both flows on desktop and phone, step for step against the doc |
| 2 · Depth | What-if scenarios, settlement chapter, accessibility pass, newcomer test | Two or three newcomers answer the six questions |
| 3 · Optional | Vercel preview, short quizzes, an overlay comparing with an ordinary Raast payment | As you decide |

Each phase follows the abdulrahimio loop: I build and share screenshots, you check a local preview, and we iterate.

## Decisions needed

| # | Decision | Recommendation |
|---|---|---|
| 1 | The doc writes the refusal status as `NAUTH`. Raast's design spec (CMA TS 082 002) writes `NAUT`, and ISO 20022 status codes are at most four characters | Show `NAUT`, keep the doc's wording under "Under the hood", and ask the doc's owner to align it |
| 2 | Project location | `RSOP demo/` as the project root, like abdulrahimio with its `docs/` folder |
| 3 | Branding | Neutral: system names as plain text, no SBP, Raast, Paysys or Open Connect logos, and a footer saying it is a learning demo with a mock biller |
| 4 | The doc does not say which Raast participant receives the money for a government bill. The settlement chapter needs this | Until answered, say "the government's receiving side" |
| 5 | Hosting | Local only until Phase 1 is approved, then a Vercel preview |

## Risks

- **Teaching something wrong.** Newcomers cannot spot mistakes, so background facts come only from the sourced learning notes, with their dates. Demo-only behaviour is labelled as the demo design. The doc's open mappings (the pacs.008 field for the inquiry ID, reason codes, expiry) are shown as "to be confirmed", not guessed.
- **Demo vs live Raast.** The doc describes the agreed design for a demo with a mock biller, not a published Raast service. Every flow page says so.
- **The doc changes.** The parity check fails the build until the flow data is updated.
- **The folder name has a space.** If a tool breaks on `RSOP demo`, rename the folder to `rsop-demo`.

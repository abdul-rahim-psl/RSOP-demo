# Bill pay, explained

## Contents

- [Overview](#overview)
- [Run locally](#run-locally)
- [Checks](#checks)
- [Where things live](#where-things-live)
- [How the player works](#how-the-player-works)
- [Design](#design)
- [Decisions applied](#decisions-applied)
- [When the demo doc changes](#when-the-demo-doc-changes)

## Overview

An interactive, frontend-only guide to the Open Connect RSOP demo: how a government bill is looked up and paid over Raast, Pakistan's instant payment system. It is written for people with no background in Raast, instant payments or RTGS. The plan behind it is in [docs/executive-summary.md](docs/executive-summary.md) and [docs/details.md](docs/details.md).

| Route | Chapter |
|---|---|
| `/` | Start here: the five parties as an explorable map |
| `/basics` | 01 The basics: hub, Raast, the RTGS, clearing vs settlement, messages, where RSOP fits |
| `/inquiry` | 02 Bill inquiry: the doc's 11 steps in the player |
| `/payment` | 03 Bill payment: the doc's 21 steps, with three outcomes |
| `/what-if` | 04 What if: six situations (repeats, a race, timeouts) |
| `/settlement` | 05 After the payment: ACSP, netting, the cap, weekends |
| `/glossary` | Every term, a Mojaloop map and the sources |

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve the built site
```

## Checks

```sh
npm run check
```

This runs two things:

- `astro check`: strict TypeScript across every page, component and data file.
- `npm run check:flows`: Node's built-in test runner on `tests/flows.test.ts`. It checks that every flow is consistent (numbering, lanes, captions, statuses), that the inquiry and all three payment outcomes match the demo doc's Mermaid source line for line, and that each outcome walks the alternative it promises.

## Where things live

| What | File |
|---|---|
| The two flows, transcribed from the doc | `src/data/flows/inquiry.ts`, `src/data/flows/payment.ts` |
| The six what-if situations | `src/data/flows/what-if.ts` |
| Parties, sample values, chapters, glossary, sources | `src/data/` |
| Flow types and the walk/parallel logic | `src/lib/flow.ts` |
| Flow → Mermaid, for the parity test | `src/lib/mermaid.ts` |
| `[[term]]` markup → glossary buttons | `src/lib/rich.ts` |
| The player (diagram, card, phone, controls) | `src/components/flow/`, `src/scripts/player.ts`, `src/styles/flow.css` |
| Colour, type and glass tokens | `src/styles/global.css` |
| The doc's Mermaid sources | `tests/fixtures/` |

## How the player works

- Every step is rendered at build time, so the page works without JavaScript as a numbered, captioned diagram.
- The script only switches states. Rows are past, current or still to come; the card shows the current step; RSOP's records and Sara's phone are replayed along the path walked so far.
- Each payment outcome is its own pre-rendered variant. `?outcome=wrong-amount#step-5` links to a variant and step, and `?scenario=race` does the same on the what-if page.
- **Swap order** reverses the two parallel notifications, as the doc's `par` blocks allow.
- Keyboard: → and ← step through, and Home and End jump to the overview and the last step.

## Design

- Inspired by Marble's curriculum map: a near-black canvas with a soft glow, glass panels, EB Garamond headlines ending on a red full stop, and coloured dots for identity.
- Dark is the default. The toggle switches to a cream light theme, and the choice is remembered.
- The five actor colours and the PRISM+ colour were checked with a colour-vision validator in both themes. Statuses always carry an icon and a word as well as a colour.
- Fonts are EB Garamond and Nunito (both SIL Open Font License), self-hosted in `public/fonts/`.
- Below 1000px the step card becomes a bottom sheet, and below 720px the lanes become a list of step cards. At 1280px and above, Sara's phone sits beside the diagram.

## Decisions applied

These are the defaults from the plan's open questions; change them here if the answers differ.

| Question | Applied |
|---|---|
| NAUT or NAUTH | The guide shows `NAUT`, as in Raast's design spec (CMA TS 082 002). The doc's `NAUTH` appears under "Under the hood" |
| Project location | `RSOP demo/` is the project root; `docs/` stays where it was |
| Branding | Neutral: names in plain text, no logos, with a learning-demo disclaimer in the footer |
| Who receives the money | "The government's receiving side", unnamed |
| Hosting | Local only |
| Open mappings in the doc | Shown as "field to be confirmed"; no ISO 20022 element paths or reason codes are shown |

## When the demo doc changes

1. Re-extract the Mermaid sources: `python3 -I tools/extract-mermaid.py`
2. Run `npm run check`. A failing parity test shows exactly which line changed.
3. Update `src/data/flows/` until the check passes.

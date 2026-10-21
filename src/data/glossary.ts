import type { SourceId } from './sources.ts';

export type GlossaryGroup = 'Systems and organisations' | 'Money and settlement' | 'Messages and statuses' | 'This demo';

export interface Term {
  id: string;
  term: string;
  group: GlossaryGroup;
  meaning: string;
  source: SourceId;
}

export const glossaryGroups: GlossaryGroup[] = [
  'Systems and organisations',
  'Money and settlement',
  'Messages and statuses',
  'This demo',
];

export const glossary: Term[] = [
  {
    id: 'raast',
    term: 'Raast',
    group: 'Systems and organisations',
    meaning:
      'Pakistan’s national instant payment system. It moves payments between banks and wallets in seconds, 24x7. The name means “direct way”.',
    source: 'notes',
  },
  {
    id: 'sbp',
    term: 'SBP',
    group: 'Systems and organisations',
    meaning: 'The State Bank of Pakistan: the central bank and payments regulator. It owns Raast and runs PRISM+.',
    source: 'notes',
  },
  {
    id: 'rpp',
    term: 'RPP',
    group: 'Systems and organisations',
    meaning: 'Raast Payments Pakistan, the State Bank’s subsidiary that has run Raast day to day since 2025.',
    source: 'notes',
  },
  {
    id: 'rtgs',
    term: 'RTGS',
    group: 'Systems and organisations',
    meaning:
      'Real-time gross settlement: a system that settles each payment on its own, as soon as it is funded, with final effect. Pakistan’s is PRISM+.',
    source: 'notes',
  },
  {
    id: 'prism-plus',
    term: 'PRISM+',
    group: 'Systems and organisations',
    meaning:
      'The State Bank’s RTGS, where banks hold their own accounts. It replaced PRISM on 16 June 2025. It settles large payments one by one, and the net totals of systems like Raast, on business days.',
    source: 'notes',
  },
  {
    id: 'participant',
    term: 'Participant',
    group: 'Systems and organisations',
    meaning: 'A bank, microfinance bank or wallet company connected to Raast. Demo Bank is one.',
    source: 'notes',
  },
  {
    id: 'api-gateway',
    term: 'API gateway',
    group: 'Systems and organisations',
    meaning: 'Raast’s front door: the single entry point that participants’ systems use to reach Raast.',
    source: 'cma-020',
  },
  {
    id: 'rsop',
    term: 'RSOP',
    group: 'Systems and organisations',
    meaning:
      'RAAST Service Orchestration Platform. It sits between Raast and government billers: it routes bill inquiries, remembers them, and approves or refuses the payments that follow.',
    source: 'doc',
  },
  {
    id: 'open-connect',
    term: 'Open Connect',
    group: 'Systems and organisations',
    meaning: 'The platform that plays RSOP in this demo.',
    source: 'doc',
  },
  {
    id: 'clearing',
    term: 'Clearing',
    group: 'Money and settlement',
    meaning: 'Passing payment instructions between the parties and working out who owes whom. Raast clears each payment in seconds.',
    source: 'notes',
  },
  {
    id: 'settlement',
    term: 'Settlement',
    group: 'Money and settlement',
    meaning: 'Moving the real money, so the debt between the banks is gone. For Raast payments this happens later, in PRISM+.',
    source: 'notes',
  },
  {
    id: 'net-settlement',
    term: 'Net settlement',
    group: 'Money and settlement',
    meaning: 'Adding up a bank’s payments in and out, and settling only the difference, as one amount, at a set time.',
    source: 'notes',
  },
  {
    id: 'position',
    term: 'Position',
    group: 'Money and settlement',
    meaning:
      'A participant’s running total in Raast since the last settlement. It goes up when money comes in and down when money goes out.',
    source: 'notes',
  },
  {
    id: 'reserve',
    term: 'Reserve and cap',
    group: 'Money and settlement',
    meaning:
      'Money a bank sets aside at the State Bank to back its Raast payments. Raast never lets the bank send more than this cap, so settlement cannot fail.',
    source: 'notes',
  },
  {
    id: 'cut-off',
    term: 'Cut-off',
    group: 'Money and settlement',
    meaning: 'The moment Raast closes a batch and sends one net amount per bank to PRISM+ for settlement.',
    source: 'notes',
  },
  {
    id: 'finality',
    term: 'Finality',
    group: 'Money and settlement',
    meaning:
      'A settled payment cannot be reversed. In Pakistan that point is reached when money moves between the banks’ accounts at the State Bank.',
    source: 'notes',
  },
  {
    id: 'iso-20022',
    term: 'ISO 20022',
    group: 'Messages and statuses',
    meaning: 'The international standard for payment messages. Raast and PRISM+ use it: each message is a standard electronic form.',
    source: 'notes',
  },
  {
    id: 'pacs-008',
    term: 'pacs.008',
    group: 'Messages and statuses',
    meaning: 'An ISO 20022 payment instruction, a customer credit transfer. In plain words: “please pay this amount”.',
    source: 'notes',
  },
  {
    id: 'pacs-002',
    term: 'pacs.002',
    group: 'Messages and statuses',
    meaning: 'An ISO 20022 status reply about a payment. Its status code says what happened: AUTH, NAUT, ACSP or RJCT.',
    source: 'cma-082',
  },
  {
    id: 'auth',
    term: 'AUTH',
    group: 'Messages and statuses',
    meaning: 'A pacs.002 status sent by the receiving side: “I approve this payment.” In this demo, RSOP sends it.',
    source: 'cma-082',
  },
  {
    id: 'naut',
    term: 'NAUT',
    group: 'Messages and statuses',
    meaning:
      'A pacs.002 status sent by the receiving side: “I refuse this payment”, with a reason. The demo doc writes it NAUTH; Raast’s design spec writes NAUT.',
    source: 'cma-082',
  },
  {
    id: 'acsp',
    term: 'ACSP',
    group: 'Messages and statuses',
    meaning:
      'A pacs.002 status from Raast: accepted, settlement in process. The payment is accepted; the banks’ money moves at the next settlement.',
    source: 'cma-082',
  },
  {
    id: 'rjct',
    term: 'RJCT',
    group: 'Messages and statuses',
    meaning: 'A pacs.002 status from Raast: rejected. The payment will not happen.',
    source: 'cma-082',
  },
  {
    id: 'pacs-028',
    term: 'pacs.028',
    group: 'Messages and statuses',
    meaning: 'An ISO 20022 request that asks: “what is the status of this payment?”',
    source: 'notes',
  },
  {
    id: 'camt-025',
    term: 'camt.025',
    group: 'Messages and statuses',
    meaning: 'A receipt or error in reply to a request. In Raast’s design, an approval or refusal that arrives too late gets one.',
    source: 'cma-082',
  },
  {
    id: 'inquiry-id',
    term: 'Inquiry ID',
    group: 'This demo',
    meaning:
      'The unique identifier the biller creates for one bill inquiry. The payment carries it, so RSOP can match the payment to the bill.',
    source: 'doc',
  },
  {
    id: 'payment-reference',
    term: 'Payment reference',
    group: 'This demo',
    meaning: 'The reference for one payment attempt. RSOP uses it to match status messages and retries to the right payment.',
    source: 'doc',
  },
  {
    id: 'bill-marking',
    term: 'Bill marking',
    group: 'This demo',
    meaning: 'Telling the biller that a bill is paid. RSOP does it only after Raast confirms the payment with ACSP.',
    source: 'doc',
  },
  {
    id: 'mock',
    term: 'Mock',
    group: 'This demo',
    meaning: 'A stand-in built for a demo. The government biller here is a mock, not a real government system.',
    source: 'doc',
  },
  {
    id: 'idempotent',
    term: 'Idempotent',
    group: 'This demo',
    meaning: 'Safe to repeat: doing it twice has the same effect as doing it once.',
    source: 'doc',
  },
  {
    id: 'atomic',
    term: 'Atomic',
    group: 'This demo',
    meaning:
      'All at once or not at all, with nothing in between. RSOP reserves an inquiry atomically, so two payments cannot both get it.',
    source: 'doc',
  },
  {
    id: 'awaiting-acsp',
    term: 'AWAITING_ACSP',
    group: 'This demo',
    meaning: 'RSOP’s state for a payment it has approved: waiting for Raast’s final status.',
    source: 'doc',
  },
  {
    id: 'done',
    term: 'DONE',
    group: 'This demo',
    meaning: 'RSOP’s state for a payment that Raast has confirmed with ACSP.',
    source: 'doc',
  },
];

export const termById = new Map(glossary.map((t) => [t.id, t]));

import type { Flow, Message, Status } from '../../lib/flow.ts';
import { outcomes, pkr, sample, type Outcome } from '../sample.ts';

const status = (code: Status, meaning: string, extra: Message['fields'] = []): Message => ({
  name: 'pacs.002',
  meaning,
  status: code,
  fields: [{ label: 'Payment reference', value: sample.paymentRef }, ...extra],
});

export function paymentFlow(outcome: Outcome): Flow {
  const o = outcomes.find((x) => x.id === outcome)!;
  const pacs008 = (meaning: string): Message => ({
    name: 'pacs.008',
    meaning,
    fields: [
      { label: 'Inquiry ID', value: o.inquiryId, toConfirm: true },
      { label: 'Amount', value: pkr(o.amount) },
      { label: 'Payment reference', value: sample.paymentRef },
    ],
  });

  const check = {
    exact: {
      title: 'Everything matches',
      caption: `RSOP looks up ${sample.inquiryId}, compares the amounts exactly (PKR ${o.amount} against PKR ${sample.amount}) and checks the bill can still be paid. Everything matches.`,
    },
    'wrong-amount': {
      title: 'The amounts differ',
      caption: `RSOP finds ${sample.inquiryId}, but the payment says PKR ${o.amount} and the inquiry says PKR ${sample.amount}. The amounts do not match.`,
    },
    'unknown-id': {
      title: 'Unknown inquiry ID',
      caption: `RSOP has no inquiry called ${o.inquiryId}, so it cannot tell which bill this payment is for.`,
    },
  }[outcome];

  const confirm = {
    exact: 'Sara checks the amount, PKR 4,350.00, and confirms the payment.',
    'wrong-amount': `Sara confirms the payment. In this outcome the payment carries PKR ${o.amount}, not the billed PKR ${sample.amount}, so you can see what RSOP does with a mismatch.`,
    'unknown-id': `Sara confirms the payment. In this outcome the payment carries an inquiry ID that RSOP has never seen, so you can see what happens then.`,
  }[outcome];

  return {
    id: `payment-${outcome}`,
    title: 'Bill payment',
    summary:
      'Sara pays. RSOP checks the payment against the inquiry before Raast finishes it, and the bill is marked paid only after Raast confirms.',
    branch: outcome === 'exact' ? 'approved' : 'refused',
    initialScreen: 'bill-shown',
    showRecords: true,
    initialRecords: {
      inquiries: {
        [sample.inquiryId]: {
          institution: sample.institution,
          billRef: sample.billRef,
          amount: pkr(sample.amount),
          status: 'OPEN',
        },
      },
      payments: {},
    },
    lanes: [
      { actor: 'customer', alias: 'C', docName: 'Customer', shape: 'actor' },
      { actor: 'bank', alias: 'B', docName: 'Payment Bank' },
      { actor: 'raast', alias: 'R', docName: 'RAAST' },
      { actor: 'rsop', alias: 'O', docName: 'Open Connect (RSOP)' },
      { actor: 'biller', alias: 'G', docName: 'Government Biller (Mock)' },
    ],
    blocks: [
      {
        type: 'step',
        step: {
          n: 1,
          from: 'customer',
          to: 'bank',
          kind: 'request',
          docLabel: 'Confirm bill payment',
          label: 'Confirm payment',
          title: 'Sara taps Pay',
          caption: confirm,
          screen: 'confirm',
        },
      },
      {
        type: 'step',
        step: {
          n: 2,
          from: 'bank',
          to: 'raast',
          kind: 'request',
          docLabel: 'PACS.008 (inquiry identifier, amount, payment reference)',
          label: 'pacs.008',
          title: 'The bank sends a pacs.008',
          caption:
            'Demo Bank sends a payment instruction, a [[pacs.008]], to Raast. It carries the inquiry ID, the amount and a new [[payment reference]].',
          screen: 'processing',
          message: pacs008('a payment instruction'),
          hood: [
            {
              text: 'Which pacs.008 field carries the inquiry ID is still to be confirmed, so this guide shows it as a business field only.',
              source: 'The demo doc, mappings to confirm',
            },
          ],
        },
      },
      {
        type: 'step',
        step: {
          n: 3,
          from: 'raast',
          to: 'rsop',
          kind: 'request',
          docLabel: 'Forward PACS.008 with same identifier and amount',
          label: 'pacs.008, forwarded',
          title: 'Raast forwards the payment',
          caption:
            'Raast forwards the payment to RSOP, which answers for the government side. The inquiry ID and the amount arrive unchanged.',
          message: pacs008('the same payment, forwarded'),
          hood: [
            {
              text: 'Before forwarding, Raast checks the message format, the signature and the sender’s rights, then blocks the amount against Demo Bank’s position and limit.',
              source: 'CMA TS 082 002 §3.2.1',
            },
          ],
        },
      },
      {
        type: 'step',
        step: {
          n: 4,
          from: 'rsop',
          to: 'rsop',
          kind: 'internal',
          docLabel:
            'Retrieve inquiry and validate identifier and amount pair<br/>Check inquiry is eligible for payment',
          label: 'Match ID and amount',
          title: check.title,
          caption: check.caption,
          hood: [
            {
              text: 'Raast is waiting for RSOP’s answer. In Raast’s design, if no answer arrives in time, Raast rejects the payment itself.',
              source: 'CMA TS 082 002 §3.2.3',
              link: { href: '/what-if?scenario=late-answer', label: 'See it in What if' },
            },
          ],
        },
      },
      {
        type: 'alt',
        branches: [
          {
            title: 'RSOP validation failed',
            label: 'Alternative 1 · Validation failed',
            branch: 'refused',
            blocks: [
              {
                type: 'step',
                step: {
                  n: 5,
                  from: 'rsop',
                  to: 'raast',
                  kind: 'reply',
                  docLabel: 'PACS.002 / NAUTH (rejection reason)',
                  label: 'pacs.002 · NAUT',
                  title: 'RSOP says no',
                  caption: `RSOP refuses the payment. It sends a status reply, a [[pacs.002]], with the code [[NAUT]] and a reason: “${o.reason}”.`,
                  message: status('NAUT', 'a status reply: refused', [{ label: 'Reason', value: o.reason, toConfirm: true }]),
                  hood: [
                    {
                      text: 'Raast’s design spec names this code NAUT. The demo doc writes NAUTH; this guide follows the spec.',
                      source: 'CMA TS 082 002 §3.1 and the demo doc',
                    },
                    {
                      text: 'The mapping to reason codes is still to be confirmed, so the reason is shown in plain words.',
                      source: 'The demo doc, mappings to confirm',
                    },
                  ],
                },
              },
              {
                type: 'step',
                step: {
                  n: 6,
                  from: 'raast',
                  to: 'raast',
                  kind: 'internal',
                  docLabel: 'Reject transaction',
                  label: 'Reject',
                  title: 'Raast rejects the payment',
                  caption: 'Raast cancels the payment and releases the money it had set aside on Demo Bank’s position.',
                  hood: [
                    {
                      text: 'Raast rejects the payment and unblocks the funds it blocked before forwarding.',
                      source: 'CMA TS 082 002 §3.2.2',
                    },
                  ],
                },
              },
              {
                type: 'par',
                lanes: [
                  {
                    title: 'Notify Payment Bank',
                    blocks: [
                      {
                        type: 'step',
                        step: {
                          n: 7,
                          from: 'raast',
                          to: 'bank',
                          kind: 'reply',
                          docLabel: 'PACS.002 / RJCT',
                          label: 'pacs.002 · RJCT',
                          title: 'The bank hears: rejected',
                          caption: 'Raast tells Demo Bank that the payment was rejected: [[RJCT]].',
                          message: status('RJCT', 'a status reply: rejected'),
                        },
                      },
                      {
                        type: 'step',
                        step: {
                          n: 8,
                          from: 'bank',
                          to: 'customer',
                          kind: 'reply',
                          docLabel: 'Payment rejected',
                          label: 'Payment rejected',
                          title: 'Sara sees: rejected',
                          caption: 'Sara sees that the payment did not go through. Her bill is still unpaid.',
                          screen: 'rejected',
                        },
                      },
                    ],
                  },
                  {
                    title: 'Notify RSOP',
                    blocks: [
                      {
                        type: 'step',
                        step: {
                          n: 9,
                          from: 'raast',
                          to: 'rsop',
                          kind: 'reply',
                          docLabel: 'PACS.002 / RJCT',
                          label: 'pacs.002 · RJCT',
                          title: 'RSOP hears: rejected',
                          caption:
                            'Raast tells RSOP the same. This can arrive before or after Demo Bank hears it: neither waits for the other.',
                          message: status('RJCT', 'a status reply: rejected'),
                        },
                      },
                      {
                        type: 'step',
                        step: {
                          n: 10,
                          from: 'rsop',
                          to: 'rsop',
                          kind: 'internal',
                          docLabel: 'Mark payment attempt REJECTED',
                          label: 'Attempt REJECTED',
                          title: 'RSOP records the failure',
                          caption:
                            'RSOP records the failed attempt. It does not contact the biller: nothing was paid, and the inquiry stays as it was.',
                          records: [
                            {
                              table: 'payments',
                              key: sample.paymentRef,
                              set: { inquiry: o.inquiryId, amount: pkr(o.amount), status: 'REJECTED' },
                            },
                          ],
                          hood: [
                            {
                              text: 'The attempt is recorded when the RJCT arrives, not when RSOP sends NAUT. A rejected attempt is never recorded as a paid bill.',
                              source: 'The demo doc',
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              { type: 'note', over: ['rsop', 'biller'], text: 'Do not call Bill Marking web service' },
            ],
          },
          {
            title: 'RSOP validation successful',
            label: 'Alternative 2 · Validation successful',
            branch: 'approved',
            blocks: [
              {
                type: 'step',
                step: {
                  n: 11,
                  from: 'rsop',
                  to: 'rsop',
                  kind: 'internal',
                  docLabel: 'Reserve inquiry for this payment<br/>Set status AWAITING_ACSP',
                  label: 'Reserve: AWAITING_ACSP',
                  title: 'RSOP reserves the bill',
                  caption:
                    'RSOP ties the inquiry to this payment, so no other payment can use it, and marks the payment [[AWAITING_ACSP]]: waiting for Raast’s final word.',
                  records: [
                    { table: 'inquiries', key: sample.inquiryId, set: { reservedFor: sample.paymentRef } },
                    {
                      table: 'payments',
                      key: sample.paymentRef,
                      set: { inquiry: sample.inquiryId, amount: pkr(o.amount), status: 'AWAITING_ACSP' },
                    },
                  ],
                  hood: [
                    {
                      text: 'The reservation is atomic: two payments for the same bill cannot both get it.',
                      source: 'The demo doc',
                      link: { href: '/what-if?scenario=race', label: 'See two payments race' },
                    },
                  ],
                },
              },
              {
                type: 'step',
                step: {
                  n: 12,
                  from: 'rsop',
                  to: 'raast',
                  kind: 'reply',
                  docLabel: 'PACS.002 / AUTH',
                  label: 'pacs.002 · AUTH',
                  title: 'RSOP says yes',
                  caption: 'RSOP approves the payment: a pacs.002 with the code [[AUTH]].',
                  message: status('AUTH', 'a status reply: approved'),
                },
              },
              {
                type: 'step',
                step: {
                  n: 13,
                  from: 'raast',
                  to: 'raast',
                  kind: 'internal',
                  docLabel: 'Accept and settle transaction',
                  label: 'Accept and settle',
                  title: 'Raast accepts the payment',
                  caption:
                    'Raast accepts the payment and records it between the two sides. The banks’ real money moves a little later, in [[PRISM+]].',
                  hood: [
                    {
                      text: 'Raast posts the payment: Demo Bank’s position goes down and the receiving side’s goes up. The money itself settles at the next cycle in PRISM+, the State Bank’s RTGS.',
                      source: 'Raast learning notes',
                      link: { href: '/settlement', label: 'After the payment' },
                    },
                  ],
                },
              },
              {
                type: 'par',
                lanes: [
                  {
                    title: 'Notify Payment Bank',
                    blocks: [
                      {
                        type: 'step',
                        step: {
                          n: 14,
                          from: 'raast',
                          to: 'bank',
                          kind: 'reply',
                          docLabel: 'PACS.002 / ACSP',
                          label: 'pacs.002 · ACSP',
                          title: 'The bank hears: accepted',
                          caption: 'Raast tells Demo Bank the payment is accepted: [[ACSP]], “accepted, settlement in process”.',
                          message: status('ACSP', 'a status reply: accepted'),
                          hood: [{ text: 'ACSP stands for AcceptedSettlementInProcess.', source: 'CMA TS 082 002 §3.2.1' }],
                        },
                      },
                      {
                        type: 'step',
                        step: {
                          n: 15,
                          from: 'bank',
                          to: 'customer',
                          kind: 'reply',
                          docLabel: 'Payment successful',
                          label: 'Payment successful',
                          title: 'Sara sees: paid',
                          caption: 'Sara sees “Payment successful”.',
                          screen: 'paid',
                        },
                      },
                    ],
                  },
                  {
                    title: 'Notify RSOP',
                    blocks: [
                      {
                        type: 'step',
                        step: {
                          n: 16,
                          from: 'raast',
                          to: 'rsop',
                          kind: 'reply',
                          docLabel: 'PACS.002 / ACSP',
                          label: 'pacs.002 · ACSP',
                          title: 'RSOP hears: accepted',
                          caption:
                            'Raast tells RSOP the same. This can arrive before or after Demo Bank hears it: neither waits for the other.',
                          message: status('ACSP', 'a status reply: accepted'),
                        },
                      },
                      {
                        type: 'step',
                        step: {
                          n: 17,
                          from: 'rsop',
                          to: 'rsop',
                          kind: 'internal',
                          docLabel: 'Correlate payment and mark payment DONE<br/>Persist bill-marking task',
                          label: 'DONE, save task',
                          title: 'RSOP marks the payment done',
                          caption:
                            'RSOP matches the ACSP to the payment by its reference, marks it [[DONE]], and saves a to-do: tell the biller.',
                          records: [
                            { table: 'payments', key: sample.paymentRef, set: { status: 'DONE', notification: 'pending' } },
                          ],
                          hood: [
                            {
                              text: 'The bill-marking task is saved before the call, so a crash or a timeout cannot lose it.',
                              source: 'The demo doc',
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                type: 'step',
                step: {
                  n: 18,
                  from: 'rsop',
                  to: 'biller',
                  kind: 'request',
                  docLabel: 'Call mock Bill Marking web service<br/>(inquiry identifier, amount, payment reference)',
                  label: 'Bill Marking web service',
                  title: 'RSOP tells the biller',
                  caption:
                    'RSOP tells the biller that the bill is paid, quoting the inquiry ID, the amount and the payment reference: this is [[bill marking]].',
                  message: {
                    name: 'Bill Marking web service',
                    meaning: 'the paid-bill notice',
                    fields: [
                      { label: 'Inquiry ID', value: sample.inquiryId },
                      { label: 'Amount', value: pkr(sample.amount) },
                      { label: 'Payment reference', value: sample.paymentRef },
                    ],
                  },
                  hood: [
                    {
                      text: 'If this call times out, the payment stays DONE and the notification stays pending, to be retried with the same payment reference.',
                      source: 'The demo doc',
                      link: { href: '/what-if?scenario=marking-timeout', label: 'See the timeout' },
                    },
                  ],
                },
              },
              {
                type: 'step',
                step: {
                  n: 19,
                  from: 'biller',
                  to: 'biller',
                  kind: 'internal',
                  docLabel: 'Mark bill paid idempotently',
                  label: 'Mark bill paid',
                  title: 'The biller marks the bill paid',
                  caption:
                    'The biller marks the bill paid. It does this [[idempotently|idempotent]]: if the same request comes again, the bill is still paid only once.',
                },
              },
              {
                type: 'step',
                step: {
                  n: 20,
                  from: 'biller',
                  to: 'rsop',
                  kind: 'reply',
                  docLabel: 'Bill marking confirmation',
                  label: 'Confirmation',
                  title: 'The biller confirms',
                  caption: 'The biller confirms that the bill is marked paid.',
                  message: {
                    name: 'Bill Marking response',
                    meaning: 'the biller’s confirmation',
                    fields: [
                      { label: 'Bill reference', value: sample.billRef },
                      { label: 'Bill', value: 'Paid' },
                    ],
                  },
                },
              },
              {
                type: 'step',
                step: {
                  n: 21,
                  from: 'rsop',
                  to: 'rsop',
                  kind: 'internal',
                  docLabel: 'Mark bill notification COMPLETE',
                  label: 'Notification COMPLETE',
                  title: 'All done',
                  caption: 'RSOP ticks off the to-do. The payment is DONE and the bill notification is COMPLETE.',
                  records: [{ table: 'payments', key: sample.paymentRef, set: { notification: 'COMPLETE' } }],
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

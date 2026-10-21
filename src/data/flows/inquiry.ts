import type { Flow, Message } from '../../lib/flow.ts';
import { pkr, sample } from '../sample.ts';

const request: Message = {
  name: 'Bill Inquiry API',
  meaning: 'a question: how much is owed on this bill?',
  fields: [
    { label: 'Institution', value: sample.institution },
    { label: 'Bill reference', value: sample.billRef },
  ],
};

const response = (meaning: string): Message => ({
  name: 'Bill Inquiry response',
  meaning,
  fields: [
    { label: 'Bill', value: sample.bill },
    { label: 'Amount', value: pkr(sample.amount) },
    { label: 'Inquiry ID', value: sample.inquiryId },
  ],
});

export const inquiryFlow: Flow = {
  id: 'inquiry',
  title: 'Bill inquiry',
  summary:
    'Before paying, the bank asks how much is owed. The answer comes with a unique inquiry ID, which ties the later payment to this question.',
  initialScreen: 'enter-bill',
  showRecords: true,
  lanes: [
    { actor: 'customer', alias: 'C', docName: 'Customer', shape: 'actor' },
    { actor: 'bank', alias: 'B', docName: 'Payment Bank' },
    { actor: 'raast', alias: 'R', docName: 'RAAST API Gateway', role: 'API gateway' },
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
        docLabel: 'Select institution and enter bill reference',
        label: 'Choose institution, enter reference',
        title: 'Sara asks about her bill',
        caption:
          'Sara opens her bank app, picks who she owes, the Demo Municipal Authority, and types the reference printed on her property-tax bill.',
        screen: 'enter-bill',
        message: {
          name: 'In the app',
          meaning: 'Sara fills in a short form',
          fields: [
            { label: 'Institution', value: sample.institution },
            { label: 'Bill reference', value: sample.billRef },
          ],
        },
      },
    },
    {
      type: 'step',
      step: {
        n: 2,
        from: 'bank',
        to: 'raast',
        kind: 'request',
        docLabel: 'Bill Inquiry API (institution, bill reference)',
        label: 'Bill Inquiry API',
        title: 'The bank asks Raast',
        caption:
          'Demo Bank asks how much is owed on this bill. It sends the question to Raast’s [[API gateway]], the front door that banks use to reach Raast.',
        screen: 'fetching',
        message: request,
        hood: [
          {
            text: 'Raast’s API gateway is the single entry point for participants’ systems.',
            source: 'CMA TN 020 101, via the learning notes',
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
        docLabel: 'Forward Bill Inquiry request',
        label: 'Forward inquiry',
        title: 'Raast passes it to RSOP',
        caption: 'The gateway hands the question to [[RSOP]], the platform that knows how to reach each government biller.',
        message: { ...request, meaning: 'the same question, forwarded' },
      },
    },
    {
      type: 'step',
      step: {
        n: 4,
        from: 'rsop',
        to: 'biller',
        kind: 'request',
        docLabel: 'Call mock Bill Inquiry web service',
        label: 'Bill Inquiry web service',
        title: 'RSOP asks the biller',
        caption:
          'RSOP calls the municipal authority’s billing system. In this demo a [[mock]] stands in for the real one.',
        message: {
          name: 'Bill Inquiry web service',
          meaning: 'RSOP’s call to the biller',
          fields: [{ label: 'Bill reference', value: sample.billRef }],
        },
      },
    },
    {
      type: 'step',
      step: {
        n: 5,
        from: 'biller',
        to: 'biller',
        kind: 'internal',
        docLabel: 'Retrieve bill and generate unique inquiry identifier',
        label: 'Find bill, create inquiry ID',
        title: 'The biller creates an inquiry ID',
        caption:
          'The biller finds the bill and creates an [[inquiry ID]]: a unique ticket number for this question. Every later step refers back to it.',
        hood: [
          {
            text: 'The ID’s format is the mock biller’s choice; the doc only requires it to be unique. INQ-8F2C41 is illustrative.',
            source: 'The demo doc',
          },
        ],
      },
    },
    {
      type: 'step',
      step: {
        n: 6,
        from: 'biller',
        to: 'rsop',
        kind: 'reply',
        docLabel: 'Bill details, amount, currency, unique inquiry identifier',
        label: 'Bill, amount, inquiry ID',
        title: 'The answer comes back',
        caption: 'The biller answers RSOP: what the bill is for, PKR 4,350.00, and the inquiry ID.',
        message: response('the answer'),
      },
    },
    {
      type: 'step',
      step: {
        n: 7,
        from: 'rsop',
        to: 'rsop',
        kind: 'internal',
        docLabel: 'Persist identifier and amount pair<br/>with institution, bill reference and status OPEN',
        label: 'Save ID and amount: OPEN',
        title: 'RSOP remembers the answer',
        caption:
          'Before passing the answer on, RSOP writes down the inquiry ID and the exact amount. Later it will approve only a payment that matches both.',
        records: [
          {
            table: 'inquiries',
            key: sample.inquiryId,
            set: {
              institution: sample.institution,
              billRef: sample.billRef,
              amount: pkr(sample.amount),
              status: 'OPEN',
            },
          },
        ],
        hood: [
          {
            text: 'RSOP stores the inquiry ID, the exact amount, the currency, the institution, the bill reference and the status. Amounts are compared exactly, in paisa, never as floating-point numbers.',
            source: 'The demo doc, implementation behaviour',
          },
        ],
      },
    },
    {
      type: 'step',
      step: {
        n: 8,
        from: 'rsop',
        to: 'raast',
        kind: 'reply',
        docLabel: 'Bill details, amount, currency, unique inquiry identifier',
        label: 'Bill, amount, inquiry ID',
        title: 'RSOP replies',
        caption: 'RSOP sends the answer back to the gateway, with the inquiry ID exactly as the biller made it.',
        message: response('the answer, passed back unchanged'),
      },
    },
    {
      type: 'step',
      step: {
        n: 9,
        from: 'raast',
        to: 'bank',
        kind: 'reply',
        docLabel: 'Return Bill Inquiry response',
        label: 'Inquiry response',
        title: 'Raast replies to the bank',
        caption: 'The gateway hands the answer to Demo Bank.',
        message: response('the answer'),
      },
    },
    {
      type: 'step',
      step: {
        n: 10,
        from: 'bank',
        to: 'bank',
        kind: 'internal',
        docLabel: 'Retain inquiry identifier for PACS.008 payment',
        label: 'Keep the inquiry ID',
        title: 'The bank keeps the ID',
        caption:
          'Demo Bank keeps the inquiry ID. It will put it inside the payment, so RSOP can match the payment to this bill.',
      },
    },
    {
      type: 'step',
      step: {
        n: 11,
        from: 'bank',
        to: 'customer',
        kind: 'reply',
        docLabel: 'Display bill details and payable amount',
        label: 'Show bill and amount',
        title: 'Sara sees her bill',
        caption: 'Sara sees the bill and the amount to pay. No money has moved, and the bill is not marked paid.',
        screen: 'bill-shown',
      },
    },
  ],
};

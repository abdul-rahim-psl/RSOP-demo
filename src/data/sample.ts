// Fictional values shared by every page, so learners can follow the same numbers as they move.
export const sample = {
  bank: 'Demo Bank',
  institution: 'Demo Municipal Authority',
  bill: 'Property tax 2026',
  billRef: 'PT-2026-004512',
  currency: 'PKR',
  amount: '4,350.00',
  inquiryId: 'INQ-8F2C41',
  paymentRef: 'PAY-20261021-000187',
  secondPaymentRef: 'PAY-20261021-000188',
  wrongAmount: '4,000.00',
  unknownInquiryId: 'INQ-000000',
} as const;

export const pkr = (amount: string) => `PKR ${amount}`;

export type Outcome = 'exact' | 'wrong-amount' | 'unknown-id';

export interface OutcomeInfo {
  id: Outcome;
  label: string;
  hint: string;
  inquiryId: string;
  amount: string;
  /** Plain-language refusal reason; reason codes are still to be confirmed. */
  reason: string;
}

export const outcomes: OutcomeInfo[] = [
  {
    id: 'exact',
    label: 'The exact amount',
    hint: 'Inquiry ID and amount both match',
    inquiryId: sample.inquiryId,
    amount: sample.amount,
    reason: 'Inquiry not eligible',
  },
  {
    id: 'wrong-amount',
    label: 'A different amount',
    hint: `${pkr(sample.wrongAmount)} instead of ${pkr(sample.amount)}`,
    inquiryId: sample.inquiryId,
    amount: sample.wrongAmount,
    reason: 'Amount does not match',
  },
  {
    id: 'unknown-id',
    label: 'An unknown inquiry ID',
    hint: 'An ID RSOP has never seen',
    inquiryId: sample.unknownInquiryId,
    amount: sample.amount,
    reason: 'Unknown inquiry',
  },
];

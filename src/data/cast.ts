import type { ActorId, Step } from '../lib/flow.ts';
import { allSteps } from '../lib/flow.ts';
import { actorOrder } from './actors.ts';
import { inquiryFlow } from './flows/inquiry.ts';
import { paymentFlow } from './flows/payment.ts';

export interface CastStep {
  n: number;
  title: string;
  href: string;
  refusedOnly: boolean;
}

export interface CastEntry {
  inquiry: CastStep[];
  payment: CastStep[];
  talksTo: { actor: ActorId; messages: number }[];
  total: number;
}

const involves = (a: ActorId) => (s: Step) => s.from === a || s.to === a;
const inquirySteps = allSteps(inquiryFlow.blocks);
const paymentSteps = allSteps(paymentFlow('exact').blocks);
const refused = new Set([5, 6, 7, 8, 9, 10]);

/** For each party: every step it takes part in, and whom it exchanges messages with. */
export const cast = Object.fromEntries(
  actorOrder.map((a) => {
    const inquiry = inquirySteps.filter(involves(a)).map((s) => ({
      n: s.n,
      title: s.title,
      href: `/inquiry#step-${s.n}`,
      refusedOnly: false,
    }));
    const payment = paymentSteps.filter(involves(a)).map((s) => ({
      n: s.n,
      title: s.title,
      href: refused.has(s.n) ? `/payment?outcome=wrong-amount#step-${s.n}` : `/payment#step-${s.n}`,
      refusedOnly: refused.has(s.n),
    }));
    const counts = new Map<ActorId, number>();
    for (const s of [...inquirySteps, ...paymentSteps]) {
      if (s.kind === 'internal' || !involves(a)(s)) continue;
      const other = s.from === a ? s.to : s.from;
      counts.set(other, (counts.get(other) ?? 0) + 1);
    }
    const talksTo = actorOrder.filter((o) => counts.has(o)).map((o) => ({ actor: o, messages: counts.get(o)! }));
    return [a, { inquiry, payment, talksTo, total: inquiry.length + payment.length }];
  }),
) as Record<ActorId, CastEntry>;

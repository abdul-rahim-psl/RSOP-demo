import type { ActorId } from '../lib/flow.ts';

export interface Actor {
  id: ActorId;
  name: string;
  role: string;
  job: string;
  about: string;
}

export const actorOrder: ActorId[] = ['customer', 'bank', 'raast', 'rsop', 'biller'];

export const actors: Record<ActorId, Actor> = {
  customer: {
    id: 'customer',
    name: 'Sara',
    role: 'Customer',
    job: 'Wants to pay a government bill from her bank app.',
    about: 'A fictional customer. Everything she does happens inside her bank’s app.',
  },
  bank: {
    id: 'bank',
    name: 'Demo Bank',
    role: 'Payment bank',
    job: 'Sara’s bank. It talks to Raast on her behalf.',
    about:
      'A fictional bank. In real life, any bank, microfinance bank or wallet company connected to Raast could play this part.',
  },
  raast: {
    id: 'raast',
    name: 'Raast',
    role: 'Instant payment system',
    job: 'Pakistan’s national instant payment system. It carries messages between the parties and gives the final word on a payment.',
    about:
      'Owned by the State Bank of Pakistan and run by its subsidiary RPP. Live since January 2021 and open 24x7.',
  },
  rsop: {
    id: 'rsop',
    name: 'RSOP',
    role: 'Open Connect',
    job: 'The platform between Raast and government billers. It routes inquiries, remembers them, and approves or refuses payments.',
    about: 'RSOP stands for RAAST Service Orchestration Platform. In this demo, Open Connect plays that role.',
  },
  biller: {
    id: 'biller',
    name: 'Biller',
    role: 'Government · mock',
    job: 'Stands in for a government institution’s billing system. It looks up bills and marks them paid.',
    about: 'A mock: a stand-in built for the demo, not a real government system.',
  },
};

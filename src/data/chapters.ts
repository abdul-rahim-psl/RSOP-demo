export interface Chapter {
  href: string;
  n: string;
  title: string;
  nav: string;
  minutes: number;
  blurb: string;
}

export const chapters: Chapter[] = [
  {
    href: '/basics',
    n: '01',
    title: 'The basics',
    nav: 'Basics',
    minutes: 4,
    blurb: 'Raast and the RTGS, clearing vs settlement, and why every bank does not need a cable to every other bank.',
  },
  {
    href: '/inquiry',
    n: '02',
    title: 'Bill inquiry',
    nav: 'Inquiry',
    minutes: 3,
    blurb: '“How much do I owe?” Eleven steps from Sara’s question to the amount on her screen.',
  },
  {
    href: '/payment',
    n: '03',
    title: 'Bill payment',
    nav: 'Payment',
    minutes: 4,
    blurb: 'Twenty-one steps. Choose what the bank sends, and watch RSOP approve or refuse it.',
  },
  {
    href: '/what-if',
    n: '04',
    title: 'What if…',
    nav: 'What if',
    minutes: 3,
    blurb: 'Repeated messages, two payments racing for one bill, a biller that does not answer.',
  },
  {
    href: '/settlement',
    n: '05',
    title: 'After the payment',
    nav: 'Settlement',
    minutes: 3,
    blurb: 'What “accepted, settlement in process” means, and how the banks square up later in PRISM+.',
  },
];

export const glossaryLink = { href: '/glossary', title: 'Glossary', nav: 'Glossary' };

export function neighbours(href: string) {
  const i = chapters.findIndex((c) => c.href === href);
  return { prev: i > 0 ? chapters[i - 1] : undefined, next: chapters[i + 1], index: i };
}

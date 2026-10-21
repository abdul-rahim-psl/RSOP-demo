export type SourceId = 'doc' | 'cma-082' | 'cma-020' | 'notes' | 'sbp-review';

export interface Source {
  label: string;
  detail: string;
}

export const sources: Record<SourceId, Source> = {
  doc: {
    label: 'The demo doc',
    detail:
      'Open Connect RAAST Orchestration Demo: inquiry and government bill payment flows. Paysys Labs, implementation reference, 20 October 2026. The authority for both flows in this guide.',
  },
  'cma-082': {
    label: 'CMA TS 082 002',
    detail:
      'P2P message flow, CMA Small Systems, April 2021. Raast’s vendor design spec: what Raast does inside a payment, and the AUTH, NAUT, ACSP and RJCT codes. Describes Raast as designed; the live system may differ.',
  },
  'cma-020': {
    label: 'CMA TN 020 101',
    detail: 'MPG IPS infrastructure design, CMA Small Systems, March 2020. Raast’s modules, including the API gateway.',
  },
  notes: {
    label: 'Raast learning notes',
    detail:
      'Bird’s-eye notes on Raast, PRISM+ and 1LINK (October 2026), built from SBP circulars and press releases, World Bank reports and the CMA design documents.',
  },
  'sbp-review': {
    label: 'SBP quarterly review',
    detail:
      'State Bank of Pakistan, payment systems quarterly review for January–March 2026 (published 25 June 2026), via the learning notes.',
  },
};

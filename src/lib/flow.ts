export type ActorId = 'customer' | 'bank' | 'raast' | 'rsop' | 'biller';
export type Status = 'AUTH' | 'NAUT' | 'ACSP' | 'RJCT';
export type StepKind = 'request' | 'reply' | 'internal';
export type Screen = 'enter-bill' | 'fetching' | 'bill-shown' | 'confirm' | 'processing' | 'paid' | 'rejected';
export type Branch = 'refused' | 'approved';

export interface Lane {
  actor: ActorId;
  /** Overrides the actor's role line in the lane header, e.g. "API gateway". */
  role?: string;
  /** The doc's Mermaid alias and participant name; only the doc's two flows need them. */
  alias?: string;
  docName?: string;
  shape?: 'actor' | 'participant';
}

export interface Field {
  label: string;
  value: string;
  toConfirm?: boolean;
}

export interface Message {
  name: string;
  meaning: string;
  status?: Status;
  fields: Field[];
}

export interface RecordChange {
  table: 'inquiries' | 'payments';
  key: string;
  set: Record<string, string>;
}

export interface Note {
  text: string;
  source: string;
  link?: { href: string; label: string };
}

export interface Step {
  n: number;
  from: ActorId;
  to: ActorId;
  kind: StepKind;
  /** The doc's Mermaid label, verbatim; the parity check compares it with the doc. */
  docLabel?: string;
  label: string;
  title: string;
  caption: string;
  message?: Message;
  records?: RecordChange[];
  screen?: Screen;
  hood?: Note[];
  /** Behaviour the doc leaves open; the card says so. */
  toConfirm?: string;
}

export interface AltBranch {
  title: string;
  label: string;
  branch: Branch;
  blocks: Block[];
}

export interface ParLane {
  title: string;
  blocks: Block[];
}

export type Block =
  | { type: 'step'; step: Step }
  | { type: 'note'; over: [ActorId, ActorId]; text: string }
  | { type: 'alt'; branches: AltBranch[] }
  | { type: 'par'; lanes: ParLane[] };

export type RecordTable = Record<string, Record<string, string>>;

export interface Records {
  inquiries: RecordTable;
  payments: RecordTable;
}

export interface Flow {
  id: string;
  title: string;
  summary: string;
  lanes: Lane[];
  blocks: Block[];
  /** Which alternative this flow walks, when it has one. */
  branch?: Branch;
  initialScreen?: Screen;
  initialRecords?: Records;
  showRecords?: boolean;
}

export const emptyRecords = (): Records => ({ inquiries: {}, payments: {} });

/** Every step in the doc's order, whichever alternative it sits in. */
export function allSteps(blocks: Block[]): Step[] {
  return blocks.flatMap((b) => {
    if (b.type === 'step') return [b.step];
    if (b.type === 'alt') return b.branches.flatMap((br) => allSteps(br.blocks));
    if (b.type === 'par') return b.lanes.flatMap((l) => allSteps(l.blocks));
    return [];
  });
}

/** The steps a learner walks: the flow's alternative only, with parallel lanes optionally reversed. */
export function walk(flow: Flow, swapped = false): Step[] {
  const visit = (blocks: Block[]): Step[] =>
    blocks.flatMap((b) => {
      if (b.type === 'step') return [b.step];
      if (b.type === 'alt') {
        const taken = b.branches.find((br) => br.branch === flow.branch) ?? b.branches[0];
        return taken ? visit(taken.blocks) : [];
      }
      if (b.type === 'par') return (swapped ? [...b.lanes].reverse() : b.lanes).flatMap((l) => visit(l.blocks));
      return [];
    });
  return visit(flow.blocks);
}

export function hasParallel(blocks: Block[]): boolean {
  return blocks.some(
    (b) =>
      b.type === 'par' ||
      (b.type === 'alt' && b.branches.some((br) => hasParallel(br.blocks))),
  );
}

/** Problems that would make the guide teach something inconsistent; an empty list means the flow is sound. */
export function problems(flow: Flow): string[] {
  const out: string[] = [];
  const lanes = new Set(flow.lanes.map((l) => l.actor));
  const steps = allSteps(flow.blocks);
  steps.forEach((s, i) => {
    const where = `${flow.id} step ${s.n}`;
    if (s.n !== i + 1) out.push(`${where}: expected number ${i + 1}`);
    if (!lanes.has(s.from) || !lanes.has(s.to)) out.push(`${where}: actor outside the flow's lanes`);
    if ((s.kind === 'internal') !== (s.from === s.to)) out.push(`${where}: internal steps stay on one lane`);
    if (s.caption.split(/\s+/).length > 45) out.push(`${where}: caption over 45 words`);
    if (s.message?.name === 'pacs.002' && !s.message.status) out.push(`${where}: pacs.002 without a status`);
  });
  return out;
}

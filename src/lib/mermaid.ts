import type { ActorId, Block, Flow } from './flow.ts';

/** Writes a flow as the doc writes its Mermaid source, so the two can be compared line by line. */
export function toMermaid(flow: Flow): string[] {
  const alias = new Map<ActorId, string>(flow.lanes.map((l) => [l.actor, l.alias ?? l.actor]));
  const lines = ['sequenceDiagram', 'autonumber'];
  for (const l of flow.lanes) lines.push(`${l.shape ?? 'participant'} ${l.alias} as ${l.docName}`);

  const emit = (blocks: Block[]) => {
    for (const b of blocks) {
      if (b.type === 'step') {
        const s = b.step;
        const arrow = s.kind === 'reply' ? '-->>' : '->>';
        lines.push(`${alias.get(s.from)}${arrow}${alias.get(s.to)}: ${s.docLabel ?? s.label}`);
      } else if (b.type === 'note') {
        lines.push(`Note over ${b.over.map((a) => alias.get(a)).join(',')}: ${b.text}`);
      } else if (b.type === 'alt') {
        b.branches.forEach((br, i) => {
          lines.push(`${i === 0 ? 'alt' : 'else'} ${br.title}`);
          emit(br.blocks);
        });
        lines.push('end');
      } else {
        b.lanes.forEach((l, i) => {
          lines.push(`${i === 0 ? 'par' : 'and'} ${l.title}`);
          emit(l.blocks);
        });
        lines.push('end');
      }
    }
  };
  emit(flow.blocks);
  return lines;
}

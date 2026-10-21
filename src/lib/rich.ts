import { termById } from '../data/glossary.ts';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\+/g, ' plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Turns `[[label]]` or `[[label|id]]` into a tap-to-explain glossary button and escapes the rest.
 * An unknown term fails the build, so no page can link to a definition that does not exist.
 */
export function rich(text: string): string {
  return text
    .split(/(\[\[[^\]]+\]\])/)
    .map((part) => {
      const m = part.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
      if (!m) return escape(part);
      const label = m[1];
      const id = m[2] ?? slug(label);
      if (!termById.has(id)) throw new Error(`Unknown glossary term "${id}" in: ${text}`);
      return `<button type="button" class="term" popovertarget="g-${id}">${escape(label)}</button>`;
    })
    .join('');
}

export const plain = (text: string) => text.replace(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g, '$1');

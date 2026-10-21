import type { RecordChange, Records } from '../lib/flow';

interface StepData {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  title: string;
  records?: RecordChange[];
  screen?: string;
}

interface PathData {
  id: string;
  order: number[];
  swapped: number[] | null;
  steps: Record<string, StepData>;
  initialRecords: Records;
  initialScreen: string | null;
  showRecords: boolean;
}

const PLAY_MS = 3500;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const sheet = matchMedia('(max-width: 999px)');

const tones: Record<string, string> = {
  OPEN: 'info',
  AWAITING_ACSP: 'wait',
  pending: 'wait',
  DONE: 'ok',
  COMPLETE: 'ok',
  REJECTED: 'fail',
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const pill = (v: string) => `<span class="pill" data-tone="${tones[v] ?? 'info'}">${esc(v)}</span>`;

function renderRecords(r: Records, changed: Set<string>): string {
  const inq = Object.entries(r.inquiries).map(
    ([id, f]) => `
      <div class="rec${changed.has(id) ? ' changed' : ''}">
        <div class="rec-top"><span class="mono rec-id">${esc(id)}</span>${f.status ? pill(f.status) : ''}</div>
        <p class="rec-sub">${esc(f.institution ?? '')} · <span class="mono">${esc(f.billRef ?? '')}</span></p>
        <p class="rec-sub">${esc(f.amount ?? '')}${
          f.reservedFor ? ` · reserved for <span class="mono">${esc(f.reservedFor)}</span>` : ''
        }</p>
      </div>`,
  );
  const pay = Object.entries(r.payments).map(
    ([ref, f]) => `
      <div class="rec${changed.has(ref) ? ' changed' : ''}">
        <div class="rec-top"><span class="mono rec-id">${esc(ref)}</span>${f.status ? pill(f.status) : ''}</div>
        <p class="rec-sub"><span class="mono">${esc(f.inquiry ?? '')}</span> · ${esc(f.amount ?? '')}</p>
        ${f.notification ? `<p class="rec-sub">Bill notification ${pill(f.notification)}</p>` : ''}
      </div>`,
  );
  const group = (title: string, items: string[], empty: string) =>
    `<div class="rec-group"><p class="rec-h">${title}</p>${items.length ? items.join('') : `<p class="rec-empty">${empty}</p>`}</div>`;
  return group('Inquiries', inq, 'None yet') + group('Payment attempts', pay, 'None yet');
}

function clone(r: Records): Records {
  return JSON.parse(JSON.stringify(r));
}

function initShell(shell: HTMLElement) {
  const param = shell.dataset.param ?? 'variant';
  const docNumbered = shell.hasAttribute('data-doc');
  const stage = shell.querySelector<HTMLElement>('[data-stage]')!;
  const card = shell.querySelector<HTMLElement>('[data-card]')!;
  const scroller = shell.querySelector<HTMLElement>('[data-scroll]')!;
  const live = shell.querySelector<HTMLElement>('[data-live]')!;
  const pos = shell.querySelector<HTMLElement>('[data-pos]')!;
  const docn = shell.querySelector<HTMLElement>('[data-docn]')!;
  const count = shell.querySelector<HTMLElement>('[data-count]')!;
  const bar = shell.querySelector<HTMLElement>('[data-bar]')!;
  const nextLabel = shell.querySelector<HTMLElement>('[data-next-label]')!;
  const btn = (act: string) => shell.querySelector<HTMLButtonElement>(`[data-act="${act}"]`)!;

  const data = new Map<string, PathData>();
  shell.querySelectorAll<HTMLScriptElement>('.card [data-path]').forEach((el) => {
    const d = JSON.parse(el.textContent ?? '{}') as PathData;
    data.set(d.id, d);
  });
  const ids = [...data.keys()];

  const state = { variant: ids[0], index: -1, swapped: false, timer: 0 as number | 0 };

  const slots = (id: string) => shell.querySelectorAll<HTMLElement>(`.variant-slot[data-variant="${id}"]`);
  const order = () => {
    const d = data.get(state.variant)!;
    return state.swapped && d.swapped ? d.swapped : d.order;
  };

  function render(scroll = true) {
    const d = data.get(state.variant)!;
    const ord = order();
    const total = ord.length;
    const current = state.index >= 0 ? ord[state.index] : 0;

    shell.querySelectorAll<HTMLElement>('.variant-slot').forEach((el) => {
      el.toggleAttribute('data-active', el.dataset.variant === state.variant);
    });
    shell.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.pick === state.variant));
    });

    const [diagramSlot] = [...slots(state.variant)].filter((el) => el.closest('.diagrams'));
    const [cardSlot] = [...slots(state.variant)].filter((el) => el.closest('[data-card]'));

    // Diagram rows: what has happened, what is happening, what is still to come.
    let currentRow: HTMLElement | null = null;
    diagramSlot.querySelectorAll<HTMLElement>('.row[data-n]').forEach((row) => {
      const n = Number(row.dataset.n);
      const p = ord.indexOf(n);
      if (p < 0) return;
      const st = state.index < 0 ? 'todo' : p < state.index ? 'done' : p === state.index ? 'current' : 'todo';
      row.dataset.state = st;
      const hit = row.querySelector('.hit');
      if (st === 'current') {
        hit?.setAttribute('aria-current', 'step');
        currentRow = row;
      } else hit?.removeAttribute('aria-current');
    });
    diagramSlot.querySelectorAll<HTMLElement>('[data-swap]').forEach((b) => b.setAttribute('aria-pressed', String(state.swapped)));

    const step = current ? d.steps[current] : undefined;
    diagramSlot.querySelectorAll<HTMLElement>('.head').forEach((h) => {
      const a = h.dataset.actor;
      h.toggleAttribute('data-active', !!step && (a === step.from || a === step.to));
    });

    // Card: the overview or the current step's detail.
    cardSlot.querySelectorAll<HTMLElement>('.detail').forEach((el) => {
      el.hidden = Number(el.dataset.n) !== current;
    });

    // RSOP's records and Sara's screen, replayed along the path walked so far.
    const recs = clone(d.initialRecords);
    let screen = d.initialScreen;
    const changed = new Set<string>();
    for (let i = 0; i <= state.index; i++) {
      const s = d.steps[ord[i]];
      s.records?.forEach((c) => {
        const table = recs[c.table];
        table[c.key] = { ...(table[c.key] ?? {}), ...c.set };
        if (i === state.index) changed.add(c.key);
      });
      if (s.screen) screen = s.screen;
    }
    const recEl = cardSlot.querySelector<HTMLElement>('[data-records]');
    if (recEl) recEl.innerHTML = renderRecords(recs, changed);
    slots(state.variant).forEach((slot) =>
      slot.querySelectorAll<HTMLElement>('[data-phone] .screen').forEach((sc) => {
        sc.hidden = sc.dataset.s !== screen;
      }),
    );
    shell.querySelectorAll<HTMLElement>(`.variant-slot[data-variant="${state.variant}"] [data-phone]`).forEach((ph) => {
      ph.dataset.screen = screen ?? '';
    });

    // Controls and header.
    pos.textContent = state.index < 0 ? 'Overview' : `Step ${state.index + 1} of ${total}`;
    docn.textContent = docNumbered && current ? `doc step ${current}` : '';
    count.textContent = `${Math.max(state.index + 1, 0)} / ${total}`;
    bar.style.width = `${((state.index + 1) / total) * 100}%`;
    btn('prev').disabled = state.index < 0;
    const atEnd = state.index >= total - 1;
    nextLabel.textContent = state.index < 0 ? 'Start' : atEnd ? 'Replay' : 'Next';
    const playing = !!state.timer;
    btn('play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    btn('play').toggleAttribute('data-playing', playing);

    live.textContent = step
      ? `Step ${state.index + 1} of ${total}: ${
          step.from === step.to ? `inside ${step.fromName}` : `${step.fromName} to ${step.toName}`
        }. ${step.title}.`
      : 'Overview.';

    // URL: a shareable link to this outcome and step.
    const url = new URL(location.href);
    if (ids.length > 1) url.searchParams.set(param, state.variant);
    url.hash = current ? `step-${current}` : '';
    history.replaceState(null, '', url);

    if (scroll) {
      scroller.scrollTop = 0;
      // Beside the card the row can sit mid-stage; under a bottom sheet it has to sit near the top.
      const block = sheet.matches ? 'start' : 'center';
      if (currentRow) (currentRow as HTMLElement).scrollIntoView({ block, behavior: reduced.matches ? 'auto' : 'smooth' });
    }
  }

  // On a phone the sheet starts folded so the intro and picker stay visible; it opens on the first step.
  let foldedForIntro = false;

  function go(index: number) {
    const total = order().length;
    state.index = Math.max(-1, Math.min(index, total - 1));
    if (foldedForIntro && state.index >= 0) {
      foldedForIntro = false;
      setSheet(false);
    }
    render();
  }

  function setSheet(collapsed: boolean) {
    card.classList.toggle('collapsed', collapsed);
    btn('sheet').setAttribute('aria-expanded', String(!collapsed));
    btn('sheet').setAttribute('aria-label', collapsed ? 'Show details' : 'Hide details');
  }

  function stop() {
    if (state.timer) clearInterval(state.timer);
    state.timer = 0;
  }

  function play() {
    if (state.index >= order().length - 1) state.index = -1;
    const tick = () => {
      if (state.index >= order().length - 1) {
        stop();
        render(false);
        return;
      }
      go(state.index + 1);
    };
    state.timer = window.setInterval(tick, PLAY_MS);
    tick();
  }

  function next() {
    if (state.index >= order().length - 1) go(-1);
    else go(state.index + 1);
  }

  btn('next').addEventListener('click', () => {
    stop();
    next();
  });
  btn('prev').addEventListener('click', () => {
    stop();
    go(state.index - 1);
  });
  btn('play').addEventListener('click', () => {
    if (state.timer) {
      stop();
      render(false);
    } else play();
  });
  btn('sheet').addEventListener('click', () => {
    foldedForIntro = false;
    setSheet(!card.classList.contains('collapsed'));
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const hit = target.closest<HTMLElement>('[data-go]');
    if (hit) {
      const p = order().indexOf(Number(hit.dataset.go));
      if (p >= 0) {
        stop();
        go(p);
        setSheet(false);
      }
      return;
    }
    if (target.closest('[data-swap]')) {
      const current = state.index >= 0 ? order()[state.index] : 0;
      state.swapped = !state.swapped;
      if (current) state.index = order().indexOf(current);
      render(false);
      return;
    }
    const pick = target.closest<HTMLElement>('[data-pick]');
    if (pick?.dataset.pick && data.has(pick.dataset.pick)) {
      stop();
      state.variant = pick.dataset.pick;
      state.index = -1;
      state.swapped = false;
      render();
    }
  });

  document.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (e.altKey || e.ctrlKey || e.metaKey || t.closest('input, textarea, select, [contenteditable], [popover]:popover-open')) return;
    const keys: Record<string, () => void> = {
      ArrowRight: () => go(state.index + 1),
      ArrowLeft: () => go(state.index - 1),
      Home: () => go(-1),
      End: () => go(order().length - 1),
    };
    if (keys[e.key]) {
      e.preventDefault();
      stop();
      keys[e.key]();
    }
  });

  // Restore a shared link: ?outcome=…#step-N.
  const params = new URLSearchParams(location.search);
  const wanted = params.get(param);
  if (wanted && data.has(wanted)) state.variant = wanted;
  const m = location.hash.match(/^#step-(\d+)$/);
  if (m) state.index = order().indexOf(Number(m[1]));

  if (sheet.matches && state.index < 0) {
    foldedForIntro = true;
    setSheet(true);
  }

  shell.classList.add('js');
  render(!!m);
}

export function initPlayers() {
  document.querySelectorAll<HTMLElement>('[data-shell]').forEach(initShell);
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { allSteps, problems, walk, type Flow } from '../src/lib/flow.ts';
import { toMermaid } from '../src/lib/mermaid.ts';
import { inquiryFlow } from '../src/data/flows/inquiry.ts';
import { paymentFlow } from '../src/data/flows/payment.ts';
import { scenarios } from '../src/data/flows/what-if.ts';

const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}.mmd`, import.meta.url), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const outcomes = ['exact', 'wrong-amount', 'unknown-id'] as const;
const every: Flow[] = [inquiryFlow, ...outcomes.map(paymentFlow), ...scenarios.map((s) => s.flow)];

test('every flow is internally consistent', () => {
  for (const flow of every) assert.deepEqual(problems(flow), [], flow.id);
});

test('the inquiry flow matches the doc’s Mermaid source line for line', () => {
  assert.deepEqual(toMermaid(inquiryFlow), fixture('inquiry'));
});

test('every payment outcome matches the doc’s Mermaid source line for line', () => {
  for (const o of outcomes) assert.deepEqual(toMermaid(paymentFlow(o)), fixture('payment'), o);
});

test('the doc’s step counts hold: 11 and 21', () => {
  assert.equal(allSteps(inquiryFlow.blocks).length, 11);
  assert.equal(allSteps(paymentFlow('exact').blocks).length, 21);
});

test('each outcome walks the alternative it promises', () => {
  const nums = (f: Flow, swapped = false) => walk(f, swapped).map((s) => s.n);
  assert.deepEqual(nums(paymentFlow('exact')), [1, 2, 3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
  assert.deepEqual(nums(paymentFlow('wrong-amount')), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(nums(paymentFlow('unknown-id'), true), [1, 2, 3, 4, 5, 6, 9, 10, 7, 8]);
});

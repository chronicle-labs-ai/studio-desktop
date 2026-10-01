import assert from 'node:assert/strict';
import test from 'node:test';
import { ESLint } from 'eslint';

const eslint = new ESLint();

async function messages(source, filePath = 'src/lint-fixture.tsx') {
  const [result] = await eslint.lintText(source, { filePath });
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
  return result.messages;
}

async function detects(source, ruleId, severity = 2) {
  const reports = await messages(source);
  assert.ok(
    reports.some((report) => report.ruleId === ruleId && report.severity === severity),
    `${ruleId} did not report: ${JSON.stringify(reports)}`,
  );
}

test('valid typed component and complete effect dependencies pass', async () => {
  assert.deepEqual(await messages(`
    import { useEffect, useState } from 'react';
    export function Counter() {
      const [count, setCount] = useState(0);
      useEffect(() => { document.title = String(count); }, [count]);
      return <button onClick={() => setCount(count + 1)}>{count}</button>;
    }
  `), []);
});

test('conditional hooks and missing dependencies retain error/warning levels', async () => {
  await detects(`
    import { useState } from 'react';
    export function Counter({ enabled }: { enabled: boolean }) {
      if (enabled) useState(0);
      return null;
    }
  `, 'react-hooks/rules-of-hooks');
  await detects(`
    import { useEffect } from 'react';
    export function Counter({ value }: { value: string }) {
      useEffect(() => { document.title = value; }, []);
      return null;
    }
  `, 'react-hooks/exhaustive-deps', 1);
});

test('Fast Refresh still allows constant exports but warns on helper exports', async () => {
  assert.deepEqual(await messages(`
    export const label = 'Counter';
    export function Counter() { return <span>{label}</span>; }
  `), []);
  await detects(`
    export function helper() { return 'label'; }
    export function Counter() { return <span />; }
  `, 'react-refresh/only-export-components', 1);
});

test('TypeScript checks reject any, unused values and require imports', async () => {
  await detects('export const value: any = 1;', '@typescript-eslint/no-explicit-any');
  await detects('const unused = 1;', '@typescript-eslint/no-unused-vars');
  await detects("export const value = require('example');", '@typescript-eslint/no-require-imports');
});

test('removed ban-types restrictions remain enforced, including intersections', async () => {
  for (const type of ['String', 'Boolean', 'Number', 'Symbol', 'BigInt', 'Function', 'Object', '{}']) {
    await detects(`export type Value = ${type};`, '@typescript-eslint/no-restricted-types');
  }
  await detects('export type Value<T> = T & {};', '@typescript-eslint/no-restricted-types');
  await detects('type String = { value: string }; export type Value = String;', '@typescript-eslint/no-restricted-types');
});

test('precision and checks dropped from newer presets remain active', async () => {
  await detects('export const value = 9007199254740993;', 'no-loss-of-precision');
  await detects('export const value = 1;;', 'no-extra-semi');
  await detects('export function run() {\n \treturn 1;\n}', 'no-mixed-spaces-and-tabs');
  await detects('if (Math.random()) { function run() { return 1; } run(); }', 'no-inner-declarations');
  await detects('while (true) { break; }', 'no-constant-condition');
  await detects('class Value {} Value = class {}; export { Value };', 'no-class-assign');
});

test('current recommended checks remain active rather than suppressed', async () => {
  await detects('try { JSON.parse("{}"); } catch (error) { throw new Error(String(error)); }', 'preserve-caught-error');
  await detects('export function run(value: boolean) { value; }', '@typescript-eslint/no-unused-expressions');
});

test('TypeScript coverage and inherited exclusions survive flat config', async () => {
  for (const path of ['src/example.tsx', 'electron/example.ts', 'other-file.ts', 'dist-electron/example.ts']) {
    assert.equal(await eslint.isPathIgnored(path), false, path);
    const reports = await messages('export const value: any = 1;', path);
    assert.ok(reports.some((report) => report.ruleId === '@typescript-eslint/no-explicit-any'), path);
  }
  for (const path of ['dist/example.ts', 'src/dist/example.ts', '.hidden.ts', 'src/.hidden.ts', 'node_modules/example.ts']) {
    assert.equal(await eslint.isPathIgnored(path), true, path);
  }
});

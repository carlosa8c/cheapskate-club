import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

test('SubmitButton component includes type="submit" attribute', () => {
  const __filename = fileURLToPath(import.meta.url);
  const srcPath = new URL('../src/app/submit-button.tsx', import.meta.url);
  const content = readFileSync(srcPath, 'utf8');
  assert.match(content, /type="submit"/);
});

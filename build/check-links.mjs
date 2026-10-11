#!/usr/bin/env node
// Comprueba que los enlaces externos hardcodeados en js/main.js y en el HTML
// generado respondan (2xx/3xx). Pensado para correr a mano o en CI ANTES de
// publicar: un 404 en un enlace de proyecto es el peor caso.
//   node build/check-links.mjs
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sources = ['js/main.js', 'js/navigation.js', 'js/blog-feed.js', 'index.html'];
const urls = new Set();
for (const f of sources) {
  const text = readFileSync(join(ROOT, f), 'utf8');
  for (const m of text.matchAll(/https?:\/\/[^\s'"`)<>\\]+/g)) {
    const u = m[0].replace(/[.,;]+$/, '');
    if (/schema\.org|w3\.org|sitemaps\.org|\$\{/.test(u)) continue;
    urls.add(u);
  }
}
let bad = 0;
for (const url of [...urls].sort()) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'deviannt-link-check/1.0' } });
    const ok = res.status < 400;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${res.status} ${url}`);
    if (!ok) bad++;
  } catch (e) {
    console.log(`FAIL ERR ${url} (${e.message})`);
    bad++;
  }
}
console.log(bad ? `\n${bad} enlace(s) con problemas` : '\nTodos los enlaces responden');
process.exit(bad ? 1 : 0);

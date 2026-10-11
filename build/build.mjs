#!/usr/bin/env node
// =============================================================================
// build/build.mjs — genera index.html, en/index.html, es/index.html y sitemap.xml
//
//   node build/build.mjs          genera/actualiza los archivos
//   node build/build.mjs --check  falla (exit 1) si algo generado está desactualizado
//                                 (útil en CI / pre-commit)
//
// Una sola plantilla (build/index.template.html) + las traducciones de js/i18n.js
// (se leen de ahí mismo, no hay segunda copia) => las tres páginas no pueden
// divergir en canonical, og:url, hreflang, JSON-LD, rutas ni versiones de assets.
// Sin dependencias: solo Node >= 18.
// =============================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const ORIGIN = 'https://deviannt.com';
// lastmod del sitemap: fecha del build (o SITE_LASTMOD=YYYY-MM-DD para fijarla)
const LASTMOD = process.env.SITE_LASTMOD || new Date().toISOString().slice(0, 10);

// ── Traducciones: se leen de js/i18n.js ──────────────────────────────────────
function loadTranslations() {
  const code = readFileSync(join(ROOT, 'js/i18n.js'), 'utf8');
  const sandbox = { window: {}, document: { addEventListener() {} }, localStorage: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.i18n.translations;
}
const T = loadTranslations();

// ── Datos estructurados: UNA definición para las 3 páginas ───────────────────
// Si el blog (blog.deviannt.com) publica su propio JSON-LD de Person, debería usar
// el mismo "@id" y la misma lista knowsAbout para que Google vea una sola entidad.
const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${ORIGIN}/#person`,
  name: 'Annais Molina Fuentes',
  alternateName: ['devianntsec', 'deviannt'],
  jobTitle: 'Offensive Cybersecurity Engineer',
  description: 'Offensive security researcher specializing in vulnerability research, reverse engineering, and exploit development. Author of CVE-2025-55182 (React Server Components RCE, CVSS 10.0) and CVE-2024-51324 (BYOVD kernel primitives).',
  url: ORIGIN,
  email: 'me@deviannt.com',
  image: `${ORIGIN}/assets/images/instagram-pfp.png`,
  sameAs: [
    'https://github.com/devianntsec',
    'https://www.linkedin.com/in/annais-molina-fuentes/',
    'https://blog.deviannt.com',
    'https://links.deviannt.com',
    'https://instagram.com/devianntsec',
    'https://hackerone.com/devianntsec',
    'https://bugcrowd.com/devianntsec',
    'https://app.yeswehack.com/hunters/devianntsec',
    'https://twitter.com/devianntsec',
    'https://t.me/devianntsec'
  ],
  knowsAbout: [
    'Reverse Engineering', 'Exploit Development', 'Vulnerability Research', 'CVE Analysis',
    'React Server Components Security', 'BYOVD', 'Windows Kernel Security',
    'Linux Privilege Escalation', 'Heap Exploitation', 'Patch Diffing', 'Prototype Pollution'
  ],
  knowsLanguage: ['es', 'en'],
  alumniOf: { '@type': 'Organization', name: 'UCAM - Campus Internacional de Ciberseguridad' },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    name: 'Máster en Ciberseguridad',
    credentialCategory: 'degree',
    recognizedBy: { '@type': 'Organization', name: 'UCAM Universidad Católica de Murcia' }
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': ORIGIN }
};

// ── Páginas ──────────────────────────────────────────────────────────────────
//  "/"     = fallback estático (si el Worker no redirige): idioma libre (localStorage/navegador)
//  "/en/"  = inglés explícito (gana sobre el idioma guardado)
//  "/es/"  = español explícito
const PAGES = [
  { file: 'index.html',    lang: 'en', path: '/',    forced: false, priority: '1.0' },
  { file: 'en/index.html', lang: 'en', path: '/en/', forced: true,  priority: '0.8' },
  { file: 'es/index.html', lang: 'es', path: '/es/', forced: true,  priority: '0.8' }
];

const NOSCRIPT = {
  en: 'This site needs JavaScript for its interactive sections. Meanwhile: <a href="https://blog.deviannt.com">blog</a> · <a href="https://github.com/devianntsec">GitHub</a> · <a href="https://www.linkedin.com/in/annais-molina-fuentes/">LinkedIn</a> · <a href="mailto:me@deviannt.com">me@deviannt.com</a>',
  es: 'Este sitio necesita JavaScript para sus secciones interactivas. Mientras tanto: <a href="https://blog.deviannt.com/es/">blog</a> · <a href="https://github.com/devianntsec">GitHub</a> · <a href="https://www.linkedin.com/in/annais-molina-fuentes/">LinkedIn</a> · <a href="mailto:me@deviannt.com">me@deviannt.com</a>'
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const versionCache = new Map();
function assetVersion(p) {
  if (!versionCache.has(p)) {
    const abs = join(ROOT, p);
    if (!existsSync(abs)) throw new Error(`Asset no encontrado: ${p}`);
    const hash = createHash('sha1').update(readFileSync(abs)).digest('hex').slice(0, 8);
    versionCache.set(p, `${p}?v=${hash}`);
  }
  return versionCache.get(p);
}

const template = readFileSync(join(ROOT, 'build/index.template.html'), 'utf8');

function render(page) {
  const tr = T[page.lang];
  const get = (k) => {
    if (tr[k] === undefined) throw new Error(`Falta la traducción "${k}" (${page.lang})`);
    return tr[k];
  };
  const canonical = ORIGIN + page.path;
  const vars = {
    lang: page.lang,
    defaultLang: page.lang,
    forced: String(page.forced),
    forcedComment: page.forced
      ? `true: esta URL es explícitamente ${page.path}, gana sobre cualquier idioma guardado.`
      : 'false: raíz "/" servida como fallback estático; i18n.js puede usar localStorage/navigator.language.',
    canonical,
    ogUrl: canonical,
    enActive: page.lang === 'en' ? ' active' : '',
    esActive: page.lang === 'es' ? ' active' : '',
    flag: page.lang === 'en' ? '🇬🇧' : '🇪🇸',
    flagLabel: page.lang === 'en' ? 'Switch to Spanish' : 'Switch to English',
    noscript: NOSCRIPT[page.lang],
    jsonld: JSON.stringify(PERSON, null, 2).replace(/<\//g, '<\\/')
  };

  let out = template
    .replace(/\{\{t:([\w.]+)\}\}/g, (_, k) => esc(get(k)))
    .replace(/\{\{th:([\w.]+)\}\}/g, (_, k) => get(k))
    .replace(/\{\{v:([^}]+)\}\}/g, (_, p) => assetVersion(p))
    .replace(/\{\{(\w+)\}\}/g, (_, k) => {
      if (!(k in vars)) throw new Error(`Variable de plantilla sin definir: ${k}`);
      return vars[k];
    });
  if (/\{\{/.test(out)) throw new Error('Quedaron placeholders sin resolver en ' + page.file);
  return out;
}

function sitemap() {
  const alts = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}/en/" />`,
    `    <xhtml:link rel="alternate" hreflang="es" href="${ORIGIN}/es/" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/" />`
  ].join('\n');
  const urls = PAGES.map(p => `  <url>
    <loc>${ORIGIN}${p.path}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${p.priority}</priority>
${alts}
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

// ── Escritura / verificación ─────────────────────────────────────────────────
const outputs = PAGES.map(p => [p.file, render(p)]);
let stale = 0;
const sitemapPath = 'sitemap.xml';
const sitemapNew = sitemap();

for (const [file, content] of [...outputs, [sitemapPath, sitemapNew]]) {
  const abs = join(ROOT, file);
  const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
  // En --check el sitemap se compara ignorando lastmod (cambia en cada build).
  const norm = (s) => (file === sitemapPath && s) ? s.replace(/<lastmod>[^<]+<\/lastmod>/g, '<lastmod/>') : s;
  if (CHECK) {
    if (norm(current) !== norm(content)) { console.error(`DESACTUALIZADO: ${file}`); stale++; }
  } else if (current !== content) {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    console.log(`escrito: ${file}`);
  } else {
    console.log(`sin cambios: ${file}`);
  }
}
if (CHECK) {
  if (stale) { console.error('Ejecuta: node build/build.mjs'); process.exit(1); }
  console.log('OK: todo está al día.');
}

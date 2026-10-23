import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugs = ['business', 'company', 'compliance', 'news', 'recruit', 'achievements', 'blog', 'message'];
const documents = ['index.html', ...slugs.map(slug => `${slug}/index.html`)];
let references = 0;
for (const relative of documents) {
  const file = path.join(root, relative);
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /<body class="dark-page/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${relative}: must have one h1`);
  assert.doesNotMatch(html, /data-coming-soon|proposal-route-bar|class="light-page"/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${relative}: duplicate id`);
  for (const [, value] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(value)) continue;
    const url = new URL(value, `https://site.invalid/${relative}`);
    let target = path.join(root, decodeURIComponent(url.pathname));
    assert(fs.existsSync(target), `${relative}: missing ${value}`);
    if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    assert(fs.existsSync(target), `${relative}: missing index for ${value}`);
    if (url.hash) {
      const contents = fs.readFileSync(target, 'utf8');
      assert(contents.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${relative}: missing anchor ${value}`);
    }
    references++;
  }
  if (relative !== 'index.html') {
    const slug = relative.split('/')[0];
    assert.match(html, new RegExp(`href="../${slug}/" aria-current="page"`));
    assert(html.includes('class="breadcrumb"'), `${relative}: missing breadcrumbs`);
  }
}
for (const script of ['js/main.js', 'scripts/build-pages.mjs', 'scripts/preview-server.mjs']) execFileSync(process.execPath, ['--check', path.join(root, script)]);
JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
console.log(`PASS: ${documents.length} pages; ${references} local assets, links and anchors; unique headings and IDs; active navigation; JavaScript syntax.`);

'use strict';
// Regenerates every deck's shared files from the repo root:
//   kits/<style>/assets/* -> decks/<deck>/<slidesDir>/style/   (via `fslides kit use`)
//   logos/*               -> decks/<deck>/<slidesDir>/logos/
// Both are gitignored in the decks. Runs on `npm install` (postinstall) and `npm run sync`.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const cli = path.join(path.dirname(require.resolve('fslides/package.json')), 'bin', 'cli.js');
const decksDir = path.join(root, 'decks');

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function deckConfig(dir) {
  return ['fslides.config.js', 'fuckslides.config.js'].map(f => path.join(dir, f)).find(p => fs.existsSync(p));
}

function sync(deck) {
  const dir = path.join(decksDir, deck);
  const cfg = deckConfig(dir);
  if (!cfg) return;
  const text = fs.readFileSync(cfg, 'utf8');
  const style = (/^\s*style:\s*['"]([^'"]+)['"]/m.exec(text) || [])[1];
  const slidesDir = path.join(dir, (/slidesDir:\s*['"]([^'"]+)['"]/.exec(text) || [, 'slides'])[1]);
  if (style) {
    const kit = path.join(root, 'kits', style);
    if (!fs.existsSync(kit)) throw new Error(`${deck}: style "${style}" has no kits/${style}`);
    execFileSync(process.execPath, [cli, 'kit', 'use', kit], { cwd: dir, stdio: 'pipe' });
  }
  const logos = path.join(root, 'logos');
  if (fs.existsSync(logos)) copyDir(logos, path.join(slidesDir, 'logos'));
  console.log(`  synced ${deck}${style ? ' (style: ' + style + ')' : ''}`);
}

const only = process.argv[2];
for (const d of fs.readdirSync(decksDir)) {
  if (only && d !== only) continue;
  if (fs.statSync(path.join(decksDir, d)).isDirectory()) sync(d);
}

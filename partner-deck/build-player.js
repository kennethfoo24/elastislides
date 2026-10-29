'use strict';

const fs   = require('fs');
const path = require('path');

const cwd    = process.cwd();
const config = require(path.join(cwd, 'fuckslides.config.js'));
// resolve fslides from local node_modules (after npm ci) or fall back to global
let pkgDir;
try { pkgDir = path.dirname(require.resolve('fslides/package.json')); }
catch (_) { pkgDir = path.join(path.dirname(require.resolve('fslides')), '..'); }
const out    = path.join(cwd, (config.name || 'presentation') + '.html');

const fsJs   = fs.readFileSync(path.join(pkgDir, 'js', 'fuckslides.js'), 'utf8');
// Inline the logo only if it's icon-sized — never bloat the player with a
// full-resolution asset (the nav renders it at ~24px).
const logoPath = path.join(pkgDir, 'logo.png');
const logoDat  = fs.existsSync(logoPath) && fs.statSync(logoPath).size < 100 * 1024
  ? 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64')
  : '';

let html = fs.readFileSync(path.join(pkgDir, 'player.html'), 'utf8');

// Inject config — no FUCKSLIDES_EXPORT, no FUCKSLIDES_CONTENTS, so the player
// loads each slide as iframe.src (relative URL) from the same deployed directory.
const notesPath = path.join(cwd, 'notes.json');
const notesDat  = fs.existsSync(notesPath) ? fs.readFileSync(notesPath, 'utf8') : '{}';

// Voice-over recordings: map slide -> relative URL, deployed as static files.
// One per slide; if multiple extensions exist, newest mtime wins.
const AUDIO_EXTS = ['.webm', '.m4a', '.mp3', '.ogg', '.wav', '.mp4'];
const recDir = path.join(cwd, 'recordings');
const recordings = {};
if (fs.existsSync(recDir)) {
  const best = {};
  for (const f of fs.readdirSync(recDir)) {
    const ext = path.extname(f).toLowerCase();
    if (!AUDIO_EXTS.includes(ext)) continue;
    const base = path.basename(f, ext);
    const mtime = fs.statSync(path.join(recDir, f)).mtimeMs;
    if (!best[base] || mtime > best[base].mtime) best[base] = { file: f, mtime };
  }
  for (const base of Object.keys(best)) recordings[base + '.html'] = 'recordings/' + best[base].file;
}

// repo for the comments panel (config.repo or git remote)
let repo = config.repo || null;
if (!repo) {
  try {
    const remote = require('child_process').execSync('git remote get-url origin', { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();
    const m = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (m) repo = m[1] + '/' + m[2];
  } catch (_) {}
}

const snippet = `<script>
window.FUCKSLIDES_SLIDES   = ${JSON.stringify(config.slides)};
window.FUCKSLIDES_LABELS   = ${JSON.stringify(config.labels || config.slides.map(s => s.replace('.html', '')))};
window.FUCKSLIDES_NAME     = ${JSON.stringify(config.name || 'presentation')};
window.FUCKSLIDES_TITLE    = ${JSON.stringify(config.title || config.name || 'presentation')};
window.FUCKSLIDES_DISABLED = ${JSON.stringify(config.disabled || [])};
window.FUCKSLIDES_DENSITY  = ${JSON.stringify(config.density || null)};
window.FUCKSLIDES_NOTES    = ${notesDat};
window.FUCKSLIDES_RECORDINGS = ${JSON.stringify(recordings)};
window.FUCKSLIDES_REPO       = ${JSON.stringify(repo)};
</script>`;

html = html.replace('</head>', snippet + '\n</head>');
html = html.replace('let allNotes  = {};', 'let allNotes  = window.FUCKSLIDES_NOTES || {};');
html = html.replace(/<title>[^<]*<\/title>/i, `<title>${config.title || config.name || 'Presentation'}</title>`);
html = html.replace(/<script src="\/js\/fuckslides\.js"><\/script>/g, `<script>${fsJs}</script>`);
if (logoDat) html = html.replace(/src="\/logo\.png"/g, `src="${logoDat}"`);
else html = html.replace(/<img class="nav-logo"[^>]*>/g, '');

fs.writeFileSync(out, html, 'utf8');

// Slides load the runtime from js/fuckslides.js (relative, so it resolves inside
// this deck's folder on GitHub Pages; fslides serve answers the same URL itself).
fs.mkdirSync(path.join(cwd, 'js'), { recursive: true });
fs.writeFileSync(path.join(cwd, 'js', 'fuckslides.js'), fsJs, 'utf8');
const size = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`\n  ✓  Built player → ${path.relative(cwd, out)}  (${size} KB)\n  Deploy alongside slide files — assets loaded from relative URLs.\n`);

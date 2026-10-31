# Elastislides

HTML slide decks in the Elastic web style, built with fslides and published to GitHub Pages (https://kennethfoo24.github.io/elastislides/). The only deck so far is `partner-deck/`.

## Layout

- `partner-deck/*.html`: one file per slide. Each is a standalone 1280×720 page.
- `partner-deck/fuckslides.config.js`: slide order (`slides`) and menu names (`labels`). Adding a slide means adding it to both arrays at the same index.
- `partner-deck/notes.json`: speaker notes, keyed by slide file name. Notes are short `- ` bullet lines.
- `partner-deck/style/eweb.css`: the base design system (colours, type, entrance animations). `style/partner.css`: shared deck pieces (`.cols3`, `.sol`, `.pts`/`.pt`, `.deploy`, `.why`). `style/eweb.js`: the `EW` helpers (`EW.el`, `EW.loop`, `EW.iso`, `EW.dots`, `EW.MARK`).
- `partner-deck/logos/`: icons and logos (`sol-*` solutions, `dep-*` deployment types, `src-*` data sources, competitors).
- `partner-deck/source/`: reference PDFs the slides are based on. Gitignored and never deployed; slides take their content and inspiration from here.
- `partner-deck/partner-deck.html` and `partner-deck/js/fuckslides.js` are build output (gitignored).

## Writing a slide

Copy the shape of an existing slide:

```html
<link rel="stylesheet" href="style/eweb.css">
<link rel="stylesheet" href="style/partner.css">
<style>/* slide-specific CSS, minified one rule per line */</style>
<body data-foot="">
  <div class="z"><div class="eyebrow in1">Section</div><h1 class="in2">Plain text <span class="b">blue part.</span></h1></div>
  ...
<script src="style/eweb.js"></script>
<script src="js/fuckslides.js"></script>
```

- Use the CSS variables (`--blue`, `--ink`, `--grey`, `--line`, `--sans`, `--mono`, ...) rather than raw colours, except inside SVG drawing code.
- Stagger entrances with `in1`…`in6`. Titles put the second half in `<span class="b">` for blue.
- Position main blocks absolutely inside the 1280×720 body (72px side margins; the footer sits at the bottom 26px).
- Keep slide copy short. The user prefers few words and a visual that explains the idea at a glance.

## Run and check

```bash
cd partner-deck && npm install && npx fslides serve   # http://localhost:3021/partner-deck.html
```

A single slide also opens fine from any static server (`python3 -m http.server` in `partner-deck/`). When screenshotting with headless Playwright, entrance animations may not have run yet: call `document.getAnimations().forEach(a => a.finish())` first.

## Deploy

Pushing to `main` runs `.github/workflows/` which does `npm ci && npm run export` in `partner-deck/` and publishes to GitHub Pages (excluding `node_modules` and `source`).

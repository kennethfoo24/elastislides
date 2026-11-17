# Elastislides

HTML slide decks in the Elastic web style, built with fslides and published to GitHub Pages (https://kennethfoo24.github.io/elastislides/). Decks live in `decks/`, shared design kits in `kits/`. Decks so far: `decks/partner-deck/` and `decks/observability-deck/`. The observability deck is a faithful rebuild of a source PDF: each slide is an absolutely positioned 1280x720 page (converted vector shapes, text and the PDF's own images in `img/`), animated with `obs.js` helpers (`OBS.show`, `OBS.draw`, `OBS.travel`, `OBS.tour`). Slides 7 to 17 spotlight real Kibana screenshots in step with each bullet; slide 18 is a hand-built vector flow with agent icons.

## Repo layout

- `decks/<name>/`: one deck per folder, holding only its slides, `notes.json`, config and `source/`. Published at `/<name>/` on GitHub Pages. No `package.json` or `node_modules` per deck: fslides is installed once at the root.
- `kits/<name>/`: design kits, the single source for styles and skills (`style.json`, `SKILL.md`, `assets/`, `slides/`). **Edit a kit here, never inside a deck.** `kits/elastic-web/` was seeded from elastic/observability-team `collaterals/fslides-styles/elastic-web`; its `assets/` also holds the shared components `partner.css` and `deep.js`. Its brief is linked at `.claude/skills/fslides-style-elastic-web`, so read it before writing slides.
- `logos/`: every logo and icon, shared by all decks.
- `tools/`: `build-player.js` (builds a deck's player and injects the slide picker), `picker.js`/`picker.css`, `sync.js`.
- `scripts/`: the shell wrappers behind the npm scripts.

**Generated, gitignored, never edit:** each deck's `style/` (from its kit) and `logos/` (from root `logos/`), `.claude/`, `js/` and the built `<name>.html`. `npm install` at the root regenerates them via `tools/sync.js`; run `npm run sync` after editing a kit or `logos/`. A deck picks its kit with `style: '<kit>'` in its config.

Commands, from the repo root:
- `npm install`: install fslides and sync every deck.
- `npm run serve -- <deck>`: stock fslides player with live reload (no picker; the picker is only in the built player). `npm run build -- <deck>`: build the player html with the picker.
- `npm run new-deck -- <name> [kit]`: new deck from a kit.

## partner-deck layout (decks/partner-deck/)

- `decks/partner-deck/*.html`: one file per slide. Each is a standalone 1280×720 page.
- `decks/partner-deck/fuckslides.config.js`: slide order (`slides`) and menu names (`labels`). Adding a slide means adding it to both arrays at the same index.
- `decks/partner-deck/notes.json`: speaker notes, keyed by slide file name. Notes are short `- ` bullet lines.
- `style/eweb.css`: the base design system (colours, type, entrance animations). `style/partner.css`: shared deck pieces (`.cols3`, `.sol`, `.pts`/`.pt`, `.deploy`, `.why`). `style/eweb.js`: the `EW` helpers (`EW.el`, `EW.loop`, `EW.iso`, `EW.dots`, `EW.MARK`). All three are generated from `kits/elastic-web/assets/`.
- `logos/` (generated from the root `logos/`): icons and logos (`sol-*` solutions, `dep-*` deployment types, `src-*` data sources, competitors).
- `decks/partner-deck/source/`: reference PDFs the slides are based on. Gitignored and never deployed; slides take their content and inspiration from here.
- `tools/picker.js` + `picker.css`: the slide picker (checkboxes in the overview, "Present selected"). `tools/build-player.js` injects them into the player; the selection is stored in the browser's localStorage and drives the player's own skip list (`disabled`).
- `partner-deck.html` and `js/fuckslides.js` in the deck folder are build output (gitignored).

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
npm install && npm run serve -- partner-deck   # http://localhost:3021/partner-deck.html
```

A single slide also opens fine from any static server (`python3 -m http.server` in `decks/partner-deck/`). When screenshotting with headless Playwright, entrance animations may not have run yet: call `document.getAnimations().forEach(a => a.finish())` first.

## Deploy

Pushing to `main` runs `.github/workflows/` which runs `npm ci` at the root (the postinstall syncs kits and logos), builds every `decks/*/` with `tools/build-player.js`, and publishes to GitHub Pages (excluding `source`).

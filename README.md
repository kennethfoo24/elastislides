# Elastislides

HTML slide decks built with [fslides](https://www.npmjs.com/package/fslides) in the Elastic web style.

| Deck | Description |
|------|-------------|
| [partner-deck](partner-deck/) | Elastic for Partners: Search, Observability and Security |

Live: https://kennethfoo24.github.io/elastislides/

## Run a deck locally

```bash
cd partner-deck
npm install
npx fslides serve      # http://localhost:3021/partner-deck.html
```

`npx fslides pdf` exports a PDF (run `npm approve-scripts puppeteer` first so the PDF browser can install).

## Publishing

Every push to `main` builds the player with `npm run export` and deploys to GitHub Pages.

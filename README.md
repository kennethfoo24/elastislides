# Elastislides

HTML slide decks built with [fslides](https://www.npmjs.com/package/fslides) in the Elastic web style.

Live: https://kennethfoo24.github.io/elastislides/

| Deck | Description |
|------|-------------|
| [partner-deck](partner-deck/) | Elastic for Partners: Search, Observability and Security |

## Partner deck

The deck introduces the Elastic platform to partners, then makes the case for Elastic and ends with how pricing works.

| # | Slide | File |
|---|-------|------|
| 1 | Hero | `hero.html` |
| 2 | Search Is Everywhere | `phones.html` |
| 3 | Cover | `cover.html` |
| 4 | The Platform | `platform.html` |
| 5 | Deployment Options | `deployment.html` |
| 6 | Three Solutions | `solutions.html` |
| 7 | Analyst Recognition | `analysts.html` |
| 8 | Features | `features.html` |
| 9 | Features in Action | `in-action.html` |
| 10 | Personas | `personas.html` |
| 11 | Use Cases | `use-cases.html` |
| 12 | Competitive Landscape | `competitive.html` |
| 13 | Reasons to Upgrade | `upgrade.html` |
| 14 | So, Why Elastic? | `so-why.html` |
| 15 | Why Elastic · Unified | `why-unified.html` |
| 16 | Why Elastic · AI-Driven | `why-ai.html` |
| 17 | Why Elastic · Cost | `why-cost.html` |
| 18 | Thank You | `thank-you.html` |
| 19 | Pricing · What to Size | `sizing.html` |
| 20 | Pricing · Deployment Models | `pricing.html` |

The two pricing slides come after Thank You, as backup for pricing questions:

- **What to Size** ("One platform, one license"): Search & AI, Observability and Security on one platform, sized by two questions: how much data per day, and how long you keep it.
- **Elastic Licensing Models**: the same usage charted three times to show what you pay for on Self-managed (a yearly license for your peak, per 64 GB of RAM), Elastic Cloud Hosted (the size you run, billed hourly) and Serverless (exactly what you use).

Speaker notes for every slide are in `partner-deck/notes.json`.

## Run a deck locally

```bash
cd partner-deck
npm install
npx fslides serve      # http://localhost:3021/partner-deck.html
```

`npx fslides pdf` exports a PDF (run `npm approve-scripts puppeteer` first so the PDF browser can install).

## Publishing

Every push to `main` builds the player with `npm run export` and deploys to GitHub Pages.

# designfolio

Ayush Jain's portfolio: a product case study (Leetify) plus the three concept sites it shows.
Everything here is plain static HTML/CSS/JS — no build step, no dependencies.

| Path | Site | What it is |
| --- | --- | --- |
| `/` | **Portfolio** | Intro, Leetify first, three concept sites, how we work, enquiry draft (mailto) |
| `/leetify/` | **Leetify case study** | The real product: problem, principle, decisions, launch and growth |
| `/work/<site>/` | **Concept case studies** | One per concept site: brief, flow, decisions, dropped directions, what I’d measure |
| `/elsewhere/` | **Elsewhere** | Fictional two-day music & arts festival · programme, passes, demo checkout |
| `/second-nature/` | **Second Nature** | Fictional architecture & interiors studio · scroll-driven room transformation, project studies, enquiry brief |
| `/side-note/` | **Side Note** | Fictional coffee brand · coffee finder, brew guide, bag + demo checkout |

The three concept sites are self-initiated studies for fictional businesses. Their
forms, carts and checkouts are front-end demos only — nothing is sent, stored,
charged or reserved. Artwork was generated from a reference-led art direction.

## Working on it

Any static server works, e.g. from the repo root:

```sh
python3 -m http.server 8000
# → http://localhost:8000/            portfolio
# → http://localhost:8000/elsewhere/  etc.
```

Each site is one folder: `index.html`, `styles.css`, `app.js`, `assets/`.
Fonts are self-hosted (woff2 in each site's `assets/fonts/`); everything is local
and relative, so the folders can be moved or hosted independently.

The portfolio and its case-study pages use two families: Newsreader (variable,
with optical sizes, so the same file sets both headings and running text) and
Schibsted Grotesk for interface text — labels, links, form controls. Caveat is
kept for a single pencil note on the opening collage. The Latin subsets lack the
rupee sign, so `*-rupee.woff2` are one-glyph subsets declared with
`unicode-range: U+20B9`.

## Site captures on the portfolio

The portfolio shows a phone capture of each concept site next to its paper-collage world (`assets/shots/`, `assets/world-*.webp`); the case-study pages use the laptop captures.
After changing a site's first screen, regenerate them (needs Python Playwright + Pillow):

```sh
python3 -m http.server 8766 &
python3 tools/capture.py        # laptop + phone openings for the homepage
python3 tools/capture_flows.py  # flow screens for the concept case studies
```

## Deploying

Hosted on GitHub Pages. Every push to `main` runs `.github/workflows/pages.yml`, which
uploads the repo as-is and deploys it — no build step.

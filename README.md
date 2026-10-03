# designfolio

Ayush Jain's portfolio: a product case study (Leetify) plus the three concept sites it shows.
Everything here is plain static HTML/CSS/JS — no build step, no dependencies.

| Path | Site | What it is |
| --- | --- | --- |
| `/` | **Portfolio** | Intro, Leetify first, three concept sites, how we work, enquiry draft (mailto) |
| `/leetify/` | **Leetify case study** | The real product: problem, principle, decisions, launch and growth |
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
Fonts load from Google Fonts; everything else is local and relative, so the
folders can be moved or hosted independently.

## Site captures on the portfolio

The portfolio shows a laptop and phone capture of each concept site (`assets/shots/`).
After changing a site's first screen, regenerate them (needs Python Playwright + Pillow):

```sh
python3 -m http.server 8766 &
python3 tools/capture.py
```

## Deploying

Hosted on GitHub Pages. Every push to `main` runs `.github/workflows/pages.yml`, which
uploads the repo as-is and deploys it — no build step.

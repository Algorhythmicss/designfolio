# Designfolio — decisions, state and what's next

Working notes for whoever picks this up next (Ayush, or an assistant working with him).
Last updated 7 October 2026.

## What this is

Ayush Jain's portfolio, positioned as **product designer & engineer**: one shipped
product (Leetify) as the centrepiece, three self-initiated concept websites as
brand & web work, a "how we'll work together" section linked to a separate pricing page, and a contact
section with an email-draft form.

- Live: https://algorhythmicss.github.io/designfolio/
- Repo: github.com/Algorhythmicss/designfolio (`main`, GitHub Pages via Actions)
- Local clone on the Mac: `~/Desktop/DESIGN/designfolio` (keep in sync with `git pull --ff-only`)
- Owner: Ayush Jain · GitHub `Algorhythmicss` · X `@algorhythmicass` · Instagram `@ayushhhuh` · ayushhhudd@gmail.com · Physics at IITK; founding software engineer at startups
- Leetify: https://leetify-dun.vercel.app · Chrome Web Store id `efdidgeaehmaiobeldfiomlnhjnneghl`

## Repo map

```
index.html / styles.css / app.js      portfolio (buildless, no framework)
assets/                               fonts/, shots/ (site captures), world-*.webp (paper islands),
                                      opening-world.webp (closing art), making-connections.webp (hero art), og.jpg
leetify/index.html + assets/          Leetify case study (workspace, analytics, original, landing captures)
work/case.css                         shared stylesheet for every case-study page and 404
work/{elsewhere,second-nature,side-note}/   concept case studies + their flow captures
elsewhere/ second-nature/ side-note/  the three concept sites, each self-contained with its own fonts
tools/capture.py                      homepage captures (laptop + phone openings) → assets/shots/
tools/capture_flows.py                flow screens for the concept case studies → work/<site>/assets/
tools/diagrams.py                     inline SVG flow strips + the Leetify "five tabs" diagram
404.html, sitemap.xml, robots.txt, .nojekyll, .github/workflows/pages.yml
```

Serve locally with `python3 -m http.server 8766` from the repo root. Everything is
relative, so each site folder can be hosted on its own.

## Deploy

Push to `main` → the Pages workflow uploads the repo root and deploys (usually
under a minute). Pages source must stay on **GitHub Actions** (set once in repo
settings). Verify on the live URL with a cache-busting query (`?t=<sha>`), then
`git pull --ff-only` in the Mac clone.

Commits are authored as `Ayush Jain <Algorhythmicss@users.noreply.github.com>`.

## Design system (portfolio + case pages)

Tokens in `:root` of `styles.css` and `work/case.css`:
`--paper #f3efdf · --ink #292820 · --muted #64645b · --red #a64431 · --blue #214ebe · --line #aaa799`

**Type — two families, one accent.**
- `Newsreader` (variable, weight 200–800 **and optical size 6–72**) sets everything
  that is read: the headline, section headings, project titles, prices, running text.
  Because of the opsz axis the same file gives a crisp display cut at 46–54px and a
  text cut at 17–19px. Instrument Serif was retired so two serifs no longer compete.
- `Schibsted Grotesk` (variable) for interface text: nav, labels, meta lines,
  secondary links, form controls, buttons, footer.
- `Caveat` (handwriting) is used in exactly two places: the pencil note "Come have a
  look" on the opening collage, and the **closing section** (heading "What are you
  thinking?", the email, "Or start with a few details") — Ayush asked for that
  section to go back to the handwritten style. Nowhere else; wherever it is used,
  nothing in a conflicting style sits next to it.
- Fonts are self-hosted woff2 under `assets/fonts/`. The Latin subsets lack ₹, so
  `newsreader-rupee.woff2` and `schibsted-grotesk-rupee.woff2` are one-glyph subsets
  declared with `unicode-range: U+20B9`. **Their `@font-face` descriptors must match
  the main faces exactly** (same weight range, style), or Chrome picks the one-glyph
  face for ordinary text and falls back to a system font.

**Scale (desktop → phone):** h1 clamp(40px,3.7vw,54px) → 37px · section h2 40 → 32 ·
project titles 46 → 36 (red) · one-line thought 22 italic → 19 · body 17–19 ·
prices 25 → 22 · UI 13–15.

**Components:** form choices are outlined pill chips (red border + text when
checked); submit is a filled ink pill; secondary links are underlined sans at 15px;
primary per-project link is serif italic red at 20px.

## Page structure and the decisions behind it

1. **Opening** — collage art (hands, ribbon, spool), headline "I design and build
   *products people use.*" (second line italic blue, kept deliberately), two short
   paragraphs (Leetify + 20,000 users; IIT Kanpur physics; founding engineer; "the
   backend is as current as the front"), a disclosure "And the website that sells
   it…", and the handwritten "Come have a look". Art is full width (was zoomed in
   before; keep it zoomed out).
2. **A few things I've made** — four "stops", each composed on its own on a
   12-column grid (no repeating two-column blocks, which Ayush disliked):
   - Leetify: real screens (workspace + analytics card) wide-left, words low-right.
   - Elsewhere / Second Nature / Side Note: a cut-out **paper world** from the
     original "three worlds" artwork (`assets/world-festival|room|coffee.webp`,
     transparent WebP) with the site's phone capture tucked into it at a slight
     tilt. The laptop captures are now only used on the case pages.
   - Copy per stop is deliberately minimal: title, **one sentence on the thought**,
     "Case study" (primary) and "Open the website". All detail lives on the case pages.
   - A dotted "thread" that linked the four stops was built and then **removed at
     Ayush's request** (see commit `e853498` for the version with it, if ever wanted).
   - Order and framing: Leetify first (real, shipped); the disclosure line under the
     section says the concept sites are self-initiated work for fictional businesses
     and their forms/checkouts are demos. Keep that honesty line.
3. **How we'll work together** — four steps (conversation → flows & direction →
   build in small pieces → launch, then after), then **What it costs**:
   - A landing page · ~2 weeks · from ₹45,000 · abroad from $1,200
   - A website (3–6 pages, identity, search basics) · 3–5 weeks · from ₹1,20,000 · $3,000
   - A product (app/extension/MVP end to end) · 4–8 weeks · from ₹2,50,000 · $6,000
   - Terms: fixed price agreed before start; half up front, half at launch; smaller
     things by the day ₹8,000 / $250; "Not sure which one you need? Send me the brief
     and I'll tell you the same day."
   - Both currencies are shown on purpose (audience is split India / abroad). Prices
     are starting points; raise after the first two or three paid projects. Never write
     "student" or "introductory".
   - Note line: based in Kanpur, works remotely with teams anywhere.
4. **Closing / contact** — handwritten "What are you thinking?", the email large and
   handwritten (49px desktop, 34px phone; it was 64px, then reduced), the paper-world
   collage, and a disclosure that opens the enquiry form. The intro line "Tell me
   about your product…" was removed.
   - Form: project type chips (A landing page / A website or shop / A product or app /
     Still figuring it out) → name → what it should do → **budget range chips**
     (Under ₹50k · $1.5k / ₹50k–1.5 lakh · $1.5–4k / Above ₹1.5 lakh · $4k / Not sure
     yet) → timing. It builds an editable email draft and opens the mail app; nothing
     is sent from the page. A WebMCP tool `prepare_project_enquiry` mirrors it.
5. **Footer** — name, GitHub, X, Instagram, "About these projects" dialog (what is
   real, what is fictional, that the art was made with generative tools from a
   reference-led direction). **No LinkedIn** by choice.

## Leetify content (facts as given by Ayush)

- Chrome extension that turns a Codeforces problem into one LeetCode-style
  workspace: statement, editor, tests, submit on one page. Free, no account.
- 20,000 users, rated 4.3 on the Chrome Web Store. Design, engineering and launch solo.
- Growth: first thousand from Codeforces blog posts, LinkedIn posts and Instagram
  comments; then a creator (hannin.dev) posted an unpaid reel on **3 July 2026**
  (https://www.instagram.com/reel/DaU_8UaT0FU/) — 800,000+ views, 24.1k likes,
  20.1k shares, 27.7k saves — and it went from ~1,000 to 20,000 in about three months.
  No growth chart exists, so it is told in words plus a stats strip.
- What users asked for and what shipped: code-editor capabilities in the coding
  panel, **customisable** preset templates, notes attached to problems, analytics
  (streaks, heatmap, difficulty distribution, "why not the next rating yet").
  Version 0.1.8 details are listed on the page.
- Screenshots on the page are to be **left as they are**.
- Still placeholders (HTML comments in `leetify/index.html`): start month/year and
  stack; weekly actives/retention and two or three user quotes.

## Concept sites (brands are separate from the portfolio's type system)

- **Elsewhere** — festival site (programme filters, pass comparison, demo checkout).
  Own fonts. Phone pass done (header positioning, text shadow on the encounters scene).
- **Second Nature** — interior studio; scroll-driven old→new room. On phones the
  scroll scrub was messy, so ≤650px it switches to an IntersectionObserver reveal
  with a visible state chip and manual controls. Footer credits "A design study by
  Ayush Jain" linking to the portfolio.
- **Side Note** — coffee shop; three-question finder, configurator, bag. Handwriting
  reduced to four accents; hero recomposed with the art centred; "Make a little room
  for coffee" headline treatment fixed. Footer links to the portfolio.
- All images are WebP; "draft" wording removed everywhere; the ChatGPT-export
  `.openai/` folders and nested `.git` folders were dropped.

## Case-study pages

- `leetify/` — problem (five tabs diagram), principle + rules, key decisions,
  "shipping what users asked for", launch & growth with the reel stats, results,
  learnings; links back home and on to Elsewhere.
- `work/<site>/` — kicker, title, standfirst, facts (what it is / the flows / what I
  did / status / link), laptop capture, brief, flow diagram + numbered flow, flow
  screens, key decisions, directions dropped, what I'd measure if it were live, an
  honesty boundary line, prev/next footer.
- Regenerate captures with `tools/capture.py` and `tools/capture_flows.py` (server on
  :8766, Playwright + Pillow); diagrams come from `tools/diagrams.py`.

## Search and sharing

`sitemap.xml` (8 URLs), `robots.txt`, canonical link, JSON-LD Person on the homepage,
Open Graph + Twitter card with `assets/og.jpg` (a 1200×630 capture of the current
hero — regenerate after visual changes to the opening), custom `404.html` in the
house style. Title: "Ayush Jain — Product designer & engineer".

## Pending — needs Ayush

1. **Form endpoint** — a Formspree/Basin (or similar) URL so the form posts to the
   inbox instead of opening a mail draft, plus a thank-you state.
2. **Book-a-call / WhatsApp** — a Cal.com/Calendly link and/or a wa.me number for the
   contact section.
3. **Quotes** — one or two real lines from Leetify users or the reel creator, with
   permission, for the Leetify page and the homepage.
4. **Leetify's own footer** — should read "by Ayush Jain" and link to the portfolio;
   Ayush says it's done, but the live page still showed "by Algorhythmicss" at the
   last check (possibly a stale deploy).
5. **Optional** — custom domain (add CNAME, update canonical/og/sitemap URLs); a launch
   post about Leetify for X; the Leetify placeholders above; the favicon is still the
   export's dark/lime mark and could be redrawn in the paper/red palette; privacy-light
   analytics (Plausible/GoatCounter) if he wants numbers; review that the four "how we
   work" steps and timelines read true.

Pricing (item 3 of the original list) is done; LinkedIn was consciously left out.

## Working notes for an assistant

- Verify every change at 1440×900 and 390×844 (Playwright): overflow, broken images,
  JS errors, fonts actually loaded (`document.fonts`), then push, wait for the Actions
  run, check the live URL, pull on the Mac.
- The sandbox's shell can't reach github.io; use a browser pane or a fetch tool for
  live checks, and expect caches — append `?t=<sha>`.
- `tools/*.py` expect the local server on :8766 and Pillow + Playwright.
- When touching fonts, keep `@font-face` descriptors consistent between the main
  face and any `unicode-range` subset (see Design system).
- Keep the honesty boundaries: fictional businesses, demo flows, no invented metrics,
  reference photographs under `work/` are never published.


## Approved homepage — 7 October 2026

The current approved opening uses Schibsted Grotesk for the heading and Newsreader for the blue promise/body, centered at 70% heading and 120% promise scale. Its handwritten invitation follows the ribbon art. Project overviews use short black summaries and upright Newsreader names over shared paper. Four scenes alternate artwork right / left / right / left with larger inter-project gaps (120px desktop, 74px phone). The latest WebP scenes live in assets/work-scenes/*-v6.webp. Leetify's real screenshot is fitted by scene-fit.js and work-screen-fit.css.

How we'll work together uses four captions around the existing ink workbench, with a sans heading and no decorative numbers. working.css owns this section. What it costs links to pricing/, whose three offers preserve the existing rates, timelines, international prices and payment terms. The homepage location line and structured city address are removed; the physics credential reads IITK.

Runtime opening files: opening.css, opening-settings.js and opening.js. Runtime work files: work-scenes.css, work-screen-fit.css and scene-fit.js. The HTML fixes data-work-layout to original. Comparison controls, rejected art and review history are kept in the local study and are not part of this release. Case studies and the three demo websites are unchanged.

Validated locally at 1440×900 and 390×844: fonts/art load, project placement alternates, pricing navigation works and no horizontal overflow. HTML/CSS references and changed script syntax pass. This release was prepared in an isolated checkout so the older uncommitted Desktop edits could remain intact.

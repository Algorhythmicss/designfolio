# Designfolio — decisions, state and what's next

Working notes for whoever picks this up next (Ayush, or an assistant working with him).
Last updated 4 October 2026.

## What this is

Ayush Jain's portfolio, positioned as **product designer & engineer**: one shipped
product (Leetify) as the centrepiece, three self-initiated concept websites as
brand & web work, a "how we'll work together" section with prices, and a contact
section with a form.

- Live: https://algorhythmicss.github.io/designfolio/
- Repo: github.com/Algorhythmicss/designfolio (`main`, GitHub Pages via Actions)
- Local clone on the Mac: `~/Desktop/DESIGN/designfolio` (keep in sync with `git pull --ff-only`)
- Owner: Ayush Jain · GitHub `Algorhythmicss` · X `@algorhythmicass` · Instagram `@ayushhhuh` · ayushhhudd@gmail.com · Kanpur, India (physics at IIT Kanpur; founding software engineer at startups)
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


## Local work-section review — 6 October 2026, v10

This folder is the local portfolio study, not the Desktop deployment checkout. The approved hero is unchanged. Work now uses short black copy, upright Newsreader project names, a continuous paper background and varied art scale/placement. Second Nature's art is on the left. New paper-ground assets are `assets/work-scenes/*-v6.webp`; Elsewhere v6 is a new calmer courtyard, while the other three are targeted edits of the accepted collages.

`work-scenes.css` is the final override. Leetify's actual UI is mapped into its measured monitor by `scene-fit.js` and `work-screen-fit.css`. Its full width is preserved; cover/top crops about 14% from the bottom. Original screenshots are unchanged. Earlier v9 source is saved in `review-history/2026-10-06-v9/`.

Preview: `index.html?v=10#work`; section study: `index.html?v=10&workStudy=1#work`; controls: `work-options.html?v=10&layout=original&edit=0`. The design journal at `../work/design-insights.md` distinguishes accepted, rejected and pending work. v10 is pending Ayush's review and has not been deployed.

Validation: 1440×900 and 390×844 visuals, no horizontal overflow, all copy within its project region. Supporting text size 110% changes the preview font from 18px to 19.8px. ArrowRight moves the selected title by 0.5% (5.04px on the 1120px preview); reset restores it. The Leetify case-study link opens its correct page. All images load and changed scripts pass syntax checks.


## Local alternation and spacing — 7 October 2026, v11

Ayush noted that the first two projects were still on the same side and requested more space between all projects. Art now runs right / left / right / left, with the text opposite, across Leetify / Elsewhere / Second Nature / Side Note. Only the three concept images are mirrored in CSS; their art contains no readable lettering. Leetify and its screen mapping are unchanged. The movable editor still transforms the parent anchor.

Inter-project margins are 120px on desktop, 90px at the tablet breakpoint and 74px on phone, multiplied by the existing row-spacing control. Phone masks and margins follow the new sides. Copy, typography, art assets and the approved opening are unchanged. v10 source is retained in review-history/2026-10-07-v10/.

Preview: index.html?v=11#work; controls: work-options.html?v=11&layout=original&edit=0. Visually verified at 1440×900 and 390×844: all four alternate, all images load, copy remains inside each region, no horizontal overflow. Screenshots are at ../output/portfolio-work-v11/. Local only; pending review, not deployed.


## Process and separate pricing page — 7 October 2026, v12

The pricing table moved off the homepage into pricing/index.html with pricing/pricing.css. A small existing original ink workbench introduces the page. Three open typographic offers alternate their positions on desktop, with large blue rates; phone offers stack. All rates, timeframes and half-up-front/half-at-launch terms remain. International prices are explicitly labelled. The new page uses the same self-hosted Newsreader and Schibsted fonts, including the existing matching rupee subsets. The sitemap includes /pricing/.

The homepage's working-together section now has four larger serif captions, two above and two below one shared ink workbench, with a matching sans section heading. No decorative numbers or pricing table remain. On phone it uses a small ink heading illustration and a clear single-column sequence. working.css is scoped to this section. What it costs links to the new page; #costs is retained at this link for older anchors. Contact opens the existing email-draft flow; nothing new is submitted or sent.

The location line and JSON-LD city address were removed. The academic credential reads IITK in the hero. Other hero settings, the alternating work composition and contact are unchanged. v11 source is preserved in review-history/2026-10-07-v11/.

Preview: index.html?v=12#how; pricing/?v=12; work-options.html?v=12&layout=original&edit=0. Verified at 1440×900 and 390×844, with loaded artwork/fonts and no horizontal overflow. Pricing and enquiry navigation checked. Local references and fragments resolve, no duplicate IDs, scripts parse. Screenshots are in ../output/portfolio-v12/. Local only, pending review; not deployed.


## Approved release pushed — 7 October 2026

Ayush approved v12 and requested a push. Commit 08ef8dad063c4a395187654e3fa3aa0f5fbe8e7a was pushed to main from the clean release checkout at ../portfolio-release-2026-10-07. GitHub Pages run: https://github.com/Algorhythmicss/designfolio/actions/runs/37516210737. At 19:10 UTC on 6 October (00:40 IST on 7 October), the workflow was still waiting before any runner or steps started. No required reviewers, wait timer or custom protection rules were configured; main is allowed. The public homepage still served the previous af0dba3 version. Push is verified; deployment and live validation remain pending GitHub scheduling.

The runtime release preserves the approved default visuals but removes comparison-only CSS/scripts, hidden rejected illustrations and retired Instrument font declarations. Study controls remain available locally at :8772. The original Desktop clone is intentionally untouched: main is still af0dba3 and index.html/styles.css have older uncommitted edits. Preserve or archive them before trying to sync that checkout. Continue visual iterations in this local study.


## Deployment completed — 7 October 2026

The push-triggered run 37516210737 stayed waiting without a runner/steps. A fresh workflow_dispatch on the same approved main commit 08ef8dad063c4a395187654e3fa3aa0f5fbe8e7a superseded it and succeeded: https://github.com/Algorhythmicss/designfolio/actions/runs/37518317713. Deployment completed at 19:21:35 UTC on 6 October (00:51:35 IST on 7 October). No source or protection-setting changes were needed. The precise reason the first run stalled remains unknown.

Public homepage and /pricing/ were verified in the browser. Hero defaults, IITK wording, v6 artwork, new process and separate pricing are live. All four work images load, fonts and workbench load, desktop widths 1280 and 1624 and phone width 390 have no horizontal overflow. Phone pricing-to-contact navigation resolves. Exact local release was already tested at 1440×900 and 390×844. Evidence screenshots are in ../output/portfolio-release-2026-10-07/. Git release checkout remains clean; Desktop edits remain untouched.


## Local refinement — 7 October 2026, v13

Ayush rejected the empty Elsewhere courtyard as generated-looking and semantically empty, requested each website hero back alongside the project art, different art/composition for the process, bold hero credentials, a better invitation position, and closing art a little higher.

Elsewhere now uses assets/work-scenes/festival-v7.webp (1898×829): a visitor discovers musicians and a small gathering behind parted rust curtains. Native image subject is at right; existing CSS mirrors it into the alternating left artwork position. Actual concept phone hero captures are visible again via work-previews.css. Leetify retains the real workspace in its monitor and adds a separate actual landing-hero capture at assets/shots/leetify-hero.webp (1280×720), captured from the live site on 7 October. Retain these visible .stop-phone/.project-preview images during future production cleanup; only .world and .screen-second are still hidden rejected exploration.

Process art is assets/process-v13/idea-to-product.webp, a transparent 1024×1536 paper sculpture progressing from rough sketch scraps through folds/prototypes to a resolved screen. Four unchanged captions read downward and alternate around it on desktop. Phone uses a smaller full illustration and clear left-aligned captions. working.css replaces the desk/2×2 composition.

The hero bolds 20,000, physics and founding software engineer at weight650. Invitation follows art-normalized x.50,y.83 with a minimum gap below the biography, preserving the approved type settings and expansion behavior. Closing artwork is translated upward42px on desktop and28px on phone, without shifting form controls.

Preview: http://127.0.0.1:8772/index.html?v=13. Source is local only; production is still approved/deployed08ef8da(v12). User review pending. Local v12 source preserved in review-history/2026-10-07-v12/. Checked at1440×900 and390×844: all nine visible work/process images loaded, no horizontal overflow, bold credentials correct, scope expansion keeps invitation inside hero and separated from copy, contact expansion renders without sending anything. New scripts parse, HTML references/IDs valid. Full-page and section screenshots: ../output/portfolio-v13/. New artwork/prompts listed in ../work/portfolio-v13-art-direction.md.

## Local concept refinements — 7 October 2026, v14

All three concept sites are refined and browser-tested locally. Production remains v12, commit 08ef8da; v13 and v14 await review/publication.

- **Second Nature:** `spatial-study-v2` depicts one courtyard/workshop with an aligned lifted roof. Enquiry choices use a 2 × 2 arrangement, bounded fields and a fitted action; navigation has one enquiry CTA. The complete phone illustration fits with an 8 px inset. Submit stays disabled until the JavaScript preview handler is registered, preventing the native GET fallback observed with a cached older script.
- **Side Note:** Original bags align at a shared scale and baseline in three open columns. A continuous gesture strip sits above aligned recipe captions; phones pair each gesture with its step. Hero description uses Caveat 500. Finder, product selection, bag and demo checkout hooks are preserved.
- **Elsewhere:** `city-chorus-blue-v14` selectively colours the central field and scraps cobalt; `event-courtyard-blue-v14` adds local blue while retaining warm dusk. Ticket names use DM Sans at 32 px / 28 px on phone, details 17 px / 16 px, prices 32 px and actions at least 48 px high. Original artwork remains.

New Side Note and Second Nature hero WebPs in `assets/shots/` are wired into the overview and case pages; Elsewhere’s original hero capture remains. A clipped Elsewhere diagram note and pass wording were corrected. Leetify user-request summaries are labelled as paraphrases; sitemap dates are updated. CSS/JS versions v14 and v14.1 prevent stale assets.

QA: 1440 × 900 and 390 × 844; Elsewhere also has no horizontal overflow at 320 px. Second Nature preview/edit/reset, Side Note finder recommendation/product/cart quantity/order preview, and Elsewhere programme filter/pass changes/quantity/ticket preview were checked. These remain truthful local demos, with no real submission or payment. Evidence: `../output/concepts-v14/`; baseline: `review-history/2026-10-07-concepts-before-v14/`. Design lessons are recorded in `../work/design-insights.md` as hypotheses, without conversion claims.


## Preview placement correction — 7 October 2026, v14.2

Leetify's extra .project-preview landing screenshot was removed on Ayush's request. Keep its real .screen inside the illustrated monitor. The three concept .stop-phone elements now carry desktop 1280×800 hero captures; their historical class name is retained. work-previews.css uses 20% row width on desktop and 33% on phone. Lower edges follow scene scale; concepts retain alternating artwork/copy positions. Keep these three visible proofs in production cleanup.

New capture paths are assets/shots/second-nature-desktop-v14.webp and side-note-desktop-v14.webp; Elsewhere's accepted original desktop capture is unchanged. Additional v14 phone captures remain available as assets, but are no longer used in the homepage work scenes. Cache query work-previews.css?v=14.2.

Verified at 1280×800,1440×900,768×900 and390×844: proofs load, text remains clear, no horizontal overflow. Current local preview: http://127.0.0.1:8772/index.html?v=14#work. Public release is still v12/08ef8da. Publication has not occurred in this refinement turn. Full pending audit: ../work/portfolio-readiness-v14.md. Artwork prompts and paths: ../output/concepts-v14/artwork-prompts.json.


## 7 October 2026 — release first, further design pending

Ayush requested publishing all current v13/v14/v14.2 changes before more design work. This checkout contains the production candidate: study imports, rejected hidden images and retired font options excluded; visible concept landscape proofs retained, extra Leetify landing screen removed. Existing Desktop changes remain untouched. Deployment result will be recorded separately after Actions and live checks.

Next design feedback: the architecture illustration still does not look refined; Side Note feels too simple to be a strong work reference, with only its hero artwork accepted. Do not call these art/composition choices final. Preserve Side Note's hero while developing the rest after this release.

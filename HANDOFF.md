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


## Client-readiness refinements — 7 October 2026

This dated note supersedes older stack, account, metric and contact statements above. The release checkout is `/Users/mac/Documents/Codex/2026-09-22/sp/portfolio-release-2026-10-07`; the Desktop clone is deliberately dirty and must not be pulled/reset without preserving it.

Leetify now documents Ayush’s supplied Manifest V3/TypeScript/Vite extension, Next.js/Vercel API, Supabase Auth/Postgres and owned extension-JWT/user-sync flow. Repository history starts 27 May 2026; these dates do not identify Chrome Web Store publish dates. Store users/rating are defined and dated; reported growth is distinguished from design hypotheses. Supabase admin queries bypass RLS and require application identity/ownership checks. Billing is not implemented.

Root mobile/tablet links and choices have 44px targets; invisible full-row artwork anchors were removed in favour of explicit project links. Responsive WebP derivatives preserve the original desktop artwork and monitor coordinate mapping. Narrow-phone, phone, tablet and desktop layouts, normal email draft/edit flow, runtime references and contact boundary checks were verified locally; Pages/live verification is a separate release checkpoint.

The editable email draft remains the default. `contact-config.js` contains blank public destinations. A Formspree send action stays hidden until an endpoint is configured; WhatsApp stays hidden until a number exists. “Arrange a Google Meet” opens an email until a real appointment-schedule URL replaces it. Setup details are in `tools/contact-setup.md`; `node tools/verify-contact.mjs` runs network-free boundary checks. Provider acceptance is not proof of inbox delivery. Owner endpoint, number and booking URL still need configuration and deliberate live verification.

Side Note’s v15 redesign is held in `portfolio-opening-study`; no Side Note site code or case-study body changes belong to this release. Its case-page sharing metadata alone was corrected. Client-offer and commercial handover/support decisions are deferred at Ayush’s request.

## Call requests and number privacy — 7 October 2026

Ayush requested Google Meet slots after 5 pm, earlier times through email, and a way to receive messages without exposing his number. The homepage now offers **Request a Google Meet**, opening a separate paper dialog. Dates and times are explicitly IST (UTC+5:30), must be real future instants and at least 17:00. A visitor reviews an editable email request to `ayushhhudd@gmail.com`; nothing is sent, reserved or written to browser storage. Ayush confirms the time and shares the Meet link. The existing project draft remains independent. Close is sticky within the scrolling panel; Escape, outside-click and focus restoration work. A valid public Calendar appointment-schedule link bypasses this request panel.

The Calendar connector profile matches Ayush’s Gmail. Browser Calendar setup instead reached sign-in for a different account, so no appointment schedule was created. Available days, evening end time and call duration await Ayush’s choice. Formspree remains prepared but inactive without an endpoint. Keep WhatsApp config empty for phone-number privacy; a website enquiry needs no number, and a Telegram or Signal username route can be added after the owner provides it and checks number-visibility settings. Setup is in `tools/contact-setup.md`.

Local verification: 48 network-free call checks and 62 existing contact checks; real browser rejects 16:59 and prepares a 17:00/17:30 request; 320/390px layouts have no horizontal overflow; controls are at least 44px; sticky Close stays visible on results/back; opening and preparing a call preserves an edited project draft. This records implementation and testing, with publication verified separately. Side Note remains held. No real message, booking, invitation or Formspree delivery was performed.

## Safari evening-time correction — 7 October 2026

Ayush showed a future 14 October request at 9:30 pm rejected with Safari’s generic “Invalid value”. The existing JS accepted canonical `21:30`; the visible failure came from the native segmented picker, with its exact validity flag unobserved. Native validation can prevent the submit handler from running, a boundary the original stub checks did not represent.

The native time input is replaced by explicit required **Hour** (5–11 pm) and **Minute** (00–59) selects. No default time is assumed. `assembleMeetTime` accepts only an evening hour and a two-digit valid minute, then emits canonical HH:mm. Date/future/IST checks remain independent, and custom errors clear on both input and change. Cache versions: contact.css/call-request.js16.3; app/config unchanged16.2.

88 call checks and 62 existing contact checks pass. Mutations permitting hour16 or ignoring the chosen minute fail focused tests. Both in-app preview and real Safari accepted 14 October 2026 at 9:30 pm and displayed the correct editable email draft. Empty-minute selection is rejected; 320/390px have no horizontal overflow and selects are48px tall. The separate Safari test tab was closed; Ayush’s original unsent form remains untouched. No message or appointment was sent. Publication is recorded separately in the workspace release evidence.


## Five client offers — 7 October 2026, v17

This supersedes the earlier three-tier pricing and offer-deferred notes. Current inline prices supplied by Ayush take precedence over the older prices in the attached offer explainer. Preserve the existing artwork, palette, Newsreader/Schibsted/Caveat typography and held Side Note redesign.

- **Product Review:** ₹20,000 / $500; three days after access is ready. Recorded first-use walkthrough, ranked findings, one screen rebuilt in clickable code, 30-minute call and a scoped Sprint quote. Optional read-only risk check is limited, not a full security audit. The amount actually paid is credited to a Sprint booked within 30 days, including a discounted Review.
- **Product Upgrade Sprint:** ₹2,50,000 / $6,000; two weeks; up to three flows and about twelve screens. User conversations when the client supplies access, visual direction/basic component system, rebuilt flows and agreed auth/data/payment fixes, analytics/error tracking, phone checks, deployment and handover. No full rewrite, major new-feature bundle or health/regulated-financial-data apps.
- **Monthly Product Partner:** ₹1,50,000 / $3,500 monthly; up to thirty hours, one prioritised workstream at a time. Monthly advance billing and two weeks’ cancellation notice.
- **First Product Build:** from ₹6,00,000 / $12,000. Essential-use-case MVP, design and engineering, auth/database as needed, analytics, deployment and handover. Timeline agreed after scoping. Pricing page only; its CTA reveals the otherwise hidden homepage form choice.
- **Website in a Week:** ₹60,000 / $2,500; up to five pages, mobile, enquiry flow, search basics and deployment. The week begins after content/access are ready. Complex commerce/apps quoted separately; at most one or two website projects per month, with no invented current availability.

Review → Upgrade → monthly partnership is the main path, but each offer stands alone and visitors can enter directly. The homepage biography/process introduces this focus and the separate website offer. Each pricing CTA passes a whitelisted offer query, opens and selects the form, then positions it after initial hash navigation; nothing is prepared or sent automatically. Budgets now match the offer range, and the old day rate, under-₹50k choice and landing/website/product tiers are removed. WebMCP uses the same names and budget values.

Founding discount: first three clients get 30% in exchange for an agreed case study, honest testimonial and before/after permission. Ayush explicitly confirmed monthly partnerships are discounted **only in the first month**; later months use list price. No positive-feedback requirement. Builds/Sprints remain half upfront, half at launch. Applicable taxes and third-party costs are confirmed in the quote; no unverified GST/export rules are published.

Verification: 92 contact boundary checks and 88 call-request checks pass, without sending, booking or network delivery. Browser review covers desktop, tablet and narrow phones; selected-offer draft and first-build reveal retain the email-review flow. Publishing and visual acceptance are distinct; release evidence is recorded separately in the workspace design journal.

## Startup roles in the hero — 7 October 2026

Ayush supplied additional experience as a product manager and design lead at startups. The hero now names these alongside founding software engineer, with the same emphasis as physics. The benefit is phrased as deciding what to build, designing how people use it and turning it into working code. No companies, dates or unprovided outcomes are inferred. Art, type settings and other sections are retained.


## Offer value, qualification and bounded commitments — 7 October 2026, v18

Ayush supplied the value-equation/offer-ladder notes in his pasted request. The existing five list prices remain. The first-build name/timeline is now **Idea to Launch in 6 Weeks**, for a scope agreed to fit six weeks, replacing the earlier open timeline. Launch & Grow leads the pricing page: Sprint + three subsequent monthly partnerships (90 ongoing hours in total) at ₹6.5 lakh / $15,000 up front; monthly list-price components would be ₹7 lakh / $16,500. Added Lockdown Week (₹1 lakh / $2,500), Look Week (₹1.25 lakh / $3,000) and Quarterly Check-in (₹40,000 / $1,000 per quarter). These are genuine narrower scopes, not invented additive market values.

Review includes a first finding within 24 hours of its reserved ready start, five useful findings or no charge/refund, a real-code screen, written app-specific 14-day plan and 30-minute call. Its retained fee, excluding refunds, is credited once against a Sprint or the Sprint component of Launch & Grow booked within 30 days of Review handover. Booking within seven days includes the Launch Kit; outside that window it is a quoted add-on.

Sprint describes Lockdown, New Look, three rebuilt flows and Launch Dashboard, with a two-account check where applicable. The agreed priority fix is due within 48 hours of the reserved ready start. Day-five visual review includes one free redo; short videos arrive every two days; planned founder participation is about three hours. Extras include the AI-readable style guide, User Voice report from accessible users, Leetify-based distribution plan without a growth guarantee and a 30-day warranty limited to delivered-scope defects.

User delegated the late-credit cap to the assistant, aiming to protect time/earnings. Decision: ₹5,000 / $150 per late Monday-to-Friday day, capped at **10% of the agreed Sprint fee**, with ready access and one-day replies required; blocked client days move the date. User explicitly confirmed the six-week build’s missed working demo costs **one-sixth of the agreed build fee per affected week**, capped at the fee. The website late guarantee reduces total agreed fee by 50%; deduct balance and refund any overpayment, avoiding a double refund of the advance. Guarantees reduce fees; they do not guarantee growth, complete security or provider approval.

Monthly service remains up to 30 hours, one workstream. Quarter prepay is 10% off: ₹4.05 lakh / $9,450. New onboarding is ₹25,000 / $500, waived after a Sprint or with a three-month commitment. Three-month commitments include a monthly analytics review video with three recommendations. A dissatisfied paid month can trigger one following reserved month free, **once per engagement**; report within seven days. Prepaid service fee is refunded for that next month, otherwise waived. A quarter’s monthly basis is its actual fee divided by three; a bundle quote itemises its component fees. Two weeks’ notice stops monthly renewal; prepaid three-month commitment terms are agreed before booking.

Founding 30% discounts apply to standalone service fees, and monthly only in its first month. They do not combine with bundle or quarter discounts; applicable onboarding fees are separate. Reserve one calendar: up to two Sprint starts (planned 1st/15th) **or** three monthly partnerships according to available time. Website/build/fix guarantees share this calendar; no live seat counts or invented booked slots.

New website landing pages: pricing/clinic/, pricing/studio/, pricing/cafe/, with same ₹60,000 / $2,500 up-to-five-page scope and different visitor questions. Their existing art is disclosed as illustration/concept work. Google Business Profile setup uses owner access, WhatsApp uses the client’s authorised business number, and three Instagram templates are included. Clinic sites exclude medical records/patient portals; profile verification timing does not delay the website launch. Sitemap includes these pages.

Enquiry and call forms ask optional, independent users/revenue/funding stages without amounts. The reviewed draft includes only known explicit choices. The Website in a Week enquiry carries a whitelisted clinic/studio/cafe context; unrelated/unknown audience parameters are ignored. Additional offer choices reveal only when requested from pricing or the browser tool. All nine offer names and optional fields match the WebMCP schema. Draft/copy/email stays the default, no Formspree endpoint or private WhatsApp number has been enabled.

134 contact and 93 call boundary checks pass without messages/reservations/network delivery. Real browser checks include new bundle and audience routing, business answers in both drafts, 9:30 pm call requests, separate edited project draft preservation, 44px actions and narrow phones. Preserve current hero/work art and Side Note’s held redesign. Publication is separately recorded in workspace evidence.

## Confirmed latest Launch-Ready menu — 7 October 2026, v20

Ayush explicitly chose the **latest** supplied menu and authorised deployment. This supersedes the earlier design-led proposal and the v17/v18 generic offer names. Preserve the established hero/work artwork and typography, the held Side Note redesign and the deliberately dirty Desktop clone.

Current menu: Free first-impression video; **3-Day Launch-Ready Check** ₹20,000 / $500; **14-Day Launch-Ready Sprint** ₹2.5 lakh / $6,000; **Ship Every Week** ₹1.5 lakh / $3,500 monthly; Launch & Grow ₹6.5 lakh / $15,000; Lockdown Week ₹1 lakh / $2,500; Look Week ₹1.25 lakh / $3,000; Quarterly Check-in ₹40,000 / $1,000 quarterly; **Idea to Launch in 6 Weeks** from ₹6 lakh / $12,000; **7-Day Website** ₹60,000 / $2,500. Founding Sprint price is ₹1.75 lakh / $4,200. Existing confirmed credit limits, one-sixth missed-demo reduction, monthly first-month-only discount and single shared calendar remain.

Pricing introduces the free video and three core existing-product offers, then compact additional scopes. The Sprint has its own complete sales page at `pricing/launch-ready-sprint/`; the six-week build has a separate page at `pricing/idea-to-launch/`. Both use existing artwork and fonts. No placeholder testimonials, invented start dates, complete-security claim or conversion/growth promise is published. The Check fee actually retained is credited once toward the Sprint portion within 30 days; the Launch Kit is free only when booked within seven days, otherwise a quoted add-on. Sprint late credit remains capped at 10% of the agreed Sprint fee.

The free first-impression enquiry route requires an absolute HTTP(S) product URL and makes written context optional; paid offers still require a project description. Typed URLs are validated and included in the editable email draft, never fetched by the form. Credential-bearing and non-web URLs are rejected. Hidden offer choices, query routing and WebMCP use the same names. Email review/copy remains the default; no Formspree endpoint, phone number or actual calendar reservation is enabled.

The earlier `before-after.css`, `before-after.js` and `assets/downloads/anti-default-style-guide.md` are held local assets, not linked or staged for this release. They are not part of the newly selected menu.

Verification and publication are recorded separately in the workspace journal. Current network-free checks: 154 contact and 93 call checks; local links/assets/fragments across relevant pages pass. Source cache versions: app.js/contact.css and new pricing styles v20; unchanged call-request.js remains v18.

## Needs-led offer guide — 7 October 2026, v21

Ayush requested research into Alex Hormozi's offer tactics and a flow that reveals information according to the visitor's needs instead of listing every package. The latest Launch-Ready menu, prices, artwork and commercial limits remain. Research and the route matrix are in workspace `work/offer-journey-v21.md`; this is our progressive-disclosure application of the official offer/value checklists and the bonus chapters' warning about qualification friction, not a quiz prescribed by Hormozi.

`pricing/index.html` now opens a short guide: existing app, new idea or business website. Paths take two or three choices and show one provisional starting point, its price, three outcomes and material limits. Look/security work and regular/occasional support have distinct routes. A Sprint scope check routes whole-app rebuilds and regulated-data needs to a scope conversation. New ideas never route to a paid existing-product Check. Launch & Grow appears only after someone asks about support after a Sprint. Smaller scopes, commitments and the complete menu are revealed on request.

Keep the native `all-offers` details as an escape route and no-JavaScript fallback. Existing pricing fragments open their exact recommendation without requiring the guide; close the catalog explicitly because browser fragment navigation otherwise opens the containing details. Back/reset controls retain local answer history. No cookies, storage, automatic network requests or contact-data gate are introduced.

Model/routing is in `pricing/offer-guide-model.mjs`; the DOM controller is `pricing/offer-guide.mjs` and layout is `pricing/offer-guide.css`. The static catalog preserves complete terms. When changing an offer later, update both the model and catalog and check the dedicated scope page. Dynamic text uses textContent/DOM nodes; IDs and query values are whitelisted.

Named-offer CTAs include `guided=1`; the main enquiry then shows only that selected offer and a return-to-guide link. `offer=conversation` selects the honest "Still figuring it out" choice. Unknown queries stay ignored; non-guided links keep the original menu. A later browser-tool change updates the visible chosen label. Email review/copy and the separate Google Meet request are preserved; no direct-send service or phone number is enabled.

Cache versions: app.js/contact.css and the new guide assets v21; the complete catalog stylesheet and separate scope pages' styles remain unchanged. Network-free checks: 237 routing, 271 contact and 93 call. Browser/publication evidence is recorded separately in the workspace journal.

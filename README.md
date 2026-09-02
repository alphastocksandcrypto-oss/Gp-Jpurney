# MedNav

Static marketing site for MedNav, the Irish medical career navigation platform.

## Pages

| File | Page | Layout |
| --- | --- | --- |
| `index.html` | Homepage (v2, the design source for everything else) | Editorial |
| `opportunities/index.html` | Opportunities hub | Editorial, with a combined board |
| `opportunities/jobs.html` | NCHD and consultant posts | Facet rail beside results |
| `opportunities/locums.html` | Locum shifts | Grouped by starting month |
| `opportunities/conferences.html` | Conferences, courses and CPD | Agenda timeline with a CPD planner |
| `preparation/exams.html` | Exams index | Exam families as stage sequences |
| `preparation/interviews.html` | Interviews index | Scoring weights on the front of the card |
| `tools/index.html` | Career Tools | One profile driving seven live tool cards |
| `onboarding/index.html` | Onboarding | Seven steps, split brand panel |
| `app/index.html` | Dashboard (signed in) | App shell, nine views over one record |
| `evidence/index.html` | Evidence v2 — clinical answer engine | Reading column, source drawer, named citations |
| `evidence/v1.html` | Evidence v1 (superseded) | Card stack over a retrieval funnel |

Each page is a single self-contained file. Fonts load remotely — Sora and Inter
from jsDelivr for the site, Instrument Sans and Instrument Serif from Google
Fonts for Evidence — and everything else is inline, so a page opens straight from
disk with no build step and no server. Every face has a real fallback stack, so a
page with no network still lays out correctly.

The layouts are deliberately different. The hub and Career Tools are read, so
they are editorial. The three boards are operated, so each is shaped by the
variable that actually decides the choice: post type and specialty for jobs,
date and rate for locums, date and CPD points for conferences.

Career Tools is built around its own claim. The stage and specialty selects
feed one profile, and the ladder, the gaps, the next deadline and the live
state of all seven tool cards re-render from it. Choosing "Qualified abroad"
changes the ladder itself, adding IMC registration and Irish clinical
experience ahead of the training rungs. Tools that do not apply at your stage
dim and say why rather than disappearing.

Career Tools reuses the homepage's own roadmap components (`.rd-step`,
`.rd-check-row`, `.rd-next`) so the example there and the example on the
homepage are visibly the same product.

## The Preparation pages

Two reference indexes, each shaped by the fact that actually makes its subject
hard to plan.

**Exams.** A membership exam is not one event but a sequence of stages, each
with its own format, fee and sitting window, and the sequence can run three
years. So the card carries the whole sequence rather than one row per sitting,
and a stage lights up when its applications are open.

**Interviews.** The useful fact is what the panel weights, so the weighting is
the body of the card rather than a footnote. Each card also splits the score
into what you build in advance and what you do on the day, which is the figure
that tells a doctor whether preparation or portfolio is the better use of the
next month.

Weights are magnitude, so those bars are sequential on the single mint hue. A
six-colour categorical set repeated across ten cards would need a legend on
every card and would collapse for deutan vision on the amber and coral hues.

### What is real on those pages, and what is not

Exam names, colleges, stage structures, programme names and interview formats
are real. **Fees, sitting dates, closing dates, domain weights, station counts
and window months are illustrative** and must be replaced with each college's
published values before launch.

No pass rates appear on the exams page, deliberately. Publishing a pass rate
for a named college's exam without verifying it against that college's own
reporting is exactly the confident guess this product exists to avoid.

## Onboarding

`onboarding/index.html` is the path the homepage promises: create an account,
verify by magic link, set a password, answer three questions about where you
are, what you are aiming for and what you already hold.

The last screen is the payoff. It computes the same readiness figure, the same
banded shortlisting score and the same gap count the dashboard will show, from
the answers just given, then hands those answers to the dashboard.

Because onboarding and the dashboard are separate documents and cannot share
storage across origins, the profile travels in the URL as base64 JSON
(`?p=...`). The dashboard reads it, merges only keys it recognises, saves, and
strips the parameter from the address bar.

**Known duplication:** the scoring model exists twice, in `onboarding/` and in
`app/`. Two copies can drift, and the two figures agreeing is the whole point.
When this gets a build step, both should import one module. Until then, any
change to a weight or a band has to be made in both files.

## The dashboard

`app/index.html` is the signed-in application, not a marketing page, so the
craft shifts to information design: a persistent rail, dense cards, tabular
figures, hash routing (`#/today`, `#/score`, and so on) and a demo record held
in `localStorage`.

Its organising idea is that there is one record and every view derives from it.
Marking the QI project complete moves the shortlisting score, application
readiness, the gap list, the progress tracker, the sidebar badge and the
next-best-action on Today in one go, and the toast reports the delta it
actually caused rather than a canned message.

The two headline measures are deliberately different, and their disagreement is
the product:

- **Application readiness** is a weighted percentage of how much is assembled,
  so a project at 60% counts for 60%.
- **Shortlisting score** is banded, the way colleges actually score, so that
  same project counts for nothing until it is finished.

That is why finishing one half-done project is worth more than starting three
new things, and the "what would move you most" list ranks by points actually
gained.

### Chart colour

Following the dataviz method, and computed rather than eyeballed:

- Magnitude bars are **sequential**: one mint hue, never a status colour. A
  status palette on adjacent amber and coral hues collapses for deutan vision
  (delta E 3.5 to 5.7 once darkened enough to be visible on this light
  surface), so status came off the fill entirely.
- Status is an icon **plus** a word **plus** a colour, never one of the three
  alone. `#0b7a63`, `#8a5a10` and `#b8482a` all clear WCAG AA on their tints.
- Deadline rails keep a status colour but always carry the icon and the
  days-away figure beside them.

## Design system

Tokens, type pairing and motion all come from the homepage:

- Display type Sora (600/700/800), body Inter (400/500/600)
- `--deep #0b2e36`, `--mint #14b394`, `--mint-2 #3ed1a8`, `--paper #f7faf8`,
  `--coral #ff7a59`, `--amber #ffc061`
- Shared components: sticky header with backdrop blur, full screen mobile menu
  with focus trap, `.btn` primary/ghost, listing `.card`, filter `.fchip`,
  `[data-reveal]` scroll reveals, grain overlay, back to top, footer
- `prefers-reduced-motion` disables every animation and reveals all content

Colour carries meaning rather than decoration. Across the section, jobs are
mint, locums amber, conferences coral. Within the jobs board, training posts
are mint, non training amber and consultant posts coral. Composition bars in
each hero encode the real make up of that board.

### A note on the duplicated chrome

The header, footer and shared CSS are copied into each page rather than linked,
which follows the homepage's self-contained pattern and keeps every page
openable on its own. It does mean a change to the header has to be made in six
files, and the nav breakpoint bug below is exactly the kind of thing that
costs. When this site gains a build step, the first job is to lift the shared
block into `shared/site.css` and a header partial.

## Content rules

Carried over from the homepage and enforced on every page:

- Listings are aggregated and linked, never hosted. MedNav never receives an
  application.
- Rates appear only where the agency publishes them. They are never estimated,
  and sorting by rate keeps unpublished rates last rather than treating a blank
  as zero.
- Every card names its source.
- Figures shown next to a board level number describe the same board. Where a
  figure is derived from the sample rows, it is phrased so it cannot be read as
  a claim about the full board.
- No em dashes.

## On the no-account demo

The locked product spec is auth first, with no no-signup live demo. The
homepage resolves this by shipping an interactive stage picker whose output
carries an "Example" badge, and the Career Tools page follows that precedent:
the worked example runs without an account, and a roadmap tied to a real
profile, with verified dates, needs one. Keep the badge for as long as the
output is illustrative.

## Fixed here, worth knowing

The header nav had no room between 961 and 970 px: the links and both buttons
overflowed the header by up to 39 px. The breakpoint that swaps in the burger
was 960 px and is now 1000 px. This originated in the homepage and every page
inherited it, so the fix is applied in all six files.

## Placeholders to replace before launch

- `https://mednav.ie` and `/og-image.png` in every page head
- The listing arrays (`OPPS`, `JOBS`, `SHIFTS`, `EVENTS`) are sample records
  mirroring the wireframes, not live feeds. Swap them for the aggregation feed
  and remove the "Sample of the live board" badge on the hub.
- Career Tools: `SPECIALTIES`, `STAGES` and `STAGE_DATA` hold illustrative
  ladders, gaps, scores and application dates. None of it is verified. Replace
  with the criteria service, then drop the Example badge.
- Day counts are computed from the browser's current date, so the sample rows
  read as closed or past once those 2026 dates pass.
- Board sizes (142 jobs, 38 locums, 12 events), the composition bars and the
  "rechecked 2 Aug 2026" stamp are static copy.
- `/opportunities/submit`, `/blog/locum-guide-ireland` and the `/tools` links
  are not built yet.
- Homepage testimonial and avatar images are illustrative placeholders.
- Dashboard: `DEFAULTS` is one demo record for "Jane Doyle" in `localStorage`,
  not an account. Swap it for the user service. The scoring bands in `DOMAINS`
  are illustrative and must be replaced with each college's published criteria
  before any of it is shown to a real doctor.
- Dashboard actions that are honestly stubbed and say so: calendar export,
  reminders and sign out.
- Preparation pages: every fee, date, weight and station count is illustrative.
  Replace from the colleges' published documents, and mark anything not yet
  published rather than carrying last year's number forward.
- Onboarding creates no account and sends no email. The magic-link step has an
  explicit demo control that says so rather than pretending to wait.
- Milestones and the roadmap trail now derive from the record, so a doctor who
  says they hold two exam stages is not shown a third as passed. The historical
  dates that used to be hardcoded are gone.


## Evidence

`evidence/index.html` is a working clinical answer engine: ask a question, watch
the answer get assembled, read it with every statement carrying the guideline it
came from and every citation one click from the passage it rests on.

It is the one page not in the homepage's design language. It runs on its own
palette and typeface — the lime and off-white system, Instrument Sans and
Instrument Serif — because it is a tool used inside a consultation rather than a
page read before one. Self-contained like every other page here: one file, no
build step, no server.

### v2, and why v1 is still in the repo

`evidence/v1.html` is the first pass and is kept for comparison. It was a stack
of bordered cards with numbered `[1]` citations and a lot of invented apparatus —
a PICO decomposition, an evidence ledger, a conflict panel. v2 was rebuilt after
reading how the category's tools actually behave, and the differences are the
point:

| | v1 | v2 |
| --- | --- | --- |
| Citations | numbered `[1]` | **named** — `[NICE]`, `[Cochrane]`, `[HSE]` |
| Verification | a reference list | **source drawer** with the cited passage, highlighted |
| Retrieval control | four scope chips | **specialty setting** and full **source control** |
| Grounding | asserted | a visible **check pass** over every citation |
| Shape | card stack | one reading column |
| Output | copy | copy, Markdown, print to PDF, session link, CPD |

A named citation is legible before you click it. A clinician reads `[Cochrane]`
and `[HSE]` and already knows what weight the claim carries; `[3]` and `[5]`
tell them nothing until they scroll. That single change does more for the page
than everything v1 invented.

### The pipeline, in the order it runs

1. **Interpret** — the question is read against your specialty setting. When the
   question sits outside it, the pipeline says which other stack it pulled in
   rather than silently reordering.
2. **Search** — only the source sets you have enabled, ranked for Ireland first.
3. **Re-rank** — by source tier and by how directly each document answers the
   question asked, not by keyword overlap.
4. **Screen** — everything dropped carries its reason, and the whole list stays
   readable behind one toggle: read 11, kept 6.
5. **Write** — the answer streams a word at a time, direct answer first, with a
   named citation landing on each statement as it is made.
6. **Check** — every citation is walked against the passage it points to before
   the answer is called finished.

### The source drawer

Clicking any citation, inline or in the reference list, opens the source beside
the answer: publisher, type, date, region, the passage the claim rests on with
the grounding sentence highlighted, and every other statement in the answer that
cites the same document. That last list is the one that catches a bad answer —
if a source is carrying more claims than it can bear, you see it at a glance.

### Source control

The evidence base is the clinician's to set, not ours. A ranking preset
(guidelines first, balanced, primary evidence first), per-set switches for HSE,
ICGP, NICE, Cochrane, HPRA, indexed journals, international guidance and your
own uploaded Practice Library, and a domain blocklist applied before ranking
rather than as a filter afterwards.

### The streaming is deliberate

Words arrive on a delay budget, not a fixed tick — longer at a full stop, longer
at a comma, longest at a citation, because that is where a reader's eye rests.
Jitter is derived from the token index rather than random, so two runs of the
same answer look identical. Under `prefers-reduced-motion` the whole sequence
resolves immediately to the finished answer. Stopping mid-answer keeps what was
written, and lists only the references that part actually cited.

### What is real on this page, and what is not

Guideline bodies, document names and source types are real. **Every dose,
threshold, percentage, date and quoted excerpt is illustrative** and must be
replaced with each body's published text before clinical use. The excerpts in
the source drawer are stand-ins written to be plausible, not transcriptions.

Three questions are wired end to end — acute otitis media in a young child, a
primary prevention statin decision, and new atrial fibrillation at routine
review. Anything else routes to a fallback that says so rather than inventing an
answer.

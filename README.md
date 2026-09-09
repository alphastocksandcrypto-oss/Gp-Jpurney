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
| `onboarding/index.html` | Onboarding | Adaptive tree, 11 to 15 steps, split brand panel |
| `app/index.html` | Dashboard (signed in) | App shell, nine views over one record |

Each page is a single self-contained file. Fonts (Sora, Inter) load from
jsDelivr; everything else is inline, so a page opens straight from disk with no
build step and no server.

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
verify by magic link, set a password, then answer a set of questions that is
not the same set for everybody.

**It is a tree, not a form.** Every step carries a `when()` predicate and
`activeSteps()` re-filters the list on each render, so the progress bar and the
ladder in the brand panel show the real remaining length for *this* person. A
final-year student answers eleven steps, an Irish SHO on a scheme thirteen, a
non-EU doctor still applying to come to Ireland fifteen. Three rules shape it:

1. **Grade is asked on its own.** "Where are you now" is intern, SHO,
   registrar, consultant, and nothing else. Route is a separate question,
   because the two vary independently: an SHO who qualified in Lagos and an SHO
   who qualified in Galway are the same grade and a completely different
   journey. Bundling them, as the first version did, forced people to pick the
   label that was least wrong.

2. **Nothing is asked as a score.** We never ask "how many exams have you
   passed". We list the named exams for that specialty and the doctor marks
   each one passed, booked or not yet; we never ask "how many audits", we list
   completed an audit, closed the loop, completed a QI project, presented it.
   The score is computed from the ticks. A number typed into a box cannot be
   turned back into advice, because it does not say *which* part is missing. A
   ticked list can, and it is also faster to answer.

3. **The list adapts to the specialty.** `specialtyOf()` resolves a specialty
   key from the training scheme if they are on one and from their target if
   they are not; `EXAMS[spec]` and `PORTFOLIO_EXTRA[spec]` follow from it.
   Someone heading for orthopaedics sees MRCS Part A, MRCS Part B and FRCS,
   plus Basic Surgical Skills and ATLS. They are never shown MRCPI.

**Where you qualified and where you are a citizen are two questions.** The
degree decides the registration route; the citizenship decides whether a work
permit applies. An Irish citizen with a non-EU degree needs the IMC
international route and no permit at all, and the flow now says so rather than
asking them about permits they will never need. Citizenship is asked at region
level only, because the permit rules do not turn on nationality and storing one
would be collecting something we have no use for.

Non-EU **degrees** get three extra steps (already here or planning to move, IMC
registration status, and an extra tick group covering the English language test,
EPIC verification, the Certificate of Experience and references), because those
are the things that actually stall a move to Ireland and no other part of the
product captures them. Their final screen leads with whichever of those is
outstanding, ahead of the score. Non-EU **citizenship** adds the permit step,
independently.

**One step is optional and says so.** The location step is the only question we
use to filter what a doctor is shown rather than to score them, so it carries a
plain disclaimer, a Skip control, and a note that it never leaves the profile.
Ireland's training and posts are regionalised; without it every job, locum and
course is nationally scoped.

**What we deliberately do not ask.** Nothing about previous applications, their
outcomes or any feedback received. It is the most predictive data we could hold
and the least defensible to store, so we work from the published scoring
criteria instead. Referee status, career gaps and less-than-full-time interest
are all better handled on the dashboard's gap analysis than at signup, where
they read as interrogation.

**Presentation level is captured, and honestly.** Local and departmental
presentations are recorded at zero points, national and international ones
score, because that is how the criteria actually read. Prizes and higher
degrees are recorded but not scored: we do not have a published band for them,
and inventing one would put the onboarding total out of step with the
dashboard. The payload counts only the scored items for the same reason.

Changing an earlier answer clears what it invalidates. Switching from "on a
scheme" to "not on a scheme" drops the scheme, the year and every exam mark,
rather than carrying MRCPI answers into an orthopaedic route.

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

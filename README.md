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
| `tools/index.html` | Career Tools | One profile driving seven live tool cards |
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

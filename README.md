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
| `onboarding/index.html` | Onboarding | Adaptive tree, 11 to 18 steps, split brand panel |
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

**Hedging across specialties is asked, and named.** On the timing screen,
anyone actually applying this cycle is asked whether they are applying anywhere
else too. Answering "yes" opens a multi-select of every other target specialty,
because knowing the breadth alone is not enough to show side-by-side deadlines;
knowing which specialties is. It costs no extra rung in the ladder, since it
folds into the existing timing step rather than adding one, and it is skipped
outright for anyone who answered "not applying for a scheme right now".

### Quick onboarding, then a full profile

Onboarding is split in two, and the split is a sequence rather than a choice at
the door. Everyone does the quick version and reaches a working dashboard.
The last screen then offers three more questions, badged optional, and opting in
grows the tree: `A.full` flips, three `when()`-gated steps become active, and
`goId("society")` drops the doctor back into the flow, which walks forward and
returns them to the same summary.

The offer is made *after* the score, the gaps and the roadmap are already on
screen. Asking for depth before anyone has seen anything is how you get a
half-filled form and an abandoned signup; asking once the value is visible is a
different question with a different answer rate. Nobody is made to answer these
to get a dashboard, and the payload records which version was completed
(`profile: "quick" | "full"`) so the dashboard can prompt for the rest later.

The full profile currently holds:

- **Specialty society**, as free text with a specialty-aware placeholder. It is
  free text on purpose: we would rather record what a doctor actually belongs to
  than have them pick from a register we have not verified. `SOCIETY_HINT` is
  keyed like `EXAMS` and is deliberately sparse. **Only three specialties have a
  hint, and even those are phrased as examples rather than asserted.** Building
  the verified per-specialty list is a launch task, and the same rule applies as
  everywhere else here: where we have nothing, we say nothing.
- **References**, which is the quiet deadline. Most schemes want two from recent
  supervisors and consultants take weeks to reply, so it feeds the dashboard's
  gap analysis rather than the score.
- **Clinical gaps**, asked *only* as whether one exists and whether they want
  help framing it. There is nowhere to say why, deliberately: the reason is
  frequently health, caring or parental leave, which would be special-category
  data we have no business holding. A "rather not say" option is always present.

**What we deliberately do not ask, anywhere.** Nothing about previous
applications, their outcomes or any feedback received. It is the most predictive
data we could hold and the least defensible to store, so we work from the
published scoring criteria instead. Less-than-full-time interest is not asked
yet either.

**Presentation level is captured, and honestly.** Local and departmental
presentations are recorded at zero points, national and international ones
score, because that is how the criteria actually read. Prizes and higher
degrees are recorded but not scored: we do not have a published band for them,
and inventing one would put the onboarding total out of step with the
dashboard. The payload counts only the scored items for the same reason.

Changing an earlier answer clears what it invalidates. Switching from "on a
scheme" to "not on a scheme" drops the scheme, the year and every exam mark,
rather than carrying MRCPI answers into an orthopaedic route.

**Nobody is asked a question their own answers already rule out.** Three
places this showed up and got fixed:

1. The permission-to-work step only ever appears after someone has said they
   are a citizen outside the EU and EEA, so its option list no longer offers
   "Irish, EU or EEA citizen" back to them. It used to, because the list was
   shared with a screen that has since been split apart, and nobody had gone
   back to prune it.
2. Whether someone is "applying to a scheme" only makes sense for someone with
   an application still ahead of them. `pastEntry()` is true for a GP or HST
   trainee, who already holds the place that question is about, and for a
   consultant, who has no scheme left to apply to at all: both skip straight
   to email preferences, with a line saying why. A BST or Core trainee is
   still asked, because their scheme is a step on the way to a further one,
   but the question is now reframed as their *next* application rather than a
   first one, and the screen says so.
3. A consultant is asked what specialty they practise, not what they are
   aiming for, since they are not applying to anything, and "Not decided yet"
   is dropped from their list of options.

`title`, `sub`, `brandH` and `brandP` can now be a function of the current
answers as well as a plain string, which is what makes a single step able to
carry two different questions for two different kinds of person, rather than
needing a second near-duplicate step.

**Readiness and shortlisting adapt to the specialty, not just to the score.**
GP does not score formal teaching, so a GP trainee is not shown a teaching
group at all, and the readiness weight that would have gone to it moves to
audit and QI and to exams, where ICGP actually weights heaviest.
`WEIGHTS_BY_SPEC` overrides `DEFAULT_WEIGHTS` per specialty, and a domain with
no weight for that specialty is dropped from the summary entirely rather than
shown pinned at zero, which is exactly the "asked about something that does
not apply" pattern this rebuild exists to remove. Only GP has an override so
far, because it is the one case with a concrete, defensible reason to differ;
extending this to other specialties needs the same kind of reasoning, not a
guess at what feels right.

For anyone `pastEntry()` is true for, the summary itself relabels: "Shortlisting"
becomes "Portfolio points" and "Readiness" becomes "Progress", and the opening
line says outright that this is not a shortlisting score because they already
hold their place. The underlying maths does not change, since the same ticks
still build the record they carry into CCT sign-off or their next application:
only the frame does, because "shortlisting" describes competing for a place,
and someone who already has it is not competing for it.

**This has not yet reached the dashboard.** `app/index.html` still scores
every specialty on the same fixed six domains with the same fixed weights, and
still calls the figure "Shortlisting score" regardless of whether the doctor
holds their place already. The two scoring mirrors, already flagged below as a
known duplication, have now drifted in a second way. Porting the specialty
weight override and the pastEntry reframing to the dashboard is follow-up
work, not done here.

**What do you need help with, now asks too.** A new step, gated on nothing so
everyone sees it, lets a doctor tick as many of exam prep, interview prep,
Career Tools, and job or locum matching as apply, or say they are not sure and
want to see everything. It changes nothing about the score. The summary
screen echoes it back ("Your dashboard will open on exam prep and interview
preparation first"), and the payload carries it as `helpFocus` for the
dashboard to act on, which, like the location and hedging fields before it,
it does not yet do.

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

### Today, in six blocks

Today answers one question: what should I do next, and am I on track. Anything
that is not that answer belongs on a module page. The order is deliberate:

1. **Greeting and nudges.** Every outstanding thing is one row of pills, each
   linking to the page that fixes it. It used to be up to four stacked
   sentences, which pushed the next move out of the first fold.
2. **Your ladder.** Orientation before action, which is Shneiderman's overview
   first applied literally. Greeting, ladder and next move come to 488px and
   the phone's first fold holds 665px, so this costs nothing. Three rungs on a
   phone, five on desktop: each rung carries its distance from the doctor's
   current stage, so the outer ones drop out by CSS wherever "here" falls.
3. **Your next move.** The single highest-value action, with the delta it
   causes.
4. **Two tiles.** Readiness and next deadline. Shortlisting score and
   milestones are each a whole page in the nav and neither is actionable here.
5. **What is closing.** Dates the doctor can act on.
6. **Prep.** The adaptive block, below.

Two things were removed rather than moved: "where you would gain most"
repeated the same ranked list the next move card already leads with, and the
activity feed answered what you did on a page whose job is what to do next. The
feed now sits on the progress tracker, beside the milestones it is a log of.
Mobile height went from 2,124px to 1,588px.

### My roadmap, and why the ladder is not a line

The ladder used to assume a doctor moves up one rung at a time and never
stalls. Irish training does not work like that. HST places are limited, so
people take standalone registrar years, apply more than once, and reach the
same rung years apart; an IMG can spend three years getting where an Irish
graduate got in one. A model that cannot represent that will tell most of its
users they are behind.

Position is therefore three numbers, not one: which stage, which year inside
it, and **how long has been spent not progressing**. `routeTiming()` reports
holding time as its own fact rather than folding it into the stage, because
"BST year 4" is not a thing and printing it would be wrong. Time remaining is
a range with an extra application cycle built into the top end, never a date,
because a doctor who does not get a place this year has not missed a schedule
MedNav invented.

`nextStep()` answers what to do next from where the doctor is standing rather
than from which domain scores lowest, and each answer routes to the module
that actually helps:

| Where they are | Next | Goes to |
|---|---|---|
| Intern or student | Apply to BST | Readiness, Interview prep |
| BST year 1, exams outstanding | Sit the membership parts | Exam prep |
| BST year 2 | Apply to HST, prep the interview | Readiness, Interview prep |
| Outside a training post | Get a place | Gap analyser, Readiness |
| In HST | Reach CSCST | Progress tracker |

The five-rung summary bar that used to open the page said the same thing as
the full ladder below it, so the ladder leads now. Exam and interview markers
on it were inert text; both modules exist, so each marker is the way in.

### The annual roll-forward

The training year turns in July, and the facts that go stale fastest are the
ones nothing else can infer: whether a doctor is in a scheme, which one, and
which year of it. Months post-internship keep accruing either way, so a doctor
who did not get a place looks identical to one who moved up a year.

Once a year the roadmap asks, and branches on the answer: still on the scheme
and whether they moved up, finished it, left it, got a place and which, or no
place this year and what they are working as. It is not a modal. A doctor
reading on a shift break can ignore it, and "ask me later" returns it to the
start rather than dismissing it for the year. The option to move up a year is
only offered when the scheme has another year in it, since BST year 2 plus one
is not year 3.

That answer then feeds the model: `S.inScheme` is believed over inference, so
the ladder stops claiming "Basic specialist training, complete" for someone who
never got a place, and holding months are counted from a confirmed fact.

Every turnover is written to `rollHistory`, **including the ones where nothing
happened**, because "no place this year" is the fact the ladder needs most and
nothing else records it.

### The ladder is editable

The ladder was a projection you could only read. It is now the record the
doctor keeps, because most of what it shows is something only they know.

- **Stages** are markable complete and store a date, so "Complete 8 Jul 2024"
  replaces a bare "Complete". A stated date always beats inference: a doctor
  with 40 months who told us they never got a place stays not-complete, and can
  still mark it done themselves if the inference is simply wrong.
- **Exam rungs** mark a stage passed in place, next to the link into exam prep.
- **The application rung is the application tracker.** Not applied, then
  applied with a date, then one of offer, no offer, or still waiting. An offer
  turns the rung green and reads "offer accepted"; no offer reads "no offer this
  cycle" without any red. Applications are keyed by target and cycle, so a
  doctor who applies in successive years accumulates a real history, and both
  the application and its outcome reach the activity log.

"No offer" is recorded as plainly as an offer. It is the single most common
outcome of a competitive round and a product that only has a slot for good news
is not much use in February.

### How the roadmap is organised

Five cards of identical weight in one column told the eye nothing about what
mattered — an empty placeholder read as loudly as the ladder. The page is now
three labelled phases, using the same `.sec-label` the rest of the app groups
with:

- **Where you stand** — the ladder, and the two timing figures under it.
- **This application year** — the next step, the shape of the year, and the
  work that year's closing date governs. The label reads "What is next" instead
  for a doctor who is not applying into this cycle.
- **The longer view** — where they have been, and what happens if it does not
  land.

Three further changes came out of the same pass. An **empty block is a strip,
not a card**: "Where you have been" with no history still has to say what it
will hold, but it should not occupy a full card competing with the ones doing
work. **Amber is not spent on footnotes**: two full amber panels on one page is
how a warning colour stops being read, so the illustrative-data caveats became
`.ctx.foot`, a dashed footnote that sits with its claim without shouting. And
the alternate routes became **tiles rather than rows** — as rows with
right-aligned buttons, four options produced four different right edges, which
was most of what still read as scattered at the foot of the page.

### The shape of one year

The ladder counts years. It never showed what a single year looks like, and the
year has a fixed rhythm: applications close, interviews run, offers go out, the
post starts. A doctor deciding when to run an audit is planning against that
rhythm, not against a six-year total, so **How this year runs** lays the four
beats out on a rail with a days-away chip on each. Rendered as `.row` they read
as four more rows in a card that already had ten; a rail with nodes says
"sequence" in the shape itself, before any label is read. Exactly one beat is
marked as current — the first still ahead. On a narrow screen the rail turns
vertical rather than disappearing, so the sequence survives.

The work that date governs is **not** on the roadmap. Listing the outstanding
domains here was the roadmap restating the gap analyser at full size. What the
gap analyser did not have, and now leads with, is the single governing fact:
everything on it has to be dated before the application closes, because evidence
dated afterwards will not appear on the application however good it is. Per-
domain due dates never said that. The copy changes with the distance, reading as
months when there is time and as a day count when there is not, and it is gated
on the doctor's own cycle like everything else that reads one.

### One cycle, and whose it is

The application cycle the record holds is the *target's*, and this has now been
the same bug four times: the next-step card, the year beats, the contingency
card, and the ladder's own application rung each read `situation().cycle`
directly and showed this year's HST closing date to a doctor who would not reach
that application for years. An intern applying to BST was being told HST
applications close in 59 days, counselled about missing an HST place, and
offered a General Internal Medicine trunk.

There is now one answer to "is this doctor applying into this cycle this year",
`nextStep().usesCycle`, and every one of those four places asks it rather than
deciding for itself. A doctor who is not applying into it sees no year cards, no
contingency, and "When you reach it" on the application rung instead of a date.
`cycle_leak.mjs` pins the whole class shut: it asserts that a student, an
intern, a BST year-1 doctor and a consultant never see any of the four
illustrative RCPI dates anywhere on the page, and that a BST year-2 doctor and
one holding outside a scheme still see all of it. It caught the fifth instance
too — the Plan B control was being offered to an intern for an application they
reach in about three years — so the rung carries the answer down rather than
letting the renderer decide.

## Application tracker, which used to be the Progress tracker

The Progress tracker's milestones became the roadmap ladder, and its portfolio
items became Gap analysis. What was left was a page of other pages' content. It
now answers a question nothing else did: **am I actually able to apply.**

Gap analysis scores a portfolio. This tracks the paperwork, and the two fail
differently — a weak portfolio scores badly, a missing Garda vetting stops the
application dead however good the portfolio is.

**Nothing is asked for twice.** Wherever the record already knows the answer,
the item derives it and *cannot be ticked by hand*. The CV item reads
`cvUpdatedAt`, Garda vetting reads `gardaStatus()`, the exam item reads
`examStages`, the evidence item reads the score. A checklist that made a doctor
re-enter their vetting date after logging it on the admin page would be the
opposite of one record, every view derives. Derived boxes render as dashed,
non-interactive, and are marked "From your record" with the fact they derived
from — eight of eleven items for a typical doctor.

**The shape is generic; the content is not ours.** Every Irish training
application asks for registration, a CV, references, clearances and evidence.
Exactly which documents, in which format, is the college's own list and is
authoritative over this one — stated on the page, not buried here.

**It adapts.** `CHECKS_IMG` adds the work permit, English language and
qualification-verification requirements only for a doctor they apply to. A
checklist that asked an Irish graduate for a work permit would be noise; one
that never mentioned it to someone who needs it would be worse. A consultant is
told there is no application to track rather than shown an empty list.

**Four stages, not one list.** A tracker that stops at "form submitted"
abandons the doctor for the half of the year that decides the outcome:
references chased over Christmas, an interview, offers, then indemnity and
Garda clearance before day one. The page is now **I Preparation · II
Application · III Selection and interview · IV Starting the post**, each with
its own key dates, its own requirements and its own progress.

Every stage boundary is *derived from the cycle*, not a fixed calendar — prep
runs to the closing date, application from close to interview, selection from
interview to offers, starting from offers to the post start. So it adapts to
whichever college the doctor is applying to rather than being one college's
calendar with other names pasted over it. The page opens on the stage the
doctor is actually in, and both the stage and the application choice stick, so
someone who came back to chase one reference is not returned to the top of the
year.

**Act where you read.** An item that can be acted on carries the action, with
the fuller page as a second option rather than the only one: the CV item marks
itself updated, Garda vetting and occupational health record today's date, an
exam stage is passed, and a rotation is logged inline with the same four fields
the profile uses. `logGardaToday` and `logOccToday` exist because the admin
page's versions read date inputs that only exist there; entering any other date
is still what the admin page is for. Everything writes to the one record, so the
admin page and the profile show it immediately.

**Two applications, and what is shared between them.** A doctor running two gets
two cards. Requirements marked shared are one fact about the person — one CV,
one Garda vetting — and are keyed by item alone, so ticking one counts for both.
The rest are keyed by `target::cycle::item`, because references and a submitted
form are not shared between two applications. The test asserts exactly that:
ticking photo ID ticks both, submitting one form submits only one.

**One date, stated once.** Everything is due by the closing date, so chipping
every row with the same date produced seven identical amber chips and taught the
eye to skip them. The card states the governing date once; a chip now means
"this one is different", which in practice is the evidence upload window that
closes after the application does.

**A cycle belongs to an application, not to the record.** Switching to a second
programme showed that programme's name and college but the *primary* route's
stage dates, because the phase functions reached for `situation().cycle`. They
now take a cycle, resolved from whichever application is selected — the same
class of bug as the roadmap's cycle leak, caught by a test that switched to GP
and read the dates back. `cycleEvents()` builds any cycle's dated events the way
`deadlines()` builds the primary one, and a test asserts the closing date on the
tracker matches the deadlines page so the two can never drift.

Custom milestones became custom requirements, joining the checklist rather than
a milestone list no page shows any more.

## Gap analysis, which used to be three pages

Application readiness, Shortlisting score and the old Gap analyser were one
table — `DOMAINS` — rendered three times by hand, with three separately
maintained orderings. They drifted, and the merge was not a tidying exercise:
the drift was producing wrong answers.

**The bug that settled it.** The gap page's tier list named five domain ids and
omitted `exams`. A doctor holding no MRCPI stage at all — eight points down, the
largest single gap the rubric allows — opened the page whose entire job is
completeness and was told **"No gaps left. Every domain is complete against the
published criteria."** The summary card directly beneath it said the opposite,
and its closing line ("closing the audit and QI gap alone is worth more than the
other three together") was hardcoded prose that was simply false for that
doctor.

Nothing on the merged page hand-lists a domain. It iterates `DOMAINS` and orders
by points at stake, so a domain cannot be dropped again, and the page finally
does what its subtitle always promised. Two further bugs surfaced the moment
exams became visible: `gapActions` had no branch for it, so the domain you sit
an exam for was described as accruing with time in post; and `levers()` offered
"start a second project" to a doctor whose second project was already at 40%,
so the page's headline action contradicted the row's.

**The page, in order:** the eligibility framing; the two measures side by side;
the gap between them; the rule that governs all of it; domain by domain; and the
interview note. Each domain row carries both bars — assembled solid, scores
hatched, because banded scoring moves in steps and the fill should say so — with
the divergence explained only where the two measures are 15+ points apart.
Printed on every row it would be wallpaper.

**What was dropped:** the ranked levers list (the domain ordering *is* that
ranking, and its top item is the lead card's button), the summary card, the
Met/In-progress/Behind chips (a third status encoding next to two bars and a
points chip), and the three tier headings.

**Routes, not just pages.** `#/readiness` and `#/score` still resolve — links
live all over the app and in whatever a doctor has bookmarked, and a merge is no
reason to break either. `ROUTE_ALIAS` maps them to the module that absorbed
them, so a consultant landing on `#/score` still gets the "nothing here is
scoring you any more" banner that the nav registry provides.

**Nav:** thirteen items became eleven, and "Your readiness" folded away. Its one
surviving page sits in *Your applications*, which is what it was readiness for.

### Movement, not just a deficit

A page that only ever shows what is missing is a nag. `logActivity` now also
snapshots the score, and only when the total actually changed — a log of
identical numbers would be noise, and a trend needs turning points rather than
ticks. The page reports the delta since the first snapshot, with a small line
when there are three or more.

This has a pleasant side effect: logging a third teaching session writes no
snapshot, because three sessions still score 2. The log makes banded scoring
visible by staying silent.

### Notes against a domain

Six parallel workstreams and nowhere to record why one is stalled. A free-text
note per domain, edited in place like the rotation row, styled as the doctor's
own rather than as a warning.

### One rubric, and whose

A doctor tracking a second specialty sees one score, and it is the primary
college's rubric. The other route weights these domains differently and is not
modelled, so the page says so rather than letting the figure be read as covering
both.

### Plan B, and what happens when a cycle does not land

Contingency used to be a card that appeared on the roadmap the moment a doctor
came within six months of applying. It told someone mid-application that the
product had already started planning around their failure, and it did it
unprompted, every visit. It is now asked for: a **Plan B** control sits on the
application rung itself, the rung it is contingent on, and it is not offered at
all to a doctor who is not applying into this cycle or who already holds a
place.

It opens on a question rather than on the routes, because everything below
depends on the answer and the product had no way of knowing it: *did you get a
place in this cycle?* Yes stops there — someone with a place is not counselled
anyway. No or still-waiting opens the routes.

The answer writes to the same `applications[]` record the ladder keeps, so
answering it in Plan B also updates the rung, and answering it on the rung
satisfies Plan B. One fact, one place: a doctor must never be able to answer
this twice and get two answers. Where no application was logged, the record is
created with an empty `appliedAt`, which is never rendered once an outcome
exists — so recording "no offer" never claims an application that was not made.

### A different specialty from here

A doctor who has missed a place is often asking a different question, which is
whether the training already done opens anything else. Plan B answers it in two
groups, and conflating them would be dishonest:

**Same membership exam** is *derived* from `SPECIALTY_INFO` rather than
asserted. Every RCPI medicine specialty is entered on MRCPI, so a doctor holding
it genuinely does carry that exam across all of them. That is a fact about our
own data, not a claim about entry rules. These render as a pick list rather than
tiles: the describing sentence was identical for all six, so it is said once
above them.

**A different exam** is not derivable, and deliberately not a free-for-all. You
cannot drift from general medicine into plastic surgery, so listing every
non-MRCPI specialty as reachable would be false. `PIVOTS` is a narrow, explicit
map holding only general practice — the move the product owner named as common,
and one ICGP does enter from hospital training. It is labelled illustrative and
carries its own footnote: whether specific posts count towards it, and how much,
is ICGP's rule and is not modelled here.

Adding one is not a detour. **Track this too** writes to `otherTargets`, which is
the list the dual-track comparison on the same page already reads, so exploring
a specialty and tracking one are the same act rather than two features.

### Where two routes diverge

Two ladders side by side were mostly the same ladder twice, because both read
off one record. The question a hedging doctor actually has is which work counts
twice and which only counts once, so **Where these routes differ** leads with
the larger and less obvious half: the portfolio is one portfolio, and months
post-internship count once and apply everywhere. Only then does it table what
genuinely differs, one column per route — exam family, college, closing date,
interview date. A row where every route agrees is labelled as such rather than
being dressed up as a difference. Dates carry their year, because two routes can
close twelve months apart and would otherwise read as the same season.

It appears only inside the dual-track view, and it carries the caveat that
matters: entry rules that let one route credit time served on another are not
modelled here, so eligibility has to be checked with each college.

### Where you have been, and what if it does not land

Two cards sit under the next step, being backstory and contingency rather than
action.

**Where you have been** renders `rollHistory` as a record of the route actually
taken rather than the one planned. Empty until the first annual update, and it
says so rather than faking a history.

**If this cycle does not land** appears within six months of an application, or
immediately for someone already outside a scheme. Places are limited and a good
application can still miss, and the product knew that while saying nothing,
leaving the doctor to discover it alone at the worst moment. It is descriptive
only: what people commonly do, never what this doctor should do, with an
explicit note to check eligibility with the college.

The alternate routes are illustrative. The two that trace to research are in the
MedPath competitor analysis: ICAT is a funded-PhD pathway entered across
specialties, and several RCPI medicine subspecialties sit under a General
Internal Medicine trunk. A surgical trainee is never sent down a medicine trunk,
and General Internal Medicine is not offered itself as its own alternative.

### The prep block

Exam and interview prep are paid from day one and priced per exam and per
programme, so the surface that sells them cannot be a generic upgrade prompt.
It has to name the doctor's own college and exam. `prepBlock()` has three
registers:

- **Near.** An interview inside 60 days leads with the countdown.
- **Far.** Otherwise it leads with what the panel scores, on the argument that
  domains are cheap to fix two years out and expensive a fortnight before.
- **No pathway.** Someone who has not picked a specialty is shown several entry
  points side by side rather than being defaulted into medicine, because
  guessing the exam family is the same failure as guessing the college.

A consultant sees no prep block at all. Weights come from `DOMAINS`, which the
readiness page already tells doctors their interview is scored against, and
carry the same illustrative status as the rest of the rubric.

### How it adapts

The dashboard used to look adaptive and mostly wasn't. Grade was read in one
place, IMG status in one place, and the rest rendered identically for an
intern, an SHO and a consultant. Several strings were simply hardcoded, so a
surgical trainee was shown "HST Cardiology applications close" and scored
against MRCPI stages.

Adaptivity now runs through one function, `situation()`, which derives tier,
college, exam family, IMG status, target count and position in the application
cycle from the record. **No view reads a raw record field to decide what kind
of doctor this is.** Add a grade or a specialty and every view updates at once.

Structure is a fixed list of zones — Overview, Your pathway, Your readiness,
Your applications, Preparation, Practical, Account. The zones never move,
which is what lets a pricing boundary land on one later without reshuffling a
nav people have already learned. What adapts is the **state** of each module,
and there are only three:

- **active** — the normal case
- **ahead** — real, just not yet, with the date it starts mattering
- **aside** — not on your route, with the reason in plain words

Nothing is ever hidden. A module that does not apply still renders, still
routes, still reachable by keyboard; it just stops competing for attention and
says why, in the nav and again on the page. Personalised disclosure without a
stated reason reads as the product making decisions behind your back.

CPD is the clearest worked example. A doctor in a training post and an NCHD
outside one are held to different published requirements, so a single
hardcoded target is simply wrong for one of them. `cpdRegime()` derives which
applies, names it, and steps aside the moment the doctor sets their own.

Adaptivity is verified rather than assumed: `test_personas.mjs` renders every
view against eight personas (SHO, surgical trainee, GP trainee, Nephrology,
intern, consultant, newly arrived IMG, dual-track) and asserts each one both
names what it should and never names another specialty's college or exam.

### Practical tracking

A **Practical** nav group sits between Planning and Account, for the things
that have their own clock and are never scored: **Occupational health and
admin** (Garda vetting, Hepatitis B and immunisation status, occupational
health clearance) and the **CPD tracker**. Deliberately kept out of onboarding:
they're dashboard-tracked state, not questions asked up front.

- Garda vetting is modelled as a **renewal, not a one-off tick**: one logged
  date plus a computed 3-year expiry (`gardaExpiry()`), with a status ladder
  from current, through "renew this year" at 180 days out, to "renew soon" at
  56 days, to expired. It nudges on Today and badges the nav item once it's
  critical, the same pattern as the existing deadlines/gaps badges.
- The admin page's intro banner adapts for someone newly in the Irish system
  (`newToIrishSystem()`, from the onboarding route/origin answers) but the
  page itself is never hidden from anyone, since vetting renews for everyone
  already working here too.
- CPD is modelled as an **annual counter independent of training
  milestones**: points logged additively against a target and a cycle end
  date, both user-editable. The default 50-point target and its cycle date
  are explicitly labelled illustrative in the UI, not asserted as a real
  college requirement.
- CV freshness (a "mark updated today" stamp with a staleness hint) and
  rotation history (hospital, specialty, from/to dates, add and remove) live
  in a new card on the profile page, alongside the existing record and
  location cards.

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
- Dashboard: `EXAMS` is the stage registry — names, formats, structures and
  whether a stage is sat to enter training or during it. The *shapes* are close
  to right and the entry/membership distinction is real and important, but every
  college sets and changes its own, and `IV_DOMAINS` and `INTERVIEWS` are the
  same: a defensible generic shape, not any college's published assessment.
  Confirm all of it before launch. `TOPICS` is an eight-item placeholder and is
  not any stage's syllabus.
- Dashboard: `ENTRY_PROGRAMMES` — the six basic-training trunks, and the
  `feeds[]` list saying which specialties each one leads to — is the shape Irish
  training takes, not any college's published prospectus. `RUN_THROUGH` is the
  same. Getting a `feeds[]` entry wrong sends a doctor to the wrong trunk, which
  is a worse error than a wrong date: confirm the full map before launch.
- Dashboard: **the evidence-upload date is derived, and it derives wrong.**
  `cycleEvents()` places "Portfolio evidence upload closes" at
  `addDays(cyc.apply, 26)` — *twenty-six days after applications close* — and
  `deadlines()` repeats the same expression. In the merged calendar the two
  rows now sit side by side and the ordering is plainly odd: *Applications
  close, 8 Nov 2026. Portfolio evidence upload closes, 4 Dec 2026.* The row's
  own note says "evidence must already be dated", which reads as a condition to
  meet *before* the form closes, not a month after it. Both the offset and the
  direction are invented. Take this date from each college with the rest of the
  cycle rather than deriving it; it is left as-is until then because guessing
  the other direction would be the same error mirrored.
- Dashboard: the **My route** order is derived from that same `when` field
  (`WHEN_ORDER` in `routeStops`), so it inherits its uncertainty. The principle
  — entry stages before the application, membership and exit stages after — is
  real. Which stage falls into which bucket for a given college is not verified,
  and getting one wrong reorders a doctor's plan. Confirm the classification per
  college at the same time as the registry itself.
- Dashboard: `CHECKS` and `CHECKS_IMG` are the *shape* an Irish training
  application takes, not any college's published requirement list. The
  categories are safe (registration, CV, references, clearances, evidence, right
  to work); the specifics — which documents, which formats, which English tests
  and scores, what counts as qualification verification — are each college's and
  the Medical Council's. Flagged on the page itself. Replace with the real per-
  college lists before launch, or keep the page explicitly framed as a starting
  checklist rather than the authoritative one.
- Dashboard: `PIVOTS` claims that hospital training is commonly credited
  towards general practice, and Plan B offers GP as a move off every hospital
  exam family on that basis. The direction is real and was named by the product
  owner; the **entry and credit rules behind it are ICGP's and are not
  modelled** — whether a given doctor's posts count, and how much, is theirs to
  say. Flagged on the card itself. Before launch, either confirm the ICGP
  position and cite it, or narrow the claim to what can be cited. The same-exam
  group needs no such note: it is derived from `SPECIALTY_INFO`, so it is only
  ever as right as that table.
- Dashboard: `CYCLE` gives every college one illustrative application,
  interview, offers and start date, used for the four beats on **How this year
  runs**, for the divergence table, and for a doctor's "also applying to"
  specialties. Same status as the primary `deadlines()` dates it sits beside:
  replace both from each college's actual published cycle before this reaches a
  real doctor. The `offers` dates are the weakest of the four — no college
  publishes an offers date the way it publishes a closing date — so they are
  placed roughly five to six weeks after interview and are flagged on the card
  itself along with the rest.
- Dashboard: the CPD tracker's two regime targets (50 points in a training
  post, 20 outside one) and the 31 December cycle-end date are **illustrative
  and unverified**, and flagged as such in the page itself. Both numbers came
  from search summaries of the Medical Council professional competence scheme
  and the HSE CPD support scheme, but neither primary source could be opened
  to confirm them, so they carry `source_unreadable` status rather than
  `confirmed`. Verify against both bodies before this reaches a real doctor.
- Dashboard: Garda vetting's 3-year renewal period is asserted from the
  product owner, not yet from the National Vetting Bureau. Same treatment.
- Dashboard: `STAGE_YEARS` and `HST_YEARS` are illustrative. Intern at 1 year
  and BST at 2 are stable across routes; HST length genuinely varies and only
  Cardiology (6) and General Practice (4) came from the product owner. Every
  other specialty falls back to the default of 6 and needs its real published
  duration before launch.
- Dashboard: `SPECIALTY_INFO` now carries the target and college for all 22
  specialties, but the `target` strings are constructed ("HST " + specialty)
  rather than taken from each college's published programme name. Check the
  real programme titles before launch, particularly the non-HST ones
  (Radiology, Histopathology, Ophthalmology, Public Health Medicine).
- Preparation pages: every fee, date, weight and station count is illustrative.
  Replace from the colleges' published documents, and mark anything not yet
  published rather than carrying last year's number forward.
- Dashboard: interview prep's **Interview scoring criteria**, **Knowledge
  base**, and the twelve scenarios shared by **Voice simulator**, **Video
  simulator** and **Mock interview** are all placeholder content, written out
  in full for this prototype rather than left as "to be authored" stubs, and
  each surface says so on the page itself. None of it is any college's
  published material: the domain weights and five-band rubrics in
  `IV_CRITERIA`, the technique notes and worked example answers in `IV_KB`,
  and the scenario prompts in `IV_SCENARIOS` all need to be written by doctors
  who have sat on these panels before this reaches a real one, per the
  standing rule against generated question banks.
- Dashboard: interview prep's grading is **simulated, not real**.
  `simulateGrade()` produces an illustrative score, breakdown and feedback
  from a small hand-written pool — there is no backend in this app and
  nowhere safe to hold a real model API key client-side, so no recording is
  ever actually analysed. Every place a grade appears says "simulated" next
  to it. Replacing this with a real model call needs a backend (to
  transcribe the recording and hold the API key) before launch; the function
  is written so that swap does not require reshaping anything that reads its
  output.
- Onboarding creates no account and sends no email. The magic-link step has an
  explicit demo control that says so rather than pretending to wait.
- Milestones and the roadmap trail now derive from the record, so a doctor who
  says they hold two exam stages is not shown a third as passed. The historical
  dates that used to be hardcoded are gone.
- The dashboard now acts on both onboarding fields that used to be dropped at
  the door. `seedFromUrl()` only ever copied keys already present in
  `DEFAULTS`, so `basedIn`, `willing`, `dualTrack` and `otherTargets` arrived
  from onboarding and were silently discarded. Fixed by adding them to
  `DEFAULTS`, so they now survive the handoff and can be edited afterwards from
  `#/profile`.
  - **Hedging.** `SPECIALTY_INFO` and `CYCLE` in `app/index.html` resolve a real
    exam family and college for each name in `otherTargets`, and My roadmap,
    Deadlines and Today all render a second, clearly-labelled set of dates for
    them. The `CYCLE` dates are illustrative, exactly as the primary
    `deadlines()` dates already are, and every other-target date says so on
    the card rather than presenting as a published one.
  - **Location.** Matched to you tags its six demo rows with a region and
    reorders by `S.willing`, badging matches "Near you". Nothing is ever
    hidden by the filter, deliberately: six demo rows filtered down to zero
    would read as "found nothing" rather than "this is a small demo".
  - Neither field is scored. Readiness and the shortlisting score are
    unchanged by either.

## Exam prep and interview prep, rebuilt as modules

Measuring every page found the thing worth acting on: the two surfaces that are
paid from day one were the two thinnest in the app. Exam prep had three controls
and ninety-two words; interview prep had one. The free Gap analysis had
seventeen.

### The unit is a stage, not a family

Nobody revises for "MRCPI". They revise for Part 1, sit it, then start on
something with a different format and a different syllabus. So `EXAMS` lists
**stages**, and a stage is what gets recommended, what has a hub, and what a
mock score belongs to.

`examParts()` previously assumed every family was three parts shaped *Part 1 /
Part 2 written / clinical*. That is not what ICGP runs, and not what MRCS,
MRCEM or the rest run either. The registry also records **when** a stage is sat,
because an applicant to GP training sits the SJT and CPST to get *in* while
MICGP is the membership exam sat years later *inside* training — and
`SPECIALTY_INFO` said only "MICGP", which is the wrong exam to send an applicant
to prepare for.

### The bug this fixed

A doctor tracking Cardiology and General Practice, holding two MRCPI stages, was
shown this on the **GP** application card:

> **Exam stage held** · *From your record*
> **2 of 3 MRCPI stages held**

That is MRCPI progress offered as evidence that the GP application's exam
requirement is met, two clicks from a divergence card correctly saying GP needs
MICGP. `S.examStages` was one scalar read in twenty-two places, and every one of
them meant "stages in the family of whatever route is being looked at".

It is now derived per family: `stagesHeld(specialty)` counts the stages held in
the family that specialty needs to enter training. The GP card now reads *0 of 2
ICGP entry stages held*, the ladders name their own families, and the scalar
survives only as a seed so a record from onboarding keeps its progress.

A side effect worth noting: MRCS is two parts, so a surgeon holding both now
correctly holds full membership. The old three-part assumption had been
inventing a stage they would never sit.

### Two levels: catalogue, then hub

A doctor arrives with one of two questions. *What should I be sitting?* is
answered by a catalogue — what your route needs next, then every exam grouped by
college, browsable. Someone who came for exams alone and never finished
onboarding still gets a usable list, and the recommendation is derived rather
than chosen by us: the first stage they do not hold in the family their route
needs, plus the same for a second route, plus the language requirement for an
IMG.

*Get me ready for MRCPI Part 1* is answered by a hub: study planner, knowledge
base, question bank, mock exam, analytics, live tutor.

**The hub adapts to the stage.** A clinical or OSCE stage is not offered a
question bank, because that is not how anyone prepares for one. A stage sat
during training has no application to pace a plan against and says so rather
than inventing a countdown.

### Interview prep, same shape

One interview per college, derived from the routes being tracked, so a
dual-tracking doctor sees the RCPI structured panel and the ICGP scenario
assessment as the different things they are.

The surface that justifies the module is **Your evidence**. The interview scores
the same domains the portfolio does, and this product already holds the
portfolio, so when the panel asks about quality improvement it can name the
audit the doctor logged. Domains with nothing behind them say so. Nothing else
can do this, because nothing else holds both halves.

Self-ratings are one to five per domain, they drive the readiness figure, and
Analytics ranks the weakest first. Clicking a rating you already hold clears it,
so a doctor can undo without picking a number they do not mean.

### Locked, and you can see what you would get

A prep is **locked** until it is unlocked. The doctor's own route comes
unlocked with the account; everything else is taken on deliberately.

Crucially, a locked card lists **what is inside before unlocking** — the six
surfaces, each with what it does and what it feeds back into the record. Nobody
should have to pay to find out what they are paying for. Looking inside a locked
prep gives a preview with the same feature list and one unlock control, and it
does **not** swap the shell: browsing is not entering, so the doctor can still
see where they are in the app. Unlocking from there drops them straight into the
hub they just unlocked, which is the point of paying.

`S.unlocked` is one list covering both kinds, so exams and interviews cannot
drift apart. **Nothing charges anybody**, no billing is wired up, and every
surface that mentions it says so.

### Interview preps are products, not a per-college derivation

A doctor applying to BST General Internal Medicine is preparing for a different
interview to one applying to HST Cardiology, even though both go through RCPI,
and the old per-college lookup could not say so. `INTERVIEWS` is now a list of
thirteen products carrying a college **and a tier**, and `interviewFor()` picks
the one matching the tier the doctor is actually applying at — an intern is not
shown an HST panel.

### Search and specialty groups

Both catalogues carry the same search box and the same specialty filter row,
rendered by one `prepFilters()` so they cannot diverge. Groups are **specialties**
— Medicine, Surgery, General Practice, Psychiatry and the rest — rather than
colleges, because that is how a doctor thinks about what they are looking for.

Search matches **word starts, not substrings**: a plain `indexOf` had "BST"
matching "o*bst*etrics", which is the kind of result that makes a search box feel
broken. Every typed term has to start some word in the name, college, specialty
or format. Typing is live, and the caret position is restored after the rerender
— a search box that loses focus on the second keystroke is worse than none.

### A countdown belongs to a cycle you are in

`weeksTo()` read `situation().cycle`, which is always the primary route's, so an
RCSI stage a cardiologist had merely unlocked showed RCPI's closing date. It now
requires the stage's college to be one the doctor is actually applying through.
Same leak as the roadmap's and the tracker's, third instance of the pattern.

### A stale definition that shadowed a new one

Worth recording because it cost real time: rewriting `examCatalogue` replaced
the function and its card renderer, but a second `examCard` lived further down
the file and, being declared later, silently won. Every card rendered through
the old path — no lock state, no specialty chip — while the new code looked
correct. There is now a check for duplicate top-level declarations, and it
should be run after any block replacement.

### A prep product takes over the shell

A prep product is opened daily for six to eight weeks. The dashboard around it
is built for a monthly visit, and making someone climb back out to a card grid
every time they want the next surface is the wrong shape for that.

So entering one swaps the shell. The sidebar becomes that product's own nav —
Overview, then each surface — the scope box says which product you are in rather
than which consultant post you are years from, and the topbar names the product.
Same app, same record, different chrome. `activeWorkspace()` derives it from the
route plus whichever stage or interview is open, so there is no extra state to
keep in sync.

**Two levels out, and they are different places.** The in-page control goes up
to the catalogue; the first nav item leaves the product entirely for Today.
Having both land on the catalogue was two controls for one action.

The workspace nav is buttons rather than links, because these change a surface
inside the product rather than navigating the app. Both exits are reachable and
operable from the keyboard, which is asserted rather than assumed: the failure
mode of every product that takes over the screen is being unable to find the way
out.

### The catalogue is a shelf, not your shelf

Interview prep lists **every** interview that exists, not only the ones a
doctor's route implies. Someone switching specialty, or hedging late, needs to
see what is there before committing. Their own routes are marked *Included*;
anything else can be added, and added ones get their own section.

`ivSubscribed` records that a doctor wants a prep. **Nothing charges anybody**
and no billing is wired up — the page says so rather than implying a
transaction happened.

### What is deliberately not built

No questions, no teaching text, no model answers. The knowledge base and
question bank show topic structure and coverage with the content marked as
authored by doctors who have sat the stage. The mock records a score the doctor
already has and feeds a **predicted** figure only — a mock is not a stage held
and must never touch the shortlisting rubric, which a test asserts. Live tutor
is named and left honest.

## The prep listings, rebuilt as course cards

The catalogues were card stacks: recommended, included, unlocked and
everything-else all rendered as full-width `.card` blocks with four or five
chips each. At nineteen exam stages and thirteen interview preps that is a very
long column of near-identical rows, and nothing in it said *what order any of
it comes in*. The rebuild takes the "course cards" direction: a grid of small
cards, one colour band per kind, and a second tab carrying the order.

### Separate pages, one shared route

**Exams and interviews stay two pages.** A doctor arrives wanting one or the
other, and a merged shelf made both harder to scan. `VIEWS.exams` and
`VIEWS.interviews` are untouched as routes, keep their own nav entries, and
each shelf contains only its own kind — a test asserts that every `.pc-k` on
the exams page reads *Exam* and every one on the interviews page reads
*Interview*.

What the two share is the **order**, so each page carries the same two-tab
header:

```
[ Exams 19 ] [ My route ]        [ Interviews 13 ] [ My route ]
```

`routePanel()` is built once and rendered identically from either side. The
choice lives in one key, `S.prepTab`, not one per page: a doctor who switched
to the route on Exams means it on Interviews too, and a test walks from one
page to the other to confirm the tab stays selected.

### The order is read off the registry, not invented

`routeStops(specialty)` builds one line per target:

```js
var WHEN_ORDER = {entry:0, membership:2, exit:3};
// the interview sits at 1, because the interview IS the application
```

`when` was already on every exam and already labelled illustrative. An *entry*
stage is one a route asks for before you can apply; *membership* and *exit*
stages are sat once you are in. So the interview slots between them, and
nothing new had to be asserted about any college's timetable to place it.

Three things fall out of that rather than being special-cased:

- **General practice crosses two families.** `routeFamilies()` returns both
  `entryFamilyFor(sp)` (ICGP entry: SJT, CPST) and `SPECIALTY_INFO[sp].exam`
  (MICGP, the exit exam). One line, four stops, MICGP last.
- **An IMG's language requirement comes before all of it**, at `ord:-1`, because
  registration precedes every other stop.
- **A dual-track doctor gets two labelled lines, not one merged one.** Merging
  them would have put RCPI's dates on ICGP's exams — the cycle leak this file
  has had at every view that showed two routes at once. A test asserts two
  `.rte` lines with two headings naming two colleges.

State per stop: an exam is *done* when `stageHeld()` says so; an interview is
done only when the application it belongs to has an **outcome recorded**,
because there is no other way to know you sat it. The first stop that is not
done gets the `now` marker, and it is the only primary button on the line.

For a cardiology SHO holding MRCPI Part 1, `now` lands on the **HST interview**,
not on Part 2 Written — the entry stage is behind them, so applying is what is
next, and Part 2 is sat during training. That is the ordering doing real work
rather than decorating.

### The card language

One `.pc` card, two colours, and the colour is never the only carrier:

| | Exam | Interview | Locked |
|---|---|---|---|
| band + border | mint | plum | grey |
| kind line says | `EXAM · RCPI · INCLUDED IN YOUR ROUTE` | `INTERVIEW · ICGP · UNLOCKED` | `… · LOCKED` |

Every state a colour carries is also written into `.pc-k`, which a test reads
off every locked card. The progress bar only draws when there is something real
behind it — a held stage, a predicted figure from mocks, topic coverage, or a
self-rating. An empty bar reads as nought out of a hundred, which is a
different claim from *not started*.

Two things moved off the card in the rebuild:

- **`prepFeatures()` left the shelf.** Six surface tiles inside a third-width
  card is unreadable. Locked cards now say *"6 surfaces inside. Look inside to
  see them before unlocking."* and **Look inside** goes to `prepLocked()`,
  which still lists all six and still takes no payment. The property the user
  asked for — see what you would get before paying — is intact, one click
  further in, and a test checks both the sentence and the two buttons on every
  locked card.
- **Mark as held is gated on `open`.** It is book-keeping on your own route, not
  a shelf action; on all nineteen cards it was nineteen buttons of noise.

### Colour-coded by specialty

Every exam stage wears its specialty's hue: the 8px band, the card border, the
progress fill, the route node and the group swatch all read one token, `--sp`.
A shelf of nineteen stages stops being one undifferentiated block, and a route
reads as **one colour with the interview cutting across it** — an RCPI line is
blue with a plum interview, a GP line teal with a plum interview.

**Interviews wear the same hues.** A Medicine interview is the same blue as a
Medicine exam, so a doctor's route is one colour across both shelves — a test
asserts all seven shared specialties resolve to the identical `--sp` on both
pages.

That consumes the hue channel, so **the exam/interview distinction moved to two
other channels**: an exam band is solid and an interview band is hatched, and
each eyebrow carries its own nav icon (book / mic). On the route, an interview
stop's node is hollow where an exam stop's is filled. None of it depends on
colour.

### Why four specialties have no colour

The interview registry names **eleven** specialties; the palette carries eight.
Four searches were run before accepting that, not one:

| Attempt | Optimised for | Worst-pair CVD ΔE | Worst-pair normal-vision ΔE |
|---|---|---|---|
| 11 hues, 7 fixed | all pairs | 7.2 | 14.6 |
| 11 hues, 7 fixed, longer | all pairs | 7.7 | 14.7 |
| 11 hues, shelf order | adjacent pairs | 10.7 | 21.0 |
| 11 hues + hue-family constraint | all pairs | 7.2 | 13.4 |
| four muted second-tier hues | all pairs | 1.5 | 6.9 |
| **7 specialty hues + one merged bucket (shipped)** | **all pairs** | **9.2** | **17.7** |

Floors are CVD ≥ 8 and normal-vision ≥ 15. Only the eight-slot set clears them.

The third row is the instructive one: optimising the *adjacent* pairlist scored
well by parking two near-identical magentas in blocks far apart on the page.
That satisfies the metric and fails the reader, which is why the shipped set is
validated on all pairs. The fifth row kills the obvious escape hatch — muting
the four extra hues makes them *less* separable, not more, because low chroma
compresses the space they had to fit into.

So the four specialties with **no exam on the other shelf** — Anaesthesiology,
Radiology, Pathology, Public Health — share **one labelled group, "Other
specialties"**, with one hue. They are the right four to merge precisely because
they have no exam counterpart, so no cross-shelf coherence is lost.

`specGroup()` does the bucketing in one place, and everything downstream reads
it: the group headings, the specialty filter pills (nine, not twelve), and
`specClass`. Two things deliberately do **not** fold:

- **The card still names its own specialty.** A Radiology interview's eyebrow
  reads `RADIOLOGY · FACULTY OF RADIOLOGISTS · LOCKED`. Only the grouping and
  the hue are shared, and a test asserts all four distinct names survive.
- **Search still matches the real specialty.** Typing "radiology" finds it;
  the bucket name is added to the haystack as well, so "other" finds all four.

The group says what it is where it sits, rather than leaving a reader to work
out why four specialties share a heading.

The eighth hue was searched for the same way as the first seven, over every hue
family: `#8665f0` violet holds the set at **CVD ΔE 9.2 and normal-vision 17.7**,
identical to the seven-hue margins. A bright blue scored the same on CVD but
landed beside Medicine's blue, so the violet was taken instead — the binding
pair is Obstetrics ↔ Emergency Medicine either way, not the new slot.

Adding a **ninth** hue later means removing one, not appending. `sp-none` stays
as the fallback for a group the map has never heard of, and a test asserts
nothing currently falls through to it.

| Slot | Specialty | Block `--sp` | Label `--sp-t` |
|---|---|---|---|
| 1 | Medicine | `#0056b6` | `#0b57b2` |
| 2 | Surgery | `#9a3506` | `#9a3506` |
| 3 | General Practice | `#01baac` | `#008074` |
| 4 | Psychiatry | `#9c087d` | `#912b76` |
| 5 | Emergency Medicine | `#f8535a` | `#c6484c` |
| 6 | Paediatrics | `#daa50b` | `#9b6900` |
| 7 | Obstetrics and Gynaecology | `#4d920c` | `#418200` |
| 8 | Any specialty | `#64767c` | `#4a585d` |
| 9 | Other specialties | `#8665f0` | `#7760cc` |
| — | fallback (`sp-none`) | `#8a9a9f` | `#4a585d` |

**Two steps per specialty, because one cannot do both jobs.** `--sp` is the
block colour — an 8px band, a 7px bar, a 2.5px border, a 31px node. `--sp-t` is
the darker step of the same hue that the *label* beside it wears, and every one
of the eight clears **4.5:1 on white and on paper** (measured in the rendered
page, not asserted: 4.74 at worst, on Emergency Medicine).

**Validated as a categorical set on the all-pairs list, not the adjacent one**,
because a shelf puts every specialty on screen at once rather than in a fixed
neighbour order. Worst pair: **CVD ΔE 9.2** (deutan, target ≥ 8) and
**normal-vision ΔE 17.7** (floor ≥ 15). Lightness band and chroma floor pass for
all eight. The hues were found by fixing each specialty's hue angle — so blue
stays blue and orange stays orange — and searching only *lightness*, which is
the axis that survives colourblindness; that is why the set is deliberately
uneven in lightness rather than a tidy single-L ramp.

Two hues were constrained out of the search rather than chosen freely:

- Nothing near **the interview plum** (`#6b5ca5`), or an O&G exam and an
  interview would be indistinguishable on the one route line where both appear.
- Nothing near **brand mint** (`#14b394`), which is the "held/good" status and
  every primary button. General Practice was re-stepped to a cyan-teal for
  exactly this reason.

**Several blocks sit under 3:1 on white**, which the palette validator flags as
"relief required". The relief is structural: **the colour is never the carrier.**
Every card's eyebrow now leads with its specialty in words, in that specialty's
own `--sp-t` (`MEDICINE · RCPI · INCLUDED`), and every group heading is its own
legend — a swatch plus the specialty name in the matching text step. A test
asserts every card names its specialty and that no card relies on the hue alone.

**Fixed order, never cycled.** `SPEC_CLASS` maps eight specialties to eight
slots; anything not in it gets the neutral `sp-any` rather than a generated
ninth hue. That is why the interview registry's extra specialties do not quietly
acquire colours nobody validated.

Two knock-on fixes in the same pass:

- `.pc-why`, the "why this is recommended" panel, wore `--mint-soft` — the app's
  *good* status tint. A reason is not a status, and spending a status tint on
  one is how a colour stops meaning a single thing. It is now paper with a
  3px left rule in `--sp`.
- The swatch class was first written as `.sw`, which the application tracker
  already uses for its programme-switch buttons. Renamed `.spdot`.

### Headings

Card titles are `h2`, one step below the page `h1`. They were `h3` in the first
cut and axe caught it on all four panels — `.sec-label` is a styled `<p>`, so
an `h3` after an `h1` skips a level. Route stop titles are `h2` for the same
reason.

### What did not change

`prepMatches()` (word-start search), `prepInGroup()`, `prepGroups()` and
`prepFilters()` are untouched and now sit above a grid instead of a stack. The
specialty pill row still lists **every** group rather than only groups present
in the current result, so it does not reshuffle as you type — which is why a
search test has to read card titles rather than the whole panel's `innerText`.

Hubs, `prepLocked()`, the workspace shell and `S.unlocked` are all unchanged.
Unlocking still writes one list covering both kinds, and still charges nobody.

## Programmes, the thing you actually apply to

Until now the product had no object for "a programme". Every target it could
name was `HST something`, `GP training scheme`, or `X training` — **23 of them,
none at BST.** Tier was *derived* from months post-internship and never chosen:

```js
var tier = months <= 0 ? "intern" : S.stage === "spr" ? "hst" : "bst";
```

Meanwhile `INTERVIEWS` already shipped three `tier:"bst"` products. **A doctor
could buy BST General Internal Medicine interview prep for a programme the
tracker could not track.** The two halves of the app disagreed about whether BST
was a thing you apply to.

### The entry layer is written; the higher layer is generated

Irish basic specialist training is a handful of broad trunks, not one per
specialty. **There is no BST Cardiology** — you do BST General Internal Medicine
and then apply to HST Cardiology. So `ENTRY_PROGRAMMES` names six trunks, each
with a `feeds[]` list, and the higher and run-through layer is generated from
`SPECIALTY_INFO` so the two can never drift apart. `RUN_THROUGH` marks the
specialties entered directly, which get one programme rather than two and would
be wrong to call "higher".

A test asserts the entry layer exists, and that **`BST Cardiology` does not**.

### Additive, because fifty call sites read the old fields

`S.specialty` has 33 readers and `S.otherTargets` 17. Rewriting all of them at
once to gain nothing is how a working product gets broken, so `S.programmes` is
the record and **the old fields are kept as a derived view of it**, rebuilt in
`setProgrammes()` and nowhere else. New surfaces read programmes; everything
else keeps working untouched. `progsTracked()` seeds from the old fields when
`S.programmes` is empty, so a record made before today opens on its real
programmes rather than an empty tracker.

**You cannot remove the last one.** Every scored view needs a route to score
against, and silently emptying it is exactly what the old dual-track dropdown
did — `S.otherTargets = S.dualTrack === "single" ? [] : ...` wiped the second
application *and*, because checklist ticks are keyed by target, every tick
against it.

### Recommended, and why

`recommendProgrammes()` returns `{prog, why, rank}` and **composes every
sentence from the record at render time**. The rules:

| Rank | Recommended when | Sentence built from |
|---|---|---|
| 1 | You are at or before the trunk your specialty is entered from | tier, `routeTiming()`, `trunkFor()` |
| 2 | The programme your specialty leads to | `S.specialty` |
| 3 | Entered on an exam family you already hold stages of | `stagesHeld()`, `entryFamilyFor()` |
| 4 | The `PIVOTS` move, and only that one | `situation().exam` |

Nothing already tracked is recommended. The one stored string in the whole
mechanism is the programme's own description.

**Why this matters beyond this page:** it is the same mechanic "Matched to you"
needs. That page hardcodes *"Closes your largest gap"* onto a QI course and says
it to a surgeon with 33 of 35 points and nothing left in QI — measured, in three
records. A composed `why` is the cure, and it now exists.

### Reuse

The picker is the prep catalogue again: `prepFilters()`, `prepMatches()`,
`prepGroups()`, `groupHead()` and `specClass()` all work unchanged, so
programmes wear the same specialty colours as exams and interviews. The only
new filter is the tier row (`TIER_LABEL`).

One bug caught in build: filtering only the browse grid left a doctor who typed
"psychiatry" still looking at Cardiology at the top of the page. **One filtered
set now feeds every section**, with a `shown{}` map so a recommended programme
does not also render in the browse grid — a test asserts no programme renders
twice.

### All three shelves recommend off one source

Programmes, exams and interviews now all read `progsTracked()`. They used to
read `S.specialty` plus `S.otherTargets`, and a specialty is not a programme.

**The bug that made this urgent.** `myInterviews()` walked specialties and let
`interviewFor()` guess the tier from `situation()` — and `situation().tier`
holds **one value for the whole doctor**. So an SHO tracking BST General
Internal Medicine *and* HST Cardiology — a trunk and the thing it feeds, which
is the normal case rather than an edge case — got:

```
TRACKING  : HST Cardiology  +  BST General Internal Medicine
INTERVIEWS: "Included with your route" -> HST selection interview
```

One interview for two applications, and the missing one was the panel they sit
**first**. Tier is a property of the programme, not of the doctor: you can be
applying at BST and HST in the same year. Now:

```
INTERVIEWS: "Included with your routes" -> HST selection interview
                                         + BST General Internal Medicine interview
```

`ivForProgramme(p)` resolves from the programme's own tier, and a test asserts
an **intern** tracking only HST Cardiology still gets the HST panel — if the
tier were still being read off the doctor, an intern would get the BST one.

**The registry had the same bug.** `programmes()` generated each higher
programme with `iv: (interviewFor(sp) || {}).id`, resolving through the doctor's
derived tier at construction time. Generated entries now carry `iv:""` and go
through the resolver like everything else.

Three smaller moves in the same pass, all from specialty to programme:

| | Reads |
|---|---|
| `recommendedExams()` | each tracked programme's `fam`, and the *why* names it: *"HST Cardiology asks for MRCPI, and MRCPI Part 2 Written is the next stage you do not hold"* rather than *"Your route needs MRCPI"* |
| `examIncluded()` | whether any tracked programme shares the stage's family — so tracking Core surgical training includes MRCS, tested |
| `weeksTo()` | the colleges of tracked programmes, closing the last specialty-shaped read that could put one college's closing date on another's exam |

The exam half was not a live bug — exam family follows specialty, so the answer
usually came out right. It changes for one source and a sharper sentence. The
interview half was.

### A test that stopped hardcoding a number

`test_personas` asserted `navCount === 11`. It had already been 13 before the
Readiness/Score merge, and broke again the day Programmes was added. It now
counts `zone:"` occurrences — the field only `MODULES` entries carry — and
asserts every declared module renders, whatever the count is. The first attempt
matched 24 because the regex also caught the `GYM` and `IV_GYM` surface lists.

## Gap analysis scores one application

The scoring layer was **programme-blind by construction**. `scorePts()`,
`scoreMax()`, `readiness()` and `losingDomains()` took no target at all, and
`DOMAINS` was one global rubric. That was correct while a doctor had one route
and silently wrong the moment they had two:

| | Closing date | Exam |
|---|---|---|
| Tracker, HST Cardiology | 8 Nov 2026 | MRCPI |
| Tracker, GP training scheme | 5 Dec 2026 | ICGP entry |
| **Gap analysis, before** | **8 Nov 2026 always** | **MRCPI always** |

A doctor tracking GP alongside Cardiology was scored on MRCPI stages for both,
against the RCPI closing date, on a page that never said which application it
meant. The old footnote admitted it in words — *"do not read this figure as
covering both"* — which is an apology, not a fix.

### Five domains are the doctor's, one is the application's

The useful finding once the rubric was read closely: **months worked, audits
finished, sessions taught, papers out, a course done are facts about the
doctor** and count for every application, exactly like a CV or Garda vetting on
the checklist. Only *Exams and membership* is a fact about the application —
an RCPI route wants MRCPI, a GP scheme wants ICGP entry, and holding a stage of
one says nothing about the other.

So `shared:true` marks the five, every scorer takes the programme it is scoring
for, and each row carries **Counts for both** or **This application only** in
the row itself rather than in a footnote. A test asserts that switching
application moves the exams row and nothing else.

### One notion of "the application you are working on"

`gapProg()` resolves it: a route segment first (`#/gaps/bst-gim` is linkable),
then the one last opened in the tracker, then the main route — and never a
programme that is no longer tracked, so stopping one cannot strand either page.
Choosing an application to score also sets what the tracker opens, so the two
pages can never disagree about who they are talking about.

### What rendering caught that the assertions did not

Text assertions passed while the page still said this:

```
Exams and membership        0 of 2 ICGP entry stages held
[ MRCPI prep ]  [ Sitting dates ]
```

The row had been fixed and its own button had not — `gapActions()` still read
`situation().exam`. The same leak sat in *"These score again at interview"*,
which read `deadlines()` — the primary route's list — and showed a GP applicant
the RCPI interview date. Both now take the programme; a test asserts two
colleges produce two different interview countdowns (128 vs 151 days).

The lesson is the one this file keeps recording: **the cycle-leak pattern hides
in the places that are one level away from the thing being fixed** — an action
under a corrected row, a date in a card beside a corrected figure.

## Gap analysis answers "what should I do", not just "where do I stand"

A structured review of the page (not from us — read closely, checked against
the code line by line, and largely right) named the actual product weakness:
the page explained the two scores well and left turning that into a plan to
the doctor. The proposal it made was bigger than we took — a full priority
score of impact × feasibility × urgency × dependency, and a week-by-week
closure plan. Both need effort and time estimates nothing in the record can
honestly produce, and the closure plan is a date-based verdict of exactly the
kind this file has already ruled out once, on this same page: *"telling a
doctor to give up on points they could still earn is the wrong way to be
wrong."* The estimate would be fabricated in a way the illustrative weights are
not — a weight is a real scoring system's shape, waiting on the real number;
an effort estimate has no such number to wait on. What we built instead is the
part that is honestly derivable from the record: rank what actually gains the
most, surface it, and stop duplicating it in two places that can drift.

### One real bug, found by reading the code rather than the page

`levers()` was a hand-written function, independent of `DOMAINS`, that
re-derived its own view of four fields (`S.auditComplete`, `S.teachingDone`,
`S.research`, `S.leadership`) and never mentioned **exams** at all. A doctor
could hold 0 of 8 exam points — often the single biggest gap on the page — and
be recommended a leadership course instead, because the row and the
recommendation were two truths that happened to agree by nobody ever checking.

The fix moves the recommendation onto the domain it belongs to. Each domain
that has something to click now owns a `next(prog)` function, next to the
`pts()`/`ready()`/`bands` it has to stay consistent with:

```js
{id:"exams", ...,
 next:function(prog){
   var sp = domSpec(prog), n = stagesHeld(sp), t = stagesTotal(sp);
   if (n >= t) return null;
   var ex = entryFamilyFor(sp) || (situation().exam || "membership");
   return {t:"Sit your next " + ex + " stage", pts:8 - (n >= 1 ? 3 : 0),
     why: n === 0 ? "Holding one stage moves this domain onto the scoreboard"
                   : "Full membership takes this domain to its full 8 points",
     href:"#/exams", cta:"Open " + ex + " prep"};
 }}
```

`levers()` is now a loop over `DOMAINS` collecting whatever each `next()`
returns; a domain with no `next` (clinical accrues with time — nothing to
click) is silently skipped rather than special-cased in a second place. Exams
can now win the top spot on its own numbers, and did, on the very next
screenshot taken to check the change: *"Sit your next MRCPI stage · +8
points"* led both Today's "Your next move" and the gap page's priority list,
something the old function could never produce whatever the record said.

### Your best next moves

A ranked list, capped at three, sits between the diagnosis card and the
domain-by-domain detail — the thing the page used to bury as a single button
one level down. Each entry names the domain it belongs to
(`data-domain="..."` on both the list item and the matching row, so the two
can be matched in code, not just by eye) and its own call to action: a button
for a one-click event, a link where the next step happens outside this record
entirely (sitting an exam is not a checkbox).

### Domains at maximum collapse out of the way

Six cards of near-equal visual weight forced a doctor to do their own triage
on every visit. `domOrder(gp)` already sorted by points owed; the only new
work is drawing a line at zero and putting everything past it behind *"Show N
domains already at maximum"* — nothing is dropped, a test clicks the toggle
and checks all six are still there, only collapsed by default when there is
at least one open domain worth the room.

### Eligibility, before scoring

A weak portfolio scores badly; a missing eligibility item — registration, the
minimum months, an exam stage, the language requirement — stops the
application outright, whatever the portfolio looks like. Those are different
failures and had never been said apart on this page. `eligibilityBlockers(gp)`
reads the same **Eligibility** group the application checklist already
tracks, so the count can never disagree with the checklist itself, for the
cost of one line: *"2 eligibility issues · View on the application tracker"*
or *"No application blockers"*.

### The bug that line exposed

Wiring the checklist into gaps for the first time surfaced a real divergence
that no earlier feature had ever been in a position to notice.
`trackProg()` — which decides which application the tracker is showing — read
the url segment and, failing that, fell straight to the main route. `gapProg()`
had a longer chain: url segment, then `S.lastProg` (the one last worked on),
then the main route. The two were supposed to be one notion of "the
application I'm working on" and were not: on the bare `#/gaps` index (no
segment), the two functions could name different applications.

It stayed invisible because nothing had read a per-application `auto()` check
from outside the tracker's own detail page before. The one that does —
*"Exam stage held"* — calls `trackTarget()`, which calls `trackProg()`. A
doctor viewing the GP scheme's gap analysis, having last worked on it in the
tracker, would silently have that one eligibility item scored against
whichever application the record happened to track *first*, not the one the
page said it was scoring. Concretely: holding one Cardiology stage made the
count read one issue lower on GP's own gap page than GP's own checklist row
said — *"0 of 2 ICGP entry stages held"* right there on the same screen,
contradicted by a number one card above it.

The fix gives `trackProg()` the same fallback chain `gapProg()` already had:

```js
function trackProg(){
  var list = progsTracked();
  if (!list.length) return null;
  var open = currentArg();
  return list.filter(function(p){ return p.id === open; })[0]
      || list.filter(function(p){ return p.id === S.lastProg; })[0]
      || list[0];
}
```

A test pins the exact scenario: track two applications, hold a stage in the
first, open the second in the tracker (setting `S.lastProg`), then visit bare
`#/gaps` and check the eligibility count against what the application's own
checklist row says, not what the record's main route would say.

## The tracker remembers which application you were in

A doctor tracking one programme should not re-pick it every session. The nav
item for the tracker points at the application you last had open:

```js
function navHref(id){
  if (id === "progress" && S.lastProg && progTracked(S.lastProg)){
    return "#/progress/" + encodeURIComponent(S.lastProg);
  }
  return "#/" + id;
}
```

**The memory is on the link, not on the route.** Redirecting `#/progress` to
the remembered application would have made the index unreachable: "All
programmes" would go there and bounce straight back. Putting it on the nav href
leaves `#/progress` as the index it is, so the way back works, bookmarks to the
index still give the index, and `#/deadlines` and `#/programmes` still land
where they mean to. A test asserts the back link reaches the index *and stays
there*.

It falls back on its own: an id that is no longer tracked — because the doctor
stopped tracking it — stops being pointed at, without needing to be cleared.

## The CPD tracker and the Occupational health page are gone

Two nav items removed, with no replacement for now. What each one held:

| Was on the page | Where it is now |
|---|---|
| Garda vetting, occupational health clearance | Requirements on the application checklist, with their "Vetted today" / "Cleared today" actions |
| Garda vetting **date picker** (an arbitrary past date) | Gone — only "today" remains |
| Hepatitis B / immunisation status and date | Gone |
| CPD points, target, cycle end, points log | Gone |

Removing the views left a closed cluster of dead code behind them, which went
too: `cpdPct`, `cpdTarget`, `cpdDaysLeft`, `cpdRegime`, six action handlers, the
`hepBUpToDate` / `hepBCheckedAt` / `cpd*` record fields, and
`situation().inTrainingPost` — which existed for exactly one reason, to pick
between the Medical Council and HSE CPD regimes, and had no other reader.

`gardaStatus()`, `gardaExpiry()` and `gardaDaysLeft()` stay: the checklist row
still derives from them, so vetting is still shown as *days until it renews*
rather than a tick.

The `Practical` zone held both and holds nothing now. `renderNav` skips an empty
zone, so leaving it would have been invisible rather than broken — a heading
waiting for pages that were deliberately removed — so the zone went too.

`test_app_practical` was almost entirely about those two pages. It was not
deleted: it now checks that removing them left the app coherent — no nav items,
no empty zone, **no link anywhere to a route that no longer exists**, the two
clearances still on the checklist with their one-click actions, and vetting
three years old still reading *expired* rather than *done*.

### The record keeps its placeholders

`gardaVettingDate`, `occClearance` and `occClearanceAt` stay in the record
because the checklist reads them. Everything the removed pages alone wrote is
out of `DEFAULTS`, so a fresh record no longer carries fields nothing can set.

## Programmes became the tracker's front

Programmes and the Application tracker were **one module at two levels**. The
page listed what you could apply to; the tracker held one application's
checklist and dates; and after the picker landed, *both rendered the same
programme cards*. That is the same duplication that let Deadlines and the
tracker drift apart, reintroduced within a day of writing it up.

One module now, two levels:

```
#/progress            the index    what you track, and everything you could
#/progress/bst-gim    one          that application's checklist and its dates
```

### The url carries which one

`S.trackTarget` is gone. A saved field could say which application the switcher
had last selected; a url says the same thing and is **linkable, reloadable,
back-buttonable, and something a doctor can return to** — which is what the
detail level is for. `routeParts()` splits the hash into segments instead of
stripping `#/`, and `trackProg()` reads the second one, falling back to the
main route when nothing is open. An id that is unknown, or names a programme
the doctor does not track, falls back to the index rather than erroring.

The tracked cards are anchors, not tabs: they *open* an application rather than
switching a panel, so they behave like navigation — middle-click, back button,
copy link.

### The dates tab is index-level

`allDates()` spans every programme, so its header has to as well. `trackStats()`
answers for one application and would have been quietly wrong above a list of
all of them; `trackAllStats()` sits beside it and totals across what you track.

### Both old routes survive

`#/deadlines` lands on the dates tab and `#/programmes` on the index — each on
the tab it meant. The nav entry for Programmes is gone; the module count drops
by one again.

### Two things moved with the levels

**Stop tracking** was on the programme card. The card became a single link, and
a button cannot nest inside an anchor, so the control was silently lost — you
could add a programme and never remove one. It is on the application's own page
now, which is the better place anyway: you open it, see what it wants, and
decide. It is withheld entirely when only one programme is tracked, rather than
offered and then refused, and dropping the application you are looking at
returns you to the index instead of rendering a page for something you no
longer track.

**Recent activity** was inside the tracker, which after the split meant inside
*one application* — so the same entries would render again under the next one.
It is a record of the doctor, not of an application, so it sits on the index.

### What the tests had to be told

Eight suites failed on the restructure, and each one was a navigation fact
rather than a bug — except two, which were real:

- `data-prog-off` had no target anywhere: the Stop tracking regression above.
- `prog.mjs` section 4 claimed to prove "removing the last one is refused" but,
  after a naive fix, asserted it without clicking anything. It now tracks two,
  drops one, checks the page it was on was left for the index, and only then
  checks the last one offers no control at all.

`test_personas` is worth calling out. It sweeps every view for cross-specialty
leaks — a GP trainee must never see "MRCS" — and excluded `#/exams` as a
browsable catalogue by design. `#/programmes` was never in its list, so the
programme catalogue had never been swept; the moment it became `#/progress` it
leaked ten assertions at once. The fix is not to exclude the tracker: it is to
exclude the **catalogue half** and sweep the **personalised half** instead, so
the rule still bites where it should. The suite now opens an application and
holds its checklist to the leak rule.

Several tests were also pinned to `#/progress` showing a checklist, and to ids
like `p-cardiology` that are wrong for a record whose specialty is General
Internal Medicine. They now click the first tracked card rather than guessing
an id — asserting the property, not a spelling.

### The detail level names itself

The header said "Application tracker" on both levels, and the programme's name
appeared only in a sentence under a progress bar. On the detail level the
header is the programme — *BST General Internal Medicine · RCPI · Entry to
training* — because that level is about one application and the page has to say
which.

## The nudge strip is gone

Today opened with a row of pills: *Garda vetting not logged · Confirm where you
are this year · Also tracking General Internal Medicine · 2 of 4 teaching
sessions*. Every one of them **restated status the rest of the app already
showed**, and together they pushed the next move down the page. Today is now
greeting, ladder, next move.

This does not leave time-critical things homeless. A Garda renewal and a CPD
cycle end are **dates**, and dates live in the calendar with a countdown
already coloured by proximity — which is a better home for a reminder than a
pill that reads the same on the day it is logged and the day it expires.

## Deadlines merged into the Application tracker

They were one thing rendered twice. `phaseMilestones()` already called
`deadlines()` and filtered it into each phase, so the tracker was **already a
consumer of the deadlines list** — the dates were the work's schedule, kept on
a separate page.

One page, two tabs, direction A of the concepts set:

```
Application tracker    [ This application ]  [ All dates 5 ]
```

`#/deadlines` still resolves — links across the app and whatever a doctor has
bookmarked point at it — and lands on the calendar tab. The old view body was
**deleted rather than left behind**: two renderers of one list is how the two
pages drifted apart in the first place.

### The calendar spans every programme

`deadlines()` is untouched — seven callers read it for the primary route — and
`allDates()` sits beside it, walking `progsTracked()` so a dual-tracking doctor
sees both applications interleaved by month, each row chip-tagged with the
programme it belongs to. The old page showed the primary route in full and gave
other targets a cut-down "Also on your radar" with three dates each.

### One date is one row

Two programmes under the same college share a cycle, so a doctor tracking BST
General Internal Medicine alongside HST Cardiology got **eleven rows saying six
things**: *Applications close, 8 Nov 2026, BST General Internal Medicine*
immediately followed by *Applications close, 8 Nov 2026, HST Cardiology*. Only
the chip differed. `datesGrouped()` collapses on `kind|title|date|note` and the
row carries a chip per application. They are still two applications — this is
one calendar entry, not one deadline — and every count (the tab, the nav badge,
the past-dates button) reads the grouped list so the numbers match the rows.

### One done-rule

A college date **cannot be ticked — it passes**. Only a date the doctor set is
theirs to clear. `deadlinesDone` and `checks` were two stores for overlapping
ideas; the calendar no longer renders a Mark-done control on a college date at
all, which a test asserts.

### The two invented "your own deadline" rows are gone

`deadlines()` used to open with:

```js
{id:"qi",    iso:"2026-10-15", note:"Your own deadline, set to land before applications open"},
{id:"teach", iso:"2026-10-31", note:"Your own deadline, ..."}
```

Two fixed dates the doctor had never seen, labelled as theirs. They now set
dates themselves, on the requirement, and those become the personal rows via
`ownDueRows()`. **Every outstanding requirement takes one — derived or not.**
The first cut gated the control on manual checks and the whole Preparation
stage offered it nowhere, because every requirement in that stage is derived.

### The switcher is programmes

`S.trackTarget` holds a programme id. BST General Internal Medicine and HST
General Internal Medicine share a specialty but are two applications with two
checklists, and keying on the specialty collapsed them. `checkKey()` follows,
so ticks belong to an application rather than to a specialty.

### The app finally has a print stylesheet

There was **no `@media print` anywhere in this file**, and the tracker had a
"Print this stage" button that printed the sidebar, the nav and every button on
the page. Now: rail, tabs, filters and controls drop out, cards lose their
shadows and avoid breaking mid-row, links stop spewing their URLs. A test
emulates print media and asserts the sidebar and tab controls compute to
`display:none`.

### The switcher is the programme cards

The merge shipped the switcher as two thin pills — programme name, college, a
count. That was the wrong component: the programme is the thing being tracked,
and it wears a card everywhere else in the app. The tracker now uses the top
half of the picker design, `trackCard()`, so choosing between two applications
means choosing between two programmes, in the same card language, with the two
facts the pills left out: **when it closes and how ready it is**. The whole card
is the control, and a link underneath goes to the full programme browse.

With one programme this is not a choice, it is the identity of the page — which
application these eighteen requirements belong to — so it renders either way.

### A programme id was leaking into the dates

`target` became a programme id in the merge, and one call still wanted a name:

```js
var ms = phaseMilestones(phase, cyc, target);   // "p-cardiology applications close"
```

`cycleEvents()` resolves its label as `(SPECIALTY_INFO[target] || {}).target ||
target`, so an id that is not a specialty key falls straight through to the
output. It now takes `prog.t`. Every other use of `target` in that view is a
storage key — `checkProgress`, `phaseProgress`, `checkState`, `checkKey` — and
is correct as an id; this was the one place a human-readable name was wanted.
A test asserts no `p-` or `bst-` id renders anywhere on the tracker.

### Locked no longer eats the specialty colour

The rule said:

```css
/* locked overrides the hue on the BORDER only: the band keeps its specialty,
   because which specialty a prep belongs to does not change with who owns it */
.pc.lock{border-color:var(--line); ...}
```

The comment argues against the rule it is attached to. The effect was that the
palette only completed on your own route: a physician sees Surgery, Psychiatry,
Emergency Medicine and the rest **only ever locked**, so those hues never showed
on a border at all and the colour-coding read as decoration rather than a
system. Every card now keeps its specialty border. Locked is carried by three
channels that were already there and are not the hue — a flatter shadow, the
word in the eyebrow, and *Get access* rather than *Open*. `.rstop.todo` on the
route line had the same rule for the same bad reason and got the same fix.

### The urgency badge came with it

`navBadge("deadlines")` counted dates inside 21 days and put a red dot on the
nav item. Deleting the page left that branch **dead code** — `navBadge` is only
ever called with a `MODULES` id — so the signal would have vanished without
anything saying so. It moved to `progress`, and reads `allDates()` rather than
`deadlines()`, so it now counts across every programme tracked instead of just
the primary route.

### No verdict

The shared header is a count and a date — *"16 of 18 outstanding. Next date:
applications close, 8 Nov, 57 days away"* — and stops there. Neither tab
computes whether the remaining work fits the remaining time. The dates are
known placeholders and telling a doctor to give up on points they could still
earn is the wrong way to be wrong.

## The alternate structure, `app/alt.html`

A parallel take on the information architecture, built to be compared against
the live dashboard rather than to replace it. It keeps its own storage key
(`mednav.alt.v1`), so trying it never disturbs the demo record the live app
holds, and it carries a banner saying what it is.

**Why it exists.** Measuring every page turned up an uncomfortable fact: the two
surfaces the product owner says are paid from day one were the two thinnest in
the app.

| page | controls | words |
|---|---|---|
| Exam prep | 3 | 92 |
| Interview prep | 1 | 126 |
| Gap analysis | 17 | 455 |

A whole session of work had gone into the free navigation layer while the thing
people are meant to pay for stayed a stub.

**What changes.** Three things, all structural.

*Zones group by cadence, not by artefact.* The live nav groups by what a page
is — roadmap, tracker, deadlines, gaps. That hides the property that actually
separates them, which is how often a doctor opens them: **Where you stand**
monthly, **How ready you are** before applying, **Get exam ready** daily for six
to eight weeks.

*The pricing line is a property of a zone.* `PAID_ZONES` marks it once on the
zone heading rather than repeating a badge on every item inside it.

*Exam prep becomes a module you enter rather than a page you visit.* A surface
opened daily for two months should not sit between Deadlines and Occupational
health as one more row. It gets its own header, its own six surfaces — study
planner, knowledge base, question bank, mock exam, analytics, live tutor — and
its own inside. This is the shape GP Journey already has for GP, generalised:
MedNav as the map across every specialty, with the gym bought per exam.

**The load-bearing claim is the write-back.** Every surface card carries a line
saying what it feeds back into the record, and the mock exam demonstrates it
rather than asserting it: a recorded score moves the predicted result on the
module header and drives the analytics trend. A standalone question bank cannot
move a doctor's readiness, close a gap item or tick an application requirement.
That is the only durable reason to buy this one instead of a cheaper one.

**What it deliberately does not do.** It does not generate exam questions or
teaching text. The knowledge base and question bank show topic structure and
coverage, with the content explicitly marked as authored by doctors who have sat
the exam — the standing ban on AI-generated question banks holds. The mock exam
records a score the doctor already has rather than inventing one, and that score
feeds a *predicted* figure only: a mock is not a stage held and must never touch
the shortlisting rubric. Live tutor is named and left honest rather than mocked
up.

## Interview prep, expanded from six surfaces to nine

Asked directly whether interview prep was "lacking anything" — with a request
for "knowledge base, voice simulator, video simulator, mock with a live
tutor, analytics, interview scoring criteria" — the first pass reframed the
simulators into a self-rating tool with no AI judgment involved, on the
theory that grading someone's interview technique was outside what this
product does anywhere else. That was a wrong guess at the brief: told
directly what the flows should actually look like — a scoring-criteria page
you can open to see everything about it, a knowledge base with real
technique *and* worked example answers, a voice simulator and a video
simulator each built around a browsable scenario library you click into to
practice one at a time, a mock interview that runs a full session through
that same mechanic back to back, and — explicitly — that the simulators
**should** be AI graded — the second pass rebuilt around that, and rebuilt
the content too: every scenario, technique note and rubric line went from
"content to be authored" stubs to real, populated placeholder text, clearly
marked as illustrative rather than doctor-authored, closer to how `EXAMS` or
`CYCLE` are treated elsewhere in this file than to a stub screen.

`IV_GYM` is nine surfaces: **Countdown plan** (unchanged, paced off the
doctor's own cycle dates), **Interview scoring criteria** (new — full detail,
not a domain list: every domain's summary, an illustrative weight, and a
five-band rubric ladder from weakest to strongest answer), **Your evidence**
(unchanged — already the strongest part of the hub, reading Gap analysis
straight off the portfolio), **Knowledge base** (deepened — technique *and* a
worked example answer per domain, not a structure-only stub), **Voice
simulator** and **Video simulator** (new, separate menu items sharing one
scenario library — twelve scenarios, two per domain — but each its own entry
point and its own attempt count), **Mock interview** (rebuilt — starts a full
session, one scenario per domain, six back to back, ending in a graded
summary, rather than a manual 1–5 self-rating), **Analytics** (rebuilt to
read graded attempts and sessions instead of self-ratings), and **Mock with a
tutor** (unchanged, and now says "live, not simulated" to draw the line
against everything above it).

### Simulated grading, not a real model call

This is a static file with no backend and nowhere safe to hold a real model
API key client-side, so `simulateGrade(domainId)` cannot call a real model.
What it builds instead is the complete grading *experience* — an overall
score, a three-criteria breakdown, two feedback bullets drawn from a small
illustrative pool keyed to the score band — labelled "simulated" everywhere
it appears: in the intro copy before anyone starts, next to the score itself,
and again in Analytics. The design is deliberately shaped so that swapping
this one function for a real call later (transcribe the recording, score the
transcript against `IV_CRITERIA`) is a backend job, not a redesign — nothing
that reads its output (`{overall, subs, feedback}`) would need to change
shape.

### The recording and grading engine

Voice simulator, Video simulator and Mock interview all share one mechanic —
answer a scenario on camera or audio, then it grades automatically — reused
via `recordAndGradeUI(scenario, kind, inSession)` and driven by `recStart()`/
`recStopClick()`/`recDiscard()`/`recLogClick()`/`recNextClick()`. Three things
had to be designed around deliberately:

- **`render()` replaces `#view` wholesale on every state change.** A live
  `MediaStream`/`MediaRecorder` cannot survive having its DOM torn out from
  under it, so recorder state lives in a module-level `recState` variable
  outside `S`, never touches `localStorage`, and a guard at the very top of
  `render()` stops any in-progress recording on every navigation path.
- **The render() guard almost broke every recording, including the very one
  it was protecting.** `recStart()` itself calls `render()` once, deliberately,
  to paint the "now recording" UI — and the guard, written as a blanket
  `if (recState.recording) recAbort();`, fired on that call too, stopping the
  stream and revoking it *before* `recorder.start()` even ran. This was not
  an edge case: it fired on every single successful `getUserMedia()`
  resolution, in any browser, for anyone. It went unnoticed through the
  first version's tests because the sandboxed browser used for testing has
  no working encoder at all, so `recorder.start()` always threw first — and
  the resulting `NotSupportedError` read as a plausible, encoder-shaped
  explanation on its own. Adding `--use-fake-device-for-media-stream` to a
  Playwright launch and actually watching the "Stop and grade" state (or the
  lack of it) surfaced the real cause. Fixed with `recSuppressGuard`, a
  boolean the guard checks and `recStart()` sets true for exactly the one
  `render()` call it makes itself.
- **Async gaps needed a token, not a flag.** Three points in the flow are
  async relative to a doctor's next click: `getUserMedia()` resolving, the
  recorder's `onstop`, and the ~1.5s simulated grading delay. A monotonic
  `recToken`, bumped by `recStart()`, `recAbort()` and `recDiscard()`, lets
  every callback check `myToken === recToken` before touching `recState` or
  calling `render()` — so starting a new recording, discarding, or navigating
  away can never have a stale callback overwrite what the doctor is now
  looking at.

**A second, smaller bug found the same way:** the "Log this attempt" /
"Next question" button was built as
`'data-rec-' + (inSession ? "next" : "log") + '">'` — the stray `"` before
`>` puts it inside the attribute *name* HTML parsers construct
(`data-rec-log"`, quote included), so `document.querySelector('[data-rec-log]')`
never matched it. Found the same way as the render-guard bug: by actually
driving the button in a live browser rather than reading the template
string, which looked correct at a glance.

Both were caught running `ivprep.mjs`'s scenario/session flows against a
real fake-device browser, including a full six-question Mock interview
session end to end (start → record → stop → grade → next, six times → session
summary → log), not by reading the code.

### Testing

`ivprep.mjs` (9 sections) exercises the real pipeline against
`--use-fake-device-for-media-stream`, not just markup assertions: the
countdown plan, the full criteria rubric (one block per domain), knowledge
base content and its reviewed toggle, a genuine record → grade → log round
trip in both Voice and Video simulator, a complete six-question Mock
interview session, Analytics reading real graded state, the tutor's "live,
not simulated" framing, and — mid-recording — navigating away and confirming
the render() guard actually stops the live stream and leaves a clean idle
state on return. `a11y_ivsurfaces.mjs` runs axe-core and a 24px touch-target
check across all nine surfaces individually, plus the scenario-open and
graded-result states the base surface scan does not reach on its own. Both
are in the permanent sweep, alongside a one-line fix to `ev2.mjs`'s stale
assertion for the old "What is assessed" surface name.

## Noted for later, deliberately not built

- **The Application tracker is unfinished and parked.** What is built works —
  four derived stages, programme switching, inline actions — but it stopped
  mid-thought rather than at a natural end. Open when we return:
  - **Print is a stub.** "Print this stage" calls bare `window.print()` and
    there is no `@media print` block anywhere in the app, so it prints the dark
    sidebar and the nav. Either build a real print stylesheet, or drop the
    button until there is one; a control that produces something unusable is
    worse than no control.
  - **The requirement lists are ours, not any college's.** The categories are
    defensible; the specific documents, formats, English tests and verification
    routes are not. Flagged on the page and in the placeholder list above.
  - **Stage IV is thin against the reference.** Accommodation lead time, ICGP
    ePortfolio familiarisation and similar pre-start items exist in the product
    owner's own GP Journey; ours has three generic requirements.
  - **No per-stage narrative.** The reference carries a "heads up" line per
    stage — references falling over Christmas, Garda clearance taking 4-6 weeks.
    Those are the facts a doctor most needs and we carry none of them, because
    each one is a claim we cannot yet source.
  - **Custom requirements always land in Preparation.** `customChecks` has a
    `p` field but nothing sets it, so a doctor cannot add a requirement to the
    stage it belongs to.

- **Mentorship matching.** A toggle for "match me with a senior doctor in my
  target specialty" was considered for onboarding and set aside. It is a real
  and valuable feature, but it needs a supply of mentors and a matching
  mechanism behind it before asking the question means anything. Worth
  building once that exists; asking now would collect a preference nobody can
  act on.

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

# CarZone Kuwait

A working prototype of the platform described in the PRD: an Arabic and
English parts, tires and fitting service for Kuwait, built around one idea,
that you tell it the car once and everything after that is filtered to it.

Open `index.html` in a browser. There is no build step and no server. Fonts
come from jsDelivr; everything else, including every illustration, is in the
four files below.

| File | What is in it |
| --- | --- |
| `index.html` | The shell: head, metadata, four mount points |
| `assets/carzone.css` | The whole design system |
| `assets/data.js` | Vehicles, catalogue, services, symptoms, B2B, geography |
| `assets/art.js` | Every drawing: icons, parts, the three vehicle elevations |
| `assets/app.js` | State, fitment engine, router, views, dialogs |

One document, hash routed (`#/shop/batteries`, `#/p/VAR-H8-AGM`, `#/pro`).
State lives in memory and is mirrored to `localStorage` where the browser
allows it, wrapped in try/catch so opening the file straight from disk still
works.

## The one thing it is built around

Fitment. A wrong part destroys trust permanently, so the fitment call is the
spine of the product rather than a badge bolted onto a card:

- The vehicle sits in the header at all times, as a plate. Empty it invites,
  set it states the car.
- Applications are stored the way ACES data arrives, as make, model, year
  span, so `fitOf()` is a real lookup and not a string match.
- Every product carries one of four states: fits, does not fit, universal, or
  we cannot say because you have not told us the car. The fourth is a state,
  not a blank.
- **Nothing recommends a part that does not fit.** The battery finder narrows
  to the one group size the model takes, the guided check filters its parts
  list and says how many it dropped, and the catalogue hides non-fitting parts
  with a count and a way to see them. Getting this wrong in three places was
  the main bug found while building.
- A part that does not fit can still be bought. The line is tagged so a wrong
  fit shows up in returns analytics rather than as the customer's problem.

`VEHICLES` carries two facts per model that make the finders real: the battery
group size and the OE tire size. That is why the battery finder can say "your
Land Cruiser takes group H8 / 49" instead of showing ninety batteries, and why
"use my vehicle" on the tire page fills in 285/60R18.

## Design

### Colour

Warm paper and warm near black, one accent, and semantic colour that never
decorates. The usual navy and the usual six-hue gradient set are both absent
on purpose.

```
--paper #F4F1EA   --card #FBF9F5   --inset #EAE5DA   --rule #DED7C8
--ink   #14120E   --ink-1 #2A261F  --ink-2 #6B6353   --ink-3 #968D7B
--flame #CC4A1E   --go #1F6B4F     --stop #9A2820    --hold #8A6412
```

Contrast computed rather than eyeballed, against `--paper`:

| Token | Ratio | Use |
| --- | --- | --- |
| `--ink-2` | 5.3:1 | secondary text |
| `--flame-1` `#A83A16` | 5.7:1 | accent **text** |
| `--flame` `#CC4A1E` | 4.1:1 | fills only, never small text |
| `--go` | 5.8:1 | fits, in stock, healthy |
| `--stop` | 6.9:1 | does not fit, urgent |
| `--hold` | 4.7:1 | watch this |

White on `--flame` is 4.6:1. On ink surfaces the accent lifts to `--flame-up`
`#E8703F`, 6.1:1. Following the dataviz method, status is **an icon plus a
word plus a colour**, never colour alone, which is why "Fits" and "Does not
fit" both carry a glyph and a label.

The accent and the stop colour are both warm reds, so they are kept apart by
role: flame only fills primary actions and one detail per drawing, stop only
appears inside small status chips and the one emergency panel.

### Type

Archivo 600/700 for headings, Inter 400/500/600 for the interface, IBM Plex
Mono for every figure and part number, IBM Plex Sans Arabic for the whole
Arabic side. Prices are tabular; a catalogue where the numbers do not line up
is not a catalogue. Each family has a real fallback stack, so a blocked CDN
degrades instead of breaking.

### Structure and motion

Rules, not shadows. Shadow is reserved for things that genuinely float: the
drawer, the dialog, the stuck header. No gradient is used as a surface. Motion
is a 200 to 550ms reveal and nothing else, and `prefers-reduced-motion`
removes all of it.

## The drawings

There is no photography and none is faked. Parts are drawn as technical line
art on one 120 grid, which is what a parts catalogue looks like anyway and
means nothing is a stock photo of a different product. Each drawing carries
exactly one accent detail.

Tires draw their own tread family, so an all terrain and a highway pattern are
not the same picture with a different label.

The three vehicle elevations (sedan, SUV, pickup) carry hotspot anchors in the
same coordinate space, so the markers sit on the system they name at any
container width. In Arabic the car turns to face the reading direction and the
markers ride with it, because they are positioned with `inset-inline-start`
rather than `left`. Below 640px the markers would collide, so the same systems
become a scrolling chip row.

## Arabic

Bilingual from the first line rather than a later phase, as the PRD requires.

- Every customer facing string is bilingual at the point of definition. There
  is no translation layer bolted on.
- The layout is written with logical properties throughout, so Arabic is a
  direction change and not a second stylesheet.
- Attribute keys and the enumerated values that reach the surface are
  translated. Acronyms Arabic technical usage keeps in Latin (AGM, EFB, CCA,
  DOT, API) stay as they are, which is what a parts counter in Shuwaikh says
  out loud.
- Part numbers, prices and sizes are `unicode-bidi: isolate`, so "12 months"
  inside an Arabic sentence does not reorder into "months 12".
- Western digits in both languages, which is the Kuwaiti commerce convention.
- Arabic names a car make, model, year. English names it year, make, model.
  `vehicleLabel()` knows the difference.

## What works

Vehicle picker with cascading make, model, year and engine, and a VIN field
that validates the character set and decodes the year and make characters.
Catalogue with working facets, sort, grid and dense row modes. Search across
names, brands, SKUs, OEM numbers and interchange numbers, normalised so
`90915-YZZD4`, `90915 YZZD4` and `90915yzzd4` all resolve. Product pages with
the specification table, both number sets, and the full application list with
your car highlighted. Battery finder. Tire size selector reading the sidewall
format. Guided symptom check. Cart, Kuwait format checkout with real
validation, delivery windows computed from the clock against a 15:00 cutoff
(13:00 for the outer governorates), KNET default, cash on delivery with its
fee and its 150 KWD cap. Garage with maintenance readings that compute from
what you record. Mobile fitting and rescue booking. A B2B portal whose quick
order pad genuinely parses and prices a pasted job card at tier price. One
worked buying guide.

Against the PRD: this covers the Phase 1 scope, plus the Phase 2 items that
make the proposition legible (tires, the services layer, CarZone Pro), plus
one Phase 3 idea, the house label, which appears as CarZone AGM batteries
priced with fitting included because there is no brand licence in the price.

## What is honest about itself

Following the repo's content rules, the prototype says what it is on the
screen and not only in a README:

- The catalogue is 46 sample parts across nine departments, against a vehicle
  list of 13 makes and 44 models. The empty state says so and offers to source
  the part instead of showing nothing.
- Replacement intervals describe the general Gulf pattern and are labelled as
  explaining the assortment, not as a measurement of your car or a warranty
  term.
- The garage invents nothing. Until you record a fitting date or an odometer
  reading, the reminders say so. There is a clearly labelled control to fill
  sample values.
- The guided check is called a guided check, reports a likely cause rather
  than a diagnosis, and every path can reach a person.
- Checkout takes no payment, books nothing and sends no message, and says that
  next to the button.
- The Pro account is labelled a demonstration account.
- No em dashes.

## Deliberate departures from the reference build

The starting point was a single file prototype. These were replaced rather
than ported, and the reasons matter more than the changes:

- **The Three.js car became an SVG cutaway.** A low polygon box car rendered
  worse than a drawn elevation, cost a library and a WebGL context, could not
  be tabbed to and could not be labelled. The diagram loads instantly, works
  on a phone, is keyboard reachable and each marker is a real button.
- **The AI chat assistant is gone.** It was a scripted keyword matcher
  presented as an AI concierge. Presenting a lookup table as intelligence is
  dishonest, so its actual utility moved into the guided symptom check and the
  WhatsApp handoff, both of which say what they are.
- **The live purchase ticker is gone.** Invented social proof.
- **Roadmap labels came out of the interface.** "P2" and "PHASE 2" badges told
  a customer about our internal plan.
- **Photography was replaced by drawings.** The image URLs in the reference
  pointed at a generation service and would not survive.
- **Countdown timers, pulsing dots, marquees and the floating animation went.**
  Urgency in this category is real (the car will not start) and is better
  served by a delivery cutoff computed from the actual clock.

## Known gaps

- Applications are hand entered and cover model and year, not trim and engine.
  Production needs the fitment service the PRD specifies.
- Attribute *values* on less visible fields are English only. In production
  these are bilingual PIM fields.
- The VIN decoder reads two characters. A real one is a licensed service.
- Reviews are a rating and a count, with no review bodies.
- `carzone.com.kw` and `/og-image.png` in the head are placeholders.
- The scoring in `rankBatteries()` is a demonstration weighting, not a
  merchandising model.

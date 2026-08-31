# MedNav

Static marketing site for MedNav, the Irish medical career navigation platform.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Homepage (v2, the design source for everything else) |
| `opportunities/index.html` | Opportunities hub: jobs, locums, conferences and courses |

Each page is a single self-contained file. Fonts (Sora, Inter) load from jsDelivr;
everything else is inline, so a page can be opened straight from disk.

## Design system

Tokens, type pairing and motion are carried from the homepage:

- Display type Sora (600/700/800), body Inter (400/500/600)
- `--deep #0b2e36`, `--mint #14b394`, `--mint-2 #3ed1a8`, `--paper #f7faf8`,
  `--coral #ff7a59`, `--amber #ffc061`
- Shared components: sticky header with backdrop blur, full screen mobile menu
  with focus trap, `.btn` primary/ghost, `[data-reveal]` scroll reveals,
  grain overlay, back to top, footer
- `prefers-reduced-motion` disables every animation and reveals all content

The Opportunities page adds a colour split across the three lanes so a listing
is identifiable at a glance: jobs mint, locums amber, conferences coral.

## Content rules

Carried over from the homepage and enforced on the Opportunities page:

- Listings are aggregated and linked, never hosted. MedNav never receives an
  application.
- Rates appear only where the agency publishes them. They are never estimated.
- Every card names its source.
- No em dashes in copy.

## Placeholders to replace before launch

- `https://mednav.ie` and `/og-image.png` in every page head
- `opportunities/index.html`: the `OPPS` array is sample data mirroring the
  wireframes, not a live feed. Swap it for the aggregation feed and remove the
  "Sample of the live board" badge. Deadline counts are computed from the
  browser's current date, so sample rows read as closed once those dates pass.
- The hero counts (142 / 38 / 12) and the "last rechecked" stamp are static.
- `opportunities/jobs.html`, `locums.html` and `conferences.html` are linked
  from the hub but not built yet.
- Homepage testimonial and avatar images are illustrative placeholders.

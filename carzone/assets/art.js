/* ============================================================================
   CarZone Kuwait, drawing set.

   There is no photography in this prototype and none is faked. Parts are
   drawn as technical line art on one 120 grid, which is what a parts
   catalogue looks like anyway, and it keeps the whole thing self contained:
   no remote images, nothing to break, instant paint.

   UI    24 x 24 interface icons, 1.6 stroke
   ART   120 x 120 part illustrations, 2.2 outline / 1.3 detail
   CARS  420 x 180 side elevations plus the hotspot anchors for each system
   ========================================================================= */

const UI = {
  search:'<circle cx="11" cy="11" r="7"/><path d="M16.2 16.2 21 21"/>',
  close:'<path d="M6 6 18 18M18 6 6 18"/>',
  check:'<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
  minus:'<path d="M5 12h14"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  chev:'<path d="M9 4.5 16.5 12 9 19.5"/>',
  chevD:'<path d="M4.5 9 12 16.5 19.5 9"/>',
  arrow:'<path d="M4 12h15M13 6l6 6-6 6"/>',
  cart:'<path d="M2.5 3.5h2.6l2.2 10.4a1.8 1.8 0 0 0 1.8 1.4h7.6a1.8 1.8 0 0 0 1.8-1.4l1.4-6.6H6"/><circle cx="10" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>',
  car:'<path d="M3 15.6v-2.7l2.2-.6 2.3-3.4A2 2 0 0 1 9.2 8h5.6a2 2 0 0 1 1.6.8l2.5 3.5 2.1.6v2.7"/><path d="M3 15.6h2.4M9.7 15.6h4.6M18.6 15.6H21"/><circle cx="7.5" cy="15.9" r="2.1"/><circle cx="16.5" cy="15.9" r="2.1"/><path d="M7.5 12.3h9"/>',
  garage:'<path d="M3 20V9.4a1 1 0 0 1 .6-.9l8-3.4a1 1 0 0 1 .8 0l8 3.4a1 1 0 0 1 .6.9V20"/><path d="M7 20v-5.5h10V20M7 17h10"/>',
  van:'<path d="M2.5 16.5V7.5A1 1 0 0 1 3.5 6.5h9v10"/><path d="M12.5 9.5h4.2l3.3 3.6v3.4"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/><path d="M8.8 17.5h6.4M2.5 16.5h2.7M18.8 16.5h2.2"/>',
  pin:'<path d="M12 21c4-4.6 6-7.9 6-10.6A6 6 0 0 0 6 10.4C6 13.1 8 16.4 12 21Z"/><circle cx="12" cy="10.3" r="2.2"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 2"/>',
  shield:'<path d="M12 21c4.4-2 6.5-5.2 6.5-9.6V5.9L12 3.3 5.5 5.9v5.5C5.5 15.8 7.6 19 12 21Z"/><path d="M9.2 11.9 11.4 14l3.6-3.9"/>',
  star:'<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8Z"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 7.9v.1"/>',
  alert:'<path d="M12 3.8 21 19.5H3Z"/><path d="M12 9.6v4.6M12 17v.1"/>',
  truck:'<rect x="2.5" y="6.5" width="11" height="9.6" rx="1.2"/><path d="M13.5 9.8h3.7l3.3 3.5v2.8h-7z"/><circle cx="7" cy="18" r="1.9"/><circle cx="17" cy="18" r="1.9"/><path d="M2.5 16.1h2.6M8.9 16.1h6.2M18.9 16.1h1.6"/>',
  sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/>',
  rows:'<rect x="3.5" y="4.5" width="17" height="5" rx="1.4"/><rect x="3.5" y="14.5" width="17" height="5" rx="1.4"/>',
  user:'<circle cx="12" cy="8.4" r="3.6"/><path d="M4.8 20c.6-3.7 3.6-5.8 7.2-5.8s6.6 2.1 7.2 5.8"/>',
  wa:'<path d="M3.4 20.6 4.9 16.3A8.2 8.2 0 1 1 8.2 19.5Z"/><path d="M9.3 8.9c-.6.1-1.1.7-1.2 1.3-.2 1.9 3 5.4 5 5.6.7 0 1.4-.4 1.7-1 .1-.3 0-.5-.2-.6l-1.6-.9c-.2-.1-.5-.1-.6.1l-.5.6c-1-.5-1.9-1.4-2.4-2.4l.6-.5c.2-.2.2-.4.1-.6l-.9-1.6Z"/>',
  phone:'<path d="M7.6 3.5 9.9 8 8.1 10a11 11 0 0 0 5.9 5.9l2-1.8 4.5 2.3v3a2 2 0 0 1-2.2 2C10.6 20.7 3.3 13.4 2.7 6.2a2 2 0 0 1 2-2.2Z"/>',
  cal:'<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M3.5 10.2h17M8 3.5v4M16 3.5v4"/>',
  globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c4.5 4.7 4.5 12.3 0 17-4.5-4.7-4.5-12.3 0-17Z"/>',
  menu:'<path d="M3.5 7h17M3.5 12h17M3.5 17h17"/>',
  trash:'<path d="M4.5 6.5h15M9 6.5V4.2h6v2.3M6.5 6.5 7.6 20h8.8l1.1-13.5M10.3 10v6.4M13.7 10v6.4"/>',
  pulse:'<path d="M2.5 12.5h4l2.4-6 3.6 12 2.6-8 1.6 2h4.8"/>',
  wrench:'<path d="M15.4 3.6a5.4 5.4 0 0 0-6.1 7.2L3.6 16.5a2 2 0 0 0 2.8 2.8l5.7-5.7a5.4 5.4 0 0 0 7.2-6.1L16.7 10 13 9.3l-.7-3.7Z"/>',
  doc:'<path d="M6 3.5h7.6L18.5 8v12.5H6Z"/><path d="M13.4 3.6v5h5M9 12.5h6M9 16h4"/>',
  refresh:'<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.5 4v4.2h-4.2"/>',
  logout:'<path d="M14.5 8V4.5H4.5v15h10V16"/><path d="M10 12h10.5M17.5 8.5 21 12l-3.5 3.5"/>',
  scan:'<path d="M3.5 8V5.5a2 2 0 0 1 2-2H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16"/><path d="M3.5 12h17"/>'
};

/* ---------------------------------------------------------------- part art */
/* `a` marks the one accent element in each drawing. Never more than one. */
const ART = {
  battery:`<rect class="a" x="33" y="33" width="14" height="11" rx="2"/><rect x="73" y="33" width="14" height="11" rx="2"/>
    <path class="d" d="M36.5 27.5h7M40 24v7M76.5 27.5h7"/>
    <rect x="21" y="44" width="78" height="60" rx="5"/>
    <path class="d" d="M21 59h78"/>
    <rect class="d" x="52" y="48" width="16" height="7" rx="3.5"/>
    <rect class="d" x="30" y="67" width="60" height="29" rx="2"/>
    <path class="d" d="M37 76h39M37 84h30M37 92h21"/>`,

  terminal:`<path d="M69 49A22 22 0 1 0 69 71"/><path d="M69 49h13v9H69M69 62h13v9H69"/>
    <path class="d" d="M75.5 58v4"/><circle class="d" cx="50" cy="60" r="11"/><circle class="d" cx="50" cy="60" r="5"/>
    <path class="a" d="M82 66.5h7a11 11 0 0 1 11 11v20"/>`,

  tire:`<circle cx="60" cy="60" r="46"/><circle class="d" cx="60" cy="60" r="41" stroke-dasharray="5 6"/>
    <circle cx="60" cy="60" r="27"/><circle class="d" cx="60" cy="60" r="23"/>
    <path class="d" d="M60 50V38M69.5 56.9 80.9 53.2M65.9 68.1 72.9 77.8M54.1 68.1 47.1 77.8M50.5 56.9 39.1 53.2"/>
    <circle cx="60" cy="60" r="7"/><path class="a" d="M84 78l6 7"/>`,

  oil:`<path d="M34 52c0-8 4-12 12-14l16-4V22h16v12c6 4 8 8 8 14v50a5 5 0 0 1-5 5H39a5 5 0 0 1-5-5Z"/>
    <rect class="a" x="60" y="12" width="20" height="10" rx="2"/>
    <rect class="d" x="42" y="60" width="38" height="34" rx="2"/>
    <path class="d" d="M48 70h26M48 78h20M48 86h14"/>`,

  coolant:`<path d="M36 46c0-7 4-11 10-13V22h20v11c6 2 10 6 10 13v52a5 5 0 0 1-5 5H41a5 5 0 0 1-5-5Z"/>
    <rect class="a" x="44" y="12" width="24" height="10" rx="2"/>
    <path class="d" d="M36 74c8-4 16 4 24 0s16-4 22 0"/>
    <path class="d" d="M46 56h28"/><path d="M86 60h10a5 5 0 0 1 0 14h-4"/>`,

  filter:`<rect x="36" y="28" width="48" height="64" rx="6"/><path class="d" d="M36 41h48"/>
    <path class="d" d="M47 46v40M60 46v40M73 46v40"/>
    <rect class="a" x="31" y="90" width="58" height="11" rx="4"/>
    <ellipse class="d" cx="60" cy="95.5" rx="9" ry="3.4"/>`,

  rotor:`<circle cx="60" cy="60" r="46"/><circle class="d" cx="60" cy="60" r="41"/>
    <circle cx="60" cy="60" r="21"/><circle class="a" cx="60" cy="60" r="8"/>
    <circle class="d" cx="60" cy="46" r="3"/><circle class="d" cx="73.3" cy="55.7" r="3"/>
    <circle class="d" cx="68.2" cy="71.3" r="3"/><circle class="d" cx="51.8" cy="71.3" r="3"/><circle class="d" cx="46.7" cy="55.7" r="3"/>
    <circle class="d" cx="60" cy="29" r="2.6"/><circle class="d" cx="82" cy="45" r="2.6"/>
    <circle class="d" cx="73.6" cy="71" r="2.6"/><circle class="d" cx="46.4" cy="71" r="2.6"/><circle class="d" cx="38" cy="45" r="2.6"/>`,

  pad:`<path d="M28 40h64a6 6 0 0 1 6 6v8H22v-8a6 6 0 0 1 6-6Z"/>
    <path d="M22 56h76v22a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8Z"/>
    <path class="d" d="M33 65h54M33 74h38"/>
    <path class="a" d="M92 40l6-10 5 3"/>`,

  fan:`<rect x="14" y="14" width="92" height="92" rx="14"/><circle class="d" cx="60" cy="60" r="38"/>
    <g><path d="M60 60c6-14 20-18 25-8 4 8-6 15-25 8Z"/></g>
    <g transform="rotate(72 60 60)"><path d="M60 60c6-14 20-18 25-8 4 8-6 15-25 8Z"/></g>
    <g transform="rotate(144 60 60)"><path d="M60 60c6-14 20-18 25-8 4 8-6 15-25 8Z"/></g>
    <g transform="rotate(216 60 60)"><path d="M60 60c6-14 20-18 25-8 4 8-6 15-25 8Z"/></g>
    <g transform="rotate(288 60 60)"><path d="M60 60c6-14 20-18 25-8 4 8-6 15-25 8Z"/></g>
    <circle class="a" cx="60" cy="60" r="8"/>`,

  radiator:`<rect x="16" y="22" width="88" height="13" rx="3"/><rect x="16" y="85" width="88" height="13" rx="3"/>
    <rect class="d" x="21" y="35" width="78" height="50"/>
    <path class="d" d="M31 35v50M41 35v50M51 35v50M61 35v50M71 35v50M81 35v50M91 35v50"/>
    <path class="a" d="M16 28H6M104 92h10"/>`,

  compressor:`<rect x="20" y="36" width="52" height="50" rx="12"/><path class="d" d="M32 40v42M44 40v42M56 40v42"/>
    <circle cx="86" cy="61" r="20"/><circle class="d" cx="86" cy="61" r="13"/><circle class="a" cx="86" cy="61" r="5"/>
    <rect class="d" x="26" y="24" width="12" height="12" rx="2"/><rect class="d" x="44" y="24" width="12" height="12" rx="2"/>`,

  bulb:`<path d="M46 76c0-26 4-42 14-50 10 8 14 24 14 50Z"/>
    <path class="d" d="M40 76h40"/><rect x="48" y="76" width="24" height="22" rx="2"/>
    <path class="d" d="M48 84h24M48 91h24"/>
    <path class="a" d="M54 60l4-8 4 8 4-8"/>
    <path class="d" d="M56 98v8h8v-8"/>`,

  wiper:`<path d="M16 74c26-12 60-20 88-22"/><path d="M18 82c26-12 60-20 86-22"/>
    <path class="d" d="M22 78c24-11 56-18 80-20"/>
    <rect class="a" x="50" y="60" width="18" height="12" rx="3" transform="rotate(-11 59 66)"/>
    <path class="d" d="M104 52v10M16 74v8"/>`,

  alt:`<rect x="30" y="32" width="56" height="56" rx="15"/><path class="d" d="M74 32v56"/>
    <path class="d" d="M79 44v7M79 56.5v7M79 69v7"/>
    <path class="d" d="M50 32v-9h14v9"/>
    <circle class="a" cx="20" cy="60" r="13"/><circle class="d" cx="20" cy="60" r="6"/>
    <path class="d" d="M30 52h4M30 68h4"/><circle class="d" cx="90" cy="93" r="6"/>`,

  plug:`<rect x="53" y="12" width="14" height="9" rx="1.5"/>
    <path d="M52 21h16v22c0 5-2 7-4 9h-8c-2-2-4-4-4-9Z"/>
    <path d="M49 52h22v18H49Z"/><path class="d" d="M55 52v18M65 52v18"/>
    <path d="M53 70h14v20H53Z"/><path class="d" d="M53 75h14M53 80h14M53 85h14"/>
    <path class="a" d="M53 90v10h8M60 90v7"/>`,

  shock:`<rect class="d" x="44" y="8" width="32" height="9" rx="4"/><path d="M60 17v20"/>
    <rect x="47" y="37" width="26" height="54" rx="7"/>
    <path class="d" d="M47 50h26M47 60h26M47 70h26"/>
    <circle class="a" cx="60" cy="100" r="10"/><circle class="d" cx="60" cy="100" r="4.5"/>`,

  sunshade:`<path d="M18 90c0-32 18-52 42-56 24 4 42 24 42 56Z"/>
    <path class="d" d="M32 90V47M46 90V38M60 90V34M74 90V38M88 90V47"/>
    <circle class="a" cx="60" cy="24" r="7"/>`,

  care:`<path d="M40 30h20v14H40Z"/><path d="M36 44h28a6 6 0 0 1 6 6v46a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V50a6 6 0 0 1 6-6Z"/>
    <path class="d" d="M30 66h40M30 88h40"/>
    <path class="a" d="M60 22h18l8 8"/><path d="M60 22V30"/>`,

  check:`<rect x="26" y="18" width="68" height="86" rx="8"/><rect class="d" x="44" y="10" width="32" height="16" rx="4"/>
    <path class="a" d="M40 62l12 12 28-28"/><path class="d" d="M40 86h40"/>`,

  temp:`<path d="M52 22a8 8 0 0 1 16 0v42a18 18 0 1 1-16 0Z"/>
    <circle class="a" cx="60" cy="84" r="10"/><path class="a" d="M60 74V44"/>
    <path class="d" d="M72 34h10M72 44h8M72 54h10"/>`
};

/* ------------------------------------------------------- vehicle drawings */
/* Side elevations. Hotspot anchors are in the same coordinate space so the
   dots sit exactly on the system they name at any container width. */
const CARS = {
  sedan:{
    body:'M 38 126 L 38 108 C 38 100 42 95 50 93 L 96 88 C 108 86 116 82 123 74 L 150 54 C 154 51 159 49 166 49 L 224 49 C 234 49 241 53 246 61 L 272 84 L 310 85 L 352 87 C 371 89 382 96 384 108 L 384 126 L 344 126 A 30 30 0 0 0 284 126 L 142 126 A 30 30 0 0 0 82 126 Z',
    glass:'M 130 80 L 152 56 C 156 52 160 51 166 51 L 224 51 C 232 51 238 54 243 61 L 266 80 Z',
    lines:'M 196 51 L 196 80 M 196 84 L 194 126 M 146 82 L 145 124 M 264 84 L 262 122 M 150 112 L 278 110 M 96 88 L 272 84',
    det:'M 202 92 h 15 M 270 93 h 15 M 354 96 L 381 101 L 381 110 L 357 106 Z M 40 96 L 56 93 L 56 105 L 40 105 Z M 264 84 l 12 -3 l 2 6',
    wheels:[[112,125,25],[314,125,25]],
    hot:{ lights:[376,104], ac:[352,95], battery:[324,90], oil:[300,104], wipers:[270,86], brakes:[314,125], suspension:[112,100], tires:[112,125] }
  },
  suv:{
    body:'M 34 122 L 34 96 C 34 88 38 83 46 81 L 62 79 L 96 46 C 100 42 106 40 114 40 L 242 40 C 250 40 256 43 260 50 L 280 78 L 350 80 C 370 82 384 90 386 102 L 386 122 L 351 122 A 35 35 0 0 0 281 122 L 145 122 A 35 35 0 0 0 75 122 Z',
    glass:'M 76 76 L 100 48 C 103 44 108 43 114 43 L 241 43 C 247 43 252 45 256 51 L 276 76 Z',
    lines:'M 150 43 L 150 76 M 204 43 L 204 76 M 150 79 L 149 122 M 204 79 L 203 118 M 268 79 L 266 118 M 152 106 L 276 104 M 62 79 L 280 78',
    det:'M 156 88 h 16 M 210 88 h 16 M 352 88 L 383 93 L 383 102 L 355 98 Z M 36 88 L 54 85 L 54 97 L 36 97 Z M 266 79 l 12 -3 l 2 6',
    wheels:[[110,121,29],[316,121,29]],
    hot:{ lights:[378,95], ac:[352,88], battery:[324,84], oil:[298,100], wipers:[276,78], brakes:[316,121], suspension:[110,92], tires:[110,121] }
  },
  pickup:{
    body:'M 30 122 L 30 74 L 178 74 L 184 46 C 187 42 192 40 199 40 L 262 40 C 270 40 276 43 280 50 L 294 78 L 356 80 C 374 82 388 90 390 102 L 390 122 L 359 122 A 35 35 0 0 0 289 122 L 133 122 A 35 35 0 0 0 63 122 Z',
    glass:'M 192 74 L 188 49 C 190 45 194 44 200 44 L 261 44 C 267 44 271 46 274 51 L 290 74 Z',
    lines:'M 232 44 L 232 74 M 232 78 L 231 118 M 30 86 L 178 86 M 184 78 L 184 122 M 140 106 L 284 104 M 294 78 L 356 80',
    det:'M 240 88 h 16 M 358 88 L 387 93 L 387 102 L 361 98 Z M 60 74 v 12 M 148 74 v 12 M 280 78 l 12 -3 l 2 6',
    wheels:[[98,121,29],[324,121,29]],
    hot:{ lights:[382,95], ac:[356,88], battery:[330,85], oil:[304,100], wipers:[288,74], brakes:[324,121], suspension:[98,92], tires:[98,121] }
  }
};

/* System metadata shared by the cutaway, the diagnosis flow and the garage. */
const SYSTEMS = {
  battery:  { icon:'battery', en:'Battery and terminals', ar:'البطارية والأطراف',   dept:'batteries', service:'rescue' },
  oil:      { icon:'oil',     en:'Oil and filters',       ar:'الزيت والفلاتر',      dept:'oils',      service:'oil' },
  brakes:   { icon:'rotor',   en:'Brakes',                ar:'الفرامل',             dept:'brakes',    service:'brakes' },
  ac:       { icon:'fan',     en:'AC and cooling',        ar:'التكييف والتبريد',    dept:'cooling',   service:'ac' },
  lights:   { icon:'bulb',    en:'Lighting',              ar:'الإنارة',             dept:'lighting',  service:null },
  wipers:   { icon:'wiper',   en:'Wipers',                ar:'المساحات',            dept:'lighting',  service:null },
  tires:    { icon:'tire',    en:'Tires',                 ar:'الإطارات',            dept:'tires',     service:'tires' },
  suspension:{icon:'shock',   en:'Suspension',            ar:'التعليق',             dept:'suspension',service:null }
};

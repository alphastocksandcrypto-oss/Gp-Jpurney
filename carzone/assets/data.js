/* ============================================================================
   CarZone Kuwait, prototype data layer.

   Everything the prototype knows lives here so the app code stays about
   behaviour. Three things matter:

   1. VEHICLES carry the two facts that make the finders real: the battery
      group size the model actually takes, and the OE tire size. The battery
      finder and the tire size selector read those rather than guessing.
   2. Fitment is an application list per product (make / model / year span),
      the same shape ACES data arrives in, so the fitment check is a real
      lookup and not a string match.
   3. Every customer facing string is bilingual at the point of definition.
      There is no translation layer bolted on later.

   Sample data. Prices, stock figures and part numbers mirror the shape of
   real records, they are not a live feed. See README.
   ========================================================================= */

/* ---------------------------------------------------------------- vehicles */
/* body drives the cutaway diagram; batt is the BCI / DIN group size;
   tire is the common OE fitment. Year spans cover the Kuwait parc. */
const VEHICLES = {
  toyota: { en: 'Toyota', ar: 'تويوتا', share: 31, models: [
    { id:'land-cruiser', en:'Land Cruiser', ar:'لاند كروزر', body:'suv',    yrs:[2008,2026], eng:['4.0L V6','4.6L V8','5.7L V8','3.5L TT V6'], batt:'H8 / 49', tire:'285/60R18' },
    { id:'prado',        en:'Prado',        ar:'برادو',      body:'suv',    yrs:[2010,2026], eng:['2.7L I4','4.0L V6'],                     batt:'H7 / 94R', tire:'265/60R18' },
    { id:'camry',        en:'Camry',        ar:'كامري',      body:'sedan',  yrs:[2012,2026], eng:['2.0L I4','2.5L I4','3.5L V6'],           batt:'H6 / 48',  tire:'235/45R18' },
    { id:'corolla',      en:'Corolla',      ar:'كورولا',     body:'sedan',  yrs:[2014,2026], eng:['1.6L I4','2.0L I4'],                     batt:'H5 / 47',  tire:'205/55R16' },
    { id:'hilux',        en:'Hilux',        ar:'هايلكس',     body:'pickup', yrs:[2016,2026], eng:['2.7L I4','4.0L V6'],                     batt:'H6 / 48',  tire:'265/65R17' },
    { id:'rav4',         en:'RAV4',         ar:'راف فور',    body:'suv',    yrs:[2013,2026], eng:['2.0L I4','2.5L I4'],                     batt:'H6 / 48',  tire:'225/65R17' },
    { id:'fj-cruiser',   en:'FJ Cruiser',   ar:'إف جيه',     body:'suv',    yrs:[2008,2023], eng:['4.0L V6'],                               batt:'H7 / 94R', tire:'265/70R17' },
    { id:'yaris',        en:'Yaris',        ar:'يارس',       body:'sedan',  yrs:[2014,2026], eng:['1.3L I4','1.5L I4'],                     batt:'H4 / 46',  tire:'185/65R15' } ]},
  lexus: { en:'Lexus', ar:'لكزس', share: 8, models: [
    { id:'lx570', en:'LX 570', ar:'إل إكس 570', body:'suv',   yrs:[2008,2021], eng:['5.7L V8'],            batt:'H8 / 49', tire:'285/50R20' },
    { id:'lx600', en:'LX 600', ar:'إل إكس 600', body:'suv',   yrs:[2022,2026], eng:['3.5L TT V6'],         batt:'H8 / 49', tire:'265/55R20' },
    { id:'gx460', en:'GX 460', ar:'جي إكس 460', body:'suv',   yrs:[2010,2023], eng:['4.6L V8'],            batt:'H7 / 94R',tire:'265/60R18' },
    { id:'es350', en:'ES 350', ar:'إي إس 350',  body:'sedan', yrs:[2013,2026], eng:['2.5L I4','3.5L V6'],  batt:'H6 / 48', tire:'235/45R18' } ]},
  nissan: { en:'Nissan', ar:'نيسان', share: 13, models: [
    { id:'patrol',     en:'Patrol',     ar:'باترول',   body:'suv',   yrs:[2010,2026], eng:['4.0L V6','5.6L V8'], batt:'H8 / 49', tire:'275/60R18' },
    { id:'altima',     en:'Altima',     ar:'التيما',   body:'sedan', yrs:[2013,2026], eng:['2.5L I4','3.5L V6'], batt:'H6 / 48', tire:'215/60R16' },
    { id:'sunny',      en:'Sunny',      ar:'صني',      body:'sedan', yrs:[2012,2026], eng:['1.5L I4'],           batt:'H4 / 46', tire:'185/65R15' },
    { id:'x-trail',    en:'X-Trail',    ar:'إكس تريل', body:'suv',   yrs:[2014,2026], eng:['2.0L I4','2.5L I4'], batt:'H5 / 47', tire:'225/65R17' },
    { id:'pathfinder', en:'Pathfinder', ar:'باثفايندر',body:'suv',   yrs:[2013,2026], eng:['3.5L V6'],           batt:'H6 / 48', tire:'235/65R18' } ]},
  chevrolet: { en:'Chevrolet', ar:'شيفروليه', share: 9, models: [
    { id:'tahoe',     en:'Tahoe',     ar:'تاهو',     body:'suv',    yrs:[2010,2026], eng:['5.3L V8','6.2L V8'], batt:'H7 / 94R', tire:'275/60R20' },
    { id:'suburban',  en:'Suburban',  ar:'سوبربان',  body:'suv',    yrs:[2010,2026], eng:['5.3L V8','6.2L V8'], batt:'H7 / 94R', tire:'275/60R20' },
    { id:'silverado', en:'Silverado', ar:'سلفرادو',  body:'pickup', yrs:[2012,2026], eng:['4.3L V6','5.3L V8'], batt:'H7 / 94R', tire:'265/65R18' },
    { id:'malibu',    en:'Malibu',    ar:'ماليبو',   body:'sedan',  yrs:[2013,2025], eng:['1.5L I4','2.0L I4'], batt:'H6 / 48',  tire:'225/55R17' } ]},
  gmc: { en:'GMC', ar:'جي إم سي', share: 5, models: [
    { id:'yukon',  en:'Yukon',  ar:'يوكن',  body:'suv',    yrs:[2010,2026], eng:['5.3L V8','6.2L V8'], batt:'H7 / 94R', tire:'275/60R20' },
    { id:'sierra', en:'Sierra', ar:'سييرا', body:'pickup', yrs:[2012,2026], eng:['5.3L V8','6.2L V8'], batt:'H7 / 94R', tire:'275/60R20' } ]},
  ford: { en:'Ford', ar:'فورد', share: 4, models: [
    { id:'explorer',  en:'Explorer',  ar:'إكسبلورر', body:'suv',    yrs:[2013,2026], eng:['2.3L I4','3.5L V6'], batt:'H6 / 48',  tire:'255/55R20' },
    { id:'f-150',     en:'F-150',     ar:'إف 150',   body:'pickup', yrs:[2012,2026], eng:['3.5L TT V6','5.0L V8'], batt:'H7 / 94R', tire:'275/65R18' },
    { id:'expedition',en:'Expedition',ar:'إكسبيديشن',body:'suv',    yrs:[2015,2026], eng:['3.5L TT V6'],       batt:'H7 / 94R', tire:'275/65R18' } ]},
  hyundai: { en:'Hyundai', ar:'هيونداي', share: 8, models: [
    { id:'sonata',   en:'Sonata',   ar:'سوناتا',   body:'sedan', yrs:[2013,2026], eng:['2.0L I4','2.4L I4'], batt:'H5 / 47', tire:'215/55R17' },
    { id:'elantra',  en:'Elantra',  ar:'إلنترا',   body:'sedan', yrs:[2014,2026], eng:['1.6L I4','2.0L I4'], batt:'H5 / 47', tire:'205/55R16' },
    { id:'tucson',   en:'Tucson',   ar:'توسان',    body:'suv',   yrs:[2015,2026], eng:['2.0L I4','2.4L I4'], batt:'H5 / 47', tire:'225/60R17' },
    { id:'santa-fe', en:'Santa Fe', ar:'سنتافي',   body:'suv',   yrs:[2013,2026], eng:['2.4L I4','3.3L V6'], batt:'H6 / 48', tire:'235/60R18' } ]},
  kia: { en:'Kia', ar:'كيا', share: 7, models: [
    { id:'cerato',  en:'Cerato',  ar:'سيراتو',  body:'sedan', yrs:[2014,2026], eng:['1.6L I4','2.0L I4'], batt:'H5 / 47', tire:'205/55R16' },
    { id:'sportage',en:'Sportage',ar:'سبورتاج', body:'suv',   yrs:[2014,2026], eng:['2.0L I4','2.4L I4'], batt:'H5 / 47', tire:'225/60R17' },
    { id:'sorento', en:'Sorento', ar:'سورينتو', body:'suv',   yrs:[2014,2026], eng:['2.4L I4','3.3L V6'], batt:'H6 / 48', tire:'235/60R18' } ]},
  honda: { en:'Honda', ar:'هوندا', share: 4, models: [
    { id:'accord', en:'Accord', ar:'أكورد', body:'sedan', yrs:[2013,2026], eng:['1.5L I4','2.4L I4','3.5L V6'], batt:'H5 / 47', tire:'235/45R18' },
    { id:'civic',  en:'Civic',  ar:'سيفيك', body:'sedan', yrs:[2014,2026], eng:['1.5L I4','2.0L I4'],           batt:'H4 / 46', tire:'215/55R16' },
    { id:'cr-v',   en:'CR-V',   ar:'سي آر في',body:'suv',  yrs:[2013,2026], eng:['1.5L I4','2.4L I4'],          batt:'H5 / 47', tire:'235/60R18' } ]},
  mitsubishi: { en:'Mitsubishi', ar:'ميتسوبيشي', share: 4, models: [
    { id:'pajero', en:'Pajero', ar:'باجيرو', body:'suv',    yrs:[2010,2024], eng:['3.0L V6','3.8L V6'], batt:'H6 / 48', tire:'265/60R18' },
    { id:'l200',   en:'L200',   ar:'إل 200',  body:'pickup', yrs:[2015,2026], eng:['2.4L I4'],           batt:'H5 / 47', tire:'245/65R17' } ]},
  mercedes: { en:'Mercedes-Benz', ar:'مرسيدس بنز', share: 3, models: [
    { id:'gle',     en:'GLE',     ar:'جي إل إي', body:'suv',   yrs:[2015,2026], eng:['3.0L I6','3.5L V6'], batt:'H8 / 49', tire:'275/50R20' },
    { id:'e-class', en:'E-Class', ar:'الفئة E',  body:'sedan', yrs:[2014,2026], eng:['2.0L I4','3.0L V6'], batt:'H7 / 94R',tire:'245/45R18' } ]},
  bmw: { en:'BMW', ar:'بي إم دبليو', share: 2, models: [
    { id:'x5',       en:'X5',       ar:'إكس 5',    body:'suv',   yrs:[2014,2026], eng:['3.0L I6','4.4L V8'], batt:'H8 / 49', tire:'275/45R20' },
    { id:'3-series', en:'3 Series', ar:'الفئة الثالثة', body:'sedan', yrs:[2013,2026], eng:['2.0L I4','3.0L I6'], batt:'H7 / 94R', tire:'225/50R17' } ]},
  jeep: { en:'Jeep', ar:'جيب', share: 2, models: [
    { id:'wrangler',      en:'Wrangler',      ar:'رانجلر',      body:'suv', yrs:[2012,2026], eng:['3.6L V6','2.0L I4'], batt:'H7 / 94R', tire:'255/75R17' },
    { id:'grand-cherokee',en:'Grand Cherokee',ar:'جراند شيروكي',body:'suv', yrs:[2012,2026], eng:['3.6L V6','5.7L V8'], batt:'H7 / 94R', tire:'265/60R18' } ]}
};

const YEARS = (() => { const a = []; for (let y = 2026; y >= 2006; y--) a.push(y); return a; })();

/* ------------------------------------------------------------- departments */
const DEPTS = [
  { id:'batteries', en:'Batteries',        ar:'بطاريات',        icon:'battery', lede_en:'Group size matched to your car, tested on the van before we leave.', lede_ar:'مقاس البطارية مطابق لسيارتك، ونفحصها في الفان قبل المغادرة.' },
  { id:'tires',     en:'Tires',            ar:'إطارات',         icon:'tire',    lede_en:'Every tire shows its real production date before you pay.',        lede_ar:'كل إطار يعرض تاريخ إنتاجه الحقيقي قبل الدفع.' },
  { id:'oils',      en:'Oils and filters', ar:'زيوت وفلاتر',    icon:'oil',     lede_en:'Severe duty intervals, because Kuwait is a severe duty country.',  lede_ar:'فترات الخدمة الشاقة، لأن الكويت بيئة قاسية على المحرك.' },
  { id:'brakes',    en:'Brakes',           ar:'فرامل',          icon:'rotor',   lede_en:'Pads, rotors and fluid, matched front and rear.',                  lede_ar:'تيل وأقراص وزيت فرامل، مطابقة أمامي وخلفي.' },
  { id:'cooling',   en:'AC and cooling',   ar:'تكييف وتبريد',   icon:'fan',     lede_en:'The system that fails first at 50 degrees.',                       lede_ar:'النظام الذي يتعطل أولاً عند 50 درجة.' },
  { id:'lighting',  en:'Lighting and wipers', ar:'إنارة ومساحات', icon:'bulb', lede_en:'UV eats rubber and plastic. These are consumables here.',           lede_ar:'الأشعة تأكل المطاط والبلاستيك. هذه مواد استهلاكية هنا.' },
  { id:'electrical',en:'Starting and charging', ar:'التشغيل والشحن', icon:'alt', lede_en:'Alternators, starters, plugs and terminals.',                     lede_ar:'دينمو وسلف وبواجي وأطراف بطارية.' },
  { id:'suspension',en:'Suspension',       ar:'التعليق',        icon:'shock',   lede_en:'Speed bumps, desert tracks and 90 minutes of Gulf Road.',          lede_ar:'المطبات ومسارات البر وطريق الخليج.' },
  { id:'care',      en:'Car care',         ar:'العناية بالسيارة', icon:'care',  lede_en:'Sunshades, wash, interior protection.',                            lede_ar:'واقيات شمس، غسيل، حماية داخلية.' }
];

/* ------------------------------------------------------------------ brands */
const BRANDS = {
  varta:'Varta', acdelco:'ACDelco', amaron:'Amaron', bosch:'Bosch', denso:'Denso',
  toyota:'Toyota Genuine', mobil:'Mobil 1', castrol:'Castrol', ngk:'NGK',
  michelin:'Michelin', bridgestone:'Bridgestone', toyo:'Toyo', goodyear:'Goodyear',
  hankook:'Hankook', textar:'Textar', kyb:'KYB', valeo:'Valeo', zerex:'ZEREX',
  carzone:'CarZone'
};

/* ---------------------------------------------------------------- products */
/* fits: application list. { mk:'toyota', md:'camry', from:2018, to:2026 }
   universal: true for anything that is not vehicle specific.
   art: which technical illustration to draw.
   install: flat fitting fee in KWD, null when we do not fit it. */
const PRODUCTS = [
  /* ---- batteries ------------------------------------------------------- */
  { sku:'VAR-H8-AGM', dept:'batteries', brand:'varta', art:'battery', accent:'flame',
    en:'Silver Dynamic AGM H8', ar:'سيلفر ديناميك AGM H8',
    price:64.500, was:71.000, rating:4.8, reviews:212, stock:38, sameDay:true, install:3.500,
    oem:['595 901 085','H8-AGM'], xref:['49-AGM','L5-AGM'],
    attrs:{ group:'H8 / 49', cca:850, ah:95, tech:'AGM', warranty:'24 months', terminal:'Right positive' },
    fits:[ {mk:'toyota',md:'land-cruiser',from:2008,to:2026}, {mk:'lexus',md:'lx570',from:2008,to:2021},
           {mk:'lexus',md:'lx600',from:2022,to:2026}, {mk:'nissan',md:'patrol',from:2010,to:2026},
           {mk:'mercedes',md:'gle',from:2015,to:2026}, {mk:'bmw',md:'x5',from:2014,to:2026} ],
    note_en:'Absorbed glass mat. Holds charge through a 50 degree soak better than flooded, which is why it carries the longer warranty.',
    note_ar:'تقنية AGM تتحمل الحرارة العالية أفضل من البطارية السائلة، ولهذا ضمانها أطول.' },

  { sku:'VAR-H7-EFB', dept:'batteries', brand:'varta', art:'battery', accent:'flame',
    en:'Blue Dynamic EFB H7', ar:'بلو ديناميك EFB H7',
    price:44.900, was:49.500, rating:4.7, reviews:341, stock:64, sameDay:true, install:3.500,
    oem:['570 901 076','H7-EFB'], xref:['94R','L4'],
    attrs:{ group:'H7 / 94R', cca:760, ah:80, tech:'EFB', warranty:'18 months', terminal:'Right positive' },
    fits:[ {mk:'toyota',md:'prado',from:2010,to:2026}, {mk:'toyota',md:'fj-cruiser',from:2008,to:2023},
           {mk:'lexus',md:'gx460',from:2010,to:2023}, {mk:'chevrolet',md:'tahoe',from:2010,to:2026},
           {mk:'chevrolet',md:'suburban',from:2010,to:2026}, {mk:'chevrolet',md:'silverado',from:2012,to:2026},
           {mk:'gmc',md:'yukon',from:2010,to:2026}, {mk:'gmc',md:'sierra',from:2012,to:2026},
           {mk:'ford',md:'f-150',from:2012,to:2026}, {mk:'ford',md:'expedition',from:2015,to:2026},
           {mk:'jeep',md:'wrangler',from:2012,to:2026}, {mk:'jeep',md:'grand-cherokee',from:2012,to:2026},
           {mk:'mercedes',md:'e-class',from:2014,to:2026}, {mk:'bmw',md:'3-series',from:2013,to:2026} ],
    note_en:'Enhanced flooded. The sensible middle for a large engine that is driven daily.',
    note_ar:'الخيار المتوازن لمحرك كبير يُستخدم يومياً.' },

  { sku:'ACD-H6-STD', dept:'batteries', brand:'acdelco', art:'battery', accent:'ink',
    en:'Professional H6 maintenance free', ar:'بروفيشنال H6 بدون صيانة',
    price:33.750, was:null, rating:4.6, reviews:288, stock:71, sameDay:true, install:3.500,
    oem:['48AGM','H6'], xref:['L3','48'],
    attrs:{ group:'H6 / 48', cca:680, ah:70, tech:'Flooded', warranty:'12 months', terminal:'Right positive' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2026}, {mk:'toyota',md:'hilux',from:2016,to:2026},
           {mk:'toyota',md:'rav4',from:2013,to:2026}, {mk:'lexus',md:'es350',from:2013,to:2026},
           {mk:'nissan',md:'altima',from:2013,to:2026}, {mk:'nissan',md:'pathfinder',from:2013,to:2026},
           {mk:'chevrolet',md:'malibu',from:2013,to:2025}, {mk:'ford',md:'explorer',from:2013,to:2026},
           {mk:'hyundai',md:'santa-fe',from:2013,to:2026}, {mk:'kia',md:'sorento',from:2014,to:2026},
           {mk:'mitsubishi',md:'pajero',from:2010,to:2024} ],
    note_en:'The volume battery for mid size Japanese and American cars. Twelve month replacement, no proration.',
    note_ar:'البطارية الأكثر مبيعاً للسيارات المتوسطة. استبدال 12 شهراً بدون تناسب.' },

  { sku:'AMA-H5-HL', dept:'batteries', brand:'amaron', art:'battery', accent:'ink',
    en:'Hi-Life H5 55D23L', ar:'هاي لايف H5 55D23L',
    price:27.500, was:31.000, rating:4.4, reviews:196, stock:52, sameDay:true, install:3.500,
    oem:['55D23L'], xref:['H5','47'],
    attrs:{ group:'H5 / 47', cca:580, ah:60, tech:'Flooded', warranty:'12 months', terminal:'Left positive' },
    fits:[ {mk:'toyota',md:'corolla',from:2014,to:2026}, {mk:'nissan',md:'x-trail',from:2014,to:2026},
           {mk:'hyundai',md:'sonata',from:2013,to:2026}, {mk:'hyundai',md:'elantra',from:2014,to:2026},
           {mk:'hyundai',md:'tucson',from:2015,to:2026}, {mk:'kia',md:'cerato',from:2014,to:2026},
           {mk:'kia',md:'sportage',from:2014,to:2026}, {mk:'honda',md:'accord',from:2013,to:2026},
           {mk:'honda',md:'cr-v',from:2013,to:2026}, {mk:'mitsubishi',md:'l200',from:2015,to:2026} ],
    note_en:'Lowest cost per month if you replace on schedule rather than on failure.',
    note_ar:'الأقل تكلفة شهرياً إذا استبدلتها في موعدها بدل انتظار تعطلها.' },

  { sku:'ACD-H4-STD', dept:'batteries', brand:'acdelco', art:'battery', accent:'ink',
    en:'Professional H4 maintenance free', ar:'بروفيشنال H4 بدون صيانة',
    price:24.900, was:null, rating:4.5, reviews:143, stock:44, sameDay:true, install:3.500,
    oem:['46','H4'], xref:['L1','LN1'],
    attrs:{ group:'H4 / 46', cca:520, ah:52, tech:'Flooded', warranty:'12 months', terminal:'Right positive' },
    fits:[ {mk:'toyota',md:'yaris',from:2014,to:2026}, {mk:'nissan',md:'sunny',from:2012,to:2026},
           {mk:'honda',md:'civic',from:2014,to:2026} ],
    note_en:'Small engine group size. Light enough for a one person fit.',
    note_ar:'مقاس صغير للمحركات الصغيرة، خفيف ويمكن تركيبه بشخص واحد.' },

  { sku:'ACD-H8-AGM', dept:'batteries', brand:'acdelco', art:'battery', accent:'ink',
    en:'Professional AGM H8', ar:'بروفيشنال AGM H8',
    price:57.900, was:null, rating:4.6, reviews:118, stock:21, sameDay:true, install:3.500,
    oem:['49AGM','H8'], xref:['L5','595-901'],
    attrs:{ group:'H8 / 49', cca:800, ah:92, tech:'AGM', warranty:'18 months', terminal:'Right positive' },
    fits:[ {mk:'toyota',md:'land-cruiser',from:2008,to:2026}, {mk:'lexus',md:'lx570',from:2008,to:2021},
           {mk:'lexus',md:'lx600',from:2022,to:2026}, {mk:'nissan',md:'patrol',from:2010,to:2026},
           {mk:'mercedes',md:'gle',from:2015,to:2026}, {mk:'bmw',md:'x5',from:2014,to:2026} ],
    note_en:'The same technology as the Varta at a lower price, with six months less warranty. That is the whole difference.',
    note_ar:'نفس تقنية فارتا بسعر أقل وضمان أقصر بستة أشهر. هذا كل الفرق.' },

  { sku:'CZ-H8-AGM', dept:'batteries', brand:'carzone', art:'battery', accent:'flame',
    en:'CarZone AGM H8', ar:'كارزون AGM H8',
    price:49.500, was:54.000, rating:4.4, reviews:64, stock:33, sameDay:true, install:0,
    oem:['H8'], xref:['49','L5'],
    attrs:{ group:'H8 / 49', cca:780, ah:90, tech:'AGM', warranty:'24 months', terminal:'Right positive' },
    fits:[ {mk:'toyota',md:'land-cruiser',from:2008,to:2026}, {mk:'lexus',md:'lx570',from:2008,to:2021},
           {mk:'lexus',md:'lx600',from:2022,to:2026}, {mk:'nissan',md:'patrol',from:2010,to:2026},
           {mk:'mercedes',md:'gle',from:2015,to:2026}, {mk:'bmw',md:'x5',from:2014,to:2026} ],
    note_en:'Our own label, built by a regional plant that also makes for two of the brands above. Fitting is included rather than charged, because we do not pay a brand licence on it.',
    note_ar:'علامتنا الخاصة، يصنعها مصنع إقليمي ينتج أيضاً لعلامتين مما سبق. التركيب مشمول لا مدفوع، لأننا لا ندفع رسوم علامة عليها.' },

  { sku:'BOS-H7-S5', dept:'batteries', brand:'bosch', art:'battery', accent:'ink',
    en:'S5 AGM H7', ar:'S5 AGM H7',
    price:54.500, was:null, rating:4.7, reviews:151, stock:19, sameDay:true, install:3.500,
    oem:['S5A08','H7'], xref:['94R','L4'],
    attrs:{ group:'H7 / 94R', cca:800, ah:80, tech:'AGM', warranty:'24 months', terminal:'Right positive' },
    fits:[ {mk:'toyota',md:'prado',from:2010,to:2026}, {mk:'toyota',md:'fj-cruiser',from:2008,to:2023},
           {mk:'lexus',md:'gx460',from:2010,to:2023}, {mk:'chevrolet',md:'tahoe',from:2010,to:2026},
           {mk:'chevrolet',md:'suburban',from:2010,to:2026}, {mk:'chevrolet',md:'silverado',from:2012,to:2026},
           {mk:'gmc',md:'yukon',from:2010,to:2026}, {mk:'gmc',md:'sierra',from:2012,to:2026},
           {mk:'ford',md:'f-150',from:2012,to:2026}, {mk:'ford',md:'expedition',from:2015,to:2026},
           {mk:'jeep',md:'wrangler',from:2012,to:2026}, {mk:'jeep',md:'grand-cherokee',from:2012,to:2026},
           {mk:'mercedes',md:'e-class',from:2014,to:2026}, {mk:'bmw',md:'3-series',from:2013,to:2026} ],
    note_en:'Worth the step up from EFB if the car has stop start, or if it sits at the airport car park for weeks at a time.',
    note_ar:'تستحق الترقية من EFB إذا كانت السيارة بنظام إيقاف وتشغيل، أو تبقى في موقف المطار أسابيع.' },

  { sku:'CZ-H6-AGM', dept:'batteries', brand:'carzone', art:'battery', accent:'flame',
    en:'CarZone AGM H6', ar:'كارزون AGM H6',
    price:38.900, was:42.500, rating:4.3, reviews:88, stock:46, sameDay:true, install:0,
    oem:['H6'], xref:['48','L3'],
    attrs:{ group:'H6 / 48', cca:720, ah:70, tech:'AGM', warranty:'24 months', terminal:'Right positive' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2026}, {mk:'toyota',md:'hilux',from:2016,to:2026},
           {mk:'toyota',md:'rav4',from:2013,to:2026}, {mk:'lexus',md:'es350',from:2013,to:2026},
           {mk:'nissan',md:'altima',from:2013,to:2026}, {mk:'nissan',md:'pathfinder',from:2013,to:2026},
           {mk:'chevrolet',md:'malibu',from:2013,to:2025}, {mk:'ford',md:'explorer',from:2013,to:2026},
           {mk:'hyundai',md:'santa-fe',from:2013,to:2026}, {mk:'kia',md:'sorento',from:2014,to:2026},
           {mk:'mitsubishi',md:'pajero',from:2010,to:2024} ],
    note_en:'AGM at close to a flooded price, with fitting included. The house label exists to hold that price point.',
    note_ar:'AGM بسعر قريب من السائلة، والتركيب مشمول. العلامة الخاصة موجودة للحفاظ على هذا السعر.' },

  { sku:'CZ-TERM-KIT', dept:'batteries', brand:'carzone', art:'terminal', accent:'flame', universal:true,
    en:'Battery terminal and protector kit', ar:'طقم أطراف بطارية وحماية',
    price:3.250, was:null, rating:4.3, reviews:97, stock:210, sameDay:true, install:null,
    oem:[], xref:[], attrs:{ material:'Lead alloy', includes:'2 clamps, felt washers, protector spray' },
    note_en:'Corroded terminals imitate a dead battery. Cheapest thing to rule out first.',
    note_ar:'الأطراف المتآكلة تبدو كبطارية تالفة. أرخص شيء تستبعده أولاً.' },

  /* ---- tires ----------------------------------------------------------- */
  { sku:'MIC-2354518-PS', dept:'tires', brand:'michelin', art:'tire', accent:'ink', universal:true,
    en:'Pilot Sport 5 235/45R18 98Y', ar:'بايلوت سبورت 5 مقاس 235/45R18',
    price:52.000, was:null, rating:4.9, reviews:164, stock:16, sameDay:true, install:6.500,
    oem:[], xref:[], tire:{ w:235, a:45, r:18, load:98, speed:'Y', dot:'0626', tread:'sport' },
    attrs:{ size:'235/45R18', load:'98', speed:'Y (300 km/h)', dot:'Week 06 / 2026', treadwear:'320' },
    note_en:'Summer compound. Best wet braking in this size, and it is the compound that copes with hot asphalt.',
    note_ar:'خلطة صيفية. أفضل كبح على المبلل في هذا المقاس، وتتحمل الأسفلت الحار.' },

  { sku:'BRI-2355518-T', dept:'tires', brand:'bridgestone', art:'tire', accent:'ink', universal:true,
    en:'Turanza T005 235/45R18 94W', ar:'تورانزا T005 مقاس 235/45R18',
    price:41.500, was:45.000, rating:4.6, reviews:221, stock:28, sameDay:true, install:6.500,
    oem:[], xref:[], tire:{ w:235, a:45, r:18, load:94, speed:'W', dot:'1126', tread:'hp' },
    attrs:{ size:'235/45R18', load:'94', speed:'W (270 km/h)', dot:'Week 11 / 2026', treadwear:'300' },
    note_en:'Quieter than the sport compound and cheaper to replace. The default sedan choice.',
    note_ar:'أهدأ من الخلطة الرياضية وأرخص في الاستبدال. الخيار الافتراضي للسيدان.' },

  { sku:'TOY-26570R17-AT', dept:'tires', brand:'toyo', art:'tire', accent:'flame', universal:true,
    en:'Open Country A/T III 265/70R17 115T', ar:'أوبن كنتري A/T III مقاس 265/70R17',
    price:38.500, was:null, rating:4.8, reviews:307, stock:34, sameDay:true, install:6.500,
    oem:[], xref:[], tire:{ w:265, a:70, r:17, load:115, speed:'T', dot:'0326', tread:'at' },
    attrs:{ size:'265/70R17', load:'115', speed:'T (190 km/h)', dot:'Week 03 / 2026', treadwear:'620' },
    note_en:'All terrain. Sidewall strong enough for Mutla ridge, quiet enough for the school run.',
    note_ar:'لجميع الأرضيات. جدار جانبي يتحمل جال المطلاع، وهادئ كفاية للاستخدام اليومي.' },

  { sku:'GOO-26560R18-SUV', dept:'tires', brand:'goodyear', art:'tire', accent:'ink', universal:true,
    en:'EfficientGrip 2 SUV 265/60R18 110H', ar:'إيفيشنت جريب 2 مقاس 265/60R18',
    price:44.000, was:48.500, rating:4.5, reviews:138, stock:22, sameDay:true, install:6.500,
    oem:[], xref:[], tire:{ w:265, a:60, r:18, load:110, speed:'H', dot:'4025', tread:'hp' },
    attrs:{ size:'265/60R18', load:'110', speed:'H (210 km/h)', dot:'Week 40 / 2025', treadwear:'500' },
    note_en:'Highway pattern for a heavy SUV. Rated to carry the load at sustained speed.',
    note_ar:'نقشة طرق سريعة لسيارة دفع رباعي ثقيلة، بتحمل حمولة عند سرعات مستمرة.' },

  { sku:'HAN-27560R18-V', dept:'tires', brand:'hankook', art:'tire', accent:'ink', universal:true,
    en:'Dynapro HP2 275/60R18 113H', ar:'ديناپرو HP2 مقاس 275/60R18',
    price:36.000, was:null, rating:4.4, reviews:96, stock:40, sameDay:true, install:6.500,
    oem:[], xref:[], tire:{ w:275, a:60, r:18, load:113, speed:'H', dot:'1826', tread:'hp' },
    attrs:{ size:'275/60R18', load:'113', speed:'H (210 km/h)', dot:'Week 18 / 2026', treadwear:'520' },
    note_en:'The value fitment for a Patrol or a Tahoe. Same size, lower spend, shorter tread life.',
    note_ar:'الخيار الاقتصادي للباترول والتاهو. نفس المقاس بسعر أقل وعمر أقصر.' },

  { sku:'MIC-20555R16-P4', dept:'tires', brand:'michelin', art:'tire', accent:'ink', universal:true,
    en:'Primacy 4 205/55R16 94V', ar:'برايمسي 4 مقاس 205/55R16',
    price:29.500, was:null, rating:4.7, reviews:184, stock:46, sameDay:true, install:5.500,
    oem:[], xref:[], tire:{ w:205, a:55, r:16, load:94, speed:'V', dot:'0926', tread:'hp' },
    attrs:{ size:'205/55R16', load:'94', speed:'V (240 km/h)', dot:'Week 09 / 2026', treadwear:'340' },
    note_en:'Compact sedan size. Wears evenly if you keep the pressure honest through summer.',
    note_ar:'مقاس السيدان المدمجة. تآكل متوازن إذا حافظت على ضغط الهواء صيفاً.' },

  { sku:'BRI-22565R17-D', dept:'tires', brand:'bridgestone', art:'tire', accent:'ink', universal:true,
    en:'Dueler H/L 33 225/65R17 102H', ar:'دويلر H/L 33 مقاس 225/65R17',
    price:33.500, was:null, rating:4.5, reviews:127, stock:31, sameDay:true, install:6.000,
    oem:[], xref:[], tire:{ w:225, a:65, r:17, load:102, speed:'H', dot:'1426', tread:'at' },
    attrs:{ size:'225/65R17', load:'102', speed:'H (210 km/h)', dot:'Week 14 / 2026', treadwear:'480' },
    note_en:'Crossover fitment, road biased. Do not take it off the graded track.',
    note_ar:'لسيارات الكروس أوفر، مخصصة للطرق المعبدة.' },

  /* ---- oils and filters ------------------------------------------------ */
  { sku:'MOB-5W30-4L', dept:'oils', brand:'mobil', art:'oil', accent:'flame', universal:true,
    en:'Mobil 1 Extended Performance 5W-30, 4L', ar:'موبيل 1 إكستندد 5W-30، 4 لتر',
    price:19.750, was:22.500, rating:4.9, reviews:512, stock:180, sameDay:true, install:null,
    oem:[], xref:[], attrs:{ viscosity:'5W-30', volume:'4 litre', spec:'API SP, ILSAC GF-6A', base:'Full synthetic' },
    note_en:'Severe duty here means 5,000 km, not 10,000. Heat shears the oil long before the mileage says so.',
    note_ar:'الخدمة الشاقة هنا تعني 5,000 كم لا 10,000. الحرارة تُتلف الزيت قبل أن يبلغ المسافة.' },

  { sku:'CAS-0W20-4L', dept:'oils', brand:'castrol', art:'oil', accent:'ink', universal:true,
    en:'Castrol EDGE 0W-20, 4L', ar:'كاسترول إيدج 0W-20، 4 لتر',
    price:18.250, was:null, rating:4.7, reviews:298, stock:140, sameDay:true, install:null,
    oem:[], xref:[], attrs:{ viscosity:'0W-20', volume:'4 litre', spec:'API SP, ILSAC GF-6A', base:'Full synthetic' },
    note_en:'Only if your manual calls for 0W-20. Thinner than 5W-30, and the wrong grade costs fuel and wear.',
    note_ar:'فقط إذا نص دليل سيارتك على 0W-20. اللزوجة الخاطئة تكلفك وقوداً وتآكلاً.' },

  { sku:'TOY-90915-YZZD4', dept:'oils', brand:'toyota', art:'filter', accent:'ink',
    en:'Genuine oil filter 90915-YZZD4', ar:'فلتر زيت أصلي 90915-YZZD4',
    price:2.950, was:null, rating:4.9, reviews:604, stock:400, sameDay:true, install:null,
    oem:['90915-YZZD4','04152-YZZA1'], xref:['PH9688','C-1113'],
    attrs:{ type:'Spin-on', thread:'M20 x 1.5', bypass:'1.0 bar' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2026}, {mk:'toyota',md:'corolla',from:2014,to:2026},
           {mk:'toyota',md:'rav4',from:2013,to:2026}, {mk:'toyota',md:'hilux',from:2016,to:2026},
           {mk:'toyota',md:'land-cruiser',from:2008,to:2026}, {mk:'toyota',md:'prado',from:2010,to:2026},
           {mk:'lexus',md:'es350',from:2013,to:2026}, {mk:'lexus',md:'gx460',from:2010,to:2023} ],
    note_en:'The filter the factory specifies. Cross references to PH9688 if your workshop quotes that number.',
    note_ar:'الفلتر الأصلي من المصنع. يقابل الرقم PH9688 إذا ذكرته لك الورشة.' },

  { sku:'DEN-CAB-4522', dept:'oils', brand:'denso', art:'filter', accent:'ink',
    en:'Cabin air filter, activated carbon', ar:'فلتر مقصورة بالكربون النشط',
    price:6.500, was:8.000, rating:4.6, reviews:233, stock:160, sameDay:true, install:1.500,
    oem:['87139-0N010','87139-YZZ20'], xref:['CF10285'],
    attrs:{ type:'Carbon panel', service:'Every 10,000 km in dust season' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2026}, {mk:'toyota',md:'corolla',from:2014,to:2026},
           {mk:'toyota',md:'land-cruiser',from:2008,to:2026}, {mk:'lexus',md:'es350',from:2013,to:2026},
           {mk:'nissan',md:'altima',from:2013,to:2026}, {mk:'nissan',md:'patrol',from:2010,to:2026} ],
    note_en:'A blocked cabin filter is the first thing to check when the air conditioning feels weak.',
    note_ar:'فلتر المقصورة المسدود أول ما يُفحص عند ضعف تدفق هواء التكييف.' },

  { sku:'BOS-AIR-S3937', dept:'oils', brand:'bosch', art:'filter', accent:'ink',
    en:'Engine air filter S3937', ar:'فلتر هواء محرك S3937',
    price:5.750, was:null, rating:4.5, reviews:171, stock:120, sameDay:true, install:1.500,
    oem:['17801-0P051','17801-31170'], xref:['S3937','CA10171'],
    attrs:{ type:'Panel', media:'Cellulose blend' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2026}, {mk:'toyota',md:'prado',from:2010,to:2026},
           {mk:'lexus',md:'gx460',from:2010,to:2023}, {mk:'toyota',md:'fj-cruiser',from:2008,to:2023} ],
    note_en:'Dust season halves the service interval. Hold it up to the light before you decide.',
    note_ar:'موسم الغبار يقلل فترة التغيير للنصف. اعرضه على الضوء قبل أن تقرر.' },

  { sku:'ZER-G05-4L', dept:'cooling', brand:'zerex', art:'coolant', accent:'ink', universal:true,
    en:'ZEREX G-05 coolant, ready mixed 4L', ar:'مبرد زيروكس G-05 جاهز 4 لتر',
    price:7.250, was:null, rating:4.6, reviews:189, stock:150, sameDay:true, install:null,
    oem:[], xref:[], attrs:{ type:'HOAT', mix:'Pre-diluted 50/50', life:'5 years or 240,000 km' },
    note_en:'Pre mixed so nobody tops up with tap water, which is what kills radiators here.',
    note_ar:'جاهز الخلط حتى لا يُضاف ماء الصنبور، وهو ما يُتلف الردياتيرات هنا.' },

  /* ---- brakes ---------------------------------------------------------- */
  { sku:'TEX-2478-FR', dept:'brakes', brand:'textar', art:'pad', accent:'flame',
    en:'Ceramic front brake pads', ar:'تيل فرامل أمامي سيراميك',
    price:23.500, was:27.000, rating:4.7, reviews:154, stock:60, sameDay:true, install:12.000,
    oem:['04465-06200','04465-33471'], xref:['D1212','TX-2478'],
    attrs:{ position:'Front axle', material:'Ceramic', wear_sensor:'Included', shims:'Included' },
    fits:[ {mk:'toyota',md:'camry',from:2018,to:2026}, {mk:'lexus',md:'es350',from:2019,to:2026},
           {mk:'toyota',md:'rav4',from:2019,to:2026} ],
    note_en:'Ceramic means less dust on the wheel and quieter cold stops. It does not mean shorter stopping distance.',
    note_ar:'السيراميك يعني غباراً أقل وصوتاً أهدأ، ولا يعني مسافة توقف أقصر.' },

  { sku:'BOS-ROT-FR-296', dept:'brakes', brand:'bosch', art:'rotor', accent:'ink',
    en:'QuietCast front rotor, 296 mm', ar:'قرص فرامل أمامي 296 ملم',
    price:31.000, was:null, rating:4.6, reviews:88, stock:24, sameDay:true, install:14.000,
    oem:['43512-06180'], xref:['BSD1234'],
    attrs:{ position:'Front axle', diameter:'296 mm', thickness:'28 mm', coating:'Aluminium zinc' },
    fits:[ {mk:'toyota',md:'camry',from:2018,to:2026}, {mk:'lexus',md:'es350',from:2019,to:2026} ],
    note_en:'Sold each. Replace in pairs, and replace pads at the same time or the new surface will not bed in.',
    note_ar:'يُباع بالقطعة. استبدله بالزوج مع التيل، وإلا لن تتشكل طبقة الاحتكاك بشكل صحيح.' },

  { sku:'TEX-3391-RR', dept:'brakes', brand:'textar', art:'pad', accent:'ink',
    en:'Ceramic rear brake pads', ar:'تيل فرامل خلفي سيراميك',
    price:19.750, was:null, rating:4.6, reviews:73, stock:44, sameDay:true, install:12.000,
    oem:['04466-33210'], xref:['D1213'],
    attrs:{ position:'Rear axle', material:'Ceramic', wear_sensor:'Not fitted' },
    fits:[ {mk:'toyota',md:'camry',from:2018,to:2026}, {mk:'toyota',md:'rav4',from:2019,to:2026},
           {mk:'lexus',md:'es350',from:2019,to:2026} ],
    note_en:'Rear pads usually last twice as long as fronts. Check them, do not replace on a schedule.',
    note_ar:'التيل الخلفي يدوم عادة ضعف الأمامي. افحصه بدل استبداله بالجدول.' },

  { sku:'BOS-DOT4-1L', dept:'brakes', brand:'bosch', art:'coolant', accent:'ink', universal:true,
    en:'DOT 4 brake fluid, 1L', ar:'زيت فرامل DOT 4، 1 لتر',
    price:4.250, was:null, rating:4.5, reviews:112, stock:90, sameDay:true, install:null,
    oem:[], xref:[], attrs:{ spec:'DOT 4', boiling_dry:'260 C', service:'Every 2 years' },
    note_en:'Brake fluid absorbs water, and water boils. Two years is the interval regardless of mileage.',
    note_ar:'زيت الفرامل يمتص الماء، والماء يغلي. سنتان هي الفترة بغض النظر عن المسافة.' },

  /* ---- AC and cooling -------------------------------------------------- */
  { sku:'DEN-COMP-4472', dept:'cooling', brand:'denso', art:'compressor', accent:'flame',
    en:'AC compressor, 10S17C', ar:'كمبروسر تكييف 10S17C',
    price:148.000, was:169.000, rating:4.5, reviews:41, stock:8, sameDay:false, lead:'2 to 4 days', install:35.000,
    oem:['88320-06390','447280-4520'], xref:['10S17C','471-1615'],
    attrs:{ type:'10 cylinder swash plate', refrigerant:'R134a', clutch:'Included', oil:'PAG 46 charged' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2018}, {mk:'lexus',md:'es350',from:2013,to:2018} ],
    note_en:'Fit a new receiver drier and flush the lines at the same time or the warranty does not stand.',
    note_ar:'يجب تركيب مجفف جديد وغسل الخطوط، وإلا يسقط الضمان.' },

  { sku:'DEN-CONDENSER-CAM', dept:'cooling', brand:'denso', art:'radiator', accent:'ink',
    en:'AC condenser', ar:'مكثف تكييف',
    price:56.500, was:null, rating:4.4, reviews:29, stock:11, sameDay:true, install:22.000,
    oem:['88460-06280'], xref:['477-0771'],
    attrs:{ type:'Parallel flow', material:'Aluminium', drier:'Integrated' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2018} ],
    note_en:'Stone damage from the Sixth Ring is the usual cause. Look for oily dirt on the face before you condemn the compressor.',
    note_ar:'الضرر من الحصى هو السبب الشائع. افحص وجود زيت وأتربة على الوجه قبل اتهام الكمبروسر.' },

  { sku:'DEN-FAN-ASSY-16', dept:'cooling', brand:'denso', art:'fan', accent:'ink',
    en:'Radiator fan assembly, dual', ar:'طقم مروحة ردياتير مزدوج',
    price:74.000, was:82.000, rating:4.3, reviews:22, stock:6, sameDay:false, lead:'2 to 4 days', install:26.000,
    oem:['16711-0P160'], xref:['620-560'],
    attrs:{ type:'Dual fan with shroud', motor:'Brushed 12V', connector:'OE pattern' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2018}, {mk:'lexus',md:'es350',from:2013,to:2018} ],
    note_en:'When the temperature climbs in traffic but drops on the motorway, this is where to look.',
    note_ar:'إذا ارتفعت الحرارة في الزحام وانخفضت على الطريق السريع، فالمشكلة هنا غالباً.' },

  /* ---- lighting and wipers --------------------------------------------- */
  { sku:'BOS-WIP-26-22', dept:'lighting', brand:'bosch', art:'wiper', accent:'ink', universal:true,
    en:'Aerotwin wiper pair, 26 in and 22 in', ar:'زوج مساحات إيروتوين 26 و22 بوصة',
    price:11.500, was:14.000, rating:4.7, reviews:407, stock:130, sameDay:true, install:1.000,
    oem:[], xref:['A units 26/22'],
    attrs:{ sizes:'660 mm and 550 mm', frame:'Beam, frameless', coating:'Graphite' },
    note_en:'Rubber hardens in the heat whether it rains or not. Replace annually, before the first dust rain.',
    note_ar:'المطاط يتصلب بالحرارة حتى بدون مطر. استبدلها سنوياً قبل أول مطرة غبار.' },

  { sku:'NGK-H11-LED', dept:'lighting', brand:'ngk', art:'bulb', accent:'flame', universal:true,
    en:'LED headlight pair H11, 6000K', ar:'زوج لمبات LED أمامية H11، 6000K',
    price:17.500, was:21.000, rating:4.4, reviews:212, stock:88, sameDay:true, install:2.000,
    oem:['H11'], xref:['H8','H9'],
    attrs:{ fitting:'H11', colour:'6000K', lumens:'2,600 per bulb', canbus:'Built in' },
    note_en:'Fits the H11 socket. In a reflector housing an LED scatters light, so check yours is a projector first.',
    note_ar:'يناسب قاعدة H11. في العاكس العادي يتشتت ضوء الـLED، تأكد أن كشافك عدسة.' },

  { sku:'BOS-BULB-H7-PL', dept:'lighting', brand:'bosch', art:'bulb', accent:'ink', universal:true,
    en:'Plus 150 halogen H7, pair', ar:'هالوجين بلس 150 مقاس H7، زوج',
    price:8.750, was:null, rating:4.5, reviews:158, stock:96, sameDay:true, install:2.000,
    oem:['H7'], xref:['499'],
    attrs:{ fitting:'H7', output:'150 percent more light', life:'Around 450 hours' },
    note_en:'Replace in pairs. A new bulb next to an old one makes the old side look broken.',
    note_ar:'استبدلها بالزوج. اللمبة الجديدة تُظهر القديمة وكأنها معطلة.' },

  /* ---- starting and charging ------------------------------------------- */
  { sku:'DEN-ALT-104210', dept:'electrical', brand:'denso', art:'alt', accent:'flame',
    en:'Alternator, 130A', ar:'دينمو 130 أمبير',
    price:132.000, was:null, rating:4.6, reviews:37, stock:9, sameDay:false, lead:'2 to 4 days', install:28.000,
    oem:['27060-0P200'], xref:['104210-3400','11588'],
    attrs:{ output:'130 A', pulley:'6 rib clutch pulley', regulator:'Integrated' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2018}, {mk:'lexus',md:'es350',from:2013,to:2018} ],
    note_en:'A battery that dies again within weeks is usually a charging fault. Our van tests output before it sells you a battery.',
    note_ar:'البطارية التي تموت بعد أسابيع تعني غالباً خلل شحن. الفان يفحص الدينمو قبل بيعك بطارية.' },

  { sku:'NGK-IRIDIUM-4S', dept:'electrical', brand:'ngk', art:'plug', accent:'ink',
    en:'Iridium IX spark plugs, set of 4', ar:'بواجي إيريديوم IX، طقم 4',
    price:16.500, was:19.000, rating:4.8, reviews:263, stock:70, sameDay:true, install:9.000,
    oem:['90919-01253'], xref:['IFR6T11','4589'],
    attrs:{ gap:'1.1 mm preset', electrode:'0.6 mm iridium', interval:'Every 100,000 km' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2026}, {mk:'toyota',md:'corolla',from:2014,to:2026},
           {mk:'toyota',md:'rav4',from:2013,to:2026} ],
    note_en:'Four cylinder set. Rough idle and a misfire code point here before they point at coils.',
    note_ar:'طقم أربع أسطوانات. الاهتزاز عند التباطؤ يدل عليها قبل الكويلات.' },

  { sku:'VAL-START-438', dept:'electrical', brand:'valeo', art:'alt', accent:'ink',
    en:'Starter motor, 1.4 kW', ar:'سلف 1.4 كيلوواط',
    price:96.000, was:null, rating:4.4, reviews:24, stock:7, sameDay:false, lead:'2 to 4 days', install:26.000,
    oem:['28100-0P090'], xref:['438218','17879'],
    attrs:{ power:'1.4 kW', teeth:'13', rotation:'Clockwise' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2018}, {mk:'toyota',md:'rav4',from:2013,to:2018} ],
    note_en:'One loud click and no crank, with a battery that tests fine, is a starter and not a battery.',
    note_ar:'صوت طقة واحدة بدون دوران مع بطارية سليمة يعني سلف وليس بطارية.' },

  /* ---- suspension ------------------------------------------------------ */
  { sku:'KYB-EXG-FR-341', dept:'suspension', brand:'kyb', art:'shock', accent:'ink',
    en:'Excel-G front shock absorber', ar:'مساعد أمامي إكسل جي',
    price:34.500, was:null, rating:4.7, reviews:91, stock:26, sameDay:true, install:18.000,
    oem:['48510-09Y30'], xref:['341701'],
    attrs:{ position:'Front', type:'Twin tube gas', sold:'Each' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2018}, {mk:'toyota',md:'rav4',from:2013,to:2018} ],
    note_en:'Replace in axle pairs. One new shock on one side changes how the car behaves under braking.',
    note_ar:'استبدلها بالزوج. مساعد جديد في جهة واحدة يغيّر اتزان السيارة عند الفرملة.' },

  { sku:'KYB-EXG-RR-349', dept:'suspension', brand:'kyb', art:'shock', accent:'ink',
    en:'Excel-G rear shock absorber', ar:'مساعد خلفي إكسل جي',
    price:29.500, was:33.000, rating:4.6, reviews:64, stock:30, sameDay:true, install:16.000,
    oem:['48530-09B10'], xref:['349135'],
    attrs:{ position:'Rear', type:'Twin tube gas', sold:'Each' },
    fits:[ {mk:'toyota',md:'camry',from:2012,to:2018}, {mk:'toyota',md:'rav4',from:2013,to:2018} ],
    note_en:'If the back end floats over a speed bump and settles twice, they are finished.',
    note_ar:'إذا ارتد المؤخر مرتين بعد المطب فقد انتهى عمرها.' },

  /* ---- car care -------------------------------------------------------- */
  { sku:'TEX-5512-FR-SUV', dept:'brakes', brand:'textar', art:'pad', accent:'flame',
    en:'Heavy duty front brake pads, large SUV', ar:'تيل فرامل أمامي للدفع الرباعي الكبير',
    price:38.500, was:44.000, rating:4.7, reviews:96, stock:28, sameDay:true, install:14.000,
    oem:['04465-60320','D1303'], xref:['TX-5512'],
    attrs:{ position:'Front axle', material:'Semi metallic', wear_sensor:'Included', shims:'Included' },
    fits:[ {mk:'toyota',md:'land-cruiser',from:2008,to:2026},
           {mk:'lexus',md:'lx570',from:2008,to:2021},
           {mk:'nissan',md:'patrol',from:2010,to:2026},
           {mk:'chevrolet',md:'tahoe',from:2010,to:2026},
           {mk:'gmc',md:'yukon',from:2010,to:2026} ],
    note_en:'Semi metallic rather than ceramic, because two and a half tonnes coming down off the Sixth Ring needs bite more than it needs clean wheels.',
    note_ar:'شبه معدني بدل السيراميك، لأن سيارة بوزن طنين ونصف تحتاج قوة كبح أكثر من نظافة الجنوط.' },

  { sku:'BOS-ROT-FR-340', dept:'brakes', brand:'bosch', art:'rotor', accent:'ink',
    en:'Vented front rotor, 340 mm', ar:'قرص فرامل أمامي مهوى 340 ملم',
    price:46.000, was:null, rating:4.6, reviews:54, stock:14, sameDay:true, install:16.000,
    oem:['43512-60180'], xref:['BSD1340'],
    attrs:{ position:'Front axle', diameter:'340 mm', thickness:'32 mm', coating:'Aluminium zinc' },
    fits:[ {mk:'toyota',md:'land-cruiser',from:2008,to:2026},
           {mk:'lexus',md:'lx570',from:2008,to:2021},
           {mk:'nissan',md:'patrol',from:2010,to:2026},
           {mk:'chevrolet',md:'tahoe',from:2010,to:2026},
           {mk:'gmc',md:'yukon',from:2010,to:2026} ],
    note_en:'Sold each, replace in pairs. Vented because a heavy vehicle turns far more energy into heat at the disc.',
    note_ar:'يُباع بالقطعة ويُستبدل بالزوج. مهوى لأن المركبة الثقيلة تحوّل طاقة أكبر إلى حرارة على القرص.' },

  { sku:'KYB-SUV-FR', dept:'suspension', brand:'kyb', art:'shock', accent:'ink',
    en:'Excel-G front shock, large SUV', ar:'مساعد أمامي إكسل جي للدفع الرباعي',
    price:52.000, was:58.000, rating:4.7, reviews:112, stock:22, sameDay:true, install:22.000,
    oem:['48511-69736'], xref:['341456'],
    attrs:{ position:'Front', type:'Twin tube gas', sold:'Each' },
    fits:[ {mk:'toyota',md:'land-cruiser',from:2008,to:2026},
           {mk:'lexus',md:'lx570',from:2008,to:2021},
           {mk:'nissan',md:'patrol',from:2010,to:2026},
           {mk:'chevrolet',md:'tahoe',from:2010,to:2026},
           {mk:'gmc',md:'yukon',from:2010,to:2026} ],
    note_en:'Standard height replacement. If the car sits on a lift kit, the length is wrong and we will say so before you order.',
    note_ar:'بديل بالارتفاع القياسي. إذا كانت السيارة مرفوعة فالطول غير مناسب وسننبهك قبل الطلب.' },

  { sku:'DEN-ALT-150A', dept:'electrical', brand:'denso', art:'alt', accent:'flame',
    en:'Alternator, 150A', ar:'دينمو 150 أمبير',
    price:168.000, was:null, rating:4.6, reviews:44, stock:7, sameDay:false, lead:'2 to 4 days', install:32.000,
    oem:['27060-38050'], xref:['104210-6000','11390'],
    attrs:{ output:'150 A', pulley:'7 rib clutch pulley', regulator:'Integrated' },
    fits:[ {mk:'toyota',md:'land-cruiser',from:2008,to:2026},
           {mk:'lexus',md:'lx570',from:2008,to:2021},
           {mk:'nissan',md:'patrol',from:2010,to:2026},
           {mk:'chevrolet',md:'tahoe',from:2010,to:2026},
           {mk:'gmc',md:'yukon',from:2010,to:2026} ],
    note_en:'A second battery failure inside a year usually ends here. The rescue van tests output before it sells you another battery.',
    note_ar:'تلف بطارية ثانية خلال سنة ينتهي هنا عادة. فان الإنقاذ يفحص الإخراج قبل بيعك بطارية أخرى.' },

  { sku:'NGK-IRIDIUM-8S', dept:'electrical', brand:'ngk', art:'plug', accent:'ink',
    en:'Iridium IX spark plugs, set of 8', ar:'بواجي إيريديوم IX، طقم 8',
    price:31.000, was:35.500, rating:4.8, reviews:138, stock:40, sameDay:true, install:16.000,
    oem:['90919-01247'], xref:['IFR6A11','5344'],
    attrs:{ gap:'1.1 mm preset', electrode:'0.6 mm iridium', interval:'Every 100,000 km' },
    fits:[ {mk:'toyota',md:'land-cruiser',from:2008,to:2026},
           {mk:'lexus',md:'lx570',from:2008,to:2021},
           {mk:'nissan',md:'patrol',from:2010,to:2026},
           {mk:'chevrolet',md:'tahoe',from:2010,to:2026},
           {mk:'gmc',md:'yukon',from:2010,to:2026} ],
    note_en:'Eight cylinder set. Do not mix old and new plugs across banks, the misfire moves rather than clears.',
    note_ar:'طقم ثماني أسطوانات. لا تخلط القديم بالجديد بين الجانبين، فالخلل ينتقل ولا يزول.' },

  { sku:'CZ-SUN-XL', dept:'care', brand:'carzone', art:'sunshade', accent:'flame', universal:true,
    en:'Folding windshield sunshade, XL', ar:'واقي شمس أمامي قابل للطي، مقاس كبير',
    price:5.500, was:7.000, rating:4.6, reviews:388, stock:260, sameDay:true, install:null,
    oem:[], xref:[], attrs:{ size:'150 x 80 cm', layers:'Reflective, foam core', fit:'SUV and large sedan' },
    note_en:'A cabin at 70 degrees ages the dashboard, the screen and every rubber seal in the car.',
    note_ar:'مقصورة بحرارة 70 درجة تُتلف الطبلون والشاشة وكل جوان مطاطي في السيارة.' },

  { sku:'CZ-WASH-5L', dept:'care', brand:'carzone', art:'care', accent:'ink', universal:true,
    en:'pH neutral wash concentrate, 5L', ar:'شامبو غسيل متعادل، 5 لتر',
    price:6.750, was:null, rating:4.5, reviews:142, stock:110, sameDay:true, install:null,
    oem:[], xref:[], attrs:{ dilution:'1 to 200', volume:'5 litre', safe_on:'Ceramic and wax coatings' },
    note_en:'Wash in the evening. Detergent that dries on hot paint leaves marks you cannot polish out.',
    note_ar:'اغسل مساءً. الصابون الذي يجف على طلاء ساخن يترك آثاراً لا تُزال بالتلميع.' },

  { sku:'CZ-EMERG-KIT', dept:'care', brand:'carzone', art:'care', accent:'ink', universal:true,
    en:'Roadside emergency kit', ar:'حقيبة طوارئ للطريق',
    price:12.500, was:15.000, rating:4.4, reviews:76, stock:64, sameDay:true, install:null,
    oem:[], xref:[], attrs:{ includes:'Jump leads, triangle, torch, gloves, first aid', bag:'Boot mounted' },
    note_en:'Kuwait law requires the warning triangle. The jump leads are what you will actually use.',
    note_ar:'القانون يلزم بالمثلث العاكس. أما كيبل الشحن فهو ما ستستخدمه فعلاً.' }
];

/* ------------------------------------------------------------- services */
const SERVICES = [
  { id:'rescue',  en:'Battery rescue',        ar:'إنقاذ بطارية',      price:3.500,  dur:'30 min', icon:'battery',
    en_d:'Van to your location within two hours. Charging system tested, battery swapped, old one taken away.',
    ar_d:'فان يصلك خلال ساعتين. فحص نظام الشحن، تبديل البطارية، وأخذ القديمة.' },
  { id:'oil',     en:'Oil change at your door', ar:'تغيير زيت في موقعك', price:8.000, dur:'45 min', icon:'oil',
    en_d:'Full synthetic and a genuine filter, fitted where the car is parked. Used oil taken for recycling.',
    ar_d:'زيت تخليقي وفلتر أصلي، في مكان وقوف السيارة. ونأخذ الزيت المستعمل لإعادة التدوير.' },
  { id:'ac',      en:'AC check and regas',    ar:'فحص وتعبئة تكييف',   price:14.000, dur:'60 min', icon:'fan',
    en_d:'Pressure test both sides, dye leak check, regas to the plate figure, cabin filter inspected.',
    ar_d:'فحص ضغط الجهتين، كشف تسريب بالصبغة، تعبئة حسب اللوحة، وفحص فلتر المقصورة.' },
  { id:'brakes',  en:'Brake pad fitting',     ar:'تركيب تيل فرامل',    price:12.000, dur:'90 min', icon:'rotor',
    en_d:'Front or rear axle, at your location. Rotor thickness measured and reported before we start.',
    ar_d:'محور أمامي أو خلفي في موقعك. قياس سماكة الأقراص وإبلاغك قبل البدء.' },
  { id:'tires',   en:'Tire fitting and balancing', ar:'تركيب وموازنة إطارات', price:6.500, dur:'45 min', icon:'tire',
    en_d:'At a partner centre in Shuwaikh, Al Rai, Hawalli or Fahaheel. New valves and a TPMS reset included.',
    ar_d:'في مركز شريك بالشويخ أو الري أو حولي أو الفحيحيل. مع صمامات جديدة وبرمجة الحساسات.' },
  { id:'inspect', en:'Pre purchase inspection', ar:'فحص ما قبل الشراء', price:25.000, dur:'75 min', icon:'check',
    en_d:'Before you buy a used car. Paint depth, chassis, codes, compression and a written report.',
    ar_d:'قبل شراء سيارة مستعملة. فحص الصبغ والشاصي والأكواد والضغط مع تقرير مكتوب.' }
];

/* ------------------------------------------------ symptom led diagnosis */
/* Deliberately labelled as a likely cause, not a diagnosis. Every path can
   reach a human. */
const SYMPTOMS = [
  { id:'nostart', icon:'battery', en:'It will not start', ar:'لا تشتغل',
    q_en:'What happens when you turn the key?', q_ar:'ماذا يحدث عند إدارة المفتاح؟',
    opts:[
      { en:'Rapid clicking, no crank', ar:'طقطقة سريعة بدون دوران', to:'flat' },
      { en:'Cranks slowly, then gives up', ar:'تدور ببطء ثم تتوقف', to:'flat' },
      { en:'One loud click, nothing else', ar:'طقة واحدة قوية فقط', to:'starter' },
      { en:'Starts, then dies within a minute', ar:'تشتغل ثم تنطفئ خلال دقيقة', to:'charging' },
      { en:'Completely silent, no dash lights', ar:'صمت تام وبدون إضاءة عدادات', to:'dead' } ],
    out:{
      flat:    { conf:'high',   en:'A discharged or failed battery.', ar:'بطارية فارغة أو تالفة.',
                 why_en:'Rapid clicking is the starter solenoid trying to engage with too little current behind it. In Kuwait this is the single most common no start cause.',
                 why_ar:'الطقطقة السريعة تعني أن السلف لا يجد تياراً كافياً. وهذا أكثر سبب شائع في الكويت.',
                 parts:['VAR-H7-EFB','ACD-H6-STD','CZ-TERM-KIT'], service:'rescue', urgent:true },
      starter: { conf:'medium', en:'A starter motor fault, with the battery probably fine.', ar:'خلل في السلف، والبطارية على الأرجح سليمة.',
                 why_en:'A single heavy click means the solenoid pulled in but the motor did not turn. Have the battery tested to be sure before replacing the starter.',
                 why_ar:'الطقة الواحدة تعني أن السلف عمل ولم يدر المحرك. افحص البطارية للتأكد قبل استبدال السلف.',
                 parts:['VAL-START-438'], service:'rescue', urgent:true },
      charging:{ conf:'medium', en:'A charging system fault, most often the alternator.', ar:'خلل في نظام الشحن، غالباً الدينمو.',
                 why_en:'If it runs only while cranking, the battery is starting the car and nothing is replacing the charge.',
                 why_ar:'إذا عملت أثناء التدوير فقط، فالبطارية تشغّل السيارة ولا شيء يعوّض الشحن.',
                 parts:['DEN-ALT-104210','VAR-H7-EFB'], service:'rescue', urgent:true },
      dead:    { conf:'low',    en:'A total power loss. Terminals, main fuse or a failed battery.', ar:'انقطاع كهرباء كامل. أطراف أو فيوز رئيسي أو بطارية تالفة.',
                 why_en:'No dash lights at all points at the connection before it points at the battery. Corroded terminals imitate this exactly.',
                 why_ar:'انعدام إضاءة العدادات يشير للتوصيلات قبل البطارية. الأطراف المتآكلة تعطي نفس العرض.',
                 parts:['CZ-TERM-KIT','ACD-H6-STD'], service:'rescue', urgent:true } } },

  { id:'ac', icon:'fan', en:'The AC is not cold', ar:'التكييف غير بارد',
    q_en:'What is it doing?', q_ar:'ما الذي يحدث؟',
    opts:[
      { en:'Strong air, but it is warm', ar:'هواء قوي لكنه دافئ', to:'gas' },
      { en:'Cold, but the airflow is weak', ar:'بارد لكن التدفق ضعيف', to:'filter' },
      { en:'Cold when moving, warm in traffic', ar:'بارد أثناء السير ودافئ في الزحام', to:'fan' },
      { en:'A noise from the engine bay when I switch it on', ar:'صوت من المحرك عند تشغيله', to:'comp' } ],
    out:{
      gas:   { conf:'high',   en:'Low refrigerant, which means a leak somewhere.', ar:'نقص غاز، ما يعني وجود تسريب.',
               why_en:'A sealed system does not consume refrigerant. Topping up without finding the leak buys you one summer at most.',
               why_ar:'النظام المغلق لا يستهلك الغاز. التعبئة بدون إصلاح التسريب تكفي صيفاً واحداً على الأكثر.',
               parts:[], service:'ac' },
      filter:{ conf:'high',   en:'A blocked cabin filter.', ar:'فلتر مقصورة مسدود.',
               why_en:'Cold air at the vent with no volume behind it is almost always the filter, and it is a fifteen minute job.',
               why_ar:'هواء بارد بدون تدفق يعني الفلتر غالباً، وتغييره لا يستغرق ربع ساعة.',
               parts:['DEN-CAB-4522'], service:'ac' },
      fan:   { conf:'medium', en:'The condenser fan is not pulling air at a standstill.', ar:'مروحة المكثف لا تسحب هواءً عند التوقف.',
               why_en:'At speed the airflow does the work of the fan, which is why it only fails in traffic.',
               why_ar:'أثناء السير يقوم الهواء بعمل المروحة، ولهذا تظهر المشكلة في الزحام فقط.',
               parts:['DEN-FAN-ASSY-16','DEN-CONDENSER-CAM'], service:'ac' },
      comp:  { conf:'medium', en:'The compressor or its clutch.', ar:'الكمبروسر أو الكلتش الخاص به.',
               why_en:'A rattle or a squeal on engagement is mechanical. Keep using it and metal debris can reach the whole system.',
               why_ar:'الصوت عند التشغيل عطل ميكانيكي. الاستمرار قد ينشر برادة معدنية في النظام كله.',
               parts:['DEN-COMP-4472'], service:'ac' } } },

  { id:'brakes', icon:'rotor', en:'Noise or vibration when braking', ar:'صوت أو اهتزاز عند الفرملة',
    q_en:'Which describes it best?', q_ar:'أي وصف أقرب؟',
    opts:[
      { en:'A high squeal that stops when I brake harder', ar:'صفير يختفي عند الضغط بقوة', to:'wear' },
      { en:'A grinding, metal on metal', ar:'صوت طحن معدني', to:'metal' },
      { en:'The steering wheel shakes as I slow down', ar:'المقود يهتز عند التباطؤ', to:'rotor' },
      { en:'The pedal goes soft or long', ar:'الدواسة طرية أو تنزل كثيراً', to:'fluid' } ],
    out:{
      wear: { conf:'high',   en:'The pad wear indicator doing its job.', ar:'مؤشر تآكل التيل يعمل كما ينبغي.',
              why_en:'That squeal is a metal tab designed to touch the rotor when about 3 mm of pad is left. You have weeks, not months.',
              why_ar:'الصفير من لسان معدني يلامس القرص عند بقاء 3 ملم. أمامك أسابيع لا أشهر.',
              parts:['TEX-2478-FR','TEX-3391-RR'], service:'brakes' },
      metal:{ conf:'high',   en:'The pads are gone and the backing plate is cutting the rotor.', ar:'انتهى التيل والقاعدة المعدنية تحفر القرص.',
              why_en:'Stop driving it. Every stop from here costs you a rotor as well as a pad set.',
              why_ar:'أوقف القيادة. كل فرملة الآن تكلفك قرصاً بالإضافة للتيل.',
              parts:['TEX-2478-FR','BOS-ROT-FR-296'], service:'brakes', urgent:true },
      rotor:{ conf:'medium', en:'Uneven rotor thickness, usually from heat.', ar:'تفاوت في سماكة القرص، غالباً بسبب الحرارة.',
              why_en:'People call it warping. It is really pad material deposited unevenly, and it comes back if you fit new pads to an old surface.',
              why_ar:'يسميه الناس التواءً، وهو في الواقع ترسّب غير متساوٍ لمادة التيل، ويتكرر إذا ركّبت تيلاً جديداً على قرص قديم.',
              parts:['BOS-ROT-FR-296','TEX-2478-FR'], service:'brakes' },
      fluid:{ conf:'medium', en:'Air or moisture in the fluid, or a leak.', ar:'هواء أو رطوبة في الزيت، أو تسريب.',
              why_en:'A long pedal is a hydraulic problem, not a friction one. Do not drive far on it.',
              why_ar:'الدواسة الطويلة مشكلة هيدروليكية لا احتكاكية. لا تقد مسافات طويلة.',
              parts:['BOS-DOT4-1L'], service:'brakes', urgent:true } } },

  { id:'heat', icon:'temp', en:'The engine runs hot', ar:'حرارة المحرك مرتفعة',
    q_en:'What have you noticed?', q_ar:'ماذا لاحظت؟',
    opts:[
      { en:'A puddle or a sweet smell', ar:'بقعة سائل أو رائحة حلوة', to:'leak' },
      { en:'The coolant bottle is low again', ar:'خزان المبرد ناقص مرة أخرى', to:'low' },
      { en:'Hot in traffic, normal on the road', ar:'حارة في الزحام وطبيعية على الطريق', to:'fan' },
      { en:'No warning, then the gauge went straight up', ar:'بدون إنذار ثم ارتفع المؤشر فجأة', to:'stop' } ],
    out:{
      leak:{ conf:'high',   en:'A coolant leak.', ar:'تسريب في نظام التبريد.',
             why_en:'The smell is glycol. Find the source before you top it up again, and do not open a hot cap.',
             why_ar:'الرائحة من الجلايكول. حدد مصدر التسريب قبل التعبئة، ولا تفتح الغطاء وهو ساخن.',
             parts:['ZER-G05-4L'], service:'ac', urgent:true },
      low: { conf:'medium', en:'A slow loss, external or into the engine.', ar:'فقد بطيء، خارجي أو داخل المحرك.',
             why_en:'Coolant that disappears with no puddle underneath needs a pressure test the same week.',
             why_ar:'مبرد يختفي بدون بقعة تحته يحتاج فحص ضغط في نفس الأسبوع.',
             parts:['ZER-G05-4L'], service:'ac' },
      fan: { conf:'medium', en:'The cooling fan is not doing its job at low speed.', ar:'مروحة التبريد لا تعمل عند السرعات المنخفضة.',
             why_en:'Same pattern as weak AC in traffic, and often the same fan assembly.',
             why_ar:'نفس نمط ضعف التكييف في الزحام، وغالباً نفس المروحة.',
             parts:['DEN-FAN-ASSY-16'], service:'ac' },
      stop:{ conf:'low',    en:'Stop the car. This needs a look before any part is bought.', ar:'أوقف السيارة. تحتاج فحصاً قبل شراء أي قطعة.',
             why_en:'A gauge that climbs with no warning can be a thermostat, a pump or a head gasket, and driving on decides which.',
             why_ar:'الارتفاع المفاجئ قد يكون ثرموستات أو طرمبة أو وجه مكينة، والاستمرار بالقيادة يحدد أيها.',
             parts:[], service:'ac', urgent:true } } }
];

/* ------------------------------------------------------- B2B sample data */
const PRO_ACCOUNT = {
  name_en:'Al Rai Motors Co.', name_ar:'شركة الري موتورز',
  tier:'T2', limit:1500.000, terms:'Net 30', district:'Al Rai',
  users:[ { en:'Karim H.', ar:'كريم ح.', role_en:'Owner', role_ar:'المالك' },
          { en:'Sameer P.', ar:'سمير ب.', role_en:'Purchasing', role_ar:'المشتريات' },
          { en:'Fatima A.', ar:'فاطمة ع.', role_en:'Accounts', role_ar:'الحسابات' } ],
  invoices:[
    { no:'INV-4471', placed:'12 Aug', due:'11 Sep', amt:186.500, state:'open' },
    { no:'INV-4409', placed:'28 Jul', due:'27 Aug', amt:94.250,  state:'overdue' },
    { no:'INV-4362', placed:'02 Jul', due:'01 Aug', amt:221.000, state:'paid' },
    { no:'INV-4318', placed:'16 Jun', due:'16 Jul', amt:148.750, state:'paid' } ],
  runs:[
    { area_en:'Shuwaikh and Al Rai',  area_ar:'الشويخ والري',    times:'10:00 and 16:00' },
    { area_en:'Ardiya and Amghara',   area_ar:'العارضية وأمغرة', times:'11:30 and 17:30' },
    { area_en:'Fahaheel and Ahmadi',  area_ar:'الفحيحيل والأحمدي', times:'14:00' } ]
};
const PRO_DISCOUNT = { T1: 0.14, T2: 0.22, T3: 0.28 };

/* ------------------------------------------------------------ geography */
const GOVERNORATES = [
  { id:'capital',  en:'Capital',            ar:'العاصمة',        zone:'A',
    areas_en:['Sharq','Dasman','Qibla','Mirqab','Shuwaikh','Kaifan','Adailiya','Rawda','Shamiya','Qadsiya','Faiha','Nuzha','Sulaibikhat','Doha'],
    areas_ar:['شرق','دسمان','القبلة','المرقاب','الشويخ','كيفان','العديلية','الروضة','الشامية','القادسية','الفيحاء','النزهة','الصليبيخات','الدوحة'] },
  { id:'hawalli',  en:'Hawalli',            ar:'حولي',           zone:'A',
    areas_en:['Salmiya','Hawalli','Jabriya','Bayan','Mishref','Salwa','Rumaithiya','Shaab','Zahra','Hitteen'],
    areas_ar:['السالمية','حولي','الجابرية','بيان','مشرف','سلوى','الرميثية','الشعب','الزهراء','حطين'] },
  { id:'farwaniya',en:'Farwaniya',          ar:'الفروانية',      zone:'A',
    areas_en:['Farwaniya','Khaitan','Jleeb','Andalous','Ardiya','Rabiya','Rehab','Firdous','Omariya'],
    areas_ar:['الفروانية','خيطان','جليب الشيوخ','الأندلس','العارضية','الرابية','الرحاب','الفردوس','العمرية'] },
  { id:'ahmadi',   en:'Ahmadi',             ar:'الأحمدي',        zone:'B',
    areas_en:['Fahaheel','Mangaf','Abu Halifa','Fintas','Mahboula','Sabahiya','Ahmadi','Egaila','Wafra'],
    areas_ar:['الفحيحيل','المنقف','أبو حليفة','الفنطاس','المهبولة','الصباحية','الأحمدي','العقيلة','الوفرة'] },
  { id:'jahra',    en:'Jahra',              ar:'الجهراء',        zone:'B',
    areas_en:['Jahra','Saad Al Abdullah','Naeem','Qasr','Oyoun','Taima','Amghara'],
    areas_ar:['الجهراء','سعد العبدالله','النعيم','القصر','العيون','تيماء','أمغرة'] },
  { id:'mubarak',  en:'Mubarak Al-Kabeer',  ar:'مبارك الكبير',   zone:'B',
    areas_en:['Qurain','Adan','Messila','Sabah Al Salem','Abu Fatira','Funaitees','Mubarak Al Kabeer'],
    areas_ar:['القرين','العدان','المسيلة','صباح السالم','أبو فطيرة','الفنيطيس','مبارك الكبير'] }
];

/* -------------------------------------------------------------- content */
/* One worked guide, to show the shape the content engine produces. */
const GUIDE = {
  slug:'battery-kuwait',
  title_en:'How to choose a car battery in Kuwait',
  title_ar:'كيف تختار بطارية سيارة في الكويت',
  stand_en:'Group size, cold cranking amps and technology, in the order they actually matter here. Six minutes.',
  stand_ar:'مقاس البطارية وقوة التشغيل والتقنية، بالترتيب الذي يهم فعلاً هنا. ست دقائق.',
  updated_en:'Checked 12 August 2026', updated_ar:'روجع في 12 أغسطس 2026'
};

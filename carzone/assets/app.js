/* ============================================================================
   CarZone Kuwait, application.

   One document, hash routed. State lives in memory and is mirrored to
   localStorage where the browser allows it, so a vehicle and a cart survive
   a reload but nothing breaks when opened straight from disk.

   Sections, in order:
     1  state and storage        6  overlays (vehicle, cart, diagnose, book)
     2  language and formatting  7  views
     3  fitment engine           8  header, search, router
     4  drawing helpers          9  boot
     5  cart and pricing
   ========================================================================= */

/* == 1. state ============================================================= */
const S = {
  lang:'en',
  vehicle:null,          // { year, mk, md, eng }
  garage:[],             // [{ id, year, mk, md, eng, nick, plate, odo, battFitted, oilAt }]
  cart:[],               // [{ sku, qty, install }]
  orders:[],
  view:'home', params:{},
  shop:{ brands:[], sameDay:false, fitOnly:true, sort:'rel', mode:'grid', dept:null, q:'' },
  tire:{ w:'', a:'', r:'' },
  finder:{ step:0, keep:null, want:null },
  pro:{ draft:[], submitted:[] },
  ui:{ overlay:null, sysOpen:null }
};

const STORE_KEY = 'carzone.kw.v1';
function save(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify({
    lang:S.lang, vehicle:S.vehicle, garage:S.garage, cart:S.cart, orders:S.orders
  })); }catch(e){ /* file:// or private mode. The session still works. */ }
}
function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY); if(!raw) return;
    const d = JSON.parse(raw);
    ['lang','vehicle','garage','cart','orders'].forEach(k=>{ if(d[k]!=null) S[k]=d[k]; });
  }catch(e){}
}

/* == 2. language and formatting ========================================== */
function T(en, ar){ return S.lang==='ar' ? ar : en; }
function nm(o){ return o ? (o[S.lang] || o.en) : ''; }
function fx(o, base){ return o ? (o[base+'_'+S.lang] ?? o[base+'_en']) : ''; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* Kuwaiti dinar carries three decimals. Western digits in both languages,
   which is the commerce convention here. */
function kwd(n){ return Number(n||0).toFixed(3); }
function money(n){ return `<span class="num">${kwd(n)}</span> <span class="faint" style="font-size:.72em">${T('KWD','د.ك')}</span>`; }

const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function monthName(i){ return S.lang==='ar' ? MONTHS_AR[i] : MONTHS_EN[i]; }
function dateLabel(d){ return `${d.getDate()} ${monthName(d.getMonth())}`; }

/* == 3. fitment ========================================================== */
function makeOf(id){ return VEHICLES[id]; }
function modelOf(mk, md){ const m = VEHICLES[mk]; return m && m.models.find(x=>x.id===md); }
function vehicleLabel(v, long){
  if(!v) return '';
  const mk = makeOf(v.mk), md = modelOf(v.mk, v.md);
  if(!mk || !md) return '';
  const base = S.lang==='ar' ? `${nm(mk)} ${nm(md)} ${v.year}` : `${v.year} ${nm(mk)} ${nm(md)}`;
  return base + (long && v.eng ? ` · ${v.eng}` : '');
}
function bodyOf(v){ const md = v && modelOf(v.mk, v.md); return md ? md.body : 'sedan'; }

/* yes | no | universal | null (we cannot say) */
function fitOf(p, v){
  v = v === undefined ? S.vehicle : v;
  if(p.universal) return 'universal';
  if(!p.fits || !p.fits.length) return null;
  if(!v) return null;
  return p.fits.some(a => a.mk===v.mk && a.md===v.md && v.year>=a.from && v.year<=a.to) ? 'yes' : 'no';
}
function fitChip(p, v){
  const f = fitOf(p, v);
  if(f==='yes')  return `<span class="chip chip-go">${ico('check')}${T('Fits','يناسب')}</span>`;
  if(f==='no')   return `<span class="chip chip-stop">${ico('close')}${T('Does not fit','لا يناسب')}</span>`;
  if(f==='universal') return `<span class="chip chip-cool">${ico('globe')}${T('All vehicles','كل السيارات')}</span>`;
  return '';
}
/* How many vehicles in our own list a part is listed for. Honest phrasing
   depends on it: one application is not "fits most cars". */
function appCount(p){
  if(p.universal) return Infinity;
  return (p.fits||[]).length;
}

/* == 4. drawing helpers ================================================== */
function ico(name, cls){
  const d = UI[name]; if(!d) return '';
  return `<svg class="ic${cls?' '+cls:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
function art(name){
  const d = ART[name] || ART.care;
  return `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
/* Tires get their tread family drawn into the band, so an all terrain and a
   highway pattern are not the same picture with a different label. */
const TREAD = { at:'10 7', sport:'3 4', hp:'5 6' };
function artOf(p){
  if(p.tire) return art('tire').replace('stroke-dasharray="5 6"', `stroke-dasharray="${TREAD[p.tire.tread]||'5 6'}"`);
  return art(p.art);
}

/* A DOT code is week and year of manufacture. Turning it into an age in
   months is the whole point of printing it. */
function dotAge(p){
  if(!p.tire || !p.tire.dot) return null;
  const w = Number(p.tire.dot.slice(0,2)), y = 2000 + Number(p.tire.dot.slice(2));
  const made = new Date(y, 0, 1 + (w-1)*7), now = new Date();
  return Math.max(0, Math.round((now - made) / 2629800000));
}
function dotChip(p){
  const m = dotAge(p); if(m == null) return '';
  const cls = m<=12 ? 'chip-go' : m<=24 ? 'chip-hold' : 'chip-stop';
  const icon = m<=12 ? 'check' : m<=24 ? 'clock' : 'alert';
  return `<span class="chip ${cls}">${ico(icon)}${T(`${m} months old`,`عمرها ${m} شهراً`)}</span>`;
}
function stars(r, n){
  return `<span class="stars">${ico('star')}${r.toFixed(1)}${n!=null?` <span class="faint">(${n})</span>`:''}</span>`;
}
function carSvg(body, opts){
  const c = CARS[body] || CARS.sedan; opts = opts||{};
  const wheels = c.wheels.map(w=>{
    const [x,y,r] = w, rim = (r*0.52).toFixed(1);
    let spokes = '';
    for(let i=0;i<5;i++){
      const a = (-90 + i*72) * Math.PI/180;
      spokes += `<path d="M${(x+Math.cos(a)*r*0.20).toFixed(1)} ${(y+Math.sin(a)*r*0.20).toFixed(1)} L${(x+Math.cos(a)*r*0.44).toFixed(1)} ${(y+Math.sin(a)*r*0.44).toFixed(1)}" stroke-width="1.3"/>`;
    }
    return `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${rim}" stroke-width="1.4"/>${spokes}<circle cx="${x}" cy="${y}" r="3.4" stroke-width="1.3"/>`;
  }).join('');
  return `<svg class="car" viewBox="0 0 420 168" fill="none" stroke="currentColor" stroke-width="2.5"
    stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${esc(opts.label||'Vehicle diagram')}">
    <path d="M16 150H404" stroke-width="1.2" opacity=".3"/>
    <path d="${c.body}"/><path d="${c.glass}" stroke-width="1.7"/>
    <path d="${c.lines}" stroke-width="1.3"/><path d="${c.det}" stroke-width="1.3"/>${wheels}</svg>`;
}

/* == 5. cart and pricing ================================================= */
function P(sku){ return PRODUCTS.find(p=>p.sku===sku); }
function unitPrice(p, install){ return p.price + (install && p.install ? p.install : 0); }
function fitsIncluded(p){ return p.install === 0; }
function fittable(p){ return p.install !== null && p.install !== undefined; }
function cartCount(){ return S.cart.reduce((n,l)=>n+l.qty, 0); }
function cartSub(){ return S.cart.reduce((s,l)=>{ const p=P(l.sku); return p ? s + unitPrice(p,l.install)*l.qty : s; }, 0); }
const FREE_DELIVERY = 15, DELIVERY_FEE = 1.500, COD_FEE = 1.000, COD_CAP = 150;
function deliveryFee(){ return cartSub() >= FREE_DELIVERY ? 0 : DELIVERY_FEE; }
function cartTotal(pay){ return cartSub() + deliveryFee() + (pay==='cod' ? COD_FEE : 0); }

function addToCart(sku, install, qty){
  const p = P(sku); if(!p) return;
  install = !!(install && fittable(p));
  const line = S.cart.find(l=>l.sku===sku && l.install===install);
  if(line) line.qty += (qty||1); else S.cart.push({ sku, qty:qty||1, install });
  save(); syncCart();
  toast(T(`Added: ${p.en}`, `أُضيف: ${p.ar}`));
}
function setQty(i, d){
  const l = S.cart[i]; if(!l) return;
  l.qty += d; if(l.qty<1) S.cart.splice(i,1);
  save(); syncCart(); if(S.ui.overlay==='cart') renderCart(); if(S.view==='checkout') render();
}
function dropLine(i){ S.cart.splice(i,1); save(); syncCart(); if(S.ui.overlay==='cart') renderCart(); if(S.view==='checkout') render(); }
function syncCart(){
  const n = cartCount();
  document.querySelectorAll('[data-cart-count]').forEach(el=>{
    el.textContent = n; el.classList.toggle('hide', n===0);
  });
}

/* Same day cutoff is 15:00, and 13:00 for the outer governorates. Computed
   from the clock rather than written into the copy, so it cannot go stale. */
function cutoff(zone){
  const now = new Date(), h = zone==='B' ? 13 : 15;
  const cut = new Date(now); cut.setHours(h,0,0,0);
  const open = now < cut;
  const ms = cut - now;
  return { open, h, hours:Math.floor(ms/3600000), mins:Math.floor(ms%3600000/60000) };
}
function cutoffLine(zone){
  const c = cutoff(zone||'A');
  if(c.open) return T(`Order within ${c.hours}h ${c.mins}m for delivery today`,
                      `اطلب خلال ${c.hours} س ${c.mins} د للتوصيل اليوم`);
  return T(`Ordered now, delivered tomorrow`, `الطلب الآن يصل غداً`);
}

/* == toast =============================================================== */
function toast(msg){
  let box = document.querySelector('.toasts');
  if(!box){ box = document.createElement('div'); box.className='toasts'; document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role','status');
  el.innerHTML = `${ico('check')}<span>${esc(msg)}</span>`;
  box.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .4s'; el.style.opacity='0'; setTimeout(()=>el.remove(), 420); }, 2800);
}

/* == 6. overlays ========================================================= */
/* One host for every dialog and drawer. Focus is trapped, Escape closes,
   the page behind does not scroll, and focus returns where it started. */
let lastFocus = null;
function openOverlay(kind, html, opts){
  opts = opts || {};
  lastFocus = document.activeElement;
  S.ui.overlay = kind;
  const host = document.getElementById('overlay');
  host.innerHTML = `<div class="scrim" data-close></div>${html}`;
  host.hidden = false;
  document.body.style.overflow = 'hidden';
  const box = host.querySelector('.dialog,.drawer');
  if(box){ box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); if(opts.label) box.setAttribute('aria-label', opts.label); }
  const first = host.querySelector('[data-autofocus]') || host.querySelector('button,input,select,a[href]');
  if(first) first.focus();
}
function closeOverlay(){
  const host = document.getElementById('overlay');
  host.hidden = true; host.innerHTML = '';
  S.ui.overlay = null;
  document.body.style.overflow = '';
  if(lastFocus && lastFocus.focus) lastFocus.focus();
}
document.addEventListener('keydown', e=>{
  const host = document.getElementById('overlay');
  if(!host || host.hidden) return;
  if(e.key === 'Escape'){ e.preventDefault(); closeOverlay(); return; }
  if(e.key !== 'Tab') return;
  const f = [...host.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(el=>el.offsetParent !== null);
  if(!f.length) return;
  const first = f[0], last = f[f.length-1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});
document.addEventListener('click', e=>{ if(e.target.closest('[data-close]')) closeOverlay(); });

/* ---- vehicle picker ---------------------------------------------------- */
let VP = { year:'', mk:'', md:'', eng:'' };
function openVehiclePicker(){
  VP = S.vehicle ? {...S.vehicle, year:String(S.vehicle.year)} : { year:'', mk:'', md:'', eng:'' };
  openOverlay('vehicle', vehicleDialog(), { label:T('Choose your vehicle','اختر سيارتك') });
}
function vehicleDialog(){
  const makes = Object.entries(VEHICLES).sort((a,b)=>b[1].share-a[1].share);
  const models = VP.mk ? VEHICLES[VP.mk].models : [];
  const md = VP.mk && VP.md ? modelOf(VP.mk, VP.md) : null;
  const engs = md ? md.eng : [];
  const yearOk = y => !md || (y>=md.yrs[0] && y<=md.yrs[1]);
  const ready = VP.year && VP.mk && VP.md;
  return `<div class="dialog">
    <div class="dialog-h">
      <div>
        <p class="eyebrow ac">${T('Fitment','المطابقة')}</p>
        <h2 class="d3" style="margin-top:6px">${T('Which car are you shopping for?','لأي سيارة تتسوق؟')}</h2>
        <p class="small" style="margin-top:6px">${T('We filter the whole catalogue to it and mark every part fits or does not fit.','نُصفّي الكتالوج كله عليها ونضع علامة يناسب أو لا يناسب على كل قطعة.')}</p>
      </div>
      <button class="iconbtn" data-close aria-label="${T('Close','إغلاق')}">${ico('close')}</button>
    </div>
    <div class="dialog-b">
      <div class="grid g2" style="gap:12px">
        <label class="field" style="margin:0"><span>${T('Make','الماركة')}</span>
          <select class="inp" data-autofocus onchange="VP.mk=this.value;VP.md='';VP.eng='';refreshVehicleDialog()">
            <option value="">${T('Select','اختر')}</option>
            ${makes.map(([id,m])=>`<option value="${id}"${VP.mk===id?' selected':''}>${nm(m)}</option>`).join('')}
          </select></label>
        <label class="field" style="margin:0"><span>${T('Model','الموديل')}</span>
          <select class="inp"${VP.mk?'':' disabled'} onchange="VP.md=this.value;VP.eng='';refreshVehicleDialog()">
            <option value="">${VP.mk?T('Select','اختر'):T('Pick a make first','اختر الماركة أولاً')}</option>
            ${models.map(m=>`<option value="${m.id}"${VP.md===m.id?' selected':''}>${nm(m)}</option>`).join('')}
          </select></label>
        <label class="field" style="margin:0"><span>${T('Year','السنة')}</span>
          <select class="inp" onchange="VP.year=this.value;refreshVehicleDialog()">
            <option value="">${T('Select','اختر')}</option>
            ${YEARS.filter(yearOk).map(y=>`<option${String(VP.year)===String(y)?' selected':''}>${y}</option>`).join('')}
          </select></label>
        <label class="field" style="margin:0"><span>${T('Engine','المحرك')} <span class="faint">${T('optional','اختياري')}</span></span>
          <select class="inp"${engs.length?'':' disabled'} onchange="VP.eng=this.value">
            <option value="">${T('Not sure','غير متأكد')}</option>
            ${engs.map(e=>`<option${VP.eng===e?' selected':''}>${e}</option>`).join('')}
          </select></label>
      </div>
      ${md ? `<div class="panel" style="background:var(--inset);border-color:var(--rule);padding:13px 15px;margin-top:4px">
        <p class="eyebrow">${T('What we already know about this model','ما نعرفه عن هذا الموديل')}</p>
        <div class="row wrap-f gap-s" style="margin-top:9px">
          <span class="spec"><i>${T('Battery group','مقاس البطارية')}</i> <span dir="ltr">${md.batt}</span></span>
          <span class="spec"><i>${T('OE tire','إطار المصنع')}</i> ${md.tire}</span>
          <span class="spec"><i>${T('Body','الهيكل')}</i> ${T(md.body,{sedan:'سيدان',suv:'دفع رباعي',pickup:'بيك أب'}[md.body])}</span>
        </div></div>` : ''}
      <div class="hr" style="margin:18px 0 14px"></div>
      <p class="eyebrow">${T('Or start from a VIN','أو ابدأ برقم الهيكل')}</p>
      <div class="row" style="margin-top:9px;gap:8px">
        <input class="inp mono" id="vin" maxlength="17" placeholder="JTMBK31V… (17)" style="text-transform:uppercase;letter-spacing:.06em">
        <button class="btn btn-line" onclick="decodeVin()">${T('Decode','فك الترميز')}</button>
      </div>
      <p class="tiny" id="vinNote" style="margin-top:8px">${T('Kuwait has no public plate lookup, so the VIN is the precise route. In this prototype the decoder reads the year digit and the make character only.','لا يوجد استعلام عام باللوحة في الكويت، لذا رقم الهيكل هو الطريق الأدق. في هذا النموذج يقرأ المفكك حرف الصانع ورمز السنة فقط.')}</p>
      <div class="hr" style="margin:18px 0 14px"></div>
      <p class="eyebrow">${T('Common in Kuwait','شائعة في الكويت')}</p>
      <div class="row wrap-f gap-s" style="margin-top:10px">
        ${[['toyota','land-cruiser',2021],['nissan','patrol',2019],['toyota','camry',2020],['chevrolet','tahoe',2018],['lexus','lx570',2017],['hyundai','sonata',2021]]
          .map(([mk,md2,y])=>`<button class="chip chip-line" style="padding:7px 12px;font-size:12.5px" onclick="quickPick('${mk}','${md2}',${y})">${y} ${nm(VEHICLES[mk])} ${nm(modelOf(mk,md2))}</button>`).join('')}
      </div>
    </div>
    <div class="dialog-f">
      ${S.vehicle ? `<button class="btn btn-quiet" onclick="clearVehicle()">${T('Remove vehicle','إزالة السيارة')}</button>` : ''}
      <button class="btn btn-line grow" data-close>${T('Cancel','إلغاء')}</button>
      <button class="btn btn-primary grow"${ready?'':' disabled'} onclick="commitVehicle()">${T('Shop this car','تسوّق لهذه السيارة')}</button>
    </div>
  </div>`;
}
function refreshVehicleDialog(){
  const host = document.getElementById('overlay');
  const scroll = host.querySelector('.dialog-b')?.scrollTop || 0;
  host.querySelector('.dialog').outerHTML = vehicleDialog();
  const b = host.querySelector('.dialog-b'); if(b) b.scrollTop = scroll;
}
function quickPick(mk, md, y){ VP = { mk, md, year:String(y), eng:'' }; commitVehicle(); }
function commitVehicle(){
  if(!(VP.year && VP.mk && VP.md)) return;
  S.vehicle = { year:Number(VP.year), mk:VP.mk, md:VP.md, eng:VP.eng||'' };
  if(!S.garage.some(g=>g.mk===S.vehicle.mk && g.md===S.vehicle.md && g.year===S.vehicle.year)){
    S.garage.push({ id:'g'+Date.now(), ...S.vehicle, nick:'', plate:'', odo:null, battFitted:null, oilAt:null });
  }
  save(); closeOverlay(); paintPlate(); render();
  toast(T(`Catalogue filtered to your ${vehicleLabel(S.vehicle)}`, `صُفّي الكتالوج على ${vehicleLabel(S.vehicle)}`));
}
function clearVehicle(){ S.vehicle=null; save(); closeOverlay(); paintPlate(); render(); }
function useVehicle(g){ S.vehicle = { year:g.year, mk:g.mk, md:g.md, eng:g.eng }; save(); paintPlate(); render(); toast(T('Now shopping for '+vehicleLabel(S.vehicle), 'تتسوق الآن لـ '+vehicleLabel(S.vehicle))); }

/* A deliberately small decoder: position 10 is the year code and position 1
   the manufacturing country / make. Enough to show the flow, and it says so. */
const VIN_YEAR = { A:2010,B:2011,C:2012,D:2013,E:2014,F:2015,G:2016,H:2017,J:2018,K:2019,L:2020,M:2021,N:2022,P:2023,R:2024,S:2025,T:2026 };
const VIN_MAKE = { J:'toyota', '1':'chevrolet', '2':'chevrolet', '3':'chevrolet', '4':'ford', '5':'ford', K:'hyundai', W:'mercedes', N:'nissan' };
function decodeVin(){
  const el = document.getElementById('vin'), note = document.getElementById('vinNote');
  const vin = (el.value||'').trim().toUpperCase();
  el.classList.remove('bad');
  if(!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)){
    el.classList.add('bad');
    note.innerHTML = `<span class="err">${ico('alert')}${T('A VIN is 17 characters and never contains I, O or Q.','رقم الهيكل 17 خانة ولا يحتوي على I أو O أو Q.')}</span>`;
    return;
  }
  const year = VIN_YEAR[vin[9]], mk = VIN_MAKE[vin[0]];
  if(!year || !mk || !VEHICLES[mk]){
    note.innerHTML = `<span class="err">${ico('alert')}${T('This prototype only decodes a handful of patterns. Pick the car above instead.','هذا النموذج يفك عدداً محدوداً من الأنماط. اختر السيارة من الأعلى.')}</span>`;
    return;
  }
  const model = VEHICLES[mk].models.find(m=>year>=m.yrs[0] && year<=m.yrs[1]) || VEHICLES[mk].models[0];
  VP = { year:String(year), mk, md:model.id, eng:'' };
  refreshVehicleDialog();
  toast(T('VIN read: pick the model to confirm','قُرئ رقم الهيكل: أكّد الموديل'));
}

/* ---- cart drawer ------------------------------------------------------- */
function openCart(){ openOverlay('cart', cartDrawer(), { label:T('Cart','السلة') }); }
function renderCart(){
  const host = document.getElementById('overlay');
  const d = host.querySelector('.drawer'); if(d) d.outerHTML = cartDrawer();
}
function cartDrawer(){
  const sub = cartSub(), del = deliveryFee();
  return `<div class="drawer">
    <div class="drawer-h">
      <h2 class="d4">${T('Cart','السلة')} ${cartCount()?`<span class="faint num" style="font-weight:400">(${cartCount()})</span>`:''}</h2>
      <button class="iconbtn" data-close aria-label="${T('Close','إغلاق')}">${ico('close')}</button>
    </div>
    <div class="drawer-b">
      ${!S.cart.length ? `<div class="center" style="padding:56px 20px">
          <div class="thumb" style="width:64px;height:64px;margin:0 auto 16px;opacity:.5">${art('care')}</div>
          <p class="d4">${T('Nothing in the cart yet','السلة فارغة')}</p>
          <p class="small" style="margin-top:6px">${T('Set your vehicle and the catalogue will only show parts that fit it.','حدّد سيارتك وسيعرض الكتالوج القطع المناسبة لها فقط.')}</p>
          <button class="btn btn-line" style="margin-top:18px" data-close onclick="go('#/shop')">${T('Browse parts','تصفّح القطع')}</button>
        </div>`
      : S.cart.map((l,i)=>{
          const p = P(l.sku); if(!p) return '';
          return `<div class="row" style="align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid var(--rule)">
            <div class="thumb" style="width:56px;height:56px">${art(p.art)}</div>
            <div class="grow">
              <p style="font-size:13.5px;font-weight:600;line-height:1.35">${esc(nm(p))}</p>
              <p class="tiny" style="margin-top:3px">${esc(BRANDS[p.brand])} · <span class="mono">${p.sku}</span></p>
              ${l.install ? `<p class="tiny" style="color:var(--go);margin-top:4px">${T('With fitting','مع التركيب')} +${kwd(p.install)}</p>` : ''}
              <div class="row-b" style="margin-top:9px">
                <div class="row" style="gap:0;border:1px solid var(--rule-2);border-radius:var(--r);overflow:hidden">
                  <button class="iconbtn" style="width:30px;height:28px;border-radius:0" onclick="setQty(${i},-1)" aria-label="${T('Fewer','أقل')}">${ico('minus')}</button>
                  <span class="num" style="width:26px;text-align:center;font-size:13px">${l.qty}</span>
                  <button class="iconbtn" style="width:30px;height:28px;border-radius:0" onclick="setQty(${i},1)" aria-label="${T('More','أكثر')}">${ico('plus')}</button>
                </div>
                <span class="price" style="font-size:15px">${kwd(unitPrice(p,l.install)*l.qty)}</span>
              </div>
            </div>
            <button class="iconbtn" style="width:30px;height:30px" onclick="dropLine(${i})" aria-label="${T('Remove','حذف')}">${ico('trash')}</button>
          </div>`;
        }).join('')}
    </div>
    ${S.cart.length ? `<div class="drawer-f">
      <div class="row-b small"><span>${T('Subtotal','المجموع')}</span><span class="num">${kwd(sub)}</span></div>
      <div class="row-b small" style="margin-top:5px"><span>${T('Delivery','التوصيل')}</span>
        <span class="${del?'num':''}" style="${del?'':'color:var(--go);font-weight:600'}">${del ? kwd(del) : T('Free','مجاني')}</span></div>
      ${del ? `<p class="tiny" style="margin-top:6px">${T(`Add ${kwd(FREE_DELIVERY-sub)} KWD for free delivery`,`أضف ${kwd(FREE_DELIVERY-sub)} د.ك للتوصيل المجاني`)}</p>` : ''}
      <div class="row-b" style="margin-top:11px;padding-top:11px;border-top:1px solid var(--rule)">
        <span class="d4">${T('Total','الإجمالي')}</span><span class="price">${kwd(sub+del)}</span></div>
      <button class="btn btn-primary btn-block btn-lg" style="margin-top:14px" onclick="closeOverlay();go('#/checkout')">${T('Checkout','إتمام الطلب')}</button>
      <p class="tiny center" style="margin-top:9px">${cutoffLine('A')}</p>
    </div>` : ''}
  </div>`;
}

/* ---- symptom led diagnosis -------------------------------------------- */
let DX = { sym:null, ans:null };
function openDiagnose(sym){ DX = { sym:sym||null, ans:null }; openOverlay('dx', dxDialog(), { label:T('Diagnose a problem','تشخيص مشكلة') }); }
function dxStep(k, v){ DX[k] = v; const h=document.getElementById('overlay'); h.querySelector('.dialog').outerHTML = dxDialog(); }
function dxDialog(){
  const head = (title, sub) => `<div class="dialog-h"><div>
      <p class="eyebrow ac">${T('Guided check','فحص موجّه')}</p>
      <h2 class="d3" style="margin-top:6px">${title}</h2>
      ${sub?`<p class="small" style="margin-top:6px">${sub}</p>`:''}
    </div><button class="iconbtn" data-close aria-label="${T('Close','إغلاق')}">${ico('close')}</button></div>`;

  if(!DX.sym) return `<div class="dialog">
    ${head(T('What is the car doing?','ما الذي تفعله السيارة؟'), T('Four questions at most. You will get a likely cause, the parts it points to, and a way to reach a person.','أربعة أسئلة كحد أقصى. ستحصل على سبب محتمل والقطع المرتبطة به وطريقة للوصول إلى شخص.'))}
    <div class="dialog-b"><div class="grid g2" style="gap:10px">
      ${SYMPTOMS.map(s=>`<button class="panel" style="padding:16px;text-align:start;cursor:pointer" onclick="dxStep('sym','${s.id}')">
        <div class="thumb" style="width:38px;height:38px;margin-bottom:10px">${art(s.icon)}</div>
        <p class="d4" style="font-size:15px">${nm(s)}</p></button>`).join('')}
    </div></div></div>`;

  const s = SYMPTOMS.find(x=>x.id===DX.sym);
  if(!DX.ans) return `<div class="dialog">
    ${head(fx(s,'q'), '')}
    <div class="dialog-b"><div class="stack">
      ${s.opts.map(o=>`<button class="panel row" style="padding:14px 16px;width:100%;text-align:start;cursor:pointer;gap:12px" onclick="dxStep('ans','${o.to}')">
        <span class="grow" style="font-size:14.5px;font-weight:500">${nm(o)}</span>${ico('chev','flip')}</button>`).join('')}
    </div>
    <button class="btn btn-quiet" style="margin-top:14px" onclick="dxStep('sym',null)">${T('Back','رجوع')}</button>
    </div></div>`;

  const d = s.out[DX.ans];
  const confLabel = { high:T('Most likely','الأرجح'), medium:T('Likely','محتمل'), low:T('Needs a look','يحتاج فحصاً') }[d.conf];
  const confChip = { high:'chip-go', medium:'chip-hold', low:'chip-stop' }[d.conf];
  const svc = d.service && SERVICES.find(x=>x.id===d.service);
  return `<div class="dialog">
    ${head(T('What this points to','إلى ماذا يشير هذا'), '')}
    <div class="dialog-b">
      <div class="panel" style="padding:18px;background:var(--inset)">
        <span class="chip ${confChip}">${ico(d.conf==='low'?'alert':'check')}${confLabel}</span>
        <p class="d4" style="margin-top:11px;font-size:16.5px">${nm(d)}</p>
        <p class="small" style="margin-top:8px">${fx(d,'why')}</p>
      </div>
      ${d.urgent ? `<div class="panel" style="padding:13px 15px;margin-top:12px;border-color:rgba(154,40,32,.3);background:var(--stop-w)">
        <p class="small" style="color:var(--stop);font-weight:600">${ico('alert')} ${T('Do not leave this. If the car is stranded, the rescue van carries the common batteries and a tester.','لا تؤجل هذا. إذا كانت السيارة متعطلة، فان الإنقاذ يحمل البطاريات الشائعة وجهاز الفحص.')}</p>
      </div>` : ''}
      ${(()=>{
        const all = d.parts.map(sku=>P(sku)).filter(Boolean);
        const shown = S.vehicle ? all.filter(p=>{ const f=fitOf(p); return f==='yes'||f==='universal'; }) : all;
        const dropped = all.length - shown.length;
        if(!all.length) return '';
        return `<p class="eyebrow" style="margin:20px 0 10px">${T('Parts this points to','القطع المرتبطة')}${S.vehicle?` <span class="faint" style="text-transform:none;letter-spacing:0">${T('for your','لـ')} ${esc(vehicleLabel(S.vehicle))}</span>`:''}</p>
          ${shown.length ? `<div class="stack">${shown.map(miniRow).join('')}</div>`
            : `<div class="panel" style="padding:14px 16px"><p class="small">${T('Nothing in the sample catalogue fits your car for this. A parts person can source it.','لا يوجد في الكتالوج التجريبي ما يناسب سيارتك لهذا. يمكن لمختص القطع توفيره.')}</p></div>`}
          ${dropped ? `<p class="tiny" style="margin-top:8px">${T(`${dropped} more part${dropped>1?'s':''} relate to this fault but do not fit your car, so they are not shown.`,`${dropped} قطعة أخرى مرتبطة بهذا العطل لكنها لا تناسب سيارتك، لذا لم تُعرض.`)}</p>` : ''}`;
      })()}
      <p class="tiny" style="margin-top:18px">${T('This is a guided check, not a diagnosis. If it does not match what you are seeing, talk to a person before buying anything.','هذا فحص موجّه وليس تشخيصاً. إذا لم يطابق ما تراه، تحدّث مع شخص قبل شراء أي شيء.')}</p>
    </div>
    <div class="dialog-f">
      <button class="btn btn-line" onclick="dxStep('ans',null)">${T('Back','رجوع')}</button>
      ${svc ? `<button class="btn btn-primary grow" onclick="closeOverlay();openBooking('${svc.id}')">${ico('wrench')}${T('Book','احجز')} ${nm(svc)}</button>` : ''}
      <a class="btn btn-line" href="https://wa.me/96518002279" target="_blank" rel="noopener">${ico('wa')}${T('Ask a person','اسأل شخصاً')}</a>
    </div>
  </div>`;
}
function miniRow(p){
  return `<div class="row panel" style="padding:11px 13px;gap:12px">
    <div class="thumb" style="width:44px;height:44px">${art(p.art)}</div>
    <div class="grow">
      <p style="font-size:13.5px;font-weight:600;line-height:1.3">${esc(nm(p))}</p>
      <div class="row gap-s" style="margin-top:5px">${fitChip(p)}<span class="price" style="font-size:14px">${kwd(p.price)}</span></div>
    </div>
    <button class="addbtn" onclick="addToCart('${p.sku}',true)" aria-label="${T('Add','أضف')}">${ico('plus')}</button>
  </div>`;
}

/* ---- service booking and rescue ---------------------------------------- */
let BK = { svc:null, gov:'capital', area:'', slot:null, done:false, ref:'' };
function openBooking(id){
  BK = { svc:id, gov:'capital', area:'', slot:null, done:false, ref:'' };
  openOverlay('book', bookDialog(), { label:T('Book a service','حجز خدمة') });
}
function bookRefresh(){ const h=document.getElementById('overlay'); h.querySelector('.dialog').outerHTML = bookDialog(); }
function slotList(){
  const now = new Date(), out = [];
  for(let d=0; d<3; d++){
    const day = new Date(now); day.setDate(now.getDate()+d);
    [[16,18],[18,20],[20,22]].forEach(([a,b])=>{
      if(d===0 && now.getHours() >= a-2) return;
      out.push({ id:`${d}-${a}`, day:d===0?T('Today','اليوم'):d===1?T('Tomorrow','غداً'):dateLabel(day), win:`${a}:00 - ${b}:00` });
    });
  }
  return out.slice(0,6);
}
function bookDialog(){
  const s = SERVICES.find(x=>x.id===BK.svc);
  const gov = GOVERNORATES.find(g=>g.id===BK.gov);
  if(BK.done) return `<div class="dialog"><div class="dialog-b center" style="padding:40px 26px">
      <div class="thumb" style="width:60px;height:60px;margin:0 auto 18px;background:var(--go-w)">${art('check')}</div>
      <h2 class="d3">${T('Booked','تم الحجز')}</h2>
      <p class="small" style="margin-top:8px">${nm(s)} · <span class="mono">${BK.ref}</span></p>
      <div class="panel" style="padding:14px;margin-top:20px;text-align:start;background:var(--inset)">
        <div class="row-b small"><span class="muted">${T('When','الموعد')}</span><span style="font-weight:600">${BK.slot}</span></div>
        <div class="row-b small" style="margin-top:7px"><span class="muted">${T('Where','المكان')}</span><span style="font-weight:600">${esc(BK.area||nm(gov))}</span></div>
        <div class="row-b small" style="margin-top:7px"><span class="muted">${T('Price','السعر')}</span><span class="num">${kwd(s.price)}</span></div>
      </div>
      <p class="tiny" style="margin-top:16px">${T('A prototype books nothing and sends nothing. In the real product this is where the WhatsApp confirmation goes out.','النموذج التجريبي لا يحجز ولا يرسل شيئاً. في المنتج الحقيقي يُرسل تأكيد واتساب هنا.')}</p>
      <button class="btn btn-line btn-block" style="margin-top:18px" data-close>${T('Done','تم')}</button>
    </div></div>`;

  return `<div class="dialog">
    <div class="dialog-h"><div>
      <p class="eyebrow ac">${T('Mobile service','خدمة متنقلة')}</p>
      <h2 class="d3" style="margin-top:6px">${nm(s)}</h2>
      <p class="small" style="margin-top:6px">${fx(s,S.lang==='ar'?'':'')||s[S.lang+'_d']}</p>
      <div class="row gap-s" style="margin-top:10px">
        <span class="spec"><i>${T('Fixed','ثابت')}</i> ${kwd(s.price)} ${T('KWD','د.ك')}</span>
        <span class="spec"><i>${T('On site','في الموقع')}</i> ${s.dur}</span>
      </div></div>
      <button class="iconbtn" data-close aria-label="${T('Close','إغلاق')}">${ico('close')}</button></div>
    <div class="dialog-b">
      <div class="grid g2" style="gap:12px">
        <label class="field" style="margin:0"><span>${T('Governorate','المحافظة')}</span>
          <select class="inp" onchange="BK.gov=this.value;BK.area='';bookRefresh()">
            ${GOVERNORATES.map(g=>`<option value="${g.id}"${BK.gov===g.id?' selected':''}>${nm(g)}</option>`).join('')}
          </select></label>
        <label class="field" style="margin:0"><span>${T('Area','المنطقة')}</span>
          <select class="inp" onchange="BK.area=this.value">
            <option value="">${T('Select','اختر')}</option>
            ${(S.lang==='ar'?gov.areas_ar:gov.areas_en).map(a=>`<option${BK.area===a?' selected':''}>${a}</option>`).join('')}
          </select></label>
      </div>
      <p class="eyebrow" style="margin:16px 0 10px">${T('Evening windows','الفترات المسائية')}
        <span class="faint" style="text-transform:none;letter-spacing:0"> ${T('daytime work in summer is hard on the technician and on your car','العمل نهاراً صيفاً شاق على الفني وعلى سيارتك')}</span></p>
      <div class="grid g3" style="gap:8px">
        ${slotList().map(sl=>`<button class="panel" style="padding:11px 8px;text-align:center;cursor:pointer;${BK.slot===sl.day+' '+sl.win?'border-color:var(--ink);background:var(--inset)':''}"
          onclick="BK.slot='${sl.day} ${sl.win}';bookRefresh()">
          <p class="tiny" style="font-weight:600;color:var(--ink)">${sl.day}</p>
          <p class="mono" style="font-size:11.5px;margin-top:3px">${sl.win}</p></button>`).join('')}
      </div>
      <div class="grid g2" style="gap:12px;margin-top:18px">
        <label class="field" style="margin:0"><span>${T('Name','الاسم')}</span><input class="inp" placeholder="${T('Your name','اسمك')}"></label>
        <label class="field" style="margin:0"><span>${T('Mobile','الجوال')}</span><input class="inp mono" dir="ltr" placeholder="+965 "></label>
      </div>
    </div>
    <div class="dialog-f">
      <button class="btn btn-line" data-close>${T('Cancel','إلغاء')}</button>
      <button class="btn btn-primary grow"${BK.slot&&BK.area?'':' disabled'}
        onclick="BK.done=true;BK.ref='SV-'+Math.floor(10000+Math.random()*89999);bookRefresh()">
        ${T('Confirm booking','تأكيد الحجز')} · ${kwd(s.price)}</button>
    </div>
  </div>`;
}

/* == 7. views ============================================================ */
/* Attribute keys and the small set of enumerated values that reach the
   surface are translated. Acronyms that Arabic technical usage keeps in
   Latin (AGM, EFB, CCA, DOT, API) stay as they are, which is what a parts
   counter in Shuwaikh would say out loud. */
const ATTR_LABEL = { cca:'CCA', ah:'Ah', dot:'DOT', ph:'pH', tpms:'TPMS', oem:'OEM',
  boiling_dry:'Dry boiling point', wear_sensor:'Wear sensor', safe_on:'Safe on', canbus:'CANbus' };
const ATTR_AR = {
  group:'المقاس', cca:'CCA', ah:'أمبير/ساعة', tech:'التقنية', warranty:'الضمان', terminal:'الأطراف',
  size:'المقاس', load:'الحمل', speed:'السرعة', dot:'الإنتاج', treadwear:'مؤشر التآكل',
  viscosity:'اللزوجة', volume:'الحجم', spec:'المواصفة', base:'الأساس', type:'النوع',
  thread:'السن', bypass:'صمام التجاوز', media:'الوسط', service:'الخدمة', mix:'الخلط', life:'العمر',
  position:'الموضع', material:'الخامة', wear_sensor:'حساس التآكل', shims:'العوازل',
  diameter:'القطر', thickness:'السماكة', coating:'الطلاء', refrigerant:'غاز التبريد',
  clutch:'الكلتش', oil:'الزيت', drier:'المجفف', motor:'الموتور', connector:'الوصلة',
  fitting:'القاعدة', colour:'اللون', lumens:'اللومن', canbus:'CANbus', output:'القدرة',
  sizes:'المقاسات', frame:'الهيكل', power:'القدرة', teeth:'الأسنان', rotation:'الدوران',
  gap:'الخلوص', electrode:'القطب', interval:'الفترة', sold:'يُباع', includes:'يشمل',
  layers:'الطبقات', fit:'الملاءمة', dilution:'التخفيف', safe_on:'آمن على', bag:'الحقيبة',
  boiling_dry:'درجة الغليان الجافة'
};
function attrLabel(k){
  if(S.lang==='ar' && ATTR_AR[k]) return ATTR_AR[k];
  if(ATTR_LABEL[k]) return ATTR_LABEL[k];
  const t = k.replace(/_/g,' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}
const VALUE_AR = {
  'AGM':'AGM', 'EFB':'EFB', 'Flooded':'سائلة',
  'Right positive':'الموجب يمين', 'Left positive':'الموجب يسار',
  'Full synthetic':'تخليقي كامل', 'Front axle':'المحور الأمامي', 'Rear axle':'المحور الخلفي',
  'Front':'أمامي', 'Rear':'خلفي', 'Each':'بالقطعة', 'Included':'مشمول', 'Not fitted':'غير مركّب',
  'Integrated':'مدمج', 'Ceramic':'سيراميك', 'Spin-on':'لولبي', 'Panel':'مسطح',
  'Carbon panel':'مسطح بالكربون', 'Aluminium':'ألمنيوم', 'Pre-diluted 50/50':'مخفف مسبقاً 50/50',
  'Beam, frameless':'شفرة بدون هيكل', 'Graphite':'جرافيت', 'Built in':'مدمج', 'Clockwise':'باتجاه عقارب الساعة',
  'Twin tube gas':'أنبوب مزدوج بالغاز', 'Reflective, foam core':'عاكس بقلب إسفنجي'
};
function attrValue(v){
  if(S.lang !== 'ar') return v;
  const str = String(v);
  if(VALUE_AR[str]) return VALUE_AR[str];
  let m = str.match(/^(\d+) months$/);            if(m) return `${m[1]} شهراً`;
  m = str.match(/^(\d+) litre$/);                  if(m) return `${m[1]} لتر`;
  m = str.match(/^Week (\d+) \/ (\d+)$/);         if(m) return `الأسبوع ${m[1]} / ${m[2]}`;
  m = str.match(/^Every ([\d,]+) km(.*)$/);        if(m) return `كل ${m[1]} كم${m[2]?'':''}`;
  return str;
}
function byDept(id){ return PRODUCTS.filter(p=>p.dept===id); }
function deptOf(id){ return DEPTS.find(d=>d.id===id); }
function fittingCount(deptId){
  return byDept(deptId).filter(p=>{ const f=fitOf(p); return f==='yes'||f==='universal'; }).length;
}

/* ---- shared blocks ----------------------------------------------------- */
function productCard(p){
  const f = fitOf(p);
  const pref = p.tire ? ['size','dot'] : p.dept==='batteries' ? ['group','cca'] : null;
  const entries = pref
    ? pref.filter(k=>p.attrs[k]!=null).map(k=>[k, p.attrs[k]])
    : Object.entries(p.attrs||{}).filter(([,v])=>String(v).length<=16).slice(0,2);
  const specs = entries.map(([k,v])=>`<span class="spec"><i>${esc(attrLabel(k))}</i> ${esc(attrValue(v))}</span>`).join('');
  return `<article class="pcard">
    <a class="pcard-art" href="#/p/${p.sku}" aria-label="${esc(nm(p))}">
      ${artOf(p)}
      <span class="pcard-tag">
        ${p.was ? `<span class="chip chip-flame">${T('Save','وفّر')} ${kwd(p.was-p.price)}</span>` : ''}
        ${p.stock<12 ? `<span class="chip chip-hold">${T('Low stock','مخزون منخفض')}</span>` : ''}
      </span>
      ${p.tire ? `<span class="pcard-fit">${dotChip(p)}</span>`
        : f&&f!=='universal' ? `<span class="pcard-fit">${fitChip(p)}</span>` : ''}
    </a>
    <div class="pcard-b">
      <p class="pcard-brand">${esc(BRANDS[p.brand])}</p>
      <a href="#/p/${p.sku}"><h3 class="pcard-n">${esc(nm(p))}</h3></a>
      <div class="pcard-specs">${specs}</div>
      <div class="pcard-foot">
        <div>
          <p class="price">${kwd(p.price)}${p.was?`<span class="price-was">${kwd(p.was)}</span>`:''}</p>
          ${p.install ? `<p class="price-inst">${T('Fitted','بالتركيب')} ${kwd(p.price+p.install)}</p>`
            : fitsIncluded(p) ? `<p class="price-inst">${T('Fitting included','التركيب مشمول')}</p>`
            : `<p class="tiny" style="margin-top:3px">${p.sameDay?T('Same day','نفس اليوم'):esc(p.lead||'')}</p>`}
        </div>
        <button class="addbtn" onclick="addToCart('${p.sku}',${fittable(p)})" aria-label="${T('Add to cart','أضف للسلة')}: ${esc(nm(p))}">${ico('plus')}</button>
      </div>
    </div>
  </article>`;
}

function heroDiagram(){
  const v = S.vehicle, body = v ? bodyOf(v) : 'sedan';
  const c = CARS[body];
  const hots = Object.entries(c.hot).map(([k,pt])=>{
    const sys = SYSTEMS[k]; if(!sys) return '';
    return `<span class="hot${S.ui.sysOpen===k?' on':''}" style="inset-inline-start:${(pt[0]/420*100).toFixed(2)}%;top:${(pt[1]/168*100).toFixed(2)}%">
      <button onclick="pickSystem('${k}')" aria-label="${esc(nm(sys))}"><span class="pip"></span><span class="lbl">${esc(nm(sys))}</span></button></span>`;
  }).join('');
  const open = S.ui.sysOpen && SYSTEMS[S.ui.sysOpen];
  const n = open ? fittingCount(SYSTEMS[S.ui.sysOpen].dept) : 0;
  return `<div class="diagram" style="${v?'':'opacity:.9'}">
      <div style="position:relative">${carSvg(body,{label:v?vehicleLabel(v):'Sedan outline'})}${v?hots:''}</div>
      ${v ? `<div class="sys-chips">
          ${Object.keys(c.hot).map(k=>{ const sy=SYSTEMS[k]; return sy
            ? `<a class="chip chip-line" style="padding:7px 11px;font-size:12px" href="#/shop/${sy.dept}">${esc(nm(sy))}</a>` : ''; }).join('')}
        </div>
        <div class="row-b diagram-cap" style="padding:12px 14px 8px;border-top:1px solid var(--rule);margin-top:4px;flex-wrap:wrap;gap:10px">
          ${open ? `<div class="row" style="gap:10px">
              <div class="thumb" style="width:34px;height:34px">${art(open.icon)}</div>
              <div><p style="font-size:13.5px;font-weight:600">${esc(nm(open))}</p>
              <p class="tiny">${T(`${n} in stock for this car`,`${n} متوفرة لهذه السيارة`)}</p></div>
            </div>
            <a class="btn btn-sm btn-dark" href="#/shop/${open.dept}">${T('See them','اعرضها')}${ico('chev','flip')}</a>`
          : `<p class="tiny">${T('Tap a marker to jump to that system','اضغط على علامة للانتقال إلى النظام')}</p>
             <p class="tiny mono">${esc(vehicleLabel(v))}</p>`}
        </div>` :
        `<div class="center" style="padding:14px 16px 10px;border-top:1px solid var(--rule);margin-top:4px">
          <p class="tiny">${T('Set a vehicle and this becomes your car, with every serviceable system marked.','حدّد سيارة وسيصبح هذا رسم سيارتك، مع تعليم كل نظام قابل للصيانة.')}</p></div>`}
    </div>`;
}
function pickSystem(k){ S.ui.sysOpen = S.ui.sysOpen===k ? null : k; render(); }

/* ---- home -------------------------------------------------------------- */
function viewHome(){
  const v = S.vehicle;
  const batteries = rankBatteries().slice(0,3);
  return `
  <section class="wrap" style="padding-block:clamp(34px,5vw,64px)">
    <div class="sp-hero">
      <div>
        <p class="eyebrow ac">${T('Kuwait','الكويت')} · ${T('parts, tires and fitting','قطع وإطارات وتركيب')}</p>
        <h1 class="d1" style="margin-top:14px">${T('The right part.','القطعة الصحيحة.')}<br>${T('Guaranteed.','مضمونة.')}</h1>
        <p class="lede" style="margin-top:18px">${T(
          'Tell us the car once. Every price, every part and every fitting slot after that is filtered to it. If our catalogue says a part fits and it does not, the return is free and we credit you 2 KWD.',
          'أخبرنا بالسيارة مرة واحدة. بعدها يُصفّى كل سعر وكل قطعة وكل موعد تركيب عليها. وإذا قال الكتالوج إن القطعة تناسب ولم تناسب، الإرجاع مجاني ونضيف لك رصيد 2 د.ك.')}</p>
        <div class="row wrap-f hero-cta" style="margin-top:26px;gap:10px">
          <button class="btn btn-primary btn-lg" onclick="openVehiclePicker()">${ico('car')}${v?T('Change vehicle','تغيير السيارة'):T('Set your vehicle','حدّد سيارتك')}</button>
          <button class="btn btn-line btn-lg" onclick="openDiagnose()">${ico('pulse')}${T('Something is wrong','هناك خلل')}</button>
        </div>
        ${v ? `<div class="row wrap-f gap-s" style="margin-top:20px">
            <span class="chip chip-go">${ico('check')}${T('Filtering to','مُصفّى على')} ${esc(vehicleLabel(v))}</span>
            <a class="link-q" href="#/garage">${T('My garage','كراجي')}${ico('chev','flip')}</a></div>`
          : `<p class="tiny" style="margin-top:18px">${T('Or search a part number directly. OEM and cross references both work.','أو ابحث برقم القطعة مباشرة. الأرقام الأصلية والمكافئة تعمل.')}</p>`}
      </div>
      <div>${heroDiagram()}</div>
    </div>
  </section>

  <section class="wrap">
    <div class="panel sp-guarantee" style="overflow:hidden">
      ${[[ 'shield', T('Fitment guaranteed','مطابقة مضمونة'), T('Free return plus 2 KWD if our fitment call is wrong','إرجاع مجاني و2 د.ك إذا أخطأنا في المطابقة')],
         ['truck',  T('Same day before 15:00','نفس اليوم قبل 3 م'), T('Evening windows 16:00 to 22:00 across Kuwait','فترات مسائية من 4 إلى 10 مساءً في كل الكويت')],
         ['wrench', T('Fitted where you are','تركيب في موقعك'), T('Battery, oil, brakes and AC at a fixed price','بطارية وزيت وفرامل وتكييف بسعر ثابت')],
         ['doc',    T('Genuine sourcing','مصادر أصلية'), T('Authorised distributors only, with the paper trail','موزعون معتمدون فقط، مع إثبات المصدر')]]
        .map((c,i)=>`<div style="padding:20px;${i?'border-inline-start:1px solid var(--rule)':''}">
          <span style="color:var(--flame-1);display:block;width:19px">${ico(c[0])}</span>
          <p class="d4" style="font-size:14.5px;margin-top:11px">${c[1]}</p>
          <p class="tiny" style="margin-top:5px">${c[2]}</p></div>`).join('')}
    </div>
  </section>

  <section class="sec wrap" data-rv>
    <div class="sec-head">
      <div><p class="eyebrow ac">${T('Departments','الأقسام')}</p>
        <h2 class="d2" style="margin-top:8px">${v?T('What we stock for this car','ما نوفره لهذه السيارة'):T('Shop by department','تسوّق حسب القسم')}</h2></div>
      <a class="link-q" href="#/shop">${T('Everything','كل شيء')}${ico('chev','flip')}</a>
    </div>
    <div class="grid g3">
      ${DEPTS.map(d=>{
        const n = v ? fittingCount(d.id) : byDept(d.id).length;
        return `<a class="pcard" href="#/shop/${d.id}" style="flex-direction:row;align-items:center;gap:14px;padding:16px">
          <span class="thumb" style="width:60px;height:60px">${art(d.icon)}</span>
          <span class="grow">
            <span class="d4" style="display:block;font-size:15.5px">${nm(d)}</span>
            <span class="tiny" style="display:block;margin-top:4px">${fx(d,'lede')}</span>
            <span class="tiny mono" style="display:block;margin-top:6px;color:${v&&!n?'var(--ink-3)':'var(--flame-1)'}">${
              !v ? T(`${n} parts`,`${n} قطعة`)
              : n ? T(`${n} fit this car`,`${n} تناسب هذه السيارة`)
              : T('None for this car yet','لا شيء لهذه السيارة بعد')}</span>
          </span></a>`;
      }).join('')}
    </div>
  </section>

  ${heatSection()}

  <section class="sec wrap" data-rv>
    <div class="sec-head">
      <div><p class="eyebrow ac">${T('Hero category','الفئة الرئيسية')}</p>
        <h2 class="d2" style="margin-top:8px">${T('Batteries, matched by group size','بطاريات مطابقة بالمقاس')}</h2>
        <p class="lede" style="margin-top:10px">${T('Not by guesswork. We hold the group size each model takes, so the shortlist is three batteries and not ninety.','ليس بالتخمين. نحتفظ بمقاس البطارية لكل موديل، فتصبح القائمة ثلاث بطاريات لا تسعين.')}</p></div>
    </div>
    ${batteryFinder(batteries)}
  </section>

  <section class="sec wrap" data-rv>
    <div class="sec-head">
      <div><p class="eyebrow ac">${T('Fitted, not just delivered','تركيب لا توصيل فقط')}</p>
        <h2 class="d2" style="margin-top:8px">${T('Your parking space is the workshop','موقف سيارتك هو الورشة')}</h2>
        <p class="lede" style="margin-top:10px">${T('Kuwait is not a do it yourself market. Labour is affordable and most people would rather someone else did it, so fitting is priced on the shelf next to the part.','السوق الكويتي ليس سوق «اصنعها بنفسك». الأجور معقولة ويفضّل الأغلبية أن يقوم بها غيرهم، لذا سعر التركيب معروض بجانب القطعة.')}</p></div>
      <a class="link-q" href="#/service">${T('All services','كل الخدمات')}${ico('chev','flip')}</a>
    </div>
    <div class="grid g3">${SERVICES.slice(0,6).map(serviceCard).join('')}</div>
  </section>

  <section class="wrap" data-rv>
    <div class="ink-panel sp-band" style="padding:clamp(26px,4vw,48px)">
      <div>
        <p class="eyebrow ac">${T('For workshops','للورش')}</p>
        <h2 class="d2" style="margin-top:10px">${T('CarZone Pro','كارزون برو')}</h2>
        <p style="margin-top:14px;max-width:52ch">${T(
          'A four bay garage in Al Rai buys from five wholesalers by phone. Nobody publishes a price, nobody promises a time, and a runner spends half his day collecting. Pro replaces that with one account: tier pricing, net 30, and two scheduled runs a day into the workshop districts.',
          'ورشة بأربعة مواقف في الري تشتري من خمسة موزعين بالهاتف. لا أحد ينشر سعراً ولا يلتزم بوقت، ويقضي المندوب نصف يومه في التجميع. برو يستبدل ذلك بحساب واحد: أسعار شرائح، ائتمان 30 يوماً، وجولتان يومياً إلى مناطق الورش.')}</p>
        <div class="row wrap-f" style="margin-top:24px;gap:10px">
          <a class="btn btn-primary" href="#/pro">${T('Open the Pro portal','افتح بوابة برو')}${ico('chev','flip')}</a>
          <a class="btn btn-onink" href="https://wa.me/96518002279" target="_blank" rel="noopener">${ico('wa')}${T('Talk to a rep','تحدّث مع مندوب')}</a>
        </div>
      </div>
      <div class="stack">
        ${[[T('Tier pricing','أسعار شرائح'), T('T1 to T3 by monthly volume, visible only after login','من T1 إلى T3 حسب الحجم الشهري، تظهر بعد الدخول فقط')],
           [T('Net 30 credit','ائتمان 30 يوماً'), T('Limit, statement and online settlement by KNET','حد ائتماني وكشف حساب وسداد إلكتروني عبر كي نت')],
           [T('90 minute runs','جولات 90 دقيقة'), T('Shuwaikh, Al Rai, Ardiya, Amghara on flagged fast movers','الشويخ والري والعارضية وأمغرة للقطع سريعة الحركة')]]
          .map(r=>`<div style="padding:14px 0;border-top:1px solid rgba(244,241,234,.14)">
            <p class="d4" style="font-size:14.5px">${r[0]}</p>
            <p class="small" style="color:rgba(244,241,234,.6);margin-top:4px">${r[1]}</p></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec wrap" data-rv>
    <a class="panel sp-teaser" href="#/guide" style="padding:24px">
      <span class="thumb" style="width:66px;height:66px">${art('battery')}</span>
      <span>
        <span class="eyebrow ac" style="display:block">${T('Guide','دليل')}</span>
        <span class="d3" style="display:block;margin-top:7px">${fx(GUIDE,'title')}</span>
        <span class="small" style="display:block;margin-top:6px">${fx(GUIDE,'stand')}</span>
      </span>
      <span class="btn btn-line">${T('Read','اقرأ')}${ico('chev','flip')}</span>
    </a>
  </section>`;
}

function serviceCard(s){
  return `<article class="pcard" style="padding:20px">
    <div class="row-b" style="align-items:flex-start">
      <span class="thumb" style="width:46px;height:46px">${art(s.icon)}</span>
      <span class="spec"><i>${T('on site','في الموقع')}</i> ${s.dur}</span>
    </div>
    <h3 class="d4" style="margin-top:14px">${nm(s)}</h3>
    <p class="small" style="margin-top:7px;flex:1">${s[S.lang+'_d']}</p>
    <div class="row-b" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--rule)">
      <span class="price">${kwd(s.price)}<small>${T('KWD','د.ك')}</small></span>
      <button class="btn btn-sm btn-line" onclick="openBooking('${s.id}')">${T('Book','احجز')}</button>
    </div>
  </article>`;
}

/* The heat section. Figures are illustrative and labelled as such, because
   inventing a source is worse than admitting there is not one yet. */
function heatSection(){
  const v = S.vehicle, g = S.garage.find(x=>v&&x.mk===v.mk&&x.md===v.md&&x.year===v.year);
  const age = g && g.battFitted ? monthsSince(g.battFitted) : null;
  return `<section class="sec" data-rv style="background:var(--inset);border-block:1px solid var(--rule)">
    <div class="wrap">
      <div class="sec-head">
        <div><p class="eyebrow ac">${T('Why this market is different','لماذا يختلف هذا السوق')}</p>
          <h2 class="d2" style="margin-top:8px">${T('Fifty degrees is a parts strategy','الخمسون درجة استراتيجية قطع غيار')}</h2>
          <p class="lede" style="margin-top:10px">${T('Heat decides what fails and how often. It is the reason batteries, tires and air conditioning are the first three departments and not an afterthought.','الحرارة تحدد ما يتعطل وكم مرة. ولهذا البطاريات والإطارات والتكييف هي الأقسام الثلاثة الأولى وليست إضافة لاحقة.')}</p></div>
      </div>
      <div class="grid g3">
        <div class="panel panel-p">
          <div class="row-b"><span class="thumb" style="width:42px;height:42px">${art('battery')}</span>
            <span class="chip chip-stop">${ico('alert')}${T('Highest turnover','الأعلى استبدالاً')}</span></div>
          <h3 class="d4" style="margin-top:14px">${T('Batteries last about a third as long','البطاريات تعيش نحو ثلث العمر')}</h3>
          <p class="small" style="margin-top:8px">${T('A battery that would run four years in a temperate climate is commonly replaced here between 18 and 24 months. Heat, not mileage, is what ends it.','البطارية التي تعمل أربع سنوات في مناخ معتدل تُستبدل هنا عادة بين 18 و24 شهراً. الحرارة هي التي تنهيها، لا المسافة.')}</p>
          <div class="scale" style="margin-top:22px">
            <div class="scale-t"></div>
            <div class="scale-band" style="inset-inline-start:0;width:50%;background:var(--go-w)"></div>
            <div class="scale-band" style="inset-inline-start:50%;width:25%;background:var(--hold-w)"></div>
            <div class="scale-band" style="inset-inline-start:75%;width:25%;background:var(--stop-w)"></div>
            <div class="scale-pin" style="inset-inline-start:${age!=null?Math.min(97,age/36*100).toFixed(0):'52'}%"></div>
            <div class="scale-ax"><span>0</span><span>18</span><span>27</span><span>36+</span></div>
          </div>
          <p class="tiny" style="margin-top:26px">${age!=null
            ? T(`Your battery: ${age} months since fitted`,`بطاريتك: ${age} شهراً منذ التركيب`)
            : T('Record a fitting date in your garage and this marker moves to your car','سجّل تاريخ التركيب في كراجك لينتقل المؤشر إلى سيارتك')}</p>
        </div>
        <div class="panel panel-p">
          <div class="row-b"><span class="thumb" style="width:42px;height:42px">${art('tire')}</span>
            <span class="chip chip-hold">${ico('clock')}${T('Age, not tread','العمر لا النقش')}</span></div>
          <h3 class="d4" style="margin-top:14px">${T('Tires age out before they wear out','الإطارات تشيخ قبل أن تتآكل')}</h3>
          <p class="small" style="margin-top:8px">${T('Rubber hardens in sustained heat whatever the tread depth says. The GCC convention is to replace at five years from the production date, which is why we print that date on every tire before you pay.','المطاط يتصلب مع الحرارة المستمرة مهما كان عمق النقش. العرف الخليجي هو الاستبدال بعد خمس سنوات من تاريخ الإنتاج، ولهذا نعرض هذا التاريخ على كل إطار قبل الدفع.')}</p>
          <div class="row wrap-f gap-s" style="margin-top:16px">
            ${byDept('tires').slice(0,4).map(p=>`<span class="spec"><i>${p.tire?`${p.tire.w}/${p.tire.a}R${p.tire.r}`:''}</i> ${T('DOT','إنتاج')} ${p.tire?p.tire.dot:''}</span>`).join('')}
          </div>
          <a class="link-q" style="margin-top:16px" href="#/shop/tires">${T('Tire finder','باحث الإطارات')}${ico('chev','flip')}</a>
        </div>
        <div class="panel panel-p">
          <div class="row-b"><span class="thumb" style="width:42px;height:42px">${art('fan')}</span>
            <span class="chip chip-cool">${ico('info')}${T('Seasonal','موسمي')}</span></div>
          <h3 class="d4" style="margin-top:14px">${T('The AC works hardest in traffic','التكييف يجهد أكثر في الزحام')}</h3>
          <p class="small" style="margin-top:8px">${T('Cold on the move and warm at a standstill is a fan or condenser problem, not a gas problem. It is the single most common misdiagnosis, and it is the reason the guided check asks when it fails rather than whether it fails.','بارد أثناء السير ودافئ عند التوقف تعني مشكلة مروحة أو مكثف لا مشكلة غاز. وهذا أكثر تشخيص خاطئ شيوعاً، ولهذا يسأل الفحص الموجّه متى يتعطل لا هل يتعطل.')}</p>
          <button class="btn btn-sm btn-line" style="margin-top:16px" onclick="openDiagnose('ac')">${ico('pulse')}${T('Run the AC check','شغّل فحص التكييف')}</button>
        </div>
      </div>
      <p class="tiny" style="margin-top:18px">${T('Replacement intervals above describe the general Gulf pattern and are shown to explain the assortment. They are not a warranty term and they are not a measurement of your car.','فترات الاستبدال أعلاه تصف النمط الخليجي العام وتُعرض لشرح تشكيلة المخزون. ليست شرط ضمان ولا قياساً لسيارتك.')}</p>
    </div>
  </section>`;
}
function monthsSince(iso){
  const d = new Date(iso+'-01'), n = new Date();
  return Math.max(0, (n.getFullYear()-d.getFullYear())*12 + (n.getMonth()-d.getMonth()));
}

/* ---- battery finder ----------------------------------------------------- */
/* Ranked with reasons, not with an invented percentage. The first reason is
   always the group size, because that is the one that decides fit. */
function rankBatteries(){
  const v = S.vehicle, md = v && modelOf(v.mk, v.md);
  const want = S.finder.want, keep = S.finder.keep;
  let pool = byDept('batteries').filter(p=>p.attrs && p.attrs.group);
  if(md) { const exact = pool.filter(p=>p.attrs.group === md.batt); if(exact.length) pool = exact; }
  const list = pool.map(p=>{
    let score = 0; const why = [];
    const groupHit = md && p.attrs.group === md.batt;
    if(groupHit){ score += 100; why.push(T(`Group ${p.attrs.group} is the size a ${nm(md)} takes`, `المقاس ${p.attrs.group} هو ما يأخذه ${nm(md)}`)); }
    else if(md){ score -= 60; why.push(T(`Group ${p.attrs.group}, and your car takes ${md.batt}`, `المقاس ${p.attrs.group}، وسيارتك تأخذ ${md.batt}`)); }
    else why.push(T(`Group ${p.attrs.group}, ${p.attrs.cca} CCA`, `المقاس ${p.attrs.group}، ${p.attrs.cca} أمبير تشغيل`));

    const tech = p.attrs.tech;
    if(keep === 'long'){
      if(tech==='AGM'){ score += 26; why.push(T('AGM holds up to repeated heat soak better than flooded','تقنية AGM تتحمل تكرار الحرارة أفضل من السائلة')); }
      else if(tech==='EFB'){ score += 14; why.push(T('Enhanced flooded, a step above standard for heat','سائلة محسّنة، درجة أعلى من العادية في تحمل الحرارة')); }
      else score += 2;
      const w = parseInt(p.attrs.warranty)||12;
      score += (w-12)/2;
    }
    if(keep === 'short'){ score += Math.max(0, 22 - p.price/3); why.push(T('Enough battery for a short hold, without paying for warranty you will not use','بطارية كافية لفترة قصيرة، دون دفع ثمن ضمان لن تستخدمه')); }
    if(want === 'value'){ score += Math.max(0, 30 - p.price/2.4); why.push(T(`${kwd(p.price)} KWD, the lower end of this group size`,`${kwd(p.price)} د.ك، الطرف الأقل في هذا المقاس`)); }
    if(want === 'life'){ score += p.attrs.cca/40 + (parseInt(p.attrs.warranty)||12)/2; why.push(T(`${p.attrs.cca} CCA and a ${p.attrs.warranty} warranty`,`${p.attrs.cca} أمبير تشغيل وضمان ${p.attrs.warranty}`)); }
    if(!keep && !want) score += p.attrs.cca/60;
    return { p, score, why:why.slice(0,3), groupHit };
  });
  return list.sort((a,b)=>b.score-a.score);
}
function setFinder(k,val){ S.finder[k]=val; render(); }
function batteryFinder(ranked){
  const v = S.vehicle, md = v && modelOf(v.mk, v.md);
  const asked = S.finder.keep && S.finder.want;
  return `<div class="panel" style="overflow:hidden">
    <div class="panel-h" style="background:var(--inset)">
      <div>
        <p class="d4">${md ? T(`Your ${nm(md)} takes group ${md.batt}`, `${nm(md)} يأخذ المقاس ${md.batt}`) : T('Two questions narrow it to three','سؤالان يختصرانها إلى ثلاثة')}</p>
        <p class="tiny" style="margin-top:4px">${md ? T('Two questions narrow it further','سؤالان يختصرانها أكثر') : T('Set a vehicle first and the group size does most of the work','حدّد سيارة أولاً ويقوم المقاس بمعظم العمل')}</p>
      </div>
      ${asked ? `<button class="btn btn-sm btn-quiet" onclick="S.finder={step:0,keep:null,want:null};render()">${ico('refresh')}${T('Start again','ابدأ من جديد')}</button>` : ''}
    </div>
    <div class="sp-find">
      <div style="padding:20px;border-inline-end:1px solid var(--rule)">
        <p class="eyebrow">${T('Question 1','السؤال 1')}</p>
        <p style="font-size:14px;font-weight:600;margin:8px 0 10px">${T('How long will you keep this car?','كم ستبقي هذه السيارة؟')}</p>
        <div class="stack" style="--s:0">
          ${[['short',T('Under two years','أقل من سنتين')],['long',T('Three years or more','ثلاث سنوات أو أكثر')]].map(o=>
            `<button class="radio" style="width:100%${S.finder.keep===o[0]?';border-color:var(--ink);background:var(--inset)':''}" onclick="setFinder('keep','${o[0]}')">
              <span style="width:16px;height:16px;border-radius:999px;border:${S.finder.keep===o[0]?'5px solid var(--flame)':'1.5px solid var(--rule-2)'};flex:none"></span>
              <span style="font-size:13.5px">${o[1]}</span></button>`).join('')}
        </div>
        <p class="eyebrow" style="margin-top:20px">${T('Question 2','السؤال 2')}</p>
        <p style="font-size:14px;font-weight:600;margin:8px 0 10px">${T('What matters more?','ما الأهم لك؟')}</p>
        <div class="stack">
          ${[['value',T('Lowest price now','أقل سعر الآن')],['life',T('Longest life and warranty','أطول عمر وضمان')]].map(o=>
            `<button class="radio" style="width:100%${S.finder.want===o[0]?';border-color:var(--ink);background:var(--inset)':''}" onclick="setFinder('want','${o[0]}')">
              <span style="width:16px;height:16px;border-radius:999px;border:${S.finder.want===o[0]?'5px solid var(--flame)':'1.5px solid var(--rule-2)'};flex:none"></span>
              <span style="font-size:13.5px">${o[1]}</span></button>`).join('')}
        </div>
      </div>
      <div style="padding:20px">
        <div class="grid" style="gap:12px;grid-template-columns:repeat(${Math.min(ranked.length,3)},minmax(0,1fr))">
          ${ranked.map((r,i)=>`<div class="panel fcard" style="padding:16px;${i===0&&asked?'border-color:var(--ink)':''}">
            ${i===0&&asked?`<span class="chip chip-ink" style="margin-bottom:10px">${r.groupHit?T('Best match','الأنسب'):T('Closest','الأقرب')}</span>`:''}
            <div class="row-b" style="align-items:flex-start">
              <span class="thumb" style="width:42px;height:42px">${art('battery')}</span>
              ${r.groupHit?`<span class="chip chip-go">${ico('check')}${T('Right group','المقاس الصحيح')}</span>`:''}
            </div>
            <p class="pcard-brand" style="margin-top:12px">${esc(BRANDS[r.p.brand])}</p>
            <p class="d4" style="font-size:14.5px;margin-top:4px">${esc(nm(r.p))}</p>
            <div class="row wrap-f gap-s" style="margin-top:8px">
              <span class="spec">${esc(attrValue(r.p.attrs.tech))}</span>
              <span class="spec"><i>CCA</i> ${r.p.attrs.cca}</span>
              <span class="spec">${esc(attrValue(r.p.attrs.warranty))}</span>
            </div>
            <ul style="margin-top:10px;display:grid;gap:6px">
              ${r.why.map(w=>`<li class="tiny row" style="align-items:flex-start;gap:7px"><span style="color:var(--go);width:13px;flex:none;margin-top:2px">${ico('check')}</span><span>${w}</span></li>`).join('')}
            </ul>
            <div class="row-b fcard-foot" style="margin-top:14px">
              <div><p class="price" style="font-size:17px">${kwd(r.p.price)}</p>
                <p class="price-inst">${fitsIncluded(r.p)?T('Fitting included','التركيب مشمول'):T('Fitted','بالتركيب')+' '+kwd(r.p.price+r.p.install)}</p></div>
              <button class="btn btn-sm btn-primary" onclick="addToCart('${r.p.sku}',true)">${T('Add','أضف')}</button>
            </div>
          </div>`).join('')}
        </div>
        <p class="tiny" style="margin-top:14px">${md
          ? T(`Only group ${md.batt} is shown, because a battery from another group either will not sit in the tray or puts the terminals out of reach. Your two answers order what is left.`,`يُعرض المقاس ${md.batt} فقط، لأن مقاساً آخر إما لا يستقر في الحوض أو يبعد الأطراف عن الكيابل. وإجابتاك ترتبان الباقي.`)
          : T('Set a vehicle and this narrows to the one group size that fits. Every reason shown is a fact from the product record, not a rating we made up.','حدّد سيارة لتُختصر إلى المقاس الوحيد المناسب. كل سبب معروض حقيقة من بيانات المنتج وليس تقييماً مُختلقاً.')}</p>
      </div>
    </div>
  </div>`;
}

/* ---- shop -------------------------------------------------------------- */
function shopList(){
  let list = S.shop.dept ? byDept(S.shop.dept) : PRODUCTS.slice();
  if(S.shop.q){
    const q = S.shop.q.toLowerCase(), qn = q.replace(/[-\s]/g,'');
    list = list.filter(p=>matchProduct(p,q,qn));
  }
  if(S.vehicle && S.shop.fitOnly) list = list.filter(p=>{ const f=fitOf(p); return f==='yes'||f==='universal'; });
  if(S.shop.brands.length) list = list.filter(p=>S.shop.brands.includes(p.brand));
  if(S.shop.sameDay) list = list.filter(p=>p.sameDay);
  if(S.shop.dept==='tires'){
    const t = S.tire;
    if(t.w) list = list.filter(p=>p.tire && String(p.tire.w)===t.w);
    if(t.a) list = list.filter(p=>p.tire && String(p.tire.a)===t.a);
    if(t.r) list = list.filter(p=>p.tire && String(p.tire.r)===t.r);
  }
  const sort = S.shop.sort;
  if(sort==='low') list.sort((a,b)=>a.price-b.price);
  else if(sort==='high') list.sort((a,b)=>b.price-a.price);
  else if(sort==='rated') list.sort((a,b)=>b.rating-a.rating);
  else list.sort((a,b)=>{
    const fa = fitOf(a)==='yes'?0:1, fb = fitOf(b)==='yes'?0:1;
    return fa-fb || b.rating-a.rating;
  });
  return list;
}
function matchProduct(p,q,qn){
  if(p.en.toLowerCase().includes(q) || (p.ar||'').includes(q)) return true;
  if((BRANDS[p.brand]||'').toLowerCase().includes(q)) return true;
  if(p.sku.toLowerCase().replace(/[-\s]/g,'').includes(qn)) return true;
  if((p.oem||[]).some(n=>n.toLowerCase().replace(/[-\s]/g,'').includes(qn))) return true;
  if((p.xref||[]).some(n=>n.toLowerCase().replace(/[-\s]/g,'').includes(qn))) return true;
  const d = deptOf(p.dept);
  if(d && (d.en.toLowerCase().includes(q) || d.ar.includes(q))) return true;
  return false;
}
function setShop(k,v){ S.shop[k]=v; render(); }
function toggleBrand(b){
  const i = S.shop.brands.indexOf(b);
  if(i<0) S.shop.brands.push(b); else S.shop.brands.splice(i,1);
  render();
}
function setTire(k,v){ S.tire[k]=v; render(); }
function tireFromVehicle(){
  const md = S.vehicle && modelOf(S.vehicle.mk, S.vehicle.md);
  if(!md){ openVehiclePicker(); return; }
  const m = md.tire.match(/(\d+)\/(\d+)R(\d+)/);
  if(m){ S.tire = { w:m[1], a:m[2], r:m[3] }; render();
    toast(T(`Filtered to ${md.tire}, the size your ${nm(md)} left the factory on`, `صُفّي على ${md.tire}، مقاس المصنع لـ ${nm(md)}`)); }
}

function viewShop(){
  const d = S.shop.dept ? deptOf(S.shop.dept) : null;
  const list = shopList();
  const pool = S.shop.dept ? byDept(S.shop.dept) : PRODUCTS;
  const brands = [...new Set(pool.map(p=>p.brand))];
  const hidden = S.vehicle && S.shop.fitOnly
    ? pool.filter(p=>fitOf(p)==='no').length : 0;
  return `<div class="wrap" style="padding-block:26px 20px">
    <nav class="row gap-s tiny" style="margin-bottom:16px">
      <a href="#/" class="muted">${T('Home','الرئيسية')}</a><span class="faint">/</span>
      <a href="#/shop" class="muted">${T('Parts','القطع')}</a>
      ${d?`<span class="faint">/</span><span style="color:var(--ink);font-weight:600">${nm(d)}</span>`:''}
    </nav>
    <div class="row-b wrap-f" style="margin-bottom:22px;gap:16px">
      <div>
        <h1 class="d2">${d?nm(d):(S.shop.q?T('Search','بحث'):T('All parts','كل القطع'))}</h1>
        <p class="lede" style="margin-top:8px;font-size:15.5px">${d?fx(d,'lede'):T('Everything in the sample catalogue, filtered to your vehicle when you set one.','كل ما في الكتالوج التجريبي، مُصفّى على سيارتك عند تحديدها.')}</p>
      </div>
      ${!S.vehicle?`<button class="btn btn-line" onclick="openVehiclePicker()">${ico('car')}${T('Set your vehicle','حدّد سيارتك')}</button>`:''}
    </div>
    ${S.shop.dept==='tires'?tireSizeBar():''}
    ${S.shop.dept==='batteries'?`<div class="mb-l">${batteryFinder(rankBatteries().slice(0,3))}</div>`:''}
    <div class="sp-shop">
      <details class="facets" id="facetBox"${window.innerWidth>=940?' open':''}>
        <summary>${T('Refine','تصفية')}<span class="row gap-s"><span class="tiny mono">${list.length}</span>${ico('chevD')}</span></summary>
        <div class="row-b" style="padding:12px 0;border-bottom:1px solid var(--rule-2)">
          <span class="eyebrow">${T('Refine','تصفية')}</span>
          ${(S.shop.brands.length||S.shop.sameDay)?`<button class="btn btn-sm btn-quiet" style="padding:2px 6px;font-size:12px" onclick="S.shop.brands=[];S.shop.sameDay=false;render()">${T('Clear','مسح')}</button>`:''}
        </div>
        ${S.vehicle?`<div class="facet">
          <p class="facet-t">${T('Fitment','المطابقة')}</p>
          <label class="opt"><input type="checkbox"${S.shop.fitOnly?' checked':''} onchange="setShop('fitOnly',this.checked)">
            <span>${T('Only parts that fit','القطع المناسبة فقط')}</span></label>
          <p class="tiny" style="margin-top:8px">${hidden?T(`${hidden} hidden because they do not fit your ${vehicleLabel(S.vehicle)}`,`${hidden} مخفية لأنها لا تناسب ${vehicleLabel(S.vehicle)}`):T('Nothing hidden in this department','لا شيء مخفي في هذا القسم')}</p>
        </div>`:''}
        <div class="facet">
          <p class="facet-t">${T('Brand','العلامة')}</p>
          ${brands.map(b=>`<label class="opt"><input type="checkbox"${S.shop.brands.includes(b)?' checked':''} onchange="toggleBrand('${b}')">
            <span>${esc(BRANDS[b])}</span><span class="n">${pool.filter(p=>p.brand===b).length}</span></label>`).join('')}
        </div>
        <div class="facet">
          <p class="facet-t">${T('Availability','التوفّر')}</p>
          <label class="opt"><input type="checkbox"${S.shop.sameDay?' checked':''} onchange="setShop('sameDay',this.checked)">
            <span>${T('Same day','نفس اليوم')}</span><span class="n">${pool.filter(p=>p.sameDay).length}</span></label>
        </div>
        <div class="facet">
          <p class="facet-t">${T('Departments','الأقسام')}</p>
          ${DEPTS.map(x=>`<a class="opt" href="#/shop/${x.id}" style="text-decoration:none;${S.shop.dept===x.id?'color:var(--ink);font-weight:600':''}">
            <span>${nm(x)}</span><span class="n">${byDept(x.id).length}</span></a>`).join('')}
        </div>
      </details>
      <div>
        <div class="toolbar">
          <p class="small"><b class="num">${list.length}</b> ${T('products','منتج')}${S.shop.q?` ${T('for','لـ')} “${esc(S.shop.q)}”`:''}</p>
          <div class="row" style="margin-inline-start:auto;gap:8px">
            <select class="sel" onchange="setShop('sort',this.value)">
              ${[['rel',T('Best fit first','الأنسب أولاً')],['low',T('Price low to high','السعر تصاعدي')],['high',T('Price high to low','السعر تنازلي')],['rated',T('Rating','التقييم')]]
                .map(o=>`<option value="${o[0]}"${S.shop.sort===o[0]?' selected':''}>${o[1]}</option>`).join('')}
            </select>
            <div class="seg">
              <button class="${S.shop.mode==='grid'?'on':''}" onclick="setShop('mode','grid')" aria-label="${T('Grid','شبكة')}">${ico('grid')}</button>
              <button class="${S.shop.mode==='rows'?'on':''}" onclick="setShop('mode','rows')" aria-label="${T('List','قائمة')}">${ico('rows')}</button>
            </div>
          </div>
        </div>
        <h2 class="sr">${T('Products','المنتجات')}</h2>
        ${list.length ? (S.shop.mode==='grid'
          ? `<div class="grid g3">${list.map(productCard).join('')}</div>`
          : `<div class="stack">${list.map(productRow).join('')}</div>`)
        : `<div class="panel center" style="padding:56px 24px">
            <div class="thumb" style="width:58px;height:58px;margin:0 auto 16px;opacity:.55">${art('check')}</div>
            <p class="d4">${T('Nothing here matches those filters','لا شيء يطابق هذه التصفية')}</p>
            <p class="small" style="margin-top:6px;max-width:44ch;margin-inline:auto">${T('This is a sample catalogue, so gaps are expected. In the real one a miss triggers a sourcing request instead of an empty page.','هذا كتالوج تجريبي، لذا الفجوات متوقعة. في الحقيقي يتحول عدم التوفر إلى طلب توريد بدل صفحة فارغة.')}</p>
            <div class="row" style="justify-content:center;margin-top:18px;gap:10px">
              <button class="btn btn-line" onclick="S.shop.brands=[];S.shop.sameDay=false;S.shop.fitOnly=false;S.tire={w:'',a:'',r:''};render()">${T('Clear filters','مسح التصفية')}</button>
              <a class="btn btn-primary" href="https://wa.me/96518002279" target="_blank" rel="noopener">${ico('wa')}${T('Ask us to source it','اطلب منا توفيرها')}</a>
            </div>
          </div>`}
      </div>
    </div>
  </div>`;
}
function productRow(p){
  return `<div class="prow">
    <a class="prow-art" href="#/p/${p.sku}">${artOf(p)}</a>
    <div style="min-width:0">
      <p class="pcard-brand">${esc(BRANDS[p.brand])} · <span class="mono">${p.sku}</span></p>
      <a href="#/p/${p.sku}"><p class="d4" style="font-size:15px;margin-top:4px">${esc(nm(p))}</p></a>
      <div class="row wrap-f gap-s" style="margin-top:8px">
        ${p.tire ? dotChip(p) : fitChip(p)}
        ${Object.entries(p.attrs||{}).slice(0,3).map(([k,v])=>`<span class="spec"><i>${esc(attrLabel(k))}</i> ${esc(attrValue(v))}</span>`).join('')}
      </div>
    </div>
    <div class="prow-r">
      <div class="end"><p class="price">${kwd(p.price)}${p.was?`<span class="price-was">${kwd(p.was)}</span>`:''}</p>
        ${p.install?`<p class="price-inst">${T('Fitted','بالتركيب')} ${kwd(p.price+p.install)}</p>`
          :fitsIncluded(p)?`<p class="price-inst">${T('Fitting included','التركيب مشمول')}</p>`:''}</div>
      <div class="row gap-s">
        <a class="btn btn-sm btn-line" href="#/p/${p.sku}">${T('Details','التفاصيل')}</a>
        <button class="btn btn-sm btn-dark" onclick="addToCart('${p.sku}',${fittable(p)})">${T('Add','أضف')}</button>
      </div>
    </div>
  </div>`;
}
function tireSizeBar(){
  const t = S.tire, all = byDept('tires').filter(p=>p.tire);
  const uniq = k => [...new Set(all.map(p=>String(p.tire[k])))].sort((a,b)=>a-b);
  const md = S.vehicle && modelOf(S.vehicle.mk, S.vehicle.md);
  return `<div class="panel mb-l" style="padding:18px 20px">
    <div class="row-b wrap-f" style="gap:16px">
      <div>
        <p class="eyebrow ac">${T('Read your sidewall','اقرأ جدار الإطار')}</p>
        <p class="small" style="margin-top:6px;max-width:46ch">${T('The size is moulded into the tire: 265/70R17 is 265 mm wide, a sidewall 70 percent of that, on a 17 inch rim.','المقاس مطبوع على الإطار: 265/70R17 يعني عرض 265 ملم، وجدار بنسبة 70 بالمئة منه، على جنط 17 بوصة.')}</p>
      </div>
      <div class="row wrap-f gap-s">
        ${[['w',T('Width','العرض')],['a',T('Profile','النسبة')],['r',T('Rim','الجنط')]].map(([k,label])=>
          `<label class="field" style="margin:0"><span>${label}</span>
            <select class="sel" style="height:42px;min-width:92px" onchange="setTire('${k}',this.value)">
              <option value="">${T('Any','الكل')}</option>
              ${uniq(k).map(x=>`<option${t[k]===x?' selected':''}>${x}</option>`).join('')}
            </select></label>`).join('')}
        <button class="btn btn-line" style="align-self:flex-end;height:42px" onclick="tireFromVehicle()">${ico('car')}${md?T(`Use ${md.tire}`,`استخدم ${md.tire}`):T('Use my vehicle','استخدم سيارتي')}</button>
        ${(t.w||t.a||t.r)?`<button class="btn btn-quiet" style="align-self:flex-end;height:42px" onclick="S.tire={w:'',a:'',r:''};render()">${T('Clear','مسح')}</button>`:''}
      </div>
    </div>
  </div>`;
}

/* ---- product ----------------------------------------------------------- */
let PD = { install:true, qty:1 };
function viewProduct(){
  const p = P(S.params.sku);
  if(!p) return notFound();
  const d = deptOf(p.dept), f = fitOf(p);
  const related = PRODUCTS.filter(x=>x.dept===p.dept && x.sku!==p.sku).slice(0,4);
  const zone = 'A';
  return `<div class="wrap" style="padding-block:26px 20px">
    <nav class="row gap-s tiny" style="margin-bottom:20px">
      <a href="#/" class="muted">${T('Home','الرئيسية')}</a><span class="faint">/</span>
      <a href="#/shop/${p.dept}" class="muted">${nm(d)}</a><span class="faint">/</span>
      <span class="mono" style="color:var(--ink)">${p.sku}</span>
    </nav>
    <div class="sp-pdp">
      <div>
        <div class="panel" style="background:var(--inset);aspect-ratio:1;display:grid;place-items:center;padding:12%">
          <div style="width:100%;color:var(--ink-1)">${artOf(p)}</div>
        </div>
        <p class="tiny center" style="margin-top:10px">${T('Parts are drawn, not photographed. Nothing here is a stock image of a different product.','القطع مرسومة وليست مصوّرة. لا توجد هنا صورة جاهزة لمنتج آخر.')}</p>
      </div>
      <div>
        <p class="pcard-brand">${esc(BRANDS[p.brand])}</p>
        <h1 class="d2" style="font-size:clamp(23px,2.6vw,31px);margin-top:8px">${esc(nm(p))}</h1>
        <div class="row wrap-f gap-s" style="margin-top:12px">
          ${stars(p.rating, p.reviews)}
          <span class="faint">·</span>
          <span class="tiny mono">${p.sku}</span>
          ${p.tire ? `<span class="faint">·</span>${dotChip(p)}` : ''}
        </div>
        ${p.tire ? `<p class="tiny" style="margin-top:8px">${T(`Made in ${p.attrs.dot}. We publish this before you pay because rubber ages whether the tire is driven or not, and the Gulf convention is to replace at five years from this date.`,`إنتاج ${p.attrs.dot}. ننشره قبل الدفع لأن المطاط يشيخ سواء استُخدم الإطار أو لا، والعرف الخليجي هو الاستبدال بعد خمس سنوات من هذا التاريخ.`)}</p>` : ''}

        ${f==='yes' ? `<div class="panel" style="margin-top:20px;padding:15px 17px;border-color:rgba(31,107,79,.35);background:var(--go-w)">
            <div class="row" style="gap:11px;align-items:flex-start">
              <span style="color:var(--go);width:19px;flex:none">${ico('check')}</span>
              <div><p style="font-weight:600;color:var(--go)">${T('Fits your','تناسب')} ${esc(vehicleLabel(S.vehicle,true))}</p>
              <p class="tiny" style="margin-top:4px">${T('If it does not, the return is free and we credit 2 KWD.','إذا لم تناسب، الإرجاع مجاني ونضيف رصيد 2 د.ك.')}</p></div>
            </div></div>`
        : f==='no' ? `<div class="panel" style="margin-top:20px;padding:15px 17px;border-color:rgba(154,40,32,.35);background:var(--stop-w)">
            <div class="row" style="gap:11px;align-items:flex-start">
              <span style="color:var(--stop);width:19px;flex:none">${ico('close')}</span>
              <div><p style="font-weight:600;color:var(--stop)">${T('Does not fit your','لا تناسب')} ${esc(vehicleLabel(S.vehicle,true))}</p>
              <p class="tiny" style="margin-top:4px">${T('You can still order it, and the line is tagged so a wrong fit shows up in our returns data rather than as your problem.','يمكنك طلبها، ويُوسم السطر ليظهر الخطأ في بيانات المرتجعات لدينا بدل أن يكون مشكلتك.')}</p>
              <a class="link" style="font-size:13px;display:inline-block;margin-top:8px" href="#/shop/${p.dept}">${T('Show what does fit','اعرض ما يناسب')}</a></div>
            </div></div>`
        : f==='universal' ? `<div class="panel" style="margin-top:20px;padding:13px 16px;background:var(--cool-w);border-color:rgba(40,80,94,.3)">
            <p class="small" style="color:var(--cool);font-weight:600">${ico('globe')} ${T('Not vehicle specific. This fits any car.','ليست خاصة بسيارة. تناسب أي سيارة.')}</p></div>`
        : `<button class="panel" style="margin-top:20px;padding:15px 17px;width:100%;text-align:start;cursor:pointer" onclick="openVehiclePicker()">
            <div class="row" style="gap:11px">
              <span style="color:var(--flame-1);width:19px;flex:none">${ico('car')}</span>
              <div class="grow"><p style="font-weight:600">${T('Set your vehicle to check this fits','حدّد سيارتك للتحقق من المطابقة')}</p>
              <p class="tiny" style="margin-top:3px">${T(`Listed for ${appCount(p)} vehicle ranges`,`مُدرجة لـ ${appCount(p)} نطاقات مركبات`)}</p></div>
              ${ico('chev','flip')}
            </div></button>`}

        <div class="row" style="margin-top:22px;align-items:flex-end;gap:14px">
          <div><p class="price" style="font-size:32px">${kwd(p.price)}<small style="font-size:13px">${T('KWD','د.ك')}</small></p>
            ${p.was?`<p class="tiny" style="margin-top:2px"><span class="price-was" style="margin:0">${kwd(p.was)}</span> <span style="color:var(--flame-1);font-weight:600">${T('save','وفّر')} ${kwd(p.was-p.price)}</span></p>`:''}</div>
        </div>

        ${fitsIncluded(p) ? `<div class="panel" style="margin-top:18px;padding:14px 16px;background:var(--go-w);border-color:rgba(31,107,79,.3)">
            <p class="small" style="color:var(--go);font-weight:600">${ico('check')} ${T('Fitting is included in this price','التركيب مشمول في هذا السعر')}</p>
            <p class="tiny" style="margin-top:4px">${T('House label, so there is no brand licence in the price to pay for the technician out of.','علامة خاصة، فلا توجد رسوم علامة في السعر ندفع منها أجر الفني.')}</p></div>`
        : p.install ? `<label class="radio" style="margin-top:18px;align-items:flex-start;padding:15px">
            <input type="checkbox" style="border-radius:3px;margin-top:2px"${PD.install?' checked':''} onchange="PD.install=this.checked;render()">
            <span class="grow"><span class="row-b"><span style="font-weight:600;font-size:14.5px">${T('Add fitting','أضف التركيب')}</span>
              <span class="num" style="color:var(--go)">+${kwd(p.install)}</span></span>
              <span class="small" style="display:block;margin-top:4px">${p.dept==='tires'
                ? T('At a partner centre: mounting, balancing, new valves and a TPMS reset.','في مركز شريك: تركيب وموازنة وصمامات جديدة وبرمجة الحساسات.')
                : T('Mobile technician at your location, with the old part taken away.','فني متنقل في موقعك، مع أخذ القطعة القديمة.')}</span></span>
          </label>` : ''}

        <div class="row" style="margin-top:18px;gap:10px">
          <div class="row" style="gap:0;border:1px solid var(--rule-2);border-radius:var(--r);overflow:hidden;flex:none">
            <button class="iconbtn" style="border-radius:0" onclick="PD.qty=Math.max(1,PD.qty-1);render()" aria-label="${T('Fewer','أقل')}">${ico('minus')}</button>
            <span class="num" style="width:32px;text-align:center">${PD.qty}</span>
            <button class="iconbtn" style="border-radius:0" onclick="PD.qty=Math.min(20,PD.qty+1);render()" aria-label="${T('More','أكثر')}">${ico('plus')}</button>
          </div>
          <button class="btn btn-primary btn-lg grow" onclick="addToCart('${p.sku}',${fittable(p)&&(fitsIncluded(p)||PD.install)},${PD.qty})">
            ${ico('cart')}${T('Add','أضف')} ${kwd(unitPrice(p, p.install&&PD.install)*PD.qty)} ${T('KWD','د.ك')}</button>
        </div>

        <div class="panel" style="margin-top:18px;padding:0">
          ${[[ico('truck'), p.sameDay ? T('Same day delivery','توصيل نفس اليوم') : T('Ordered in for you','يُطلب لك'),
              p.sameDay ? cutoffLine(zone) : T(`In stock with our supplier, ${p.lead}`,`متوفرة لدى المورد، ${p.lead}`)],
             [ico('shield'), T('Warranty','الضمان'), attrValue(p.attrs.warranty) || T('Manufacturer terms, passed through in full','شروط المصنّع كاملة')],
             [ico('refresh'), T('Returns','الإرجاع'), T('Seven days unopened. Electrical parts cannot come back once fitted.','سبعة أيام إذا لم تُفتح. القطع الكهربائية لا تُرجع بعد التركيب.')]]
            .map((r,i)=>`<div class="row" style="gap:12px;padding:13px 16px;${i?'border-top:1px solid var(--rule)':''};align-items:flex-start">
              <span style="width:17px;color:var(--ink-2);flex:none;margin-top:1px">${r[0]}</span>
              <span class="grow"><span style="font-size:13.5px;font-weight:600;display:block">${r[1]}</span>
              <span class="tiny" style="display:block;margin-top:2px">${r[2]}</span></span></div>`).join('')}
        </div>

        <div class="panel" style="margin-top:12px;padding:14px 16px;background:var(--inset)">
          <p class="small">${fx(p,'note')}</p>
        </div>
      </div>
    </div>

    <div class="sp-half" style="margin-top:clamp(32px,4vw,56px)">
      <div>
        <h2 class="d3" style="margin-bottom:14px">${T('Specification','المواصفات')}</h2>
        <dl class="dl">${Object.entries(p.attrs||{}).map(([k,v])=>
          `<dt>${esc(attrLabel(k))}</dt><dd>${esc(attrValue(v))}</dd>`).join('')}</dl>
        ${(p.oem&&p.oem.length)||(p.xref&&p.xref.length) ? `
          <h2 class="d3" style="margin:30px 0 14px">${T('Part numbers','أرقام القطعة')}</h2>
          <p class="small mb">${T('Search any of these in the box at the top. Dashes and spaces are ignored.','ابحث بأي منها في الأعلى. الشرطات والمسافات تُتجاهل.')}</p>
          ${p.oem.length?`<p class="eyebrow mb-s">${T('Original equipment','أرقام أصلية')}</p>
            <div class="row wrap-f gap-s mb">${p.oem.map(n=>`<span class="spec">${esc(n)}</span>`).join('')}</div>`:''}
          ${p.xref.length?`<p class="eyebrow mb-s">${T('Interchange','أرقام مكافئة')}</p>
            <div class="row wrap-f gap-s">${p.xref.map(n=>`<span class="spec">${esc(n)}</span>`).join('')}</div>`:''}
        `:''}
      </div>
      <div>
        <h2 class="d3" style="margin-bottom:14px">${p.universal?T('Fitment','المطابقة'):T('Listed for these vehicles','مُدرجة لهذه المركبات')}</h2>
        ${p.universal ? `<p class="small">${T('This product is not vehicle specific. Check the specification against your handbook where a grade or a size matters, for example an oil viscosity.','هذا المنتج غير خاص بمركبة. راجع المواصفة مع دليل سيارتك حيث تهم الدرجة أو المقاس، مثل لزوجة الزيت.')}</p>`
        : `<div class="tbl-wrap panel"><table class="tbl">
            <thead><tr><th>${T('Make','الماركة')}</th><th>${T('Model','الموديل')}</th><th>${T('Years','السنوات')}</th><th></th></tr></thead>
            <tbody>${(p.fits||[]).map(a=>{
              const on = S.vehicle && S.vehicle.mk===a.mk && S.vehicle.md===a.md && S.vehicle.year>=a.from && S.vehicle.year<=a.to;
              return `<tr${on?' style="background:var(--go-w)"':''}>
                <td>${nm(makeOf(a.mk))}</td><td>${nm(modelOf(a.mk,a.md))}</td>
                <td class="mono">${a.from} - ${a.to}</td>
                <td class="r">${on?`<span class="chip chip-go">${ico('check')}${T('Yours','سيارتك')}</span>`:''}</td></tr>`;
            }).join('')}</tbody></table></div>
          <p class="tiny" style="margin-top:10px">${T('Applications in this prototype are hand entered. In production this table comes from the fitment service and covers trim and engine, not only the model.','بيانات المطابقة في هذا النموذج مُدخلة يدوياً. في الإنتاج تأتي من خدمة المطابقة وتغطي الفئة والمحرك لا الموديل فقط.')}</p>`}
        <div class="panel" style="margin-top:22px;padding:16px;display:flex;gap:13px;align-items:flex-start">
          <span style="color:var(--go);width:20px;flex:none">${ico('wa')}</span>
          <div class="grow"><p style="font-weight:600;font-size:14px">${T('Not sure it is the right one?','غير متأكد أنها الصحيحة؟')}</p>
            <p class="tiny" style="margin-top:4px">${T('Send a photo of the old part or its number. A parts person answers in Arabic or English.','أرسل صورة القطعة القديمة أو رقمها. يرد عليك مختص بالعربية أو الإنجليزية.')}</p></div>
          <a class="btn btn-sm btn-line" href="https://wa.me/96518002279" target="_blank" rel="noopener">${T('Ask','اسأل')}</a>
        </div>
      </div>
    </div>

    ${related.length?`<section class="sec">
      <div class="sec-head"><h2 class="d3">${T('Also in','أيضاً في')} ${nm(d)}</h2>
        <a class="link-q" href="#/shop/${p.dept}">${T('See all','عرض الكل')}${ico('chev','flip')}</a></div>
      <div class="grid g4">${related.map(productCard).join('')}</div>
    </section>`:''}
  </div>`;
}

/* ---- services ---------------------------------------------------------- */
function viewService(){
  return `<div class="wrap" style="padding-block:30px">
    <div style="max-width:60ch">
      <p class="eyebrow ac">${T('Fitting and mobile service','التركيب والخدمة المتنقلة')}</p>
      <h1 class="d1" style="font-size:clamp(30px,4.4vw,50px);margin-top:12px">${T('We come to the car','نأتي إلى السيارة')}</h1>
      <p class="lede" style="margin-top:16px">${T('Every price below is fixed and includes the visit. The technician photographs the job before and after, and the record attaches to the vehicle in your garage.','كل سعر أدناه ثابت ويشمل الزيارة. يصوّر الفني العمل قبل وبعد، ويُرفق السجل بالمركبة في كراجك.')}</p>
    </div>
    <h2 class="d3" style="margin-top:38px;margin-bottom:18px">${T('Fixed price, including the visit','سعر ثابت شامل الزيارة')}</h2>
    <div class="grid g3">${SERVICES.map(serviceCard).join('')}</div>

    <section class="sec">
      <div class="sp-half">
        <div>
          <h2 class="d2">${T('How a visit runs','كيف تسير الزيارة')}</h2>
          <div class="steps" style="margin-top:20px">
            ${[[T('You pick a window','تختار فترة'), T('Evening slots between 16:00 and 22:00, because a bonnet in August sun is not a working environment.','فترات مسائية بين 4 و10 مساءً، لأن غطاء محرك تحت شمس أغسطس ليس بيئة عمل.')],
               [T('The van carries stock','الفان يحمل المخزون'), T('The common battery groups and the fast moving filters travel on the van, so most jobs finish on the first visit.','مقاسات البطاريات الشائعة والفلاتر سريعة الحركة تسافر مع الفان، فتنتهي أغلب الأعمال من الزيارة الأولى.')],
               [T('We test before we sell','نفحص قبل أن نبيع'), T('On any battery job the charging system is tested first. A battery that failed because the alternator is failing will fail again.','في أي عمل بطارية يُفحص نظام الشحن أولاً. البطارية التي تلفت بسبب دينمو ضعيف ستتلف مجدداً.')],
               [T('The old part leaves with us','القطعة القديمة تغادر معنا'), T('Batteries and oil go to a licensed handler. It is a regulatory requirement and it is where the core value sits.','البطاريات والزيوت تذهب لجهة مرخصة. متطلب تنظيمي وفيه قيمة القطعة المرتجعة.')]]
              .map(s=>`<div class="step"><div><p class="d4" style="font-size:15px">${s[0]}</p>
                <p class="small" style="margin-top:5px">${s[1]}</p></div></div>`).join('')}
          </div>
        </div>
        <div>
          <div class="ink-panel" style="padding:26px">
            <p class="eyebrow ac">${T('Stranded right now','متعطل الآن')}</p>
            <h2 class="d3" style="margin-top:10px">${T('Two hour battery rescue','إنقاذ بطارية خلال ساعتين')}</h2>
            <p style="margin-top:12px;font-size:14.5px">${T('If the car will not start, this is the one to book. The van brings a tester and the common group sizes, so you are not waiting on a second visit.','إذا لم تشتغل السيارة، احجز هذه. يحمل الفان جهاز فحص والمقاسات الشائعة، فلا تنتظر زيارة ثانية.')}</p>
            <div class="row wrap-f gap-s" style="margin-top:16px">
              <span class="spec" style="background:rgba(244,241,234,.1);color:var(--paper)"><i style="color:rgba(244,241,234,.55)">${T('Call out','رسوم الحضور')}</i> 3.500</span>
              <span class="spec" style="background:rgba(244,241,234,.1);color:var(--paper)"><i style="color:rgba(244,241,234,.55)">${T('Battery from','البطارية من')}</i> 24.900</span>
            </div>
            <div class="row wrap-f" style="margin-top:20px;gap:10px">
              <button class="btn btn-primary" onclick="openBooking('rescue')">${ico('van')}${T('Send a van','أرسل فاناً')}</button>
              <a class="btn btn-onink" href="tel:+96518002279">${ico('phone')}1800 2279</a>
            </div>
          </div>
          <div class="panel" style="margin-top:16px;padding:18px">
            <p class="d4" style="font-size:15px">${T('Partner workshops','ورش شريكة')}</p>
            <p class="small" style="margin-top:7px">${T('Tire fitting, alignment and anything needing a lift happens at a vetted partner in Shuwaikh, Al Rai, Hawalli or Fahaheel. Labour is a fixed matrix by service and vehicle class, published before you book.','تركيب الإطارات والترصيص وكل ما يحتاج رافعة يتم لدى شريك معتمد في الشويخ أو الري أو حولي أو الفحيحيل. الأجور جدول ثابت حسب الخدمة وفئة المركبة، ومنشور قبل الحجز.')}</p>
          </div>
        </div>
      </div>
    </section>
  </div>`;
}

/* ---- garage ------------------------------------------------------------ */
function gSet(id, k, v){
  const g = S.garage.find(x=>x.id===id); if(!g) return;
  g[k] = v === '' ? null : v; save(); render();
}
function gDrop(id){
  const g = S.garage.find(x=>x.id===id);
  S.garage = S.garage.filter(x=>x.id!==id);
  if(g && S.vehicle && g.mk===S.vehicle.mk && g.md===S.vehicle.md && g.year===S.vehicle.year) S.vehicle = null;
  save(); paintPlate(); render();
}
function gSample(id){
  const g = S.garage.find(x=>x.id===id); if(!g) return;
  const d = new Date(); d.setMonth(d.getMonth()-17);
  g.battFitted = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  g.odo = 96400; g.oilAt = 89100; g.plate = g.plate || '4 / 21873';
  save(); render();
  toast(T('Sample values filled in, so the reminders have something to compute from','مُلئت قيم تجريبية لتحسب منها التذكيرات'));
}
function dueChip(state, label){
  const map = { due:['chip-stop','alert'], soon:['chip-hold','clock'], ok:['chip-go','check'] };
  const [cls, icon] = map[state];
  return `<span class="chip ${cls}">${ico(icon)}${label}</span>`;
}
function viewGarage(){
  if(!S.garage.length) return `<div class="wrap" style="padding-block:40px">
    <div class="panel center" style="padding:64px 26px;max-width:560px;margin-inline:auto">
      <div class="thumb" style="width:74px;height:74px;margin:0 auto 20px">${art('check')}</div>
      <h1 class="d2">${T('Your garage is empty','كراجك فارغ')}</h1>
      <p class="lede" style="margin:12px auto 0;font-size:15.5px">${T('Add a car once. After that the catalogue filters to it, the fitment badges mean something, and the maintenance reminders have a date to count from.','أضف سيارة مرة واحدة. بعدها يُصفّى الكتالوج عليها، وتصبح شارات المطابقة ذات معنى، ويكون للتذكيرات تاريخ تُحسب منه.')}</p>
      <button class="btn btn-primary btn-lg" style="margin-top:24px" onclick="openVehiclePicker()">${ico('plus')}${T('Add a vehicle','أضف مركبة')}</button>
    </div></div>`;

  return `<div class="wrap" style="padding-block:30px">
    <div class="row-b wrap-f mb-l" style="gap:16px">
      <div>
        <p class="eyebrow ac">${T('My garage','كراجي')}</p>
        <h1 class="d1" style="font-size:clamp(28px,3.8vw,42px);margin-top:10px">${S.garage.length} ${S.garage.length===1?T('vehicle','مركبة'):T('vehicles','مركبات')}</h1>
      </div>
      <button class="btn btn-line" onclick="openVehiclePicker()">${ico('plus')}${T('Add a vehicle','أضف مركبة')}</button>
    </div>
    <div class="stack" style="--x:0">
      ${S.garage.map(g=>{
        const md = modelOf(g.mk, g.md);
        const active = S.vehicle && S.vehicle.mk===g.mk && S.vehicle.md===g.md && S.vehicle.year===g.year;
        const bAge = g.battFitted ? monthsSince(g.battFitted) : null;
        const bState = bAge==null ? null : bAge>=18 ? 'due' : bAge>=15 ? 'soon' : 'ok';
        const kmOil = (g.odo!=null && g.oilAt!=null) ? g.odo-g.oilAt : null;
        const oState = kmOil==null ? null : kmOil>=5000 ? 'due' : kmOil>=4000 ? 'soon' : 'ok';
        return `<article class="panel" style="${active?'border-color:var(--ink)':''}">
          <div class="sp-garage">
            <div class="gcard-art" style="padding:16px;border-inline-end:1px solid var(--rule);background:var(--inset)">
              ${carSvg(md.body,{label:vehicleLabel(g)})}
              <div class="center">
                ${active ? `<span class="chip chip-ink">${ico('check')}${T('Shopping for this car','التسوق لهذه السيارة')}</span>`
                         : `<button class="btn btn-sm btn-line" onclick='useVehicle(${JSON.stringify({year:g.year,mk:g.mk,md:g.md,eng:g.eng})})'>${T('Shop for this car','تسوّق لها')}</button>`}
              </div>
            </div>
            <div style="padding:20px">
              <div class="row-b wrap-f" style="gap:12px">
                <div>
                  <h2 class="d3">${esc(vehicleLabel(g))}</h2>
                  <p class="tiny" style="margin-top:5px">${g.eng?esc(g.eng)+' · ':''}${T('Battery group','مقاس البطارية')} <span class="mono">${md.batt}</span> · ${T('OE tire','إطار المصنع')} <span class="mono">${md.tire}</span></p>
                </div>
                <button class="iconbtn" onclick="gDrop('${g.id}')" aria-label="${T('Remove','حذف')}">${ico('trash')}</button>
              </div>

              <div class="grid g3" style="gap:12px;margin-top:18px">
                <label class="field" style="margin:0"><span>${T('Plate','رقم اللوحة')}</span>
                  <input class="inp mono" value="${esc(g.plate||'')}" placeholder="${T('optional','اختياري')}" onchange="gSet('${g.id}','plate',this.value)"></label>
                <label class="field" style="margin:0"><span>${T('Odometer, km','العداد، كم')}</span>
                  <input class="inp num" type="number" value="${g.odo??''}" placeholder="0" onchange="gSet('${g.id}','odo',this.value?Number(this.value):'')"></label>
                <label class="field" style="margin:0"><span>${T('Battery fitted','تركيب البطارية')}</span>
                  <input class="inp mono" type="month" value="${g.battFitted||''}" onchange="gSet('${g.id}','battFitted',this.value)"></label>
              </div>

              <p class="eyebrow" style="margin:6px 0 10px">${T('What this record says','ما يقوله هذا السجل')}</p>
              <div class="stack">
                <div class="row-b panel" style="padding:12px 14px;gap:12px;flex-wrap:wrap">
                  <div class="row" style="gap:11px"><span class="thumb" style="width:34px;height:34px">${art('battery')}</span>
                    <div><p style="font-size:13.5px;font-weight:600">${T('Battery','البطارية')}</p>
                    <p class="tiny">${bAge==null ? T('No fitting date recorded','لم يُسجّل تاريخ التركيب')
                      : T(`${bAge} months old. Common replacement here is 18 to 24.`,`عمرها ${bAge} شهراً. الاستبدال المعتاد هنا 18 إلى 24.`)}</p></div></div>
                  <div class="row gap-s">
                    ${bState ? dueChip(bState, bState==='due'?T('Test it','افحصها'):bState==='soon'?T('Watch it','راقبها'):T('Healthy','سليمة')) : ''}
                    <a class="btn btn-sm btn-line" href="#/shop/batteries">${T('Batteries','البطاريات')}</a>
                  </div>
                </div>
                <div class="row-b panel" style="padding:12px 14px;gap:12px;flex-wrap:wrap">
                  <div class="row" style="gap:11px"><span class="thumb" style="width:34px;height:34px">${art('oil')}</span>
                    <div><p style="font-size:13.5px;font-weight:600">${T('Oil and filter','الزيت والفلتر')}</p>
                    <p class="tiny">${kmOil==null ? T('Add the odometer reading at your last oil change','أضف قراءة العداد عند آخر تغيير زيت')
                      : T(`${kmOil.toLocaleString('en')} km since the last change. Severe duty interval is 5,000.`,`${kmOil.toLocaleString('en')} كم منذ آخر تغيير. فترة الخدمة الشاقة 5,000.`)}</p></div></div>
                  <div class="row gap-s">
                    ${oState ? dueChip(oState, oState==='due'?T('Due','مستحق'):oState==='soon'?T('Soon','قريباً'):T('Fine','جيد')) : ''}
                    <button class="btn btn-sm btn-line" onclick="openBooking('oil')">${T('Book a change','احجز تغييراً')}</button>
                  </div>
                </div>
                ${g.odo!=null && g.oilAt==null ? `<button class="btn btn-sm btn-quiet" style="justify-content:flex-start" onclick="gSet('${g.id}','oilAt',prompt('${T('Odometer at last oil change','العداد عند آخر تغيير زيت')}')||'')">${ico('plus')}${T('Record the last oil change reading','سجّل قراءة آخر تغيير زيت')}</button>` : ''}
              </div>

              ${(g.battFitted||g.odo)?'':`<p class="tiny" style="margin-top:14px">${T('Nothing is invented here. Until you record a date or a reading, the reminders say so.','لا شيء مُختلق هنا. حتى تسجّل تاريخاً أو قراءة، تقول التذكيرات ذلك.')}
                <button class="link" style="background:none;border:0;border-bottom:1px solid;padding:0;cursor:pointer;font-size:inherit" onclick="gSample('${g.id}')">${T('Fill sample values','املأ قيماً تجريبية')}</button></p>`}
            </div>
          </div>
        </article>`;
      }).join('')}
    </div>
    ${S.orders.length?`<section class="sec">
      <h2 class="d2 mb-l">${T('Orders placed in this session','الطلبات في هذه الجلسة')}</h2>
      <div class="stack">${S.orders.map(o=>`<a class="row-b panel" style="padding:15px 18px;gap:14px" href="#/order/${o.id}">
        <div><p class="mono" style="font-weight:600">${o.id}</p>
          <p class="tiny" style="margin-top:3px">${o.lines} ${T('lines','بنود')} · ${o.when}</p></div>
        <div class="row gap-s"><span class="price" style="font-size:15px">${kwd(o.total)}</span>${ico('chev','flip')}</div>
      </a>`).join('')}</div>
    </section>`:''}
  </div>`;
}

/* ---- guide ------------------------------------------------------------- */
function viewGuide(){
  const md = S.vehicle && modelOf(S.vehicle.mk, S.vehicle.md);
  const S2 = (en,ar)=>`<h2 class="d3" style="margin:34px 0 12px">${T(en,ar)}</h2>`;
  return `<article class="wrap wrap-n" style="padding-block:34px 20px">
    <nav class="row gap-s tiny mb"><a href="#/" class="muted">${T('Home','الرئيسية')}</a><span class="faint">/</span><span class="muted">${T('Guides','الأدلة')}</span></nav>
    <p class="eyebrow ac">${T('Buying guide','دليل شراء')}</p>
    <h1 class="d1" style="font-size:clamp(30px,4.4vw,50px);margin-top:12px">${fx(GUIDE,'title')}</h1>
    <p class="lede" style="margin-top:16px">${fx(GUIDE,'stand')}</p>
    <p class="tiny" style="margin-top:14px;padding-bottom:20px;border-bottom:1px solid var(--rule)">${fx(GUIDE,'updated')}</p>

    <p style="margin-top:24px">${T('Three things decide which battery goes in your car, and only one of them is negotiable. Get the first two right and the third is a budget question.','ثلاثة أمور تحدد البطارية المناسبة لسيارتك، واحد منها فقط قابل للنقاش. اضبط الأولين ويصبح الثالث مسألة ميزانية.')}</p>

    ${S2('1. The group size is not a preference','1. المقاس ليس تفضيلاً')}
    <p>${T('Group size describes the case: its footprint, its height, and which corner the positive terminal sits in. A battery from the wrong group either does not sit in the tray or puts the terminals where the cables cannot reach, and a cable stretched to fit is a fire risk. This is the one specification with no room in it.','المقاس يصف الصندوق: أبعاده وارتفاعه وموقع الطرف الموجب. البطارية من مقاس خاطئ إما لا تستقر في الحوض أو تضع الأطراف حيث لا تصلها الكيابل، والكيبل المشدود خطر حريق. هذه المواصفة الوحيدة بلا هامش.')}</p>
    ${md?`<div class="panel" style="padding:15px 17px;margin-top:14px;background:var(--go-w);border-color:rgba(31,107,79,.3)">
      <p class="small" style="color:var(--go);font-weight:600">${ico('check')} ${T(`Your ${nm(md)} takes group ${md.batt}. We have filtered the catalogue to it already.`,`${nm(md)} يأخذ المقاس ${md.batt}. صُفّي الكتالوج عليه بالفعل.`)}</p></div>`
    :`<div class="panel" style="padding:15px 17px;margin-top:14px">
      <div class="row-b wrap-f" style="gap:12px"><p class="small">${T('Set your car and we will name the group size instead of explaining it.','حدّد سيارتك وسنذكر المقاس بدل شرحه.')}</p>
      <button class="btn btn-sm btn-primary" onclick="openVehiclePicker()">${T('Set vehicle','حدّد السيارة')}</button></div></div>`}

    ${S2('2. Cold cranking amps, in a country with no cold','2. أمبير التشغيل البارد، في بلد بلا برد')}
    <p>${T('CCA measures the current a battery can deliver at minus 18 degrees, which is a number Kuwait will never see. It still matters, as a proxy: a higher CCA generally means more plate area and better tolerance of the abuse that heat inflicts. Match or exceed the figure in your handbook. Going far above it buys weight and cost, not life.','يقيس CCA التيار الذي تعطيه البطارية عند 18 تحت الصفر، وهي درجة لن تراها الكويت. ومع ذلك يظل مؤشراً مفيداً: القيمة الأعلى تعني عادة مساحة ألواح أكبر وتحملاً أفضل لما تفعله الحرارة. طابق الرقم في دليل سيارتك أو تجاوزه قليلاً. المبالغة تشتري وزناً وتكلفة لا عمراً.')}</p>

    ${S2('3. Flooded, EFB or AGM','3. سائلة أو EFB أو AGM')}
    <div class="tbl-wrap panel" style="margin-top:14px"><table class="tbl">
      <thead><tr><th>${T('Type','النوع')}</th><th>${T('What it is','ما هي')}</th><th>${T('Choose it when','اخترها إذا')}</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:600">${T('Flooded','سائلة')}</td><td>${T('Liquid electrolyte, the traditional design','إلكتروليت سائل، التصميم التقليدي')}</td><td>${T('The car is simple and you replace on schedule','السيارة بسيطة وتستبدل في الموعد')}</td></tr>
        <tr><td style="font-weight:600">EFB</td><td>${T('Flooded with reinforced plates','سائلة بألواح معززة')}</td><td>${T('A large engine driven every day','محرك كبير يُقاد يومياً')}</td></tr>
        <tr><td style="font-weight:600">AGM</td><td>${T('Electrolyte held in glass mat, sealed','إلكتروليت محبوس في ألياف زجاجية، مغلقة')}</td><td>${T('Stop start, heavy electrical load, or you keep cars long','نظام إيقاف وتشغيل أو حمل كهربائي عالٍ أو تبقي السيارة طويلاً')}</td></tr>
      </tbody></table></div>

    ${S2('The failure nobody expects','العطل الذي لا يتوقعه أحد')}
    <p>${T('A battery that dies twice in one year is usually not a battery problem. Either the charging system is not putting the charge back, or something is drawing current with the car switched off. Replacing the battery a second time treats the symptom. That is why the van tests the alternator before it sells you anything, and why the guided check asks what happens when you turn the key rather than jumping to a product.','البطارية التي تتلف مرتين في سنة ليست مشكلة بطارية عادة. إما أن نظام الشحن لا يعيد الشحن، أو هناك ما يسحب تياراً والسيارة مطفأة. استبدالها مرة ثانية يعالج العرض. لهذا يفحص الفان الدينمو قبل أن يبيعك شيئاً، ولهذا يسأل الفحص الموجّه عما يحدث عند إدارة المفتاح بدل القفز إلى منتج.')}</p>
    <div class="row wrap-f" style="margin-top:22px;gap:10px">
      <button class="btn btn-line" onclick="openDiagnose('nostart')">${ico('pulse')}${T('Run the no start check','شغّل فحص عدم التشغيل')}</button>
      <a class="btn btn-primary" href="#/shop/batteries">${T('See batteries','اعرض البطاريات')}${ico('chev','flip')}</a>
    </div>
    <p class="tiny" style="margin-top:34px;padding-top:18px;border-top:1px solid var(--rule)">${T('Written for this prototype to show the shape of the content engine: one guide per category, bilingual, with the product rail and the guided check wired into it. Always check the figures in your own handbook before buying.','كُتب لهذا النموذج لعرض شكل محرك المحتوى: دليل لكل فئة، بلغتين، مع ربط المنتجات والفحص الموجّه به. راجع دائماً الأرقام في دليل سيارتك قبل الشراء.')}</p>
  </article>`;
}
function notFound(){
  return `<div class="wrap center" style="padding-block:90px">
    <p class="eyebrow ac">404</p>
    <h1 class="d2" style="margin-top:10px">${T('That page is not here','هذه الصفحة غير موجودة')}</h1>
    <a class="btn btn-line" style="margin-top:20px" href="#/">${T('Back to the start','العودة للبداية')}</a></div>`;
}

/* ---- CarZone Pro (B2B) -------------------------------------------------- */
function proPrice(p){ return p.price * (1 - PRO_DISCOUNT[PRO_ACCOUNT.tier]); }
function proParse(){
  const raw = (document.getElementById('qop')||{}).value || '';
  const nums = raw.split(/[\s,;\n\t]+/).map(s=>s.trim()).filter(Boolean);
  const seen = new Set();
  S.pro.matched = nums.map(n=>{
    const norm = n.toUpperCase().replace(/[-\s.]/g,'');
    const p = PRODUCTS.find(x =>
      x.sku.toUpperCase().replace(/[-\s.]/g,'') === norm ||
      (x.oem||[]).some(o=>o.toUpperCase().replace(/[-\s.]/g,'')===norm) ||
      (x.xref||[]).some(o=>o.toUpperCase().replace(/[-\s.]/g,'')===norm));
    const dup = p && seen.has(p.sku); if(p) seen.add(p.sku);
    return { input:n, p, dup };
  });
  render();
}
function proAdd(sku){
  const line = S.pro.draft.find(l=>l.sku===sku);
  if(line) line.qty++; else S.pro.draft.push({ sku, qty:1 });
  render();
}
function proQty(sku, d){
  const l = S.pro.draft.find(x=>x.sku===sku); if(!l) return;
  l.qty += d; if(l.qty<1) S.pro.draft = S.pro.draft.filter(x=>x.sku!==sku);
  render();
}
function proTotal(){ return S.pro.draft.reduce((s,l)=>s + proPrice(P(l.sku))*l.qty, 0); }
function proSubmit(){
  if(!S.pro.draft.length) return;
  const total = proTotal(), lines = S.pro.draft.length;
  const next = cutoff('A').open ? T('the 16:00 run','جولة 4 م') : T('the 10:00 run tomorrow','جولة 10 ص غداً');
  S.pro.submitted.unshift({ ref:'PO-'+Math.floor(4400+Math.random()*600), lines, total, run:next });
  S.pro.draft = []; S.pro.matched = null; render();
  toast(T(`Order submitted, loading for ${next}`, `أُرسل الطلب، يُحمّل لـ ${next}`));
}
function viewPro(){
  const a = PRO_ACCOUNT;
  const open = a.invoices.filter(i=>i.state!=='paid').reduce((s,i)=>s+i.amt, 0)
             + S.pro.submitted.reduce((s,o)=>s+o.total, 0);
  const used = Math.min(open, a.limit), pct = used/a.limit*100;
  const fast = ['VAR-H7-EFB','ACD-H6-STD','TOY-90915-YZZD4','MOB-5W30-4L','TEX-2478-FR','NGK-IRIDIUM-4S','BOS-WIP-26-22','DEN-CAB-4522'];
  return `<div class="wrap" style="padding-block:26px">
    <div class="ink-panel" style="padding:24px 26px">
      <div class="row-b wrap-f" style="gap:20px">
        <div>
          <p class="eyebrow ac">${T('CarZone Pro','كارزون برو')} · ${T('trade account','حساب تجاري')}</p>
          <h1 class="d2" style="margin-top:9px">${fx(a,'name')}</h1>
          <div class="row wrap-f gap-s" style="margin-top:12px">
            <span class="spec" style="background:rgba(244,241,234,.1);color:var(--paper)"><i style="color:rgba(244,241,234,.55)">${T('Tier','الشريحة')}</i> ${a.tier}</span>
            <span class="spec" style="background:rgba(244,241,234,.1);color:var(--paper)"><i style="color:rgba(244,241,234,.55)">${T('Terms','الشروط')}</i> ${a.terms}</span>
            <span class="spec" style="background:rgba(244,241,234,.1);color:var(--paper)"><i style="color:rgba(244,241,234,.55)">${T('District','المنطقة')}</i> ${a.district}</span>
          </div>
        </div>
        <div style="min-width:250px">
          <div class="row-b" style="font-size:13px"><span style="color:rgba(244,241,234,.6)">${T('Credit used','الائتمان المستخدم')}</span>
            <span class="num" style="color:var(--paper)">${kwd(used)} / ${kwd(a.limit)}</span></div>
          <div class="meter ${pct>80?'stop':pct>55?'hold':'go'}" style="margin-top:8px;background:rgba(244,241,234,.14)"><i style="width:${pct.toFixed(1)}%"></i></div>
          <p class="tiny" style="color:rgba(244,241,234,.55);margin-top:7px">${T(`${kwd(a.limit-used)} available. Orders are held above the limit, not refused at the door.`,`${kwd(a.limit-used)} متاح. الطلبات فوق الحد تُعلّق ولا تُرفض عند الباب.`)}</p>
        </div>
      </div>
      <div class="row wrap-f gap-s" style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(244,241,234,.14)">
        ${a.users.map((u,i)=>`<span class="chip" style="background:rgba(244,241,234,.08);color:rgba(244,241,234,.8);border-color:rgba(244,241,234,.16)">
          ${ico('user')}${nm(u)} <span style="opacity:.6">${fx(u,'role')}</span></span>`).join('')}
      </div>
    </div>

    <div class="sp-pro" style="margin-top:22px">
      <section class="panel">
        <div class="panel-h">
          <div><h2 class="d4">${T('Quick order pad','لوحة الطلب السريع')}</h2>
            <p class="tiny" style="margin-top:4px">${T('Paste part numbers from a job card. OEM numbers, interchange numbers and our SKUs all resolve.','ألصق أرقام القطع من بطاقة العمل. الأرقام الأصلية والمكافئة وأرقامنا كلها تُطابَق.')}</p></div>
        </div>
        <div style="padding:18px 20px">
          <textarea class="inp mono" id="qop" rows="5" style="font-size:13px;line-height:1.7"
            placeholder="90915-YZZD4&#10;04465-06200&#10;H7-EFB">90915-YZZD4
04465-06200
H7-EFB
IFR6T11
88320-06390</textarea>
          <div class="row" style="margin-top:12px;gap:10px">
            <button class="btn btn-dark" onclick="proParse()">${ico('scan')}${T('Match and price','طابق وسعّر')}</button>
            <p class="tiny grow">${T('Nothing is added until you say so.','لا يُضاف شيء حتى تختار ذلك.')}</p>
          </div>
          ${S.pro.matched ? `<div class="stack" style="margin-top:16px">
            ${S.pro.matched.map(m=>{
              if(!m.p) return `<div class="row panel" style="padding:11px 13px;gap:11px;border-color:rgba(154,40,32,.3);background:var(--stop-w)">
                <span style="color:var(--stop);width:16px;flex:none">${ico('close')}</span>
                <span class="grow"><span class="mono" style="font-weight:600">${esc(m.input)}</span>
                <span class="tiny" style="display:block">${T('No match in the sample catalogue. In production this raises a sourcing request.','لا مطابقة في الكتالوج التجريبي. في الإنتاج يفتح هذا طلب توريد.')}</span></span></div>`;
              const inDraft = S.pro.draft.find(l=>l.sku===m.p.sku);
              return `<div class="row panel" style="padding:11px 13px;gap:11px">
                <span style="color:var(--go);width:16px;flex:none">${ico('check')}</span>
                <span class="grow" style="min-width:0">
                  <span class="mono tiny" style="display:block">${esc(m.input)} → ${m.p.sku}</span>
                  <span style="font-size:13.5px;font-weight:600;display:block;margin-top:2px">${esc(m.p.en)}</span></span>
                <span class="end" style="flex:none">
                  <span class="num" style="font-weight:600;display:block">${kwd(proPrice(m.p))}</span>
                  <span class="tiny" style="display:block"><s>${kwd(m.p.price)}</s> ${a.tier}</span></span>
                <button class="btn btn-sm ${inDraft?'btn-line':'btn-dark'}" style="flex:none" onclick="proAdd('${m.p.sku}')">${inDraft?`${T('Added','مضاف')} ${inDraft.qty}`:T('Add','أضف')}</button>
              </div>`;
            }).join('')}
          </div>` : ''}
        </div>
      </section>

      <section class="panel">
        <div class="panel-h"><h2 class="d4">${T('Draft order','مسودة الطلب')}</h2>
          ${S.pro.draft.length?`<span class="chip chip-line">${S.pro.draft.length} ${T('lines','بنود')}</span>`:''}</div>
        <div style="padding:16px 18px">
          ${S.pro.draft.length ? `<div class="stack">
            ${S.pro.draft.map(l=>{ const p=P(l.sku); return `<div class="row" style="gap:10px">
              <span class="grow" style="min-width:0"><span style="font-size:13px;font-weight:600;display:block" class="trunc">${esc(p.en)}</span>
                <span class="mono tiny">${p.sku}</span></span>
              <span class="row" style="gap:0;border:1px solid var(--rule-2);border-radius:var(--r);overflow:hidden;flex:none">
                <button class="iconbtn" style="width:26px;height:26px;border-radius:0" onclick="proQty('${l.sku}',-1)">${ico('minus')}</button>
                <span class="num" style="width:24px;text-align:center;font-size:12.5px">${l.qty}</span>
                <button class="iconbtn" style="width:26px;height:26px;border-radius:0" onclick="proQty('${l.sku}',1)">${ico('plus')}</button></span>
              <span class="num" style="flex:none;font-size:13px;width:58px;text-align:end">${kwd(proPrice(p)*l.qty)}</span>
            </div>`; }).join('')}
            </div>
            <div class="row-b" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--rule)">
              <span style="font-weight:600">${T('Net total','الإجمالي الصافي')}</span><span class="price">${kwd(proTotal())}</span></div>
            <p class="tiny" style="margin-top:6px">${T(`Saved ${kwd(S.pro.draft.reduce((s,l)=>s+(P(l.sku).price-proPrice(P(l.sku)))*l.qty,0))} against retail at ${a.tier}`,`وفّرت ${kwd(S.pro.draft.reduce((s,l)=>s+(P(l.sku).price-proPrice(P(l.sku)))*l.qty,0))} مقابل التجزئة بشريحة ${a.tier}`)}</p>
            <button class="btn btn-primary btn-block" style="margin-top:14px" onclick="proSubmit()">${T('Submit on account','أرسل على الحساب')}</button>`
          : `<p class="small">${T('Match some part numbers and they land here. Nothing is charged until the run leaves the warehouse.','طابق بعض أرقام القطع لتظهر هنا. لا يُحتسب شيء حتى تغادر الجولة المستودع.')}</p>`}
        </div>
      </section>
    </div>

    <div class="sp-pro sp-pro-even" style="margin-top:22px">
      <section class="panel">
        <div class="panel-h"><h2 class="d4">${T('Delivery runs','جولات التوصيل')}</h2>
          <span class="chip chip-go">${ico('clock')}${T('90 min on fast movers','90 دقيقة للقطع السريعة')}</span></div>
        <div class="tbl-wrap"><table class="tbl">
          <tbody>${a.runs.map(r=>`<tr><td style="font-weight:600">${fx(r,'area')}</td><td class="r">${r.times}</td></tr>`).join('')}
          ${S.pro.submitted.map(o=>`<tr style="background:var(--go-w)">
            <td><span class="mono" style="font-weight:600">${o.ref}</span> <span class="tiny">${o.lines} ${T('lines','بنود')}</span></td>
            <td class="r">${o.run}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>
      <section class="panel">
        <div class="panel-h"><h2 class="d4">${T('Statement','كشف الحساب')}</h2>
          <button class="btn btn-sm btn-line" onclick="toast('${T('A prototype settles nothing. This is where the KNET redirect goes.','النموذج لا يسدد شيئاً. هنا يذهب تحويل كي نت.')}')">${T('Settle by KNET','السداد عبر كي نت')}</button></div>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>${T('Invoice','الفاتورة')}</th><th>${T('Due','الاستحقاق')}</th><th class="r">${T('Amount','المبلغ')}</th></tr></thead>
          <tbody>${a.invoices.map(i=>`<tr>
            <td><span class="mono">${i.no}</span><br><span class="tiny">${i.placed}</span></td>
            <td>${i.due}<br>${i.state==='overdue'?`<span class="chip chip-stop" style="margin-top:3px">${ico('alert')}${T('Overdue','متأخرة')}</span>`
              :i.state==='open'?`<span class="chip chip-hold" style="margin-top:3px">${ico('clock')}${T('Open','مفتوحة')}</span>`
              :`<span class="chip chip-go" style="margin-top:3px">${ico('check')}${T('Paid','مدفوعة')}</span>`}</td>
            <td class="r">${kwd(i.amt)}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>
    </div>

    <section class="sec">
      <div class="sec-head"><div><h2 class="d3">${T('Fast movers at your tier','القطع السريعة بسعرك')}</h2>
        <p class="small" style="margin-top:6px">${T('Held in depth and flagged for the 90 minute promise.','مخزون عميق ومعلّمة لوعد التسعين دقيقة.')}</p></div></div>
      <div class="grid g4">${fast.map(sku=>{ const p=P(sku); if(!p) return ''; return `
        <div class="panel" style="padding:14px">
          <div class="row" style="gap:11px"><span class="thumb" style="width:44px;height:44px">${art(p.art)}</span>
            <span class="grow" style="min-width:0"><span class="pcard-brand" style="display:block">${esc(BRANDS[p.brand])}</span>
            <span style="font-size:13px;font-weight:600;line-height:1.3;display:block;margin-top:3px" class="clamp2">${esc(p.en)}</span></span></div>
          <div class="row-b" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--rule)">
            <span><span class="num" style="font-weight:600">${kwd(proPrice(p))}</span>
              <span class="tiny" style="display:block"><s>${kwd(p.price)}</s> ${T('retail','تجزئة')}</span></span>
            <button class="addbtn" style="width:30px;height:30px" onclick="proAdd('${p.sku}')" aria-label="${T('Add','أضف')}">${ico('plus')}</button></div>
        </div>`; }).join('')}</div>
    </section>

    <p class="tiny">${T('A demonstration account. Credit limit, invoices and run times are sample records, and no real trade terms are represented here.','حساب للعرض. الحد الائتماني والفواتير وأوقات الجولات سجلات تجريبية، ولا تمثل شروطاً تجارية حقيقية.')}</p>
  </div>`;
}

/* ---- checkout ---------------------------------------------------------- */
const CO = { name:'', phone:'', gov:'capital', area:'', block:'', street:'', bldg:'', floor:'', slot:'', pay:'knet', err:{} };
function coSet(k,v){ CO[k]=v; if(CO.err[k]){ delete CO.err[k]; render(); } }
function coValidate(){
  const e = {};
  if(!CO.name.trim()) e.name = T('We need a name for the delivery','نحتاج اسماً للتوصيل');
  if(!/^(\+?965)?[\s-]?[569]\d{7}$/.test(CO.phone.replace(/\s/g,''))) e.phone = T('An eight digit Kuwait mobile, starting 5, 6 or 9','رقم كويتي من ثماني خانات يبدأ بـ 5 أو 6 أو 9');
  if(!CO.area) e.area = T('Pick an area','اختر منطقة');
  if(!CO.block.trim()) e.block = T('Block','القطعة');
  if(!CO.street.trim()) e.street = T('Street','الشارع');
  if(!CO.bldg.trim()) e.bldg = T('Building or house','المبنى أو المنزل');
  if(!CO.slot) e.slot = T('Choose a delivery window','اختر فترة توصيل');
  CO.err = e;
  return !Object.keys(e).length;
}
function placeOrder(){
  if(!coValidate()){
    render();
    const first = document.querySelector('.inp.bad, [data-slot-err]');
    if(first) first.scrollIntoView({ block:'center', behavior:'smooth' });
    return;
  }
  const id = 'CZ-' + String(Math.floor(10000 + Math.random()*89999));
  const gov = GOVERNORATES.find(g=>g.id===CO.gov);
  S.orders.unshift({
    id, when: dateLabel(new Date()), lines: S.cart.length,
    total: cartTotal(CO.pay), pay: CO.pay, slot: CO.slot,
    where: `${CO.area}, ${T('Block','قطعة')} ${CO.block}, ${T('Street','شارع')} ${CO.street}, ${CO.bldg}`,
    gov: nm(gov),
    items: S.cart.map(l=>({ sku:l.sku, qty:l.qty, install:l.install, price:unitPrice(P(l.sku), l.install) }))
  });
  S.cart = []; save(); syncCart();
  go('#/order/'+id);
}
function viewCheckout(){
  if(!S.cart.length) return `<div class="wrap center" style="padding-block:80px">
    <h1 class="d2">${T('The cart is empty','السلة فارغة')}</h1>
    <a class="btn btn-primary" style="margin-top:20px" href="#/shop">${T('Browse parts','تصفّح القطع')}</a></div>`;
  const gov = GOVERNORATES.find(g=>g.id===CO.gov);
  const areas = S.lang==='ar' ? gov.areas_ar : gov.areas_en;
  const sub = cartSub(), del = deliveryFee(), codBlocked = sub > COD_CAP;
  const zone = gov.zone;
  const slots = (()=>{ const now=new Date(), out=[]; const c = cutoff(zone);
    for(let d=0; d<3; d++){
      const day = new Date(now); day.setDate(now.getDate()+d);
      [[16,18],[18,20],[20,22]].forEach(([a,b])=>{
        if(d===0 && !c.open) return;
        if(d===0 && now.getHours() >= a-2) return;
        out.push({ id:`${d}-${a}`, label:d===0?T('Today','اليوم'):d===1?T('Tomorrow','غداً'):dateLabel(day), win:`${a}:00 - ${b}:00` });
      });
    } return out.slice(0,6); })();
  const field = (k, label, ph, wide) => `<label class="field"${wide?' style="grid-column:1/-1"':''}>
      <span>${label}</span>
      <input class="inp${CO.err[k]?' bad':''}" value="${esc(CO[k])}" placeholder="${esc(ph||'')}" oninput="CO.${k}=this.value" onblur="coSet('${k}',this.value)">
      ${CO.err[k]?`<span class="err">${ico('alert')}${CO.err[k]}</span>`:''}</label>`;

  return `<div class="wrap" style="padding-block:26px">
    <nav class="row gap-s tiny mb-l"><a href="#/shop" class="muted">${T('Parts','القطع')}</a><span class="faint">/</span><span style="color:var(--ink);font-weight:600">${T('Checkout','إتمام الطلب')}</span></nav>
    <div class="sp-check">
      <div>
        <h1 class="d2 mb-l">${T('Checkout','إتمام الطلب')}</h1>

        <section class="panel mb">
          <div class="panel-h"><h2 class="d4">1. ${T('Who receives it','من يستلم')}</h2></div>
          <div style="padding:20px">
            <div class="grid g2" style="gap:0 14px">
              ${field('name', T('Full name','الاسم الكامل'), T('Name','الاسم'))}
              <label class="field"><span>${T('Mobile','الجوال')}</span>
                <input class="inp mono${CO.err.phone?' bad':''}" dir="ltr" value="${esc(CO.phone)}" placeholder="9912 3456" oninput="CO.phone=this.value" onblur="coSet('phone',this.value)">
                ${CO.err.phone?`<span class="err">${ico('alert')}${CO.err.phone}</span>`:''}</label>
            </div>
            <p class="tiny">${T('The phone number is the account. Kuwait shops by phone, not by email, so a one time code verifies it and there is no password to forget.','رقم الهاتف هو الحساب. الكويت تتسوق بالهاتف لا بالبريد، فيتم التحقق برمز لمرة واحدة ولا توجد كلمة مرور تُنسى.')}</p>
          </div>
        </section>

        <section class="panel mb">
          <div class="panel-h"><h2 class="d4">2. ${T('Where','أين')}</h2>
            <span class="chip chip-line">${T('Zone','النطاق')} ${zone}</span></div>
          <div style="padding:20px">
            <div class="grid g2" style="gap:0 14px">
              <label class="field"><span>${T('Governorate','المحافظة')}</span>
                <select class="inp" onchange="CO.gov=this.value;CO.area='';render()">
                  ${GOVERNORATES.map(g=>`<option value="${g.id}"${CO.gov===g.id?' selected':''}>${nm(g)}</option>`).join('')}
                </select></label>
              <label class="field"><span>${T('Area','المنطقة')}</span>
                <select class="inp${CO.err.area?' bad':''}" onchange="coSet('area',this.value)">
                  <option value="">${T('Select','اختر')}</option>
                  ${areas.map(a=>`<option${CO.area===a?' selected':''}>${esc(a)}</option>`).join('')}
                </select>
                ${CO.err.area?`<span class="err">${ico('alert')}${CO.err.area}</span>`:''}</label>
            </div>
            <div class="grid g4" style="gap:0 14px">
              ${field('block', T('Block','قطعة'), '4')}
              ${field('street', T('Street','شارع'), '15')}
              ${field('bldg', T('Building','مبنى'), '23')}
              ${field('floor', T('Floor, flat','الدور والشقة'), T('optional','اختياري'))}
            </div>
            <button class="btn btn-sm btn-line" onclick="toast('${T('A prototype drops no pin. The real form opens a map here.','النموذج لا يضع دبوساً. النموذج الحقيقي يفتح خريطة هنا.')}')">${ico('pin')}${T('Drop a map pin','ضع دبوس خريطة')}</button>
            <p class="tiny" style="margin-top:12px">${T('Kuwait addresses run governorate, area, block, street, building. There is no postcode, so the block and street are what the driver actually uses.','العنوان الكويتي: محافظة ثم منطقة ثم قطعة ثم شارع ثم مبنى. لا يوجد رمز بريدي، فالقطعة والشارع هما ما يستخدمه السائق فعلاً.')}</p>
          </div>
        </section>

        <section class="panel mb"${CO.err.slot?' data-slot-err':''}>
          <div class="panel-h"><h2 class="d4">3. ${T('When','متى')}</h2>
            <span class="tiny">${cutoffLine(zone)}</span></div>
          <div style="padding:20px">
            <div class="grid g3" style="gap:10px">
              ${slots.map(s=>`<button class="panel" style="padding:12px 8px;text-align:center;cursor:pointer;${CO.slot===s.label+' '+s.win?'border-color:var(--ink);background:var(--inset)':''}"
                onclick="coSet('slot','${s.label} ${s.win}')">
                <p class="tiny" style="font-weight:600;color:var(--ink)">${s.label}</p>
                <p class="mono" style="font-size:11.5px;margin-top:3px">${s.win}</p></button>`).join('')}
            </div>
            ${CO.err.slot?`<p class="err" style="margin-top:10px">${ico('alert')}${CO.err.slot}</p>`:''}
            <p class="tiny" style="margin-top:12px">${T('Evening windows only through summer. A battery swap on a driveway at two in the afternoon is bad for the technician and bad for the work.','فترات مسائية فقط طوال الصيف. تبديل بطارية في ممر البيت عند الثانية ظهراً سيئ للفني وسيئ للعمل.')}</p>
          </div>
        </section>

        <section class="panel">
          <div class="panel-h"><h2 class="d4">4. ${T('Payment','الدفع')}</h2></div>
          <div style="padding:20px">
            <div class="stack">
              ${[['knet','KNET', T('Debit card redirect. Around eight in ten online payments in Kuwait.','تحويل لبطاقة الخصم. نحو ثمانية من كل عشرة مدفوعات إلكترونية في الكويت.'), false],
                 ['card', T('Visa or Mastercard','فيزا أو ماستركارد'), T('3-D Secure with a one time code.','تحقق ثلاثي الأبعاد برمز لمرة واحدة.'), false],
                 ['apple', T('Apple Pay','أبل باي'), T('On a supported device and browser.','على جهاز ومتصفح مدعومين.'), false],
                 ['cod', T('Cash on delivery','الدفع عند الاستلام'), codBlocked
                    ? T(`Not available above ${COD_CAP} KWD.`,`غير متاح فوق ${COD_CAP} د.ك.`)
                    : T(`Adds a ${kwd(COD_FEE)} KWD handling fee.`,`يضيف رسم مناولة ${kwd(COD_FEE)} د.ك.`), codBlocked]]
                .map(([id,label,note,dis])=>`<label class="radio"${dis?' style="opacity:.5;cursor:not-allowed"':''}>
                  <input type="radio" name="pay"${CO.pay===id?' checked':''}${dis?' disabled':''} onchange="CO.pay='${id}';render()">
                  <span class="grow"><span style="font-weight:600;font-size:14px;display:block">${label}</span>
                  <span class="tiny" style="display:block;margin-top:2px">${note}</span></span></label>`).join('')}
            </div>
            <p class="tiny" style="margin-top:14px">${T('Card details never reach us. The gateway is a licensed payment service provider and we hold only the token.','بيانات البطاقة لا تصلنا. البوابة مزود خدمة دفع مرخص ونحتفظ بالرمز فقط.')}</p>
          </div>
        </section>
      </div>

      <aside style="position:sticky;top:calc(var(--head-h) + 14px)">
        <div class="panel">
          <div class="panel-h"><h2 class="d4">${T('Order','الطلب')}</h2><span class="tiny">${cartCount()} ${T('items','قطعة')}</span></div>
          <div style="padding:16px 18px;max-height:290px;overflow-y:auto">
            ${S.cart.map((l,i)=>{ const p=P(l.sku); return `<div class="row" style="gap:11px;padding-block:9px;${i?'border-top:1px solid var(--rule)':''}">
              <span class="thumb" style="width:42px;height:42px">${art(p.art)}</span>
              <span class="grow" style="min-width:0"><span style="font-size:13px;font-weight:600;line-height:1.3;display:block" class="clamp2">${esc(nm(p))}</span>
                <span class="tiny" style="display:block;margin-top:2px">${T('Qty','الكمية')} ${l.qty}${l.install?` · <span style="color:var(--go)">${T('fitted','بالتركيب')}</span>`:''}</span></span>
              <span class="num" style="flex:none;font-size:13px">${kwd(unitPrice(p,l.install)*l.qty)}</span></div>`; }).join('')}
          </div>
          <div style="padding:16px 18px;border-top:1px solid var(--rule)">
            <div class="row-b small"><span>${T('Subtotal','المجموع')}</span><span class="num">${kwd(sub)}</span></div>
            <div class="row-b small" style="margin-top:6px"><span>${T('Delivery','التوصيل')}</span>
              <span class="${del?'num':''}" style="${del?'':'color:var(--go);font-weight:600'}">${del?kwd(del):T('Free','مجاني')}</span></div>
            ${CO.pay==='cod'?`<div class="row-b small" style="margin-top:6px"><span>${T('Cash handling','رسم الدفع نقداً')}</span><span class="num">${kwd(COD_FEE)}</span></div>`:''}
            <div class="row-b" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--rule)">
              <span class="d4">${T('Total','الإجمالي')}</span><span class="price" style="font-size:22px">${kwd(cartTotal(CO.pay))}</span></div>
            <button class="btn btn-primary btn-block btn-lg" style="margin-top:16px" onclick="placeOrder()">${ico('shield')}${T('Place order','تأكيد الطلب')}</button>
            <p class="tiny center" style="margin-top:10px">${T('Nothing is charged. This prototype takes no payment and sends no message.','لا يُخصم أي مبلغ. هذا النموذج لا يستقبل دفعاً ولا يرسل رسائل.')}</p>
          </div>
        </div>
      </aside>
    </div>
  </div>`;
}

/* ---- order confirmation ------------------------------------------------ */
function viewOrder(){
  const o = S.orders.find(x=>x.id===S.params.id);
  if(!o) return notFound();
  const steps = [
    [T('Order placed','تم الطلب'), o.when, true],
    [T('Picked at the Shuwaikh store','التجهيز في مستودع الشويخ'), T('within 2 hours','خلال ساعتين'), false],
    [T('On the van','في الفان'), o.slot, false],
    [T('Delivered and fitted','التسليم والتركيب'), o.slot, false]
  ];
  return `<div class="wrap wrap-n" style="padding-block:34px">
    <div class="panel" style="padding:30px;text-align:center">
      <div class="thumb" style="width:60px;height:60px;margin:0 auto 18px;background:var(--go-w)">${art('check')}</div>
      <h1 class="d2">${T('Order placed','تم تأكيد الطلب')}</h1>
      <p class="mono" style="margin-top:8px;font-size:15px">${o.id}</p>
      <p class="small" style="margin-top:10px;max-width:46ch;margin-inline:auto">${T('A confirmation would go to WhatsApp and SMS at this point, with a tracking link the driver updates.','عند هذه النقطة يُرسل تأكيد على واتساب والرسائل النصية مع رابط تتبع يحدّثه السائق.')}</p>
    </div>
    <div class="panel" style="margin-top:18px">
      <div class="panel-h"><h2 class="d4">${T('What happens next','ما الذي يحدث بعد ذلك')}</h2></div>
      <div style="padding:20px">
        ${steps.map((s,i)=>`<div class="row" style="gap:14px;align-items:flex-start;padding-bottom:${i<steps.length-1?'20px':'0'};position:relative">
          <span style="width:24px;height:24px;border-radius:999px;flex:none;display:grid;place-items:center;
            background:${s[2]?'var(--go)':'var(--inset)'};color:${s[2]?'#fff':'var(--ink-3)'};border:1px solid ${s[2]?'var(--go)':'var(--rule-2)'};z-index:1">
            ${s[2]?ico('check'):`<span class="mono" style="font-size:10px">${i+1}</span>`}</span>
          ${i<steps.length-1?`<span style="position:absolute;inset-inline-start:11.5px;top:24px;bottom:0;width:1px;background:var(--rule-2)"></span>`:''}
          <span><span style="font-weight:600;font-size:14px;display:block">${s[0]}</span>
          <span class="tiny" style="display:block;margin-top:2px">${s[1]}</span></span>
        </div>`).join('')}
      </div>
    </div>
    <div class="grid g2" style="margin-top:18px">
      <div class="panel panel-p">
        <p class="eyebrow">${T('Delivering to','التوصيل إلى')}</p>
        <p style="margin-top:9px;font-size:14px;font-weight:600">${esc(o.where)}</p>
        <p class="small" style="margin-top:3px">${esc(o.gov)}</p>
        <p class="small" style="margin-top:10px">${o.slot}</p>
      </div>
      <div class="panel panel-p">
        <p class="eyebrow">${T('Payment','الدفع')}</p>
        <p style="margin-top:9px;font-size:14px;font-weight:600">${({knet:'KNET',card:T('Card','بطاقة'),apple:'Apple Pay',cod:T('Cash on delivery','عند الاستلام')})[o.pay]}</p>
        <div class="row-b" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--rule)">
          <span class="small">${T('Total','الإجمالي')}</span><span class="price">${kwd(o.total)}</span></div>
      </div>
    </div>
    <div class="row wrap-f" style="margin-top:22px;gap:10px;justify-content:center">
      <a class="btn btn-line" href="#/garage">${T('My garage','كراجي')}</a>
      <a class="btn btn-primary" href="#/shop">${T('Keep shopping','مواصلة التسوق')}${ico('chev','flip')}</a>
    </div>
  </div>`;
}

/* == 8. chrome, search, router ============================================ */
const LOGO = `<svg class="logo-mark" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
  <path d="M16 2.6 27.2 9v14L16 29.4 4.8 23V9Z"/><circle cx="16" cy="16" r="5.4"/>
  <path class="a" d="M16 2.6 27.2 9l-5.6 3.2L16 9Z" stroke="none"/></svg>`;

const NAV = [
  ['#/shop',    T2('Parts','القطع')],
  ['#/service', T2('Fitting','التركيب')],
  ['#/garage',  T2('Garage','الكراج')],
  ['#/pro',     T2('For workshops','للورش')]
];
function T2(en,ar){ return { en, ar }; }

function headerHTML(){
  return `
  <div class="hdr-bar">
    <div class="wrap">
      <div class="bar-l">
        <a href="tel:+96518002279" class="row gap-s">${ico('phone')}<span class="mono">1800 2279</span></a>
        <span class="row gap-s hide-m"><span class="dot"></span>${T('Same day across Kuwait, ordered before 15:00','توصيل نفس اليوم في الكويت للطلبات قبل 3 م')}</span>
      </div>
      <div class="bar-r">
        <a href="https://wa.me/96518002279" target="_blank" rel="noopener" class="row gap-s">${ico('wa')}${T('Ask a parts expert','اسأل مختص قطع')}</a>
      </div>
    </div>
  </div>
  <div class="wrap">
    <div class="hdr-top">
      <a class="logo" href="#/" aria-label="CarZone Kuwait">
        ${LOGO}
        <span><span class="logo-w">CARZONE</span><span class="logo-s">${T('KUWAIT','الكويت')}</span></span>
      </a>
      <nav class="nav" aria-label="${T('Primary','رئيسي')}">
        ${NAV.map(([href,l])=>`<a href="${href}" data-nav="${href}">${nm(l)}</a>`).join('')}
      </nav>
      <div class="search" role="search">
        ${ico('search')}
        <input id="q" type="search" autocomplete="off" placeholder="${T('Part number or name','رقم القطعة أو الاسم')}"
          aria-label="${T('Search the catalogue','ابحث في الكتالوج')}" oninput="liveSearch(this.value)"
          onkeydown="if(event.key==='Enter'){submitSearch(this.value)}">
        <div id="sres"></div>
      </div>
      <button class="plate${S.vehicle?' set':''}" onclick="openVehiclePicker()">
        ${ico('car')}
        <span class="plate-t">
          <span class="plate-l">${S.vehicle?T('Shopping for','التسوق لـ'):T('No vehicle set','لم تحدد سيارة')}</span>
          <span class="plate-v">${S.vehicle?esc(vehicleLabel(S.vehicle)):T('Set your vehicle','حدّد سيارتك')}</span>
        </span>
      </button>
      <div class="hdr-acts">
        <button class="lang" onclick="setLang('${S.lang==='en'?'ar':'en'}')" aria-label="${T('Switch to Arabic','التبديل إلى الإنجليزية')}">${S.lang==='en'?'عربي':'EN'}</button>
        <button class="iconbtn only-m burger" onclick="toggleMenu()" aria-label="${T('Menu','القائمة')}">${ico('menu')}</button>
        <button class="iconbtn" onclick="openCart()" aria-label="${T('Cart','السلة')}">
          ${ico('cart')}<span class="count hide" data-cart-count>0</span></button>
      </div>
    </div>
  </div>
  <div class="depts"><div class="wrap"><div class="depts-in">
    ${DEPTS.map(d=>`<a href="#/shop/${d.id}" data-dept="${d.id}">${nm(d)}</a>`).join('')}
    <a href="#/guide" style="margin-inline-start:auto">${ico('doc')}${T('Guides','الأدلة')}</a>
  </div></div></div>
  <div class="mnav" id="mnav">
    <div class="row-b" style="margin-bottom:20px">
      <a class="logo" href="#/" onclick="toggleMenu()">${LOGO}<span class="logo-w">CARZONE</span></a>
      <button class="iconbtn" onclick="toggleMenu()" aria-label="${T('Close','إغلاق')}">${ico('close')}</button>
    </div>
    ${NAV.map(([href,l])=>`<a href="${href}" onclick="toggleMenu()">${nm(l)}${ico('chev')}</a>`).join('')}
    ${DEPTS.map(d=>`<a href="#/shop/${d.id}" onclick="toggleMenu()" style="font-family:var(--fb);font-size:15px;font-weight:500">${nm(d)}${ico('chev')}</a>`).join('')}
  </div>`;
}
function footerHTML(){
  const cols = [
    [T('Shop','التسوق'), [['#/shop/batteries',T('Batteries','بطاريات')],['#/shop/tires',T('Tires','إطارات')],['#/shop/oils',T('Oils and filters','زيوت وفلاتر')],['#/shop/brakes',T('Brakes','فرامل')],['#/shop',T('Everything','كل شيء')]]],
    [T('Service','الخدمة'), [['#/service',T('Mobile fitting','تركيب متنقل')],['#/service',T('Battery rescue','إنقاذ بطارية')],['#/garage',T('My garage','كراجي')],['#/guide',T('Guides','الأدلة')]]],
    [T('Business','الأعمال'), [['#/pro',T('CarZone Pro','كارزون برو')],['#/pro',T('Trade account','حساب تجاري')],['#/pro',T('Delivery runs','جولات التوصيل')]]]
  ];
  return `<div class="wrap">
    <div class="ftr-grid">
      <div>
        <a class="logo" href="#/" style="color:var(--paper)">${LOGO}
          <span><span class="logo-w" style="color:var(--paper)">CARZONE</span>
          <span class="logo-s" style="color:rgba(244,241,234,.5)">${T('KUWAIT','الكويت')}</span></span></a>
        <p style="margin-top:16px;font-size:14px;max-width:40ch;line-height:1.65">${T(
          'Parts, tires and fitting for Kuwait. One catalogue filtered to your car, delivered the same day, fitted where the car is parked.',
          'قطع وإطارات وتركيب للكويت. كتالوج واحد مُصفّى على سيارتك، يصلك في نفس اليوم، ويُركّب حيث تقف السيارة.')}</p>
        <div class="row gap-s" style="margin-top:18px">
          <a class="btn btn-sm btn-onink" href="https://wa.me/96518002279" target="_blank" rel="noopener">${ico('wa')}${T('WhatsApp','واتساب')}</a>
          <a class="btn btn-sm btn-onink" href="tel:+96518002279">${ico('phone')}1800 2279</a>
        </div>
      </div>
      ${cols.map(([h,links])=>`<div><h4>${h}</h4>${links.map(([href,l])=>`<a href="${href}">${l}</a>`).join('')}</div>`).join('')}
    </div>
    <div class="ftr-b">
      <p>${T('A design prototype. Not a trading company, and no order placed here is real.','نموذج تصميمي. ليس شركة تجارية، ولا يوجد طلب حقيقي هنا.')}</p>
      <div class="pay"><span>KNET</span><span>VISA</span><span>MASTERCARD</span><span>APPLE PAY</span><span>${T('CASH','نقداً')}</span></div>
    </div>
  </div>`;
}
function paintPlate(){
  const p = document.querySelector('.plate'); if(!p) return;
  p.classList.toggle('set', !!S.vehicle);
  p.querySelector('.plate-l').textContent = S.vehicle?T('Shopping for','التسوق لـ'):T('No vehicle set','لم تحدد سيارة');
  p.querySelector('.plate-v').textContent = S.vehicle?vehicleLabel(S.vehicle):T('Set your vehicle','حدّد سيارتك');
}
function markNav(){
  const h = location.hash || '#/';
  document.querySelectorAll('[data-nav]').forEach(a=>{
    const t = a.getAttribute('data-nav');
    a.classList.toggle('on', t==='#/shop' ? (h.startsWith('#/shop') && !h.startsWith('#/shop/tires')) : h.startsWith(t));
  });
  document.querySelectorAll('[data-dept]').forEach(a=>
    a.classList.toggle('on', h === '#/shop/'+a.getAttribute('data-dept')));
}
function toggleMenu(){ document.getElementById('mnav').classList.toggle('open'); }

/* ---- search ------------------------------------------------------------ */
function liveSearch(q){
  const box = document.getElementById('sres');
  q = (q||'').trim();
  if(q.length < 2){ box.innerHTML = ''; box.className=''; return; }
  const ql = q.toLowerCase(), qn = ql.replace(/[-\s]/g,'');
  const hits = PRODUCTS.filter(p=>matchProduct(p,ql,qn)).slice(0,7);
  box.className = 'sres';
  if(!hits.length){
    box.innerHTML = `<div style="padding:16px">
      <p class="small">${T('No match for','لا نتائج لـ')} “${esc(q)}”</p>
      <p class="tiny" style="margin-top:6px">${T('Part numbers work with or without dashes. Try 90915-YZZD4 or H7.','أرقام القطع تعمل بالشرطات أو بدونها. جرّب 90915-YZZD4 أو H7.')}</p></div>`;
    return;
  }
  box.innerHTML = `<p class="sres-h">${hits.length} ${T('matches','نتيجة')}</p>` + hits.map(p=>`
    <button class="sres-i" onclick="go('#/p/${p.sku}');closeSearch()">
      <span class="thumb">${art(p.art)}</span>
      <span class="grow" style="min-width:0">
        <span style="font-size:13.5px;font-weight:600;display:block" class="trunc">${esc(nm(p))}</span>
        <span class="tiny" style="display:block">${esc(BRANDS[p.brand])} · <span class="mono">${p.sku}</span></span></span>
      <span style="flex:none;text-align:end">${fitChip(p)}<span class="num" style="display:block;font-size:13px;margin-top:3px">${kwd(p.price)}</span></span>
    </button>`).join('');
}
function closeSearch(){ const b=document.getElementById('sres'); if(b){ b.innerHTML=''; b.className=''; } const q=document.getElementById('q'); if(q) q.value=''; }
function submitSearch(q){
  q = (q||'').trim(); if(!q) return;
  S.shop.q = q; S.shop.dept = null; closeSearch(); go('#/shop');
}
document.addEventListener('click', e=>{
  if(!e.target.closest('.search')) { const b=document.getElementById('sres'); if(b&&b.className){ b.innerHTML=''; b.className=''; } }
});

/* ---- language ---------------------------------------------------------- */
function setLang(l){
  S.lang = l; save();
  document.documentElement.lang = l;
  document.documentElement.dir = l==='ar' ? 'rtl' : 'ltr';
  document.getElementById('hdr').innerHTML = headerHTML();
  document.getElementById('ftr').innerHTML = footerHTML();
  if(S.ui.overlay) closeOverlay();
  render();
}

/* ---- router ------------------------------------------------------------ */
const VIEWS = { home:viewHome, shop:viewShop, product:viewProduct, service:viewService,
  garage:viewGarage, pro:viewPro, guide:viewGuide, checkout:viewCheckout, order:viewOrder };

function go(hash){ if(location.hash === hash) route(); else location.hash = hash; }
function route(){
  const h = (location.hash || '#/').replace(/^#\/?/, '');
  const seg = h.split('/').filter(Boolean);
  const prev = S.view;
  S.params = {};
  if(!seg.length) S.view = 'home';
  else if(seg[0]==='shop'){ S.view='shop'; S.shop.dept = seg[1] && deptOf(seg[1]) ? seg[1] : null; if(seg[1]) S.shop.q=''; }
  else if(seg[0]==='p'){ S.view='product'; S.params.sku = decodeURIComponent(seg[1]||''); PD = { install:true, qty:1 }; }
  else if(seg[0]==='order'){ S.view='order'; S.params.id = seg[1]; }
  else if(VIEWS[seg[0]]) S.view = seg[0];
  else S.view = 'home';
  if(S.view !== 'shop') S.shop.q = '';
  render();
  if(prev !== S.view || seg[0]==='p') window.scrollTo({ top:0, behavior:'auto' });
  markNav();
}
function render(){
  const main = document.getElementById('main');
  main.innerHTML = (VIEWS[S.view] || viewHome)();
  paintPlate(); syncCart(); markNav(); observeReveals();
}

/* ---- reveal on scroll -------------------------------------------------- */
let RV;
function observeReveals(){
  if(!('IntersectionObserver' in window)) return;
  if(RV) RV.disconnect();
  RV = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); RV.unobserve(e.target); } }), { threshold:.06, rootMargin:'0px 0px -40px' });
  document.querySelectorAll('[data-rv]:not(.in)').forEach(el=>RV.observe(el));
}

/* == 9. boot ============================================================== */
function boot(){
  load();
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang==='ar' ? 'rtl' : 'ltr';
  document.getElementById('hdr').innerHTML = headerHTML();
  document.getElementById('ftr').innerHTML = footerHTML();
  window.addEventListener('hashchange', route);
  let rzT;
  window.addEventListener('resize', ()=>{
    clearTimeout(rzT);
    rzT = setTimeout(()=>{ const f = document.getElementById('facetBox');
      if(f) f.open = window.innerWidth >= 940; }, 150);
  });
  window.addEventListener('scroll', ()=>{
    document.getElementById('hdr').classList.toggle('stuck', window.scrollY > 8);
  }, { passive:true });
  route();
}
document.addEventListener('DOMContentLoaded', boot);

/* Flow 3 "Full Overhaul" (Figma section "Var3", nodes 5324:959 onward).
   Layers on top of app.js: same Flow 2 state and engine, but every screen, sheet, action and
   simulation listed here replaces the Flow 2 one only while st.variant === 'full'. */

// Its own flow (Flow 3) in the panel; it runs on Flow 2's booking engine (flow 'B').
VARIANTS.full = { flow: 'B', label: 'Full overhaul', group: 'Flow 3', start: 'b-welcome' };
GROUP_DESC['Flow 3'] =
  "The best of both."
  
const ALF3 = { ...ALFRED, ini: 'A', key: 'alfred3', skills: 'Plumbing and electrical', rating: '4.9', jobs: 342, years: '6 yrs', area: 'Pasay and Taft', vehicle: 'White motorcycle, ABC 1234' };
const JOHN3 = { ...JOHN, ini: 'J', key: 'john3', skills: 'Plumbing', rating: '4.8', jobs: 128, years: '3 yrs', area: 'Taft and Malate', vehicle: 'Red scooter, NBC 5521' };
const GORDON = { name: 'James Gordon', first: 'James', ini: 'J', key: 'gordon' };
const JONES = { name: 'John Jones', first: 'John', ini: 'J', key: 'jones' };
Object.assign(MANONGS, { alfred3: ALF3, john3: JOHN3 });
Object.assign(STAMP, { late: 'Running late', mcancelled: 'Cancelled', pending: 'Pending confirmation', declined: 'Declined' });

const GOOD_AT = { alfred3: ['Leak repair', 'Water heaters', 'Outlets', 'Toilets'], john3: ['Clogged drains', 'Faucets', 'Pipes'] };
const REVIEW = {
  alfred3: ['Maria L., Tower 2', 'Explained what was wrong before fixing it, and cleaned up after. Would book again.'],
  john3: ['Ken T., Tower 1', 'Fast and careful. Came on time even in the rain.'],
};

// ---------- who can take the job (U09, U10) ----------
// Aides are listed per service, nearest first. now: true if free right now, else the reason. busy: times already booked.
const aide3 = (key, name, ini, skills, rating, jobs, years, area, vehicle) => ({ name, first: name.split(' ')[0], ini, key, skills, rating, jobs, years, area, vehicle });
Object.assign(GORDON, aide3('gordon', 'James Gordon', 'J', 'Cleaning', '4.9', 210, '4 yrs', 'Taft and Malate', 'Arrives by jeep'));
Object.assign(JONES, aide3('jones', 'John Jones', 'J', 'Repairs and carpentry', '4.7', 164, '5 yrs', 'Malate and Ermita', 'Silver scooter, MCD 640'));
const RAMON = aide3('ramon', 'Ramon Cruz', 'R', 'Plumbing', '4.7', 86, '2 yrs', 'Pasay and Taft', 'Blue motorcycle, TXV 902');
const DANTE = aide3('dante', 'Dante Reyes', 'D', 'Electrical', '4.8', 154, '5 yrs', 'Malate and Ermita', 'Black motorcycle, MNB 331');
const LIZA = aide3('liza', 'Liza Santos', 'L', 'Cleaning', '4.8', 176, '3 yrs', 'Pasay', 'Arrives by jeep');
const MARIO = aide3('mario', 'Mario Tan', 'M', 'Locks and security', '4.9', 301, '7 yrs', 'Malate and Ermita', 'Grey scooter, ZAB 118');
const EDGAR = aide3('edgar', 'Edgar Lim', 'E', 'Locks', '4.6', 92, '2 yrs', 'Taft', 'Red scooter, QRT 220');
const PAOLO = aide3('paolo', 'Paolo Ramos', 'P', 'Repairs and carpentry', '4.8', 118, '4 yrs', 'Pasay', 'White van, NDA 7740');
const REY = aide3('rey', 'Rey Santos', 'R', 'Moving crew lead', '4.8', 240, '6 yrs', 'Pasay and Taft', 'White L300 van, NDA 4412');
const BENNY = aide3('benny', 'Benny Ocampo', 'B', 'Moving crew lead', '4.7', 133, '3 yrs', 'Malate', 'Silver van, NCV 3305');
const roster3 = (rows) => rows.map(([m, km, now, busy]) => ({ m, km, now, busy })).sort((x, y) => x.km - y.km);
const ROSTER3 = {
  plumbing: roster3([[ALF3, 0.4, 'On a job until 11:30 AM', []], [JOHN3, 1.1, true, ['3:00 PM']], [RAMON, 2.3, true, ['10:30 AM']]]),
  electrical: roster3([[ALF3, 0.4, 'On a job until 11:30 AM', []], [DANTE, 0.9, true, []]]),
  cleaning: roster3([[GORDON, 0.7, true, ['9:00 AM']], [LIZA, 1.6, true, ['3:00 PM']]]),
  locks: roster3([[MARIO, 1.2, true, []], [EDGAR, 2.0, true, ['10:30 AM']]]),
  repairs: roster3([[JONES, 0.9, true, []], [PAOLO, 1.8, true, ['1:00 PM']]]),
  moving: roster3([[REY, 1.5, true, []], [BENNY, 2.4, true, ['9:00 AM']]]),
};
Object.values(ROSTER3).flat().forEach((a) => {
  MANONGS[a.m.key] = a.m;
});
const catOf3 = (m) => Object.keys(ROSTER3).find((c) => ROSTER3[c].some((a) => a.m.key === m.key)) || 'plumbing';
const isFree3 = (a) => (st.when === 'now' ? a.now === true : !a.busy.includes(st.time));
const pool3 = () => ROSTER3[st.cat].filter(isFree3);
const picked3 = () => !!st.pickManong && pool3().some((a) => a.m.key === st.pickManong);
const CAT_GOOD3 = {
  plumbing: ['Leak repair', 'Clogged drains', 'Toilets'], electrical: ['Outlets', 'Breakers', 'Lighting'], cleaning: ['Deep cleaning', 'Kitchens', 'Bathrooms'],
  locks: ['Lockouts', 'Lock changes', 'Smart locks'], repairs: ['Doors and hinges', 'Cabinets', 'Wall patching'], moving: ['Packing', 'Studio moves', 'Elevator moves'],
};
const CAT_REVIEW3 = {
  plumbing: ['Ken T., Tower 1', 'Fixed the leak fast and told me what to watch for.'], electrical: ['Anna P., Tower 3', 'Found the tripped circuit in minutes and labelled the breaker for me.'],
  cleaning: ['Joy M., Tower 2', 'Spotless kitchen and bathroom. On time, and brought supplies.'], locks: ['Paul S., Tower 1', 'Got me back in within the hour. Asked for my ID first.'],
  repairs: ['Nina R., Tower 2', 'Fixed the cabinet hinges and cleaned up the dust.'], moving: ['Marco D., Tower 1', 'Careful with the furniture. Everything arrived in one piece.'],
};
// Estimated time. Repairs follow the shared service types (Checkup 15 min, Standard 30 to 60 min, Major 1+ hr).
// Cleaning and moving are sized by place, so they get their own estimates. Confirm these with Team 2.
const DUR3 = { q: 'About 15 min', s: '30 to 60 min', m: '1 hour or more' };
const DUR3_CAT = { cleaning: { q: 'About 1 hour', s: '1 to 2 hours', m: '2 to 4 hours' }, moving: { q: 'About 1 hour', s: '2 to 4 hours', m: '4 hours or more' } };
const dur3 = (cat, k) => (DUR3_CAT[cat] || DUR3)[k];

// Per-service first step, prices and notes, straight from the "<Service> 1" frames.
const T = (name, desc, price, meta, gold, tk) => ({ name, desc, price, meta, gold, tk: tk || name.toLowerCase() });
const CAT3 = {
  plumbing: {
    q: 'How big is the job?', issue: 'Issue', crew: 'Manong', def: 's',
    note: 'Prices are fixed. If parts are needed, Manong gives you a quote first.',
    tiers: { q: T('Quick checkup', 'e.g. Inspection or a very small fix', 250, 'Base charge'), s: T('Standard repair', 'e.g. Typical repairs', 450, 'Most booked', 1), m: T('Major repair', 'e.g. Installation or longer work', 800, 'Starting price') },
    chips: 'Add a symptom', symptoms: ['Leak', 'Clogged drain', 'No water', 'Low pressure', 'Running toilet'],
    ph: 'e.g. water dripping under the kitchen sink', extra: [["Plumber's tape", 35]], part: ['P-trap, PVC 1½ in', 180, 'Cracked, causing the leak.'],
  },
  electrical: {
    q: 'How big is the job?', issue: 'Issue', crew: 'Manong', def: 's',
    note: '',
    tiers: { q: T('Quick check', 'e.g. Breaker or dead outlet', 300, 'Base charge'), s: T('Standard repair', 'e.g. Outlet, switch or light', 550, 'Most booked', 1), m: T('Rewiring', 'e.g. New circuit or panel work', 1200, 'Starting price') },
    chips: 'Add a symptom', symptoms: ['No power', 'Tripping breaker', 'Sparking outlet', 'Flickering lights', 'Dead switch'],
    ph: 'e.g. the kitchen outlet sparks when I plug in', extra: [['Electrical tape', 30]], part: ['Duplex outlet', 160, 'Burnt inside, needs replacing.'],
  },
  cleaning: {
    q: 'How big is your place?', issue: 'Details', crew: 'Manong', def: 's',
    note: '',
    tiers: { q: T('Studio', 'e.g. Up to 25 sqm', 800, 'Fixed price'), s: T('1 bedroom', 'e.g. 26 to 45 sqm', 1200, 'Most booked', 1), m: T('2 bedrooms', 'e.g. 46 to 70 sqm', 1700, 'Fixed price') },
    chips: 'Anything we should know?', symptoms: ['Has pets', 'Deep clean', 'Kitchen', 'Bathroom', 'Inside the fridge'],
    ph: 'e.g. focus on the kitchen and bathroom', extra: [], part: ['Mold remover', 120, 'Mold behind the shower tiles.'],
  },
  locks: {
    q: 'What do you need?', issue: 'Issue', crew: 'Manong', def: 'q',
    note: '',
    tiers: { q: T("I'm locked out", 'e.g. Lost keys or a jammed lock', 650, 'Base charge', 0, 'locked out'), s: T('Change a lock', 'e.g. New cylinder or deadbolt', 900, 'Fixed price'), m: T('Fit a smart lock', 'e.g. A keypad lock you already have', 1500, 'Starting price') },
    chips: 'What happened?', symptoms: ['Lost my keys', 'Key broke inside', 'Door is jammed', 'Lock is old'],
    ph: 'e.g. left my keys inside the unit', extra: [], part: ['Lock cylinder', 350, 'Old cylinder is worn out.'],
  },
  moving: {
    q: 'How much are you moving?', issue: 'Route', crew: 'Movers', def: 's',
    note: 'Prices cover moves within Metro Manila. Longer trips get a quote first.',
    tiers: { q: T('A few items', 'e.g. Up to 10 boxes, 1 van', 1500, 'Fixed price'), s: T('Studio', 'e.g. 1 truck, 2 movers', 3500, 'Most booked', 1), m: T('1 to 2 bedrooms', 'e.g. 1 truck, 3 movers', 6000, 'Starting price') },
    chips: 'Anything movers should know?', symptoms: ['Elevator at pick-up', 'Elevator at drop-off', 'Fragile items', 'Needs packing', 'Stairs only'],
    ph: '', extra: [], part: ['Extra packing boxes', 150, 'Ran out of boxes for the kitchen.'],
  },
  repairs: {
    q: 'What needs repairing?', issue: 'Issue', crew: 'Manong', def: 's',
    note: 'Prices are fixed. If parts are needed, Manong gives you a quote first.',
    tiers: { q: T('Small fix', 'e.g. Hinge or shelf', 400, 'Base charge'), s: T('Standard repair', 'e.g. Door, cabinet or wall', 700, 'Most booked', 1), m: T('Painting', 'e.g. One wall, no paint', 1800, 'Starting price') },
    chips: 'Add a symptom', symptoms: ['Door', 'Cabinet', 'Wall patch', 'Furniture', 'Window'],
    ph: 'e.g. the cabinet door hinge came off', extra: [], part: ['Hinges (pair)', 140, 'Old hinges are rusted.'],
  },
};
const STAR3 = ['', 'Not good', 'Could be better', 'Okay lang', 'Ayos! Great job', 'Sobrang ayos!'];
const CANCEL_REASONS = ['Fixed it myself', 'Booked by mistake', 'Need a different time', 'Found someone else', 'Something else'];
const REPORT_REASONS = ["The fix didn't work", 'Charged too much', 'Arrived late', 'Damage to my place', 'Something else'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  { name: 'September 2026', start: 2, days: 30 },
  { name: 'October 2026', start: 4, days: 31 },
  { name: 'November 2026', start: 0, days: 30 },
];
const octDay = (d) => WD[(4 + d - 1) % 7]; // Oct 1, 2026 is a Thursday

const P3 = (id, cat, title, date, time, manong, lines, status = 'paid', stars = 0) => ({
  id, cat, title, date, time, manong, lines, status, stars, pay: 'gcash', total: lines.reduce((s, [, p]) => s + p, 0),
});

function full3State() {
  return {
    tier: 's', addr3: 0, addrPickSel: 0,
    addrs: [
      { label: 'Home', bldg: 'Green Residences', short: 'Unit 12B, Tower 1', city: 'Malate', note: 'Guard has the lobby PIN' },
      { label: "Parents' house", bldg: '24 Mabini St', short: '', city: 'Cabanatuan City', note: '' },
      { label: 'Office', bldg: 'One Ayala, Ayala Ave', short: '18F', city: 'Makati', note: 'Ask for the admin desk' },
    ],
    user: { first: 'Bruce', last: 'Wayne', phone: '+63 917 123 4567' },
    booking: { id: 'MJ-8821', cat: 'plumbing', tier: 's', problem: 'Leak under the sink', day: 21, time: '10:30 AM', addr: 0, manong: ALF3, status: 'confirmed', mode: 'schedule', pay: 'gcash', parts: [] },
    upcoming: [{ day: 28, time: '9:00 AM', title: 'Cleaning, 1 bedroom', with: 'James Gordon' }],
    past3: [
      P3('MJ-8790', 'plumbing', 'Plumbing, leak repair', 'Fri, Oct 2', '2:00 PM', ALF3, [['Base charge', 450], ['P-trap, PVC 1½ in', 180], ["Plumber's tape", 35]], 'paid', 4),
      P3('MJ-8655', 'cleaning', 'Cleaning, 1 bedroom', 'Mon, Sep 14', '9:00 AM', GORDON, [['1 bedroom clean', 1200]], 'paid', 5),
      P3('MJ-8571', 'electrical', 'Electrical, outlet repair', 'Sun, Aug 30', '3:00 PM', ALF3, [['Base charge', 550]], 'paid', 5),
      P3('MJ-8490', 'locks', 'Locks, locked out', 'Mon, Aug 3', '11:20 PM', null, [['Cancelled before dispatch', 0]], 'cancelled'),
      P3('MJ-8402', 'repairs', 'Repairs, small fix', 'Sun, Jul 19', '10:00 AM', JONES, [['Base charge', 400]], 'paid', 4),
    ],
    notifs3: [
      { g: 'Today', icon: 'check', t: 'Alfred confirmed your booking for Wed, Oct 21 at 10:30 AM.', time: '4:15 PM', unread: true, act: 'status' },
      { g: 'Today', icon: 'clock', t: 'Your booking is tomorrow. Let your condo guards know Alfred is coming.', time: '9:00 AM', unread: true, act: 'status' },
      { g: 'Yesterday', icon: 'cash', t: 'Your ₱665 payment to Alfred went through.', time: '6:40 PM', unread: false, act: 'receipt' },
      { g: 'Yesterday', icon: 'star', t: 'How did Alfred do? Rate your Manong.', time: '6:41 PM', unread: false, act: 'receipt' },
      { g: 'Earlier', icon: 'sparkle', t: 'Deep cleaning is ₱200 off until Sunday.', time: 'Oct 15', unread: false, act: 'cleaning' },
    ],
    chat3: [
      { me: false, t: 'Good morning sir, malapit na po.', time: '10:24 AM' },
      { sys: 'Alfred shared his location' },
      { me: true, t: 'Sabihin niyo nalang po sa guard unit number', time: '10:25 AM' },
      { me: false, t: 'Sige po sir paakyat na po.', time: '10:25 AM' },
      { me: true, t: 'Salamat po!', time: '10:26 AM' },
    ],
    bkTab: 'up', calMonth: 0, calDay: 21, receiptIdx: 0, viewManong: 'alfred3',
    regMode: 'new', resendIn: 24, otpWrong: false, regFirst: '', regLast: '', regBldg: '', regUnit: '', regNote: '', regSaved: false,
    dropoff: '', failNext: false, altManong: false, pickManong: null, manongSel: 'auto', pendingReview: false, bgFinding: false, soonTime: '4:30 PM',
    cancelled: null, mcPick: 0, repReason: null, repText: '', reportFrom: 'b-charges',
    addrEdit: -1, afLabel: '', afBldg: '', afUnit: '', afNote: '', payPick: 'gcash',
  };
}

// ---------- hooks into app.js ----------
const baseFresh = fresh;
fresh = (v = 'main') => (v === 'full' ? Object.assign(baseFresh(v), full3State()) : baseFresh(v));

const c3 = (cat = st.cat) => CAT3[cat];
const t3 = (b) => CAT3[b ? b.cat : st.cat].tiers[b ? b.tier : st.tier];
const where3 = (i = st.addr3) => st.addrs[i];
const addrShort = (a) => (a ? [a.short, a.bldg].filter(Boolean).join(', ') : '');
const addrFull = (a) => (a ? [a.short, a.bldg, a.city].filter(Boolean).join(', ') : '');
const lastWord = (s) => s.split(',').pop().trim().split(' ').pop();
const route3 = () => (st.dropoff.trim() ? `${lastWord(addrShort(where3()) || 'Home')} to ${lastWord(st.dropoff)}, 14 km` : '');
// Flow 2's whenB promises "in about 30 min" for Now; Flow 3 makes no time promises.
const whenB3 = () => (st.when === 'now' ? 'Now, as soon as possible' : whenB());
const issue3 = () => (st.cat === 'moving' ? route3() : problemB());
const mats3 = (b) => [...(b.parts || []), ...c3(b.cat).extra];
const base3 = (b) => t3(b).price;
const total3 = (b) => base3(b) + mats3(b).reduce((s, [, p]) => s + p, 0);
const svcName = (b) => `${CATS[b.cat].name}, ${t3(b).tk}`;
const nextManong = () => {
  const pool = pool3();
  const want = pool.find((a) => a.m.key === st.pickManong) || pool.find((a) => a.m.first === st.preferred);
  if (want) return want.m;
  return (st.altManong && pool.length > 1 ? pool[1] : pool[0] || ROSTER3[st.cat][0]).m;
};
const ini = (m, size = 44) => `<span class="av ini" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px">${m.ini}</span>`;
// Status ring (Design Kit "Status / Ring"): [label, filled fifths, colour, icon]. Replaces the tilted stamps in Flow 3.
const RING = {
  booked: ['Booked', 1, '#5F5E5E', 'calendar'],
  pending: ['Pending confirmation', 1, '#5F5E5E', 'hourglass'],
  confirmed: ['Confirmed', 2, '#1F7A4D', 'check'],
  onway: ['On the way', 3, '#005BC0', 'nav'],
  late: ['Running late', 3, '#B26A00', 'clock'],
  inprogress: ['In progress', 4, '#FFC72C', 'wrench'],
  completed: ['Completed', 5, '#1F7A4D', 'check'],
  cancelled: ['Cancelled', 5, '#C62828', 'x'],
};
const RING_C = 2 * Math.PI * 20;
function ring3(status, { label, caption } = {}) {
  const [name, n, color, icon] = RING[status];
  const done = status === 'completed';
  const iconColor = done ? '#fff' : status === 'inprogress' ? '#5A4300' : color;
  return `<div class="f3-ring"><svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
    <circle cx="22" cy="22" r="20" fill="none" stroke="${color}" stroke-opacity=".18" stroke-width="4"/>
    <circle cx="22" cy="22" r="20" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="${(RING_C * n) / 5} ${RING_C}" transform="rotate(-90 22 22)"/>
    ${done ? `<circle cx="22" cy="22" r="16" fill="${color}"/>` : ''}
    <svg x="13" y="13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${P[icon]}</svg></svg>
    <span><b>${label || name}</b><small>${caption || (status === 'cancelled' ? 'Booking closed' : `Step ${n} of 5`)}</small></span></div>`;
}
// Booking status values used in Flow 3 mapped onto ring states.
const ringFor = (s) =>
  ({
    accepted: ring3('confirmed', { label: 'Accepted' }),
    paid: ring3('completed', { label: 'Paid', caption: 'Booking closed' }),
    mcancelled: ring3('cancelled', { label: 'Manong cancelled', caption: 'Choose what to do next' }),
    declined: ring3('cancelled', { label: 'Declined', caption: 'Choose what to do next' }),
  })[s] || ring3(RING[s] ? s : 'booked');
const fmtPhone = (d) => d.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{0,4}).*/, '$1 $2 $3').trim();

function ticket3Inner({ manong } = {}) {
  const c = c3();
  return `<div class="sec head"><span class="t">${CATS[st.cat].name}, ${t3().tk}</span><span class="p">${peso(t3().price)}</span></div>
  <div class="tear"></div>
  <div class="sec rows"><div><span>${c.issue}</span>${val(issue3())}</div><div><span>When</span>${val(['b-size', 'b-problem', 'b-route'].includes(st.screen) ? '' : whenB3())}</div><div><span>${c.crew}</span>${manong ? `<span class="${manong === 'Looking now' ? 'na' : 'v'}">${manong}</span>` : val(picked3() ? `${MANONGS[st.pickManong].first} (your pick)` : st.preferred ? st.preferred + ' (requested)' : '')}</div></div>`;
}
const baseTicket = ticketBInner;
ticketBInner = (o) => (st.variant === 'full' ? ticket3Inner(o) : baseTicket(o));

function makeBooking3(mode) {
  const now = mode === 'now';
  return {
    id: now ? 'MJ-8830' : 'MJ-8821', cat: st.cat, tier: st.tier, problem: issue3() || 'General checkup',
    day: now ? 20 : st.day, time: now ? '2:03 PM' : st.time, addr: st.addr3, manong: nextManong(),
    status: now ? 'accepted' : 'pending', mode, pay: st.pay, parts: [],
  };
}
const baseMake = makeBooking;
makeBooking = (m) => (st.variant === 'full' ? makeBooking3(m) : baseMake(m));

// ---------- shared pieces ----------
const head3 = (title, step = 0, backAct = 'back', cls = '') => `<header class="f3-head ${cls}"><div class="bkhead"><button class="round" data-act="${backAct}" aria-label="Back">${ic('chevL')}</button><span class="t">${title}</span>${step ? `<span class="s">Step ${step} of 4</span>` : ''}</div>
  ${step ? `<div class="progress">${[1, 2, 3, 4].map((n) => `<i class="${n <= step ? 'done' : ''}"></i>`).join('')}</div>` : ''}</header>`;
const bookTitle = () => `Book ${CATS[st.cat].name.toLowerCase()}`;
const note3 = (text, icon = 'info', cls = '') => `<div class="note ${cls}">${ic(icon)}<span>${text}</span></div>`;
const regHead = (step) => {
  const login = st.regMode === 'login';
  return `<div class="f3-reghead"><div class="bkhead"><button class="round" data-act="back" aria-label="Back">${ic('chevL')}</button><span class="t">${login ? 'Log in' : 'Create account'}</span>${login ? '' : `<span class="s">Step ${step} of 4</span>`}</div>
  ${login ? '' : `<div class="progress">${[1, 2, 3, 4].map((n) => `<i class="${n <= step ? 'done' : ''}"></i>`).join('')}</div>`}</div>`;
};
const outlineSocial = () => socialB().replace(/btn white/g, 'btn white f3-outline');
const userName = () => `${st.user.first} ${st.user.last}`.trim();

// ==========================================================
// Screens
// ==========================================================
const S3 = {};

S3['b-welcome'] = () => `<div class="f3-welcome">${statusBar()}
  <div class="pad" style="padding-top:104px"><img class="f3-logo" src="${A}svg/mang-juan-badge.svg" alt="Mang Juan" />
    <p class="f3-tag">Book a trusted Manong for repairs, cleaning, locks and moving.</p>
    <ul class="f3-why">${[['shieldCheck', 'Every Manong is ID-verified'], ['check', 'Prices you see before booking'], ['cash', 'Pay after job is done']]
      .map(([i, t]) => `<li><span class="f3-disc">${ic(i)}</span>${t}</li>`).join('')}</ul></div>
  <div class="f3-signin"><button class="btn primary" data-act="regStart" data-arg="new">${ic('phone').replace('class="i ', 'class="i " style="color:var(--mango)" ')}Continue with mobile number</button>
    <div class="or">or continue with</div>${socialB()}
    <p class="f3-new">New here? Create your <button class="link" data-act="regStart" data-arg="new">account</button>.</p>
    <p class="f3-new" style="margin-top:4px">Have an account? <button class="link" data-act="go" data-arg="b-login">Log in</button></p></div></div>${homeBar}`;

S3['b-login'] = () => `<div class="f3-login">${statusBar()}<div class="pad" style="padding-top:84px;padding-bottom:40px">
  <img class="f3-logo sm" src="${A}svg/mang-juan-badge.svg" alt="Mang Juan" />
  <p class="f3-tag" style="margin:14px 0 22px">Welcome back. Log in to book your next repair.</p>
  <div id="loginForm"><div class="field"><label for="lid">Email or mobile number</label><div class="input f3-in"><input id="lid" data-model="loginId" value="${esc(st.loginId)}" placeholder="name@email.com" autocomplete="username" /></div></div>
  <div class="field"><label for="lpw">Password</label><div class="input f3-in"><input id="lpw" data-model="loginPw" type="${st.showPw ? 'text' : 'password'}" value="${esc(st.loginPw)}" placeholder="Password" autocomplete="current-password" />
    <button data-act="togglePw" aria-label="${st.showPw ? 'Hide' : 'Show'} password">${ic(st.showPw ? 'eye' : 'eyeOff')}</button></div></div></div>
  ${st.authErr ? `<p class="err3">${st.authErr}</p>` : ''}
  <div style="text-align:right;margin:-4px 0 14px"><button class="link gold" data-act="sheet" data-arg="forgot">Forgot password?</button></div>
  <button class="btn primary" data-act="loginB">Log in</button>
  <div class="or">or continue with</div>${outlineSocial()}
  <button class="btn outline-ink f3-outline" style="margin-top:12px" data-act="regStart" data-arg="login">Use mobile number instead</button>
  <p class="f3-new" style="margin-top:20px;color:var(--slate)">New to Mang Juan? <button class="link f3-ul" data-act="regStart" data-arg="new">Sign up</button></p>
  </div></div>`;

// ---------- registration ----------
S3['b-reg1'] = () => `${statusBar()}${regHead(1)}<div class="scroll pad">
  <h2 class="q" style="margin-top:32px">What's your mobile number?</h2><p class="qs">We'll text you a 6-digit code to confirm it's you.</p>
  <div class="label" style="margin-top:24px">Mobile number</div>
  <div class="f3-phone" id="phoneField"><span class="cc">PH +63</span><label class="input f3-in"><input data-model="phoneNum" inputmode="numeric" maxlength="13" value="${esc(st.phoneNum)}" placeholder="917 123 4567" aria-label="Mobile number" /></label></div>
  ${st.authErr ? `<p class="err3">${st.authErr}</p>` : ''}
  <div style="height:16px"></div>${note3('We never share your number. A Manong only sees it after you book him.', 'shieldCheck')}</div>
  <div class="footer">${st.regMode === 'login' ? '' : '<p class="f3-terms">By continuing, you agree to the Terms of Use and Privacy Policy.</p>'}<button class="btn primary" data-act="regSend">Send code</button></div>`;

S3['b-reg2'] = () => {
  const bad = st.otpWrong;
  return `${statusBar()}${regHead(2)}<div class="scroll pad">
  <h2 class="q" style="margin-top:32px">Enter the code</h2>
  <p class="qs">Sent to +63 ${esc(fmtPhone(st.phoneNum) || '917 123 4567')}. ${bad ? '' : '<button class="link gold" data-act="back">Change number</button>'}</p>
  <div class="otp ${bad ? 'bad' : ''}" id="otpRow">${[0, 1, 2, 3, 4, 5].map((i) => `<input data-otp="${i}" inputmode="numeric" maxlength="1" value="${st.otp[i] || ''}" aria-label="Digit ${i + 1}" ${bad ? 'readonly' : ''} />`).join('')}</div>
  ${bad ? `<p class="err3">That code didn't match. Check the latest text from Mang Juan and try again.</p><button class="link gold" data-act="regResend">Resend code</button>`
    : `<p class="f3-small">Didn't get it? ${st.resendIn > 0 ? '<span data-live="resend3"></span>' : '<button class="link gold" data-act="regResend">Resend code</button>'}</p>`}</div>
  <div class="footer">${bad ? '<button class="btn primary" data-act="regRetry">Try again</button>' : `<button class="btn primary" data-act="regVerify" ${st.otp.length === 6 ? '' : 'disabled'}>Verify</button>`}</div>`;
};

const nameForm = () => `<div id="nameForm"><div class="field"><label for="fn">First name</label><div class="input f3-in"><input id="fn" data-model="regFirst" value="${esc(st.regFirst)}" placeholder="First name" autocomplete="given-name" /></div></div>
  <div class="field"><label for="ln">Last name</label><div class="input f3-in"><input id="ln" data-model="regLast" value="${esc(st.regLast)}" placeholder="Last name" autocomplete="family-name" /></div></div></div>`;
S3['b-reg3'] = () => `${statusBar()}${regHead(3)}<div class="scroll pad"><h2 class="q" style="margin-top:32px;margin-bottom:28px">What should Manong call you?</h2>${nameForm()}</div>
  <div class="footer"><button class="btn primary" data-act="reg3Next">Continue</button></div>`;

const addrFields = (pre) => `<div id="addrForm">
  ${pre === 'af' ? `<div class="field"><label for="al">Label</label><div class="input f3-in"><input id="al" data-model="afLabel" value="${esc(st.afLabel)}" placeholder="e.g. Home, Office" /></div></div>` : ''}
  <div class="field"><label for="ab">Building or street</label><div class="input f3-in">${ic('pin')}<input id="ab" data-model="${pre}Bldg" value="${esc(st[pre + 'Bldg'])}" placeholder="e.g. Green Residences, Malate" /></div></div>
  <div class="field"><label for="au">Unit and tower</label><div class="input f3-in"><input id="au" data-model="${pre}Unit" value="${esc(st[pre + 'Unit'])}" placeholder="e.g. Unit 12B, Tower 1" /></div></div>
  <div class="field"><label for="an" style="display:flex;justify-content:space-between">Note for the guard <span style="font-weight:400;color:var(--slate)">Optional</span></label><div class="input f3-in"><input id="an" data-model="${pre}Note" value="${esc(st[pre + 'Note'])}" placeholder="e.g. Leave your ID at the lobby" /></div></div></div>`;
S3['b-reg4'] = () => `${statusBar()}${regHead(4)}<div class="scroll pad"><h2 class="q" style="margin-top:32px;margin-bottom:28px">Where should Manong go?</h2>${addrFields('reg')}</div>
  <div class="footer"><button class="btn primary" data-act="reg4Save">Save address</button><button class="link" data-act="reg4Skip">Skip for now</button></div>`;

S3['b-reg5'] = () => `${statusBar()}<div class="scroll pad" style="padding-top:150px">
  <div class="f3-mark"><img src="${A}svg/mang-juan-mark.svg" alt="" /></div>
  <h2 class="q" style="margin-top:24px">Ayos, ${esc(st.regFirst || 'Bruce')}! You're all set.</h2>
  <p class="qs">${st.regSaved ? `Your home at ${esc(addrShort({ short: st.regUnit, bldg: st.regBldg }))} is saved. Booking a Manong now takes a few taps.` : 'You can add your home address any time from Profile.'}</p>
  <div class="f3-sum rows" style="margin-top:22px"><div><span>Name</span><span class="v">${esc(`${st.regFirst} ${st.regLast}`.trim())}</span></div>
    <div><span>Mobile</span><span class="v">+63 ${esc(fmtPhone(st.phoneNum))}</span></div>
    <div><span>Home</span>${st.regSaved ? `<span class="v">${esc(st.regUnit)}</span>` : '<span class="na">Not set yet</span>'}</div></div></div>
  <div class="footer"><button class="btn primary" data-act="regDone" data-arg="book">Book your first Manong</button><button class="link" data-act="regDone">Go to home</button></div>`;

// ---------- home ----------
const whoLine3 = (b) => {
  const m = b.manong.first;
  return {
    confirmed: [`${m} is booked`, bkWhen(b)], accepted: [`${m} is booked`, "Today, we'll tell you when he heads out"],
    onway: [`${m} is on the way`, 'On his way, 6 km away'], late: [`${m} is running late`, "We'll tell you when he's close"],
    inprogress: [`${m} is working on it`, 'Started 10:32 AM'], completed: [`${m} finished the job`, 'Check the charges and pay'],
    mcancelled: [`${m} had to cancel`, 'Choose what to do next'],
    pending: [`Waiting for ${m} to confirm`, bkWhen(b)], declined: [`${m} can't take the job`, 'Choose what to do next'],
  }[b.status] || [`${m} is booked`, bkWhen(b)];
};
S3['b-home'] = () => {
  const b = bk();
  const a = where3();
  const unread = st.notifs3.some((n) => n.unread);
  const again = st.past3.find((p) => p.status === 'paid' && p.manong);
  let card;
  if (b) {
    const [l1, l2] = whoLine3(b);
    card = `<button class="ticket hometicket" data-act="openBooking" style="--notch:var(--mango)">
      <div class="sec head f3-headcol"><div><div class="t" style="font-size:17px;font-weight:700">${CATS[b.cat].name}</div><div class="sub">${t3(b).name}, ${esc(b.problem.toLowerCase())}</div></div>${ringFor(b.status)}</div>
      <div class="tear"></div><div class="sec who">${ini(b.manong)}<div class="grow"><b>${l1}</b><small>${l2}</small></div>${ic('chevR')}</div></button>`;
  } else if (st.pendingReview) {
    card = `<button class="card f3-emptycard" data-act="go" data-arg="b-review"><div class="grow"><b>A Manong is free</b><small>Tap to review and confirm.</small></div><span class="callbtn" style="background:var(--mango);color:var(--ink)">${ic('arrowR')}</span></button>`;
  } else {
    card = `<div class="card f3-emptycard"><div class="grow"><b>Nothing booked yet</b><small>Tell us what needs fixing.</small></div><img src="${A}illo-manong.png" alt="" /></div>`;
  }
  return `${statusBar()}<div class="scroll"><div class="homeband" style="${b ? '' : 'padding-bottom:0'}">
    <div class="top">${wordmark().replace('class="wordmark"', 'class="wordmark" style="height:36px"')}<button class="bell" data-act="go" data-arg="b-notifs" aria-label="Notifications">${ic('bell')}${unread ? '<span class="dot"></span>' : ''}</button></div>
    <button class="unit" data-act="pickWhere">${ic('pin')}<span>${a ? esc(addrShort(a)) : 'Add your address'}</span>${ic('chevR')}</button>
    ${card}</div>
  <div class="pad" style="padding-top:${b ? 116 : 62}px">
    <h3 class="sect">What needs fixing?</h3>
    <div class="grid6">${Object.entries(CATS).map(([k, c]) => `<button class="tile" data-act="startB" data-arg="${k}"><span class="disc">${ic(c.icon)}</span>${c.name}</button>`).join('')}</div>
    ${again ? `<h3 class="sect" style="font-size:17px;margin:20px 0 10px">Book again</h3>
      <div class="card who" style="margin-bottom:20px">${ini(again.manong)}<div class="grow"><b>${again.manong.name}</b><small>${CATS[again.cat].name} on ${again.date.split(', ')[1]}</small></div><button class="pillbtn" data-act="bookAgain3" data-arg="${st.past3.indexOf(again)}">Book</button></div>`
      : `<div style="height:20px"></div>${note3('Every Manong is ID-verified, and you only pay once the job is done.', 'shieldCheck')}<div style="height:20px"></div>`}
  </div></div>${tabbarB('b-home')}`;
};

// ---------- booking steps ----------
S3['b-addrpick'] = () => `${statusBar()}${head3(st.stack.some((s) => ['b-review', 'b-route'].includes(s)) ? bookTitle() : 'Your address')}<div class="scroll pad">
  <h2 class="q" style="margin-top:26px">Where should Manong go?</h2><p class="qs">Pick a saved place or add a new one.</p><div style="height:18px"></div>
  ${st.addrs.map((a, i) => `<button class="optrow ${st.addrPickSel === i ? 'on' : ''}" data-act="addrPickSel" data-arg="${i}" role="radio" aria-checked="${st.addrPickSel === i}"><span class="radio"></span><span class="grow"><b>${esc(a.label)}</b><small>${esc(addrFull(a))}</small></span></button>`).join('')}
  <button class="f3-dashed" data-act="addrNew">+ Add a new address</button></div>
  <div class="footer"><button class="btn primary" data-act="useAddr" ${st.addrs.length ? '' : 'disabled'}>Use this address</button></div>`;

S3['b-size'] = () => {
  const c = c3();
  return `${statusBar()}${head3(bookTitle(), 1)}<div class="scroll pad"><h2 class="q" style="margin-top:26px;margin-bottom:16px">${c.q}</h2>
  ${Object.entries(c.tiers).map(([k, t]) => `<button class="optrow ${st.tier === k ? 'on' : ''}" data-act="tierB" data-arg="${k}" role="radio" aria-checked="${st.tier === k}">
    <span class="radio"></span><span class="grow"><b>${t.name}</b><small>${t.desc}</small><small class="dur3">${ic('clock')}${dur3(st.cat, k)}</small></span><span class="price"><b>${peso(t.price)}</b><small class="${t.gold ? 'gold' : ''}">${t.meta}</small></span></button>`).join('')}
  ${c.note ? note3(c.note) : ''}<div style="height:12px"></div></div>
  <div class="pad">${ticketB()}</div><div class="footer"><button class="btn primary" data-act="go" data-arg="${st.cat === 'moving' ? 'b-route' : 'b-problem'}">Continue</button></div>`;
};

S3['b-problem'] = () => {
  const c = c3();
  return `${statusBar()}${head3(bookTitle(), 2)}<div class="scroll pad"><h2 class="q" style="margin-top:24px;margin-bottom:16px">What's happening?</h2>
  <div class="boxwrap" id="descBox"><textarea class="box" rows="3" maxlength="300" data-model="desc" placeholder="${c.ph}" aria-label="What's happening">${esc(st.desc)}</textarea><span class="count"><span data-live="descCount"></span> / 300</span></div>
  <div class="label">${c.chips}</div>
  <div class="chips">${c.symptoms.map((s) => `<button class="chip ${st.symptoms.includes(s) ? 'on' : ''}" data-act="symB" data-arg="${s}" aria-pressed="${st.symptoms.includes(s)}">${s}</button>`).join('')}</div>
  <div class="label" style="margin-top:14px">Photos <span style="font-weight:400;color:var(--slate)">Optional, up to 3</span></div>
  <div class="photos">${st.photos.map((p, i) => `<div class="ph"><img src="${p}" alt="Problem photo ${i + 1}" /><button class="rm" data-act="rmPhoto" data-arg="${i}" aria-label="Remove photo">${ic('x')}</button></div>`).join('')}
    ${st.photos.length < 3 ? `<button class="addph" data-act="sheet" data-arg="addPhoto">${ic('camera')}Add</button>` : ''}</div><div style="height:14px"></div></div>
  <div class="pad">${ticketB()}</div><div class="footer"><button class="btn primary" data-act="toSchedule">Continue</button></div>`;
};

S3['b-route'] = () => `${statusBar()}${head3(bookTitle(), 2)}<div class="scroll pad"><h2 class="q" style="margin-top:24px">Where are we moving?</h2>
  <div class="f3-route" id="routeBox">
    <button class="f3-stop" data-act="pickWhere"><span class="f3-disc">${ic('pin')}</span><span class="grow"><small>Pick-up</small><b>${esc(addrShort(where3()) || 'Add your address')}</b></span>${ic('pencil')}</button>
    <label class="f3-stop inp"><span class="f3-disc y">${ic('pin')}</span><span class="grow"><small>Drop-off</small><input data-model="dropoff" value="${esc(st.dropoff)}" placeholder="e.g. Unit 5A, The Grove, Pasig" aria-label="Drop-off address" /></span></label></div>
  <div class="label">${c3().chips}</div>
  <div class="chips">${c3().symptoms.map((s) => `<button class="chip ${st.symptoms.includes(s) ? 'on' : ''}" data-act="symB" data-arg="${s}" aria-pressed="${st.symptoms.includes(s)}">${s}</button>`).join('')}</div>
  <p class="f3-small">${st.dropoff.trim() ? 'About 14 km. ' : ''}Trips over 20 km get a price quote first.</p><div style="height:12px"></div></div>
  <div class="pad">${ticketB()}</div><div class="footer"><button class="btn primary" data-act="routeNext">Continue</button></div>`;

S3['b-schedule'] = () => `${statusBar()}${head3(bookTitle(), 3)}<div class="scroll pad"><h2 class="q" style="margin-top:24px;margin-bottom:16px">When do you need ${st.cat === 'moving' ? 'the movers' : 'Manong'}?</h2>
  <div class="segm" role="tablist"><button class="${st.when === 'now' ? 'on' : ''}" data-act="when" data-arg="now" role="tab"><b>Now</b><small>As soon as possible</small></button><button class="${st.when === 'schedule' ? 'on' : ''}" data-act="when" data-arg="schedule" role="tab"><b>Schedule</b><small>Pick a day and time</small></button></div>
  ${st.when === 'schedule' ? `<div class="label">Day</div><div class="days">${DAYS.map(([d, n]) => `<button class="day ${st.day === n ? 'on' : ''}" data-act="day" data-arg="${n}"><small>${d}</small><b>${n}</b></button>`).join('')}</div>
    <div class="label">Time</div><div class="times">${TIMES.map((t) => {
      const off = t === FULL_TIME;
      return `<button class="slot ${st.time === t ? 'on' : ''} ${off ? 'off' : ''}" data-act="${off ? 'fullSlot' : 'time'}" data-arg="${t}" ${off ? 'aria-disabled="true"' : ''}>${t}</button>`;
    }).join('')}</div>`
    : `<div style="height:18px"></div>${note3(st.cat === 'locks' && st.tier === 'q' ? 'A locksmith heads over now. Have your ID ready at the door.' : `We'll send the nearest free ${CATS[st.cat].who}. You can choose someone else before you confirm. Free to cancel until Manong starts the job.`, 'zap')}`}
  <div style="height:14px"></div></div>
  <div class="pad">${ticketB()}</div><div class="footer"><button class="btn primary" data-act="findB">Find my Manong</button></div>`;

S3['b-finding'] = () => `${statusBar()}${head3(bookTitle(), 0, 'leaveFinding')}<div class="scroll pad">
  <h2 class="q" style="margin-top:28px">Finding your Manong</h2><p class="qs">You can leave this screen. We'll notify you once a Manong accepts.</p>
  <div class="f3-radar" aria-hidden="true"><i></i><i></i><span><img src="${A}svg/mang-juan-mark.svg" alt="" /></span></div>
  <div class="bar"><i data-live-w="findPct"></i></div><div style="height:18px"></div>
  ${ticketB({ manong: 'Looking now' })}<div style="height:16px"></div>${note3('Tip: let your lobby guard know a Manong is coming.')}</div>
  <div class="footer"><button class="btn secondary" data-act="sheet" data-arg="cancelFindB">Cancel request</button></div>`;

S3['b-none'] = () => {
  const open = TIMES.filter((t) => t !== FULL_TIME && t !== st.noneFrom);
  return `${statusBar()}${head3(bookTitle())}<div class="scroll pad"><h2 class="q" style="margin-top:32px">No Manong is free at ${st.noneFrom}</h2>
  <p class="qs">Every ${CATS[st.cat].who} near ${esc(where3()?.bldg || 'you')} is booked then. Pick another time on ${DAY_LONG[st.day]}, Oct ${st.day}, or book for now.</p>
  <div class="label" style="margin-top:22px">Open times on ${DAY_LONG[st.day]}, Oct ${st.day}</div>
  <div class="times">${open.map((t) => `<button class="slot ${st.time === t ? 'on' : ''}" data-act="time" data-arg="${t}">${t}</button>`).join('')}</div>
  <button class="link" style="margin-top:18px" data-act="bookNowInstead">Book for now instead</button></div>
  <div class="footer"><button class="btn primary" data-act="rebookTime" ${open.includes(st.time) ? '' : 'disabled'}>${open.includes(st.time) ? `Book ${st.time} instead` : 'Pick an open time'}</button>
    <button class="btn secondary" data-act="back">Go Back</button></div>`;
};

S3['b-nonearby'] = () => `${statusBar()}${head3(bookTitle())}<div class="scroll pad"><h2 class="q" style="margin-top:32px">No Manong is nearby right now</h2>
  <p class="qs">${CATS[st.cat].who[0].toUpperCase() + CATS[st.cat].who.slice(1)}s near ${esc(where3()?.bldg || 'you')} are all on jobs. You haven't been charged. Pick a time later today.</p>
  <div class="label" style="margin-top:22px">Soonest times today</div>
  <div class="times">${['3:00 PM', '4:30 PM', '6:00 PM'].map((t) => `<button class="slot ${st.soonTime === t ? 'on' : ''}" data-act="soonTime" data-arg="${t}">${t}</button>`).join('')}</div></div>
  <div class="footer"><button class="btn primary" data-act="bookSoonest">Book ${st.soonTime} instead</button>
    <button class="btn secondary" data-act="notifyMe">Text me when one is free</button></div>`;

S3['b-review'] = () => {
  const m = nextManong();
  const a = where3();
  const c = c3();
  const chosen = picked3() || (st.preferred && m.first === st.preferred);
  const whenTxt = st.when === 'now' ? 'right now' : `at ${st.time}`;
  const swap = pool3().length > 1 ? `<button class="link" style="justify-self:start" data-act="openManongs">${chosen ? `${picked3() ? 'You picked' : 'You asked for'} ${m.first}. Change` : `Nearest free ${CATS[st.cat].who}. Choose someone else`}</button>` : '';
  const want = st.preferred && !picked3() && m.first !== st.preferred ? note3(`${esc(st.preferred)} isn't free ${whenTxt}. ${m.first} can come instead.`) : '';
  return `${statusBar()}${head3(bookTitle(), 4)}<div class="scroll pad" style="display:grid;gap:12px;align-content:start;padding-bottom:12px">
    <h2 class="q" style="margin-top:20px">Review and confirm</h2>
    <button class="card who" style="padding:14px 16px;text-align:left" data-act="viewManong" data-arg="${m.key}">${ini(m, 56)}
      <div class="grow"><b style="display:flex;gap:6px;align-items:center">${m.name} <span style="color:var(--gcash)">${ic('shieldCheck').replace('class="i ', 'class="i " style="width:18px;height:18px" ')}</span></b><small>${m.skills}</small>
      <div style="font-size:13px;display:flex;gap:4px;align-items:center"><span style="color:#fdbb16">${icFill('star').replace('class="i fill"', 'class="i fill" style="width:16px;height:16px"')}</span><b style="display:inline;font-size:13px">${m.rating}</b> <span style="color:var(--slate)">from ${m.jobs} jobs</span></div></div>${ic('chevR')}</button>
    ${swap}${want}<div class="ticket"><div class="sec rows big">
      <div><span>Service</span><span class="v">${CATS[st.cat].name}, ${t3().tk}</span></div>
      <div><span>${c.issue === 'Issue' ? 'Problem' : c.issue}</span>${val(issue3())}</div><div><span>When</span>${val(whenB3())}</div><div><span>Duration</span><span class="v">${dur3(st.cat, st.tier)}</span></div>
      <button class="f3-rowbtn" data-act="pickWhere"><span>Where</span>${a ? `<span class="v f3-ell">${esc(addrShort(a))}</span>` : '<span class="na">Add address</span>'}</button></div>
      <div class="tear"></div>
      <div class="sec rows big"><div><span>Base charge</span><span class="v">${peso(t3().price)}</span></div>
      <div><span>Materials</span><span class="v">Added after, if needed</span></div>
      <div style="align-items:center"><span>Estimate</span><span class="v" style="font-size:20px;font-weight:800">${peso(t3().price)}</span></div></div></div>
    <div class="label" style="margin:6px 0 0">Pay after the job with</div>
    <div class="paybtns"><button class="${st.pay === 'gcash' ? 'on' : ''}" data-act="payB" data-arg="gcash"><span class="gc">G</span>GCash</button><button class="${st.pay === 'cash' ? 'on' : ''}" data-act="payB" data-arg="cash">${ic('cash')}Cash</button></div>
    <div class="hintline" style="margin-top:0">${ic('info')}Free to cancel until Manong starts the job.</div></div>
  <div class="footer"><button class="btn primary" data-act="confirmB">Confirm booking</button></div>`;
};

// ---------- choose a Manong (U09, U10) ----------
S3['b-manongs'] = () => {
  const now = st.when === 'now';
  const roster = ROSTER3[st.cat];
  const free = roster.filter(isFree3);
  const off = roster.filter((a) => !isFree3(a));
  const sel = st.manongSel || 'auto';
  const rating = (m) => `<small class="f3-rate"><span style="color:#fdbb16">${icFill('star').replace('class="i fill"', 'class="i fill" style="width:14px;height:14px"')}</span>${m.rating} from ${m.jobs} jobs</small>`;
  const row = (a, on) => `<div class="f3-pick"><button class="optrow ${sel === a.m.key ? 'on' : ''}" data-act="manongSel" data-arg="${a.m.key}" role="radio" aria-checked="${sel === a.m.key}" ${on ? '' : 'disabled'}><span class="radio"></span>${ini(a.m, 40)}<span class="grow"><b>${a.m.name}</b>${rating(a.m)}<small class="dur3">${ic('clock')}${on ? (now ? `Free now, ${a.km} km away` : `Free at ${st.time}, ${a.m.area}`) : now ? a.now : `Already booked at ${st.time}`}</small></span></button>\
<button class="chatbtn" data-act="viewManong" data-arg="${a.m.key}" aria-label="View ${a.m.first}'s profile">${ic('user')}</button></div>`;
  return `${statusBar()}${head3('Choose a Manong')}<div class="scroll pad"><h2 class="q" style="margin-top:26px">Who should come?</h2>
  <p class="qs">Every Manong here is accredited in ${esc(where3()?.bldg || 'your building')}.</p><div style="height:18px"></div>
  <div class="f3-pick"><button class="optrow ${sel === 'auto' ? 'on' : ''}" data-act="manongSel" data-arg="auto" role="radio" aria-checked="${sel === 'auto'}"><span class="radio"></span><span class="f3-disc sq y">${ic('nav')}</span><span class="grow"><b>Nearest available</b><small>The closest free ${CATS[st.cat].who}. Fastest option.</small></span></button></div>
  ${free.map((a) => row(a, true)).join('')}
  ${off.length ? `<div class="f3-glabel">${now ? 'Not free right now' : `Not free at ${st.time}`}</div>${off.map((a) => row(a, false)).join('')}` : ''}</div>
  <div class="footer"><button class="btn primary" data-act="manongDone">${sel === 'auto' ? 'Use nearest available' : `Choose ${MANONGS[sel].first}`}</button></div>`;
};

// ---------- after booking ----------
const manongRow = (m, chat = true) => `<div class="sec who"><button class="f3-who" data-act="viewManong" data-arg="${m.key}">${ini(m)}<div class="grow"><b>${m.name}</b><small>Your Manong</small></div></button>
  ${chat ? `<button class="chatbtn" data-act="go" data-arg="b-chat" aria-label="Message ${m.first}">${ic('chat')}</button>` : ''}<button class="callbtn" data-act="call" data-arg="${m.key}" aria-label="Call ${m.first}">${ic('phone')}</button></div>`;

function status3(onDemand) {
  const b = bk();
  if (!b) return `${statusBar()}${head3('Booking', 0, 'home')}<div class="empty">This booking is closed.<br /><button class="link" data-act="home">Back to home</button></div>`;
  if (b.status === 'inprogress') return inprog3(b);
  if (b.status === 'mcancelled') return mcancel3(b);
  if (b.status === 'declined') return mcancel3(b, true);
  if (b.status === 'onway') return onway3(b);
  const m = b.manong;
  // Flow 2's shared timeline promises an arrival time for on-demand; Flow 3 never does.
  const tl = b.status === 'pending'
    ? tl3([['Pending confirmation', 'Sent Oct 20, 4:12 PM', 'cur3'], ['Confirmed', `Waiting for ${m.first} to confirm`, ''], ['In progress', `Starts ${DAY_LONG[b.day]} at ${b.time}`, ''], ['Completed', 'You review charges and pay', '']])
    : timeline(b).replace(', arriving in about 25 min', ", we'll tell you when he heads out");
  return `${statusBar()}${head3(`Booking ${b.id}`, 0, 'home')}<div class="scroll pad" style="padding-top:20px">
    <div class="ticket"><div class="sec head f3-headcol" style="padding-top:18px"><div style="min-width:0"><div style="font-size:18px;font-weight:700">${svcName(b)}</div>
      <div style="font-size:15px;font-weight:600;margin-top:2px">${onDemand ? 'Requested now' : `${DAY_LONG[b.day]}, Oct ${b.day} at ${b.time}`}</div><div class="f3-ell">${esc(addrShort(st.addrs[b.addr]))}</div></div>${ringFor(b.status)}</div>
      <div class="tear"></div><div class="sec">${tl}</div><div class="tear"></div>${manongRow(m)}</div>
    <div style="height:12px"></div>${b.status === 'late' ? note3(`${m.first} is running late. We'll tell you when he's close.`, 'clock') : b.status === 'pending' ? note3(`We'll text you when ${m.first} confirms. If he can't make it, we'll help you find another Manong.`, 'clock') : note3(guardTip(b))}</div>
  <div class="footer">${b.status === 'late' ? `<button class="btn secondary" data-act="go" data-arg="b-chat">Message ${m.first}</button>`
    : '<p class="f3-small" style="margin:0 0 4px;text-align:center">You can cancel for free until Manong starts the job.</p><button class="btn danger" data-act="cancelStart">Cancel booking</button>'}</div>`;
}
// Replaces the old "show your PIN" tip: the resident tells their own guard who is coming.
const GUARD_JOB = { plumbing: 'a plumbing repair', electrical: 'an electrical repair', cleaning: 'a cleaning', repairs: 'a repair', locks: 'a lock job', moving: 'your move' };
const guardTip = (b) => `Make sure your condo guards know ${b.cat === 'moving' ? 'the movers are' : 'a Manong is'} coming for ${GUARD_JOB[b.cat]}.`;
// Timeline rows marked 'done' (checked), 'cur3' (current) or '' (still to come).
const tl3 = (steps) => `<div class="tl">${steps.map(([t, s, c]) => `<div class="step ${c}"><span class="node">${c === 'done' ? ic('check') : ''}</span><div><b>${t}</b><small>${esc(s)}</small>${c === 'cur3' ? '<span class="cur">Current status</span>' : ''}</div></div>`).join('')}</div>`;
function inprog3(b) {
  const m = b.manong;
  const steps = [['Confirmed', 'Oct 20, 4:15 PM', 'done'], [`${m.first} arrived`, `10:28 AM, at ${st.addrs[b.addr]?.short || 'your place'}`, 'done'],
    ['In progress', `Fixing the ${b.problem.toLowerCase()}`, 'cur3'], ['Completed', 'You review charges and pay', '']];
  return `${statusBar()}${head3(`Booking ${b.id}`, 0, 'home')}<div class="scroll pad" style="padding-top:20px">
    <div class="ticket"><div class="sec head f3-headcol" style="padding-top:18px"><div><div style="font-size:18px;font-weight:700">${svcName(b)}</div><div style="font-size:13px;color:var(--slate);margin-top:2px">Started 10:32 AM</div></div>${ring3('inprogress')}</div>
      <div class="tear"></div><div class="sec">${tl3(steps)}</div>
      <div class="tear"></div>${manongRow(m, false)}</div></div>
  <div class="footer"><button class="btn secondary" data-act="go" data-arg="b-chat">Message ${m.first}</button></div>`;
}

// Book 5b: day of the job. The map fills the screen; a draggable sheet holds the details.
const SHEET_PEEK = 440;
const SHEET_OPEN = 130;
function onway3(b) {
  const m = b.manong;
  const where = st.addrs[b.addr];
  const tower = where?.short.split(', ').pop() || 'your place';
  const top = st.sheetTop || SHEET_PEEK;
  const steps = [['Pending confirmation', 'Oct 20, 4:12 PM', 'done'], ['Confirmed', `${m.first} confirmed at 4:15 PM`, 'done'],
    ['On the way', `${m.first} is heading to ${tower}`, 'cur3'], ['In progress', `Starts once ${m.first} arrives`, ''], ['Completed', 'You review charges and pay', '']];
  return `${statusBar()}${head3(`Booking ${b.id}`, 0, 'home')}
  <div class="mapfull f3-onmap" aria-label="Map: ${m.first} is 6 km away">
    <svg width="375" height="440" style="position:absolute;inset:0" aria-hidden="true"><path d="M300 170 C 285 220, 270 240, 250 280 S 210 350, 190 375" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
    <span class="f3-pin" style="left:283px;top:150px">${ic('home')}</span>
    <span class="mappill" style="left:262px;top:192px;padding:4px 10px">${esc(tower)}</span>
    <span class="f3-mapav" style="transform:translate(222px, 270px)">${m.ini}</span>
    <span class="mappill" style="left:130px;top:228px;background:#111;color:#fff">${ic('nav')}6 km</span></div>
  ${top === SHEET_PEEK ? `<button class="floatbtn" style="right:24px;top:${top - 60}px;z-index:2" data-act="toast" data-arg="Centered on your building" aria-label="Center map">${ic('locate')}</button>` : ''}
  <div class="f3-sheet" style="top:${top}px">
    <div class="f3-drag" data-drag><button class="f3-grab" data-act="sheetToggle" aria-label="${top === SHEET_PEEK ? 'Show more details' : 'Show less'}"></button>
      <div style="font-size:18px;font-weight:700">${svcName(b)}</div><div style="font-size:15px;font-weight:600;margin-top:2px">Today at ${b.time}</div>
      <div class="f3-ell" style="color:var(--slate);font-size:13px">${esc(addrShort(where))}</div><div style="height:12px"></div>${ring3('onway')}</div>
    <div class="tear"></div>
    <div class="sec who">${ini(m)}<div class="grow"><b>${m.name}</b><small>${m.vehicle}</small></div><button class="callbtn" data-act="call" data-arg="${m.key}" aria-label="Call ${m.first}">${ic('phone')}</button></div>
    <div class="tear"></div><div class="sec">${tl3(steps)}</div></div>`;
}
// Dragging the sheet's top area moves it; letting go snaps it open or back to the peek height.
phone.addEventListener('pointerdown', (e) => {
  const zone = e.target.closest('[data-drag]');
  if (!zone) return;
  const el = zone.closest('.f3-sheet');
  st.sheetDragged = false; // only the click that ends this drag is swallowed
  const scale = phone.getBoundingClientRect().height / phone.offsetHeight;
  const y0 = e.clientY;
  const top0 = el.offsetTop;
  let moved = false;
  el.style.transition = 'none'; // follow the finger; the CSS transition only animates the snap
  const move = (ev) => {
    const dy = (ev.clientY - y0) / scale;
    if (Math.abs(dy) > 4) moved = true;
    el.style.top = `${Math.min(SHEET_PEEK, Math.max(SHEET_OPEN, top0 + dy))}px`;
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    el.style.transition = '';
    if (!moved) return;
    st.sheetDragged = true;
    st.sheetTop = parseFloat(el.style.top) < (SHEET_PEEK + SHEET_OPEN) / 2 ? SHEET_OPEN : SHEET_PEEK;
    render();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
});
function mcancel3(b, declined = false) {
  const m = b.manong;
  return `${statusBar()}${head3(`Booking ${b.id}`, 0, 'home')}<div class="scroll pad"><h2 class="q" style="margin-top:32px">${declined ? `${m.first} can't take this job` : `${m.first} had to cancel`}</h2>
  <p class="qs">${declined ? "He couldn't make that time. Your request is closed and you won't be charged." : "Something came up on his side. Your booking is safe and you won't be charged."}</p>
  <div class="label" style="margin-top:22px">What would you like to do?</div>
  ${[['Find another Manong', 'Same day and time'], ['Pick a new time', 'Choose another day']].map(([t, s], i) => `<button class="optrow ${st.mcPick === i ? 'on' : ''}" data-act="mcPick" data-arg="${i}" role="radio" aria-checked="${st.mcPick === i}"><span class="radio"></span><span class="grow"><b>${t}</b><small>${s}</small></span></button>`).join('')}</div>
  <div class="footer"><button class="btn primary" data-act="mcContinue">Continue</button></div>`;
}
S3['b-status'] = () => status3(false);
S3['b-ondemand'] = () => status3(true);
S3['b-onway'] = () => status3(false);

S3['b-live'] = () => {
  const b = bk();
  if (!b) return status3(false);
  const m = b.manong;
  const t = Math.max(st.liveEta, 0);
  const prog = 1 - t / 18;
  const x = 190 + (300 - 190) * prog;
  const y = 355 - (355 - 150) * prog;
  return `${statusBar()}<div class="mapfull" style="bottom:280px">
    <svg width="375" height="532" style="position:absolute;inset:0" aria-hidden="true"><path d="M300 150 C 285 200, 270 220, 250 260 S 210 330, 190 355" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
    <span style="position:absolute;left:283px;top:130px;width:36px;height:36px;border-radius:50%;background:#111;color:var(--mango);display:grid;place-items:center">${ic('home')}</span>
    <span class="mappill" style="left:262px;top:172px;padding:4px 10px">${esc(st.addrs[b.addr]?.short.split(', ').pop() || 'Home')}</span>
    <span class="f3-mapav" style="transform:translate(${x - 26}px, ${y - 26}px)">${m.ini}</span>
    <span class="mappill" style="left:262px;top:262px;background:#111;color:#fff">${ic('nav')}${t > 0 ? `${+(t / 3).toFixed(1)} km` : 'Here'}</span></div>
  <button class="floatbtn" style="left:24px;top:56px" data-act="back" aria-label="Back">${ic('chevL')}</button>
  <span class="mappill" style="right:24px;top:58px"><span class="live"></span>Live location</span>
  <button class="floatbtn" style="right:24px;top:410px" data-act="toast" data-arg="Centered on your building" aria-label="Center map">${ic('locate')}</button>
  <div class="mapsheet"><div class="grab" style="width:40px;height:5px;border-radius:3px;background:rgba(0,0,0,.15);margin:0 auto"></div>
    <h2>${t > 0 ? `${m.first} is on the way` : `${m.first} has arrived`}</h2>
    <p style="margin:0 0 14px;color:var(--slate);font-size:14px">${t > 0 ? `${+(t / 3).toFixed(1)} km away. Follow him live on the map.` : 'He is at your lobby now'}</p>
    <div class="ticket"><div class="sec head f3-headcol"><div><div style="font-size:16px;font-weight:600">${svcName(b)}</div><div style="font-size:13px;color:var(--slate)">${esc(st.addrs[b.addr]?.short || '')}, ${b.id}</div></div>${ring3(t > 0 ? 'onway' : 'inprogress')}</div>
      <div class="tear"></div><div class="sec who">${ini(m)}<div class="grow"><b>${m.name}</b><small>${m.vehicle}</small></div><button class="callbtn" data-act="call" data-arg="${m.key}" aria-label="Call">${ic('phone')}</button></div></div>
    ${t <= 0 ? '<button class="btn primary" style="margin-top:12px" data-act="go" data-arg="b-status">View job status</button>' : '<div style="text-align:center;margin-top:8px"><button class="link" style="color:var(--destructive)" data-act="cancelStart">Cancel booking</button></div>'}
  </div>`;
};

S3['b-part'] = () => {
  const b = bk();
  const [name, price, why] = c3(b.cat).part;
  return `${statusBar()}${head3(`Booking ${b.id}`)}<div class="scroll pad"><h2 class="q" style="margin-top:32px">${b.manong.first} needs a part</h2>
  <p class="qs">Approve it before he adds it to your bill. Nothing changes unless you say yes.</p><div style="height:20px"></div>
  <div class="ticket"><div class="sec who"><span class="f3-disc sq">${ic(CATS[b.cat].icon)}</span><div class="grow"><b>${name}</b><small>${why}</small></div><b style="font-size:18px">${peso(price)}</b></div>
    <div class="tear"></div><div class="sec rows"><div><span>Base charge</span><span class="v">${peso(base3(b))}</span></div><div><span>This part</span><span class="v">${peso(price)}</span></div>
    <div style="font-size:15px"><b>New total</b><b>${peso(total3(b) + price)}</b></div></div></div>
  <div style="height:20px"></div>${note3(`Not sure? Message ${b.manong.first} first. If you decline, he finishes the base repair only.`)}</div>
  <div class="footer"><button class="btn primary" data-act="partApprove">Approve ${peso(price)}</button><button class="btn secondary" data-act="partDecline">Decline</button></div>`;
};

const bill3 = (b) => {
  const mats = mats3(b);
  return `<div class="ticket"><div class="sec head" style="padding-top:18px;align-items:center"><span class="t" style="font-size:16px">${t3(b).name}</span>${ring3('completed')}</div>
    <div class="sec rows" style="padding-top:0"><div><span>Base charge</span><span class="v">${peso(base3(b))}</span></div></div>
    ${mats.length ? `<div class="tear"></div><div class="sec rows"><div><span class="v" style="font-weight:600">Materials added <span style="color:var(--slate);font-weight:400">${mats.length} item${mats.length > 1 ? 's' : ''}</span></span><span></span></div>
      ${mats.map(([n, p]) => `<div><span>${n}</span><span class="v">${peso(p)}</span></div>`).join('')}</div>` : ''}
    <div class="tear"></div>
    <div class="sec"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px">Total</b><b style="font-size:26px">${peso(total3(b))}</b></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:14px"><span style="display:flex;gap:8px;align-items:center;color:var(--slate)">${st.pay === 'gcash' ? '<span class="gc">G</span>Paying with GCash' : ic('cash') + 'Paying with cash'}</span><button class="link" data-act="payToggle">Change</button></div></div></div>`;
};
S3['b-charges'] = () => {
  const b = bk();
  return `${statusBar()}${head3(`Booking ${b.id}`, 0, 'home')}<div class="scroll pad"><h2 class="q" style="margin-top:26px">${b.manong.first} finished the job</h2><p class="qs">Check the charges before you pay.</p><div style="height:16px"></div>
  ${bill3(b)}<div style="height:12px"></div>${note3(`Ask ${b.manong.first} about any charge you don't recognize. Paying closes ticket ${b.id}.`)}</div>
  <div class="footer"><button class="btn primary" data-act="payNow">${st.pay === 'gcash' ? `Pay ${peso(total3(b))} with GCash` : `I paid ${peso(total3(b))} in cash`}</button>
    <button class="link" data-act="openReport">Report a problem</button></div>`;
};
S3['b-payfail'] = () => {
  const b = bk();
  return `${statusBar()}${head3(`Booking ${b.id}`, 0, 'home')}<div class="scroll pad"><h2 class="q" style="margin-top:26px">GCash payment failed</h2><p class="qs">GCash declined it, so nothing was charged.</p><div style="height:16px"></div>
  ${bill3(b)}<div style="height:12px"></div>${note3('Check your GCash balance, or pay in cash.', 'info', 'bad')}</div>
  <div class="footer"><button class="btn primary" data-act="payNow">Try GCash again</button><button class="link" data-act="payCash">Pay in cash instead</button></div>`;
};

S3['b-rate'] = () => {
  const b = bk();
  const m = b.manong;
  return `${statusBar()}<div class="scroll"><div class="f3-rateband"><div class="ticket" style="--notch:var(--mango)"><div class="sec head" style="align-items:center"><span class="t">${svcName(b)}</span>${ringFor('paid')}</div><div class="tear"></div>
      <div class="sec" style="font-size:13px;color:var(--slate)">${peso(total3(b))} with ${st.pay === 'gcash' ? 'GCash' : 'cash'}, receipt emailed</div></div></div>
  <div class="pad" style="padding-top:16px">${ini(m, 56)}
    <h2 class="q" style="margin-top:12px">How did ${m.first} do?</h2><p class="qs">Your rating helps other residents in ${esc(st.addrs[b.addr]?.bldg || 'your building')}.</p>
    <div class="stars" style="margin:16px 0 6px">${[1, 2, 3, 4, 5].map((n) => `<button class="${n <= st.starsB ? 'on' : ''}" data-act="starB" data-arg="${n}" aria-label="${n} stars">${ic('star')}</button>`).join('')}</div>
    <b style="color:var(--gold);font-size:15px">${STAR3[st.starsB] || 'Tap a star'}</b>
    <div class="label">${st.starsB >= 4 || !st.starsB ? 'What went well?' : 'What could be better?'}</div>
    <div class="chips">${PRAISE_B.map((p) => `<button class="chip ${st.praiseB.includes(p) ? 'on' : ''}" data-act="praiseB" data-arg="${p}">${p}</button>`).join('')}</div>
    <textarea class="box" rows="3" style="margin-top:14px" data-model="review" placeholder="Add a note for ${m.first} (optional)" aria-label="Note">${esc(st.review)}</textarea></div></div>
  <div class="footer"><button class="btn primary" data-act="submitB" ${st.starsB ? '' : 'disabled'}>Submit rating</button><button class="link" data-act="skipRate">Skip for now</button></div>`;
};

S3['b-thanks'] = () => `${statusBar()}<div class="scroll pad" style="display:flex;flex-direction:column;justify-content:center;text-align:center">
  <div class="f3-mark" style="margin:0 auto"><img src="${A}svg/mang-juan-mark.svg" alt="" /></div>
  <h2 class="q" style="margin-top:24px">Salamat, ${esc(st.user.first)}!</h2><p class="qs">Your rating was sent. Ticket closed and receipt emailed.</p></div>
  <div class="footer"><button class="btn primary" data-act="home">Back to home</button><button class="link" data-act="startB" data-arg="plumbing">Book another job</button></div>`;

// ---------- cancellations and problems ----------
S3['b-cancelled'] = () => {
  const c = st.cancelled;
  if (!c) return S3['b-home']();
  const b = c.b;
  return `${statusBar()}${head3(`Booking ${b.id}`, 0, 'home')}<div class="scroll pad"><h2 class="q" style="margin-top:32px">Booking cancelled</h2>
  <p class="qs">${c.fee ? `You paid a ${peso(c.fee)} trip fee. ${b.manong.first} has been told.` : `You weren't charged. ${b.manong.first} has been told, and the slot is free again.`}</p><div style="height:20px"></div>
  <div class="ticket"><div class="sec head f3-headcol" style="padding-top:18px"><div><div style="font-size:18px;font-weight:700">${svcName(b)}</div><div style="font-size:13px;color:var(--slate)">Was set for ${b.mode === 'now' ? 'today, now' : `${DAY_LONG[b.day]}, Oct ${b.day}, ${b.time}`}</div></div>${ring3('cancelled')}</div>
    <div class="tear"></div><div class="sec rows"><div><span>Cancelled on</span><span class="v">Oct 20, 6:02 PM</span></div><div><span>Reason</span><span class="v">${esc(c.reason)}</span></div><div><span>Charge</span><span class="v">${peso(c.fee)}</span></div></div></div></div>
  <div class="footer"><button class="btn primary" data-act="rebookFromCancel">Book a new time</button><button class="link" data-act="home">Go to home</button></div>`;
};

S3['b-report'] = () => {
  const b = bk();
  return `${statusBar()}${head3(`Booking ${b ? b.id : ''}`)}<div class="scroll pad"><h2 class="q" style="margin-top:28px">What went wrong?</h2><p class="qs">Tell us and we'll sort it out with ${b ? b.manong.first : 'your Manong'}.</p>
  <div class="chips" style="margin-top:18px" id="repBox">${REPORT_REASONS.map((r, i) => `<button class="chip ${st.repReason === i ? 'on' : ''}" data-act="repPick" data-arg="${i}" aria-pressed="${st.repReason === i}">${r}</button>`).join('')}</div>
  <div class="label" style="margin-top:20px">What happened</div>
  <div class="boxwrap"><textarea class="box" rows="3" maxlength="300" data-model="repText" placeholder="e.g. The sink started dripping again an hour after he left." aria-label="What happened">${esc(st.repText)}</textarea><span class="count"><span data-live="repCount"></span> / 300</span></div>
  <div class="f3-photorow">${st.photos.length ? `<div class="ph"><img src="${st.photos[0]}" alt="" /></div>` : `<button class="addph" data-act="takePhoto" data-arg="B">${ic('camera')}Add</button>`}<small>Photos help us check faster. Optional.</small></div></div>
  <div class="footer"><button class="btn primary" data-act="sendReport">Send report</button></div>`;
};
S3['b-reportsent'] = () => {
  const b = bk() || st.cancelled?.b || { id: 'MJ-8821', manong: ALF3 };
  return `${statusBar()}${head3(`Booking ${b.id}`, 0, 'home')}<div class="scroll pad"><h2 class="q" style="margin-top:32px">We got your report</h2>
  <p class="qs">Ticket ${b.id}-R1. We'll text you each time there's an update.</p><div style="height:20px"></div>
  <div class="card" style="padding:18px 20px"><b style="font-size:17px">What happens next</b><ol class="f3-steps">
    <li><span>1</span><div><b>We review your report</b><small>We'll text you once we've looked at it.</small></div></li>
    <li><span>2</span><div><b>We check with ${b.manong.first}</b><small>He gets a chance to explain.</small></div></li>
    <li><span>3</span><div><b>We make it right</b><small>A free revisit or a refund if the fix failed.</small></div></li></ol></div></div>
  <div class="footer"><button class="btn primary" data-act="reportBack">Back to booking</button><button class="link" data-act="home">Go to home</button></div>`;
};

// ---------- bookings tab ----------
const upcoming3 = () => {
  const list = [];
  const b = bk();
  if (b && b.status !== 'paid') list.push({ day: b.day, time: b.mode === 'now' ? 'Now' : b.time, title: b.cat === 'plumbing' ? 'Plumbing repair' : svcName(b), sub: `${b.manong.name}, ${(STAMP[b.status] || '').toLowerCase()}`, act: 'openBooking', arg: '' });
  st.upcoming.forEach((u, i) => list.push({ ...u, sub: `${u.with}, confirmed`, act: 'openUpcoming', arg: i }));
  return list.sort((x, y) => x.day - y.day);
};
const entry3 = (e) => `<button class="f3-entry" data-act="${e.act}" data-arg="${e.arg}"><span class="tm"><b>${e.time}</b></span><span class="grow"><b>${esc(e.title)}</b><small>${esc(e.sub)}</small></span>${ic('chevR')}</button>`;
function calendar3() {
  const mo = MONTHS[st.calMonth + 1];
  const oct = st.calMonth === 0;
  const list = upcoming3();
  const has = new Set(oct ? list.map((e) => e.day) : []);
  const cells = [...Array(mo.start).fill(''), ...Array.from({ length: mo.days }, (_, i) => i + 1)];
  const sel = oct ? st.calDay : null;
  const dayList = list.filter((e) => e.day === sel);
  const next = list.find((e) => e.day > (sel || 0));
  return `<div class="f3-cal"><div class="mhead"><b>${mo.name}</b><span style="display:flex;gap:8px"><button data-act="calMonth" data-arg="-1" aria-label="Previous month" ${st.calMonth <= -1 ? 'disabled' : ''}>${ic('chevL')}</button><button data-act="calMonth" data-arg="1" aria-label="Next month" ${st.calMonth >= 1 ? 'disabled' : ''}>${ic('chevR')}</button></span></div>
    <div class="grid">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<span class="dow">${d}</span>`).join('')}
    ${cells.map((d) => (d ? `<button class="d ${st.calMonth < 0 || (oct && d < 20) ? 'past' : ''} ${oct && d === 20 ? 'today' : ''} ${d === sel ? 'sel' : ''} ${has.has(d) ? 'has' : ''}" data-act="calDay" data-arg="${d}">${d}</button>` : '<span></span>')).join('')}</div></div>
  ${oct && sel ? `<h3 class="sect" style="font-size:18px;margin:20px 0 12px">${octDay(sel)}, Oct ${sel}</h3>${dayList.length ? dayList.map(entry3).join('') : '<p class="f3-small" style="margin:0 0 12px">Nothing booked on this day.</p>'}` : `<p class="f3-small" style="margin:20px 0 12px">${oct ? 'Pick a day to see what is booked.' : `Nothing booked in ${mo.name.split(' ')[0]}.`}</p>`}
  ${oct && next && next.day !== sel ? `<button class="f3-entry" data-act="calDay" data-arg="${next.day}"><span class="grow"><small class="next">Next: ${octDay(next.day)}, Oct ${next.day}</small><b>${esc(next.title)} at ${next.time}</b></span>${ic('chevR')}</button>` : ''}`;
}
S3['b-bookings'] = () => {
  const up = upcoming3();
  return `${statusBar()}<div class="f3-tabhead"><h2>Bookings</h2><div class="f3-seg" role="tablist"><button class="${st.bkTab === 'up' ? 'on' : ''}" data-act="bkTab" data-arg="up" role="tab">Upcoming</button><button class="${st.bkTab === 'past' ? 'on' : ''}" data-act="bkTab" data-arg="past" role="tab">Past</button></div></div>
  <div class="scroll pad f3-overlap">${st.bkTab === 'past'
    ? st.past3.map((p, i) => `<button class="f3-entry" data-act="openPast" data-arg="${i}"><span class="f3-disc sq">${ic(CATS[p.cat].icon)}</span><span class="grow"><b>${esc(p.title)}</b><small>${p.date}, ${p.manong ? p.manong.name : 'you cancelled'}</small></span><span class="f3-amt"><b>${peso(p.total)}</b><small class="${p.status}">${p.status === 'paid' ? 'Paid' : 'Cancelled'}</small></span></button>`).join('') || '<p class="empty">No past bookings yet.</p>'
    : up.length ? calendar3()
      : `<div class="f3-emptybig"><img src="${A}illo-crew.png" alt="" /><h3>No upcoming bookings</h3><p class="qs" style="margin:0 0 18px">When you book a Manong, the day and time show up here.</p><button class="btn primary" data-act="home">Book a Manong</button></div>`}
  </div>${tabbarB('b-bookings')}`;
};

S3['b-receipt'] = () => {
  const p = st.past3[st.receiptIdx];
  const paid = p.status === 'paid';
  return `${statusBar()}${head3(`Booking ${p.id}`)}<div class="scroll pad" style="padding-top:20px">
  <div class="ticket"><div class="sec head f3-headcol" style="padding-top:18px"><div><div style="font-size:18px;font-weight:700">${esc(p.title)}</div><div style="font-size:13px;color:var(--slate)">${p.date}, ${p.time}</div></div>${ringFor(p.status)}</div>
    ${p.manong ? `<div class="tear"></div><div class="sec who">${ini(p.manong)}<div class="grow"><b>${p.manong.name}</b><small>${p.stars ? `You rated him ${p.stars} stars` : 'Not rated yet'}</small></div>
      <span class="f3-mini">${[1, 2, 3, 4, 5].map((n) => `<span class="${n <= p.stars ? 'on' : ''}">${icFill('star')}</span>`).join('')}</span></div>` : ''}
    <div class="tear"></div><div class="sec rows">${p.lines.map(([n, v]) => `<div><span>${n}</span><span class="v">${peso(v)}</span></div>`).join('')}</div>
    <div class="tear"></div><div class="sec"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">Total</b><b style="font-size:22px">${peso(p.total)}</b></div>
      <div class="rows" style="margin-top:8px"><div><span>${paid ? 'Paid with' : 'Charge'}</span><span class="v">${paid ? `${p.pay === 'cash' ? 'Cash' : 'GCash'}, receipt emailed` : 'No charge'}</span></div></div></div></div></div>
  <div class="footer"><button class="btn primary" data-act="bookAgain3" data-arg="${st.receiptIdx}">${p.manong ? `Book ${p.manong.first} again` : 'Book again'}</button>${paid ? '<button class="link" data-act="downloadReceipt">Download receipt</button>' : ''}</div>`;
};

// ---------- profile and Manong ----------
S3['b-profile'] = () => {
  const row = (act, arg, icon, label, val) => `<button class="f3-row" data-act="${act}" data-arg="${arg}"><span class="f3-disc sq">${ic(icon)}</span><b>${label}</b>${val ? `<small>${val}</small>` : ''}${ic('chevR')}</button>`;
  return `${statusBar()}<div class="f3-profhead"><span class="f3-avatar">${esc((st.user.first[0] || '') + (st.user.last[0] || ''))}</span><div class="grow"><b>${esc(userName())}</b><small>${esc(st.user.phone)}</small></div><button class="f3-edit" data-act="editName">Edit</button></div>
  <div class="scroll pad f3-overlap2"><div class="f3-list">
    ${row('go', 'b-addresses', 'pin', 'Saved addresses', `${st.addrs.length} place${st.addrs.length === 1 ? '' : 's'}`)}
    ${row('openPayments', '', 'cash', 'Payment methods', st.pay === 'gcash' ? 'GCash' : 'Cash')}
    ${row('go', 'b-notifs', 'bell', 'Notifications', 'On')}
    ${row('editName', '', 'user', 'Personal details', '')}</div>
    <div class="label">Support</div><div class="f3-list">
    ${row('toast', 'Help center opens in your browser', 'info', 'Help center', '')}
    ${row('toast', 'Every Manong is ID-verified. Your number stays hidden until you book.', 'shieldCheck', 'Safety and privacy', '')}</div>
    <button class="f3-logout" data-act="logout">Log out</button><p class="f3-ver">Mang Juan 1.0</p></div>${tabbarB('b-profile')}`;
};

S3['b-name'] = () => `${statusBar()}${head3('Personal details')}<div class="scroll pad"><h2 class="q" style="margin-top:28px;margin-bottom:24px">What should Manong call you?</h2>${nameForm()}
  <div class="field"><label>Mobile number</label><div class="input f3-in" style="color:var(--slate)">${esc(st.user.phone)}</div></div></div>
  <div class="footer"><button class="btn primary" data-act="saveName">Save</button></div>`;

S3['b-addresses'] = () => `${statusBar()}${head3('Saved addresses')}<div class="scroll pad" style="padding-top:20px">
  ${st.addrs.map((a, i) => `<div class="f3-addr"><span class="f3-disc sq">${ic('pin')}</span><div class="grow"><b>${esc(a.label)}</b>${i === 0 ? '<span class="f3-tag2">Default</span>' : ''}<small>${esc(addrFull(a))}</small>${a.note ? `<small class="nt">Note: ${esc(a.note)}</small>` : ''}</div><button class="link" data-act="addrEdit" data-arg="${i}">Edit</button></div>`).join('') || '<p class="empty">No saved addresses yet.</p>'}</div>
  <div class="footer"><button class="btn primary" data-act="addrNew">Add an address</button></div>`;

S3['b-addrform'] = () => `${statusBar()}${head3(st.addrEdit < 0 ? 'Add an address' : 'Edit address')}<div class="scroll pad"><h2 class="q" style="margin-top:28px;margin-bottom:24px">Where should Manong go?</h2>${addrFields('af')}
  ${st.addrEdit > 0 ? `<button class="link" style="color:var(--destructive)" data-act="addrRemove">Remove this address</button>` : ''}</div>
  <div class="footer"><button class="btn primary" data-act="addrSave">Save address</button></div>`;

S3['b-payments'] = () => `${statusBar()}${head3('Payment methods')}<div class="scroll pad"><h2 class="q" style="margin-top:28px;margin-bottom:16px">Payment method</h2>
  ${[['gcash', 'GCash', `Linked to ${st.user.phone}`], ['cash', 'Cash', 'Pay your Manong directly']].map(([k, t, s]) => `<button class="optrow ${st.payPick === k ? 'on' : ''}" data-act="payPick" data-arg="${k}" role="radio" aria-checked="${st.payPick === k}"><span class="radio"></span><span class="grow"><b>${t}</b><small>${esc(s)}</small></span>${st.pay === k ? '<span class="price"><small class="gold">Default</small></span>' : ''}</button>`).join('')}
  <button class="f3-dashed" data-act="toast" data-arg="Card payments aren't part of this prototype">+ Add a debit or credit card</button></div>
  <div class="footer"><button class="btn primary" data-act="paySave">Save</button></div>`;

S3['b-notifs'] = () => {
  let g = '';
  return `${statusBar()}${head3('Notifications')}<div class="scroll pad" style="padding-bottom:20px">${st.notifs3.map((n, i) => {
    const label = n.g !== g ? `<div class="f3-glabel">${n.g}</div>` : '';
    g = n.g;
    return `${label}<button class="f3-notif ${n.unread ? 'unread' : ''}" data-act="notif3" data-arg="${i}"><span class="f3-disc sq">${ic(n.icon)}</span><p>${esc(n.t)}</p><span class="tm">${n.time}${n.unread ? '<i class="dot"></i>' : ''}</span></button>`;
  }).join('')}</div>`;
};

S3['b-manong'] = () => {
  const m = MANONGS[st.viewManong] || ALF3;
  const cat = catOf3(m);
  const [who, quote] = REVIEW[m.key] || CAT_REVIEW3[cat] || REVIEW.alfred3;
  const mid = st.stack.includes('b-review');
  const bldg = where3()?.bldg;
  const used = st.past3.some((p) => p.manong && p.manong.key === m.key);
  return `${statusBar()}${head3('Manong profile', 0, 'back', 'tall')}<div class="scroll pad"><div class="f3-bigav">${m.ini}</div>
  <div style="text-align:center"><h2 class="q" style="margin-top:12px;font-size:24px">${m.name}</h2><p class="qs" style="margin:4px 0 10px">${m.skills}, ${m.area}</p><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center"><span class="f3-verified">${ic('shieldCheck')}ID-verified Manong</span>${bldg ? `<span class="f3-verified">${ic('building')}Accredited in ${esc(bldg)}</span>` : ''}</div></div>
  <div class="f3-stats"><div><b>${m.rating}</b><small>Rating</small></div><div><b>${m.jobs}</b><small>Jobs done</small></div><div><b>${m.years}</b><small>On Mang Juan</small></div></div>
  <div class="label">Good at</div><div class="f3-hscroll">${(GOOD_AT[m.key] || CAT_GOOD3[cat] || []).map((s) => `<span class="chip" style="display:inline-flex;align-items:center">${s}</span>`).join('')}</div>
  <div class="label" style="margin-top:18px">What residents say</div>
  <div class="card" style="padding:16px"><div style="display:flex;justify-content:space-between;align-items:center"><span class="f3-mini">${[1, 2, 3, 4, 5].map(() => `<span class="on">${icFill('star')}</span>`).join('')}</span><small style="color:var(--slate)">${who}</small></div><p style="margin:10px 0 0;line-height:1.5">${quote}</p></div></div>
  <div class="footer">${mid ? `<button class="btn primary" data-act="pickFromProfile" data-arg="${m.key}">Choose ${m.first}</button>` : `<button class="btn primary" data-act="bookAgainM">Book ${m.first}${used ? ' again' : ''}</button>`}</div>`;
};

S3['b-chat'] = () => {
  const b = bk();
  const m = b ? b.manong : ALF3;
  return `${statusBar()}${head3(m.name)}<div class="scroll pad" id="chatLog" style="padding-top:16px">
  <div class="f3-chatcard"><span>${b ? `${CATS[b.cat].name}, ${b.mode === 'now' ? 'today' : `${DAY_LONG[b.day]}, Oct ${b.day}, ${b.time}`}` : 'No active booking'}</span>${b ? `<span style="color:var(${['pending', 'declined', 'mcancelled'].includes(b.status) ? '--slate' : '--success'})">${STAMP[b.status]}</span>` : ''}</div>
  <div class="f3-msgs"><span class="f3-day">Today</span>${st.chat3.map((c) => (c.sys ? `<button class="f3-sys" data-act="${b ? 'trackLive' : 'noop'}">${ic('pin')}${esc(c.sys.replace('Alfred', m.first))}</button>`
    : `<div class="f3-bub ${c.me ? 'me' : 'them'}">${esc(c.t)}<small>${c.time}</small></div>`)).join('')}</div></div>
  <div class="f3-quick">${["I'm coming down", 'Door is open'].map((q) => `<button class="chip" data-act="sendChat" data-arg="${q}">${q}</button>`).join('')}</div>
  <form class="f3-chatbar" data-form="chat"><input name="m" placeholder="Message ${m.first}" aria-label="Message" autocomplete="off" /><button type="submit" aria-label="Send">${ic('chevR')}</button></form>`;
};

// ---------- sheets ----------
const SHEETS3 = {
  cancel3: () => `<h3>Cancel this booking?</h3><div class="label">Tell us why (optional)</div>
    <div class="chips">${CANCEL_REASONS.map((r, i) => `<button class="chip ${st.sheet.reason === i ? 'on' : ''}" data-act="cancelReason" data-arg="${i}">${r}</button>`).join('')}</div>
    <div class="stack" style="margin-top:20px"><button class="btn primary" data-act="closeSheet">Keep my booking</button><button class="btn danger" data-act="confirmCancel3" data-arg="0">Yes, cancel booking</button></div>`,
  lateFee: () => `<h3>${bk().manong.first} is already on his way</h3><p class="sub">Cancelling now has a small fee to cover Manong's trip.</p>
    <div class="f3-feebox rows"><div><span>Trip fee</span><span class="v">₱100</span></div><div><span>Charged to</span><span class="v">${st.pay === 'gcash' ? 'GCash' : 'Cash'}</span></div><div><span>Rest of the booking</span><span class="v">₱0</span></div></div>
    <div class="stack"><button class="btn primary" data-act="closeSheet">Keep my booking</button><button class="btn danger" data-act="confirmCancel3" data-arg="100">Cancel and pay ₱100</button></div>`,
  paying: () => `<div class="spin"></div><h3 style="text-align:center">Paying with GCash…</h3><p class="sub" style="text-align:center">Sending ${peso(total3(bk()))} to ${bk().manong.first}.</p>`,
};

// ---------- actions ----------
const draftFrom = (b) => Object.assign(st, { cat: b.cat, tier: b.tier, desc: '', symptoms: [], photos: [], when: 'schedule', day: b.day > 20 ? b.day : 21, time: b.time.includes('AM') || b.time.includes('PM') ? b.time : '10:30 AM', pickManong: null, retried: false });
const ACT3 = {
  // registration
  regStart(mode) {
    Object.assign(st, { regMode: mode, phoneNum: '', otp: '', otpWrong: false });
    go('b-reg1');
  },
  regSend() {
    const n = st.phoneNum.replace(/\D/g, '');
    if (n.length !== 10 || n[0] !== '9') {
      st.authErr = 'Enter a 10-digit number that starts with 9.';
      render();
      return shake('#phoneField');
    }
    Object.assign(st, { otp: '', otpWrong: false, resendIn: 24 });
    go('b-reg2');
    toast('Code sent');
  },
  verifyOtp: () => ACT3.regVerify(),
  regVerify() {
    if (st.screen !== 'b-reg2') return;
    if (st.otp.length < 6) return shake('#otpRow');
    if (st.otp === '000000') {
      st.otpWrong = true;
      return render();
    }
    if (st.regMode === 'login') return go('b-home', { reset: true, replace: true });
    go('b-reg3');
  },
  regRetry() {
    Object.assign(st, { otp: '', otpWrong: false });
    render(true);
  },
  regResend() {
    Object.assign(st, { otp: '', otpWrong: false, resendIn: 24 });
    render(true);
    toast('New code sent');
  },
  reg3Next() {
    if (!st.regFirst.trim()) {
      toast('Enter your first name');
      return shake('#nameForm');
    }
    go('b-reg4');
  },
  reg4Save() {
    if (!st.regBldg.trim() || !st.regUnit.trim()) {
      toast('Add your building and unit');
      return shake('#addrForm');
    }
    st.regSaved = true;
    go('b-reg5');
  },
  reg4Skip() {
    st.regSaved = false;
    go('b-reg5');
  },
  regDone(book) {
    Object.assign(st, {
      user: { first: st.regFirst.trim() || 'Bruce', last: st.regLast.trim(), phone: `+63 ${fmtPhone(st.phoneNum)}` },
      addrs: st.regSaved ? [{ label: 'Home', bldg: st.regBldg.trim(), short: st.regUnit.trim(), city: '', note: st.regNote.trim() }] : [],
      addr3: 0, booking: null, past3: [], upcoming: [], chat3: [],
      notifs3: [{ g: 'Today', icon: 'shieldCheck', t: 'Welcome to Mang Juan! Every Manong is ID-verified.', time: 'Now', unread: true, act: '' }],
    });
    go('b-home', { reset: true, replace: true });
    if (book) toast('Pick what needs fixing to start');
  },
  // booking
  startB(k) {
    Object.assign(st, { cat: k, tier: CAT3[k].def, desc: '', symptoms: [], photos: [], dropoff: '', when: CAT3[k].def === 'q' && k === 'locks' ? 'now' : 'schedule', day: 21, time: '10:30 AM', preferred: null, pickManong: null, retried: false, altManong: false });
    go('b-size', { reset: true });
    st.stack = ['b-home'];
  },
  tierB(k) {
    st.tier = k;
    if (st.cat === 'locks') st.when = k === 'q' ? 'now' : 'schedule';
    render();
  },
  routeNext() {
    if (!st.dropoff.trim()) {
      toast('Add the drop-off address');
      return shake('#routeBox');
    }
    go('b-schedule');
  },
  leaveFinding() {
    st.bgFinding = true;
    go('b-home', { reset: true, replace: true });
    toast("We'll notify you when a Manong is found");
    setTimeout(() => {
      if (st.variant !== 'full' || !st.bgFinding) return;
      st.bgFinding = false;
      st.pendingReview = true;
      st.notifs3.unshift({ g: 'Today', icon: 'check', t: `${nextManong().first} can take your ${CATS[st.cat].name.toLowerCase()} job. Review and confirm.`, time: 'Now', unread: true, act: 'review' });
      if (['b-home', 'b-notifs'].includes(st.screen)) render();
      toast(`${nextManong().first} is free. Tap the card to review.`);
    }, 3000);
  },
  soonTime(t) {
    st.soonTime = t;
    render();
  },
  bookSoonest() {
    Object.assign(st, { when: 'schedule', day: 20, time: st.soonTime, retried: true });
    go('b-finding', { replace: true });
  },
  notifyMe() {
    go('b-home', { reset: true, replace: true });
    toast("We'll text you when a Manong is free");
  },
  pickWhere() {
    st.addrPickSel = st.addr3;
    go('b-addrpick');
  },
  addrPickSel(i) {
    st.addrPickSel = +i;
    render();
  },
  useAddr() {
    st.addr3 = st.addrPickSel;
    back();
  },
  confirmB() {
    if (!where3()) {
      toast('Add an address first');
      return ACT3.pickWhere();
    }
    const now = st.when === 'now';
    st.booking = makeBooking3(now ? 'now' : 'schedule');
    Object.assign(st, { liveEta: now ? 8 : 18, pendingReview: false, bgFinding: false, stack: ['b-home'], screen: now ? 'b-ondemand' : 'b-status' });
    render(true);
    toast(now ? `${st.booking.manong.first} accepted your request` : `Request sent. We'll text you when ${st.booking.manong.first} confirms.`);
  },
  openBooking() {
    const b = bk();
    if (!b) return;
    if (b.status === 'completed') return go('b-charges');
    go(b.mode === 'now' ? 'b-ondemand' : 'b-status');
  },
  sheetToggle() {
    if (st.sheetDragged) return void (st.sheetDragged = false);
    st.sheetTop = (st.sheetTop || SHEET_PEEK) === SHEET_PEEK ? SHEET_OPEN : SHEET_PEEK;
    render();
  },
  trackLive() {
    const b = bk();
    if (!b) return;
    if (b.status === 'pending') return toast(`${b.manong.first} hasn't confirmed yet`);
    if (['confirmed', 'accepted', 'late'].includes(b.status)) {
      b.status = 'onway';
      st.liveEta = b.mode === 'now' ? 8 : 18;
    }
    go('b-live');
  },
  cancelStart() {
    sheet(bk().status === 'onway' ? 'lateFee' : 'cancel3', { reason: null });
  },
  cancelReason(i) {
    st.sheet.reason = st.sheet.reason === +i ? null : +i;
    render();
  },
  confirmCancel3(fee) {
    const b = bk();
    const reason = st.sheet?.reason != null ? CANCEL_REASONS[st.sheet.reason] : +fee ? 'Manong was on the way' : 'No reason given';
    st.cancelled = { b, reason, fee: +fee };
    st.past3.unshift(P3(b.id, b.cat, svcName(b), `${DAY_LONG[b.day]}, Oct ${b.day}`, b.time, null, [[+fee ? 'Trip fee' : 'Cancelled before the job', +fee]], 'cancelled'));
    Object.assign(st, { booking: null, sheet: null, stack: ['b-home'], screen: 'b-cancelled' });
    render(true);
  },
  rebookFromCancel() {
    draftFrom(st.cancelled.b);
    st.desc = st.cancelled.b.problem;
    go('b-schedule', { reset: true });
    st.stack = ['b-home'];
  },
  mcPick(i) {
    st.mcPick = +i;
    render();
  },
  mcContinue() {
    const b = bk();
    draftFrom(b);
    st.desc = b.problem;
    st.booking = null;
    st.altManong = true;
    st.stack = ['b-home'];
    st.screen = st.mcPick === 0 ? 'b-finding' : 'b-schedule';
    if (st.mcPick === 0) Object.assign(st, { day: b.day, time: b.time, retried: true });
    render(true);
  },
  partApprove() {
    const b = bk();
    const [n, p] = c3(b.cat).part;
    if (!b.parts.some(([x]) => x === n)) b.parts.push([n, p]);
    back();
    toast(`Approved. ${peso(p)} added to your bill.`);
  },
  partDecline() {
    back();
    toast(`Declined. ${bk().manong.first} will finish the base repair only.`);
  },
  payNow() {
    if (st.pay === 'cash') return ACT3.paid();
    sheet('paying');
    setTimeout(() => {
      if (st.variant !== 'full' || st.sheet?.type !== 'paying') return;
      if (st.failNext) {
        st.failNext = false;
        st.sheet = null;
        return go('b-payfail', { replace: true });
      }
      ACT3.paid();
    }, 1300);
  },
  payCash() {
    st.pay = 'cash';
    ACT3.paid();
  },
  paid() {
    const b = bk();
    b.status = 'paid';
    Object.assign(st, { sheet: null, starsB: 4, praiseB: ['On time', 'Clean work'], review: '' });
    go('b-rate', { replace: true });
    toast(`Paid ${peso(total3(b))}. Receipt emailed.`);
  },
  submitB() {
    archive3(st.starsB);
    go('b-thanks', { replace: true });
  },
  skipRate() {
    archive3(0);
    go('b-home', { reset: true, replace: true });
  },
  openReport() {
    Object.assign(st, { repReason: null, repText: '', reportFrom: st.screen });
    go('b-report');
  },
  repPick(i) {
    st.repReason = st.repReason === +i ? null : +i;
    render();
  },
  sendReport() {
    if (st.repReason == null && !st.repText.trim()) {
      toast('Pick what went wrong or describe it');
      return shake('#repBox');
    }
    go('b-reportsent', { replace: true });
  },
  reportBack() {
    go(bk() ? st.reportFrom : 'b-home', { reset: true, replace: true });
    st.stack = ['b-home'];
  },
  // choosing a Manong
  openManongs() {
    st.manongSel = picked3() ? st.pickManong : 'auto';
    go('b-manongs');
  },
  manongSel(k) {
    st.manongSel = k;
    render();
  },
  manongDone() {
    const k = st.manongSel;
    st.pickManong = k === 'auto' ? null : k;
    if (k === 'auto') st.preferred = null;
    back();
    toast(k === 'auto' ? `Sending the nearest free ${CATS[st.cat].who}` : `${MANONGS[k].first} is your pick`);
  },
  pickFromProfile(k) {
    if (!pool3().some((a) => a.m.key === k)) return toast(`${MANONGS[k].first} isn't free ${st.when === 'now' ? 'right now' : `at ${st.time}`}`);
    st.pickManong = k;
    const i = st.stack.lastIndexOf('b-review');
    if (i < 0) return back();
    st.stack = st.stack.slice(0, i);
    st.screen = 'b-review';
    st.sheet = null;
    render(true);
    toast(`${MANONGS[k].first} is your pick`);
  },
  // home, bookings, profile
  bkTab(t) {
    st.bkTab = t;
    render();
  },
  calDay(d) {
    st.calDay = +d;
    render();
  },
  calMonth(d) {
    st.calMonth = Math.max(-1, Math.min(1, st.calMonth + +d));
    render();
  },
  openUpcoming(i) {
    const u = st.upcoming[+i];
    toast(`${u.title} on ${octDay(u.day)}, Oct ${u.day} at ${u.time} with ${u.with}`);
  },
  openPast(i) {
    st.receiptIdx = +i;
    go('b-receipt');
  },
  bookAgain3(i) {
    const p = st.past3[+i];
    ACT3.startB(p.cat);
    if (p.manong) {
      st.preferred = p.manong.first;
      render();
      toast(`Requesting ${p.manong.first} again`);
    }
  },
  bookAgainM() {
    const m = MANONGS[st.viewManong] || ALF3;
    ACT3.startB(catOf3(m));
    st.preferred = m.first;
    render();
    toast(`Requesting ${m.first} again`);
  },
  downloadReceipt() {
    const p = st.past3[st.receiptIdx];
    const txt = `MANG JUAN RECEIPT\nBooking ${p.id}\n${p.title}\n${p.date}, ${p.time}\nManong: ${p.manong ? p.manong.name : '-'}\n\n${p.lines.map(([n, v]) => `${n}: ${peso(v)}`).join('\n')}\n\nTotal: ${peso(p.total)}\nPaid with ${p.pay === 'cash' ? 'cash' : 'GCash'}\n`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
    a.download = `mang-juan-receipt-${p.id}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Receipt downloaded');
  },
  viewManong(k) {
    st.viewManong = k;
    go('b-manong');
  },
  sendChat(text) {
    if (!text || !text.trim()) return;
    st.chat3.push({ me: true, t: text.trim(), time: 'Now' });
    render();
    setTimeout(() => {
      if (st.variant !== 'full') return;
      st.chat3.push({ me: false, t: ['Sige po, noted!', 'Copy po, salamat!', 'Okay po sir.'][st.chat3.length % 3], time: 'Now' });
      if (st.screen === 'b-chat') render();
    }, 900);
  },
  notif3(i) {
    const n = st.notifs3[+i];
    n.unread = false;
    if (n.act === 'status') return bk() ? ACT3.openBooking() : (render(), toast('That booking is no longer active'));
    if (n.act === 'receipt') {
      const idx = st.past3.findIndex((p) => p.id === 'MJ-8790');
      if (idx >= 0) return ACT3.openPast(idx);
    }
    if (n.act === 'review' && st.pendingReview) return go('b-review');
    if (n.act === 'cleaning') return ACT3.startB('cleaning');
    render();
  },
  editName() {
    Object.assign(st, { regFirst: st.user.first, regLast: st.user.last });
    go('b-name');
  },
  saveName() {
    if (!st.regFirst.trim()) {
      toast('Enter your first name');
      return shake('#nameForm');
    }
    st.user.first = st.regFirst.trim();
    st.user.last = st.regLast.trim();
    back();
    toast('Saved');
  },
  addrNew() {
    Object.assign(st, { addrEdit: -1, afLabel: '', afBldg: '', afUnit: '', afNote: '' });
    go('b-addrform');
  },
  addrEdit(i) {
    const a = st.addrs[+i];
    Object.assign(st, { addrEdit: +i, afLabel: a.label, afBldg: a.bldg, afUnit: a.short, afNote: a.note });
    go('b-addrform');
  },
  addrSave() {
    if (!st.afBldg.trim()) {
      toast('Add the building or street');
      return shake('#addrForm');
    }
    const a = { label: st.afLabel.trim() || 'Other', bldg: st.afBldg.trim(), short: st.afUnit.trim(), city: st.addrEdit >= 0 ? st.addrs[st.addrEdit].city : '', note: st.afNote.trim() };
    if (st.addrEdit >= 0) st.addrs[st.addrEdit] = a;
    else {
      st.addrs.push(a);
      st.addrPickSel = st.addrs.length - 1;
    }
    back();
    toast('Address saved');
  },
  addrRemove() {
    st.addrs.splice(st.addrEdit, 1);
    if (st.addr3 >= st.addrs.length) st.addr3 = 0;
    back();
    toast('Address removed');
  },
  openPayments() {
    st.payPick = st.pay;
    go('b-payments');
  },
  payPick(k) {
    st.payPick = k;
    render();
  },
  paySave() {
    st.pay = st.payPick;
    back();
    toast(`Saved. ${st.pay === 'gcash' ? 'GCash' : 'Cash'} is your default.`);
  },
};
function archive3(stars) {
  const b = bk();
  if (!b) return;
  st.past3.unshift({ ...P3(b.id, b.cat, svcName(b), `${DAY_LONG[b.day]}, Oct ${b.day}`, b.time, b.manong, [['Base charge', base3(b)], ...mats3(b)], 'paid', stars), pay: st.pay });
  st.booking = null;
}

// ---------- per-screen timers ----------
const AFTER3 = {
  'b-finding': () => {
    st.findPct = 6;
    st.bgFinding = false;
    every(350, () => {
      st.findPct = Math.min(100, st.findPct + 8);
      live();
      if (st.findPct < 100) return;
      clearTimers();
      if (st.outcome === 'none' && !st.retried) {
        if (st.when === 'now') return go('b-nonearby', { replace: true });
        st.noneFrom = st.time;
        return go('b-none', { replace: true });
      }
      go('b-review', { replace: true });
      toast(`${nextManong().first} ${st.when === 'now' ? 'can come now' : 'is free then'}`);
    });
  },
  'b-reg2': () => {
    if (!st.otpWrong) phone.querySelector(`[data-otp="${Math.min(st.otp.length, 5)}"]`)?.focus();
    every(1000, () => {
      if (st.resendIn <= 0) return clearTimers();
      st.resendIn -= 1;
      if (st.resendIn === 0) render();
      else live();
    });
  },
  'b-live': AFTER['b-live'],
};
Object.assign(LIVE, {
  resend3: () => `Resend code in 0:${String(st.resendIn).padStart(2, '0')}`,
  repCount: () => st.repText.length,
});

// "Simulate" panel: things the Manong or the system does
const SIM3 = {
  'b-status': () => {
    const b = bk();
    if (!b) return [];
    const m = b.manong.first;
    if (b.status === 'inprogress') return [[`${m} needs a part → approve it`, () => go('b-part')], ['Job done → charges', () => ACT.jobDoneB()]];
    if (b.status === 'declined' || b.status === 'mcancelled') return [];
    if (b.status === 'pending') {
      return [
        [`${m} confirms the booking`, () => {
          b.status = 'confirmed';
          st.notifs3.unshift({ g: 'Today', icon: 'check', t: `${m} confirmed your booking for ${DAY_LONG[b.day]}, Oct ${b.day} at ${b.time}.`, time: 'Now', unread: true, act: 'status' });
          render();
          toast(`${m} confirmed`);
        }],
        [`${m} can't take it (declined)`, () => {
          b.status = 'declined';
          st.mcPick = 0;
          render(true);
        }],
      ];
    }
    return [
      [`${m} is on the way (Book 5b)`, () => {
        b.status = 'onway';
        st.sheetTop = SHEET_PEEK;
        render(true);
      }],
      [`${m} is running late`, () => {
        b.status = 'late';
        render();
        toast(`${m} is running late`);
      }],
      [`${m} had to cancel`, () => {
        b.status = 'mcancelled';
        st.mcPick = 0;
        render(true);
      }],
      [`${m} arrived, job started`, () => {
        b.status = 'inprogress';
        render(true);
      }],
      ['Job done → charges', () => ACT.jobDoneB()],
    ];
  },
  'b-live': () => [
    ['Fast-forward: arrived', () => {
      st.liveEta = 0;
      bk().status = 'inprogress';
      render();
    }],
    [`${bk()?.manong.first || 'Manong'} arrived, job started`, () => {
      bk().status = 'inprogress';
      go('b-status', { replace: true });
    }],
  ],
  'b-home': () => (bk() && ['confirmed', 'accepted', 'late'].includes(bk().status) ? [[`${bk().manong.first} is on the way (home card)`, () => {
    bk().status = 'onway';
    render();
  }]] : []),
  'b-charges': () => [[st.failNext ? 'Next GCash payment will fail (on)' : 'Make the next GCash payment fail', () => {
    st.failNext = !st.failNext;
    renderPanel();
  }]],
  'b-reg2': () => [['Enter a wrong code', () => {
    clearTimers();
    Object.assign(st, { otp: '482173', otpWrong: true });
    render();
  }]],
};
SIM3['b-ondemand'] = SIM3['b-status'];
SIM3['b-onway'] = SIM3['b-status'];

const FRAMES3 = {
  'b-welcome': 'V3 · Welcome', 'b-login': 'V3 · Log in', 'b-reg1': 'V3 · Register 1: Mobile number', 'b-reg2': 'V3 · Register 2: Verify code',
  'b-reg2bad': 'V3 · State: Wrong code', 'b-reg3': 'V3 · Register 3: Your name', 'b-reg4': 'V3 · Register 4: Home address', 'b-reg5': 'V3 · Register 5: All set',
  'b-home': 'V3 · Home', 'b-home-empty': 'V3 · Home: no booking yet', 'b-home-onway': 'V3 · Home: Manong on the way', 'b-addrpick': 'V3 · Choose address',
  'b-size': 'V3 · Book 1: Service size', 'b-size@electrical': 'V3 · Electrical 1: Job size', 'b-size@cleaning': 'V3 · Cleaning 1: Place size',
  'b-size@locks': 'V3 · Locks 1: What you need', 'b-size@moving': 'V3 · Moving 1: Move size', 'b-size@repairs': 'V3 · Repairs 1: Job type',
  'b-problem': 'V3 · Book 2: Problem', 'b-route': 'V3 · Moving 2: Route', 'b-schedule': 'V3 · Book 3: Schedule', 'b-finding': 'V3 · State: Finding your Manong',
  'b-none': 'V3 · State: No Manong free', 'b-nonearby': 'V3 · State: No Manong nearby now', 'b-review': 'V3 · Book 4: Review and confirm', 'b-manongs': 'V3 · Book 4b: Choose a Manong',
  'b-status': 'V3 · Book 5: Booking status', 'b-pending': 'V3 · State: Waiting for Manong to confirm', 'b-declined': 'V3 · State: Manong declined', 'b-onway': 'V3 · Book 5b: Manong on the way', 'b-ondemand': 'V3 · State: On-demand accepted', 'b-live': 'V3 · State: Manong on the way (live map)',
  'b-late': 'V3 · State: Manong running late', 'b-inprog': 'V3 · Booking status: in progress', 'b-part': 'V3 · Approve extra part',
  'b-mcancel': 'V3 · State: Manong cancelled', 'b-sheet-cancel': 'V3 · Cancel booking: reason', 'b-sheet-late': 'V3 · Cancel booking: late fee',
  'b-cancelled': 'V3 · Booking cancelled', 'b-charges': 'V3 · Book 6: Charges and payment', 'b-payfail': 'V3 · State: Payment failed',
  'b-rate': 'V3 · Book 7: Rate your Manong', 'b-thanks': 'Done (added)', 'b-report': 'V3 · Report a problem', 'b-reportsent': 'V3 · Report sent',
  'b-bookings': 'V3 · Bookings: calendar', 'b-up-empty': 'V3 · Bookings: nothing upcoming', 'b-past': 'V3 · Bookings: past', 'b-receipt': 'V3 · Past booking: receipt',
  'b-profile': 'V3 · Profile', 'b-name': 'Personal details (reuses Register 3)', 'b-addresses': 'V3 · Saved addresses', 'b-addrform': 'Add or edit address (reuses Register 4)',
  'b-payments': 'V3 · Payment methods', 'b-notifs': 'V3 · Notifications', 'b-manong': 'V3 · Manong profile', 'b-chat': 'V3 · Chat with Manong',
};
JUMP.full = Object.keys(FRAMES3);

// Jumping into a mid-flow screen seeds whatever it needs.
const baseJump = jumpTo;
jumpTo = (s) => (st.variant === 'full' ? jump3(s) : baseJump(s));
function jump3(s) {
  st.sheet = null;
  st.call = null;
  const [key, catKey] = s.split('@');
  if (catKey) return ACT3.startB(catKey);
  const seedDraft = () => {
    if (!st.desc && !st.symptoms.length) Object.assign(st, { desc: 'Tumutulo may tumutulo po sa sink.', symptoms: ['Leak'], photos: [A + 'pipe.png'] });
  };
  const seedBk = (status, mode = 'schedule') => {
    seedDraft();
    st.when = mode === 'now' ? 'now' : 'schedule';
    st.booking = makeBooking3(mode);
    st.booking.status = status;
    if (['completed', 'paid'].includes(status)) st.booking.parts = [c3(st.booking.cat).part.slice(0, 2)];
  };
  let screen = key;
  let sh = null;
  switch (key) {
    case 'b-reg1': case 'b-reg2': case 'b-reg3': case 'b-reg4': case 'b-reg5':
      Object.assign(st, { regMode: 'new', phoneNum: '9171234567', otp: '', otpWrong: false, resendIn: 24, regFirst: 'Bruce', regLast: 'Wayne', regBldg: 'Green Residences, Malate', regUnit: 'Unit 1204, West Tower', regSaved: true });
      if (key === 'b-reg1') st.phoneNum = '';
      break;
    case 'b-reg2bad': Object.assign(st, { phoneNum: '9171234567', otp: '482173', otpWrong: true }); screen = 'b-reg2'; break;
    case 'b-home-empty': Object.assign(st, { booking: null, pendingReview: false }); screen = 'b-home'; break;
    case 'b-home-onway': seedBk('onway'); screen = 'b-home'; break;
    case 'b-problem': case 'b-schedule': case 'b-finding': case 'b-review': seedDraft(); st.retried = false; break;
    case 'b-none': seedDraft(); st.when = 'schedule'; st.noneFrom = st.time; break;
    case 'b-nonearby': seedDraft(); st.when = 'now'; break;
    case 'b-route': Object.assign(st, { cat: 'moving', tier: 's', symptoms: ['Elevator at pick-up'], dropoff: '' }); break;
    case 'b-status': seedBk('confirmed'); break;
    case 'b-pending': seedBk('pending'); screen = 'b-status'; break;
    case 'b-declined': seedBk('declined'); screen = 'b-status'; break;
    case 'b-manongs': seedDraft(); st.retried = false; st.manongSel = 'auto'; break;
    case 'b-onway': seedBk('onway'); st.sheetTop = SHEET_PEEK; break;
    case 'b-ondemand': seedBk('accepted', 'now'); break;
    case 'b-live': seedBk('onway'); st.liveEta = 18; break;
    case 'b-late': seedBk('late'); screen = 'b-status'; break;
    case 'b-inprog': seedBk('inprogress'); screen = 'b-status'; break;
    case 'b-part': seedBk('inprogress'); break;
    case 'b-mcancel': seedBk('mcancelled'); st.mcPick = 0; screen = 'b-status'; break;
    case 'b-sheet-cancel': seedBk('confirmed'); screen = 'b-status'; sh = { type: 'cancel3', reason: 2 }; break;
    case 'b-sheet-late': seedBk('onway'); st.liveEta = 18; screen = 'b-live'; sh = { type: 'lateFee', reason: null }; break;
    case 'b-cancelled': seedBk('confirmed'); st.cancelled = { b: st.booking, reason: 'Need a different time', fee: 0 }; st.booking = null; break;
    case 'b-charges': case 'b-payfail': case 'b-report': seedBk('completed'); st.reportFrom = 'b-charges'; break;
    case 'b-reportsent': seedBk('completed'); break;
    case 'b-rate': seedBk('paid'); break;
    case 'b-bookings': st.bkTab = 'up'; break;
    case 'b-up-empty': Object.assign(st, { booking: null, upcoming: [], bkTab: 'up' }); screen = 'b-bookings'; break;
    case 'b-past': st.bkTab = 'past'; screen = 'b-bookings'; break;
    case 'b-receipt': st.receiptIdx = 0; break;
    case 'b-name': Object.assign(st, { regFirst: st.user.first, regLast: st.user.last }); break;
    case 'b-addrpick': st.addrPickSel = st.addr3; break;
    case 'b-addrform': Object.assign(st, { addrEdit: 0, afLabel: st.addrs[0]?.label || '', afBldg: st.addrs[0]?.bldg || '', afUnit: st.addrs[0]?.short || '', afNote: st.addrs[0]?.note || '' }); break;
    case 'b-payments': st.payPick = st.pay; break;
    case 'b-chat': if (!bk()) seedBk('confirmed'); break;
  }
  st.stack = ['b-home'];
  st.screen = screen;
  render(true);
  if (sh) {
    st.sheet = sh;
    render();
  }
}

// Every table above replaces the Flow 2 entry only while Flow 3 is active.
function layer(obj, add, fn = false) {
  for (const k of Object.keys(add)) {
    const base = obj[k];
    Object.defineProperty(obj, k, { configurable: true, enumerable: true, get: () => (st.variant === 'full' ? (fn ? add[k]() : add[k]) : base) });
  }
}
layer(S, S3);
layer(SHEETS, SHEETS3);
layer(ACT, ACT3);
layer(AFTER, AFTER3);
layer(FRAMES, FRAMES3);
layer(SIM, SIM3, true);

/* ==========================================================
   Flow 4 "Final": Flow 1 (the client's design) completed and tidied.
   Same screens, photos and components as Flow 1. Adds what the user stories need and Flow 1 lacks:
   contract durations, Now or Schedule, choosing a Manong, Pending confirmation and Declined,
   approving extra parts, and the extra charges on the bill.

   Navigation model (Grab / foodpanda style):
   - Bookings tab is the home of every booking, active or past.
   - While a booking is active, a strip above the tab bar follows the resident on every tab.
   - Account holds settings only. Home is address, search and services.
   ========================================================== */
VARIANTS.final = { flow: 'A', label: 'Final', group: 'Flow 4', start: 'a-welcome' };
GROUP_DESC['Flow 4'] = "The best of both (2.0).";
CLARISO.key = 'clariso';
CLARISO.ini = 'CP';
P.chevD = '<path d="m6 9 6 6 6-6"/>';
const fFresh = fresh;
fresh = (v = 'main') => (v === 'final' || v === 'f5' ? Object.assign(fFresh(v), {
  when: 'now', pickManong: null, altManong: false, fb: null, partOk: false, bkTabF: 'up', sw: { book: true, promo: false },
  nF: [{ g: 'Today', t: 'MANONG50 applied: ₱50 off your next booking', time: '8:00 AM', unread: true, act: 'a-home' }, { g: 'Earlier', t: 'Your receipt for MJ-8790 is ready', time: 'Oct 2', unread: false, act: 'a-history' }],
}) : fFresh(v));
const isF = () => st.variant === 'final' || st.variant === 'f5'; // Flow 5 (flow5.js) builds on Flow 4
const FD = { quick: '~15 mins', standard: '30–60 mins', major: '1 hr +' };
const rosterF = () => (st.cat === 'plumbing' ? [{ m: CLARISO, km: 0.4, now: true, busy: [] }, ...ROSTER3.plumbing.filter((a) => a.m.key !== 'alfred3')] : ROSTER3[st.cat] || ROSTER3.plumbing);
const poolF = () => rosterF().filter(isFree3);
const aideF = () => {
  const p = poolF();
  const w = p.find((a) => a.m.key === st.pickManong);
  return (w || (st.altManong && p.length > 1 ? p[1] : p[0]) || rosterF()[0]).m;
};
const avF = (m, s = 50, x = '') => (m.img ? `<img src="${m.img}" alt="" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;${x}" />` : `<span class="f4ini" style="width:${s}px;height:${s}px;font-size:${Math.round(s * 0.36)}px;${x}">${m.ini}</span>`);
// Flow 1 screens are written for Clariso; swap in whoever was assigned.
const asAide = (h) => {
  const m = aideF();
  if (m === CLARISO) return h;
  return h
    .replace(/<img[^>]*clariso\.png[^>]*>/g, (x) => avF(m, x.includes('avbig') ? 80 : 50, x.includes('avbig') ? 'margin:0 auto;display:grid' : ''))
    .replace(/Clariso Perez/g, m.name).replace(/Clariso/g, m.first)
    .replace(/4\.9★ \(342 jobs\)/g, `${m.rating}★ (${m.jobs} jobs)`).replace(/<b>4\.9<\/b> \(342 jobs\)/g, `<b>${m.rating}</b> (${m.jobs} jobs)`)
    .replace(/data-arg="clariso"/g, `data-arg="${m.key}"`);
};
const baseToast = toast;
toast = (msg) => baseToast(isF() ? msg.replace(/Clariso/g, aideF().first) : msg);

// ---------- the active booking (st.fb) ----------
// status: finding | pending | confirmed | declined | onway | done. "arrived" is onway once st.arrived is set.
const CHIP = { finding: 'Finding Manong', pending: 'Pending confirmation', confirmed: 'Confirmed', onway: 'On the way', arrived: 'Arrived', done: 'Job done', declined: 'Declined', paid: 'Paid' };
const chipF = (k) => `<span class="f4chip ${k}">${CHIP[k]}</span>`;
const keyF = (b) => (b.status === 'onway' && st.arrived ? 'arrived' : b.status);
const whenF = (b) => (b.time === 'Now' ? 'Now' : `${DAY_LONG[b.day]}, Oct ${b.day}, ${b.time}`);
const stF = (b) => {
  const k = keyF(b), f = b.m.first;
  const t = {
    finding: ['Finding your Manong', `${TIERS_A[b.tier].name} • Now`],
    pending: [`Waiting for ${f} to confirm`, whenF(b)],
    confirmed: [`${f} confirmed`, whenF(b)],
    declined: [`${f} can't take it`, 'Tap to choose another Manong'],
    onway: [`${f} is on the way`, `About ${st.eta} mins away`],
    arrived: [`${f} has arrived`, 'Meet at the lobby'],
    done: ['Job done', 'Review and pay'],
  }[k];
  return { key: k, title: t[0], sub: t[1] };
};
const ROUTE_F = { finding: 'a-finding', pending: 'a-pending', confirmed: 'a-pending', declined: 'a-declined', onway: 'a-found', arrived: 'a-found', done: 'a-summary' };
const stripF = () => {
  const b = st.fb;
  if (!b) return '';
  const s = stF(b);
  return `<button class="f4strip" data-act="openActiveF" aria-label="Open your active booking: ${esc(s.title)}">${avF(b.m, 40)}<span class="grow"><b>${esc(s.title)}</b><small>${esc(s.sub)}</small></span>${ic('chevR')}</button>`;
};
const TABS_F = [['a-home', 'home', 'Home'], ['a-history', 'calendar', 'Bookings'], ['a-messages', 'msg', 'Messages'], ['a-account', 'user', 'Account']];
const navF = (on) => `<nav class="otabs f4nav">${TABS_F.map(([s, i, l]) => `<button class="${on === s ? 'on' : ''}" data-act="tab" data-arg="${s}" ${on === s ? 'aria-current="page"' : ''}>${on === s ? icFill(i) : ic(i)}<span>${l}</span>${s === 'a-history' && st.fb ? '<i class="f4tdot"></i>' : ''}</button>`).join('')}</nav>`;
const tabsF = (h) => {
  const on = (h.match(/<nav class="otabs">[\s\S]*?<button class="on" data-act="tab" data-arg="([\w-]+)"/) || [])[1];
  return h.replace(/<nav class="otabs">[\s\S]*?<\/nav>/, `${stripF()}${navF(on)}`);
};
// One header for tab pages and sub pages: left aligned title, same gutter as the content.
const topF = (title, { back = '', right = '' } = {}) => `<header class="f4top"><div class="f4row">${back ? `<button class="f4back" data-act="${back}" aria-label="Back">${ic('arrowL')}</button>` : ''}<h1>${title}</h1>${right}</div></header>`;

// ---------- booking flow ----------
// Flow 1's tier cards cut long text mid-word and stack a footnote under every price. Flow 4 uses
// shorter copy and one note under the list. Flow 1 itself is left untouched.
const TIER_F = {
  quick: { desc: 'Inspection, meter test, minor fuse check', dur: FD.quick, foot: '' },
  standard: { desc: 'Aircon clean, plumbing clogs, socket rewire', dur: FD.standard, foot: '' },
  major: { desc: 'Drain overhaul, toilet reinstall, pump or heater install', dur: FD.major, foot: '' },
};
const withTierF = (fn) => {
  const old = {};
  for (const k in TIERS_A) { old[k] = TIERS_A[k]; TIERS_A[k] = { ...TIERS_A[k], ...TIER_F[k] }; }
  try { return fn(); } finally { for (const k in old) TIERS_A[k] = old[k]; }
};
const baseSvc = S['a-service'];
S['a-service'] = () => {
  if (!isF()) return baseSvc();
  return withTierF(baseSvc).replace(/<\/div><\/div>\s*<div class="afoot">/, '<p class="small center">Parts, if needed, are quoted first and billed on an official receipt.</p></div></div>\n  <div class="afoot">');
};

const DAYS_F = [['Today', 20], ['Wed', 21], ['Thu', 22], ['Fri', 23], ['Sat', 24], ['Sun', 25], ['Mon', 26], ['Tue', 27], ['Wed', 28], ['Thu', 29], ['Fri', 30], ['Sat', 31]];
Object.assign(DAY_LONG, { 25: 'Sun', 26: 'Mon', 27: 'Tue', 28: 'Wed', 29: 'Thu', 30: 'Fri', 31: 'Sat' });
// Today only offers slots at least ~30 mins after the current time (2:03 PM in this prototype).
const slotsF = (day) => TIMES.filter((t) => day !== 20 || ['3:00 PM', '4:30 PM', '6:00 PM'].includes(t));
const baseDet = S['a-details'];
S['a-details'] = () => {
  if (!isF()) return baseDet();
  const now = st.when === 'now';
  const sl = slotsF(st.day), am = sl.filter((t) => t.endsWith('AM')), pm = sl.filter((t) => t.endsWith('PM'));
  const slot = (t) => `<button class="f4time ${st.time === t ? 'on' : ''}" ${t === FULL_TIME ? 'disabled' : `data-act="time" data-arg="${t}" aria-pressed="${st.time === t}"`}>${t}</button>`;
  const when = `<section class="card"><div class="sectitle"><span class="num">3</span>When do you need Manong?</div>
    <div class="tips" style="margin-bottom:0"><button class="${now ? 'on' : ''}" data-act="when" data-arg="now">Now</button><button class="${now ? '' : 'on'}" data-act="when" data-arg="schedule">Schedule</button></div>
    ${now ? '<p class="small">Fastest option. The closest free Manong heads over once he accepts.</p>'
      : `<div class="f4mon">October 2026</div><div class="f4dates">${DAYS_F.map(([d, n]) => `<button class="f4date ${st.day === n ? 'on' : ''}" data-act="dayF" data-arg="${n}" aria-pressed="${st.day === n}"><small>${d.toUpperCase()}</small><b>${n}</b></button>`).join('')}</div>
      ${am.length ? `<div class="f4lab">Morning</div><div class="f4times">${am.map(slot).join('')}</div>` : ''}${pm.length ? `<div class="f4lab">Afternoon</div><div class="f4times">${pm.map(slot).join('')}</div>` : ''}
      <p class="f4sum">${DAY_LONG[st.day]}, Oct ${st.day} at <b>${st.time}</b></p>`}</section>`;
  return baseDet()
    .replace(/the aide/g, 'Manong')
    .replace('<span class="num">3</span>Notes for Manong', '<span class="num">4</span>Notes for Manong')
    .replace('<section class="card"><div class="sectitle"><span class="num">4</span>', `${when}<section class="card"><div class="sectitle"><span class="num">4</span>`)
    .replace(/<button class="abtn" data-act="confirmA">[\s\S]*?<\/button>/, `<button class="abtn" data-act="findF"><span>Choose your Manong</span><span class="amt">${peso(priceA())}</span></button>`);
};

const picked3F = () => (st.pickManong && poolF().some((a) => a.m.key === st.pickManong) ? st.pickManong : 'auto');
S['a-pick'] = () => {
  const now = st.when === 'now', sel = picked3F(), m = aideF(), best = poolF()[0];
  const off = rosterF().filter((a) => !isFree3(a));
  const row = (a, on) => `<button class="lvl ${sel === a.m.key ? 'on' : ''}" ${on ? `data-act="pickF" data-arg="${a.m.key}"` : 'disabled'} role="radio" aria-checked="${sel === a.m.key}">${avF(a.m, 44)}
    <span class="grow"><b>${a.m.name}</b><small>${a.m.skills} • ${a.m.rating}★ (${a.m.jobs} jobs)</small></span>
    <span class="pr">${on ? (now ? `<b>${a.km} km</b><small>~${Math.round(a.km * 5 + 4)} mins away</small>` : `<b>${st.time.replace(' ', '')}</b><small>Free</small>`) : `<small>${now ? a.now : `Booked at ${st.time}`}</small>`}</span></button>`;
  return `${statusBar()}${canopy('Choose Your Manong', 'Review your booking, then book or pick someone.')}${mapPins('found')}
  <div class="bsheet" style="max-height:560px"><div class="grab"></div>
    <div class="f4rev" style="margin-top:0;border:0;padding:0"><div class="kv"><div><span>Service</span><span>${tA().name}, ${FD[st.tierA]}</span></div><div><span>When</span><span>${now ? 'Now' : `${DAY_LONG[st.day]}, Oct ${st.day}, ${st.time}`}</span></div><div><span>Where</span><button data-act="sheet" data-arg="addressA">${addrA().short}${ic('pencil')}</button></div><div><span>Estimate</span><b>${peso(priceA())}</b></div></div></div>
    <button class="f4quick" data-act="confirmAuto"><span><small>Recommended</small><b>Book nearest Manong</b>${best ? '' : '<em>Nobody is free then. Try another time.</em>'}</span><span class="f4go">${peso(priceA())}${ic('arrowR')}</span></button>
    <div class="f4or">or choose a Manong</div>
    <div class="levels">${poolF().map((a) => row(a, true)).join('')}${off.map((a) => row(a, false)).join('')}</div>
    ${sel !== 'auto' ? `<div class="f4stick"><button class="abtn" data-act="confirmF"><span>Confirm ${m.first}</span><span class="amt">${peso(priceA())}</span></button></div>` : ''}</div>${homeBar}`;
};

// Finding: the back arrow leaves the screen and the search carries on (strip + notification). Cancel stays explicit.
const baseFinding = S['a-finding'];
S['a-finding'] = () => (isF() ? baseFinding().replace('data-act="cancelFindA"', 'data-act="leaveFindF"').replace(/<span class="smallbtn" style="padding:2px 8px;font-size:11px">([^<]*)<\/span>/, '<span class="f4pill">$1</span>') : baseFinding());
// Tracking: back goes home, never back into the booking form.
const baseFound = S['a-found'];
S['a-found'] = () => (isF() ? asAide(baseFound()).replace('data-act="back"', 'data-act="home"') : baseFound());
const baseAF = AFTER['a-found'];
AFTER['a-found'] = () => {
  if (isF() && st.fb && st.fb.status === 'finding') st.fb.status = 'onway';
  if (baseAF) baseAF();
};

const f4Steps = (b) => {
  const m = b.m, conf = b.status === 'confirmed';
  return [['Pending confirmation', 'Request sent Oct 20, 4:12 PM'], ['Confirmed', conf ? `${m.first} confirmed at 4:15 PM` : `Waiting for ${m.first}`], ['In progress', `Starts ${DAY_LONG[b.day]}, Oct ${b.day} at ${b.time}`], ['Completed', 'You review charges and pay']];
};
const f4Rows = (b) => `<div class="lrow">${avF(b.m, 50)}<div style="flex:1"><div style="display:flex;gap:8px;align-items:center"><b style="font-size:17px">${b.m.name}</b><span class="verified">${ic('badge')}Verified</span></div><div style="font-size:12px;color:#555">${b.m.skills} • ${b.m.rating}★ (${b.m.jobs} jobs)</div></div></div>
  <div class="kv" style="margin-top:14px"><div><span>Service</span><span>${TIERS_A[b.tier].name}</span></div><div><span>Duration</span><span>${FD[b.tier]}</span></div><div><span>When</span><span>${whenF(b)}</span></div><div><span>Location</span><span>${addrA().short}</span></div><div><span>Estimate</span><span>${peso(TIERS_A[b.tier].price - voucherOff())}</span></div></div>`;
S['a-pending'] = () => {
  const b = st.fb;
  if (!b) return S['a-home']();
  const conf = b.status === 'confirmed', i = conf ? 1 : 0;
  return `${statusBar()}${canopy(conf ? 'Booking Confirmed' : 'Request Sent', conf ? `${b.m.first} will arrive ${DAY_LONG[b.day]} at ${b.time}.` : `Waiting for ${b.m.first} to confirm.`, { backAct: 'home' })}
  <div class="scroll" style="margin-top:-12px;padding-top:12px"><div class="body">
    <section class="card"><ol class="f4tl">${f4Steps(b).map(([t, s], k) => `<li class="${k < i ? 'done' : k === i ? 'cur' : ''}"><b>${t}</b><small>${s}</small></li>`).join('')}</ol></section>
    <section class="card">${f4Rows(b)}</section></div></div>
  <div class="afoot">${conf ? `<button class="abtn center" data-act="call" data-arg="${b.m.key}">${ic('phone')}Call ${b.m.first}</button>` : ''}<button class="agrey" data-act="sheet" data-arg="cancelF">${ic('x')}Cancel Request</button></div>${homeBar}`;
};
S['a-declined'] = () => {
  const b = st.fb;
  if (!b) return S['a-home']();
  return `${statusBar()}${canopy(`${b.m.first} Can't Take It`, "Your request is closed and you won't be charged.", { backAct: 'home' })}
  <div class="scroll" style="margin-top:-12px;padding-top:12px"><div class="body"><section class="card"><p style="margin:0 0 12px;font-size:15px;line-height:1.45">${b.m.first} couldn't make ${DAY_LONG[b.day]}, Oct ${b.day} at ${b.time}. Pick another Manong for the same time, or choose a different time.</p>${f4Rows(b)}</section></div></div>
  <div class="afoot"><button class="abtn center" data-act="retryF" data-arg="manong">Find another Manong</button><button class="agrey" data-act="retryF" data-arg="time">Pick a new time</button><button class="f4txt" data-act="dismissF">Cancel request</button></div>${homeBar}`;
};

// Order summary: the bill comes first (U14, U15), then rating and tip.
const baseSum = S['a-summary'];
S['a-summary'] = () => {
  if (!isF()) return baseSum();
  const [pn, pp] = CATS[st.cat].materials[0];
  let h = asAide(baseSum()).replace(`<div><span>Base price</span><span>${peso(tA().price)}</span></div>`, `<div><span>Base price</span><span>${peso(tA().price)}</span></div>${st.partOk ? `<div><span>${pn}</span><span>${peso(pp)}</span></div>` : ''}`).replace('#MN-82049', '#MJ-8821');
  const pay = h.match(/<section class="card">\s*<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">[\s\S]*?<\/section>/);
  if (pay) {
    h = h.replace(pay[0], '');
    h = h.replace(/(<div class="status-pill">[\s\S]*?<\/div>)/, `$1${pay[0]}`);
  }
  return h;
};
const baseThanks = S['a-thanks'];
S['a-thanks'] = () => {
  if (!isF()) return baseThanks();
  const m = aideF(), part = st.partOk ? CATS[st.cat].materials[0][1] : 0;
  return `${statusBar()}<div class="f4thx"><div class="f4thxtop"><img src="${A}illo-manong.png" alt="" /></div>
    <div class="f4thxsheet"><small class="f4kick">Job complete</small><h1>Salamat, Enzo</h1><p>${m.first} finished your ${tA().name.toLowerCase()} job. We sent the receipt to enzo@email.com.</p>
      <div class="kv"><div><span>Manong</span><span>${m.name}</span></div><div><span>Your rating</span><span>${'★'.repeat(st.stars || 5)}</span></div>${st.tip ? `<div><span>Tip</span><span>${peso(st.tip)}</span></div>` : ''}<div><span>Total paid</span><b>${peso(totalA() + part)}</b></div></div>
      <button class="abtn center" data-act="home">Back to home</button><button class="f4txt" data-act="receipt">${ic('download')}Download e-receipt</button></div></div>${homeBar}`;
};

// ---------- tab pages ----------
const baseJobSheet = SHEETS.job;
SHEETS.job = (...a) => { const h = baseJobSheet(...a); return isF() ? h.replace('job1.png', 'pipe.png') : h; };
const baseHist = S['a-history'], baseAcct = S['a-account'], baseMsgs = S['a-messages'];
const dateOf = (p) => (p.title.match(/on (.*)$/) || [, ''])[1];
const baseHome4 = S['a-home'];
const pushN = (t, act = 'a-home') => st.nF.unshift({ g: 'Today', t, time: 'Now', unread: true, act });
const SVC4 = { cleaning: 'Home and deep cleaning', plumbing: 'Leaks, clogs, fixtures and electrical', locks: 'Lockouts, rekeying, new locks', moving: 'Studio to 2BR, crew and van included' };
S['a-home'] = () => {
  if (!isF()) return baseHome4();
  const q = st.search.trim().toLowerCase(), p = st.past[0], a = addrA();
  const list = OLD_TILES.filter(([, l]) => !q || l.toLowerCase().includes(q));
  const unread = st.nF.some((n) => n.unread);
  const ICO4 = { cleaning: 'sparkle', plumbing: 'wrench', locks: 'lock', moving: 'truck' };
  const svc = ([k, l]) => `<button class="f4svc" data-act="startA" data-arg="${k}">${ic(ICO4[k] || 'wrench', 'f4sico')}<span class="grow"><b>${l}</b><small>${SVC4[k]}</small></span><span class="f4from"><small>from</small><b>${peso(CAT3[k] ? CAT3[k].tiers.q.price : 250)}</b></span>${ic('chevR')}</button>`;
  const again = p && !q ? `<h2 class="f4h">Book again</h2><div class="f4svcs"><button class="f4svc" data-act="rebookF" data-arg="0">${avF(p.manong, 44)}<span class="grow"><b>${p.manong.name}</b><small>${CATS[p.cat].name} • ${dateOf(p)}</small></span><span class="smallbtn">Book</span></button></div>` : '';
  const jobs = q ? '' : `<h2 class="f4h">Recent jobs in your building</h2><div class="f4jobs"><button class="f4job" data-act="sheet" data-arg="job" data-arg2="0"><img src="${A}pipe.png" alt="" /><b>Sink trap seal</b><small>Plumbing • ₱450</small></button><button class="f4job" data-act="sheet" data-arg="job" data-arg2="1"><img src="${A}job2.png" alt="" /><b>Faucet and bidet line</b><small>Plumbing • ₱650</small></button></div>`;
  return tabsF(`${statusBar()}<div class="ohome f4home">
    <header class="f4hh"><div class="f4row"><button class="f4loc2" data-act="sheet" data-arg="addressA" aria-label="Service address: ${esc(a.short)}, ${esc(a.t.split(',')[0])}. Tap to change">${ic('pin')}<span class="f4locT"><small>Service address</small><b>${esc(a.short)}, ${esc(a.t.split(',')[0])}</b></span>${ic('chevD')}</button>
      <button class="f4bell" data-act="go" data-arg="a-notifs" aria-label="Notifications${unread ? ', unread' : ''}">${ic('bell')}${unread ? '<i></i>' : ''}</button></div></header>
    <label class="f4search">${ic('search')}<input data-model="search" data-rerender value="${esc(st.search)}" placeholder="What needs fixing?" aria-label="Search services" /></label>
    <div class="scroll f4body"><h2 class="f4h" style="margin-top:12px">Services</h2>
      ${list.length ? `<div class="f4svcs">${list.map(svc).join('')}</div>` : `<p class="empty">No service matches "${esc(st.search)}"</p>`}${again}${jobs}</div>${oldTabs('a-home')}</div>${homeBar}`);
};
S['a-notifs'] = () => {
  const grp = (t) => st.nF.filter((n) => n.g === t);
  const sec = (t) => (grp(t).length ? `<div class="f4group"><h3>${t}</h3><div class="list">${grp(t).map((n) => `<button class="listrow" data-act="notifF" data-arg="${st.nF.indexOf(n)}"><i class="f4dot ${n.unread ? '' : 'off'}"></i><div class="grow"><b>${n.t}</b><small>${n.time}</small></div>${ic('chevR')}</button>`).join('')}</div></div>` : '');
  return `${statusBar()}<div class="ohome">${topF('Notifications', { back: 'back', right: unreadN() ? '<button class="f4hdrlink" data-act="readAllF">Mark all read</button>' : '' })}
  <div class="scroll" style="padding:4px 16px 24px">${sec('Today')}${sec('Earlier')}</div></div>${homeBar}`;
};
const unreadN = () => st.nF.some((n) => n.unread);
S['a-history'] = () => {
  if (!isF()) return baseHist();
  const up = st.bkTabF === 'up', b = st.fb;
  const past = st.past.map((p, i) => `<button class="listrow" data-act="sheet" data-arg="receiptF" data-arg2="${i}">${avF(p.manong, 44)}<div class="grow"><b>${CATS[p.cat].name}, ${TIERS_A[p.tier].name.toLowerCase()}</b><small>${dateOf(p)} • ${p.manong.name}</small></div><span class="f4amt"><b>${peso(p.total)}</b><small>Paid</small></span></button>`).join('');
  const active = b ? `<div class="list"><button class="listrow" data-act="openActiveF">${avF(b.m, 44)}<div class="grow"><b>${CATS[b.cat].name}, ${TIERS_A[b.tier].name.toLowerCase()}</b><small>${whenF(b)}</small><span style="display:block;margin-top:6px">${chipF(keyF(b))}</span></div>${ic('chevR')}</button></div>`
    : `<div class="f4empty"><img src="${A}illo-manong.png" alt="" /><b>Nothing booked yet</b><p>Your active Manong jobs will show up here.</p><button class="abtn center" data-act="tab" data-arg="a-home">Book a Manong</button></div>`;
  return tabsF(`${statusBar()}<div class="ohome">${topF('Bookings')}
    <div class="f4seg"><button class="${up ? 'on' : ''}" data-act="bkTabF" data-arg="up">Active</button><button class="${up ? '' : 'on'}" data-act="bkTabF" data-arg="past">Past</button></div>
    <div class="scroll" style="padding:8px 16px 20px">${up ? active : `<div class="list">${past}</div>`}</div>${oldTabs('a-history')}</div>${homeBar}`);
};
S['a-account'] = () => {
  if (!isF()) return baseAcct();
  const tile = (act, arg, icon, label, val) => `<button class="f4tile" data-act="${act}" data-arg="${arg}">${ic(icon)}<b>${label}</b><small>${val}</small></button>`;
  const line = (act, arg, label, val = '') => `<button class="f4line" data-act="${act}" data-arg="${arg}"><span>${label}</span>${val ? `<small>${val}</small>` : ''}${ic('chevR')}</button>`;
  const jobs = st.past.length + (st.fb ? 1 : 0);
  return tabsF(`${statusBar()}<div class="ohome"><div class="scroll f4acc2">
    <header class="f4me"><span class="f4av">ES</span><div class="grow"><h1>Enzo Santos</h1><p>0917 555 0142 · enzo@email.com</p></div><button class="f4edit" data-act="toast" data-arg="Profile editing is not in this prototype">Edit</button></header>
    <div class="f4tiles">
      ${tile('sheet', 'addressA', 'pin', 'Addresses', `${ADDRESSES.length} saved`)}
      ${tile('sheet', 'payA', 'card', 'Payment', st.pay === 'gcash' ? 'GCash' : 'Cash')}
      ${tile('sheet', 'voucher', 'tag', 'Vouchers', st.voucher ? '1 available' : 'None yet')}
      ${tile('tab', 'a-history', 'receipt', 'Bookings', `${jobs} job${jobs === 1 ? '' : 's'}`)}
    </div>
    <button class="f4promo" data-act="toast" data-arg="Invite a neighbor: share your code MANONG50"><span><small>Invite a neighbor</small><b>Both get ₱50 off</b></span><em>MANONG50</em></button>
    <h3 class="f4cap">Settings</h3>
    <div class="f4lines">${line('sheet', 'notifSettings', 'Notifications')}${line('toast', 'Language is English only in this prototype', 'Language', 'English')}</div>
    <h3 class="f4cap">Support</h3>
    <div class="f4lines">${line('toast', 'Mang Juan support replies within 5 minutes', 'Help and support')}${line('toast', 'Terms and privacy open in your browser', 'Terms and privacy')}</div>
    <button class="f3-logout" data-act="logout">Log out</button><p class="f3-ver">Mang Juan v0.5</p></div>${oldTabs('a-account')}</div>${homeBar}`);
};
S['a-messages'] = () => {
  if (!isF()) return baseMsgs();
  const m = st.fb ? st.fb.m : st.past[0] ? st.past[0].manong : CLARISO;
  return tabsF(`${statusBar()}<div class="ohome">${topF('Messages')}
  <div class="scroll" style="padding:16px"><div class="list">
    <button class="listrow" data-act="sheet" data-arg="chat">${avF(m, 48)}<div class="grow"><b>${m.name}</b><small>${esc(st.chat[st.chat.length - 1].t)}</small></div></button>
    <button class="listrow" data-act="toast" data-arg="Mang Juan support replies within 5 minutes"><img src="${A}svg/mang-juan-badge.svg" alt="" style="width:48px;height:48px;border-radius:50%" /><div class="grow"><b>Mang Juan Support</b><small>How can we help you today?</small></div></button></div></div>${oldTabs('a-messages')}</div>${homeBar}`);
};

// ---------- sign in (palette and dividers follow Flow 2) ----------
const baseWelcome = S['a-welcome'], baseLogin = S['a-login'];
const f4bold = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="f4bold"><feMorphology operator="dilate" radius="0.6"/></filter></svg>';
const f4mark = (h, x = '') => `<img class="f4wm" src="${A}svg/mang-juan-wordmark.svg" alt="mang juan" style="height:${h}px;${x}" />`;
const f4social = () => `<div class="f4soc"><button data-act="social" data-arg="Google">${gLogo(20)}Google</button><button data-act="social" data-arg="Facebook"><svg width="20" height="20" viewBox="0 0 24 24"><path fill="#1877f2" d="M14 22v-8h2.7l.4-3.2H14V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H8.2V14H11v8z"/></svg>Facebook</button></div>`;
S['a-welcome'] = () => (!isF() ? baseWelcome() : `<div class="oldauth">${statusBar()}
  <div class="f4center">${f4mark(52)}</div>
  <div><button class="f4cta" data-act="sheet" data-arg="phoneLogin">${icFill('phone')}Continue with mobile number</button>
    <div class="f4or2">or continue with</div>${f4social()}
    <p class="f4alt">Have an account? <button class="link" data-act="go" data-arg="a-login">Log in with email</button></p></div></div>${homeBar}`);
S['a-login'] = () => (!isF() ? baseLogin() : `<div class="oldauth">${statusBar()}${f4bold}
  <div style="margin-top:96px;text-align:center">${f4mark(44, 'margin:0 auto;')}<p class="f4tag">Log in to book your next repair.</p></div>
  <div style="margin-top:22px" id="loginForm">
    <label class="f4lab2" for="f4lid">Email or mobile number</label>
    <div class="oinput"><input id="f4lid" data-model="loginId" value="${esc(st.loginId)}" placeholder="name@email.com" autocomplete="username" /></div>
    <label class="f4lab2" for="f4lpw">Password</label>
    <div class="oinput"><input id="f4lpw" data-model="loginPw" type="${st.showPw ? 'text' : 'password'}" value="${esc(st.loginPw)}" placeholder="Password" autocomplete="current-password" /><button data-act="togglePw" aria-label="${st.showPw ? 'Hide' : 'Show'} password">${ic(st.showPw ? 'eye' : 'eyeOff')}</button></div></div>
  <div style="text-align:right;margin:2px 0 14px"><button class="link" data-act="sheet" data-arg="forgot">Forgot password?</button></div>
  <button class="f4cta" data-act="loginA">Log in</button><div class="f4or2">or continue with</div>${f4social()}
  <button class="f4cta ghost" style="margin-top:12px" data-act="sheet" data-arg="phoneLogin">Use mobile number instead</button>
  <p class="f4alt" style="margin-top:auto">New to Mang Juan? <button class="link" data-act="sheet" data-arg="signup">Sign up</button></p></div>${homeBar}`);

// ---------- sheets ----------
SHEETS.receiptF = () => {
  const p = st.past[+st.sheet.arg2 || 0], t = TIERS_A[p.tier];
  return `<h3>${CATS[p.cat].name}, ${t.name.toLowerCase()}</h3><p class="sub">${p.id} • ${dateOf(p)} • ${p.manong.name}</p>
  <div class="greybox kv" style="margin-bottom:16px"><div><span>Base price</span><span>${peso(t.price)}</span></div><div><span>Paid</span><span>${peso(p.total)}</span></div><div><span>Payment</span><span>${st.pay === 'gcash' ? 'GCash' : 'Cash'}</span></div></div>
  <div class="stack"><button class="btn primary" data-act="rebookF" data-arg="${+st.sheet.arg2 || 0}">Book ${p.manong.first} again</button><button class="btn secondary" data-act="closeSheet">Close</button></div>`;
};
SHEETS.cancelF = () => `<h3>Cancel this booking?</h3><p class="sub">It's free until your Manong starts the job. Tell us why (optional).</p>
  <div class="opts">${['Plans changed', 'Fixed it myself', 'Booked the wrong time', 'Other'].map((r, i) => `<button class="opt ${st.sheet.reason === i ? 'on' : ''}" data-act="cancelReason" data-arg="${i}"><span class="grow"><b>${r}</b></span>${st.sheet.reason === i ? ic('check') : ''}</button>`).join('')}</div>
  <div class="stack" style="margin-top:12px"><button class="btn danger" data-act="cancelF">Cancel booking</button><button class="btn secondary" data-act="closeSheet">Keep booking</button></div>`;
SHEETS.notifSettings = () => {
  const sw = (k, l, sub) => `<div class="opt" style="cursor:default"><span class="grow"><b>${l}</b><small>${sub}</small></span><button class="f4sw ${st.sw[k] ? 'on' : ''}" role="switch" aria-checked="${!!st.sw[k]}" aria-label="${l}" data-act="swF" data-arg="${k}"><i></i></button></div>`;
  return `<h3>Notifications</h3><p class="sub">Choose what we send you.</p><div class="opts">${sw('book', 'Booking updates', 'Accepted, on the way, completed')}${sw('promo', 'Promos and vouchers', 'Occasional offers')}</div><button class="btn primary" data-act="closeSheet">Done</button>`;
};
SHEETS.partA = () => {
  const [pn, pp] = CATS[st.cat].materials[0];
  return `<h3>${aideF().first} needs a part</h3><p class="sub">Approve it before it's added to your bill. Nothing changes unless you say yes.</p>
  <div class="greybox kv" style="margin-bottom:16px"><div><span>${pn}</span><span>${peso(pp)}</span></div><div><span>Total with this part</span><span>${peso(priceA() + pp)}</span></div></div>
  <div class="stack"><button class="btn primary" data-act="partF" data-arg="1">Approve ${peso(pp)}</button><button class="btn secondary" data-act="partF" data-arg="0">Decline</button></div>`;
};
const baseChat = SHEETS.chat;
SHEETS.chat = () => {
  const h = baseChat();
  const m = aideF();
  if (!isF() || m === CLARISO) return h;
  return h.replace(/<img src="assets\/clariso\.png"[^>]*>/, avF(m, 36)).replace(/Clariso Perez/g, m.name).replace(/Clariso/g, m.first);
};
const baseCF = SHEETS.cancelFindA;
SHEETS.cancelFindA = () => (isF() ? baseCF().replace("You'll go back to choosing a service.", "You'll go back to the home screen.") : baseCF());

// ---------- actions ----------
const baseStartA = ACT.startA;
const baseJD = ACT.jobDoneA;
const baseReceipt = ACT.receipt;
Object.assign(ACT, {
  dayF(n) {
    st.day = +n;
    const ok = slotsF(st.day).filter((t) => t !== FULL_TIME);
    if (!ok.includes(st.time)) st.time = ok[0] || st.time;
    render();
  },
  bkTabF(t) { st.bkTabF = t; render(); },
  openActiveF() {
    const b = st.fb;
    if (!b) return;
    b.bg = false;
    go(ROUTE_F[keyF(b)], { reset: true });
  },
  dismissF() {
    st.fb = null;
    ACT.home();
    toast('Request cancelled. No charge.');
  },
  notifF(i) {
    const n = st.nF[+i];
    n.unread = false;
    go(n.act, { reset: true, replace: true });
  },
  rebookF(i) {
    if (st.fb) return toast('You have an active booking. Open it from Bookings.');
    const p = st.past[+i];
    st.sheet = null;
    ACT.startA(p.cat);
    if (TIERS_A[p.tier]) st.tierA = p.tier;
    const a = rosterF().find((x) => x.m.first === p.manong.first);
    st.pickManong = a ? a.m.key : null;
    go('a-details');
    toast(`Requesting ${p.manong.first} again`);
  },
  cancelF() {
    st.fb = null;
    st.sheet = null;
    st.stack = ['a-home'];
    st.screen = 'a-home';
    render(true);
    toast('Booking cancelled. No charge.');
  },
  startA(k) {
    if (isF() && st.fb) return toast('You have an active booking. Open it from Bookings.');
    baseStartA(k);
    if (isF()) Object.assign(st, { when: 'now', pickManong: null, altManong: false, partOk: false });
  },
  findF() {
    if (!st.descA.trim() && !st.symptomsA.length) {
      toast('Add a description or tap a symptom');
      return shake('#descCard');
    }
    go('a-pick');
  },
  pickF(k) {
    st.pickManong = k === 'auto' ? null : k;
    render();
  },
  confirmAuto() {
    st.pickManong = null;
    ACT.confirmF();
  },
  swF(k) {
    st.sw[k] = !st.sw[k];
    render();
  },
  readAllF() {
    st.nF.forEach((n) => (n.unread = false));
    render();
  },
  confirmF() {
    const m = aideF();
    if (st.when === 'now') {
      Object.assign(st, { arrived: false, eta: 10, km: 1.4 });
      st.fb = { status: 'finding', mode: 'now', cat: st.cat, m, day: 20, time: 'Now', tier: st.tierA };
      return go('a-finding');
    }
    st.fb = { status: 'pending', mode: 'schedule', cat: st.cat, m, day: st.day, time: st.time, tier: st.tierA };
    pushN(`Request sent to ${m.first}. We'll tell you when he confirms.`, 'a-history');
    go('a-pending', { reset: true });
    st.stack = ['a-home'];
  },
  leaveFindF() {
    clearTimers();
    if (st.fb) st.fb.bg = true;
    go('a-home', { reset: true, replace: true });
    toast("We'll let you know when a Manong accepts");
    setTimeout(() => {
      const b = st.fb;
      if (!isF() || !b || b.status !== 'finding' || !b.bg) return;
      Object.assign(st, { eta: 10, km: 1.4, arrived: false });
      b.status = 'onway';
      b.bg = false;
      pushN(`${b.m.first} accepted your request`, 'a-home');
      if (['a-home', 'a-history', 'a-account', 'a-messages'].includes(st.screen)) render();
      toast(`${b.m.first} accepted your request`);
    }, 3500);
  },
  retryF(w) {
    const b = st.fb;
    st.fb = null;
    st.altManong = true;
    st.pickManong = null;
    if (b && b.cat) st.cat = b.cat;
    if (w === 'manong') go('a-pick', { reset: true });
    else go('a-details', { reset: true });
    st.stack = ['a-home'];
  },
  partF(y) {
    st.partOk = !!+y;
    st.sheet = null;
    render();
    toast(+y ? 'Part approved and added to your bill' : 'Declined. Manong finishes the base repair only.');
  },
  confirmCancelA() {
    clearTimers();
    st.fb = null;
    st.sheet = null;
    go('a-home', { reset: true, replace: true });
    toast(st.pay === 'gcash' ? 'Request cancelled. GCash hold released.' : 'Request cancelled.');
  },
  jobDoneA() {
    if (isF() && st.fb) st.fb.status = 'done';
    return baseJD.call(ACT);
  },
  submitA() {
    const part = st.partOk ? CATS[st.cat].materials[0][1] : 0;
    st.past.unshift({ id: 'MJ-8821', cat: st.cat, tier: st.tierA, title: `${CATS[st.cat].name} on Oct 20`, manong: aideF(), total: totalA() + part });
    st.fb = null;
    go('a-thanks', { replace: true });
  },
  receipt() {
    if (!isF()) return baseReceipt.call(ACT);
    const m = aideF(), [pn, pp] = CATS[st.cat].materials[0], part = st.partOk ? pp : 0;
    const t = ['MANG JUAN E-RECEIPT', 'Booking #MJ-8821', `${tA().name}: ${peso(tA().price)}`, st.partOk ? `${pn}: ${peso(pp)}` : '', st.voucher ? 'Voucher MANONG50: -₱50' : '', `Tip: ${peso(st.tip)}`, `Total: ${peso(totalA() + part)}`, `Paid via ${st.pay === 'gcash' ? 'GCash' : 'Cash'}`, `Manong: ${m.name}`].filter(Boolean).join('\n') + '\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([t], { type: 'text/plain' }));
    a.download = 'mang-juan-receipt-MJ-8821.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('E-receipt downloaded');
  },
});
const baseLT = LIVE.totalA;
LIVE.totalA = () => (isF() && st.partOk ? peso(totalA() + CATS[st.cat].materials[0][1]) + '.00' : baseLT());

// ---------- simulate panel ----------
const f4sim = (key, fn) => Object.defineProperty(SIM, key, { configurable: true, enumerable: true, get: () => (isF() ? fn() : base4[key] || []) });
const base4 = { 'a-found': SIM['a-found'] };
f4sim('a-found', () => [...base4['a-found'], ['Manong asks to add a part', () => sheet('partA')]]);
f4sim('a-pending', () => {
  const b = st.fb;
  if (!b) return [];
  if (b.status === 'pending') return [[`${b.m.first} confirms`, () => { b.status = 'confirmed'; pushN(`${b.m.first} confirmed ${DAY_LONG[b.day]}, Oct ${b.day} at ${b.time}`, 'a-history'); render(true); }], [`${b.m.first} can't take it (declined)`, () => { b.status = 'declined'; pushN(`${b.m.first} can't take your booking. Pick another Manong.`, 'a-history'); go('a-declined', { replace: true }); }]];
  return [[`${b.m.first} is on the way`, () => { b.status = 'onway'; Object.assign(st, { eta: 10, km: 1.4, arrived: false }); go('a-found', { replace: true }); }]];
});
for (const [k, label] of [
  ['a-welcome', 'Welcome'],
  ['a-login', 'Log in'],
  ['a-home', 'Home'],
  ['a-service', '1 Choose service'],
  ['a-details', '2 Service details and schedule'],
  ['a-pick', '3 Choose Manong and confirm'],
  ['a-finding', '4 Finding Manong'],
  ['a-found', '5 Live Manong tracking'],
  ['a-pending', 'Scheduled: pending, then confirmed'],
  ['a-declined', 'Scheduled: Manong declined'],
  ['a-summary', '6 Order summary and extra charges'],
  ['a-thanks', '7 Thank you'],
  ['a-history', 'Bookings'],
  ['a-account', 'Account'],
  ['a-messages', 'Messages'],
  ['a-notifs', 'Notifications'],
]) {
  FRAMES[k] = typeof FRAMES[k] === 'object' ? { ...FRAMES[k], final: label } : FRAMES[k] ? { main: FRAMES[k], final: label } : label;
}
JUMP.final = ['a-welcome', 'a-login', 'a-home', 'a-service', 'a-details', 'a-pick', 'a-finding', 'a-found', 'a-pending', 'a-declined', 'a-summary', 'a-thanks', 'a-history', 'a-account', 'a-messages', 'a-notifs'];
const baseJump4 = jumpTo;
jumpTo = (s) => {
  if (isF()) {
    // Screens that only make sense mid-booking get a booking to show.
    const sch = { day: 21, time: '10:30 AM', mode: 'schedule' }, now = { day: 20, time: 'Now', mode: 'now' };
    const seeds = { 'a-pending': ['pending', sch], 'a-declined': ['declined', sch], 'a-finding': ['finding', now], 'a-found': ['onway', now], 'a-summary': ['done', now] };
    if (seeds[s]) st.fb = { status: seeds[s][0], cat: st.cat, m: aideF(), tier: st.tierA, ...seeds[s][1] };
    if (['a-pick', 'a-details'].includes(s)) Object.assign(st, { when: s === 'a-pick' ? 'schedule' : st.when });
  }
  return baseJump4(s);
};
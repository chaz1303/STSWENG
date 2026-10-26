/* Mang Juan clickable hi-fi prototype, built from Figma "Booking Flow High Fidelity" (node 5216:702).
   Standalone vanilla JS: open index.html in a browser. Nothing in src/ imports this folder. */

// ---------- icons (Lucide-style, 24px grid) ----------
const P = {
  arrowL: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  camera:
    '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  droplet:
    '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
  hammer:
    '<path d="m15 12-8.5 8.5a2.1 2.1 0 1 1-3-3L12 9"/><path d="M17.6 15 22 10.6"/><path d="m20.9 11.7-1.3-1.3c-.6-.6-.9-1.4-.9-2.2v-.9L16 4.6A5.6 5.6 0 0 0 12.1 3H9l.9.8A6.2 6.2 0 0 1 12 8.4V10l2 2h2.5l2.3 1.9"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.7a1 1 0 0 0-.2-.6l-3.5-4.3a1 1 0 0 0-.8-.4H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  shieldCheck:
    '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  badge:
    '<path d="M3.9 8.6a4 4 0 0 1 4.7-4.7 4 4 0 0 1 6.8 0 4 4 0 0 1 4.7 4.7 4 4 0 0 1 0 6.8 4 4 0 0 1-4.7 4.7 4 4 0 0 1-6.8 0 4 4 0 0 1-4.7-4.7 4 4 0 0 1 0-6.8Z"/><path d="m9 12 2 2 4-4"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1"/>',
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  alert:
    '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:
    '<path d="M9.9 9.9a3 3 0 1 0 4.2 4.2"/><path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.7 2.7"/><path d="M6.6 6.6A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1"/>',
  hourglass:
    '<path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2"/>',
  nav: '<path d="m3 11 19-9-9 19-2-8-8-2z"/>',
  idcard: '<rect width="20" height="14" x="2" y="5" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 13H8M16 17H8"/>',
  msg: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  bike: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  building:
    '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1L12 2z"/>',
  steth:
    '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 12 0v-4"/><circle cx="20" cy="10" r="2"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  touch: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  speaker: '<path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const icFill = (n) => `<svg class="i fill" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const peso = (n) => '₱' + n.toLocaleString('en-PH');
const A = 'assets/';

// ---------- data ----------
const CATS = {
  plumbing: { who: 'plumber', name: 'Plumbing', icon: 'droplet', pro: 'Plumbing Specialist', tone: ['#dce9ff', '#1d5fd1', '#bcd4ff'],
    symptoms: ['Leak', 'Clogged drain', 'No water', 'Low pressure', 'Running toilet'],
    materials: [['P-trap, PVC 1½ in', 180], ["Plumber's tape", 35]] },
  electrical: { who: 'electrician', name: 'Electrical', icon: 'zap', pro: 'Electrical Specialist', tone: ['#fff1c2', '#6b4f00', '#ffe08a'],
    symptoms: ['No power', 'Tripping breaker', 'Sparking outlet', 'Flickering lights', 'Dead switch'],
    materials: [['Duplex outlet', 160], ['Electrical tape', 30]] },
  cleaning: { who: 'cleaner', name: 'Cleaning', icon: 'sparkle', pro: 'Cleaning Specialist', tone: ['#ddf3e4', '#1f7a4d', '#bfe6cb'],
    symptoms: ['Deep clean', 'Move-out clean', 'Aircon cleaning', 'Kitchen', 'Bathroom'],
    materials: [['Cleaning solution', 120]] },
  repairs: { who: 'handyman', name: 'Repairs', icon: 'hammer', pro: 'Repair Specialist', tone: ['#ffdde5', '#b4234a', '#ffc0cf'],
    symptoms: ['Door', 'Cabinet', 'Wall patch', 'Furniture', 'Window'],
    materials: [['Hinges (pair)', 140], ['Wood screws', 25]] },
  locks: { who: 'locksmith', name: 'Locks', icon: 'key', pro: 'Locksmith', tone: ['#e9e1ff', '#5b3cc4', '#d3c5ff'],
    symptoms: ['Locked out', 'Broken lock', 'Key copy', 'Change lock', 'Smart lock'],
    materials: [['Lock cylinder', 350]] },
  moving: { who: 'mover', name: 'Moving', icon: 'truck', pro: 'Moving Crew', tone: ['#ffe3cf', '#a8501a', '#ffc9a3'],
    symptoms: ['Few boxes', 'Furniture', 'Whole unit', 'Same building', 'Other building'],
    materials: [['Packing boxes (5)', 150]] },
};
// Flow 1 home tiles map onto the same catalogue
const OLD_TILES = [
  ['cleaning', 'Cleaning', 'sparkle'],
  ['plumbing', 'House Repairs', 'briefcase'],
  ['locks', 'Locksmith', 'lock'],
  ['moving', 'Movers', 'truck'],
];
const TIERS_B = {
  quick: { name: 'Quick checkup', desc: 'Inspection or a very small fix', price: 250, meta: 'Base charge' },
  standard: { name: 'Standard repair', desc: 'Typical repair in one visit', price: 450, meta: 'Most booked' },
  major: { name: 'Major repair', desc: 'Installation or longer work', price: 800, meta: 'Starting price' },
};
const TIERS_A = {
  quick: { name: 'Quick Checkup', short: 'Quick', dur: '~10 mins', desc: 'Inspection, meter test, minor fuse check',
    badge: 'CHEAPEST DEAL', price: 250, unit: 'Fixed base' },
  standard: { name: 'Standard Repair', short: 'Standard', dur: '20–40 mins', desc: 'Aircon clean, plumbing clogs, socket rewire',
    badge: 'MOST POPULAR', price: 450, unit: 'Fixed base', foot: 'Includes standard tools' },
  major: { name: 'Major Overhaul', short: 'Overhaul', dur: '1hr +', desc: 'Main drainage overhaul, toilet re-seating /reinstallation, booster pump & water heater install',
    price: 800, plus: true, unit: 'Starting Price', foot: 'Parts billed at official receipt' },
};
const SYMPTOMS_A = ['Slow Drain', 'Dripping Water', 'Low Pressure', 'Strange Smell', 'Burst Pipe'];
const PRAISE_A = [['⏰', 'Arrived on time'], ['🔧', 'Clean & thorough work'], ['💬', 'Courteous & polite'],
  ['💡', 'Helpful tips'], ['🛡️', 'Followed safety rules'], ['🏷️', 'Fair & honest pricing']];
const PRAISE_B = ['On time', 'Clean work', 'Explained the fix', 'Fair price', 'Friendly', 'Tidied up'];
const STAR_A = ['', 'Hindi maganda (1 Star)', 'Medyo kulang (2 Stars)', 'Okay lang (3 Stars)', 'Ayos! (4 Stars)', 'Sobrang Ayos! (5 Stars)'];
const STAR_B = ['', 'Poor', 'Could be better', 'Okay', 'Great job', 'Excellent'];
const DAYS = [['Today', 20], ['Wed', 21], ['Thu', 22], ['Fri', 23], ['Sat', 24]];
const DAY_LONG = { 20: 'Tue', 21: 'Wed', 22: 'Thu', 23: 'Fri', 24: 'Sat' };
const TIMES = ['9:00 AM', '10:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'];
const FULL_TIME = '1:00 PM';
const ADDRESSES = [
  { t: 'Avida Towers Prime Taft, Tower 1', s: 'Unit 6, Tower 1, Taft Ave, Pasay City', short: 'Unit 6, Tower 1' },
  { t: 'Avida Towers Prime Taft, Tower 1', s: 'Unit 12B, Tower 1, Taft Ave, Pasay City', short: 'Unit 12B, Tower 1' },
  { t: 'Avida Towers Prime Taft, Tower 2', s: 'Unit 21C, Tower 2, Taft Ave, Pasay City', short: 'Unit 21C, Tower 2' },
];
const CLARISO = { name: 'Clariso Perez', first: 'Clariso', img: A + 'clariso.png', skills: 'Plumbing and electrical', rating: '4.9', jobs: 342, vehicle: 'White motorcycle, ABC 1234' };
const JOHN = { name: 'John Stewart', first: 'John', ini: 'JS', skills: 'Plumbing and electrical', rating: '4.9', jobs: 342, vehicle: 'White motorcycle, ABC 1234' };
const ALFRED = { name: 'Alfred Pennyworth', first: 'Alfred', ini: 'AP', skills: 'Plumbing', rating: '4.8', jobs: 128, vehicle: 'Red scooter, NBC 5521' };
const foundManong = () => (st.when === 'now' ? ALFRED : JOHN);
const MANONGS = { clariso: CLARISO, john: JOHN, alfred: ALFRED };

const VARIANTS = {
  main: { flow: 'A', label: 'Main flow', group: 'Flow 1', start: 'a-welcome' },
  v2: { flow: 'A', label: 'Variation 2', group: 'Flow 1', start: 'a-welcome' },
  v3: { flow: 'A', label: 'Variation 3', group: 'Flow 1', start: 'a-welcome' },
  overhaul: { flow: 'B', label: 'Var 1 · Overhaul', group: 'Flow 2', start: 'b-welcome' },
  color: { flow: 'B', label: 'Var 2 · Color', group: 'Flow 2', start: 'b-welcome' },
};
// Figma frame each screen reproduces (shown under the phone)
const FRAMES = {
  'a-welcome': 'Welcome', 'a-login': 'Log in', 'a-home': 'Home', 'a-history': 'History tab (added)',
  'a-account': 'Account tab (added)', 'a-messages': 'Messages tab (added)',
  'a-service': { main: '1 Choose service', v2: 'V2-1 Choose service (adds recent jobs nearby)' },
  'a-service-map': 'V3-1 Choose service (map-first, 2 service levels)',
  'a-details': { main: '2 Service details', v2: 'V2-2 Service details (notes hint)', v3: '2 Service details' },
  'a-finding': { main: '3 Finding Manong', v2: 'V2-3 Finding Manong', v3: '3 Finding Manong' },
  'a-found': { main: '4 Manong found', v2: 'V2-4 Manong found', v3: '4 Manong found' },
  'a-summary': '5 Rate + 6 Tip & pay (one scrolling screen)', 'a-thanks': 'Done (added)',
  'b-welcome': 'Welcome', 'b-login': 'Log in', 'b-phone': 'Mobile number (added)', 'b-otp': 'OTP (added)',
  'b-home': 'Home', 'b-bookings': 'Bookings tab (added)', 'b-profile': 'Profile tab (added)',
  'b-size': 'Book 1: Service size', 'b-problem': 'Book 2: Problem', 'b-schedule': 'Book 3: Schedule',
  'b-finding': 'State: Finding your Manong', 'b-none': 'State: No Manong free', 'b-review': 'Book 4: Review and confirm',
  'b-status': 'Book 5: Booking status', 'b-live': 'State: Manong on the way (live map)',
  'b-ondemand': 'State: On-demand accepted', 'b-charges': 'Book 6: Charges and payment',
  'b-rate': 'Book 7: Rate your Manong', 'b-thanks': 'Done (added)',
};
const JUMP = {
  A: ['a-welcome', 'a-login', 'a-home', 'a-service', 'a-details', 'a-finding', 'a-found', 'a-summary', 'a-thanks', 'a-history', 'a-account', 'a-messages'],
  B: ['b-welcome', 'b-login', 'b-phone', 'b-otp', 'b-home', 'b-size', 'b-problem', 'b-schedule', 'b-finding', 'b-none',
    'b-review', 'b-status', 'b-live', 'b-ondemand', 'b-charges', 'b-rate', 'b-thanks', 'b-bookings', 'b-profile'],
};

// ---------- state ----------
function fresh(variant = 'main') {
  const m = VARIANTS[variant].flow === 'A' ? CLARISO : JOHN;
  return {
    variant, screen: VARIANTS[variant].start, stack: [], sheet: null, call: null,
    // auth
    loginId: '', loginPw: '', showPw: false, phoneNum: '', otp: '', authErr: '',
    // booking draft
    cat: 'plumbing', tier: 'standard', addr: 1, desc: '', symptoms: [], photos: [], notes: '',
    when: 'schedule', day: 21, time: '10:30 AM', pay: 'gcash', voucher: true, preferred: null,
    // flow 1 extras
    tierA: 'quick', addrA: 0, symptomsA: ['Dripping Water'], descA: '', photosA: [{ src: A + 'pipe.png', label: 'Pipe Joint' }], notesA: '',
    search: '',
    // tracking / outcomes
    outcome: 'found', findPct: 0, findSecs: 38, eta: 10, km: 1.4, liveEta: 18, arrived: false,
    // payment & rating
    stars: 5, praise: ['Arrived on time', 'Clean & thorough work'], starsB: 4, praiseB: ['On time', 'Clean work'],
    review: '', tip: 50, customTip: false, paid: false,
    // bookings
    booking: { id: 'MJ-8821', cat: 'plumbing', tier: 'standard', problem: 'Leak under the sink', day: 21, time: '10:30 AM',
      addr: 1, manong: m, status: 'confirmed', mode: 'schedule', pay: 'gcash' },
    past: [{ id: 'MJ-8710', cat: 'plumbing', tier: 'standard', title: 'Plumbing on Oct 2', manong: m, total: 520 }],
    chat: [{ me: false, t: 'Hi po! This is Clariso, your Manong. On my way to Avida Towers.' }],
    notifs: [
      { t: `${m.first} confirmed your booking`, s: 'Wed, Oct 21 at 10:30 AM', unread: true },
      { t: '₱50 off your next repair', s: 'Use MANONG50 before Oct 31', unread: true },
      { t: 'Rate your last Manong', s: 'Plumbing on Oct 2', unread: false },
    ],
    hints: true,
  };
}
let st = fresh();
let timers = [];
const phone = document.getElementById('phone');
const panel = document.getElementById('panel');

// ---------- helpers ----------
const cat = () => CATS[st.cat];
const flow = () => VARIANTS[st.variant].flow;
const tB = () => TIERS_B[st.tier];
const tA = () => TIERS_A[st.tierA];
const addrB = () => ADDRESSES[st.addr];
const addrA = () => ADDRESSES[st.addrA];
const voucherOff = () => (st.voucher ? 50 : 0);
const priceA = () => tA().price - voucherOff();
const totalA = () => priceA() + st.tip;
const problemB = () => {
  if (st.symptoms.length) {
    const s = st.symptoms.join(', ');
    return /sink/i.test(st.desc) && st.symptoms.length === 1 ? `${s} under the sink` : s;
  }
  const d = st.desc.trim();
  return d ? (d.length > 26 ? d.slice(0, 26) + '…' : d) : '';
};
const whenB = () => (st.when === 'now' ? 'Now, in about 30 min' : st.day && st.time ? `${DAY_LONG[st.day]}, Oct ${st.day}, ${st.time}` : '');
const bk = () => st.booking;
const bkMaterials = () => (bk() ? CATS[bk().cat].materials : []);
const bkBase = () => TIERS_B[bk().tier].price;
const bkTotal = () => bkBase() + bkMaterials().reduce((a, [, p]) => a + p, 0);
const val = (v) => (v ? `<span class="v">${esc(v)}</span>` : '<span class="na">Not set yet</span>');

function clearTimers() {
  timers.forEach(clearInterval);
  timers = [];
}
function every(ms, fn) {
  timers.push(setInterval(fn, ms));
}
function go(screen, opts = {}) {
  if (!opts.replace) st.stack.push(st.screen);
  if (opts.reset) st.stack = [];
  st.screen = screen;
  st.sheet = null;
  st.authErr = '';
  render(true);
}
function back() {
  st.screen = st.stack.pop() || VARIANTS[st.variant].start;
  st.sheet = null;
  render(true);
}
function toast(msg) {
  phone.querySelector('.toast')?.remove();
  phone.insertAdjacentHTML('beforeend', `<div class="toast" role="status">${esc(msg)}</div>`);
}
function sheet(type, data = {}) {
  st.sheet = { type, ...data };
  render();
}
function shake(sel) {
  const el = phone.querySelector(sel);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

// ---------- shared chrome ----------
const statusBar = (light) => `<div class="notch"></div><div class="statusbar ${light ? 'light' : ''}"><span>9:41</span>
  <span class="icons"><svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.5c2.2 0 4.2.9 5.7 2.3l1.1-1.1A9.6 9.6 0 0 0 8 1 9.6 9.6 0 0 0 1.2 3.7l1.1 1.1A8 8 0 0 1 8 2.5zm0 3c1.4 0 2.6.5 3.6 1.4l1.1-1.1A6.5 6.5 0 0 0 8 4a6.5 6.5 0 0 0-4.7 1.8l1.1 1.1c1-.9 2.2-1.4 3.6-1.4zm0 3c.6 0 1.1.2 1.5.6L8 10.6 6.5 9.1c.4-.4.9-.6 1.5-.6z"/></svg>
  <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><rect x="24" y="4" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".5"/></svg></span></div>`;
const homeBar = '<div class="homebar"></div>';

// ==========================================================
// FLOW 1 · Original (Main / Variation 2 / Variation 3)
// ==========================================================
const oldSocial = () => `
  <button class="obtn fb" data-act="social" data-arg="Facebook"><svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.5c0-.8.2-1.4 1.4-1.4h1.4V5.6c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.4V14h2.3v7z" fill="#1877f2"/></svg><span>Continue With Facebook</span></button>
  <button class="obtn" data-act="social" data-arg="Google">${gLogo(26)}<span>Continue With Google</span></button>
  <button class="obtn" data-act="go" data-arg="a-login">${icFill('phone')}<span>Log In using mobile phone</span></button>`;
function gLogo(s = 20) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-1.9 3.3-4.8 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>`;
}

const S = {};

S['a-welcome'] = () => `<div class="oldauth">${statusBar()}
  <img class="logo" src="${A}manong-logo.png" alt="manong" />
  <div style="margin-top:auto;display:flex;flex-direction:column;gap:9px">${oldSocial()}</div></div>${homeBar}`;

S['a-login'] = () => `<div class="oldauth">${statusBar()}
  <img class="logo" src="${A}manong-logo.png" alt="manong" style="margin-top:130px" />
  <div style="margin-top:28px" id="loginForm">
    <label class="oinput"><input data-model="loginId" value="${esc(st.loginId)}" placeholder="name@email.com or mobile number" autocomplete="username" aria-label="Email or mobile number" /></label>
    <label class="oinput"><input data-model="loginPw" type="${st.showPw ? 'text' : 'password'}" value="${esc(st.loginPw)}" placeholder="Password" aria-label="Password" />
      <button data-act="togglePw" aria-label="Show password">${ic(st.showPw ? 'eye' : 'eyeOff')}</button></label>
  </div>
  <div class="twobtn"><button data-act="sheet" data-arg="signup">Sign Up</button><button class="dark" data-act="loginA">Log In</button></div>
  <div class="oor">or</div>
  <div style="display:flex;flex-direction:column;gap:9px">${oldSocial().replace('data-act="go" data-arg="a-login"', 'data-act="sheet" data-arg="phoneLogin"')}</div></div>${homeBar}`;

const oldTabs = (on) => `<nav class="otabs">${[
  ['a-home', 'home', 'Home'], ['a-history', 'file', 'History'], ['a-account', 'user', 'Account'], ['a-messages', 'msg', 'Messages'],
].map(([s, i, l]) => `<button class="${on === s ? 'on' : ''}" data-act="tab" data-arg="${s}">${ic(i)}${l}</button>`).join('')}</nav>`;

S['a-home'] = () => {
  const q = st.search.trim().toLowerCase();
  const tiles = OLD_TILES.filter(([, l]) => !q || l.toLowerCase().includes(q));
  return `<div class="ohome">${statusBar()}
  <div class="ohead"><span>Hi, Enzo!</span><button class="avatar" data-act="tab" data-arg="a-account" aria-label="Account">${icFill('user')}</button></div>
  <label class="osearch">${ic('search')}<input data-model="search" data-rerender value="${esc(st.search)}" placeholder="Search..." aria-label="Search services" /></label>
  <div class="scroll" style="padding-top:20px">
    <div style="font-size:20px;padding:0 27px 18px">Select Your Service</div>
    <div class="otiles">${tiles.map(([k, l, i]) => `<button class="otile" data-act="startA" data-arg="${k}">${ic(i)}${l}</button>`).join('') ||
      '<p class="empty" style="width:100%">No service matches "' + esc(st.search) + '"</p>'}</div>
  </div>${oldTabs('a-home')}</div>${homeBar}`;
};

S['a-history'] = () => `<div class="ohome">${statusBar()}<div class="ohead" style="height:110px"><span>History</span></div>
  <div class="scroll" style="padding:20px 16px"><div class="list">
  ${st.past.map((p) => `<button class="listrow" data-act="toast" data-arg="Receipt ${p.id} · ${peso(p.total)} paid"><img class="av" style="width:44px;height:44px;border-radius:50%" src="${A}clariso.png" alt="" /><div class="grow"><b>${CATS[p.cat].name}, ${TIERS_B[p.tier].name.toLowerCase()}</b><small>${p.title.replace(/^\w+ /, '')} · ${p.manong.name} · ${peso(p.total)}</small></div>${ic('chevR')}</button>`).join('')}
  </div></div>${oldTabs('a-history')}</div>${homeBar}`;

S['a-account'] = () => `<div class="ohome">${statusBar()}<div class="ohead" style="height:110px"><span>Account</span></div>
  <div class="scroll" style="padding:20px 16px"><div class="list">
   <div class="listrow"><div class="av" style="width:48px;height:48px;border-radius:50%;background:#222;color:#fff;display:grid;place-items:center">${icFill('user')}</div><div class="grow"><b>Enzo Santos</b><small>enzo@email.com · 0917 555 0142</small></div></div>
   <button class="listrow" data-act="sheet" data-arg="addressA">${ic('pin')}<div class="grow"><b>Saved address</b><small>${addrA().s}</small></div>${ic('chevR')}</button>
   <button class="listrow" data-act="sheet" data-arg="payA">${ic('card')}<div class="grow"><b>Payment method</b><small>${st.pay === 'gcash' ? 'GCash' : 'Cash'}</small></div>${ic('chevR')}</button>
   <button class="listrow" data-act="logout">${ic('logout')}<div class="grow"><b>Log out</b></div></button>
  </div></div>${oldTabs('a-account')}</div>${homeBar}`;

S['a-messages'] = () => `<div class="ohome">${statusBar()}<div class="ohead" style="height:110px"><span>Messages</span></div>
  <div class="scroll" style="padding:20px 16px"><div class="list">
   <button class="listrow" data-act="sheet" data-arg="chat"><img src="${A}clariso.png" alt="" style="width:44px;height:44px;border-radius:50%" /><div class="grow"><b>Clariso Perez</b><small>${esc(st.chat[st.chat.length - 1].t)}</small></div></button>
   <button class="listrow" data-act="toast" data-arg="Mang Juan support replies within 5 minutes"><div style="width:44px;height:44px;border-radius:50%;background:var(--mango);display:grid;place-items:center">${ic('wrench')}</div><div class="grow"><b>Mang Juan Support</b><small>How can we help you today?</small></div></button>
  </div></div>${oldTabs('a-messages')}</div>${homeBar}`;

const canopy = (title, sub, { compact = st.variant === 'v2', pill = true, backAct = 'back' } = {}) => compact
  ? `<header class="canopy compact"><div class="row"><button class="back" data-act="${backAct}" aria-label="Back">${ic('arrowL')}</button><h1>${title}</h1></div><p>${sub}</p></header>`
  : `<header class="canopy"><div class="row"><button class="back" data-act="${backAct}" aria-label="Back">${ic('arrowL')}</button>${pill ? `<span class="catpill">${ic('wrench')}${cat().name.toUpperCase()}</span>` : ''}</div><h1>${title}</h1><p>${sub}</p></header>`;

const payChips = () => `<div class="chiprow">
  <button class="paychip" data-act="sheet" data-arg="payA"><span class="lg" style="background:${st.pay === 'gcash' ? 'var(--gcash)' : '#1f7a4d'};color:#fff">${st.pay === 'gcash' ? 'GC' : '₱'}</span><span class="grow"><small>PAYMENT</small><b>${st.pay === 'gcash' ? 'GCash' : 'Cash'} (${peso(priceA())})</b></span>${ic('chevR')}</button>
  <button class="paychip" data-act="sheet" data-arg="voucher"><span class="lg" style="background:var(--mango)">${ic('tag')}</span><span class="grow"><small>VOUCHER</small><b>${st.voucher ? 'MANONG50 Applied' : 'Add voucher'}</b></span>${st.voucher ? ic('check') : ic('plus')}</button></div>`;

S['a-service'] = () => `${statusBar()}${canopy('Choose Your Service', 'Transparent Manong pricing with no surprise charges.')}
  <div class="scroll" style="margin-top:-12px;padding-top:12px"><div class="body">
    <div class="card"><button class="addr" data-act="sheet" data-arg="addressA"><span class="ic">${ic('badge')}</span><span class="grow"><b>${addrA().t}</b><small>${addrA().s}</small></span>${ic('pencil')}</button></div>
    ${Object.entries(TIERS_A).map(([k, t]) => `<button class="card tier ${st.tierA === k ? 'on' : ''}" data-act="tierA" data-arg="${k}" aria-pressed="${st.tierA === k}">
      <span class="aradio"></span><div class="t"><b>${t.name}</b><span class="dur">${ic('clock')}${t.dur}</span></div>
      <p>${t.desc.length > 60 ? t.desc.slice(0, 60) + '….' : t.desc}</p>
      ${t.badge ? `<span class="badge">${icFill('star')}${t.badge}</span>` : ''}
      <div class="price"><b>${peso(t.price)}${t.plus ? '+' : ''}</b>${t.unit}${t.foot ? `<small>${t.foot}</small>` : ''}</div></button>`).join('')}
    ${st.variant === 'v2' ? `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px"><b style="font-size:16px">Recent ${cat().name} Jobs Nearby</b><small style="color:#555">BGC &amp; Taguig</small></div>
      <div class="gallery">
        <button class="gcard" data-act="sheet" data-arg="job" data-arg2="0"><img src="${A}job1.png" alt="" /><span>Sink Trap Seal</span></button>
        <button class="gcard" data-act="sheet" data-arg="job" data-arg2="1"><img src="${A}job2.png" alt="" /><span>Faucet &amp; Bidet Line</span></button>
      </div>` : ''}
  </div></div>
  <div class="afoot">${payChips()}<button class="abtn" data-act="go" data-arg="a-details">Continue booking Manong ${ic('arrowR')}</button></div>${homeBar}`;

S['a-service-map'] = () => {
  const lv = [['quick', 'steth', 'Most Affordable'], ['standard', 'wrench', 'Most Popular']];
  return `${statusBar()}<div class="v3head"><button data-act="back" aria-label="Back">${ic('arrowL')}</button>Choose Your Service</div>
  <div style="position:absolute;top:100px;left:0;right:0;height:260px;background:url(${A}map.png) center/cover"></div>
  <div class="bsheet" style="max-height:none;top:320px;padding:10px 14px 34px;display:flex;flex-direction:column;gap:12px">
    <div class="grab" style="margin-bottom:0"></div>
    <div class="greybox"><button class="addr" data-act="sheet" data-arg="addressA" style="display:flex;gap:12px;align-items:center;width:100%;text-align:left">
      <span class="ic" style="width:36px;height:36px;border-radius:50%;background:var(--mango-soft);display:grid;place-items:center">${ic('badge')}</span>
      <span class="grow" style="flex:1;min-width:0"><small style="font-size:11px;font-weight:700;color:#555">SERVICE TARGET</small><b style="display:block;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${addrA().t}</b></span>${ic('pencil')}</button></div>
    <small style="color:#555">Choose Service Level</small>
    <div class="levels">${lv.map(([k, i, tag]) => {
      const t = TIERS_A[k];
      return `<button class="lvl ${st.tierA === k ? 'on' : ''}" data-act="tierA" data-arg="${k}"><span class="ic">${ic(i)}${st.tierA === k ? `<span style="position:absolute;right:-4px;bottom:-4px;width:18px;height:18px;border-radius:50%;background:#5a4300;color:#fff;display:grid;place-items:center">${ic('check')}</span>` : ''}</span>
      <span class="grow"><b>${t.name}</b> <span class="dur" style="display:inline-flex">${ic('clock')}${t.dur}</span><small>${t.desc}</small></span>
      <span class="pr"><b>${peso(t.price)}</b><small>${st.tierA === k ? tag : 'Fixed base'}</small></span></button>`;
    }).join('')}</div>
    <div style="margin-top:auto;display:flex;flex-direction:column;gap:10px">${payChips()}<button class="abtn" data-act="go" data-arg="a-details">Continue booking Manong ${ic('arrowR')}</button></div>
  </div>${homeBar}`;
};

S['a-details'] = () => `${statusBar()}${canopy(st.variant === 'v2' ? 'Tell Manong What Happened' : 'Tell Manong what happened', 'Quick details mean the right tools on the first trip!')}
  <div class="scroll" style="margin-top:-12px;padding-top:12px"><div class="body">
    <section class="card" id="descCard"><div class="sectitle"><span class="num">1</span>Problem Description</div>
      <textarea class="abox" rows="2" maxlength="300" data-model="descA" placeholder="e.g. kitchen pipe" aria-label="Problem description">${esc(st.descA)}</textarea>
      <div class="cnt"><span data-live="descACount"></span> / 300 characters</div>
      <div class="hint">${ic('touch')}Tap to add common symptoms:</div>
      <div class="achips">${SYMPTOMS_A.map((s) => `<button class="achip ${st.symptomsA.includes(s) ? 'on' : ''}" data-act="symA" data-arg="${s}" aria-pressed="${st.symptomsA.includes(s)}">${s}${st.symptomsA.includes(s) ? ic('check') : ''}</button>`).join('')}</div>
    </section>
    <section class="card"><div class="sectitle"><span class="num">2</span>Photos of the Issue<span class="tagpill">${st.photosA.length} / 3 Added</span></div>
      <p class="small">Add photos (optional, up to 3) to help the aide diagnose faster and bring spare couplings.</p>
      <div class="photos">${st.photosA.map((p, i) => `<div class="ptile"><img src="${p.src}" alt="" /><button class="rm" data-act="rmPhotoA" data-arg="${i}" aria-label="Remove photo">${ic('x')}</button><span class="lab">${esc(p.label)}</span></div>`).join('')}
        ${st.photosA.length < 3 ? `<button class="ptile" data-act="takePhoto" data-arg="A"><span class="disc">${ic('camera')}</span>Take Photo</button>` : ''}
        ${st.photosA.length < 2 ? `<label class="ptile" data-act="noop" style="cursor:pointer"><input type="file" accept="image/*" data-upload="A" hidden /><span class="disc g">${ic('image')}</span>Upload</label>` : ''}</div>
    </section>
    <section class="card"><div class="sectitle"><span class="num">3</span>Notes for Manong<span class="tagpill">Optional</span></div>
      ${st.variant === 'v2' ? '<p class="small">Add any special instructions to ensure a fast, smooth arrival and inspection.</p>' : ''}
      <textarea class="abox" rows="2" data-model="notesA" placeholder="e.g. bring a tall ladder" aria-label="Notes for Manong">${esc(st.notesA)}</textarea>
    </section>
  </div></div>
  <div class="afoot" style="background:transparent;box-shadow:none;padding-top:8px">
    <button class="abtn" data-act="confirmA">${ic('zap')}<span style="margin-left:10px">Confirm ${tA().short} Manong</span><span class="amt">${peso(priceA())}</span>${ic('arrowR')}</button>
    <p class="small center" style="margin:0">Need tools or ladder? Mang Juan arrives fully equipped.</p></div>${homeBar}`;

const mapPins = (state) => {
  const pins = state === 'found'
    ? [['bike', 70, 175], ['briefcase', 255, 215]]
    : [['bike', 62, 165], ['briefcase', 255, 205], ['wrench', 92, 360]];
  return `<div class="map">
    <div class="pulse" style="top:${state === 'found' ? 200 : 210}px"></div>
    ${pins.map(([i, x, y], n) => `<span class="pin" data-pin="${n}" style="left:${x}px;top:${y}px">${ic(i)}</span>`).join('')}
    <span class="maplabel" style="left:123px;top:${state === 'found' ? 256 : 266}px">${ic('building')}Avida Towers Taft</span>
    <span class="home-pin" style="left:168px;top:${state === 'found' ? 296 : 306}px"><span></span></span></div>`;
};

S['a-finding'] = () => `${statusBar()}${canopy('Finding Your Manong', 'Searching for available Manongs nearby...', { backAct: 'cancelFindA' })}
  ${mapPins('finding')}
  <div class="bsheet"><div class="grab"></div>
    <div style="display:flex;justify-content:space-between;align-items:center"><div><h2>Connecting to Manong <i></i></h2>
      <div style="color:#555;font-size:14px;margin-top:4px">${cat().pro} • ${tA().name}</div></div>
      <span class="etapill">${ic('hourglass')}~<span data-live="findSecs"></span>s</span></div>
    <div class="abar"><i data-live-w="findPct"></i></div>
    <div class="greybox" style="display:grid;gap:12px">
      <div class="lrow"><span class="ic">${ic('pin')}</span><div><b style="font-size:14px">${addrA().t.replace(', Tower 1', '')}</b><div style="font-size:12px;color:#555">${addrA().s}</div></div></div>
      <div class="lrow"><span style="color:var(--gcash)">${ic('shieldCheck')}</span><span style="flex:1;font-size:13px;color:#444">${st.pay === 'gcash' ? 'GCash Escrow Protection' : 'Pay cash after the job'}</span><span class="smallbtn" style="padding:2px 8px;font-size:11px">${st.pay === 'gcash' ? 'Safe Hold' : 'Cash'}</span></div>
    </div>
    <div class="protip" style="margin:12px 0">${ic('bulb')}<span><b>Mang Juan Pro-Tip:</b> Notify lobby security or prepare condo gate authorization so Manong can head straight up.</span></div>
    <button class="agrey" data-act="cancelFindA">${ic('x')}Cancel Request</button>
  </div>${homeBar}`;

S['a-found'] = () => `${statusBar()}${canopy(st.arrived ? 'Manong Has Arrived' : 'Live Manong Tracking', 'Real-time dispatch & GPS updates to your door.')}
  ${mapPins('found')}
  <div class="bsheet" style="max-height:480px"><div class="grab"></div>
    <div style="display:flex;justify-content:space-between;align-items:center"><div><h2>${st.arrived ? 'Manong is at your door' : 'Manong on the move'} <i></i></h2>
      <div style="color:#555;font-size:14px;margin-top:4px">${cat().pro} • ${tA().name}</div></div>
      <span class="etapill">${ic('clock')}<span data-live="etaA"></span></span></div>
    <div class="abar"><i data-live-w="etaPct"></i></div>
    <div class="greybox">
      <div class="lrow"><img src="${A}clariso.png" alt="" style="width:50px;height:50px;border-radius:50%" />
        <div style="flex:1"><div style="display:flex;gap:8px;align-items:center"><b style="font-size:17px">Clariso Perez</b><span class="verified">${ic('badge')}Verified Manong</span></div>
        <div style="font-size:12px;color:#555">${cat().pro} • 4.9★ (342 jobs)</div>
        <div style="font-size:12px;color:var(--gcash);display:flex;gap:4px;align-items:center">${ic('nav').replace('class="i ', 'class="i " style="width:12px;height:12px" ')}<span data-live="km"></span></div></div></div>
      <div class="twin"><button data-act="sheet" data-arg="chat">${ic('chat')}Chat Manong</button><button class="dark" data-act="call" data-arg="clariso">${ic('phone')}Call Manong</button></div>
      <div class="lrow" style="border-top:1px solid #e3e3e3;padding-top:12px"><span class="ic">${ic('idcard')}</span><div style="flex:1"><div style="font-size:11px;color:#555">Lobby Security Gate Pass</div><b style="letter-spacing:.04em">PIN: MJ-8821</b></div>
        <button class="smallbtn" data-act="sheet" data-arg="qr">${ic('qr')}Show QR</button></div>
    </div>
    <div class="greybox" style="margin:10px 0"><div class="lrow"><span class="ic">${ic('pin')}</span><div><b style="font-size:14px">${addrA().t.replace(', Tower 1', '')}</b><div style="font-size:12px;color:#555">${addrA().s}</div></div></div></div>
    ${st.arrived ? `<button class="abtn center" data-act="jobDoneA" style="margin-bottom:10px">Job done · View order summary ${ic('arrowR')}</button>` : ''}
    <button class="agrey" data-act="sheet" data-arg="cancelReportA">${ic('alert')}Cancel Request/ Report Issue</button>
  </div>${homeBar}`;

S['a-summary'] = () => {
  const t = tA();
  return `${statusBar()}<header class="ahead2"><button data-act="home" aria-label="Close">${ic('arrowL')}</button><div class="grow"><h1>${ic('receipt')}Order Summary</h1><p>Service Completed • Invoice &amp; Review</p></div></header>
  <div class="scroll"><div class="body">
    <div class="status-pill">${icFill('badge')}SERVICE COMPLETED • ${st.pay === 'gcash' ? 'GCASH PAID' : 'PAY IN CASH'}</div>
    <section class="card center" style="padding:20px">
      <img class="avbig" src="${A}clariso.png" alt="" />
      <div style="margin-top:10px;font-size:15px">Clariso Perez</div>
      <div style="font-size:14px;color:#555;margin:4px 0 14px">${cat().pro} • <span class="dur" style="display:inline-flex;font-size:13px">★ <b>4.9</b> (342 jobs)</span></div>
      <b style="font-size:15px">How was Manong Clariso's service?</b>
      <div class="stars" style="margin:12px 0 8px">${[1, 2, 3, 4, 5].map((n) => `<button class="${n <= st.stars ? 'on' : ''}" data-act="starA" data-arg="${n}" aria-label="${n} stars">${icFill('star')}</button>`).join('')}</div>
      <b style="color:#7a5a00;font-size:15px">${STAR_A[st.stars]}</b>
    </section>
    <section class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font-size:15px">${st.stars >= 4 ? 'What did he do well?' : 'What could be better?'}</b><small style="color:#555">Select all that apply</small></div>
      <div class="achips">${PRAISE_A.map(([e, l]) => `<button class="achip y ${st.praise.includes(l) ? 'on' : ''}" data-act="praiseA" data-arg="${l}">${e} ${l}</button>`).join('')}</div>
      <textarea class="abox" rows="3" data-model="review" placeholder="Tell us more about Manong Clariso's service (optional)." aria-label="Review">${esc(st.review)}</textarea>
    </section>
    <section class="card">
      <div style="display:flex;gap:8px;align-items:center"><span style="color:#7a5a00">${ic('gift')}</span><b style="font-size:17px">Pa-Tip kay Manong Clariso?</b></div>
      <p class="small" style="margin-top:4px">100% of your tip goes directly to your Manong's personal ${st.pay === 'gcash' ? 'GCash wallet' : 'pocket'}.</p>
      <div class="tips">${[0, 20, 50, 100].map((v) => `<button class="${!st.customTip && st.tip === v ? 'on' : ''}" data-act="tip" data-arg="${v}">${v === 50 ? '<span class="pop">POPULAR</span>' : ''}${v ? '+' + peso(v) : 'No Tip'}</button>`).join('')}</div>
      ${st.customTip ? `<input class="abox" type="number" min="0" max="5000" inputmode="numeric" data-model="tipCustom" value="${st.tip || ''}" placeholder="Enter tip amount" aria-label="Custom tip" style="margin:0 0 8px" />` : ''}
      <div class="small center">Tip will be charged to ${st.pay === 'gcash' ? 'GCash' : 'Cash'} <button data-act="customTip" style="color:var(--gcash);font-weight:600;margin-left:6px">${st.customTip ? 'Use presets' : 'Custom amount'}</button></div>
    </section>
    <section class="card">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px"><span style="width:36px;height:36px;border-radius:50%;background:#eee;display:grid;place-items:center">${ic('receipt')}</span>
        <div style="flex:1"><b>Payment Summary</b><div style="font-size:11px;color:#555">Booking ID: #MN-82049</div></div><b style="font-size:20px" data-live="totalA"></b></div>
      <div class="kv">
        <div><span>Service Performed</span><span>${t.name}</span></div>
        <div><span>Base price</span><span>${peso(t.price)}</span></div>
        ${st.voucher ? '<div><span>Voucher MANONG50</span><span>−₱50</span></div>' : ''}
        <div><span>Tip</span><span data-live="tipA"></span></div>
        <div><span>Duration</span><span>35 mins</span></div>
        <div><span>Location</span><span>${addrA().short}</span></div>
        <div><span>Payment Method</span><span class="blue">${st.pay === 'gcash' ? 'GCash (Paid Escrow)' : 'Cash on completion'}</span></div>
      </div>
      <button class="center" data-act="receipt" style="display:flex;gap:6px;align-items:center;justify-content:center;width:100%;margin-top:16px;color:#555">${ic('download')}Download Official E-Receipt</button>
    </section>
    <button class="abtn center" data-act="submitA">Submit Rating &amp; Done ${ic('arrowR')}</button>
    <button class="center" data-act="home" style="color:#555;padding:8px">Skip for now</button>
  </div></div>${homeBar}`;
};

S['a-thanks'] = () => `${statusBar()}<div class="scroll" style="display:flex;flex-direction:column;justify-content:center;padding:24px;text-align:center">
  <div class="donecircle">${ic('check')}</div>
  <h2 style="font-size:26px;margin:20px 0 6px">Salamat, Enzo!</h2>
  <p style="color:#555;margin:0 0 6px">You rated Clariso ${st.stars} star${st.stars > 1 ? 's' : ''}${st.tip ? ` and tipped ${peso(st.tip)}` : ''}.</p>
  <p style="color:#555;margin:0 0 28px">Receipt sent to enzo@email.com</p>
  <button class="abtn center" data-act="home">Back to Home</button></div>${homeBar}`;

// ==========================================================
// FLOW 2 · Redesign (Overhaul / Color)
// ==========================================================
const wordmark = () => `<img class="wordmark" src="${A}wordmark.png" alt="mang juan" />`;
const socialB = () => `<div class="social"><button class="btn white" data-act="social" data-arg="Google">${gLogo()}Google</button>
  <button class="btn white" data-act="social" data-arg="Facebook"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877f2" d="M14 22v-8h2.7l.4-3.2H14V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H8.2V14H11v8z"/></svg>Facebook</button></div>`;

S['b-welcome'] = () => `<div class="auth">${statusBar()}
  <div style="margin-top:150px">${wordmark()}<p class="tag">Book a Manong for repairs,<br />cleaning, locks and moving.</p></div>
  <div style="margin-top:auto">
    <button class="btn primary" data-act="go" data-arg="b-phone">${ic('phone').replace('class="i ', 'class="i " style="color:var(--mango)" ')}Continue with mobile number</button>
    <div class="or">or continue with</div>${socialB()}
    <div style="text-align:center;margin-top:16px;font-size:14px">Have an account? <button class="link" data-act="go" data-arg="b-login">Log in with email</button></div>
  </div></div>${homeBar}`;

S['b-login'] = () => `<div class="auth">${statusBar()}
  <div style="margin-top:96px">${wordmark()}<p class="tag" style="margin:8px 0 26px;font-size:15px">Log in to book your next repair.</p></div>
  <div id="loginForm"><div class="field"><label for="lid">Email or mobile number</label><div class="input"><input id="lid" data-model="loginId" value="${esc(st.loginId)}" placeholder="name@email.com" autocomplete="username" /></div></div>
  <div class="field"><label for="lpw">Password</label><div class="input"><input id="lpw" data-model="loginPw" type="${st.showPw ? 'text' : 'password'}" value="${esc(st.loginPw)}" placeholder="Password" autocomplete="current-password" />
    <button data-act="togglePw" aria-label="${st.showPw ? 'Hide' : 'Show'} password">${ic(st.showPw ? 'eye' : 'eyeOff')}</button></div></div></div>
  ${st.authErr ? `<p class="err">${st.authErr}</p>` : ''}
  <div style="text-align:right;margin:-4px 0 14px"><button class="link" data-act="sheet" data-arg="forgot">Forgot password?</button></div>
  <button class="btn primary" data-act="loginB">Log in</button>
  <div class="or">or continue with</div>${socialB()}
  <button class="btn outline-ink" style="margin-top:12px" data-act="go" data-arg="b-phone">Use mobile number instead</button>
  <div style="margin-top:auto;text-align:center;font-size:14px">New to Mang Juan? <button class="link" data-act="sheet" data-arg="signup">Sign up</button></div>
  </div>${homeBar}`;

S['b-phone'] = () => `<div class="auth">${statusBar()}
  <div style="margin-top:60px"><button class="round" data-act="back" aria-label="Back">${ic('chevL')}</button></div>
  <h2 style="font-size:26px;margin:28px 0 6px">What's your mobile number?</h2>
  <p class="tag" style="margin:0 0 24px;font-size:15px">We'll text you a 6-digit code to log in.</p>
  <div class="input soft" id="phoneField"><span class="pre">🇵🇭 +63</span><input data-model="phoneNum" inputmode="numeric" maxlength="10" value="${esc(st.phoneNum)}" placeholder="917 555 0142" aria-label="Mobile number" /></div>
  ${st.authErr ? `<p class="err" style="margin-top:10px">${st.authErr}</p>` : ''}
  <div style="margin-top:auto"><button class="btn primary" data-act="sendCode">Send code</button></div></div>${homeBar}`;

S['b-otp'] = () => `<div class="auth">${statusBar()}
  <div style="margin-top:60px"><button class="round" data-act="back" aria-label="Back">${ic('chevL')}</button></div>
  <h2 style="font-size:26px;margin:28px 0 6px">Enter the code</h2>
  <p class="tag" style="margin:0;font-size:15px">Sent to +63 ${esc(st.phoneNum || '917 555 0142')}. Any 6 digits work in this prototype.</p>
  <div class="otp" id="otpRow">${[0, 1, 2, 3, 4, 5].map((i) => `<input data-otp="${i}" inputmode="numeric" maxlength="1" value="${st.otp[i] || ''}" aria-label="Digit ${i + 1}" />`).join('')}</div>
  ${st.authErr ? `<p class="err">${st.authErr}</p>` : ''}
  <button class="link" data-act="resend" style="align-self:flex-start">Resend code</button>
  <div style="margin-top:auto"><button class="btn primary" data-act="verifyOtp">Verify and continue</button></div></div>${homeBar}`;

const tabbarB = (on) => `<nav class="tabbar">${[['b-home', 'home', 'Home'], ['b-bookings', 'calendar', 'Bookings'], ['b-profile', 'user', 'Profile']]
  .map(([s, i, l]) => `<button class="${on === s ? 'on' : ''}" data-act="tab" data-arg="${s}">${ic(i)}${l}</button>`).join('')}</nav>`;

const STAMP = { confirmed: 'Confirmed', accepted: 'Accepted', onway: 'On the way', inprogress: 'In progress', completed: 'Completed', paid: 'Paid', cancelled: 'Cancelled' };
const stamp = (s) => `<span class="stamp ${s === 'inprogress' ? 'onway' : s}">${STAMP[s]}</span>`;
const bkWhen = (b) => (b.mode === 'now' ? 'Today, arriving in about 25 min' : `${DAY_LONG[b.day]}, Oct ${b.day} at ${b.time}`);

S['b-home'] = () => {
  const b = bk();
  const unread = st.notifs.some((n) => n.unread);
  return `${statusBar()}<div class="scroll"><div class="homeband">
    <div class="top">${wordmark().replace('class="wordmark"', 'class="wordmark" style="height:36px"')}<button class="bell" data-act="sheet" data-arg="notifs" aria-label="Notifications">${ic('bell')}${unread ? '<span class="dot"></span>' : ''}</button></div>
    <button class="unit" data-act="sheet" data-arg="units">${ic('pin')}<span>${addrB().short}, Avida Towers Prime Taft</span>${ic('chevR')}</button>
    ${b ? `<button class="ticket hometicket" data-act="openBooking" style="--notch:var(--mango)">
      <div class="sec head"><div><div class="t" style="font-size:17px;font-weight:700">${CATS[b.cat].name}</div><div class="sub">${TIERS_B[b.tier].name}, ${esc(b.problem.toLowerCase())}</div></div>${stamp(b.status)}</div>
      <div class="tear"></div>
      <div class="sec who">${b.manong.img ? `<img class="av" src="${b.manong.img}" alt="" />` : `<span class="av ini">${b.manong.ini}</span>`}<div class="grow"><b>${b.manong.first} ${b.status === 'onway' ? 'is on the way' : b.status === 'inprogress' ? 'is working on it' : b.status === 'completed' ? 'finished the job' : 'is booked'}</b><small>${bkWhen(b)}</small></div>${ic('chevR')}</div>
    </button>` : '<div style="height:24px"></div>'}
  </div>
  <div class="pad" style="padding-top:${b ? 110 : 0}px">
    <h3 class="sect">What needs fixing?</h3>
    <div class="grid6">${Object.entries(CATS).map(([k, c]) => `<button class="tile" data-act="startB" data-arg="${k}" style="--tbg:${c.tone[0]};--tfg:${c.tone[1]};--tdisc:${c.tone[2]}"><span class="disc">${ic(c.icon)}</span>${c.name}</button>`).join('')}</div>
    <h3 class="sect" style="font-size:17px;margin:20px 0 10px">Book again</h3>
    <div class="card who" style="margin-bottom:20px"><span class="av ini">${JOHN.ini}</span><div class="grow"><b>${JOHN.name}</b><small>Plumbing on Oct 2</small></div><button class="pillbtn" data-act="bookAgain">Book</button></div>
  </div></div>${tabbarB('b-home')}`;
};

S['b-bookings'] = () => {
  const b = bk();
  return `${statusBar()}<div class="band" style="padding-bottom:8px"><h2 class="q" style="margin-top:8px">Bookings</h2></div>
  <div class="scroll pad" style="padding-top:10px">
    <div class="label" style="margin-top:0">Upcoming</div>
    ${b ? `<button class="listrow" data-act="openBooking"><span class="av ini" style="width:44px;height:44px;border-radius:50%;background:var(--mango-soft);display:grid;place-items:center">${ic(CATS[b.cat].icon)}</span><div class="grow"><b>${CATS[b.cat].name}, ${TIERS_B[b.tier].name.toLowerCase()}</b><small>${b.id} · ${bkWhen(b)}</small></div>${stamp(b.status)}</button>`
      : `<div class="empty">No upcoming bookings.<br /><button class="link" data-act="tab" data-arg="b-home">Book a Manong</button></div>`}
    <div class="label">Past</div>
    <div class="list">${st.past.map((p) => `<button class="listrow" data-act="toast" data-arg="Receipt ${p.id} · ${peso(p.total)} paid with GCash">${p.manong.img ? `<img class="av" src="${p.manong.img}" alt="" />` : `<span class="av ini">${p.manong.ini}</span>`}<div class="grow"><b>${CATS[p.cat].name}, ${TIERS_B[p.tier].name.toLowerCase()}</b><small>${p.id} · ${p.manong.name} · ${peso(p.total)}</small></div>${stamp('paid')}</button>`).join('')}</div>
  </div>${tabbarB('b-bookings')}`;
};

S['b-profile'] = () => `${statusBar()}<div class="band" style="padding-bottom:8px"><h2 class="q" style="margin-top:8px">Profile</h2></div>
  <div class="scroll pad" style="padding-top:10px"><div class="list">
    <div class="listrow"><span class="av ini">BW</span><div class="grow"><b>Bruce Wayne</b><small>+63 917 555 0142</small></div></div>
    <button class="listrow" data-act="sheet" data-arg="units">${ic('building')}<div class="grow"><b>My unit</b><small>${addrB().s}</small></div>${ic('chevR')}</button>
    <button class="listrow" data-act="sheet" data-arg="payB">${ic('card')}<div class="grow"><b>Default payment</b><small>${st.pay === 'gcash' ? 'GCash' : 'Cash'}</small></div>${ic('chevR')}</button>
    <button class="listrow" data-act="sheet" data-arg="notifs">${ic('bell')}<div class="grow"><b>Notifications</b><small>${st.notifs.filter((n) => n.unread).length} unread</small></div>${ic('chevR')}</button>
    <button class="listrow" data-act="logout" style="color:var(--destructive)">${ic('logout')}<div class="grow"><b>Log out</b></div></button>
  </div></div>${tabbarB('b-profile')}`;

const bkHead = (step, title = `Book ${cat().name.toLowerCase()}`, backAct = 'back') => `<div class="bkhead"><button class="round" data-act="${backAct}" aria-label="Back">${ic('chevL')}</button><span class="t">${title}</span>${step ? `<span class="s">Step ${step} of 4</span>` : ''}</div>
  ${step ? `<div class="progress">${[1, 2, 3, 4].map((n) => `<i class="${n <= step ? 'done' : ''}"></i>`).join('')}</div>` : ''}`;

const ticketB = (extra = {}) => `<div class="ticket" data-live-html="ticketB">${ticketBInner(extra)}</div>`;
function ticketBInner({ manong } = {}) {
  return `<div class="sec head"><span class="t">${cat().name}, ${tB().name.toLowerCase()}</span><span class="p">${peso(tB().price)}</span></div>
  <div class="tear"></div>
  <div class="sec rows"><div><span>Problem</span>${val(problemB())}</div><div><span>When</span>${val(whenB())}</div><div><span>Manong</span>${manong ? `<span class="${manong === 'Looking now' ? 'na' : 'v'}">${manong}</span>` : val(st.preferred ? st.preferred + ' (requested)' : '')}</div></div>`;
}

S['b-size'] = () => `${statusBar()}<div class="scroll"><div class="band">${bkHead(1)}<h2 class="q">How big is the job?</h2></div>
  <div class="pad" style="padding-top:${st.variant === 'color' ? 4 : 0}px">${Object.entries(TIERS_B).map(([k, t]) => `<button class="optrow ${st.tier === k ? 'on' : ''}" data-act="tierB" data-arg="${k}" role="radio" aria-checked="${st.tier === k}">
    <span class="radio"></span><span class="grow"><b>${t.name}</b><small>${t.desc}</small></span><span class="price"><b>${peso(t.price)}</b><small class="${k === 'standard' ? 'gold' : ''}">${t.meta}</small></span></button>`).join('')}
  </div></div>
  <div class="pad">${ticketB()}</div><div class="footer"><button class="btn primary" data-act="go" data-arg="b-problem">Continue</button></div>`;

S['b-problem'] = () => `${statusBar()}<div class="scroll"><div class="band" style="padding-bottom:0">${bkHead(2)}<h2 class="q" style="margin-bottom:16px">What's happening?</h2>
  <div class="boxwrap" id="descBox"><textarea class="box" rows="3" maxlength="300" data-model="desc" placeholder="Describe the problem, e.g. water dripping under the kitchen sink" aria-label="What's happening">${esc(st.desc)}</textarea><span class="count"><span data-live="descCount"></span> / 300</span></div></div>
  <div class="pad" style="padding-top:${st.variant === 'color' ? 18 : 0}px">
    <div class="label">Add a symptom</div>
    <div class="chips">${cat().symptoms.map((s) => `<button class="chip ${st.symptoms.includes(s) ? 'on' : ''}" data-act="symB" data-arg="${s}" aria-pressed="${st.symptoms.includes(s)}">${s}</button>`).join('')}</div>
    <div class="label" style="margin-top:14px">Photos <span style="font-weight:400;color:var(--slate)">Optional, up to 3</span></div>
    <div class="photos">${st.photos.map((p, i) => `<div class="ph"><img src="${p}" alt="Problem photo ${i + 1}" /><button class="rm" data-act="rmPhoto" data-arg="${i}" aria-label="Remove photo">${ic('x')}</button></div>`).join('')}
      ${st.photos.length < 3 ? `<button class="addph" data-act="sheet" data-arg="addPhoto">${ic('camera')}Add</button>` : ''}</div>
    <div style="height:14px"></div>
  </div></div>
  <div class="pad">${ticketB()}</div><div class="footer"><button class="btn primary" data-act="toSchedule">Continue</button></div>`;

S['b-schedule'] = () => `${statusBar()}<div class="scroll"><div class="band" style="padding-bottom:0">${bkHead(3)}<h2 class="q" style="margin-bottom:16px">When do you need Manong?</h2>
  <div class="segm" role="tablist"><button class="${st.when === 'now' ? 'on' : ''}" data-act="when" data-arg="now" role="tab"><b>Now</b><small>Arrives in about 30 min</small></button><button class="${st.when === 'schedule' ? 'on' : ''}" data-act="when" data-arg="schedule" role="tab"><b>Schedule</b><small>Pick a day and time</small></button></div></div>
  <div class="pad" style="padding-top:${st.variant === 'color' ? 6 : 0}px">
  ${st.when === 'schedule' ? `<div class="label">Day</div><div class="days">${DAYS.map(([d, n]) => `<button class="day ${st.day === n ? 'on' : ''}" data-act="day" data-arg="${n}"><small>${d}</small><b>${n}</b></button>`).join('')}</div>
    <div class="label">Time</div><div class="times">${TIMES.map((t) => {
      const off = t === FULL_TIME;
      return `<button class="slot ${st.time === t ? 'on' : ''} ${off ? 'off' : ''}" data-act="${off ? 'fullSlot' : 'time'}" data-arg="${t}" ${off ? 'aria-disabled="true"' : ''}>${t}</button>`;
    }).join('')}</div>
    <div class="hintline">${ic('info')}1:00 PM is fully booked for ${cat().name.toLowerCase()}.</div>`
    : `<div class="note" style="margin-top:18px">${ic('zap')}<span>We'll send the nearest free ${cat().pro.toLowerCase()}. Free to cancel until Manong starts the job.</span></div>`}
  <div style="height:14px"></div></div></div>
  <div class="pad">${ticketB()}</div><div class="footer"><button class="btn primary" data-act="findB">Find my Manong</button></div>`;

S['b-finding'] = () => `${statusBar()}<div class="band">${bkHead(0)}<h2 class="q">Finding your Manong</h2>
  <p class="qs">${st.when === 'now' ? 'Pinging Manongs near Tower 1…' : `Checking who's free ${whenB()}…`}</p>
  <div class="bar" style="margin-top:28px"><i data-live-w="findPct"></i></div></div>
  <div class="pad" style="margin-top:14px">${ticketB({ manong: 'Looking now' })}</div>
  <div class="footer" style="margin-top:auto"><button class="btn secondary" data-act="sheet" data-arg="cancelFindB">Cancel request</button></div>`;

S['b-none'] = () => {
  const open = TIMES.filter((t) => t !== FULL_TIME && t !== st.noneFrom);
  return `${statusBar()}<div class="band">${bkHead(0)}<h2 class="q">No Manong is free at ${st.noneFrom}</h2>
  <p class="qs">Every ${cat().who} near Tower 1 is booked then. Pick another time on ${DAY_LONG[st.day]}, Oct ${st.day}, or book for now.</p></div>
  <div class="pad"><div class="label" style="margin-top:${st.variant === 'color' ? 4 : 0}px">Open times on ${DAY_LONG[st.day]}, Oct ${st.day}</div>
    <div class="times">${open.map((t) => `<button class="slot ${st.time === t ? 'on' : ''}" data-act="time" data-arg="${t}">${t}</button>`).join('')}</div>
    <button class="link" style="margin-top:16px" data-act="bookNowInstead">Book for now instead</button></div>
  <div class="footer" style="margin-top:auto"><button class="btn primary" data-act="rebookTime" ${open.includes(st.time) ? '' : 'disabled'}>${open.includes(st.time) ? `Book ${st.time} instead` : 'Pick an open time'}</button>
    <button class="btn secondary" data-act="back">Go Back</button></div>`;
};

S['b-review'] = () => `${statusBar()}<div class="scroll"><div class="band">${bkHead(4)}<h2 class="q">Review and confirm</h2></div>
  <div class="pad" style="display:grid;gap:12px">
    <div class="card who" style="padding:14px 16px"><span class="av ini" style="width:56px;height:56px">${foundManong().ini}</span>
      <div class="grow"><b style="display:flex;gap:6px;align-items:center">${foundManong().name} <span style="color:var(--gcash)">${ic('shieldCheck').replace('class="i ', 'class="i " style="width:18px;height:18px" ')}</span></b><small>${foundManong().skills}</small>
      <div style="font-size:13px;display:flex;gap:4px;align-items:center"><span style="color:#fdbb16">${icFill('star').replace('class="i fill"', 'class="i fill" style="width:16px;height:16px"')}</span><b style="display:inline;font-size:13px">${foundManong().rating}</b> <span style="color:var(--slate)">from ${foundManong().jobs} jobs</span></div></div>
      <button class="link" data-act="sheet" data-arg="manongProfile">View</button></div>
    <div class="ticket"><div class="sec rows big">
      <div><span>Service</span><span class="v">${cat().name}, ${tB().name.toLowerCase()}</span></div>
      <div><span>Problem</span>${val(problemB())}</div><div><span>When</span>${val(whenB())}</div>
      <div><span>Where</span><span class="v">${addrB().short}</span></div></div>
      <div class="tear"></div>
      <div class="sec rows big"><div><span>Base charge</span><span class="v">${peso(tB().price)}</span></div>
      <div><span>Materials</span><span class="v">Added after, if needed</span></div>
      <div style="align-items:center"><span>Estimate</span><span class="v" style="font-size:20px;font-weight:800">${peso(tB().price)}</span></div></div></div>
    <div class="label" style="margin:6px 0 0">Pay after the job with</div>
    <div class="paybtns"><button class="${st.pay === 'gcash' ? 'on' : ''}" data-act="payB" data-arg="gcash"><span class="gc">G</span>GCash</button><button class="${st.pay === 'cash' ? 'on' : ''}" data-act="payB" data-arg="cash">${ic('cash')}Cash</button></div>
    <div class="hintline" style="margin-top:0">${ic('info')}Free to cancel until Manong starts the job.</div>
  </div></div>
  <div class="footer"><button class="btn primary" data-act="confirmB">Confirm booking</button></div>`;

const timeline = (b) => {
  const now = b.mode === 'now';
  const m = b.manong.first;
  const order = ['accepted', 'onway', 'inprogress', 'completed'];
  const idx = b.status === 'confirmed' ? 0 : order.indexOf(b.status);
  const steps = [
    [now ? 'Requested' : 'Pending confirmation', now ? 'Today, 2:03 PM' : 'Oct 20, 4:12 PM'],
    [now ? 'Accepted' : 'Confirmed', now ? `${m} accepted at 2:05 PM` : `${m} confirmed at 4:15 PM`],
    ['In progress', b.status === 'onway' ? `${m} is on the way` : now ? `When ${m} starts the job` : `Starts ${DAY_LONG[b.day]} at ${b.time}`],
    ['Completed', 'You review charges and pay'],
  ];
  const doneTo = idx >= 2 ? 3 : 2; // steps marked done
  return `<div class="tl">${steps.map(([t, s], i) => {
    const done = i < doneTo || (b.status === 'completed' && i === 3);
    const cur = (i === doneTo - 1 && b.status !== 'completed') || (b.status === 'completed' && i === 3);
    return `<div class="step ${done ? 'done' : ''}"><span class="node">${done ? ic('check') : ''}</span><div><b>${t}</b><small>${s}</small>${cur ? `<span class="cur">Current status${now && i === 1 ? ', arriving in about 25 min' : ''}</span>` : ''}</div></div>`;
  }).join('')}</div>`;
};

const statusScreen = (onDemand) => {
  const b = bk();
  if (!b) return `${statusBar()}<div class="band">${bkHead(0, 'Booking')}</div><div class="empty">This booking was cancelled.<br /><button class="link" data-act="home">Back to home</button></div>`;
  return `${statusBar()}<div class="band" style="padding-bottom:${st.variant === 'color' ? 14 : 6}px">${bkHead(0, `Booking ${b.id}`, 'home')}</div>
  <div class="scroll pad" style="padding-top:10px;${st.variant === 'color' ? 'margin-top:-34px;position:relative;z-index:1' : ''}">
    <div class="ticket"><div class="sec head" style="padding-top:18px"><div><div style="font-size:18px;font-weight:700">${CATS[b.cat].name}, ${TIERS_B[b.tier].name.toLowerCase()}</div>
      <div style="font-size:15px;font-weight:600;margin-top:2px">${onDemand ? '' : `${DAY_LONG[b.day]}, Oct ${b.day} at ${b.time}`}</div><div style="font-size:13px;color:var(--slate)">${onDemand ? 'Requested now, ' : ''}${ADDRESSES[b.addr].short}</div></div>${stamp(b.status)}</div>
      <div class="tear"></div><div class="sec">${timeline(b)}</div><div class="tear"></div>
      <div class="sec who">${b.manong.img ? `<img class="av" src="${b.manong.img}" alt="" />` : `<span class="av ini">${b.manong.ini}</span>`}<div class="grow"><b>${b.manong.name}</b><small>Your Manong</small></div>
        <button class="callbtn" data-act="call" data-arg="${b.manong.first.toLowerCase()}" aria-label="Call ${b.manong.first}">${ic('phone')}</button></div></div>
    <button class="btn secondary" style="margin-top:14px" data-act="trackLive">${ic('pin')}See ${b.manong.first} on the way</button>
  </div>
  <div class="pad" style="padding-bottom:6px"><b style="font-size:15px">Plans changed?</b><p style="color:var(--slate);font-size:13px;margin:4px 0 0">You can cancel for free until ${b.manong.first} starts the job.</p></div>
  <div class="footer"><button class="btn danger" data-act="sheet" data-arg="cancelBooking" ${b.status === 'inprogress' ? 'disabled style="opacity:.5"' : ''}>Cancel booking</button></div>`;
};
S['b-status'] = () => statusScreen(false);
S['b-ondemand'] = () => statusScreen(true);

S['b-live'] = () => {
  const b = bk() || st.booking;
  const m = b ? b.manong : JOHN;
  const t = Math.max(st.liveEta, 0);
  const prog = 1 - t / 18;
  const x = 190 + (300 - 190) * prog;
  const y = 355 - (355 - 150) * prog;
  return `${statusBar()}<div class="mapfull" style="bottom:280px">
    <svg width="375" height="532" style="position:absolute;inset:0"><path d="M300 150 C 285 200, 270 220, 250 260 S 210 330, 190 355" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="${prog > 0 ? '' : ''}"/></svg>
    <span style="position:absolute;left:283px;top:130px;width:36px;height:36px;border-radius:50%;background:#111;color:var(--mango);display:grid;place-items:center">${ic('home')}</span>
    <span class="mappill" style="left:268px;top:172px;padding:4px 10px">Tower 1</span>
    <span style="position:absolute;left:${x - 26}px;top:${y - 26}px;width:52px;height:52px;border-radius:50%;border:3px solid #f0a500;box-shadow:0 0 0 10px rgba(255,199,44,.35);overflow:hidden;transition:all 1s linear">${m.img ? `<img src="${m.img}" alt="" style="width:100%;height:100%;object-fit:cover" />` : `<span style="display:grid;place-items:center;height:100%;background:var(--mango-soft);font-weight:700">${m.ini}</span>`}</span>
    <span class="mappill" style="left:262px;top:262px;background:${st.variant === 'color' ? 'var(--mango)' : '#111'};color:${st.variant === 'color' ? 'var(--cocoa)' : '#fff'}">${ic('clock')}${t > 0 ? t + ' min' : 'Here'}</span>
  </div>
  <button class="floatbtn" style="left:24px;top:56px" data-act="back" aria-label="Back">${ic('chevL')}</button>
  <span class="mappill" style="right:24px;top:58px"><span class="live"></span>Live location</span>
  <button class="floatbtn" style="right:24px;top:410px" data-act="toast" data-arg="Centered on Tower 1" aria-label="Center map">${ic('locate')}</button>
  <div class="mapsheet"><div class="grab" style="width:40px;height:5px;border-radius:3px;background:rgba(0,0,0,.15);margin:0 auto"></div>
    <h2>${t > 0 ? `${m.first} is on the way` : `${m.first} has arrived`}</h2>
    <p style="margin:0 0 14px;color:${st.variant === 'color' ? 'var(--gold-text)' : 'var(--slate)'};font-size:14px">${t > 0 ? `Arrives in about ${t} min, ${(t / 3).toFixed(1)} km away` : 'Meet him at the Tower 1 lobby'}</p>
    <div class="ticket"><div class="sec head"><div><div style="font-size:16px;font-weight:600">${CATS[b.cat].name}, ${TIERS_B[b.tier].name.toLowerCase()}</div><div style="font-size:13px;color:var(--slate)">${ADDRESSES[b.addr].short}, ${b.id}</div></div>${stamp(t > 0 ? 'confirmed' : 'inprogress')}</div>
      <div class="tear"></div><div class="sec who">${m.img ? `<img class="av" src="${m.img}" alt="" />` : `<span class="av ini">${m.ini}</span>`}<div class="grow"><b>${m.name}</b><small>${m.vehicle}</small></div>
      <button class="callbtn" data-act="call" data-arg="${m.first.toLowerCase()}" aria-label="Call">${ic('phone')}</button></div></div>
    ${t <= 0 ? '<button class="btn primary" style="margin-top:12px" data-act="jobDoneB">Job done, review charges</button>' : ''}
  </div>`;
};

S['b-charges'] = () => {
  const b = bk();
  const mats = bkMaterials();
  return `${statusBar()}<div class="scroll"><div class="band">${bkHead(0, `Booking ${b.id}`)}<h2 class="q" style="margin-top:22px">${b.manong.first} finished the job</h2><p class="qs">Check the charges before you pay.</p></div>
  <div class="pad"><div class="ticket"><div class="sec head" style="padding-top:18px"><span class="t" style="font-size:16px">${TIERS_B[b.tier].name}</span>${stamp('completed')}</div>
    <div class="sec rows" style="padding-top:0"><div><span>Base charge</span><span class="v">${peso(bkBase())}</span></div></div>
    <div class="tear"></div>
    <div class="sec rows"><div><span class="v" style="font-weight:600">Materials added <span style="color:var(--slate);font-weight:400">${mats.length} item${mats.length > 1 ? 's' : ''}</span></span><span></span></div>
      ${mats.map(([n, p]) => `<div><span>${n}</span><span class="v">${peso(p)}</span></div>`).join('')}</div>
    <div class="tear"></div>
    <div class="sec"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px">Total</b><b style="font-size:26px">${peso(bkTotal())}</b></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:14px"><span style="display:flex;gap:8px;align-items:center;color:var(--slate)">${st.pay === 'gcash' ? '<span class="gc">G</span>Paying with GCash' : ic('cash') + 'Paying with cash'}</span><button class="link" data-act="payToggle">Change</button></div></div></div>
    <div class="note" style="margin-top:12px">${ic('info')}<span>Ask ${b.manong.first} about any charge you don't recognize. Paying closes ticket ${b.id}.</span></div>
  </div></div>
  <div class="footer"><button class="btn primary" data-act="payNow">${st.pay === 'gcash' ? `Pay ${peso(bkTotal())} with GCash` : `I paid ${peso(bkTotal())} in cash`}</button>
    <button class="link" data-act="sheet" data-arg="report">Report a problem</button></div>`;
};

S['b-rate'] = () => {
  const b = bk();
  return `${statusBar()}<div class="scroll"><div class="band" style="padding-top:56px;padding-bottom:6px">
    <div class="ticket" style="--notch:${st.variant === 'color' ? 'var(--mango)' : 'var(--paper)'}"><div class="sec head" style="align-items:center"><span class="t">${CATS[b.cat].name}, ${TIERS_B[b.tier].name.toLowerCase()}</span>${stamp('paid')}</div><div class="tear"></div>
      <div class="sec" style="font-size:13px;color:var(--slate)">${peso(bkTotal())} with ${st.pay === 'gcash' ? 'GCash' : 'cash'}, receipt emailed</div></div></div>
  <div class="pad" style="padding-top:12px">
    ${b.manong.img ? `<img class="av" style="width:56px;height:56px" src="${b.manong.img}" alt="" />` : `<span class="av ini" style="width:56px;height:56px">${b.manong.ini}</span>`}
    <h2 class="q" style="margin-top:12px">How did ${b.manong.first} do?</h2><p class="qs">Your rating helps other residents in Tower 1.</p>
    <div class="stars" style="margin:18px 0 6px">${[1, 2, 3, 4, 5].map((n) => `<button class="${n <= st.starsB ? 'on' : ''}" data-act="starB" data-arg="${n}" aria-label="${n} stars">${ic('star')}</button>`).join('')}</div>
    <b style="color:var(--gold);font-size:15px">${STAR_B[st.starsB] || 'Tap a star'}</b>
    <div class="label">${st.starsB >= 4 || !st.starsB ? 'What went well?' : 'What could be better?'}</div>
    <div class="chips">${PRAISE_B.map((p) => `<button class="chip ${st.praiseB.includes(p) ? 'on' : ''}" data-act="praiseB" data-arg="${p}">${p}</button>`).join('')}</div>
    <textarea class="box" rows="3" style="margin-top:14px" data-model="review" placeholder="Add a note for ${b.manong.first} (optional)" aria-label="Note">${esc(st.review)}</textarea>
  </div></div>
  <div class="footer"><button class="btn primary" data-act="submitB" ${st.starsB ? '' : 'disabled'}>Submit rating</button><button class="link" data-act="skipRate">Skip for now</button></div>`;
};

S['b-thanks'] = () => `${statusBar()}<div class="band"></div><div class="pad" style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center">
  <div class="donecircle">${ic('check')}</div><h2 class="q" style="margin-top:20px">Thanks, Bruce!</h2>
  <p class="qs">Your ${st.starsB}-star rating was sent. Ticket closed and receipt emailed.</p></div>
  <div class="footer"><button class="btn primary" data-act="home">Back to home</button><button class="link" data-act="startB" data-arg="plumbing">Book another job</button></div>`;

// ---------- sheets ----------
const SHEETS = {
  signup: () => `<h3>Create your account</h3><p class="sub">Takes 30 seconds. We'll verify your unit later.</p>
    <div class="stack"><input class="sheetin" placeholder="Full name" aria-label="Full name" /><input class="sheetin" placeholder="Email or mobile" aria-label="Email" /><input class="sheetin" type="password" placeholder="Password" aria-label="Password" />
    <button class="btn primary" data-act="createAccount">Create account</button><button class="btn secondary" data-act="closeSheet">Cancel</button></div>`,
  phoneLogin: () => `<h3>Log in with mobile</h3><p class="sub">We'll text a one-time code.</p><div class="stack"><input class="sheetin" inputmode="numeric" placeholder="+63 917 555 0142" aria-label="Mobile" />
    <button class="btn primary" data-act="createAccount" data-arg="Code verified">Send code &amp; log in</button></div>`,
  forgot: () => `<h3>Reset your password</h3><p class="sub">We'll email you a link to set a new one.</p><div class="stack"><input class="sheetin" type="email" placeholder="name@email.com" value="${esc(st.loginId)}" aria-label="Email" />
    <button class="btn primary" data-act="closeSheet" data-arg="Reset link sent. Check your inbox.">Send reset link</button></div>`,
  addressA: () => `<h3>Service address</h3><p class="sub">Where should Manong go?</p><div class="opts">${ADDRESSES.map((a, i) => `<button class="opt ${st.addrA === i ? 'on' : ''}" data-act="pickAddrA" data-arg="${i}">${ic('building')}<span class="grow"><b>${a.t}</b><small>${a.s}</small></span>${st.addrA === i ? ic('check') : ''}</button>`).join('')}
    <button class="opt" data-act="closeSheet" data-arg="Add address is not in this prototype">${ic('plus')}<span class="grow"><b>Add new address</b></span></button></div>`,
  units: () => `<h3>Your unit</h3><div class="opts">${ADDRESSES.map((a, i) => `<button class="opt ${st.addr === i ? 'on' : ''}" data-act="pickAddrB" data-arg="${i}">${ic('building')}<span class="grow"><b>${a.short}</b><small>${a.t}</small></span>${st.addr === i ? ic('check') : ''}</button>`).join('')}</div>`,
  payA: () => `<h3>Payment method</h3><p class="sub">You're only charged after Manong finishes.</p><div class="opts">
    <button class="opt ${st.pay === 'gcash' ? 'on' : ''}" data-act="pickPay" data-arg="gcash"><span class="gc">G</span><span class="grow"><b>GCash</b><small>Held in escrow until the job is done</small></span>${st.pay === 'gcash' ? ic('check') : ''}</button>
    <button class="opt ${st.pay === 'cash' ? 'on' : ''}" data-act="pickPay" data-arg="cash">${ic('cash')}<span class="grow"><b>Cash</b><small>Pay Manong directly</small></span>${st.pay === 'cash' ? ic('check') : ''}</button></div>`,
  payB: () => SHEETS.payA(),
  voucher: () => `<h3>Vouchers</h3><div class="opts">
    <button class="opt ${st.voucher ? 'on' : ''}" data-act="pickVoucher" data-arg="1">${ic('tag')}<span class="grow"><b>MANONG50</b><small>₱50 off any service · until Oct 31</small></span>${st.voucher ? ic('check') : ''}</button>
    <button class="opt ${!st.voucher ? 'on' : ''}" data-act="pickVoucher" data-arg="0">${ic('x')}<span class="grow"><b>No voucher</b></span></button></div>`,
  job: (s) => {
    const j = [['job1.png', 'Sink Trap Seal', 'Done by Clariso P. · BGC, 2 days ago · ₱450'], ['job2.png', 'Faucet & Bidet Line', 'Done by Rommel D. · Taguig, last week · ₱650']][s.arg2 || 0];
    return `<img src="${A}${j[0]}" alt="" style="width:100%;border-radius:14px;aspect-ratio:16/9;object-fit:cover" /><h3 style="margin-top:12px">${esc(j[1])}</h3><p class="sub">${j[2]}</p><button class="btn primary" data-act="closeSheet">Close</button>`;
  },
  chat: () => `<h3 style="display:flex;gap:10px;align-items:center"><img src="${A}clariso.png" alt="" style="width:36px;height:36px;border-radius:50%" />Clariso Perez</h3>
    <div class="chat" id="chatLog">${st.chat.map((m) => `<div class="bubble ${m.me ? 'me' : 'them'}">${esc(m.t)}</div>`).join('')}</div>
    <div class="chips" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${['I’m at the lobby', 'Please call when you arrive', 'Gate pass is ready'].map((q) => `<button class="chip-q" data-act="sendChat" data-arg="${q}" style="border:1.5px solid var(--line);border-radius:999px;padding:6px 12px;font-size:13px">${q}</button>`).join('')}</div>
    <form class="chatbar" data-form="chat"><input name="m" placeholder="Message Clariso" aria-label="Message" autocomplete="off" /><button type="submit" aria-label="Send">${ic('send')}</button></form>`,
  qr: () => `<h3 style="text-align:center">Lobby gate pass</h3><p class="sub" style="text-align:center">Show this to Tower 1 security.</p>
    <div class="qr">${qrCells()}</div><p style="text-align:center;font-weight:800;letter-spacing:.08em;font-size:20px;margin:0 0 16px">PIN: MJ-8821</p>
    <button class="btn primary" data-act="closeSheet">Done</button>`,
  cancelReportA: () => `<h3>Need to stop or report?</h3><div class="opts">
    <button class="opt" data-act="confirmCancelA">${ic('x')}<span class="grow"><b>Cancel request</b><small>Free before Manong starts. GCash hold is released.</small></span></button>
    <button class="opt" data-act="sheet" data-arg="report">${ic('alert')}<span class="grow"><b>Report an issue</b><small>Late, unsafe, or wrong Manong</small></span></button></div>
    <button class="btn secondary" data-act="closeSheet">Keep booking</button>`,
  cancelFindA: () => `<h3>Cancel this request?</h3><p class="sub">We'll stop looking and release your GCash hold. You'll go back to choosing a service.</p>
    <div class="stack"><button class="btn danger" data-act="confirmCancelA">Yes, cancel request</button><button class="btn primary" data-act="resumeFind">Keep looking</button></div>`,
  cancelFindB: () => `<h3>Cancel this request?</h3><p class="sub">We'll stop looking. Your answers stay saved so you can try again.</p>
    <div class="stack"><button class="btn danger" data-act="confirmCancelFindB">Yes, cancel request</button><button class="btn primary" data-act="resumeFind">Keep looking</button></div>`,
  cancelBooking: () => `<h3>Cancel booking ${bk()?.id}?</h3><p class="sub">It's free until ${bk()?.manong.first} starts the job. Tell us why (optional):</p>
    <div class="opts">${['Plans changed', 'Fixed it myself', 'Booked the wrong time', 'Other'].map((r, i) => `<button class="opt ${st.sheet.reason === i ? 'on' : ''}" data-act="cancelReason" data-arg="${i}"><span class="grow"><b>${r}</b></span>${st.sheet.reason === i ? ic('check') : ''}</button>`).join('')}</div>
    <div class="stack"><button class="btn danger" data-act="confirmCancelB">Cancel booking</button><button class="btn primary" data-act="closeSheet">Keep booking</button></div>`,
  report: () => `<h3>Report a problem</h3><p class="sub">Our team replies within 15 minutes.</p>
    <div class="opts">${['Charge I don’t recognize', 'Job not finished', 'Damage in my unit', 'Manong was late', 'Something else'].map((r, i) => `<button class="opt ${st.sheet.reason === i ? 'on' : ''}" data-act="reportReason" data-arg="${i}"><span class="grow"><b>${r}</b></span>${st.sheet.reason === i ? ic('check') : ''}</button>`).join('')}</div>
    <textarea class="sheetin" rows="3" placeholder="Tell us what happened" aria-label="Details" style="width:100%;margin-bottom:12px"></textarea>
    <button class="btn primary" data-act="closeSheet" data-arg="Report sent. We'll message you shortly.">Send report</button>`,
  addPhoto: () => `<h3>Add a photo</h3><div class="opts">
    <button class="opt" data-act="takePhoto" data-arg="B">${ic('camera')}<span class="grow"><b>Take photo</b><small>Uses a sample photo in this prototype</small></span></button>
    <label class="opt" style="cursor:pointer">${ic('image')}<span class="grow"><b>Choose from gallery</b><small>Pick a real image from your device</small></span><input type="file" accept="image/*" data-upload="B" hidden /></label></div>`,
  notifs: () => `<h3>Notifications</h3><div class="opts">${st.notifs.map((n, i) => `<button class="opt" data-act="readNotif" data-arg="${i}">${n.unread ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--unread)"></span>' : '<span style="width:8px"></span>'}<span class="grow"><b>${n.t}</b><small>${n.s}</small></span></button>`).join('')}</div>
    <button class="btn secondary" data-act="readAll">Mark all as read</button>`,
  manongProfile: () => `<div style="text-align:center"><span style="width:84px;height:84px;border-radius:50%;background:var(--mango-soft);color:var(--cocoa);display:inline-grid;place-items:center;font-size:28px;font-weight:800">${foundManong().ini}</span><h3 style="margin-top:10px">${foundManong().name}</h3>
    <p class="sub">${foundManong().skills} · ${foundManong().rating}★ from ${foundManong().jobs} jobs · Verified by Mang Juan</p></div>
    <div class="chips" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:16px">${['On time', 'Clean work', 'Explained the fix'].map((c) => `<span style="background:var(--cloud);border-radius:999px;padding:6px 12px;font-size:13px">${c}</span>`).join('')}</div>
    <button class="btn primary" data-act="closeSheet">Close</button>`,
  paying: () => `<div class="spin"></div><h3 style="text-align:center">Paying with GCash…</h3><p class="sub" style="text-align:center">Releasing ${peso(bkTotal())} from escrow to ${bk().manong.first}.</p>`,
};
function qrCells() {
  let h = '';
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      const finder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
      const ring = finder && (r % 14 === 0 || r % 14 === 6 || c % 14 === 0 || c % 14 === 6 || ((r % 14 > 1 && r % 14 < 5) && (c % 14 > 1 && c % 14 < 5)));
      const b = finder ? ring : (r * 7 + c * 13 + r * c) % 3 === 0;
      h += `<i class="${b ? 'b' : ''}"></i>`;
    }
  }
  return h;
}

// ---------- live values (updated without re-render, so inputs keep focus) ----------
const LIVE = {
  descACount: () => st.descA.length,
  descCount: () => st.desc.length,
  findSecs: () => st.findSecs,
  findPct: () => st.findPct + '%',
  etaA: () => (st.arrived ? 'Arrived' : `~ ${st.eta} mins`),
  etaPct: () => (st.arrived ? 100 : Math.round(60 + (10 - st.eta) * 4)) + '%',
  km: () => (st.arrived ? 'At your building' : `${st.km.toFixed(1)} km away from you`),
  totalA: () => peso(totalA()) + '.00',
  tipA: () => (st.tip ? peso(st.tip) : '₱0'),
};
function live() {
  phone.querySelectorAll('[data-live]').forEach((el) => (el.textContent = LIVE[el.dataset.live]()));
  phone.querySelectorAll('[data-live-w]').forEach((el) => (el.style.width = LIVE[el.dataset.liveW]()));
  phone.querySelectorAll('[data-live-html="ticketB"]').forEach((el) => {
    const manong = st.screen === 'b-finding' ? { manong: 'Looking now' } : {};
    el.innerHTML = ticketBInner(manong);
  });
}

// ---------- per-screen timers ----------
const AFTER = {
  'a-finding': () => {
    st.findPct = 5;
    st.findSecs = 38;
    every(400, () => {
      st.findPct = Math.min(100, st.findPct + 7);
      st.findSecs = Math.max(0, st.findSecs - 3);
      const pins = phone.querySelectorAll('.pin');
      pins.forEach((p, i) => {
        p.style.left = 140 + Math.sin(Date.now() / 900 + i * 2) * 90 + 'px';
        p.style.top = 230 + Math.cos(Date.now() / 900 + i * 2) * 70 + 'px';
      });
      live();
      if (st.findPct >= 100) {
        clearTimers();
        st.eta = 10;
        st.km = 1.4;
        st.arrived = false;
        go('a-found', { replace: true });
        toast('Clariso accepted your request');
      }
    });
  },
  'a-found': () => {
    if (st.arrived) return;
    every(1500, () => {
      st.eta = Math.max(0, st.eta - 1);
      st.km = Math.max(0, st.km - 0.14);
      const bike = phone.querySelector('[data-pin="0"]');
      if (bike) {
        bike.style.left = 70 + (10 - st.eta) * 9.5 + 'px';
        bike.style.top = 175 + (10 - st.eta) * 12 + 'px';
      }
      live();
      if (st.eta === 0) {
        clearTimers();
        st.arrived = true;
        render();
        toast('Clariso has arrived at Tower 1');
      }
    });
  },
  'b-finding': () => {
    st.findPct = 6;
    every(350, () => {
      st.findPct = Math.min(100, st.findPct + 8);
      live();
      if (st.findPct >= 100) {
        clearTimers();
        if (st.when === 'now') {
          go('b-review', { replace: true });
          toast(`${ALFRED.first} can come now`);
        } else if (st.outcome === 'none' && !st.retried) {
          st.noneFrom = st.time;
          go('b-none', { replace: true });
        } else {
          go('b-review', { replace: true });
        }
      }
    });
  },
  'b-live': () => {
    every(1200, () => {
      if (st.liveEta <= 0) return clearTimers();
      st.liveEta -= 1;
      if (st.liveEta === 0 && bk()) bk().status = 'inprogress';
      render();
    });
  },
  'b-otp': () => phone.querySelector(`[data-otp="${Math.min(st.otp.length, 5)}"]`)?.focus(),
};

function makeBooking(mode) {
  return {
    id: mode === 'now' ? 'MJ-8830' : 'MJ-8821', cat: st.cat, tier: st.tier,
    problem: problemB() || 'General checkup', day: st.day, time: st.time, addr: st.addr,
    manong: mode === 'now' ? ALFRED : JOHN, status: mode === 'now' ? 'accepted' : 'confirmed', mode, pay: st.pay,
  };
}

// ---------- actions ----------
const ACT = {
  noop() {},
  go: (s) => go(s),
  back,
  tab: (s) => go(s, { reset: true, replace: true }),
  home: () => go(flow() === 'A' ? 'a-home' : 'b-home', { reset: true, replace: true }),
  toast: (m) => toast(m),
  sheet: (t, el) => sheet(t, { arg2: el.dataset.arg2 }),
  closeSheet(msg) {
    st.sheet = null;
    render();
    if (msg) toast(msg);
  },
  social(name) {
    toast(`Signed in with ${name}`);
    go(flow() === 'A' ? 'a-home' : 'b-home', { reset: true, replace: true });
  },
  togglePw() {
    st.showPw = !st.showPw;
    render();
  },
  loginA() {
    if (!st.loginId.trim() || !st.loginPw) {
      toast('Enter your email or mobile and password');
      return shake('#loginForm');
    }
    go('a-home', { reset: true, replace: true });
  },
  loginB() {
    if (!st.loginId.trim() || !st.loginPw) {
      st.authErr = !st.loginId.trim() ? 'Enter your email or mobile number.' : 'Enter your password.';
      render();
      return shake('#loginForm');
    }
    go('b-home', { reset: true, replace: true });
  },
  createAccount(msg) {
    st.sheet = null;
    toast(msg || `Account created. Welcome, ${flow() === 'A' ? 'Enzo' : 'Bruce'}!`);
    go(flow() === 'A' ? 'a-home' : 'b-home', { reset: true, replace: true });
  },
  sendCode() {
    const n = st.phoneNum.replace(/\D/g, '');
    if (n.length !== 10 || n[0] !== '9') {
      st.authErr = 'Enter a 10-digit PH mobile number starting with 9.';
      render();
      return shake('#phoneField');
    }
    st.otp = '';
    go('b-otp');
    toast('Code sent');
  },
  resend: () => toast('New code sent'),
  verifyOtp() {
    if (st.otp.length < 6) {
      st.authErr = 'Enter all 6 digits.';
      render();
      return shake('#otpRow');
    }
    go('b-home', { reset: true, replace: true });
  },
  logout() {
    const v = st.variant;
    st = fresh(v);
    render(true);
    toast('Logged out');
  },

  // flow 1
  startA(k) {
    st.cat = k;
    go(st.variant === 'v3' ? 'a-service-map' : 'a-service');
  },
  tierA(k) {
    st.tierA = k;
    render();
  },
  pickAddrA(i) {
    st.addrA = +i;
    st.sheet = null;
    render();
  },
  pickPay(p) {
    st.pay = p;
    st.sheet = null;
    render();
  },
  pickVoucher(v) {
    st.voucher = v === '1';
    st.sheet = null;
    render();
    toast(st.voucher ? 'MANONG50 applied, ₱50 off' : 'Voucher removed');
  },
  symA(s) {
    st.symptomsA = st.symptomsA.includes(s) ? st.symptomsA.filter((x) => x !== s) : [...st.symptomsA, s];
    render();
  },
  rmPhotoA(i) {
    st.photosA.splice(+i, 1);
    render();
  },
  takePhoto(which) {
    if (which === 'A') st.photosA.push({ src: A + 'pipe.png', label: `Photo ${st.photosA.length + 1}` });
    else st.photos.push(A + 'pipe.png');
    st.sheet = null;
    render();
    toast('Photo added');
  },
  confirmA() {
    if (!st.descA.trim() && !st.symptomsA.length) {
      toast('Add a description or tap a symptom');
      return shake('#descCard');
    }
    go('a-finding');
  },
  cancelFindA() {
    clearTimers();
    sheet('cancelFindA');
  },
  resumeFind() {
    st.sheet = null;
    render(true);
  },
  confirmCancelA() {
    clearTimers();
    st.sheet = null;
    toast('Request cancelled. GCash hold released.');
    const first = st.variant === 'v3' ? 'a-service-map' : 'a-service';
    st.stack = ['a-home'];
    st.screen = first;
    render(true);
  },
  jobDoneA() {
    st.tip = 50;
    st.customTip = false;
    go('a-summary', { replace: true });
  },
  starA(n) {
    st.stars = +n;
    render();
  },
  praiseA(l) {
    st.praise = st.praise.includes(l) ? st.praise.filter((x) => x !== l) : [...st.praise, l];
    render();
  },
  tip(v) {
    st.tip = +v;
    st.customTip = false;
    render();
  },
  customTip() {
    st.customTip = !st.customTip;
    if (!st.customTip) st.tip = 50;
    render();
    phone.querySelector('[data-model="tipCustom"]')?.focus();
  },
  receipt() {
    const t = flow() === 'A'
      ? `MANG JUAN E-RECEIPT\nBooking #MN-82049\n${tA().name}: ${peso(tA().price)}\n${st.voucher ? 'Voucher MANONG50: -₱50\n' : ''}Tip: ${peso(st.tip)}\nTotal: ${peso(totalA())}\nPaid via ${st.pay === 'gcash' ? 'GCash' : 'Cash'}\nManong: Clariso Perez\n`
      : '';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([t], { type: 'text/plain' }));
    a.download = 'mang-juan-receipt-MN-82049.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('E-receipt downloaded');
  },
  submitA() {
    st.past.unshift({ id: 'MJ-82049', cat: st.cat, tier: st.tierA === 'major' ? 'major' : st.tierA, title: 'Plumbing on Oct 21', manong: CLARISO, total: totalA() });
    go('a-thanks', { replace: true });
  },
  sendChat(text) {
    if (!text.trim()) return;
    st.chat.push({ me: true, t: text.trim() });
    render();
    setTimeout(() => {
      st.chat.push({ me: false, t: ['Sige po, noted!', 'Copy po. See you soon.', 'Salamat po, papunta na ako.'][st.chat.length % 3] });
      if (st.sheet?.type === 'chat') render();
    }, 900);
  },
  call(who) {
    st.call = { who, secs: 0, mute: false, spk: false };
    render();
  },
  endCall() {
    clearInterval(st.call.timer);
    st.call = null;
    render();
    toast('Call ended');
  },
  callToggle(k) {
    st.call[k] = !st.call[k];
    render();
  },

  // flow 2
  startB(k) {
    Object.assign(st, { cat: k, tier: 'standard', desc: '', symptoms: [], photos: [], when: 'schedule', day: 21, time: '10:30 AM', preferred: null, retried: false });
    go('b-size', { reset: true });
    st.stack = ['b-home'];
  },
  bookAgain() {
    ACT.startB('plumbing');
    st.preferred = JOHN.first;
    render();
    toast(`Requesting ${JOHN.first} again`);
  },
  openBooking() {
    const b = bk();
    if (!b) return;
    if (b.status === 'completed') return go('b-charges');
    go(b.mode === 'now' ? 'b-ondemand' : 'b-status');
  },
  pickAddrB(i) {
    st.addr = +i;
    st.sheet = null;
    if (bk() && bk().status !== 'cancelled') bk().addr = +i;
    render();
  },
  readNotif(i) {
    st.notifs[i].unread = false;
    st.sheet = null;
    if (+i === 0 && bk()) return go('b-status');
    if (+i === 1) toast('MANONG50 saved to your vouchers');
    if (+i === 2) toast('Rating opened from History');
    render();
  },
  readAll() {
    st.notifs.forEach((n) => (n.unread = false));
    st.sheet = null;
    render();
  },
  tierB(k) {
    st.tier = k;
    render();
  },
  symB(s) {
    st.symptoms = st.symptoms.includes(s) ? st.symptoms.filter((x) => x !== s) : [...st.symptoms, s];
    render();
  },
  rmPhoto(i) {
    st.photos.splice(+i, 1);
    render();
  },
  toSchedule() {
    if (!st.desc.trim() && !st.symptoms.length) {
      toast('Describe the problem or pick a symptom');
      return shake('#descBox');
    }
    go('b-schedule');
  },
  when(w) {
    st.when = w;
    render();
  },
  day(n) {
    st.day = +n;
    render();
  },
  time(t) {
    st.time = t;
    render();
  },
  fullSlot: () => toast('1:00 PM is fully booked. Pick another time.'),
  findB() {
    if (st.when === 'schedule' && (!st.day || !st.time)) return toast('Pick a day and time');
    st.retried = false;
    go('b-finding');
  },
  confirmCancelFindB() {
    clearTimers();
    st.sheet = null;
    st.stack = ['b-home'];
    st.screen = 'b-size';
    render(true);
    toast('Request cancelled');
  },
  rebookTime() {
    st.retried = true;
    st.screen = 'b-finding';
    render(true);
  },
  bookNowInstead() {
    st.when = 'now';
    st.screen = 'b-finding';
    render(true);
  },
  payB(p) {
    st.pay = p;
    render();
  },
  confirmB() {
    const now = st.when === 'now';
    st.booking = makeBooking(now ? 'now' : 'schedule');
    st.liveEta = now ? 8 : 18;
    st.stack = ['b-home'];
    st.screen = now ? 'b-ondemand' : 'b-status';
    render(true);
    toast(now ? `${ALFRED.first} accepted your request` : `Booked! ${st.booking.id} confirmed`);
  },
  cancelReason(i) {
    st.sheet.reason = +i;
    render();
  },
  reportReason(i) {
    st.sheet.reason = +i;
    render();
  },
  confirmCancelB() {
    const id = bk().id;
    st.booking = null;
    st.sheet = null;
    go('b-home', { reset: true, replace: true });
    toast(`Booking ${id} cancelled. No charge.`);
  },
  trackLive() {
    const b = bk();
    if (['confirmed', 'accepted'].includes(b.status)) {
      b.status = 'onway';
      st.liveEta = b.mode === 'now' ? 8 : 18;
    }
    go('b-live');
  },
  jobDoneB() {
    bk().status = 'completed';
    go('b-charges', { replace: true });
  },
  payToggle() {
    st.pay = st.pay === 'gcash' ? 'cash' : 'gcash';
    render();
    toast(`Paying with ${st.pay === 'gcash' ? 'GCash' : 'cash'}`);
  },
  payNow() {
    if (st.pay === 'cash') return ACT.paid();
    sheet('paying');
    setTimeout(ACT.paid, 1300);
  },
  paid() {
    bk().status = 'paid';
    st.sheet = null;
    st.starsB = 4;
    go('b-rate', { replace: true });
    toast(`Paid ${peso(bkTotal())}. Receipt emailed.`);
  },
  starB(n) {
    st.starsB = +n;
    render();
  },
  praiseB(p) {
    st.praiseB = st.praiseB.includes(p) ? st.praiseB.filter((x) => x !== p) : [...st.praiseB, p];
    render();
  },
  submitB() {
    archiveBooking();
    go('b-thanks', { replace: true });
  },
  skipRate() {
    archiveBooking();
    go('b-home', { reset: true, replace: true });
  },
};
function archiveBooking() {
  const b = bk();
  if (!b) return;
  st.past.unshift({ id: b.id, cat: b.cat, tier: b.tier, title: `${CATS[b.cat].name} on Oct ${b.day}`, manong: b.manong, total: bkTotal() });
  st.booking = null;
}

// panel-only "system events" the resident can't trigger from the UI
const SIM = {
  'a-found': [['Fast-forward: Manong arrives', () => {
    clearTimers();
    st.eta = 0;
    st.arrived = true;
    render();
  }], ['Job done → Order summary', () => ACT.jobDoneA()]],
  'b-status': [['John is on the way → live map', () => {
    bk().status = 'onway';
    st.liveEta = 18;
    go('b-live');
  }], ['Job done → Charges', () => ACT.jobDoneB()]],
  'b-ondemand': [['Alfred is on the way → live map', () => {
    bk().status = 'onway';
    st.liveEta = 8;
    go('b-live');
  }], ['Job done → Charges', () => ACT.jobDoneB()]],
  'b-live': [['Fast-forward: arrived', () => {
    st.liveEta = 0;
    if (bk()) bk().status = 'inprogress';
    render();
  }], ['Job done → Charges', () => ACT.jobDoneB()]],
};

// ---------- render ----------
function render(screenChanged) {
  if (screenChanged) clearTimers();
  const v = st.variant;
  const f = flow();
  const scrollEl = phone.querySelector('.screen .scroll');
  const keepScroll = !screenChanged && scrollEl ? scrollEl.scrollTop : 0;
  const focused = document.activeElement?.dataset?.model;

  phone.className = `phone ${f} ${v}`;
  const body = (S[st.screen] || S[VARIANTS[v].start])();
  let overlay = '';
  if (st.sheet) overlay = `<div class="scrim" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${SHEETS[st.sheet.type](st.sheet)}</div></div>`;
  if (st.call) {
    const m = MANONGS[st.call.who] || CLARISO;
    overlay += `<div class="call" role="dialog" aria-label="Call">${m.img ? `<img src="${m.img}" alt="" />` : `<span class="ini" style="background:var(--mango-soft);color:var(--cocoa);display:grid;place-items:center;font-size:36px;font-weight:800">${m.ini}</span>`}
      <h3>${m.name}</h3><p data-live="callTime">${fmtCall()}</p>
      <div class="row"><button class="${st.call.mute ? 'on' : ''}" data-act="callToggle" data-arg="mute" aria-label="Mute">${ic('mic')}</button>
      <button class="end" data-act="endCall" aria-label="End call">${ic('phone')}</button>
      <button class="${st.call.spk ? 'on' : ''}" data-act="callToggle" data-arg="spk" aria-label="Speaker">${ic('speaker')}</button></div></div>`;
  }
  phone.innerHTML = `<div class="screen">${body}</div>${overlay}`;
  if (keepScroll) phone.querySelector('.screen .scroll')?.scrollTo(0, keepScroll);
  if (focused) {
    const el = phone.querySelector(`[data-model="${focused}"]`);
    if (el) {
      el.focus();
      if (el.setSelectionRange && el.type !== 'number') el.setSelectionRange(el.value.length, el.value.length);
    }
  }
  live();
  const chatLog = phone.querySelector('#chatLog');
  if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;
  if (screenChanged) AFTER[st.screen]?.();
  if (st.call && !st.call.timer) {
    st.call.timer = setInterval(() => {
      if (!st.call) return;
      st.call.secs++;
      const el = phone.querySelector('[data-live="callTime"]');
      if (el) el.textContent = fmtCall();
    }, 1000);
  }
  const fr = FRAMES[st.screen];
  document.getElementById('frameName').textContent = 'Figma frame: ' + (typeof fr === 'object' ? fr[v] || Object.values(fr)[0] : fr || st.screen);
  try {
    history.replaceState(null, '', `#${v}/${st.screen}`);
  } catch {
    /* file:// in some browsers */
  }
  renderPanel();
}
LIVE.callTime = fmtCall;
function fmtCall() {
  if (!st.call) return '';
  const s = st.call.secs;
  return s < 2 ? 'Calling…' : `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const GROUP_DESC = {
  'Flow 1':
    "If you've booked a Grab or an Angkas, you already know this one. Pick the job, see the price, watch your Manong ride over on the map, then rate and tip. Nothing new to learn.",
  'Flow 2':
    "For when something's already gone wrong, and you're stressed before you even open the app. So each screen has less clutter, built on Nielsen's usability heuristics (Nielsen, 2006) and cognitive load theory (Sweller, 1988).",
};
function renderPanel() {
  const groups = {};
  Object.entries(VARIANTS).forEach(([k, v]) => (groups[v.group] ||= []).push([k, v]));
  const f = flow();
  const list = JUMP[f].map((s) => (s === 'a-service' && st.variant === 'v3' ? 'a-service-map' : s));
  const sims = SIM[st.screen] || [];
  panel.innerHTML = `<h1>Mang Juan prototype</h1>
    ${Object.entries(groups).map(([g, vs]) => `<h2>${g}</h2><p style="margin-bottom:10px">${GROUP_DESC[g]}</p><div class="seg">${vs.map(([k, v]) => `<button class="${st.variant === k ? 'on' : ''}" data-variant="${k}">${v.label}</button>`).join('')}</div>`).join('')}
    ${sims.length ? `<h2>Simulate (things the Manong or system does)</h2><div class="sim">${sims.map(([l], i) => `<button data-sim="${i}">${l}</button>`).join('')}</div>` : ''}
    ${f === 'B' ? `<h2>Scheduling outcome</h2><div class="seg"><button class="${st.outcome === 'found' ? 'on' : ''}" data-outcome="found">Manong found</button><button class="${st.outcome === 'none' ? 'on' : ''}" data-outcome="none">No Manong free</button></div>
      <p class="muted" style="margin-top:6px">Pick "Now" on step 3 for the on-demand path.</p>` : ''}
    <h2>Jump to screen</h2><div class="jump">${list.map((s) => `<button class="${st.screen === s ? 'on' : ''}" data-jump="${s}">${typeof FRAMES[s] === 'object' ? FRAMES[s][st.variant] || Object.values(FRAMES[s])[0] : FRAMES[s]}</button>`).join('')}</div>
    <label class="tog"><input type="checkbox" ${st.hints ? 'checked' : ''} data-hints /> Flash hotspots when tapping empty space</label>
    <h2></h2><div class="seg"><button data-reset>Reset prototype</button></div>`;
}

// ---------- events ----------
phone.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) {
    if (st.hints && !e.target.closest('input,textarea,label,form')) {
      phone.classList.add('hint');
      setTimeout(() => phone.classList.remove('hint'), 500);
    }
    return;
  }
  if (el.dataset.act === 'scrim') {
    if (e.target === el && st.sheet?.type !== 'paying') ACT.closeSheet();
    return;
  }
  if (el.tagName === 'LABEL') return; // file input labels open the picker natively
  e.preventDefault();
  ACT[el.dataset.act]?.(el.dataset.arg, el, e);
});
phone.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.model) {
    if (t.dataset.model === 'tipCustom') {
      st.tip = Math.max(0, Math.min(5000, parseInt(t.value, 10) || 0));
    } else {
      st[t.dataset.model] = t.value;
    }
    if (t.dataset.rerender !== undefined) render();
    else live();
  }
  if (t.dataset.otp !== undefined) {
    t.value = t.value.replace(/\D/g, '').slice(-1);
    const digits = [...phone.querySelectorAll('[data-otp]')].map((i) => i.value).join('');
    st.otp = digits;
    if (t.value) phone.querySelector(`[data-otp="${+t.dataset.otp + 1}"]`)?.focus();
    if (digits.length === 6) setTimeout(ACT.verifyOtp, 250);
  }
});
phone.addEventListener('keydown', (e) => {
  if (e.target.dataset.otp !== undefined && e.key === 'Backspace' && !e.target.value) phone.querySelector(`[data-otp="${+e.target.dataset.otp - 1}"]`)?.focus();
  if (e.key === 'Enter' && e.target.matches('#loginForm input')) ACT[flow() === 'A' ? 'loginA' : 'loginB']();
  if (e.key === 'Escape' && st.sheet) ACT.closeSheet();
});
phone.addEventListener('change', (e) => {
  const t = e.target;
  if (!t.dataset.upload || !t.files[0]) return;
  const file = t.files[0];
  if (!file.type.startsWith('image/')) return toast('Pick an image file');
  const r = new FileReader();
  r.onload = () => {
    if (t.dataset.upload === 'A') st.photosA.push({ src: r.result, label: file.name.slice(0, 12) });
    else st.photos.push(r.result);
    st.sheet = null;
    render();
    toast('Photo uploaded');
  };
  r.readAsDataURL(file);
});
phone.addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = e.target.querySelector('input');
  ACT.sendChat(inp.value);
});
panel.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.variant) {
    clearTimers();
    st = fresh(b.dataset.variant);
    render(true);
  } else if (b.dataset.jump) jumpTo(b.dataset.jump);
  else if (b.dataset.sim) SIM[st.screen][+b.dataset.sim][1]();
  else if (b.dataset.outcome) {
    st.outcome = b.dataset.outcome;
    renderPanel();
  } else if (b.dataset.reset !== undefined) {
    clearTimers();
    st = fresh(st.variant);
    render(true);
  }
});
panel.addEventListener('change', (e) => {
  if (e.target.dataset.hints !== undefined) st.hints = e.target.checked;
});

// Jumping straight into mid-flow screens seeds whatever they need.
function jumpTo(s) {
  st.sheet = null;
  st.call = null;
  if (s.startsWith('b-')) {
    if (!st.desc && !st.symptoms.length) {
      st.desc = 'Water is dripping under the kitchen sink. It got worse this morning.';
      st.symptoms = ['Leak'];
      st.photos = [A + 'pipe.png'];
    }
    if (['b-status', 'b-live', 'b-charges', 'b-rate'].includes(s) && (!bk() || bk().mode === 'now')) st.booking = makeBooking('schedule');
    if (s === 'b-ondemand') st.booking = makeBooking('now');
    if (s === 'b-live') {
      bk().status = 'onway';
      st.liveEta = 18;
    }
    if (s === 'b-charges') bk().status = 'completed';
    if (s === 'b-rate') bk().status = 'paid';
    if (s === 'b-none') st.noneFrom = st.time;
    if (s === 'b-finding') st.retried = false;
  }
  if (s === 'a-found') {
    st.eta = 10;
    st.km = 1.4;
    st.arrived = false;
  }
  st.stack = [flow() === 'A' ? 'a-home' : 'b-home'];
  st.screen = s;
  render(true);
}

// ---------- boot ----------
function boot() {
  const [v, s] = location.hash.slice(1).split('/');
  if (VARIANTS[v]) {
    if (v === st.variant && s === st.screen && phone.childElementCount) return;
    clearTimers();
    st = fresh(v);
    if (s && S[s] && s.startsWith(VARIANTS[v].flow.toLowerCase() + '-')) return jumpTo(s);
  }
  render(true);
}
window.addEventListener('hashchange', boot);
boot();

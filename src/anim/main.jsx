// Welcome-screen animations for the Flow 5 PWA. `npm run build:anim` bundles this into src/web/anim.js.
// The PWA renders #phone with innerHTML. The welcome markup marks spots with data-anim="…" and its static
// content is the fallback (reduced motion, or this bundle missing). On arrival each spot is swapped for a
// holder node; later re-renders (the catalogue load re-renders welcome) move the same holders back in, so
// nothing restarts.
import { Fragment, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import SplitText from './reactbits/SplitText.jsx';
import TextType from './reactbits/TextType.jsx';
import './anim.css';

// Wheel cards. Lines come from the catalogue descriptions (db/schema.sql) and the welcome-screen claims.
const F5 = 'assets/f5/';
/* global ic */ // the PWA's icon helper: a top-level const in app.js, so not on window
const appIcon = (n) => (typeof ic === 'function' ? ic(n) : '');
const CARDS = [
  {
    title: 'Aircon Cleaning',
    icon: `<img src="${F5}ic-aircon.svg" alt="" />`,
    bg: '#eff6ff',
    lines: ['Available in 30m', 'Cleaning & check-ups', 'Vetted Kuya Pros'],
  },
  {
    title: 'Electrical & Wiring',
    icon: `<img src="${F5}ic-electrical.svg" alt="" />`,
    bg: '#fffbeb',
    lines: ['From ₱350', 'Outlets, switches & breakers', 'Upfront Rates'],
  },
  {
    title: 'Plumbing & Leaks',
    icon: `<img src="${F5}ic-plumbing.svg" alt="" />`,
    bg: '#ecfeff',
    lines: ['★ 4.9 (12k+ reviews)', 'Leaks, drains & toilets', 'Same-day Arrival'],
  },
  {
    title: 'Moving',
    icon: appIcon('truck'),
    bg: '#f5f3ff',
    tone: '#7c3aed',
    lines: ['Boxes to whole-unit moves', 'Furniture hauling', 'Upfront Rates'],
  },
  {
    title: 'Locksmith',
    icon: appIcon('key'),
    bg: '#fef2f2',
    tone: '#dc2626',
    lines: ['Lockouts & lock changes', 'Smart lock installs', 'Same-day Arrival'],
  },
  {
    title: 'House Repairs',
    icon: appIcon('hammer'),
    bg: '#ecfdf5',
    tone: '#059669',
    lines: ['Doors, cabinets & walls', 'Furniture & windows', 'Vetted Kuya Pros'],
  },
];
const STEP = 64; // px between card centres: about a 5px gap next to the 62px centre card

// A vertical wheel: the centre card is solid and types its lines; when the last line is done it
// scrolls to the next card. The cards above and below stay translucent; tapping one brings it to the centre.
function Wheel() {
  const [active, setActive] = useState(0);
  const n = CARDS.length;
  return (
    <div className="f5wheel">
      {CARDS.map((c, i) => {
        let o = (i - active + n) % n;
        if (o > n / 2) o -= n; // nearest way round, so the list loops
        const on = o === 0;
        return (
          <div
            key={c.title}
            className={`f5hc f5wc${on ? ' on' : ''}`}
            style={{
              transform: `translateY(${o * STEP}px) scale(${on ? 1 : 0.9})`,
              opacity: on ? 1 : Math.abs(o) === 1 ? 0.4 : 0,
            }}
            aria-hidden={!on}
            onClick={() => setActive(i)}
          >
            <span
              className="ic"
              style={{ background: c.bg, color: c.tone }}
              dangerouslySetInnerHTML={{ __html: c.icon }}
            />
            <span>
              <b>{c.title}</b>
              {on ? (
                <TextType
                  as="small"
                  text={c.lines}
                  typingSpeed={45}
                  deletingSpeed={22}
                  pauseDuration={1100}
                  cursorCharacter="|"
                  onSentenceComplete={(_, k) => k === c.lines.length - 1 && setActive((i + 1) % n)}
                />
              ) : (
                <small>{c.lines[0]}</small>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Headline({ parts }) {
  return (
    <h2>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          <SplitText
            tag={p.tag}
            text={p.text}
            trigger="load"
            splitType="chars"
            delay={28}
            duration={0.9}
          />
        </Fragment>
      ))}
    </h2>
  );
}

// Each builder fills its holder (already in the DOM) and returns its cleanup.
const mount = (holder, node) => {
  const root = createRoot(holder);
  root.render(node);
  return () => root.unmount();
};
const BUILD = {
  headline: (spot, holder) =>
    mount(
      holder,
      <Headline
        parts={[...spot.childNodes]
          .filter((n) => n.nodeName !== 'BR' && n.textContent.trim())
          .map((n) => ({ tag: n.nodeName === 'U' ? 'u' : 'span', text: n.textContent }))}
      />,
    ),
  deck: (spot, holder) => {
    gsap.from(holder, { opacity: 0, y: 14, duration: 0.6, ease: 'power3.out', delay: 0.3 });
    return mount(holder, <Wheel />);
  },
};

const phone = document.getElementById('phone');
let live = null; // { holders: { name: element }, cleanups: [], tl } while the welcome screen is up

// Entrance for the plain text and buttons (the stickers stay still). Rebuilt on every re-render, at the
// same time position, because the nodes are new each time.
function tweenStatic(time) {
  live.tl?.kill();
  live.tl = gsap
    .timeline()
    .from(
      phone.querySelectorAll('.f5head p, .f5proof, .f5wfoot > *'),
      { opacity: 0, y: 14, duration: 0.6, ease: 'power3.out', stagger: 0.08 },
      0.35,
    )
    .time(time);
}

function sync() {
  const spots = phone.querySelectorAll('[data-anim]');
  if (!spots.length) {
    if (live && !phone.querySelector('[data-anim-live]')) {
      live.tl?.kill();
      live.cleanups.forEach((c) => c());
      live = null;
    }
    return;
  }
  const time = live?.tl?.time() ?? 0;
  live ??= { holders: {}, cleanups: [], tl: null };
  for (const spot of spots) {
    const name = spot.dataset.anim;
    const fresh = !live.holders[name];
    if (fresh) {
      live.holders[name] = document.createElement('div');
      live.holders[name].dataset.animLive = name;
    }
    spot.replaceWith(live.holders[name]);
    if (fresh) live.cleanups.push(BUILD[name](spot, live.holders[name]));
  }
  tweenStatic(time);
}

if (phone && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  new MutationObserver(sync).observe(phone, { childList: true });
  sync(); // the first render ran before this script loaded
}

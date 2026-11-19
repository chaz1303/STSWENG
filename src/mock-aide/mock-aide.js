// Mock aide side: act as one Manong and answer requests through /api/mock-aide. Take the resident's
// price or counter once, then for the job you win: on the way / arrived, chat, extra charges, start,
// job done, or back out. Refreshes every 4 seconds without losing what you are typing.
// "Manage Manongs" adds test Manongs and sets their services, accredited condos and active flag.
const $ = (id) => document.getElementById(id);
const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const peso = (n) => (n == null ? '—' : `₱${Number(n).toLocaleString('en-PH')}`);
const at = (t) =>
  t ? new Date(t).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const DONE = ['Completed', 'Declined', 'Cancelled'];
const OPEN = ['Requested', 'Pending Confirmation'];
const ASSIGNED = ['Accepted', 'Confirmed'];
const PROGRESS = { on_the_way: 'On the way', arrived: 'Arrived' };
let catalog = {};
let aides = [];
let condos = [];
let last = [];

const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  },
};
const me = () => aides.find((a) => a.id === $('aide').value && a.is_active);

// The mock aide password (MOCK_AIDE_KEY on the server), kept for this browser tab only.
let key = (() => {
  try {
    return sessionStorage.getItem('mj_mock_aide_key') || '';
  } catch {
    return '';
  }
})();
function askKey() {
  key = prompt('Mock aide password') || '';
  try {
    sessionStorage.setItem('mj_mock_aide_key', key);
  } catch {
    /* private mode: asked again on reload */
  }
}

async function api(method, path, body) {
  if (path.startsWith('/mock-aide') && !key)
    throw new Error('Enter the mock aide password: click Refresh.');
  const r = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Mock-Aide-Key': key },
    body: body && JSON.stringify(body),
  });
  const data = r.status === 204 ? {} : await r.json();
  if (r.status === 401) {
    key = ''; // stop the 4-second refresh from retrying a wrong password
    throw new Error('Wrong password. Click Refresh to try again.');
  }
  if (!r.ok) {
    const f = data.error?.fields;
    throw new Error((f && Object.values(f)[0]) || data.error?.message || r.statusText);
  }
  return data;
}

function duration(b) {
  const s = catalog[b.category]?.services.find((x) => x.service_type === b.service_type);
  if (!s) return '';
  if (!s.max_minutes) return `${s.min_minutes}+ min`;
  return s.min_minutes === s.max_minutes
    ? `${s.min_minutes} min`
    : `${s.min_minutes}–${s.max_minutes} min`;
}
const aideName = (id) => aides.find((a) => a.id === id)?.full_name ?? 'A Manong';
const btn = (act, label, cls = 'go', extra = '') =>
  `<button class="${cls}" data-act="${act}" ${extra}>${esc(label)}</button>`;

// What the acting Manong can do with this booking right now.
function controls(b, aide) {
  const mineOffer = b.offers.find((o) => o.aide_id === aide?.id);
  if (!aide) return '<p class="muted">Pick who you are acting as.</p>';
  if (OPEN.includes(b.status) && !b.aide_id) {
    const asked = b.price_offer ?? b.base_price;
    // Offers only on your own services, never below the resident's price (the server checks too).
    const answer = mineOffer
      ? `<p>You offered <b>${peso(mineOffer.price)}</b> (${mineOffer.kind === 'accept' ? 'took their price' : 'counter'}), ${esc(mineOffer.status)}.</p>`
      : !aide.categories.includes(b.category)
        ? `<p class="muted">Not one of your services (${esc(aide.categories.join(', '))}).</p>`
        : !aide.condos.includes(b.condo_id)
          ? `<p class="muted">You aren't accredited at ${esc(b.condo_name)}.</p>`
          : `<div class="row">${asked != null ? btn('offer', `Accept ${peso(asked)}`) : ''}
          <input type="number" min="${asked ?? 0}" step="10" data-key="${b.id}:counter" placeholder="₱${asked ?? ''}+" aria-label="Counter offer in pesos, at least the resident's price" />
          ${btn('counter', 'Counter', '')}</div>`;
    return `${answer}<div class="row">${btn('decline', 'Close: nobody can take it', 'warn')}</div>`;
  }
  if (b.aide_id && b.aide_id !== aide.id)
    return `<p class="muted">Booked by ${esc(aideName(b.aide_id))}.</p>`;
  if (b.aide_id !== aide.id) return '';
  let h = '';
  if (ASSIGNED.includes(b.status))
    h += `<div class="row"><input type="number" min="0" max="600" data-key="${b.id}:eta" placeholder="ETA min" aria-label="Minutes away" />
      ${btn('way', 'On the way')}${btn('arrived', 'Arrived')}${btn('start', 'Start job')}${btn('withdraw', 'Cancel job (back out)', 'warn')}</div>`;
  if (b.status === 'In Progress')
    h += `<div class="row"><input type="text" class="grow" maxlength="80" data-key="${b.id}:label" placeholder="Part or material" aria-label="Charge item" />
      <input type="number" min="1" data-key="${b.id}:amount" placeholder="₱" aria-label="Charge amount in pesos" />${btn('charge', 'Add charge', '')}</div>
      <div class="row">${btn('done', 'Job done')}</div>`;
  if (!DONE.includes(b.status) || b.status === 'Completed')
    h += `<h3>Chat with ${esc(b.resident_name)}</h3>
      <div class="chat">${
        b.messages
          .filter((m) => m.aide_id === aide.id)
          .map((m) => `<span class="bubble ${m.sender}">${esc(m.body)}</span>`)
          .join('') || '<span class="muted">No messages yet.</span>'
      }</div>
      <div class="row"><input type="text" class="grow" maxlength="500" data-key="${b.id}:chat" placeholder="Message" aria-label="Message to resident" />${btn('send', 'Send', '')}</div>`;
  return h;
}

function card(b, aide) {
  const cat = catalog[b.category];
  const svc = cat?.services.find((s) => s.service_type === b.service_type);
  const when = b.scheduled_for
    ? new Date(b.scheduled_for).toLocaleString('en-PH')
    : 'Now (on demand)';
  const status = `${b.status}${b.aide_status && ASSIGNED.includes(b.status) ? ` · ${PROGRESS[b.aide_status]}${b.eta_minutes != null ? ` (${b.eta_minutes} min)` : ''}` : ''}`;
  const offers = b.offers.length
    ? `<h3>Offers</h3><ul>${b.offers
        .map(
          (o) =>
            `<li>${esc(aideName(o.aide_id))}: ${peso(o.price)} ${o.kind === 'counter' ? 'counter' : 'at their price'} <span class="muted">(${esc(o.status)})</span></li>`,
        )
        .join('')}</ul>`
    : '';
  const charges = b.charges.length
    ? `<h3>Extra charges</h3><ul>${b.charges
        .map(
          (c) =>
            `<li>${esc(c.label)}: ${peso(c.amount)} <span class="muted">(${esc(c.status)})</span></li>`,
        )
        .join('')}</ul>`
    : '';
  // Who changed the status, from usr_booking_status_history.
  const who = (h) =>
    h.changed_by_role === 'resident'
      ? b.resident_name
      : h.changed_by_role === 'aide'
        ? aideName(h.changed_by_id)
        : h.changed_by_role;
  const history = (b.history ?? []).length
    ? `<h3>Status history</h3><ol class="history">${b.history
        .map(
          (h) =>
            `<li><span class="muted">${esc(at(h.changed_at))}</span> ${h.from_status ? `${esc(h.from_status)} → ` : ''}<b>${esc(h.to_status)}</b> <span class="muted">by ${esc(who(h))}</span></li>`,
        )
        .join('')}</ol>`
    : '';
  return `<article data-id="${esc(b.id)}">
    <div class="top"><b>${esc(cat?.name ?? b.category)}, ${esc(svc?.label ?? b.service_type)}</b>
      <span class="status">${esc(status)}</span></div>
    <dl>
      <dt>Resident</dt><dd>${esc(b.resident_name)} · ${esc(b.resident_mobile)}</dd>
      <dt>Condo</dt><dd>${esc(b.condo_name)}${b.unit_label ? ` · ${esc(b.unit_label)}` : ''}</dd>
      <dt>Where</dt><dd>${esc(b.address)}${b.unit_notes ? `<br /><small>${esc(b.unit_notes)}</small>` : ''}</dd>
      <dt>When</dt><dd>${esc(when)}</dd>
      ${b.cancel_reason ? `<dt>Cancel reason</dt><dd>${esc(b.cancel_reason)}</dd>` : ''}
      <dt>Problem</dt><dd>${esc(b.problem) || '—'}</dd>
      <dt>Symptoms</dt><dd>${esc((b.symptoms ?? []).join(', ')) || '—'}</dd>
      <dt>Duration</dt><dd>${esc(duration(b)) || '—'}</dd>
      <dt>Base price</dt><dd>${peso(b.base_price)}</dd>
      <dt>Their offer</dt><dd>${peso(b.price_offer)}</dd>
      ${b.agreed_price != null ? `<dt>Agreed</dt><dd><b>${peso(b.agreed_price)}</b> with ${esc(b.aide?.full_name)}</dd>` : ''}
      ${b.total_amount != null ? `<dt>Total</dt><dd>${peso(b.total_amount)} <small class="muted">agreed + approved charges</small></dd>` : ''}
      ${b.started_at ? `<dt>Started</dt><dd>${esc(at(b.started_at))}</dd>` : ''}
      ${b.completed_at ? `<dt>Finished</dt><dd>${esc(at(b.completed_at))}</dd>` : ''}
      ${b.rating ? `<dt>Review</dt><dd>${'★'.repeat(b.rating)}${b.tip ? ` · tip ${peso(b.tip)}` : ''}${b.review ? `<br /><small>${esc(b.review)}</small>` : ''}</dd>` : ''}
    </dl>${offers}${charges}${history}${controls(b, aide)}
  </article>`;
}

function render() {
  const aide = me();
  // Keep typed values and focus across the re-render.
  const typed = {};
  document.querySelectorAll('[data-key]').forEach((el) => (typed[el.dataset.key] = el.value));
  const focus = document.activeElement?.dataset?.key;
  let shown = last;
  if ($('open').checked)
    shown = shown.filter(
      (b) => !DONE.includes(b.status) || (b.status === 'Completed' && !b.reviewed_at),
    );
  if ($('mine').checked && aide)
    shown = shown.filter(
      (b) =>
        (aide.categories.includes(b.category) && aide.condos.includes(b.condo_id)) ||
        b.aide_id === aide.id,
    );
  $('list').innerHTML = shown.map((b) => card(b, aide)).join('') || '<p>No bookings.</p>';
  document.querySelectorAll('[data-key]').forEach((el) => {
    if (typed[el.dataset.key]) el.value = typed[el.dataset.key];
  });
  if (focus) document.querySelector(`[data-key="${CSS.escape(focus)}"]`)?.focus();
  const chat = document.querySelectorAll('.chat');
  chat.forEach((c) => (c.scrollTop = c.scrollHeight));
}

// Messages stay readable: action results clear after 8 seconds; a failed refresh (wrong password,
// offline) stays until a refresh works again.
let sticky = false;
let msgTimer;
function say(text, keep = false) {
  clearTimeout(msgTimer);
  $('msg').textContent = text;
  sticky = keep;
  if (text && !keep) msgTimer = setTimeout(() => ($('msg').textContent = ''), 8000);
}

async function load() {
  try {
    last = (await api('GET', '/mock-aide/bookings')).bookings;
    render();
    if (sticky) say('');
  } catch (e) {
    say(e.message, true);
  }
}

const val = (id, k) => document.querySelector(`[data-key="${CSS.escape(`${id}:${k}`)}"]`);
const num = (el) => (el && el.value !== '' ? Number(el.value) : null);
const ACTIONS = {
  offer: (id) => ['POST', `/mock-aide/bookings/${id}/offers`, {}],
  counter: (id) => ['POST', `/mock-aide/bookings/${id}/offers`, { price: num(val(id, 'counter')) }],
  decline: (id) => ['PATCH', `/mock-aide/bookings/${id}/status`, { status: 'Declined' }],
  way: (id) => [
    'PATCH',
    `/mock-aide/bookings/${id}/progress`,
    { aide_status: 'on_the_way', eta_minutes: num(val(id, 'eta')) ?? 10 },
  ],
  arrived: (id) => ['PATCH', `/mock-aide/bookings/${id}/progress`, { aide_status: 'arrived' }],
  start: (id) => [
    'PATCH',
    `/mock-aide/bookings/${id}/status`,
    { status: 'In Progress', bypass_date: $('bypass').checked },
  ],
  done: (id) => ['PATCH', `/mock-aide/bookings/${id}/status`, { status: 'Completed' }],
  withdraw: (id) => ['POST', `/mock-aide/bookings/${id}/withdraw`, {}],
  charge: (id) => [
    'POST',
    `/mock-aide/bookings/${id}/charges`,
    { label: val(id, 'label')?.value ?? '', amount: num(val(id, 'amount')) },
  ],
  send: (id) => [
    'POST',
    `/mock-aide/bookings/${id}/messages`,
    { body: val(id, 'chat')?.value ?? '' },
  ],
};
const CLEAR = { counter: ['counter'], charge: ['label', 'amount'], send: ['chat'], way: ['eta'] };

async function act(btnEl) {
  const id = btnEl.closest('article').dataset.id;
  const name = btnEl.dataset.act;
  if (
    name === 'withdraw' &&
    !confirm('Back out of this job? The resident goes back to finding a Manong.')
  )
    return;
  const [method, path, body] = ACTIONS[name](id);
  btnEl.disabled = true;
  try {
    await api(method, path, { ...body, aide_id: $('aide').value });
    for (const k of CLEAR[name] ?? []) if (val(id, k)) val(id, k).value = '';
  } catch (err) {
    say(err.message);
  }
  load();
}

$('list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (b) act(b);
});
$('list').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !e.target.dataset.key) return;
  const k = e.target.dataset.key.split(':')[1];
  const name = { chat: 'send', counter: 'counter', amount: 'charge', label: 'charge' }[k];
  const b = e.target.closest('article').querySelector(`button[data-act="${name}"]`);
  if (b) act(b);
});
$('refresh').addEventListener('click', () => {
  if (!key) askKey();
  if (aides.length) load();
  else start();
});
// Clean sweep so the free database doesn't fill up. Typed confirmation, since it can't be undone.
$('sweep').addEventListener('click', async () => {
  const typed = prompt(
    `Delete ALL ${last.length} bookings for every resident, with their offers, chat and charges? This can't be undone.\n\nType DELETE to confirm.`,
  );
  if (typed !== 'DELETE') return;
  try {
    const { deleted } = await api('DELETE', '/mock-aide/bookings', { confirm: 'DELETE' });
    await load();
    say(`Deleted ${deleted} booking${deleted === 1 ? '' : 's'}.`);
  } catch (e) {
    say(e.message);
  }
});
$('open').addEventListener('change', render);
$('mine').addEventListener('change', render);
$('aide').addEventListener('change', () => {
  store.set('mj_mock_aide', $('aide').value);
  render();
});

// ---------- Manage Manongs ----------
const checks = (name, items, picked) =>
  items
    .map(
      ([v, label]) =>
        `<label class="chk"><input type="checkbox" name="${name}" value="${esc(v)}" ${picked.includes(v) ? 'checked' : ''} /> ${esc(label)}</label>`,
    )
    .join('');
const catItems = () => Object.values(catalog).map((c) => [c.key, c.name]);
const condoItems = () =>
  condos.map((c) => [c.id, `${c.name}${c.is_accredited ? '' : ' (not open to residents)'}`]);
function aideForm(a) {
  const id = a ? ` data-aide="${esc(a.id)}"` : '';
  const head = a
    ? `<b class="grow">${esc(a.full_name)}</b><label class="chk"><input type="checkbox" name="is_active" ${a.is_active ? 'checked' : ''} /> Active</label>`
    : `<input type="text" name="first_name" maxlength="60" placeholder="First name" aria-label="First name" required />
       <input type="text" name="last_name" maxlength="60" placeholder="Last name" aria-label="Last name" required />`;
  return `<form class="aideform"${id}>
    <div class="row">${head}</div>
    <div class="row"><span class="muted">Services</span> ${checks('categories', catItems(), a?.categories ?? [])}</div>
    <div class="row"><span class="muted">Accredited at</span> ${checks('condos', condoItems(), a?.condos ?? [])}</div>
    <div class="row"><button type="submit" class="${a ? '' : 'go'}">${a ? 'Save' : 'Add Manong'}</button></div>
  </form>`;
}
function renderManage() {
  $('manageList').innerHTML = aideForm(null) + aides.map(aideForm).join('');
}
// "Acting as" lists active Manongs only.
function fillPicker() {
  const keep = $('aide').value || store.get('mj_mock_aide');
  $('aide').innerHTML = aides
    .filter((a) => a.is_active)
    .map(
      (a) =>
        `<option value="${esc(a.id)}">${esc(a.full_name)} (${esc(a.categories.join(', ') || 'no services')})</option>`,
    )
    .join('');
  if (aides.some((a) => a.id === keep && a.is_active)) $('aide').value = keep;
}
$('manageList').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const picked = (name) =>
    [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((x) => x.value);
  const body = { categories: picked('categories'), condos: picked('condos') };
  const id = form.dataset.aide;
  if (id) body.is_active = form.querySelector('input[name="is_active"]').checked;
  else Object.assign(body, { first_name: form.first_name.value, last_name: form.last_name.value });
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const { aide } = await api(
      id ? 'PATCH' : 'POST',
      id ? `/mock-aide/aides/${id}` : '/mock-aide/aides',
      body,
    );
    aides = (await api('GET', '/mock-aide/aides')).aides;
    fillPicker();
    renderManage();
    render();
    say(`${id ? 'Saved' : 'Added'} ${aide.full_name}.`);
  } catch (err) {
    button.disabled = false;
    say(err.message);
  }
});

const start = () =>
  Promise.all([
    api('GET', '/categories').then(({ categories }) => {
      catalog = Object.fromEntries(categories.map((c) => [c.key, c]));
    }),
    api('GET', '/mock-aide/aides').then((r) => {
      aides = r.aides;
      fillPicker();
    }),
    api('GET', '/mock-aide/condos').then((r) => {
      condos = r.condos;
    }),
  ])
    .then(renderManage)
    .then(load)
    .catch((e) => say(e.message, true));

if (!key) askKey();
start();
setInterval(() => key && aides.length && load(), 4000);

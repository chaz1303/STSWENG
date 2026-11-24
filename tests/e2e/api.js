// Run by Robot's `Execute Async Javascript` in the page, so calls are same-origin with the e2e server.
/* global arguments */
// arguments: method, path, body (or null), resident token (or ''), mock aide key, done callback.
const [method, path, body, token, aideKey, done] = arguments;
fetch(path, {
  method,
  headers: {
    'Content-Type': 'application/json',
    'X-Mock-Aide-Key': aideKey,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: body == null ? undefined : JSON.stringify(body),
})
  .then(async (r) => done({ status: r.status, body: await r.json().catch(() => null) }))
  .catch((e) => done({ status: 0, body: String(e) }));

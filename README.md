# STSWENG

## Folder map

| Path                               | Use it for                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/client/`                      | The resident PWA (React + Vite). Pages and UI components go here.                                |
| `src/client/steps.js`              | The happy-path steps, each a placeholder page until its story is built.                          |
| `src/client/public/`               | Files served as-is: web app manifest, service worker (`sw.js`), icon.                            |
| `src/server/`                      | The Express API. Add routes in `app.js`; `index.js` only starts the server.                      |
| `src/server/db.js`                 | The only place that talks to the shared database (engine not chosen yet).                        |
| `src/services/`                    | Business logic, such as booking and pricing rules. Coverage-checked in CI.                       |
| `src/utils/`                       | Small shared helpers. Coverage-checked in CI.                                                    |
| `src/utils/contract.js`            | Service types, durations and booking states shared with Team 2. Change only after Team 2 agrees. |
| `tests/unit/`                      | Vitest tests for `src/services` and `src/utils`.                                                 |
| `tests/integration/`               | Supertest tests that call the API.                                                               |
| `tests/e2e/`                       | Robot Framework tests that drive the built app in a browser.                                     |
| `.github/workflows/ci.yml`         | The CI pipeline (phases 1–4 live for now).                                                       |
| `.github/pull_request_template.md` | The PR form: story ID and test evidence.                                                         |
| `.env.example`                     | Copy to `.env` for local settings. Never commit real values.                                     |
| `requirements.txt`                 | Python packages for the Robot Framework tests.                                                   |

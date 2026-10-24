# STSWENG

## Folder map

| Path                               | Use it for                                                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/client/`                      | Everything residents see and tap in the app: the screens, buttons and forms.                                                                             |
| `src/client/steps.js`              | The list of screens in the booking journey, from Register to Complete Service. Each one is a blank page for now.                                         |
| `src/client/public/`               | What lets people install the app on their phone's home screen, plus the app icon.                                                                        |
| `src/server/`                      | The behind-the-scenes part the app talks to when it saves or loads anything, like a booking.                                                             |
| `src/server/db.js`                 | The one doorway to the database we share with Team 2. We haven't picked the database yet.                                                                |
| `src/services/`                    | The rules of the business, like what a booking costs or when it can be cancelled.                                                                        |
| `src/utils/`                       | Small helpers the rest of the code reuses.                                                                                                               |
| `src/utils/contract.js`            | What we've agreed with Team 2: the three service types, how long each takes, and the steps a booking goes through. Don't change it unless Team 2 agrees. |
| `tests/unit/`                      | Quick automatic checks that the business rules give the right answers.                                                                                   |
| `tests/integration/`               | Checks that the app and its back end talk to each other correctly.                                                                                       |
| `tests/e2e/`                       | Tests that click through the app in a real browser, the way a resident would.                                                                            |
| `.github/workflows/ci.yml`         | The robot that runs all the checks every time someone uploads changes, so mistakes get caught before they're merged.                                     |
| `.github/pull_request_template.md` | The form you fill in when you ask the team to review your work: which user story it's for, and proof it was tested.                                      |
| `.env.example`                     | A sample of the private settings each developer needs on their own computer. Real passwords never go in here.                                            |
| `requirements.txt`                 | The tools a computer needs to install before it can run the browser tests.                                                                               |

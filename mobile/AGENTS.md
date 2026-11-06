This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## This project

- **TypeScript.** Screens are `.tsx`, the rest `.ts`. `tsconfig.json` extends `tsconfig.expo.json` (a committed copy of Expo's base, because CI runs Vitest without `mobile/node_modules`) with `strict` on. Shared data shapes live in `types.ts`.
- **Navigation:** a plain screen stack in `App.tsx` (`app.go`, `app.back`, `app.home`), not Expo Router. Every screen receives one `app` prop typed as `App` in `types.ts`. Add a screen by adding it to `SCREENS` in `App.tsx`.
- **Data:** screens call `services/*`, never `mocks/` directly. Services are `async` and return mock data today; every spot that needs the real back end is marked `TODO(backend)`. Settings come from `config.ts` (env). Long-running calls use `useTask` for loading and error state.
- **Statuses:** the active booking has a `Stage` (finding, pending, confirmed, declined, onway, arrived, done). `contractStatus()` in `services/bookings.ts` maps it onto the shared contract (ICM open item 20). In development, the **Dev** button flips the mock status and can make the Manong ask for an extra part.
- **Shared contract:** service types and booking states come from `../src/utils/contract.js` (shared with Team 2's app). `metro.config.js` lets the app import it. Don't edit it from here.
- **Design source:** Flow 4 "Final" at the end of `../prototype/full.js` is the spec (it builds on Flow 1 in `../prototype/app.js`). Theme tokens are in `theme.ts`. The Flow 3 version of this app is archived on the `archive/mobile-flow3` branch and `mobile-flow3` tag.
- **Checks before done:** `npx tsc --noEmit` here, and `npm test` from the repo root (covers `services/`).

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

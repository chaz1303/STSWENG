// Settings read from env. Expo only exposes variables prefixed EXPO_PUBLIC_ to the app, and they
// end up in the app bundle, so never put secrets here. Copy .env.example to .env to set them.
export const config = {
  // TODO(backend): base URL of the Express API (src/server) once the services call it instead of mocks.
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  // TODO(backend): OAuth client IDs for Google and Facebook sign-in (public IDs, not secrets).
  googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '',
  // Shows the "Dev" switcher for mock statuses and failure cases. On in development builds by default.
  devTools: (process.env.EXPO_PUBLIC_DEV_TOOLS ?? (__DEV__ ? '1' : '0')) === '1',
};

# Google OAuth setup

Create a **Web application** OAuth client in Google Cloud. Under **Authorized redirect URIs**, enter exactly:

`http://localhost:3001/api/auth/google/callback`

Set the same exact value in `GOOGLE_REDIRECT_URI`, then set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a long random `SESSION_SECRET` in the server environment. Do not expose any of these values to Vite or browser code.

The app requests `openid email profile`. Its callback validates state, exchanges the authorization code server-side, and verifies Google's ID token against the configured client ID. Users are keyed by Google's immutable `sub` identifier, not their email.

For production, register an HTTPS URI such as `https://app.example.com/api/auth/google/callback` in Google Cloud and set `GOOGLE_REDIRECT_URI` to that exact URI. Never use the localhost callback in production.

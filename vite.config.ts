import { randomBytes } from 'node:crypto';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Security compliance (mandatory-secure-web-skills):
// - Server binds strictly to 127.0.0.1 (never 0.0.0.0) for local testing.
// - Strict HTTP response headers prevent clickjacking, MIME sniffing, and unauthorized origins.
// - CSP uses a per-server-start random NONCE (never 'unsafe-inline' / 'unsafe-eval' for scripts).
//   In dev, @vitejs/plugin-react injects an inline React Fast Refresh preamble <script>; Vite's
//   `html.cspNonce` stamps that tag (and every other injected script/style tag) with the nonce so
//   the strict policy still holds. The production bundle contains no inline scripts at all, so
//   `vite preview` serves a plain `script-src 'self'` policy.
// - TODO(security): style-src keeps 'unsafe-inline' because Vite/Tailwind HMR and three.js helpers
//   inject <style> elements at runtime. Replace with nonce/hash-based styles before a public deploy.
// - TODO(security): If student accounts or classroom progress syncing are added in the future,
//   introduce a Backend-for-Frontend (BFF) with OAuth 2.0 / OIDC, Argon2id password hashing,
//   CSRF synchronizer tokens, __Host- HttpOnly Secure SameSite=Lax session cookies, and rate limiting.

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cache-Control': 'no-store',
};

const EXTERNAL_DATA_ORIGINS =
  'https://api.gbif.org https://paleobiodb.org https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com';

function buildCsp(options: { scriptNonce?: string; allowDevSockets: boolean }): string {
  const scriptSrc = options.scriptNonce
    ? `'self' 'nonce-${options.scriptNonce}' https://www.googletagmanager.com`
    : `'self' https://www.googletagmanager.com`;
  const devSockets = options.allowDevSockets
    ? ' ws://127.0.0.1:* ws://localhost:* http://127.0.0.1:* http://localhost:*'
    : '';

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    `connect-src 'self' blob: ${EXTERNAL_DATA_ORIGINS}${devSockets}`,
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export default defineConfig(({ command, isPreview }) => {
  const isDevServer = command === 'serve' && !isPreview;
  // Fresh cryptographically random nonce every time the dev server starts.
  const devScriptNonce = isDevServer ? randomBytes(16).toString('base64') : undefined;

  return {
    plugins: [react(), tailwindcss()],
    // Vite stamps this nonce onto every <script>/<style> tag it (or a plugin) injects into index.html.
    html: devScriptNonce ? { cspNonce: devScriptNonce } : undefined,
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false,
      cors: {
        origin: [
          'http://127.0.0.1:5173',
          'http://localhost:5173',
          'http://127.0.0.1:5174',
          'http://localhost:5174',
        ],
        methods: ['GET', 'HEAD'],
      },
      headers: {
        ...SECURITY_HEADERS,
        'Content-Security-Policy': buildCsp({
          scriptNonce: devScriptNonce,
          allowDevSockets: true,
        }),
      },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      headers: {
        ...SECURITY_HEADERS,
        'Content-Security-Policy': buildCsp({ allowDevSockets: false }),
      },
    },
  };
});

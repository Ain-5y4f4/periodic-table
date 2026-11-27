import { CONFIG, SCOPES } from './config.js';

function whenGoogleReady() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const t = setInterval(() => {
      if (window.google?.accounts?.oauth2) { clearInterval(t); resolve(window.google); }
      else if (++tries > 100) { clearInterval(t); reject(new Error('Google Identity script failed to load.')); }
    }, 100);
  });
}

/**
 * Wires the "Sign in with Google" button. Calls onSignedIn({ accessToken, user }).
 * Uses Google Identity Services (OAuth token model) – no deprecated gapi.auth2.
 */
export async function setupGoogleLogin({ button, onSignedIn, onError }) {
  const google = await whenGoogleReady();
  const client = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: async (resp) => {
      if (resp.error) return onError(new Error(resp.error_description || resp.error));
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${resp.access_token}` },
        });
        const user = res.ok ? await res.json() : {};
        onSignedIn({ accessToken: resp.access_token, user });
      } catch (e) { onError(e); }
    },
    error_callback: (e) => onError(new Error(e?.message || e?.type || 'Sign-in cancelled')),
  });
  button.addEventListener('click', () => client.requestAccessToken({ prompt: 'select_account' }));
  return google;
}

export function signOut(google, accessToken) {
  if (google?.accounts?.oauth2 && accessToken) google.accounts.oauth2.revoke(accessToken, () => {});
}

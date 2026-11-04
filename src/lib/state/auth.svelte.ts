import { PUBLIC_API_URL } from '$env/static/public';
import { browser } from '$app/environment';

interface Player { id: string; name: string }
interface Session { access_token: string; expires_at: string }
const STORAGE_KEY = 'go-risk-it-session';
let session = $state<Session | null>(null);
let user = $state<Player | null>(null);
let loading = $state(true);

try {
	if (!browser) throw new Error('server');
	const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
	if (saved?.session?.access_token && Date.parse(saved.session.expires_at) > Date.now()) {
		session = saved.session;
		user = saved.user;
	} else localStorage.removeItem(STORAGE_KEY);
} catch { if (browser) localStorage.removeItem(STORAGE_KEY); }
loading = false;

export function getAuth() {
	return {
		get session() { return session; },
		get user() { return user; },
		get loading() { return loading; },
		get isAuthenticated() { return !!session; },
		get accessToken() { return session?.access_token ?? null; },
		async signIn(nickname: string) {
			const response = await fetch(`${PUBLIC_API_URL}/sessions`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname: nickname.trim() })
			});
			if (!response.ok) throw new Error(response.status === 400 ? 'Enter a valid nickname' : 'Could not start a session. Try again.');
			const result: { userId: string; token: string; expiresAt: string } = await response.json();
			if (!result.userId || !result.token || !result.expiresAt || !Number.isFinite(Date.parse(result.expiresAt))) throw new Error('Unexpected session response');
			session = { access_token: result.token, expires_at: result.expiresAt };
			user = { id: result.userId, name: nickname.trim() };
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ session, user }));
		},
		async signOut() {
			session = null;
			user = null;
			localStorage.removeItem(STORAGE_KEY);
		}
	};
}

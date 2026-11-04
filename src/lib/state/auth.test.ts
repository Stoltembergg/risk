import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PUBLIC_API_URL } from '$env/static/public';

const STORAGE_KEY = 'go-risk-it-session';
const future = () => new Date(Date.now() + 3_600_000).toISOString();

describe('auth', () => {
	let getAuth: typeof import('./auth.svelte').getAuth;
	const fetchMock = vi.fn();

	beforeEach(async () => {
		vi.resetModules();
		localStorage.clear();
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
		const mod = await import('./auth.svelte');
		getAuth = mod.getAuth;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('starts unauthenticated', () => {
		const auth = getAuth();
		expect(auth.loading).toBe(false);
		expect(auth.session).toBeNull();
		expect(auth.user).toBeNull();
		expect(auth.accessToken).toBeNull();
	});

	it('restores a valid stored session', async () => {
		const session = { access_token: 'tok-123', expires_at: future() };
		const user = { id: 'user-1', name: 'Alice' };
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ session, user }));

		vi.resetModules();
		const mod = await import('./auth.svelte');

		expect(mod.getAuth().accessToken).toBe('tok-123');
		expect(mod.getAuth().user).toEqual(user);
	});

	it('drops an expired stored session', async () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				session: { access_token: 'old', expires_at: new Date(Date.now() - 1000).toISOString() },
				user: { id: 'user-1', name: 'Alice' }
			})
		);

		vi.resetModules();
		const mod = await import('./auth.svelte');

		expect(mod.getAuth().accessToken).toBeNull();
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
	});

	it('signIn posts the nickname and stores the token', async () => {
		const expiresAt = future();
		fetchMock.mockResolvedValue({
			ok: true,
			status: 201,
			json: async () => ({ userId: 'user-1', nickname: 'Alice', token: 'tok-123', expiresAt })
		});

		await getAuth().signIn(' Alice ');

		expect(fetchMock).toHaveBeenCalledWith(
			`${PUBLIC_API_URL}/sessions`,
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ nickname: 'Alice' })
			})
		);
		expect(getAuth().accessToken).toBe('tok-123');
		expect(getAuth().user).toEqual({ id: 'user-1', name: 'Alice' });
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').session.access_token).toBe(
			'tok-123'
		);
	});

	it('signIn rejects an invalid nickname', async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 400, json: async () => ({}) });

		await expect(getAuth().signIn(' ')).rejects.toThrow('Enter a valid nickname');
	});

	it('signIn rejects a malformed session response', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			status: 201,
			json: async () => ({ userId: 'user-1', token: 'tok-123' })
		});

		await expect(getAuth().signIn('Alice')).rejects.toThrow('Unexpected session response');
	});

	it('signOut clears the session', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			status: 201,
			json: async () => ({ userId: 'user-1', token: 'tok-123', expiresAt: future() })
		});

		await getAuth().signIn('Alice');
		await getAuth().signOut();

		expect(getAuth().accessToken).toBeNull();
		expect(getAuth().user).toBeNull();
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
	});
});

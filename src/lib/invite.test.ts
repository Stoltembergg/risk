import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLobbies, joinLobby } from '$lib/api/lobby';
import { enterInvite, inviteHome, inviteId } from './invite';

vi.mock('$lib/api/lobby', () => ({ getLobbies: vi.fn(), joinLobby: vi.fn() }));
const empty = { owned: [], joined: [], joinable: [] };
const lobby = { id: '42', owner: 'user', participants: [] };

beforeEach(() => {
	vi.resetAllMocks();
	vi.mocked(getLobbies).mockResolvedValue(empty);
	vi.mocked(joinLobby).mockResolvedValue(undefined);
});

describe('invitation navigation', () => {
	it('preserves only the invitation through sign in', () => {
		expect(inviteHome(new URLSearchParams('join=42&next=https://evil.test'))).toBe('/?join=42');
		expect(inviteHome(new URLSearchParams('next=//evil.test'))).toBe('/');
	});
	it.each(['', '0', '-1', '1.2', '../42', 'https://evil.test', '9007199254740992'])('rejects invalid ID %s', (id) => {
		const params = new URLSearchParams({ join: id });
		expect(inviteId(params)).toBeNull();
		expect(inviteHome(params)).toBe('/?join=');
	});
});

describe('enter invitation', () => {
	it('joins with the authenticated nickname', async () => {
		expect(await enterInvite('42', 'Gabriel')).toBe(false);
		expect(joinLobby).toHaveBeenCalledExactlyOnceWith('42', 'Gabriel');
	});
	it.each(['owned', 'joined'] as const)('reopens an already %s lobby without joining again', async (kind) => {
		vi.mocked(getLobbies).mockResolvedValue({ ...empty, [kind]: [lobby] });
		expect(await enterInvite('42', 'Gabriel')).toBe(kind === 'owned');
		expect(joinLobby).not.toHaveBeenCalled();
	});
	it('recovers membership after a concurrent join', async () => {
		vi.mocked(joinLobby).mockRejectedValue(new Error('Conflict'));
		vi.mocked(getLobbies).mockResolvedValueOnce(empty).mockResolvedValueOnce({ ...empty, joined: [lobby] });
		expect(await enterInvite('42', 'Gabriel')).toBe(false);
		expect(joinLobby).toHaveBeenCalledTimes(1);
	});
	it('surfaces the original error without retrying the join', async () => {
		vi.mocked(joinLobby).mockRejectedValue(new Error('Lobby full'));
		await expect(enterInvite('42', 'Gabriel')).rejects.toThrow('Lobby full');
		expect(joinLobby).toHaveBeenCalledTimes(1);
	});
});

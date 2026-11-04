import { getLobbies, joinLobby } from '$lib/api/lobby';

export function inviteId(params: URLSearchParams): string | null {
	const id = params.get('join');
	return id && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id)) ? id : null;
}

export function inviteHome(params: URLSearchParams): string {
	const id = inviteId(params);
	return id ? `/?join=${id}` : params.has('join') ? '/?join=' : '/';
}

export async function enterInvite(id: string, nickname: string): Promise<boolean> {
	const membership = async () => {
		const lobbies = await getLobbies();
		if (lobbies.owned.some((lobby) => String(lobby.id) === id)) return true;
		if (lobbies.joined.some((lobby) => String(lobby.id) === id)) return false;
		return null;
	};
	const owner = await membership();
	if (owner !== null) return owner;
	try {
		await joinLobby(id, nickname);
	} catch (error) {
		// A concurrent join may have succeeded; never treat an arbitrary conflict as membership.
		try {
			const owner = await membership();
			if (owner !== null) return owner;
		} catch { /* Preserve the original join error. */ }
		throw error;
	}
	return false;
}

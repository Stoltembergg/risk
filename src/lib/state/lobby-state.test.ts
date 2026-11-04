import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture the options passed to createBaseWebSocket
let capturedOptions: {
	buildUrl: (baseUrl: string, token: string) => { url: string; protocols: string[] };
	onMessage: (data: string) => void;
	label?: string;
};

const mockBase = {
	_connected: false,
	get connected() {
		return this._connected;
	},
	connect: vi.fn(),
	disconnect: vi.fn()
};

vi.mock('$lib/state/base-websocket.svelte', () => ({
	createBaseWebSocket: vi.fn((opts: typeof capturedOptions) => {
		capturedOptions = opts;
		return mockBase;
	})
}));

const { createLobbyWebSocket } = await import('./lobby-state.svelte');

describe('createLobbyWebSocket', () => {
	beforeEach(() => {
		mockBase._connected = false;
		mockBase.connect.mockClear();
		mockBase.disconnect.mockClear();
	});

	describe('URL building', () => {
		it('builds URL with lobbyID in path', () => {
			createLobbyWebSocket('lobby-99');
			const { url } = capturedOptions.buildUrl('ws://example.com', 'tok');
			expect(url).toBe('ws://example.com/api/v1/lobbies/lobby-99/ws');
		});

		it('includes auth token in protocols', () => {
			createLobbyWebSocket('lobby-1');
			const { protocols } = capturedOptions.buildUrl('ws://example.com', 'my-token');
			expect(protocols).toEqual(['risk-it.websocket.auth.token', 'my-token']);
		});
	});

	describe('messages', () => {
		it('uses the persisted game ID from start and reconnect snapshots', () => {
			const ws = createLobbyWebSocket('7');
			for (const gameId of [42, 99]) {
				capturedOptions.onMessage(
					JSON.stringify({ type: 'lobbyState', data: { id: 7, participants: [], gameId } })
				);
				expect(ws.gameId).toBe(gameId);
			}
		});

		it.each([undefined, null, 0, -1, '42', '../other', 1.5, Number.MAX_SAFE_INTEGER + 1])(
			'does not navigate using invalid game ID %s',
			(gameId) => {
				const ws = createLobbyWebSocket('7');
				capturedOptions.onMessage(
					JSON.stringify({ type: 'lobbyState', data: { id: 7, participants: [], gameId } })
				);
				expect(ws.gameId).toBeUndefined();
			}
		);
		it('sets lobbyState on lobbyState message', () => {
			const ws = createLobbyWebSocket('lobby-1');
			const lobbyData = { id: 'lobby-1', owner: 'user1', participants: [] };

			capturedOptions.onMessage(JSON.stringify({ type: 'lobbyState', data: lobbyData }));

			expect(ws.lobbyState).toEqual(lobbyData);
		});

		it('ignores non-lobbyState message types', () => {
			const ws = createLobbyWebSocket('lobby-1');

			capturedOptions.onMessage(
				JSON.stringify({ type: 'otherMessage', data: { something: true } })
			);

			expect(ws.lobbyState).toBeNull();
		});
	});

	describe('initial state', () => {
		it('starts with null lobbyState', () => {
			const ws = createLobbyWebSocket('lobby-1');
			expect(ws.lobbyState).toBeNull();
		});
	});

	describe('API surface', () => {
		it('delegates connect and disconnect to base', () => {
			const ws = createLobbyWebSocket('lobby-1');
			ws.connect();
			ws.disconnect();
			expect(mockBase.connect).toHaveBeenCalled();
			expect(mockBase.disconnect).toHaveBeenCalled();
		});
	});

	describe('label', () => {
		it('passes "Lobby WebSocket" as label', () => {
			createLobbyWebSocket('lobby-1');
			expect(capturedOptions.label).toBe('Lobby WebSocket');
		});
	});
});

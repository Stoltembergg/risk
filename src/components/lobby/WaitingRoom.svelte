<script lang="ts">
	/**
	 * Lobby waiting room shown after a player creates or joins a lobby. Maintains a live
	 * WebSocket connection to receive real-time participant updates. The lobby owner can
	 * start the game once at least 3 players have joined; all players can copy an invite
	 * link or leave the lobby.
	 */
	import { goto } from '$app/navigation';
	import { createLobbyWebSocket } from '$lib/state/lobby-state.svelte';
	import { startLobby } from '$lib/api/lobby';
	import { getAuth } from '$lib/state/auth.svelte';

	interface Props {
		lobbyId: string;
		isOwner: boolean;
		onLeave: () => void;
	}

	const { lobbyId, isOwner, onLeave }: Props = $props();

	const auth = getAuth();
	// svelte-ignore state_referenced_locally
	const lobbyWs = createLobbyWebSocket(lobbyId);

	let error = $state('');
	let starting = $state(false);
	let copied = $state(false);
	let navigating = false;

	$effect(() => {
		lobbyWs.connect();
		return () => lobbyWs.disconnect();
	});

	const participants = $derived(lobbyWs.lobbyState?.participants ?? []);
	const canStart = $derived(isOwner && participants.length >= 3);

	$effect(() => {
		const gameId = lobbyWs.gameId;
		if (gameId && !navigating) {
			navigating = true;
			void goto(`/game/${gameId}`).catch(() => {
				navigating = false;
				error = 'Não foi possível abrir a partida. Reconecte-se e tente novamente.';
			});
		}
	});

	/** Copies a joinable lobby URL to the clipboard with a brief "Copied!" confirmation. */
	async function copyInviteLink() {
		const url = window.location.origin + `/?join=${lobbyId}`;
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			error = 'Não foi possível copiar. Selecione o endereço manualmente.';
		}
	}

	/**
	 * All players navigate from the persisted lobby snapshot, including after reconnect.
	 */
	async function handleStart() {
		error = '';
		starting = true;
		try {
			await startLobby(lobbyId);
		} catch (err) {
			error = 'Não foi possível iniciar a partida. Tente novamente.';
		} finally {
			starting = false;
		}
	}
</script>

<div class="glass mx-auto max-w-md rounded-2xl p-6">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-bold">Sala de espera</h2>
		<div class="flex items-center gap-2">
			<button
				onclick={copyInviteLink}
				class="cursor-pointer rounded-lg bg-surface-600 px-3 py-1.5 text-xs transition-colors hover:bg-surface-500"
			>
				{copied ? 'Copiado!' : 'Copiar convite'}
			</button>
			<span
				class="h-2 w-2 rounded-full"
				class:bg-green-500={lobbyWs.connected}
				class:bg-red-500={!lobbyWs.connected}
				role="status"
			aria-label={lobbyWs.connected ? 'Conectado' : 'Desconectado'}
			></span>
		</div>
	</div>

	<div class="mb-6 space-y-2">
		{#each participants as participant, i (participant.name)}
			<div
				class="flex items-center gap-3 rounded-lg bg-surface-700/50 px-4 py-2.5"
				data-testid="participant-{participant.name}"
			>
				<span class="flex h-6 w-6 items-center justify-center rounded-full bg-surface-500 text-xs">
					{i + 1}
				</span>
				<span class="font-medium">
					{participant.name}
					{#if participant.userId === auth.user?.id}
						<span class="text-xs text-gray-400">(você)</span>
					{/if}
				</span>
			</div>
		{/each}

		{#if participants.length < 3}
			<div
				class="rounded-lg border border-dashed border-gray-600 px-4 py-2.5 text-center text-sm text-gray-500"
			>
				Aguardando jogadores… faltam {3 - participants.length}
			</div>
		{/if}
	</div>

	{#if error}
		<div class="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
	{/if}

	<div class="flex gap-3">
		<button
			onclick={onLeave}
			class="flex-1 cursor-pointer rounded-lg bg-surface-600 py-2.5 text-sm transition-colors hover:bg-surface-500"
		>
			Sair
		</button>

		{#if isOwner}
			<button
				onclick={handleStart}
				disabled={!canStart || starting}
				data-testid="start-game-btn"
				class="flex-1 cursor-pointer rounded-lg bg-accent py-2.5 text-sm font-semibold transition-colors hover:bg-accent-light disabled:opacity-50"
			>
				{#if starting}
					Iniciando…
				{:else if !canStart}
					Faltam {3 - participants.length} jogadores
				{:else}
					Iniciar partida
				{/if}
			</button>
		{/if}
	</div>
</div>

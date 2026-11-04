<script lang="ts">
	/**
	 * Status bar showing the player list and mission progress. Renders as a
	 * left sidebar on desktop (md+) and a fixed bottom bar with expandable
	 * drawer on mobile. Mission display is anchored to the bottom of the sidebar.
	 */
	import type { PlayerState, MissionState, BoardState } from '$lib/types/game';
	import type { MapLayer, Continent } from '$lib/types/map';
	import PlayerList from './PlayerList.svelte';
	import MissionDisplay from './MissionDisplay.svelte';

	interface Props {
		players: PlayerState[];
		currentTurn: number;
		myUserId: string | null;
		mission: MissionState | null;
		connected: boolean;
		boardState: BoardState | null;
		mapLayers: MapLayer[];
		continents: Continent[];
	}

	let {
		players,
		currentTurn,
		myUserId,
		mission,
		connected,
		boardState,
		mapLayers,
		continents
	}: Props = $props();

	let position = $state({ x: 16, y: 16 });
	let drag = $state<{ id: number; x: number; y: number } | null>(null);
	let expanded = $state(false);
	let panelEl = $state<HTMLElement>();
	function clampPosition() {
		if (!panelEl) return;
		position = {
			x: Math.max(8, Math.min(innerWidth - panelEl.offsetWidth - 8, position.x)),
			y: Math.max(8, Math.min(innerHeight - panelEl.offsetHeight - 8, position.y))
		};
	}
	function startDrag(event: PointerEvent) {
		if ((event.target as HTMLElement).closest('button')) return;
		drag = { id: event.pointerId, x: event.clientX - position.x, y: event.clientY - position.y };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}
	function moveDrag(event: PointerEvent) {
		if (!drag || drag.id !== event.pointerId) return;
		position = { x: event.clientX - drag.x, y: event.clientY - drag.y };
		clampPosition();
	}
	function nudge(e: KeyboardEvent) {
		const d = e.shiftKey ? 24 : 8;
		if (e.key === 'ArrowLeft') position.x -= d;
		else if (e.key === 'ArrowRight') position.x += d;
		else if (e.key === 'ArrowUp') position.y -= d;
		else if (e.key === 'ArrowDown') position.y += d;
		else return;
		e.preventDefault();
		clampPosition();
	}
</script>

<aside bind:this={panelEl} class="game-float glass fixed z-30 w-[min(19rem,calc(100vw-1rem))] rounded-2xl p-3 shadow-2xl" style:left="{position.x}px" style:top="{position.y}px" aria-label="Informações da partida">
	<div role="toolbar" aria-label="Arrastar painel de jogadores; use as setas para reposicionar" tabindex="0" onkeydown={nudge} class="mb-2 flex cursor-move touch-none items-center justify-between border-b border-white/10 pb-2" onpointerdown={startDrag} onpointermove={moveDrag} onpointerup={() => drag = null} onpointercancel={() => drag = null}>
		<h2 class="text-xs font-bold uppercase tracking-wider text-gray-300">Jogadores · arraste</h2>
		<div class="flex items-center gap-2">
		<span
			class="h-2 w-2 rounded-full"
			class:bg-green-500={connected}
			class:bg-red-500={!connected}
			role="status"
			aria-label={connected ? 'Conectado ao servidor' : 'Desconectado do servidor'}
			title={connected ? 'Conectado ao servidor' : 'Desconectado do servidor'}
		></span>
		<button type="button" class="rounded px-2 text-xs text-gray-300 hover:bg-white/10" aria-expanded={expanded} onclick={() => expanded = !expanded}>{expanded ? 'Recolher' : 'Detalhes'}</button>
		</div>
	</div>
	<PlayerList {players} {currentTurn} {myUserId} />
	{#if expanded}<div class="mt-3 max-h-48 overflow-auto">
		<MissionDisplay {mission} {boardState} {myUserId} {players} {mapLayers} {continents} />
	</div>{/if}
</aside>

<svelte:window onresize={clampPosition} />
<style>.game-float { max-height: calc(100dvh - 1rem); overflow: auto; }</style>

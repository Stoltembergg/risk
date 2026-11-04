<script lang="ts">
	/**
	 * Responsive action panel that routes to the correct phase-specific action component
	 * (Cards, Deploy, Attack, Conquer, Reinforce) based on the current move interaction.
	 * Renders as a right-side panel on desktop (md+) and a collapsible bottom sheet on mobile.
	 */
	import type { CardState, ConquerPhaseState, GameState, Region } from '$lib/types/game';
	import type { MoveInteraction, createMoveState } from '$lib/state/move-state.svelte';
	import { onMount } from 'svelte';
	import DeployAction from './DeployAction.svelte';
	import AttackAction from './AttackAction.svelte';
	import ConquerAction from './ConquerAction.svelte';
	import ReinforceAction from './ReinforceAction.svelte';
	import CardsAction from './CardsAction.svelte';

	interface Props {
		interaction: MoveInteraction;
		gameState: GameState;
		cardState: CardState;
		regionMap: Map<string, Region>;
		deployableTroops: number;
		conquerState: ConquerPhaseState | null;
		myUserId: string | null;
		moveState: ReturnType<typeof createMoveState>;
		onNextBoardState: () => Promise<void>;
	}

	let {
		interaction,
		gameState,
		cardState,
		regionMap,
		deployableTroops,
		conquerState,
		myUserId,
		moveState,
		onNextBoardState
	}: Props = $props();

	let position = $state({ x: 16, y: 100 });
	let drag = $state<{ id: number; x: number; y: number } | null>(null);
	let panelEl = $state<HTMLElement>();
	onMount(() => {
		position = { x: Math.max(8, innerWidth - 328), y: 84 };
		clampPosition();
	});
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
		const delta = e.shiftKey ? 24 : 8;
		if (e.key === 'ArrowLeft') position.x -= delta;
		else if (e.key === 'ArrowRight') position.x += delta;
		else if (e.key === 'ArrowUp') position.y -= delta;
		else if (e.key === 'ArrowDown') position.y += delta;
		else return;
		e.preventDefault();
		clampPosition();
	}
	let visible = $state(true);
</script>

{#snippet actionContent()}
	{#if interaction.phase === 'deploy'}
		<DeployAction
			{regionMap}
			{deployableTroops}
			gameId={gameState.id}
			interaction={interaction as { phase: 'deploy'; regionId: string | null; troops: number }}
			{moveState}
		/>
	{:else if interaction.phase === 'attack'}
		<AttackAction
			{regionMap}
			{gameState}
			interaction={interaction as {
				phase: 'attack';
				sourceRegionId: string | null;
				targetRegionId: string | null;
				attackingTroops: number;
				blitzRequested: boolean;
			}}
			{moveState}
			{conquerState}
			{onNextBoardState}
		/>
	{:else if interaction.phase === 'conquer' && conquerState}
		<ConquerAction
			{regionMap}
			{conquerState}
			gameId={gameState.id}
			interaction={interaction as { phase: 'conquer'; troops: number }}
			{moveState}
		/>
	{:else if interaction.phase === 'reinforce'}
		<ReinforceAction
			{regionMap}
			{gameState}
			interaction={interaction as {
				phase: 'reinforce';
				sourceRegionId: string | null;
				targetRegionId: string | null;
				movingTroops: number;
			}}
			{moveState}
		/>
	{:else if interaction.phase === 'cards'}
		<CardsAction
			{cardState}
			{gameState}
			{regionMap}
			{myUserId}
			interaction={interaction as {
				phase: 'cards';
				selectedCardIds: number[];
				combinations: { cardIDs: number[] }[];
			}}
			{moveState}
		/>
{:else}
		<p class="text-sm text-gray-500">Aguardando…</p>
	{/if}
{/snippet}

{#if visible}
	<aside bind:this={panelEl} class="game-float glass fixed z-40 w-[min(19rem,calc(100vw-1rem))] rounded-2xl p-4 shadow-2xl" style:left="{position.x}px" style:top="{position.y}px" aria-label="Ações da rodada">
		<div role="toolbar" aria-label="Arrastar painel de ações; use as setas para reposicionar" tabindex="0" onkeydown={nudge} class="mb-3 flex cursor-move touch-none items-center justify-between border-b border-white/10 pb-2" onpointerdown={startDrag} onpointermove={moveDrag} onpointerup={() => drag = null} onpointercancel={() => drag = null}>
			<span class="text-xs font-bold uppercase tracking-[.16em] text-accent-light">Painel de ação · arraste</span>
			<button type="button" aria-label="Fechar painel" class="rounded px-2 text-gray-400 hover:bg-white/10" onclick={() => visible = false}>×</button>
		</div>
		{@render actionContent()}
	</aside>
{:else}
	<button type="button" class="glass fixed bottom-4 right-4 z-40 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl" onclick={() => visible = true}>Abrir ações</button>
{/if}

<svelte:window onresize={clampPosition} />

<style>
	.game-float { max-height: calc(100dvh - 1rem); overflow: auto; }
</style>

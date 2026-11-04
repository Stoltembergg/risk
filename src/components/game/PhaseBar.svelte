<script lang="ts">
	/**
	 * Horizontal phase timeline indicator showing the five game phases
	 * (Cards, Deploy, Attack, Conquer, Reinforce). The active phase is
	 * highlighted with accent color and a glow animation when it is the
	 * player's own turn; shown in accent-light when observing another player.
	 */
	import type { PhaseType } from '$lib/types/game';

	interface Props {
		currentPhase: PhaseType | null;
		isMyTurn: boolean;
	}

	let { currentPhase, isMyTurn }: Props = $props();

	const phases: { id: PhaseType; label: string; tooltip: string }[] = [
		{ id: 'cards', label: 'Cartas', tooltip: 'Troque conjuntos de cartas por tropas extras' },
		{ id: 'deploy', label: 'Reforçar', tooltip: 'Envie tropas aos seus territórios' },
		{ id: 'attack', label: 'Atacar', tooltip: 'Invada territórios inimigos vizinhos' },
		{ id: 'conquer', label: 'Conquistar', tooltip: 'Mova tropas para o território conquistado' },
		{ id: 'reinforce', label: 'Redistribuir', tooltip: 'Mova tropas entre seus territórios' }
	];
</script>

<div class="glass flex items-center gap-1 rounded-xl px-4 py-2">
	{#each phases as phase, i (phase.id)}
		{#if i > 0}
			<div class="mx-1 h-px w-4 bg-gray-600"></div>
		{/if}
		<div
			class="phase-node rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200"
			class:active={currentPhase === phase.id && isMyTurn}
			class:watching={currentPhase === phase.id && !isMyTurn}
			class:text-gray-500={currentPhase !== phase.id}
			class:scale-110={currentPhase === phase.id}
			data-testid="phase-{phase.id}"
			title={phase.tooltip}
		>
			{phase.label}
		</div>
	{/each}
</div>

<style>
	.phase-node.active {
		background-color: var(--color-accent);
		color: white;
		animation: phase-glow 2s ease-in-out infinite;
	}
	.phase-node.watching {
		color: var(--color-accent-light);
	}
	@keyframes phase-glow {
		0%,
		100% {
			box-shadow: 0 0 4px rgba(99, 102, 241, 0.4);
		}
		50% {
			box-shadow: 0 0 12px rgba(99, 102, 241, 0.7);
		}
	}
</style>

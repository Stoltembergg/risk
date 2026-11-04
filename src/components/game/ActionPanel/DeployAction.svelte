<script lang="ts">
	/**
	 * Deploy phase action panel. Lets the player select a region they own and choose
	 * how many of their available troops to place there. Sends a deploy API call with
	 * the current troop count as an optimistic concurrency guard.
	 */
	import type { Region } from '$lib/types/game';
	import type { createMoveState } from '$lib/state/move-state.svelte';
	import { deploy } from '$lib/api/moves';
	import { playDeploy } from '$lib/audio/audio.svelte';
	import { useAction } from '$lib/state/use-action.svelte';
	import { formatRegionName } from '$lib/utils/format';

	interface Props {
		regionMap: Map<string, Region>;
		deployableTroops: number;
		gameId: number;
		interaction: { phase: 'deploy'; regionId: string | null; troops: number };
		moveState: ReturnType<typeof createMoveState>;
	}

	let { regionMap, deployableTroops, gameId, interaction, moveState }: Props = $props();

	const selectedRegion = $derived(
		interaction.regionId ? regionMap.get(interaction.regionId) : null
	);
	const currentTroops = $derived(selectedRegion?.troops ?? 0);

	const action = useAction();

	/**
	 * Sends the deploy move to the server. Passes both currentTroops and
	 * desiredTroops (current + slider value) so the backend can validate
	 * that the region hasn't changed since the player's view. Resets
	 * selection on success.
	 */
	async function handleDeploy() {
		if (!interaction.regionId || interaction.troops === 0) return;
		await action.run(async () => {
			await deploy(gameId, {
				regionId: interaction.regionId!,
				currentTroops: currentTroops,
				desiredTroops: currentTroops + interaction.troops
			});
			playDeploy();
			moveState.setDeployTroops(0);
			moveState.setDeployRegion('');
		}, 'Falha ao enviar tropas. Tente novamente.');
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-bold uppercase tracking-wider text-gray-400">Reforços</h3>

	<div class="rounded-lg bg-surface-700/50 px-3 py-2 text-center">
		<div class="text-2xl font-bold text-accent-light">{deployableTroops}</div>
		<div class="text-xs text-gray-400">tropas disponíveis</div>
	</div>

	{#if selectedRegion && interaction.regionId}
		<div class="space-y-3">
			<div class="text-sm">
				<span class="text-gray-400">Território:</span>
				<span class="font-semibold">{formatRegionName(interaction.regionId)}</span>
			</div>
			<div class="text-sm">
				<span class="text-gray-400">Tropas atuais:</span>
				<span class="font-semibold">{currentTroops}</span>
			</div>

			<div class="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-2" aria-label="Quantidade de tropas">
				<button type="button" aria-label="Remover uma tropa" onclick={() => moveState.setDeployTroops(Math.max(0, interaction.troops - 1))} disabled={interaction.troops <= 0} class="h-11 w-11 rounded-lg bg-surface-600 text-2xl hover:bg-surface-500 disabled:opacity-40">−</button>
				<div class="text-center"><div class="text-3xl font-bold tabular-nums text-accent-light">{interaction.troops}</div><div class="text-xs text-gray-400">tropas para enviar</div></div>
				<button type="button" aria-label="Adicionar uma tropa" onclick={() => moveState.setDeployTroops(Math.min(deployableTroops, interaction.troops + 1))} disabled={interaction.troops >= deployableTroops} class="h-11 w-11 rounded-lg bg-accent text-2xl hover:bg-accent-light disabled:opacity-40">+</button>
			</div>

			{#if action.error}
				<div class="text-xs text-red-400">{action.error}</div>
			{/if}

			<button
				onclick={handleDeploy}
				disabled={action.submitting || interaction.troops === 0}
				data-testid="deploy-btn"
				class="w-full cursor-pointer rounded-lg bg-accent py-2 text-sm font-semibold transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
			>
				{action.submitting ? 'Enviando…' : `Enviar ${interaction.troops} ${interaction.troops === 1 ? 'tropa' : 'tropas'}`}
			</button>
		</div>
	{:else}
		<p class="text-sm text-gray-500">Clique em um território seu para posicionar tropas.</p>
	{/if}
</div>

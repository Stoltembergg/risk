<script lang="ts">
	/** Nickname-based temporary session entry. */
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { inviteHome } from '$lib/invite';
	import { getAuth } from '$lib/state/auth.svelte';

	const auth = getAuth();

	let name = $state('');
	let error = $state('');
	let submitting = $state(false);

	// Already authenticated users get redirected to home
	$effect(() => {
		if (!auth.loading && auth.isAuthenticated) {
			goto(inviteHome(page.url.searchParams));
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		submitting = true;
		try {
			await auth.signIn(name);
		} catch {
			error = 'Não foi possível entrar. Confira o apelido e tente novamente.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex min-h-dvh items-center justify-center">
	<div class="glass w-full max-w-sm rounded-2xl p-8">
		<h1 class="mb-2 text-center text-2xl font-bold">Entre na mesa</h1>
		<p class="mb-6 text-center text-sm text-gray-400">Escolha um apelido para jogar Risk.</p>

		{#if error}
			<div
				data-testid="signin-error"
				class="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400"
			>
				{error}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="name" class="mb-1 block text-sm text-gray-400">Apelido</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					minlength="1"
					maxlength="32"
					autocomplete="nickname"
					class="w-full rounded-lg bg-surface-700 px-4 py-2.5 text-gray-100 outline-none transition-colors focus:ring-2 focus:ring-accent"
					placeholder="Como quer ser chamado na mesa"
				/>
			</div>
			<button
				type="submit"
				disabled={submitting}
				data-testid="signin-submit"
				class="w-full cursor-pointer rounded-lg bg-accent py-2.5 font-semibold transition-colors hover:bg-accent-light disabled:opacity-50"
			>
				{submitting ? 'Entrando…' : 'Entrar na partida'}
			</button>
		</form>

	</div>
</div>

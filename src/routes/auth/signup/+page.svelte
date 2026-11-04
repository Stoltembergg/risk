<script lang="ts">
	/** Keep old sign-up links pointed at nickname entry. */
	import { onMount } from 'svelte';
	onMount(() => { window.location.replace('/auth/signin'); });
</script>

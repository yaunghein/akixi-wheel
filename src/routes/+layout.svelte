<script lang="ts">
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-french-toast';
	import { detectSWUpdate } from '$lib/utils/sw';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		detectSWUpdate();
	});
</script>

{@render children()}

<Toaster />

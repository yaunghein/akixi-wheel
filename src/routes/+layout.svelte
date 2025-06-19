<script lang="ts">
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-french-toast';
	import { detectSWUpdate } from '$lib/utils/sw';
	import { getAudioState, setAudioState } from '$lib/states/audio.svelte';
	import '../app.css';

	let { children } = $props();

	setAudioState({
		click: '/sounds/click2.mp3',
		background: '/sounds/background2.mp3'
	});

	onMount(() => {
		detectSWUpdate();
		getAudioState().load();
	});
</script>

{@render children()}

<Toaster />

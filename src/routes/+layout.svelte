<script lang="ts">
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-french-toast';
	import { toast } from '$lib/utils/toast';
	import { detectSWUpdate } from '$lib/utils/sw';
	import { getAudioState, setAudioState } from '$lib/states/audio.svelte';
	import { setGameState, getGameState } from '$lib/states/game.svelte';

	import '../app.css';

	let { children } = $props();

	setAudioState();
	setGameState();

	const gameState = getGameState();
	const audioState = getAudioState();

	const handleOnline = () => {
		gameState.isOnline = true;
		toast.success('Back online!');
	};

	const handleOffline = () => {
		gameState.isOnline = false;
		toast.error('Offline! Data will be saved locally.');
	};

	onMount(() => {
		detectSWUpdate();
		audioState.load({
			click: '/sounds/click2.mp3',
			background: '/sounds/background2.mp3',
			type: '/sounds/ios-type.mp3',
			spin: '/sounds/spinning2.mp3',
			landed: '/sounds/landed.mp3',
			question: '/sounds/question.mp3',
			right: '/sounds/right-answer.wav',
			wrong: '/sounds/wrong-answer.mp3',
			hardluck: '/sounds/hard-luck.mp3',
			congratulations: '/sounds/congratulations.mp3'
		});

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.addEventListener('message', (event) => {
				if (event.data?.type === 'sync-complete') {
					toast.success('Offline results successfully synced!');
				}
			});
		}

		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});
</script>

{@render children()}

<Toaster />

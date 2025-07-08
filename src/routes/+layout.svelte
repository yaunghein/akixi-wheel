<script lang="ts">
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-french-toast';
	import { toast } from '$lib/utils/toast';
	import { detectSWUpdate } from '$lib/utils/sw';
	import { getAudioState, setAudioState } from '$lib/states/audio.svelte';
	import { setGameState, getGameState } from '$lib/states/game.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import AudioController from '$lib/components/AudioController.svelte';
	import BackButton from '$lib/components/BackButton.svelte';

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

<main
	class="bg-electric-indigo flex min-h-screen items-center justify-center overflow-hidden text-white transition-colors duration-500"
>
	<video autoplay muted loop playsinline class="absolute inset-0 h-full w-full object-cover">
		<source src="/videos/background-2k-slow.mp4" type="video/mp4" />
		<track kind="captions" />
	</video>
	<div class="relative flex aspect-[4/7] w-full flex-col overflow-hidden pt-[13rem]">
		<div class="relative mx-auto mb-auto aspect-[1/0.27] w-[40.5rem]">
			<Logo />
		</div>
		{@render children()}
	</div>

	{#if gameState.showBackButton}
		<button
			onmouseup={() => {
				audioState.play('click');
				gameState.move(-1);
			}}
			class="absolute top-8 right-8 aspect-[1/0.96] w-[7rem] cursor-pointer transition-transform active:scale-90"
		>
			<BackButton />
		</button>
	{/if}
</main>

<AudioController />
<Toaster />

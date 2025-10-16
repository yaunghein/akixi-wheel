<script lang="ts">
	import { useQuery } from '@sanity/svelte-loader';
	import { eventQuery } from '$lib/queries';
	import { getAudioState } from '$lib/states/audio.svelte';
	import { getGameState } from '$lib/states/game.svelte';
	import { GAME_STATES_ENUM } from '$lib/states/game.svelte';
	import StateWheel from '$lib/components/StateWheel.svelte';
	import StateForm from '$lib/components/StateForm.svelte';
	import StateLanded from '$lib/components/StateLanded.svelte';
	import StateQuiz from '$lib/components/StateQuiz.svelte';
	import StateResult from '$lib/components/StateResult.svelte';
	import StateFinal from '$lib/components/StateFinal.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import AudioController from '$lib/components/AudioController.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import StateQRLink from '$lib/components/StateQRLink.svelte';

	let { data } = $props();

	let { initial } = data;
	const query = useQuery<any>(eventQuery, {}, { initial });
	console.log(query);
	

	const audioState = getAudioState();
	const gameState = getGameState();

	const RESULT_TO_FINAL_DELAY = 2000;

	$effect(() => {
		switch (gameState.current) {
			case GAME_STATES_ENUM.LANDED:
				audioState.play('landed');
				break;
			case GAME_STATES_ENUM.QUIZ:
				audioState.play('question', { loop: true });
				break;
			case GAME_STATES_ENUM.RESULT:
				gameState.isCorrect ? audioState.play('right') : audioState.play('wrong');
				setTimeout(() => (gameState.current = GAME_STATES_ENUM.FINAL), RESULT_TO_FINAL_DELAY);
				break;
			case GAME_STATES_ENUM.FINAL:
				if (gameState.isCorrect) {
					audioState.play('congratulations');
					// @tss-expect-error: no types for canvas-confetti
					// import('canvas-confetti').then((module) => {
					// 	const confetti = module.default;
					// 	confetti({
					// 		particleCount: 120,
					// 		spread: 90,
					// 		origin: { y: 0.6 },
					// 		colors: ['#2fffa3', '#2fd6ff', '#3b82f6', '#fff']
					// 	});
					// });
					if (gameState.confettiVideo) {
						gameState.confettiVideo.style.opacity = '1';
						gameState.confettiVideo.play();
					}
				} else {
					audioState.play('hardluck');
				}
				break;
		}
	});
</script>

<main
	class="bg-electric-indigo flex min-h-screen items-center justify-center overflow-hidden text-white transition-colors duration-500"
>
	<video autoplay muted loop playsinline class="absolute inset-0 h-full w-full object-cover">
		<source src={$query.data.bgVideo.url} type="video/mp4" />
		<track kind="captions" />
	</video>
	<div class="relative flex aspect-[4/7] w-full flex-col overflow-hidden pt-[1rem]">
		<img
			src={$query.data.logo.url}
			alt=""
			class="relative mx-auto mb-auto w-[40.5rem]"
			style="aspect-ratio: {$query.data.logo.ratio}/1"
		/>

		{#if gameState.showWheel}
			<StateWheel data={$query.data} />
		{:else if gameState.showForm}
			<!-- <StateForm /> -->
			 <StateQRLink />
		{:else if gameState.showLanded}
			<StateLanded />
		{:else if gameState.showQuiz}
			<StateQuiz />
		{:else if gameState.showResult}
			<StateResult />
		{:else if gameState.showFinal}
			<StateFinal data={$query.data} />
		{/if}
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

<script lang="ts">
	import { useQuery } from '@sanity/svelte-loader';
	import { wheelQuery } from '$lib/queries';
	import { getAudioState } from '$lib/states/audio.svelte';
	import { getGameState } from '$lib/states/game.svelte';
	import { GAME_STATES_ENUM } from '$lib/states/game.svelte';
	import StateWheel from '$lib/components/StateWheel.svelte';
	import StateForm from '$lib/components/StateForm.svelte';
	import StateLanded from '$lib/components/StateLanded.svelte';
	import StateQuiz from '$lib/components/StateQuiz.svelte';
	import StateResult from '$lib/components/StateResult.svelte';
	import StateFinal from '$lib/components/StateFinal.svelte';

	let { data } = $props();

	let { initial } = data;
	const query = useQuery<any>(wheelQuery, {}, { initial });

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

{#if gameState.showWheel}
	<StateWheel data={$query.data} />
{:else if gameState.showForm}
	<StateForm />
{:else if gameState.showLanded}
	<StateLanded />
{:else if gameState.showQuiz}
	<StateQuiz />
{:else if gameState.showResult}
	<StateResult />
{:else if gameState.showFinal}
	<StateFinal />
{/if}

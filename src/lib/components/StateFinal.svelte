<script lang="ts">
	import { getAudioState } from '$lib/states/audio.svelte';
	import { GAME_STATES_ENUM, getGameState, initialFormInputs } from '$lib/states/game.svelte';
	import { bounceOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import { toast } from '$lib/utils/toast';
	import lottie from 'lottie-web';

	const audioState = getAudioState();
	const gameState = getGameState();

	const handleUserResult = () => {
		const data = {
			first_name: gameState.formInputs.first_name,
			last_name: gameState.formInputs.last_name,
			email: gameState.formInputs.email,
			segment: gameState.winSegment ?? null,
			answer: gameState.selectedAnswer,
			correct: gameState.isCorrect,
			timestamp: new Date().toISOString()
		};
		if (gameState.isOnline) {
			// For now, just log. Replace with API call if needed.
			console.log('User result submitted:', data);
			toast.success('Result saved successfully!');
		} else {
			// Save to localStorage for later processing
			const storedResults = localStorage.getItem('userResults');
			let results = [];
			if (storedResults) {
				try {
					results = JSON.parse(storedResults);
				} catch (e) {
					console.error('Error parsing userResults:', e);
					toast.error('Failed to save result offline');
					return;
				}
			}
			results.push(data);
			localStorage.setItem('userResults', JSON.stringify(results));
			toast.success('Result saved offline.');
		}
	};

	const lottiePlayer = (node: HTMLDivElement, path: string) => {
		const player = lottie.loadAnimation({
			container: node,
			renderer: 'svg',
			loop: true,
			autoplay: true,
			path
		});
	};
</script>

{#if gameState.isCorrect}
	<div class="relative my-auto text-center leading-none">
		<div class="font-apertura-black text-aquamarineo text-shadow-small text-[10.08rem]">
			Congratulations!
		</div>
		<div
			class="text-aquamarineo text-shadow-small mx-auto mt-10 max-w-[55rem] text-[9.93rem] leading-[1]"
		>
			Collect your prize
		</div>
	</div>
	<div class="relative mb-auto flex -translate-y-[15rem] items-center justify-center">
		<button
			in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
			out:scale={{ duration: 300, start: 1.05 }}
			onclick={() => {
				audioState.play('click');
				handleUserResult();
				gameState.formInputs = initialFormInputs;
				gameState.selectedAnswer = null;
				gameState.isCorrect = false;
				gameState.winSegment = null;
				gameState.current = GAME_STATES_ENUM.START;
			}}
			class="font-apertura-black bg-vivid-sky cursor-pointer rounded-[2.29rem] px-48 py-12 text-[6.11rem] leading-none text-[#23475F] transition-transform active:scale-90"
		>
			<span class="inline-block translate-y-1">Start over</span>
		</button>
	</div>
{:else}
	<div class="relative mb-auto text-center leading-none">
		<div
			use:lottiePlayer={'/lotties/hard-luck.json'}
			class="mx-auto mb-20 aspect-square w-[30.09rem] shrink-0"
		></div>
		<div class="font-apertura-black text-aquamarineo text-shadow-small text-[10.08rem]">
			Hard luck
		</div>
		<div
			class="text-aquamarineo text-shadow-small mx-auto mt-10 max-w-[55rem] text-[9.93rem] leading-[1]"
		>
			Please try again
		</div>
	</div>
	<div class="relative mb-auto flex flex-col items-center justify-center gap-10">
		<div class="w-[56rem]">
			<button
				in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
				out:scale={{ duration: 300, start: 1.05 }}
				onclick={() => {
					audioState.play('click');
					handleUserResult();
					gameState.formInputs = initialFormInputs;
					gameState.selectedAnswer = null;
					gameState.isCorrect = false;
					gameState.winSegment = null;
					gameState.current = GAME_STATES_ENUM.START;
				}}
				class="font-apertura-black bg-vivid-sky w-full cursor-pointer rounded-[2.29rem] py-12 text-[6.11rem] leading-none text-[#23475F] transition-transform active:scale-90"
			>
				<span class="inline-block translate-y-1">Start over</span>
			</button>
		</div>

		<div class="w-[56rem]">
			<button
				in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
				out:scale={{ duration: 300, start: 1.05 }}
				onclick={() => {
					audioState.play('click');
					gameState.selectedAnswer = null;
					gameState.isCorrect = false;
					gameState.winSegment = null;
					gameState.current = GAME_STATES_ENUM.SPIN;
				}}
				class="font-apertura-black bg-vivid-sky w-full cursor-pointer rounded-[2.29rem] py-12 text-[6.11rem] leading-none text-[#23475F] transition-transform active:scale-90"
			>
				<span class="inline-block translate-y-1">Spin Again</span>
			</button>
		</div>

		<div class="w-[56rem]">
			<button
				in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
				out:scale={{ duration: 300, start: 1.05 }}
				onclick={() => {
					audioState.play('click');
					gameState.selectedAnswer = null;
					gameState.isCorrect = false;
					gameState.current = GAME_STATES_ENUM.QUIZ;
				}}
				class="font-apertura-black bg-vivid-sky w-full cursor-pointer rounded-[2.29rem] py-12 text-[6.11rem] leading-none text-[#23475F] transition-transform active:scale-90"
			>
				<span class="inline-block translate-y-1">Answer Again</span>
			</button>
		</div>
	</div>
{/if}

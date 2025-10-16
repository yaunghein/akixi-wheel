<script lang="ts">
	import { getAudioState } from '$lib/states/audio.svelte';
	import { GAME_STATES_ENUM, getGameState } from '$lib/states/game.svelte';
	import TextSplit from '$lib/components/TextSplit.svelte';

	const audioState = getAudioState();
	const gameState = getGameState();

	const selectAnswer = (answer: 'A' | 'B' | 'C') => {
		gameState.selectedAnswer = answer;
		if (gameState.winSegment && gameState.winSegment.question) {
			gameState.isCorrect = gameState.winSegment.question.correct === answer;
		}
		gameState.current = GAME_STATES_ENUM.RESULT;
	};
</script>

{#if gameState.winSegment}
	<div class="relative mt-32 flex h-full w-full flex-col items-center text-center text-[7.33rem]">
		<TextSplit text={gameState.winSegment.text} />
		<p
			class="text-shadow-small font-apertura-medium mx-auto mt-28 max-w-[80rem] text-center text-[4rem] leading-[1.2]"
		>
			{gameState.winSegment.question.text}
		</p>
		<div class="mt-40 flex w-full max-w-[80rem] flex-col gap-20">
			{#each gameState.winSegment.question.choices as choice, i}
				<div class="flex items-center gap-16">
					<!-- <span
						class="font-apertura-black text-shadow-small text-[12.98rem] leading-none"
						style="color: {i === 0 ? '#22f4ad' : i === 1 ? '#eeeeee' : '#1cd2fa'}"
					>
						{String.fromCharCode(65 + i)}
					</span> -->
					<button
					class="shadow-box relative aspect-square basic-[15.28rem] grow-0 shrink-0 w-[15.28rem] rounded-[2.29rem] transition-transform active:scale-90"
					style="background: {i === 0 ? '#22f4ad' : i === 1 ? '#4450ff' : '#1cd2fa'}"
					onmouseup={() => {
						audioState.play('click');
						selectAnswer(String.fromCharCode(65 + i) as 'A' | 'B' | 'C');
					}}
				>
					<span
						class="font-apertura-black inline-block translate-y-5 text-[12.98rem] leading-none {String.fromCharCode(
							65 + i
						) === 'C'
							// ? '-translate-x-2'
							? ''
							: ''}"
					>
						{String.fromCharCode(65 + i)}
					</span>
				</button>
					<span
						class="text-shadow-small font-apertura-medium -translate-y-4 text-left text-[4rem] leading-[1.2]"
					>
						{choice}
					</span>
				</div>
			{/each}
		</div>
		<!-- <p class="text-shadow-small font-apertura-medium mt-52 text-[4.43rem] leading-none">
			Select your answer below
		</p> -->
		<!-- <div class="mt-20 flex gap-[16rem]">
			{#each gameState.winSegment.question.choices as _, i}
				<button
					class="shadow-box relative aspect-square w-[15.28rem] rounded-[2.29rem] transition-transform active:scale-90"
					style="background: {i === 0 ? '#22f4ad' : i === 1 ? '#4450ff' : '#1cd2fa'}"
					onmouseup={() => {
						audioState.play('click');
						selectAnswer(String.fromCharCode(65 + i) as 'A' | 'B' | 'C');
					}}
				>
					<span
						class="font-apertura-black inline-block translate-y-5 text-[12.98rem] leading-none {String.fromCharCode(
							65 + i
						) === 'C'
							? '-translate-x-2'
							: ''}"
					>
						{String.fromCharCode(65 + i)}
					</span>
				</button>
			{/each}
		</div> -->
	</div>
{/if}

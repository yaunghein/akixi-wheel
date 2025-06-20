<script lang="ts">
	import { getAudioState } from '$lib/states/audio.svelte';
	import { getGameState } from '$lib/states/game.svelte';
	import TextSplit from '$lib/components/TextSplit.svelte';

	const audioState = getAudioState();
	const gameState = getGameState();
</script>

{#if gameState.winSegment && gameState.selectedAnswer}
	<div class="relative mt-32 flex h-full w-full flex-col items-center text-center text-[7.33rem]">
		<TextSplit text={gameState.winSegment.text} />
		<div class="mt-36 flex flex-col items-center">
			<div
				class="shadow-box relative grid aspect-square w-[15.28rem] place-items-center rounded-[2.29rem] text-white"
				style="background: {gameState.selectedAnswer === 'A'
					? '#22f4ad'
					: gameState.selectedAnswer === 'B'
						? '#4450ff'
						: '#1cd2fa'}"
			>
				<span
					class="font-apertura-black inline-block translate-y-5 text-[12.98rem] leading-none {gameState.selectedAnswer ===
					'C'
						? '-translate-x-1'
						: ''}"
				>
					{gameState.selectedAnswer}
				</span>
			</div>
			{#if gameState.isCorrect}
				<div
					class="font-apertura-black text-shadow-small text-vivid-sky mt-32 text-[15rem] leading-none"
				>
					Correct!
				</div>
			{:else}
				<div
					class="font-apertura-black text-shadow-small text-tomato mt-32 text-[15rem] leading-none"
				>
					Wrong!
				</div>
			{/if}
		</div>
		{#if gameState.winSegment.question.explanation}
			<p class="mx-auto mt-20 max-w-[70rem] text-center text-[4.58rem] leading-[1.2]">
				{gameState.winSegment.question.explanation}
			</p>
		{/if}
	</div>
{/if}

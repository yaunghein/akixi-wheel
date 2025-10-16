<script lang="ts">
	import { GAME_STATES_ENUM, getGameState } from '$lib/states/game.svelte';
	import { getAudioState } from '$lib/states/audio.svelte';
	import TextSplit from '$lib/components/TextSplit.svelte';
	import { scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';

	const gameState = getGameState();
	const audioState = getAudioState();
</script>

{#if gameState.winSegment}
	<div class="relative my-auto text-center text-[7.33rem] leading-none">
		<div class="font-apertura-black mb-2">You landed on</div>
		<TextSplit text={gameState.winSegment.text} />
	</div>
	<div class="relative my-auto flex -translate-y-[15rem] items-center justify-center">
		<button
			in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
			out:scale={{ duration: 300, start: 1.05 }}
			onclick={() => {
				audioState.play('click');
				gameState.current = GAME_STATES_ENUM.QUIZ;
			}}
			class="font-apertura-black bg-vivid-sky cursor-pointer rounded-[2.29rem] px-48 py-12 text-[6.11rem] leading-none text-[#23475F] transition-transform active:scale-90"
		>
			<span class="inline-block translate-y-1">Continue</span>
		</button>
	</div>
	<div class="h-2/5"></div>
{/if}

<script lang="ts">
	import { getAudioState } from '$lib/states/audio.svelte';
	import { GAME_STATES_ENUM, getGameState, type TFormField } from '$lib/states/game.svelte';
	import { scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
    import TextSpinAndWin from '$lib/components/TextSpinAndWin.svelte';
   
	const audioState = getAudioState();
	const gameState = getGameState();
	
	let isChecked = false;
</script>

<div class="relative flex h-full w-full flex-col">
	<div class="mt-20 flex justify-center">
		<TextSpinAndWin />
	</div>
	<div class="relative flex h-full w-full flex-col gap-8 p-8 overflow-y-auto">
		<img src="/images/qr-code.svg" alt="QR Code" class="mx-auto my-8 w-2/5 aspect-square" />
		<p class="mx-auto mt-8 max-w-[70rem] text-center text-[4.58rem] leading-[1.2]">
			<span class="[text-shadow:0px_3px_4px_black]">I have summited my details</span> <input type="checkbox" name="qr-checkbox" class="mx-2 w-20 h-20" bind:checked={isChecked} />
		</p>
		<button
			in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
			out:scale={{ duration: 300, start: 1.05 }}
			onclick={() => {
				audioState.play('click');
				
				if (isChecked) {
					gameState.current = GAME_STATES_ENUM.SPIN;
				}
			}}
			class="font-apertura-black cursor-pointer rounded-[2.29rem] w-1/2 mx-auto py-12 text-[6.11rem] leading-none transition-transform active:scale-90 mt-25"
			class:bg-vivid-sky={isChecked}
			class:text-[#23475F]={isChecked}
			class:bg-[#646464]={!isChecked}
			class:text-white={!isChecked}
		>
			<span class="inline-block translate-y-1" class:text-[#515151]={!isChecked} class:text-[#23475F]={isChecked}>Play</span>
		</button>
	</div>
</div>

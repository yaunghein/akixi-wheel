<script lang="ts">
	import { getAudioState } from '$lib/states/audio.svelte';
	import { GAME_STATES_ENUM, getGameState, type TFormField } from '$lib/states/game.svelte';
	import { scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
    import TextSpinAndWin from '$lib/components/TextSpinAndWin.svelte';
   
	const audioState = getAudioState();
	const gameState = getGameState();
</script>

<div class="relative flex h-full w-full flex-col">
	<div class="mt-20 flex justify-center">
		<TextSpinAndWin />
	</div>
	<div class="relative flex h-full w-full flex-col gap-8 p-8 overflow-y-auto">
		<img src="/images/qr-code.png" alt="QR Code" class="mx-auto my-8 w-4/5 aspect-square" />
		<p class="mx-auto mt-20 max-w-[70rem] text-center text-[4.58rem] leading-[1.2]">
			I have summited my details <input type="checkbox" name="qr-checkbox" class="mx-2 w-20 h-20" />
		</p>
		<button
			in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
			out:scale={{ duration: 300, start: 1.05 }}
			onclick={() => {
				audioState.play('click');
                
                const checkbox = document.querySelector('input[name="qr-checkbox"]') as HTMLInputElement;   
                if (checkbox.checked) {
					gameState.current = GAME_STATES_ENUM.SPIN;
				}
			}}
			class="font-apertura-black bg-vivid-sky cursor-pointer rounded-[2.29rem] w-3/5 mx-auto py-12 text-[6.11rem] leading-none text-[#23475F] transition-transform active:scale-90"
		>
			<span class="inline-block translate-y-1">Play</span>
		</button>
	</div>
</div>

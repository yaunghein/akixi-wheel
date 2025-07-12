<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
	import { GAME_STATES_ENUM, getGameState } from '$lib/states/game.svelte';
	import { getAudioState } from '$lib/states/audio.svelte';

	const audioState = getAudioState();
	const gameState = getGameState();

	let showControllerPopup = $state(false);

	const handlePopupClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.classList.contains('volume-popup-overlay')) {
			showControllerPopup = false;
			audioState.play('click');
		}
	};

	const handlePopupKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			showControllerPopup = false;
			audioState.play('click');
		}
	};

	onMount(() => {
		window.addEventListener('keydown', (e) => {
			if (e.shiftKey && e.key.toLowerCase() === 's') {
				showControllerPopup = !showControllerPopup;
				audioState.play('click');
			}
		});
	});
</script>

{#if gameState.showBackgroundSoundToggle}
	<button
		onmouseup={() => {
			audioState.play('click');
			audioState.toggleBackground();
		}}
		class="absolute top-16 right-16 z-50 w-[3.5rem] cursor-pointer border-none transition-transform focus:outline-none"
	>
		{#if audioState.isBackgroundPlaying}
			<img src="/images/sound-on.svg" alt="" />
		{:else}
			<img src="/images/sound-off.svg" alt="" />
		{/if}
	</button>
{/if}

{#if showControllerPopup}
	<div
		transition:fade={{ duration: 300 }}
		class="volume-popup-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-white"
		onclick={handlePopupClick}
		onkeydown={handlePopupKeydown}
		role="button"
		tabindex="0"
	>
		<div
			in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
			out:scale={{ duration: 300, start: 1.05 }}
			class="bg-electric-indigo shadow-box relative mx-auto w-full max-w-[73.5rem] rounded-[2.29rem] p-20"
		>
			<div class="text-shadow-small font-apertura-black text-center text-[7.33rem] leading-none">
				Volume Controls
			</div>
			<div class="mt-20 flex flex-col">
				<div class="flex flex-col gap-12">
					<div class="flex flex-col gap-8">
						<div class="flex items-center justify-between">
							<label
								for="backgroundVolume"
								class="text-shadow-small font-apertura-medium text-[4.43rem] leading-none"
							>
								Background Sound
							</label>
							<span class="text-shadow-small font-apertura-medium text-[4.43rem] leading-none">
								{audioState.volumes.background}
							</span>
						</div>
						<input
							id="backgroundVolume"
							type="range"
							min="0.0001"
							max="1"
							step="0.001"
							bind:value={audioState.volumes.background}
							class="[&::-webkit-slider-thumb]:bg-electric-indigo my-8 h-[4.12rem] w-full appearance-none rounded-[0.75rem] bg-[#D9D9D9] [&::-webkit-slider-thumb]:my-auto [&::-webkit-slider-thumb]:h-[4.12rem] [&::-webkit-slider-thumb]:w-[4.12rem] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-2xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D9D9D9]"
						/>
					</div>
					<div class="flex flex-col gap-8">
						<div class="flex items-center justify-between">
							<label
								for="spinVolume"
								class="text-shadow-small font-apertura-medium text-[4.43rem] leading-none"
							>
								Spin Sound
							</label>
							<span class="text-shadow-small font-apertura-medium text-[4.43rem] leading-none">
								{audioState.volumes.spin}
							</span>
						</div>
						<input
							id="spinVolume"
							type="range"
							min="0.0001"
							max="1"
							step="0.001"
							bind:value={audioState.volumes.spin}
							class="[&::-webkit-slider-thumb]:bg-electric-indigo my-8 h-[4.12rem] w-full appearance-none rounded-[0.75rem] bg-[#D9D9D9] [&::-webkit-slider-thumb]:my-auto [&::-webkit-slider-thumb]:h-[4.12rem] [&::-webkit-slider-thumb]:w-[4.12rem] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-2xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D9D9D9]"
						/>
					</div>
					<div class="flex flex-col gap-8">
						<div class="flex items-center justify-between">
							<label
								for="otherVolume"
								class="text-shadow-small font-apertura-medium text-[4.43rem] leading-none"
							>
								Other Sounds
							</label>
							<span class="text-shadow-small font-apertura-medium text-[4.43rem] leading-none">
								{audioState.volumes.others}
							</span>
						</div>
						<input
							id="otherVolume"
							type="range"
							min="0.0001"
							max="1"
							step="0.001"
							bind:value={audioState.volumes.others}
							class="[&::-webkit-slider-thumb]:bg-electric-indigo my-8 h-[4.12rem] w-full appearance-none rounded-[0.75rem] bg-[#D9D9D9] [&::-webkit-slider-thumb]:my-auto [&::-webkit-slider-thumb]:h-[4.12rem] [&::-webkit-slider-thumb]:w-[4.12rem] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-2xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D9D9D9]"
						/>
					</div>
				</div>
			</div>

			<div class="mx-auto my-20 h-[1px] w-1/2 bg-white/20"></div>

			<div
				class="text-shadow-small font-apertura-black mt-[5.5rem] text-center text-[7.33rem] leading-none"
			>
				General Settings
			</div>

			<div class="mt-20 flex flex-col gap-12">
				<div class="flex items-center justify-between">
					<div class="text-shadow-small font-apertura-medium text-[4.43rem] leading-none">
						Start from Spin
					</div>

					<button
						onclick={() => {
							audioState.play('click');

							if (gameState.current === GAME_STATES_ENUM.START) {
								gameState.startState = GAME_STATES_ENUM.SPIN;
								gameState.current = GAME_STATES_ENUM.SPIN;
							} else {
								gameState.startState = GAME_STATES_ENUM.START;
								gameState.current = GAME_STATES_ENUM.START;
							}
						}}
						class="relative h-[5rem] w-[10rem] rounded-full bg-[#D9D9D9]"
					>
						<span class="sr-only">Start from Spin</span>
						<div
							class="absolute top-1/2 h-[4rem] w-[4rem] -translate-y-1/2 rounded-full transition-all {gameState.startState ===
							GAME_STATES_ENUM.START
								? 'left-[0.5rem] bg-[#b1b1b1]'
								: 'bg-electric-indigo left-[5.5rem]'}"
						></div>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

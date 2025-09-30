<script lang="ts">
	import { getGameState } from '$lib/states/game.svelte';
	import { getAudioState } from '$lib/states/audio.svelte';
	import TextSpinAndWin from '$lib/components/TextSpinAndWin.svelte';
	import WheelBackgroundWithDots from '$lib/components/WheelBackgroundWithDots.svelte';
	import Indicator from '$lib/components/Indicator.svelte';
	import Wheel from '$lib/components/Wheel.svelte';

	export let data: any;

	const gameState = getGameState();
	const audioState = getAudioState();
</script>

<div class="relative flex h-full flex-col items-center text-center">
	<div class="mt-[7.5rem] mb-24 max-w-[65rem] text-[5.34rem] leading-none">
		{data.tagline}
	</div>
	<!-- <TextSpinAndWin /> -->
	<img
		src={data.headerImage.url}
		alt=""
		class="relative mx-auto -mb-16 w-[73.5rem] drop-shadow-2xl"
		style="aspect-ratio: {data.headerImage.ratio}/1"
	/>
	<div class="my-auto w-full">
		<div class="relative p-[0.65rem] sm:p-[2rem]">
			<img
				src="/images/wheel-bg.png"
				alt=""
				class="pointer-events-none absolute inset-0 aspect-square w-full -translate-y-[4.5rem] scale-[0.98] opacity-[0.6] sm:-translate-y-[3.3rem] sm:scale-[0.99]"
			/>
			<div
				class="pointer-events-none absolute inset-0 h-full w-full"
				style="transform: rotate({(gameState.rotation * 180) / Math.PI + 26.2}deg);"
			>
				<WheelBackgroundWithDots />
			</div>
			<div class="w-full">
				<Wheel segments={data.segments} />
			</div>
			<div
				class="pointer-events-none absolute -top-[1.85rem] left-1/2 aspect-[1/0.91] w-[9.93rem] -translate-x-1/2"
			>
				<Indicator />
			</div>
		</div>
		
		<!-- View All Questions Button -->
		<!-- <div class="flex justify-center mt-8">
			<button
				on:mouseup={() => {
					audioState.play('click');
					window.location.href = '/questlist';
				}}
				class="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 transition-all duration-300 active:scale-95"
			>
				<span class="text-[2rem] font-apertura-medium text-white">📋 View All Questions</span>
			</button>
		</div> -->
	</div>
</div>

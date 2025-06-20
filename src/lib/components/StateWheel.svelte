<script lang="ts">
	import { getGameState } from '$lib/states/game.svelte';
	import TextSpinAndWin from '$lib/components/TextSpinAndWin.svelte';
	import WheelBackgroundWithDots from '$lib/components/WheelBackgroundWithDots.svelte';
	import Indicator from '$lib/components/Indicator.svelte';
	import Wheel from '$lib/components/Wheel.svelte';

	const gameState = getGameState();
</script>

<div class="relative flex h-full flex-col items-center text-center">
	<div class="mt-[7.5rem] mb-24 max-w-[65rem] text-[5.34rem] leading-none">
		Turn Your CX's Blind Spots into your Revenue
	</div>
	<TextSpinAndWin />
	<div class="my-auto w-full">
		<div class="relative p-[0.65rem] sm:p-[2rem]">
			<img
				src="/images/wheel-bg.png"
				alt=""
				class="pointer-events-none absolute inset-0 aspect-square w-full -translate-y-[4.5rem] scale-[0.98] opacity-[0.6]"
			/>
			<div
				class="pointer-events-none absolute inset-0 h-full w-full"
				style="transform: rotate({(gameState.rotation * 180) / Math.PI + 26.2}deg);"
			>
				<WheelBackgroundWithDots />
			</div>
			<div class="w-full">
				<Wheel />
			</div>
			<div
				class="pointer-events-none absolute -top-[1.85rem] left-1/2 aspect-[1/0.91] w-[9.93rem] -translate-x-1/2"
			>
				<Indicator />
			</div>
		</div>
	</div>
</div>

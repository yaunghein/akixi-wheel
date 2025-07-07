<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
	import { getAudioState } from '$lib/states/audio.svelte';

	const audioState = getAudioState();

	let showPrivacyPolicyPopup = $state(true);

	const handlePopupClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.classList.contains('volume-popup-overlay')) {
			showPrivacyPolicyPopup = false;
			audioState.play('click');
		}
	};

	const handlePopupKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			showPrivacyPolicyPopup = false;
			audioState.play('click');
		}
	};
</script>

<button
	onclick={() => {
		audioState.play('click');
		showPrivacyPolicyPopup = !showPrivacyPolicyPopup;
	}}
	class="text-aquamarineo font-apertura-medium mt-10 inline-block text-left text-[3.36rem] leading-none underline"
>
	Privacy Policy
</button>

{#if showPrivacyPolicyPopup}
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
			class="bg-electric-indigo shadow-box relative mx-auto w-full max-w-[73.5rem] rounded-[2.29rem] p-20 text-[3.36rem]"
		>
			<embed src="/privacy-policy.pdf" width="100%" height="500px" type="application/pdf" />
		</div>
	</div>
{/if}

<script lang="ts">
	import { page } from '$app/state';
	import { fade, scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
	import { getAudioState } from '$lib/states/audio.svelte';

	const audioState = getAudioState();

	let showPrivacyPolicyPopup = $state(false);

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
	class="text-aquamarineo font-apertura-medium mt-10 inline-block self-start text-left text-[3.36rem] leading-none underline"
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
			class="bg-electric-indigo shadow-box relative mx-auto w-full max-w-[73.5rem] rounded-[2.29rem] p-10 text-[3.36rem]"
		>
			<div class="h-[50vh] w-full overflow-hidden rounded-3xl">
				<div class="h-full w-full scale-[1.05]">
					<iframe
						src={`${page.url.origin}/privacy-policy.pdf`}
						width="100%"
						height="100%"
						class="h-full w-full"
						style="border: none;"
						title="Privacy Policy"
					></iframe>
				</div>
			</div>
		</div>
	</div>
{/if}

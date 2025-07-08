<script lang="ts">
	import { getAudioState } from '$lib/states/audio.svelte';
	import { GAME_STATES_ENUM, getGameState, type TFormField } from '$lib/states/game.svelte';
	import TextSpinAndWin from '$lib/components/TextSpinAndWin.svelte';
	import PrivacyPolicy from '$lib/components/PrivacyPolicy.svelte';
	import { scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
	import Keyboard from 'svelte-keyboard';
	import { toast } from '$lib/utils/toast';

	const audioState = getAudioState();
	const gameState = getGameState();

	let activeField = $state<HTMLInputElement | null>(null);
	let errorMessage = $state<string | null>(null);
	let keyboardVisible = $state(false);
	let blurTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let shouldAutoFocus = $state(true);

	const handleFieldFocus = (event: FocusEvent) => {
		if (blurTimeout) {
			clearTimeout(blurTimeout);
			blurTimeout = null;
		}
		activeField = event.target as HTMLInputElement;
		errorMessage = null;
		keyboardVisible = true;
		audioState.play('click');
	};

	const handleFieldBlur = () => {
		blurTimeout = setTimeout(() => {
			if (!document.activeElement?.matches('input')) {
				activeField = null;
				keyboardVisible = false;
			}
		}, 0);
	};

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validateForm = () => {
		if (!gameState.formInputs.first_name.trim()) {
			toast.error('First name is required');
			return false;
		}
		if (!gameState.formInputs.last_name.trim()) {
			toast.error('Last name is required');
			return false;
		}
		if (gameState.formInputs.email.trim() && !validateEmail(gameState.formInputs.email)) {
			toast.error('Please enter a valid email address');
			return false;
		}
		return true;
	};

	const onKeydown = (event: { detail: string }) => {
		audioState.play('type');

		errorMessage = null;
		const key = event.detail;

		if (key === 'Enter' || key === 'Return') {
			if (validateForm()) {
				gameState.current = GAME_STATES_ENUM.SPIN;
			}
			return;
		}

		if (activeField) {
			const fieldName = activeField.name as TFormField;

			if (key === 'Backspace') {
				gameState.formInputs[fieldName] = gameState.formInputs[fieldName].slice(0, -1);
			} else if (key === 'Space') {
				gameState.formInputs[fieldName] = gameState.formInputs[fieldName] + ' ';
			} else if (key.length === 1) {
				gameState.formInputs[fieldName] = gameState.formInputs[fieldName] + key;
			}

			// Move caret to end and scroll input so last character is visible
			const len = gameState.formInputs[fieldName].length;
			requestAnimationFrame(() => {
				if (activeField) {
					activeField.focus();
					activeField.scrollLeft = activeField.scrollWidth;
				}
			});
		}
	};

	const handleCheckboxChange = (event: Event) => {
		// const checkbox = event.target as HTMLInputElement;
		// gameState.formInputs.stay_in_touch = checkbox.checked;
		audioState.play('click');
		keyboardVisible = false;
	};

	$effect(() => {
		if (gameState.current === GAME_STATES_ENUM.FORM && shouldAutoFocus) {
			const firstNameInput = document.querySelector('input[name="first_name"]') as HTMLInputElement;
			const lastNameInput = document.querySelector('input[name="last_name"]') as HTMLInputElement;
			const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;

			if (firstNameInput && lastNameInput && emailInput) {
				if (!gameState.formInputs.first_name.trim()) {
					firstNameInput.focus();
				} else if (!gameState.formInputs.last_name.trim()) {
					lastNameInput.focus();
				} else if (!gameState.formInputs.email.trim()) {
					emailInput.focus();
				}
			}
			shouldAutoFocus = false;
		} else if (gameState.current !== GAME_STATES_ENUM.FORM) {
			shouldAutoFocus = true;
		}
	});
</script>

<div class="relative flex h-full w-full flex-col">
	<div class="mt-20 flex justify-center">
		<TextSpinAndWin />
	</div>
	<div class="mx-auto mt-32 flex h-full w-full max-w-[73.5rem] flex-col gap-4">
		<div class="flex gap-11">
			<label class="flex flex-col gap-2">
				<span class="text-shadow-small inline-block text-[3.36rem] leading-none">First Name</span>
				<input
					type="text"
					name="first_name"
					autocomplete="off"
					class="text-oxford-blue shadow-form-input focus:border-vivid-sky focus:ring-vivid-sky h-[7.94rem] w-[25.05rem] rounded-[1.53rem] border-none bg-[#D9D9D9] px-6 pt-5 text-[3.36rem] leading-none placeholder:text-[#B4B4B4] focus:ring-2 focus:outline-none"
					bind:value={gameState.formInputs.first_name}
					placeholder="John"
					onfocus={handleFieldFocus}
					onblur={handleFieldBlur}
				/>
			</label>
			<label class="flex flex-1 flex-col gap-2">
				<span class="text-shadow-small inline-block text-[3.36rem] leading-none">Last Name</span>
				<input
					type="text"
					name="last_name"
					autocomplete="off"
					placeholder="Doe"
					class="text-oxford-blue shadow-form-input focus:border-vivid-sky focus:ring-vivid-sky h-[7.94rem] w-full rounded-[1.53rem] border-none bg-[#D9D9D9] px-6 pt-5 text-[3.36rem] leading-none placeholder:text-[#B4B4B4] focus:ring-2 focus:outline-none"
					bind:value={gameState.formInputs.last_name}
					onfocus={handleFieldFocus}
					onblur={handleFieldBlur}
				/>
			</label>
		</div>
		<label class="mt-8 flex flex-col gap-2">
			<span class="text-shadow-small inline-block text-[3.36rem] leading-none">
				Email Address
			</span>
			<input
				type="email"
				name="email"
				autocomplete="off"
				class="text-oxford-blue shadow-form-input focus:border-vivid-sky focus:ring-vivid-sky h-[7.94rem] w-full rounded-[1.53rem] border-none bg-[#D9D9D9] px-6 pt-5 text-[3.36rem] leading-none placeholder:text-[#B4B4B4] focus:ring-2 focus:outline-none"
				placeholder="johndoe@gmail.com"
				bind:value={gameState.formInputs.email}
				onfocus={handleFieldFocus}
				onblur={handleFieldBlur}
			/>
		</label>
		<label class="mt-10 flex items-center justify-between gap-2 pr-2">
			<span class="text-shadow-small inline-block translate-y-1 text-[3.36rem] leading-none">
				Yes, I would like to stay in touch with Akixi.
			</span>
			<input
				onmouseup={handleCheckboxChange}
				type="checkbox"
				name="terms"
				bind:checked={gameState.formInputs.stay_in_touch}
				class="checked:bg-vivid-sky checked:text-vivid-sky h-[4.12rem] w-[4.12rem] !appearance-none rounded-[0.75rem] border-2 border-none bg-[#D9D9D9]"
			/>
		</label>
		<PrivacyPolicy />
		{#if errorMessage}
			<div class="mt-10">
				<p class="font-apertura-black text-tomato text-[3.36rem]">{errorMessage}</p>
			</div>
		{/if}
		<div class="flex flex-1 items-center justify-center">
			{#if !keyboardVisible}
				<button
					in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
					out:scale={{ duration: 300, start: 1.05 }}
					onclick={() => {
						audioState.play('click');
						if (!validateForm()) {
							return;
						}
						gameState.current = GAME_STATES_ENUM.SPIN;
					}}
					class="font-apertura-black bg-vivid-sky cursor-pointer rounded-[2.29rem] px-48 py-12 text-[6.11rem] leading-none text-[#23475F] transition-transform active:scale-90"
				>
					<span class="inline-block translate-y-1">Play</span>
				</button>
			{/if}
		</div>
	</div>

	{#if keyboardVisible}
		<div
			in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
			out:scale={{ duration: 300, start: 1.05 }}
			class="bg-electric-indigo shadow-box absolute top-auto right-0 bottom-96 left-0 py-20 transition-transform duration-300 sm:bottom-80"
		>
			<div class="mx-auto max-w-[73.5rem]">
				<Keyboard on:keydown={onKeydown} />
			</div>
		</div>
	{/if}
</div>

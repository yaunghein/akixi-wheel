<script lang="ts">
	import Keyboard from 'svelte-keyboard';
	import Wheel from '$lib/components/Wheel.svelte';
	import { GAME_STATES, type TGameState } from '$lib/constants';
	import Logo from '$lib/components/Logo.svelte';
	import WheelBackgroundWithDots from '$lib/components/WheelBackgroundWithDots.svelte';
	import Indicator from '$lib/components/Indicator.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
	import { browser } from '$app/environment';

	let segmentColor = $state('#FF6B6B');
	let gameState = $state(GAME_STATES.START) as TGameState;
	let showWheel = $derived(gameState === GAME_STATES.START || gameState === GAME_STATES.SPIN);
	let isOnline = $state(browser ? navigator.onLine : true);

	const CLICK_DELAY = 150; // Single place to control all click delays

	let clickSound: HTMLAudioElement | null = $state(null);
	let tadaSound: HTMLAudioElement | null = $state(null);

	let rotation = $state(0);

	onMount(() => {
		clickSound = new Audio('/sounds/click.mp3');
		clickSound.load();
		tadaSound = new Audio('/sounds/tada.mp3');
		tadaSound.load();

		// Add online/offline event listeners
		if (browser) {
			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);

			// Check for stored form submissions when coming online
			if (isOnline) {
				processStoredSubmissions();
			}
		}

		return () => {
			if (browser) {
				window.removeEventListener('online', handleOnline);
				window.removeEventListener('offline', handleOffline);
			}
		};
	});

	const handleOnline = () => {
		isOnline = true;
		processStoredSubmissions();
	};

	const handleOffline = () => {
		isOnline = false;
	};

	const processStoredSubmissions = () => {
		const storedSubmissions = localStorage.getItem('formSubmissions');
		if (storedSubmissions) {
			try {
				const submissions = JSON.parse(storedSubmissions);
				submissions.forEach((submission: FormState) => {
					console.log('Processing stored submission:', submission);
				});
				// Clear stored submissions after processing
				localStorage.removeItem('formSubmissions');
			} catch (error) {
				console.error('Error processing stored submissions:', error);
			}
		}
	};

	const storeFormSubmission = (formData: FormState) => {
		const storedSubmissions = localStorage.getItem('formSubmissions');
		let submissions: FormState[] = [];

		if (storedSubmissions) {
			try {
				submissions = JSON.parse(storedSubmissions);
			} catch (error) {
				console.error('Error parsing stored submissions:', error);
			}
		}

		submissions.push(formData);
		localStorage.setItem('formSubmissions', JSON.stringify(submissions));
	};

	const handleFormSubmit = () => {
		if (!validateForm()) {
			return;
		}
		if (isOnline) {
			console.log('Form submitted:', formState);
		} else {
			storeFormSubmission(formState);
		}
		gameState = GAME_STATES.SPIN;
	};

	type QuizQuestion = {
		text: string;
		choices: string[];
		correct: 'A' | 'B' | 'C';
		explanation: string;
	};

	type WheelSegment = {
		text: string;
		color: string;
		question: QuizQuestion;
	};

	// let finalSegment: WheelSegment | null = $state({
	// 	text: 'Call Tagging & Categorisation',
	// 	color: '#1cd2fa',
	// 	question: {
	// 		text: 'Which feature helps you recover missed sales opportunities?',
	// 		choices: ['Missed Call Recovery', 'Call Recording', 'Voicemail'],
	// 		correct: 'A',
	// 		explanation:
	// 			'Missed Call Recovery helps you recover missed sales opportunities by tracking and alerting you to missed calls.'
	// 	}
	// });
	let finalSegment: WheelSegment | null = $state(null);

	type FormState = {
		first_name: string;
		last_name: string;
		email: string;
		stay_in_touch: boolean;
	};

	type TextField = 'first_name' | 'last_name' | 'email';

	// Form state
	let formState = $state<FormState>({
		first_name: '',
		last_name: '',
		email: '',
		stay_in_touch: false
	});

	let activeField = $state<HTMLInputElement | null>(null);
	let errorMessage = $state<string | null>(null);
	let keyboardVisible = $state(false);
	let blurTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let shouldAutoFocus = $state(true);

	// Quiz state
	let selectedAnswer: 'A' | 'B' | 'C' | null = $state(null);
	let isCorrect: boolean | null = $state(null);

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validateForm = () => {
		if (!formState.first_name.trim()) {
			errorMessage = 'First name is required';
			return false;
		}
		if (!formState.last_name.trim()) {
			errorMessage = 'Last name is required';
			return false;
		}
		if (formState.email.trim() && !validateEmail(formState.email)) {
			errorMessage = 'Please enter a valid email address';
			return false;
		}
		errorMessage = null;
		return true;
	};

	const onKeydown = (event: { detail: string }) => {
		errorMessage = null;
		const key = event.detail;
		console.log('key', key);

		if (key === 'Enter' || key === 'Return') {
			if (validateForm()) {
				console.log('Form submitted:', formState);
				gameState = GAME_STATES.SPIN;
			}
			return;
		}

		if (activeField) {
			const fieldName = activeField.name as TextField;

			if (key === 'Backspace') {
				formState[fieldName] = formState[fieldName].slice(0, -1);
			} else if (key === 'Space') {
				formState[fieldName] = formState[fieldName] + ' ';
			} else if (key.length === 1) {
				formState[fieldName] = formState[fieldName] + key;
			}

			// Move caret to end and scroll input so last character is visible
			const len = formState[fieldName].length;
			requestAnimationFrame(() => {
				if (activeField) {
					activeField.setSelectionRange(len, len);
					activeField.scrollLeft = activeField.scrollWidth;
				}
			});
		}
	};

	$effect(() => {
		if (gameState === GAME_STATES.FORM && shouldAutoFocus) {
			const firstNameInput = document.querySelector('input[name="first_name"]') as HTMLInputElement;
			const lastNameInput = document.querySelector('input[name="last_name"]') as HTMLInputElement;
			const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;

			if (firstNameInput && lastNameInput && emailInput) {
				if (!formState.first_name.trim()) {
					firstNameInput.focus();
				} else if (!formState.last_name.trim()) {
					lastNameInput.focus();
				} else if (!formState.email.trim()) {
					emailInput.focus();
				}
			}
			shouldAutoFocus = false;
		} else if (gameState !== GAME_STATES.FORM) {
			shouldAutoFocus = true;
		}
	});

	const handleFieldFocus = (event: FocusEvent) => {
		if (blurTimeout) {
			clearTimeout(blurTimeout);
			blurTimeout = null;
		}
		activeField = event.target as HTMLInputElement;
		errorMessage = null; // Clear error when user starts typing
		keyboardVisible = true;
		if (clickSound) {
			clickSound.play();
		}
	};

	const handleFieldBlur = () => {
		blurTimeout = setTimeout(() => {
			// Only hide keyboard if no input is focused
			if (!document.activeElement?.matches('input')) {
				activeField = null;
				keyboardVisible = false;
			}
		}, 0);
	};

	const handleCheckboxChange = (event: Event) => {
		const checkbox = event.target as HTMLInputElement;
		formState.stay_in_touch = checkbox.checked;
		if (clickSound) {
			clickSound.play();
		}
		keyboardVisible = false;
	};

	async function selectAnswer(answer: 'A' | 'B' | 'C') {
		selectedAnswer = answer;
		if (finalSegment && finalSegment.question) {
			isCorrect = finalSegment.question.correct === answer;
		}
		gameState = GAME_STATES.RESULT;
	}

	$effect(() => {
		if (gameState === GAME_STATES.FINAL && isCorrect) {
			if (tadaSound) {
				tadaSound.play();
			}
			// @ts-expect-error: no types for canvas-confetti
			import('canvas-confetti').then((module) => {
				const confetti = module.default;
				confetti({
					particleCount: 120,
					spread: 90,
					origin: { y: 0.6 },
					colors: ['#2fffa3', '#2fd6ff', '#3b82f6', '#fff']
				});
			});
		}
	});

	$effect(() => {
		if (gameState === GAME_STATES.RESULT) {
			const timer = setTimeout(() => {
				gameState = GAME_STATES.FINAL;
			}, 2000);
			return () => clearTimeout(timer);
		}
	});

	const playClickSound = () => {
		if (clickSound) {
			clickSound.currentTime = 0; // Reset to start
			clickSound.play();
		}
	};
</script>

<main
	class="bg-electric-indigo flex min-h-screen overflow-hidden text-white transition-colors duration-500"
>
	<div class="relative flex aspect-[4/7] w-full flex-col pt-28">
		<img
			src="/images/background.webp"
			alt="Background"
			class="absolute inset-0 h-full w-full object-cover"
		/>
		<div class="relative mx-auto mb-auto aspect-[1/0.27] w-[40.5rem]">
			<Logo />
		</div>
		{#if showWheel}
			{#if gameState === GAME_STATES.SPIN}
				<button
					onmouseup={() => {
						playClickSound();
						setTimeout(() => {
							gameState = GAME_STATES.FORM;
						}, CLICK_DELAY);
					}}
					class="absolute top-8 right-8 aspect-[1/0.96] w-[7rem] cursor-pointer transition-transform active:scale-90"
				>
					<BackButton />
				</button>
			{/if}
			<div class="relative flex h-full flex-col items-center text-center">
				<div class="mt-[7.5rem] mb-24 max-w-[65rem] text-[5.34rem] leading-none">
					Turn Your CX's Blind Spots into your Revenue
				</div>
				{@render spinAndWin()}
				<div class="my-auto w-full">
					<div class="relative p-[0.65rem] sm:p-[2rem]">
						<div
							class="pointer-events-none absolute inset-0 h-full w-full"
							style="transform: rotate({(rotation * 180) / Math.PI + 26.2}deg);"
						>
							<WheelBackgroundWithDots />
						</div>
						<div class="w-full">
							<Wheel
								bind:segmentColor
								bind:gameState
								bind:finalSegment
								bind:rotation
								{CLICK_DELAY}
								{clickSound}
							/>
						</div>
						<div
							class="pointer-events-none absolute -top-[1.85rem] left-1/2 aspect-[1/0.91] w-[9.93rem] -translate-x-1/2"
						>
							<Indicator />
						</div>
					</div>
				</div>
			</div>
		{:else if gameState === GAME_STATES.FORM}
			<button
				onmouseup={() => {
					playClickSound();
					setTimeout(() => {
						gameState = GAME_STATES.START;
					}, CLICK_DELAY);
				}}
				class="absolute top-8 right-8 aspect-[1/0.96] w-[7rem] cursor-pointer transition-transform active:scale-90"
			>
				<BackButton />
			</button>
			<div class="relative flex h-full w-full flex-col">
				<div class="mt-20 flex justify-center">
					{@render spinAndWin()}
				</div>

				<div class="mx-auto mt-32 flex h-full w-full max-w-[73.5rem] flex-col gap-4">
					<div class="flex gap-11">
						<label class="flex flex-col gap-2">
							<span class="text-shadow-small inline-block text-[3.36rem] leading-none">
								First Name
							</span>
							<input
								type="text"
								name="first_name"
								autocomplete="off"
								class="text-oxford-blue shadow-form-input focus:border-vivid-sky focus:ring-vivid-sky h-[7.94rem] w-[25.05rem] rounded-[1.53rem] border-none bg-[#D9D9D9] px-6 pt-5 text-[3.36rem] leading-none placeholder:text-[#B4B4B4] focus:ring-2 focus:outline-none"
								bind:value={formState.first_name}
								placeholder="John"
								onfocus={handleFieldFocus}
								onblur={handleFieldBlur}
							/>
						</label>
						<label class="flex flex-1 flex-col gap-2">
							<span class="text-shadow-small inline-block text-[3.36rem] leading-none">
								Last Name
							</span>
							<input
								type="text"
								name="last_name"
								autocomplete="off"
								placeholder="Doe"
								class="text-oxford-blue shadow-form-input focus:border-vivid-sky focus:ring-vivid-sky h-[7.94rem] w-full rounded-[1.53rem] border-none bg-[#D9D9D9] px-6 pt-5 text-[3.36rem] leading-none placeholder:text-[#B4B4B4] focus:ring-2 focus:outline-none"
								bind:value={formState.last_name}
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
							bind:value={formState.email}
							onfocus={handleFieldFocus}
							onblur={handleFieldBlur}
						/>
					</label>
					<label class="mt-10 flex items-center justify-between gap-2 pr-2">
						<span class="text-shadow-small inline-block translate-y-1 text-[3.36rem] leading-none">
							Yes, I would like to stay in touch with Akixi.
						</span>
						<input
							onclick={handleCheckboxChange}
							type="checkbox"
							name="terms"
							class="checked:bg-vivid-sky checked:text-vivid-sky h-[4.12rem] w-[4.12rem] !appearance-none rounded-[0.75rem] border-2 border-none bg-[#D9D9D9]"
						/>
					</label>
					<button
						class="text-aquamarineo font-apertura-medium mt-10 inline-block text-left text-[3.36rem] leading-none underline"
					>
						Privacy Policy
					</button>
					{#if errorMessage}
						<div class="mt-10">
							<p class="font-apertura-black text-tomato text-[3.36rem]">{errorMessage}</p>
						</div>
					{/if}
					<div class="flex flex-1 items-center justify-center">
						{#if !keyboardVisible}
							{@render button({
								label: 'Play',
								onmouseup: () => {
									playClickSound();
									setTimeout(() => {
										handleFormSubmit();
									}, CLICK_DELAY);
								}
							})}
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
		{:else if gameState === GAME_STATES.LANDED}
			{#if finalSegment}
				<div class="relative my-auto text-center text-[7.33rem] leading-none">
					<div class="font-apertura-black mb-2">You landed on</div>
					{@render splitText(finalSegment.text)}
				</div>
				<div class="relative my-auto flex -translate-y-[15rem] items-center justify-center">
					{@render button({
						label: 'Continue',
						onmouseup: () => {
							playClickSound();
							setTimeout(() => {
								gameState = GAME_STATES.QUIZ;
							}, CLICK_DELAY);
						}
					})}
				</div>
			{/if}
		{:else if gameState === GAME_STATES.QUIZ}
			{#if finalSegment}
				<div
					class="relative mt-32 flex h-full w-full flex-col items-center text-center text-[7.33rem]"
				>
					{@render splitText(finalSegment.text)}
					<p
						class="text-shadow-small font-apertura-medium mx-auto mt-28 max-w-[73.5rem] text-center text-[4.43rem] leading-[1.2]"
					>
						{finalSegment.question.text}
					</p>
					<div class="mt-52 flex w-full max-w-[73.5rem] flex-col gap-20">
						{#each finalSegment.question.choices as choice, i}
							<div class="flex items-center gap-16">
								<span
									class="font-apertura-black text-shadow-small text-[12.98rem] leading-none"
									style="color: {i === 0 ? '#22f4ad' : i === 1 ? '#4450ff' : '#1cd2fa'}"
								>
									{String.fromCharCode(65 + i)}
								</span>
								<span
									class="text-shadow-small font-apertura-medium -translate-y-4 text-[4.43rem] leading-[1.2]"
								>
									{choice}
								</span>
							</div>
						{/each}
					</div>
					<p class="text-shadow-small font-apertura-medium mt-52 text-[4.43rem] leading-none">
						Select your answer below
					</p>
					<div class="mt-20 flex gap-[12.98rem]">
						{#each finalSegment.question.choices as _, i}
							<button
								class="shadow-box relative aspect-square w-[15.28rem] rounded-[2.29rem] transition-transform active:scale-90"
								style="background: {i === 0 ? '#22f4ad' : i === 1 ? '#4450ff' : '#1cd2fa'}"
								onmouseup={() => {
									playClickSound();
									setTimeout(() => {
										selectAnswer(String.fromCharCode(65 + i) as 'A' | 'B' | 'C');
									}, CLICK_DELAY);
								}}
							>
								<span
									class="font-apertura-black inline-block translate-y-5 text-[12.98rem] leading-none {String.fromCharCode(
										65 + i
									) === 'C'
										? '-translate-x-2'
										: ''}"
								>
									{String.fromCharCode(65 + i)}
								</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		{:else if gameState === GAME_STATES.RESULT}
			{#if finalSegment && selectedAnswer}
				<div
					class="relative mt-32 flex h-full w-full flex-col items-center text-center text-[7.33rem]"
				>
					{@render splitText(finalSegment.text)}
					<div class="mt-28 flex flex-col items-center">
						<div
							class="shadow-box relative grid aspect-square w-[15.28rem] place-items-center rounded-[2.29rem] text-white"
							style="background: {selectedAnswer === 'A'
								? '#22f4ad'
								: selectedAnswer === 'B'
									? '#4450ff'
									: '#1cd2fa'}"
						>
							<span
								class="font-apertura-black inline-block translate-y-5 text-[12.98rem] leading-none {selectedAnswer ===
								'C'
									? '-translate-x-1'
									: ''}"
							>
								{selectedAnswer}
							</span>
						</div>
						{#if isCorrect}
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
					<p class="mx-auto mt-20 max-w-[70rem] text-center text-[4.58rem] leading-[1.2]">
						{finalSegment.question.explanation}
					</p>
				</div>
			{/if}
		{:else if gameState === GAME_STATES.FINAL}
			{#if isCorrect}
				<div class="relative my-auto text-center leading-none">
					<div class="font-apertura-black text-aquamarineo text-shadow-small text-[10.08rem]">
						Congratulations!
					</div>
					<div
						class="text-aquamarineo text-shadow-small mx-auto mt-10 max-w-[55rem] text-[9.93rem] leading-[1]"
					>
						Collect your prize
					</div>
				</div>
				<div class="relative mb-auto flex -translate-y-[15rem] items-center justify-center">
					{@render button({
						label: 'Start over',
						onmouseup: () => {
							playClickSound();
							setTimeout(() => {
								gameState = GAME_STATES.START;
							}, CLICK_DELAY);
						}
					})}
				</div>
			{:else}
				<div class="relative my-auto -translate-y-[10rem] text-center leading-none">
					<img
						src="/images/sad.svg"
						alt="Sad face"
						class="mx-auto mb-20 aspect-square w-[30.09rem] shrink-0"
					/>
					<div class="font-apertura-black text-aquamarineo text-shadow-small text-[10.08rem]">
						Hard luck
					</div>
					<div
						class="text-aquamarineo text-shadow-small mx-auto mt-10 max-w-[55rem] text-[9.93rem] leading-[1]"
					>
						Please try again
					</div>
				</div>
				<div
					class="relative mb-auto flex -translate-y-[12rem] flex-col items-center justify-center"
				>
					{@render button({
						label: 'Start over',
						onmouseup: () => {
							playClickSound();
							setTimeout(() => {
								gameState = GAME_STATES.START;
							}, CLICK_DELAY);
						}
					})}

					<div class="mt-20">
						{@render button({
							label: 'Try again',
							onmouseup: () => {
								playClickSound();
								setTimeout(() => {
									gameState = GAME_STATES.SPIN;
								}, CLICK_DELAY);
							}
						})}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</main>

{#snippet spinAndWin()}
	<div class="font-apertura-black text-shadow-small text-vivid-sky text-[13.9rem] leading-none">
		SPIN <span class="text-aquamarineo">&</span> WIN
	</div>
{/snippet}

{#snippet button({ label, onmouseup }: { label: string; onmouseup: () => void })}
	<button
		in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
		out:scale={{ duration: 300, start: 1.05 }}
		{onmouseup}
		class="font-apertura-black bg-vivid-sky cursor-pointer rounded-[2.29rem] px-48 py-12 text-[6.11rem] leading-none text-[#23475F] transition-transform active:scale-90"
	>
		<span class="inline-block translate-y-1">{label}</span>
	</button>
{/snippet}

{#snippet splitText(text: string)}
	<div class="font-apertura-black text-vivid-sky text-shadow-small leading-[1.2]">
		{#if text.split(' ').length && text.split(' ').length > 1}
			{text.split(' ').slice(0, -1).join(' ')}
			<span class="text-aquamarineo">{text.split(' ').pop()}</span>
		{:else}
			{text}
		{/if}
	</div>
{/snippet}

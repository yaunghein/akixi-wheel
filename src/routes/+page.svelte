<script lang="ts">
	import Keyboard from 'svelte-keyboard';
	import Wheel from '$lib/components/Wheel.svelte';
	import { GAME_STATES, type TGameState } from '$lib/constants';
	import Logo from '$lib/components/Logo.svelte';
	import WheelBackgroundWithDots from '$lib/components/WheelBackgroundWithDots.svelte';
	import Indicator from '$lib/components/Indicator.svelte';

	let segmentColor = $state('#FF6B6B');
	let gameState = $state(GAME_STATES.START) as TGameState;
	let showWheel = $derived(gameState === GAME_STATES.START || gameState === GAME_STATES.SPIN);

	type QuizQuestion = {
		text: string;
		choices: [string, string, string];
		correct: 'A' | 'B' | 'C';
		explanation: string;
	};

	type WheelSegment = {
		text: string;
		color: string;
		question: QuizQuestion;
	};

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
		if (!formState.email.trim()) {
			errorMessage = 'Email is required';
			return false;
		}
		if (!validateEmail(formState.email)) {
			errorMessage = 'Please enter a valid email address';
			return false;
		}
		errorMessage = null;
		return true;
	};

	const onKeydown = (event: { detail: string }) => {
		errorMessage = null;
		const key = event.detail;

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
			} else if (key.length === 1) {
				formState[fieldName] = formState[fieldName] + key;
			}
		}
	};

	const handleFieldFocus = (event: FocusEvent) => {
		activeField = event.target as HTMLInputElement;
		errorMessage = null; // Clear error when user starts typing
	};

	const handleCheckboxChange = (event: Event) => {
		const checkbox = event.target as HTMLInputElement;
		formState.stay_in_touch = checkbox.checked;
	};

	function selectAnswer(answer: 'A' | 'B' | 'C') {
		selectedAnswer = answer;
		if (finalSegment && finalSegment.question) {
			isCorrect = finalSegment.question.correct === answer;
		}
		gameState = GAME_STATES.RESULT;
	}

	$effect(() => {
		if (gameState === GAME_STATES.RESULT && isCorrect) {
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
</script>

<main
	class="bg-electric-indigo flex min-h-screen items-center justify-center text-white transition-colors duration-500"
>
	<div class="flex aspect-[4/7] w-full flex-col">
		{#if showWheel}
			<div class="flex h-full flex-col items-center text-center">
				<div class="mt-28 aspect-[1/0.27] w-[40.5rem]">
					<Logo />
				</div>
				<div class="my-20 max-w-[65rem] text-[5.34rem] leading-none">
					Turn Your CX's Blind Spots into your Revenue
				</div>
				<div
					class="font-apertura-black text-shadow-akixi text-vivid-sky text-[13.9rem] leading-none"
				>
					SPIN <span class="text-aquamarineo">&</span> WIN
				</div>
				<div class="my-auto w-full">
					<div class="relative p-[0.65rem] sm:p-[1.9rem]">
						<div class="pointer-events-none absolute inset-0 h-full w-full rotate-[26.2deg]">
							<WheelBackgroundWithDots />
						</div>
						<div class="overflow-hidden">
							<Wheel bind:segmentColor bind:gameState bind:finalSegment />
						</div>
						<div
							class="pointer-events-none absolute -top-8 left-1/2 aspect-[1/0.91] w-[9.93rem] -translate-x-1/2"
						>
							<Indicator />
						</div>
					</div>
				</div>
			</div>
		{:else if gameState === GAME_STATES.FORM}
			<div class="flex h-full w-full flex-col bg-sky-200 p-8">
				<button
					onclick={() => (gameState = GAME_STATES.START)}
					class="fixed top-4 right-4 aspect-square w-10 bg-neutral-600 text-white">{`<-`}</button
				>
				<form class="mt-10 flex w-full flex-col gap-4">
					<div class="flex gap-2">
						<label class="flex flex-col gap-2">
							<span class="">First Name</span>
							<input
								type="text"
								name="first_name"
								class="w-full"
								bind:value={formState.first_name}
								onfocus={handleFieldFocus}
							/>
						</label>
						<label class="flex flex-col gap-2">
							<span class="">Last Name</span>
							<input
								type="text"
								name="last_name"
								class="w-full"
								bind:value={formState.last_name}
								onfocus={handleFieldFocus}
							/>
						</label>
					</div>
					<label class="flex flex-col gap-2">
						<span class="">Email</span>
						<input
							type="email"
							name="email"
							class="w-full"
							bind:value={formState.email}
							onfocus={handleFieldFocus}
						/>
					</label>
					<label class="flex items-center gap-2">
						<span class="">I would like to stay in touch with Akixi</span>
						<input
							type="checkbox"
							name="terms"
							checked={formState.stay_in_touch}
							onchange={handleCheckboxChange}
						/>
					</label>
					<a href="/privacy-policy" class="text-blue-500 underline">Privacy Policy</a>
				</form>

				{#if errorMessage}
					<div class="mt-4 rounded-md bg-red-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm font-medium text-red-800">{errorMessage}</p>
							</div>
						</div>
					</div>
				{/if}

				<div class="mt-auto">
					<Keyboard on:keydown={onKeydown} />
				</div>
			</div>
		{:else if gameState === GAME_STATES.QUIZ}
			{#if finalSegment}
				<div
					class="flex h-full w-full flex-col items-center justify-center bg-neutral-600 p-8 text-white"
				>
					<h2 class="mb-2 text-2xl font-bold">{finalSegment.text}</h2>
					<p class="mb-6 text-center text-lg">{finalSegment.question.text}</p>
					<div class="mb-6 flex w-full max-w-xs flex-col gap-2">
						{#each finalSegment.question.choices as choice, i}
							<div class="flex items-center gap-2">
								<span
									class="text-2xl font-bold"
									style="color: {i === 0 ? '#2fffa3' : i === 1 ? '#3b82f6' : '#2fd6ff'}"
									>{String.fromCharCode(65 + i)}</span
								>
								<span class="text-lg">{choice}</span>
							</div>
						{/each}
					</div>
					<p class="mb-2">Select your answer below</p>
					<div class="flex gap-4">
						<button
							class="rounded-lg px-6 py-2 text-2xl font-bold shadow-md"
							style="background:#2fffa3;color:#222"
							onclick={() => selectAnswer('A')}>A</button
						>
						<button
							class="rounded-lg px-6 py-2 text-2xl font-bold shadow-md"
							style="background:#3b82f6;color:#fff"
							onclick={() => selectAnswer('B')}>B</button
						>
						<button
							class="rounded-lg px-6 py-2 text-2xl font-bold shadow-md"
							style="background:#2fd6ff;color:#fff"
							onclick={() => selectAnswer('C')}>C</button
						>
					</div>
				</div>
			{/if}
		{:else if gameState === GAME_STATES.RESULT}
			{#if finalSegment && selectedAnswer}
				<div
					class="flex h-full w-full flex-col items-center justify-center bg-neutral-600 p-8 text-white"
				>
					<h2 class="mb-2 text-2xl font-bold">{finalSegment.text}</h2>
					<div class="mb-6 flex flex-col items-center">
						<div
							class="mb-4 rounded-lg px-8 py-4 text-4xl font-bold"
							style="background:{selectedAnswer === 'A'
								? '#2fffa3'
								: selectedAnswer === 'B'
									? '#3b82f6'
									: '#2fd6ff'};color:#222"
						>
							{selectedAnswer}
						</div>
						{#if isCorrect}
							<div class="mb-2 text-4xl font-bold text-green-400">Correct!</div>
						{:else}
							<div class="mb-2 text-4xl font-bold text-red-500">Wrong!</div>
						{/if}
					</div>
					<p class="text-center">
						{finalSegment.question.explanation}
					</p>
					<button
						class="mt-8 rounded-lg bg-white px-6 py-2 text-lg font-bold text-blue-600"
						onclick={() => (gameState = GAME_STATES.START)}>Back to Start</button
					>
				</div>
			{/if}
		{/if}
	</div>
</main>

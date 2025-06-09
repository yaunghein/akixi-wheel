<script lang="ts">
	import Keyboard from 'svelte-keyboard';
	import Wheel from '$lib/components/Wheel.svelte';
	import { GAME_STATES, type TGameState } from '$lib/constants';
	import Logo from '$lib/components/Logo.svelte';
	import WheelBackgroundWithDots from '$lib/components/WheelBackgroundWithDots.svelte';
	import Indicator from '$lib/components/Indicator.svelte';
	import BackButton from '$lib/components/BackButton.svelte';

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

	let finalSegment: WheelSegment | null = $state({
		text: 'Missed Call Recovery',
		color: '#22f4ad',
		question: {
			text: '“Does Teams tell you which missed calls were never returned?”',
			choices: ['YES', 'NO', 'Only via a third-party tool'],
			correct: 'A',
			explanation: 'Teams does not tell you which missed calls were never returned.'
		}
	});
	// let finalSegment: WheelSegment | null = $state(null);

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
	class="bg-electric-indigo flex min-h-screen overflow-hidden text-white transition-colors duration-500"
>
	<div class="flex aspect-[4/7] w-full flex-col pt-28">
		<div class="mx-auto mb-auto aspect-[1/0.27] w-[40.5rem]">
			<Logo />
		</div>
		{#if showWheel}
			<div class="flex h-full flex-col items-center text-center">
				<div class="mt-[7.5rem] mb-24 max-w-[65rem] text-[5.34rem] leading-none">
					Turn Your CX's Blind Spots into your Revenue
				</div>
				{@render spinAndWin()}
				<div class="my-auto w-full">
					<div class="relative p-[0.65rem] sm:p-[2rem]">
						<div class="pointer-events-none absolute inset-0 h-full w-full rotate-[26.2deg]">
							<WheelBackgroundWithDots />
						</div>
						<div class="w-full">
							<Wheel bind:segmentColor bind:gameState bind:finalSegment />
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
			<div class="flex h-full w-full flex-col">
				<div class="mt-20 flex justify-center">
					{@render spinAndWin()}
				</div>
				<button
					onclick={() => (gameState = GAME_STATES.START)}
					class="absolute top-8 right-8 aspect-[1/0.96] w-[7rem] cursor-pointer"
				>
					<BackButton />
				</button>
				<div class="mx-auto mt-32 flex h-full w-full max-w-[73.5rem] flex-col gap-4">
					<div class="flex gap-11">
						<label class="flex flex-col gap-2">
							<span class="text-shadow-small inline-block text-[3.36rem] leading-none">
								First Name
							</span>
							<input
								type="text"
								name="first_name"
								class="text-oxford-blue shadow-form-input border-electric-indigo focus:border-vivid-sky h-[7.94rem] w-[25.05rem] rounded-[1.53rem] border-2 bg-[#D9D9D9] px-6 text-[3.36rem] leading-none placeholder:text-[#B4B4B4] focus:ring-0 focus:outline-none"
								bind:value={formState.first_name}
								placeholder="John"
								onfocus={handleFieldFocus}
							/>
						</label>
						<label class="flex flex-1 flex-col gap-2">
							<span class="text-shadow-small inline-block text-[3.36rem] leading-none">
								Last Name
							</span>
							<input
								type="text"
								name="last_name"
								placeholder="Doe"
								class="text-oxford-blue shadow-form-input border-electric-indigo focus:border-vivid-sky h-[7.94rem] w-full rounded-[1.53rem] border-2 bg-[#D9D9D9] px-6 text-[3.36rem] leading-none placeholder:text-[#B4B4B4] focus:ring-0 focus:outline-none"
								bind:value={formState.last_name}
								onfocus={handleFieldFocus}
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
							class="text-oxford-blue shadow-form-input border-electric-indigo focus:border-vivid-sky h-[7.94rem] w-full rounded-[1.53rem] border-2 bg-[#D9D9D9] px-6 text-[3.36rem] leading-none placeholder:text-[#B4B4B4] focus:ring-0 focus:outline-none"
							placeholder="johndoe@gmail.com"
							bind:value={formState.email}
							onfocus={handleFieldFocus}
						/>
					</label>
					<label class="mt-10 flex items-center justify-between gap-2 pr-2">
						<span class="text-shadow-small inline-block translate-y-1 text-[3.36rem] leading-none">
							Yes, I would like to stay in touch with Akixi.
						</span>
						<input
							type="checkbox"
							name="terms"
							class="checked:bg-vivid-sky checked:text-vivid-sky h-[4.12rem] w-[4.12rem] !appearance-none rounded-[0.75rem] border-2 border-none bg-[#D9D9D9]"
						/>
					</label>
					<a
						href="/privacy-policy"
						class="text-aquamarineo font-apertura-medium mt-10 inline-block text-[3.36rem] leading-none underline"
					>
						Privacy Policy
					</a>
					{#if errorMessage}
						<div class="mt-10">
							<p class="font-apertura-black text-tomato text-[3.36rem]">Error: {errorMessage}</p>
						</div>
					{/if}
					<div class="flex flex-1 items-center justify-center">
						{@render button({ label: 'Play', onclick: () => (gameState = GAME_STATES.SPIN) })}
					</div>
				</div>

				<!-- <div class="mt-auto">
					<Keyboard on:keydown={onKeydown} />
				</div> -->
			</div>
		{:else if gameState === GAME_STATES.LANDED}
			<div class="my-auto text-center text-[7.33rem] leading-none">
				<div class="font-apertura-black">You landed on</div>
				<div class="font-apertura-black text-vivid-sky text-shadow-small">
					{finalSegment?.text.split(' ').slice(0, -1).join(' ')}
					<span class="text-aquamarineo">{finalSegment?.text.split(' ').pop()}</span>
				</div>
			</div>
			<div class="my-auto flex items-center justify-center">
				{@render button({ label: 'Continue', onclick: () => (gameState = GAME_STATES.QUIZ) })}
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
								>
									{String.fromCharCode(65 + i)}
								</span>
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

{#snippet spinAndWin()}
	<div class="font-apertura-black text-shadow-small text-vivid-sky text-[13.9rem] leading-none">
		SPIN <span class="text-aquamarineo">&</span> WIN
	</div>
{/snippet}

{#snippet button({ label, onclick }: { label: string; onclick: () => void })}
	<button
		{onclick}
		class="font-apertura-black bg-vivid-sky rounded-[2.29rem] px-48 py-12 text-[6.11rem] leading-none text-[#23475F]"
	>
		<span class="inline-block translate-y-1">{label}</span>
	</button>
{/snippet}

<script lang="ts">
	import Keyboard from 'svelte-keyboard';
	import Wheel from '$lib/components/Wheel.svelte';
	import { GAME_STATES, type TGameState } from '$lib/constants';
	import Logo from '$lib/components/Logo.svelte';
	import WheelBackgroundWithDots from '$lib/components/WheelBackgroundWithDots.svelte';
	import Indicator from '$lib/components/Indicator.svelte';
	import BackButton from '$lib/components/BackButton.svelte';

	let segmentColor = $state('#FF6B6B');
	let gameState = $state(GAME_STATES.QUIZ) as TGameState;
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
			choices: ['YES', 'NO', 'Only via a third-party tool ly via a third-party tool'],
			correct: 'A',
			explanation:
				'Only Akixi fills this gap with real-time missed call tracking, optimising revenue and customer satisfaction.'
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
			{#if finalSegment}
				<div class="my-auto text-center text-[7.33rem] leading-none">
					<div class="font-apertura-black">You landed on</div>
					{@render splitText(finalSegment.text)}
				</div>
				<div class="my-auto flex items-center justify-center">
					{@render button({ label: 'Continue', onclick: () => (gameState = GAME_STATES.QUIZ) })}
				</div>
			{/if}
		{:else if gameState === GAME_STATES.QUIZ}
			{#if finalSegment}
				<div class="mt-32 flex h-full w-full flex-col items-center text-[7.33rem]">
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
						{#each ['A', 'B', 'C'] as answer}
							<button
								class="shadow-box relative aspect-square w-[15.28rem] rounded-[2.29rem]"
								style="background: {answer === 'A'
									? '#22f4ad'
									: answer === 'B'
										? '#4450ff'
										: '#1cd2fa'}"
								onclick={() => selectAnswer(answer as 'A' | 'B' | 'C')}
							>
								<span
									class="font-apertura-black inline-block translate-y-5 text-[12.98rem] leading-none {answer ===
									'C'
										? '-translate-x-2'
										: ''}"
								>
									{answer}
								</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		{:else if gameState === GAME_STATES.RESULT}
			{#if finalSegment && selectedAnswer}
				<div class="mt-32 flex h-full w-full flex-col items-center text-[7.33rem]">
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
		class="font-apertura-black bg-vivid-sky cursor-pointer rounded-[2.29rem] px-48 py-12 text-[6.11rem] leading-none text-[#23475F]"
	>
		<span class="inline-block translate-y-1">{label}</span>
	</button>
{/snippet}

{#snippet splitText(text: string)}
	<div class="font-apertura-black text-vivid-sky text-shadow-small">
		{#if text.split(' ').length && text.split(' ').length > 1}
			{text.split(' ').slice(0, -1).join(' ')}
			<span class="text-aquamarineo">{text.split(' ').pop()}</span>
		{:else}
			{text}
		{/if}
	</div>
{/snippet}

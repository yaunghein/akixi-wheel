<script lang="ts">
	import Keyboard from 'svelte-keyboard';
	import Wheel from '$lib/components/Wheel.svelte';
	import { GAME_STATES, type TGameState } from '$lib/constants';
	import Logo from '$lib/components/Logo.svelte';
	import WheelBackgroundWithDots from '$lib/components/WheelBackgroundWithDots.svelte';
	import Indicator from '$lib/components/Indicator.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import toast from 'svelte-french-toast';

	const TOAST_CONFIG = {
		position: 'bottom-center',
		duration: 3000
	} as const;

	const BACKGROUND_FADE_DURATION = 2000;

	let segmentColor = $state('#FF6B6B');
	let gameState = $state(GAME_STATES.START) as TGameState;
	let showWheel = $derived(gameState === GAME_STATES.START || gameState === GAME_STATES.SPIN);
	let isOnline = $state(browser ? navigator.onLine : true);

	// Volume control state
	let showVolumePopup = $state(false);
	let spinVolume = $state(0.1011);
	let otherVolume = $state(0.5);
	let backgroundVolume = $state(0.05);

	let clickSound: HTMLAudioElement | null = $state(null);
	let tadaSound: HTMLAudioElement | null = $state(null);
	let correctSound: HTMLAudioElement | null = $state(null);
	let wrongSound1: HTMLAudioElement | null = $state(null);
	let wrongSound2: HTMLAudioElement | null = $state(null);
	let backgroundSound: HTMLAudioElement | null = $state(null);
	let congratulationsSound: HTMLAudioElement | null = $state(null);
	let hardLuckSound: HTMLAudioElement | null = $state(null);
	let landedSound: HTMLAudioElement | null = $state(null);
	let questionSound: HTMLAudioElement | null = $state(null);
	let rightAnswerSound: HTMLAudioElement | null = $state(null);
	let wrongAnswerSound: HTMLAudioElement | null = $state(null);
	let spinningSound: HTMLAudioElement | null = $state(null);
	let typeSound: HTMLAudioElement | null = $state(null);

	let rotation = $state(0);
	let lastPosition = $state(0);

	onMount(() => {
		clickSound = new Audio('/sounds/click2.mp3');
		tadaSound = new Audio('/sounds/congratulations.mp3');
		// tadaSound = new Audio('/sounds/tada.mp3');
		correctSound = new Audio('/sounds/correct.wav');
		wrongSound1 = new Audio('/sounds/wrong1.wav');
		wrongSound2 = new Audio('/sounds/wrong2.mp3');
		backgroundSound = new Audio('/sounds/background.mp3');
		congratulationsSound = new Audio('/sounds/congratulations.mp3');
		hardLuckSound = new Audio('/sounds/hard-luck.mp3');
		landedSound = new Audio('/sounds/landed.mp3');
		questionSound = new Audio('/sounds/question.mp3');
		rightAnswerSound = new Audio('/sounds/right-answer.wav');
		spinningSound = new Audio('/sounds/spinning2.mp3');
		wrongAnswerSound = new Audio('/sounds/wrong-answer.mp3');
		typeSound = new Audio('/sounds/ios-type.mp3');

		// Set initial volumes
		if (spinningSound) spinningSound.volume = spinVolume;
		[
			clickSound,
			tadaSound,
			correctSound,
			wrongSound1,
			wrongSound2,
			backgroundSound,
			congratulationsSound,
			hardLuckSound,
			landedSound,
			questionSound,
			rightAnswerSound,
			wrongAnswerSound,
			typeSound
		].forEach((sound) => {
			if (sound) sound.volume = otherVolume;
		});

		// Add keyboard event listener for volume popup
		if (browser) {
			window.addEventListener('keydown', (e) => {
				if (e.shiftKey && e.key.toLowerCase() === 's') {
					showVolumePopup = !showVolumePopup;
					if (clickSound) {
						clickSound.currentTime = 0;
						clickSound.volume = otherVolume;
						clickSound.play();
					}
				}
			});
		}

		// Wait for all sounds to load
		Promise.all([
			new Promise((resolve) => {
				if (clickSound) clickSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (tadaSound) tadaSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (correctSound) correctSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (wrongSound1) wrongSound1.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (wrongSound2) wrongSound2.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (backgroundSound)
					backgroundSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (congratulationsSound)
					congratulationsSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (hardLuckSound)
					hardLuckSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (landedSound) landedSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (questionSound)
					questionSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (rightAnswerSound)
					rightAnswerSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (spinningSound)
					spinningSound.addEventListener('canplaythrough', resolve, { once: true });
			}),
			new Promise((resolve) => {
				if (wrongAnswerSound)
					wrongAnswerSound.addEventListener('canplaythrough', resolve, { once: true });
			})
		]).then(() => {
			// All sounds are loaded and ready to play
			clickSound?.load();
			tadaSound?.load();
			correctSound?.load();
			wrongSound1?.load();
			wrongSound2?.load();
			backgroundSound?.load();
			congratulationsSound?.load();
			hardLuckSound?.load();
			landedSound?.load();
			questionSound?.load();
			rightAnswerSound?.load();
			spinningSound?.load();
			wrongAnswerSound?.load();
			typeSound?.load();
		});

		// Add online/offline event listeners
		if (browser) {
			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);

			// Check for stored form submissions when coming online
			if (isOnline) {
				processStoredSubmissions();
			}
		}

		const fadeVolume = (audio: HTMLAudioElement, from: number, to: number, duration: number) => {
			const steps = 30;
			const stepTime = duration / steps;
			let currentStep = 0;
			const volumeStep = (to - from) / steps;
			audio.volume = from;
			const interval = setInterval(() => {
				currentStep++;
				audio.volume = Math.max(0, Math.min(1, audio.volume + volumeStep));
				if (currentStep >= steps) {
					audio.volume = to;
					clearInterval(interval);
				}
			}, stepTime);
		};

		const playBackground = () => {
			if (backgroundSound) {
				backgroundSound.loop = false; // We'll handle looping manually
				backgroundSound.volume = 0;
				backgroundSound.currentTime = 0;
				backgroundSound.play();

				// Fade in
				fadeVolume(backgroundSound, 0, backgroundVolume, BACKGROUND_FADE_DURATION);

				const fadeOutDuration = BACKGROUND_FADE_DURATION;
				const onTimeUpdate = () => {
					if (
						backgroundSound &&
						backgroundSound.duration &&
						backgroundSound.currentTime > backgroundSound.duration - fadeOutDuration / 1000
					) {
						// Fade out only once per loop
						backgroundSound.removeEventListener('timeupdate', onTimeUpdate);
						fadeVolume(backgroundSound, backgroundSound.volume, 0, BACKGROUND_FADE_DURATION);
					}
				};

				backgroundSound.addEventListener('timeupdate', onTimeUpdate);

				backgroundSound.onended = () => {
					if (backgroundSound) {
						// Reset and loop
						backgroundSound.currentTime = 0;
						backgroundSound.volume = 0;
						backgroundSound.play();
						fadeVolume(backgroundSound, 0, backgroundVolume, BACKGROUND_FADE_DURATION);
						backgroundSound.addEventListener('timeupdate', onTimeUpdate);
					}
				};
			}
		};

		document.addEventListener('click', playBackground, { once: true });
		// playBackground();

		return () => {
			if (browser) {
				window.removeEventListener('online', handleOnline);
				window.removeEventListener('offline', handleOffline);
			}
		};
	});

	const handleOnline = () => {
		isOnline = true;
		toast.success('Back online!', TOAST_CONFIG);
		processStoredSubmissions();
	};

	const handleOffline = () => {
		isOnline = false;
		toast.error('Offline! Data will be saved locally.', TOAST_CONFIG);
	};

	const processStoredSubmissions = () => {
		const storedSubmissions = localStorage.getItem('userResults');
		if (storedSubmissions) {
			try {
				const submissions = JSON.parse(storedSubmissions);
				submissions.forEach((submission: FormState) => {
					console.log('Processing stored submission:', submission);
				});
				// Clear stored submissions after processing
				localStorage.removeItem('userResults');
				toast.success('Successfully synced offline data!', TOAST_CONFIG);
			} catch (error) {
				console.error('Error processing stored submissions:', error);
				toast.error('Failed to process offline data', TOAST_CONFIG);
			}
		}
	};

	const handleFormSubmit = () => {
		if (!validateForm()) {
			return;
		}
		gameState = GAME_STATES.SPIN;
	};

	type QuizQuestion = {
		text: string;
		choices: string[];
		correct: 'A' | 'B' | 'C';
		explanation: string | null;
	};

	type WheelSegment = {
		text: string;
		color: string;
		question: QuizQuestion;
	};

	// let finalSegment: WheelSegment | null = $state({
	// 	text: 'CX Analytics',
	// 	color: '#22f4ad',
	// 	question: {
	// 		text: 'Which of the following best describes the primary function of Akixi CX Analytics?',
	// 		choices: [
	// 			'A messaging platform',
	// 			'Video conferencing and screen sharing tool',
	// 			'A call analytics solution that provides real-time and historical insights into call data'
	// 		],
	// 		correct: 'C',
	// 		explanation: null
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
			toast.error('First name is required', TOAST_CONFIG);
			return false;
		}
		if (!formState.last_name.trim()) {
			toast.error('Last name is required', TOAST_CONFIG);
			return false;
		}
		if (formState.email.trim() && !validateEmail(formState.email)) {
			toast.error('Please enter a valid email address', TOAST_CONFIG);
			return false;
		}
		return true;
	};

	const playTypeSound = () => {
		if (typeSound) {
			typeSound.currentTime = 0;
			typeSound.play();
		}
	};

	const onKeydown = (event: { detail: string }) => {
		playTypeSound();

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
			} else if (key === 'Space') {
				formState[fieldName] = formState[fieldName] + ' ';
			} else if (key.length === 1) {
				formState[fieldName] = formState[fieldName] + key;
			}

			// Move caret to end and scroll input so last character is visible
			const len = formState[fieldName].length;
			requestAnimationFrame(() => {
				if (activeField) {
					activeField.focus();
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
			clickSound.currentTime = 0;
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
			clickSound.currentTime = 0;
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
		// if (gameState === GAME_STATES.START) {
		// 	if (backgroundSound) {
		// 		backgroundSound.play();
		// 	}
		// }
		// if (gameState === GAME_STATES.FORM) {
		// 	if (backgroundSound) {
		// 		backgroundSound.pause();
		// 	}
		// }
		if (gameState !== GAME_STATES.START) {
			if (spinningSound) {
				spinningSound.pause();
			}
		}
		if (gameState === GAME_STATES.LANDED) {
			if (landedSound) {
				landedSound.currentTime = 0;
				landedSound.play();
			}
		}
		if (gameState === GAME_STATES.QUIZ) {
			if (questionSound) {
				questionSound.currentTime = 0;
				questionSound.loop = true;
				questionSound.play();
			}
		}
		if (gameState !== GAME_STATES.QUIZ) {
			if (questionSound) {
				questionSound.pause();
			}
		}

		if (gameState === GAME_STATES.RESULT && isCorrect) {
			if (correctSound) {
				correctSound.currentTime = 0;
				correctSound.play();
			}
		}
		if (gameState === GAME_STATES.RESULT && !isCorrect) {
			if (wrongAnswerSound) {
				wrongAnswerSound.currentTime = 0;
				wrongAnswerSound.play();
			}
		}

		if (gameState === GAME_STATES.FINAL && isCorrect) {
			if (tadaSound) {
				tadaSound.currentTime = 0;
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

		if (gameState === GAME_STATES.FINAL && !isCorrect) {
			if (hardLuckSound) {
				hardLuckSound.currentTime = 0;
				hardLuckSound.play();
			}
		}
	});

	$effect(() => {
		if (gameState === GAME_STATES.RESULT) {
			const timer = setTimeout(() => {
				gameState = GAME_STATES.FINAL;
			}, 5000);
			return () => clearTimeout(timer);
		}
	});

	const playClickSound = () => {
		if (clickSound) {
			clickSound.currentTime = 0;
			clickSound.play();
		}
	};

	const handleUserResult = () => {
		const data = {
			first_name: formState.first_name,
			last_name: formState.last_name,
			email: formState.email,
			segment: finalSegment?.text ?? null,
			answer: selectedAnswer,
			correct: isCorrect,
			timestamp: new Date().toISOString()
		};
		if (isOnline) {
			// For now, just log. Replace with API call if needed.
			console.log('User result submitted:', data);
			toast.success('Result saved successfully!', TOAST_CONFIG);
		} else {
			// Save to localStorage for later processing
			const storedResults = localStorage.getItem('userResults');
			let results = [];
			if (storedResults) {
				try {
					results = JSON.parse(storedResults);
				} catch (e) {
					console.error('Error parsing userResults:', e);
					toast.error('Failed to save result offline', TOAST_CONFIG);
					return;
				}
			}
			results.push(data);
			localStorage.setItem('userResults', JSON.stringify(results));
			toast.success('Result saved offline.', TOAST_CONFIG);
		}
	};

	const video = (element: HTMLVideoElement) => {
		element.muted = true;
		element.loop = true;
		element.playsInline = true;

		const play = () => {
			element.play().catch((error) => {
				console.error('Error playing video:', error);
			});
		};
		document.addEventListener('click', play, { once: true });

		return {
			destroy() {
				document.removeEventListener('click', play);
			}
		};
	};

	$effect(() => {
		// Update spinning sound volume
		if (spinningSound) {
			spinningSound.volume = spinVolume;
		}

		// Update other sounds volume
		[
			clickSound,
			tadaSound,
			correctSound,
			wrongSound1,
			wrongSound2,
			backgroundSound,
			congratulationsSound,
			hardLuckSound,
			landedSound,
			questionSound,
			rightAnswerSound,
			wrongAnswerSound,
			typeSound
		].forEach((sound) => {
			if (sound) sound.volume = otherVolume;
		});

		// Update background sound volume
		if (backgroundSound) {
			backgroundSound.volume = backgroundVolume;
		}
	});

	const handlePopupClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.classList.contains('volume-popup-overlay')) {
			showVolumePopup = false;
			if (clickSound) {
				clickSound.currentTime = 0;
				clickSound.volume = otherVolume;
				clickSound.play();
			}
		}
	};

	const handlePopupKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			showVolumePopup = false;
			if (clickSound) {
				clickSound.currentTime = 0;
				clickSound.volume = otherVolume;
				clickSound.play();
			}
		}
	};
</script>

<main
	class="bg-electric-indigo flex min-h-screen items-center justify-center overflow-hidden text-white transition-colors duration-500"
>
	<!-- <img
			src="/images/background.webp"
			alt="Background"
			class="absolute inset-0 h-full w-full object-cover"
		/> -->
	<video
		use:video
		muted
		loop
		playsinline
		autoplay
		class="absolute inset-0 h-full w-full object-cover"
	>
		<source src="/videos/background-2k-2.mp4" type="video/mp4" />
		<!-- <source src="/videos/background.webm" type="video/webm" /> -->
	</video>
	{#if showVolumePopup}
		<div
			transition:fade={{ duration: 300 }}
			class="volume-popup-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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
									{backgroundVolume}
								</span>
							</div>
							<input
								id="backgroundVolume"
								type="range"
								min="0.0001"
								max="1"
								step="0.001"
								bind:value={backgroundVolume}
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
									{spinVolume}
								</span>
							</div>
							<input
								id="spinVolume"
								type="range"
								min="0.0001"
								max="1"
								step="0.001"
								bind:value={spinVolume}
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
									{otherVolume}
								</span>
							</div>
							<input
								id="otherVolume"
								type="range"
								min="0.0001"
								max="1"
								step="0.001"
								bind:value={otherVolume}
								class="[&::-webkit-slider-thumb]:bg-electric-indigo my-8 h-[4.12rem] w-full appearance-none rounded-[0.75rem] bg-[#D9D9D9] [&::-webkit-slider-thumb]:my-auto [&::-webkit-slider-thumb]:h-[4.12rem] [&::-webkit-slider-thumb]:w-[4.12rem] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-2xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D9D9D9]"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
	<div class="relative flex aspect-[4/7] w-full flex-col overflow-hidden pt-[13rem]">
		<div class="relative mx-auto mb-auto aspect-[1/0.27] w-[40.5rem]">
			<Logo />
		</div>
		{#if showWheel}
			{#if gameState === GAME_STATES.SPIN}
				<button
					onmouseup={() => {
						playClickSound();
						gameState = GAME_STATES.FORM;
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
						<img
							src="/images/wheel-bg.png"
							alt=""
							class="pointer-events-none absolute inset-0 aspect-square w-full -translate-y-[4.5rem] scale-[0.98] opacity-[0.6]"
						/>
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
								bind:lastPosition
								{clickSound}
								{spinningSound}
								{spinVolume}
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
					gameState = GAME_STATES.START;
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
							onmouseup={handleCheckboxChange}
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
								onclick: () => {
									playClickSound();
									handleFormSubmit();
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
			<button
				onmouseup={() => {
					playClickSound();
					gameState = GAME_STATES.SPIN;
				}}
				class="absolute top-8 right-8 aspect-[1/0.96] w-[7rem] cursor-pointer transition-transform active:scale-90"
			>
				<BackButton />
			</button>
			{#if finalSegment}
				<div class="relative my-auto text-center text-[7.33rem] leading-none">
					<div class="font-apertura-black mb-2">You landed on</div>
					{@render splitText(finalSegment.text)}
				</div>
				<div class="relative my-auto flex -translate-y-[15rem] items-center justify-center">
					{@render button({
						label: 'Continue',
						onclick: () => {
							playClickSound();
							gameState = GAME_STATES.QUIZ;
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
						class="text-shadow-small font-apertura-medium mx-auto mt-28 max-w-[80rem] text-center text-[4rem] leading-[1.2]"
					>
						{finalSegment.question.text}
					</p>
					<div class="mt-40 flex w-full max-w-[80rem] flex-col gap-20">
						{#each finalSegment.question.choices as choice, i}
							<div class="flex items-center gap-16">
								<span
									class="font-apertura-black text-shadow-small text-[12.98rem] leading-none"
									style="color: {i === 0 ? '#22f4ad' : i === 1 ? '#4450ff' : '#1cd2fa'}"
								>
									{String.fromCharCode(65 + i)}
								</span>
								<span
									class="text-shadow-small font-apertura-medium -translate-y-4 text-left text-[4rem] leading-[1.2]"
								>
									{choice}
								</span>
							</div>
						{/each}
					</div>
					<p class="text-shadow-small font-apertura-medium mt-52 text-[4.43rem] leading-none">
						Select your answer below
					</p>
					<div class="mt-20 flex gap-[16rem]">
						{#each finalSegment.question.choices as _, i}
							<button
								class="shadow-box relative aspect-square w-[15.28rem] rounded-[2.29rem] transition-transform active:scale-90"
								style="background: {i === 0 ? '#22f4ad' : i === 1 ? '#4450ff' : '#1cd2fa'}"
								onmouseup={() => {
									playClickSound();
									selectAnswer(String.fromCharCode(65 + i) as 'A' | 'B' | 'C');
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
					<div class="mt-36 flex flex-col items-center">
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
					{#if finalSegment.question.explanation}
						<p class="mx-auto mt-20 max-w-[70rem] text-center text-[4.58rem] leading-[1.2]">
							{finalSegment.question.explanation}
						</p>
					{/if}
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
						onclick: () => {
							playClickSound();
							handleUserResult();
							formState = { first_name: '', last_name: '', email: '', stay_in_touch: false };
							selectedAnswer = null;
							isCorrect = null;
							finalSegment = null;
							gameState = GAME_STATES.START;
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
						onclick: () => {
							playClickSound();
							gameState = GAME_STATES.START;
						}
					})}

					<div class="mt-20">
						{@render button({
							label: 'Try again',
							onclick: () => {
								playClickSound();
								gameState = GAME_STATES.SPIN;
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

{#snippet button({ label, onclick }: { label: string; onclick: () => void })}
	<button
		in:scale={{ duration: 500, start: 1.05, easing: bounceOut }}
		out:scale={{ duration: 300, start: 1.05 }}
		{onclick}
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

<script lang="ts">
	import { onMount } from 'svelte';
	import { GAME_STATES, type TGameState } from '$lib/constants';

	let {
		segmentColor = $bindable(),
		gameState = $bindable(),
		finalSegment = $bindable(),
		CLICK_DELAY = $bindable(200),
		clickSound,
		spinningSound,
		spinVolume,
		rotation = $bindable(0),
		lastPosition = $bindable(0)
	} = $props();

	const playClickSound = () => {
		if (clickSound) {
			clickSound.currentTime = 0;
			clickSound.play();
		}
	};

	type QuizQuestion = {
		text: string;
		choices: [string, string, string];
		correct: 'A' | 'B' | 'C';
		explanation: string | null;
	};

	type WheelSegment = {
		text: string;
		color: string;
		question: QuizQuestion;
	};

	// Sample data structure (this would come from CMS in production)
	const wheelData: WheelSegment[] = [
		{
			text: 'CX Analytics',
			color: '#22f4ad',
			question: {
				text: 'Which of the following best describes the primary function of Akixi CX Analytics?',
				choices: [
					'A messaging platform',
					'Video conferencing and screen sharing tool',
					'A call analytics solution that provides real-time and historical insights into call data'
				],
				correct: 'C',
				explanation: null
			}
		},
		{
			text: 'Wallboards',
			color: '#1cd2fa',
			question: {
				text: 'What is the primary function of Customisable Wallboards in a call centre environment?',
				choices: [
					'To automate outbound email marketing',
					'To display live data on call queues, activity levels, and KPIs for better team performance',
					'To archive historical call data for legal compliance'
				],
				correct: 'B',
				explanation: null
			}
		},
		{
			text: 'Missed Call Recovery',
			color: '#4450ff',
			question: {
				text: 'What is the primary purpose of Unreturned Lost Call Reports?',
				choices: [
					'To block spam and robocalls from reaching the call center',
					'To analyse agent performance during live calls',
					'To provide teams with data to follow up on missed calls and identify service or sales opportunities'
				],
				correct: 'C',
				explanation: null
			}
		},
		{
			text: 'Call Volume by Interval',
			color: '#1cd2fa',
			question: {
				text: 'What is the main use of Call Interval and Volume Reports?',
				choices: [
					'Tracking customer satisfaction scores',
					'Identifying peak call times to support staffing and resource planning',
					'Monitoring internet bandwidth usage during calls'
				],
				correct: 'B',
				explanation: null
			}
		},
		{
			text: 'Call History Reporting',
			color: '#22f4ad',
			question: {
				text: 'How does Call Log History support dispute resolution?',
				choices: [
					'By allowing automatic call rerouting to senior staff',
					'By tracking caller journeys to identify friction points in processes, teams, or individuals',
					'By generating sales leads from unanswered calls'
				],
				correct: 'B',
				explanation: null
			}
		},
		{
			text: 'Auto Attendant & User reports',
			color: '#4450ff',
			question: {
				text: 'What is the main benefit of User / Auto Attendant Reports?',
				choices: [
					'To schedule training sessions for support staff',
					'To measure the efficiency and customer experience provided by human and automated agents',
					'To monitor email response rates'
				],
				correct: 'B',
				explanation: null
			}
		},
		{
			text: 'Queue & Group Activity',
			color: '#1cd2fa',
			question: {
				text: 'What is the main objective of Queue and Group Activity Reports?',
				choices: [
					'To automate customer surveys after calls',
					'To monitor queue data in real-time and historically in order to identify bottlenecks and improve service',
					'To manage voicemail inboxes for multiple departments'
				],
				correct: 'B',
				explanation: null
			}
		}
	];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let isSpinning = $state(false);
	let spinSpeed = $state(0);
	let spinDeceleration = $state(0.99);
	let lastTimestamp = $state(0);
	let fontLoaded = $state(false);

	segmentColor = wheelData[0].color;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		// Set high resolution
		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		// Set initial rotation based on last position
		const segmentAngle = (2 * Math.PI) / wheelData.length;
		rotation = lastPosition * segmentAngle;

		// Load the font
		const font = new FontFace('AperturaBlack', 'url(/fonts/apertura-black.otf)');
		font
			.load()
			.then(() => {
				document.fonts.add(font);
				fontLoaded = true;
				drawWheel();
			})
			.catch((err) => {
				console.error('Font loading failed:', err);
				drawWheel(); // Fallback to default font
			});
	});

	function drawWheel() {
		if (!ctx) return;

		const centerX = canvas.width / (window.devicePixelRatio || 1) / 2;
		const centerY = canvas.height / (window.devicePixelRatio || 1) / 2;
		const radius = Math.min(centerX, centerY) - 10;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw the main wheel (fully opaque)
		drawWheelSegments(ctx, centerX, centerY, radius, rotation);
	}

	function drawWheelSegments(
		ctx: CanvasRenderingContext2D,
		centerX: number,
		centerY: number,
		radius: number,
		rotation: number
	) {
		// Draw segments
		const segmentAngle = (2 * Math.PI) / wheelData.length;
		wheelData.forEach((segment, index) => {
			const startAngle = index * segmentAngle + rotation;
			const endAngle = startAngle + segmentAngle;

			// Draw segment
			ctx.beginPath();
			ctx.moveTo(centerX, centerY);
			ctx.arc(centerX, centerY, radius, startAngle, endAngle);
			ctx.closePath();
			ctx.fillStyle = segment.color;
			ctx.fill();
			// ctx.stroke();

			// Draw text (auto-wrap based on max width)
			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.rotate(startAngle + segmentAngle / 2);
			ctx.textAlign = 'left';
			ctx.fillStyle = '#fff';
			ctx.shadowColor = '#000000';
			ctx.shadowBlur = 10;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 7.33;

			// Scale font size based on radius
			const baseFontSize = radius * 0.06; // 6% of radius
			ctx.font = `bold ${baseFontSize}px ${fontLoaded ? 'AperturaBlack' : 'Arial'}`;

			const maxTextWidth = radius * 0.5; // Reduced from 0.7 to 0.5 (50% of radius)
			const words = segment.text.split(' ');
			const lines = [];
			let currentLine = words[0];

			for (let i = 1; i < words.length; i++) {
				const word = words[i];
				const width = ctx.measureText(currentLine + ' ' + word).width;
				if (width < maxTextWidth) {
					currentLine += ' ' + word;
				} else {
					lines.push(currentLine);
					currentLine = word;
				}
			}
			lines.push(currentLine);

			const lineHeight = baseFontSize * 1.2;
			lines.forEach((line, i) => {
				ctx.fillText(line, radius * 0.4, (i - (lines.length - 1) / 2) * lineHeight);
			});

			ctx.restore();
		});

		// Draw center circle
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius * 0.05, 0, 2 * Math.PI); // 5% of radius
		ctx.fillStyle = '#fff';
		ctx.fill();
		ctx.stroke();
	}

	function animate(timestamp: number) {
		if (!lastTimestamp) lastTimestamp = timestamp;
		const deltaTime = timestamp - lastTimestamp;
		lastTimestamp = timestamp;

		if (isSpinning) {
			rotation += spinSpeed * deltaTime;
			spinSpeed *= spinDeceleration;

			const segmentAngle = (2 * Math.PI) / wheelData.length;
			// Normalize rotation to 0 to 2π
			const normalizedRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
			// Adjust for the top (pointer) being at -90 degrees (i.e., 3π/2 radians)
			const adjustedAngle = (2 * Math.PI + Math.PI * 1.5 - normalizedRotation) % (2 * Math.PI);
			const currentIndex = Math.floor(adjustedAngle / segmentAngle) % wheelData.length;
			segmentColor = wheelData[currentIndex].color;

			// decrease volume sync with spinSpeed, spinSpeed is low, volume is low
			// if (spinningSound) {
			// 	// Scale spinSpeed to a 0-1 range for volume
			// 	const maxSpeed = 0.07; // Maximum speed we expect
			// 	let volume = Math.min(Math.max(spinSpeed / maxSpeed, 0), 1);
			// 	if (volume < 0.1) {
			// 		volume = 0.1;
			// 	}
			// 	spinningSound.volume = volume;
			// }

			if (spinSpeed < 0.0001) {
				isSpinning = false;
				spinningSound.pause();
				spinSpeed = 0;
				// Normalize rotation to 0 to 2π
				const normalizedRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
				// Adjust for the top (pointer) being at -90 degrees (i.e., 3π/2 radians)
				const adjustedAngle = (2 * Math.PI + Math.PI * 1.5 - normalizedRotation) % (2 * Math.PI);
				const winningIndex = Math.floor(adjustedAngle / segmentAngle) % wheelData.length;

				// Store the normalized rotation
				lastPosition = normalizedRotation;
				console.log('Wheel landed on:', wheelData[winningIndex]);
				finalSegment = wheelData[winningIndex];
				setTimeout(() => {
					gameState = GAME_STATES.LANDED;
				}, 1000);
			}

			drawWheel();
			requestAnimationFrame(animate);
		}
	}

	function spinWheel() {
		playClickSound();

		if (gameState === GAME_STATES.START) {
			gameState = GAME_STATES.FORM;
			return;
		}

		if (!isSpinning) {
			isSpinning = true;
			spinningSound.loop = true;
			spinningSound.volume = spinVolume;
			spinningSound.currentTime = 0;
			spinningSound.play();
			// spinningSound.addEventListener('timeupdate', () => {
			// 	if (spinningSound.currentTime > 1.5) {
			// 		spinningSound.currentTime = 0;
			// 	}
			// });
			// Use the stored normalized rotation
			rotation = lastPosition;

			// Slower initial speed with smaller random variation
			spinSpeed = 0.02 + Math.random() * 0.03 + Math.random() * 0.02;
			// Add random rotation to ensure different final positions
			rotation += Math.random() * Math.PI * 2;
			lastTimestamp = 0;
			requestAnimationFrame(animate);
		}
	}
</script>

<div class="relative mx-auto flex aspect-square w-full max-w-[90vw] items-center justify-center">
	<canvas bind:this={canvas} class="block aspect-square h-full rounded-full"></canvas>
	<button
		onmouseup={spinWheel}
		class="font-apertura-black absolute top-1/2 left-1/2 flex aspect-square h-[19.55rem] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[1rem] border-[#23475F] bg-white text-[5.2rem] leading-none text-[#23475F] uppercase transition-all duration-300 active:scale-90 disabled:cursor-not-allowed"
		disabled={isSpinning}
	>
		<span class="translate-y-3 whitespace-nowrap">
			{#if gameState === GAME_STATES.START}
				Start
			{:else}
				Spin
			{/if}
		</span>
	</button>
	<div
		class="border-oxford-blue/20 pointer-events-none absolute inset-8 rounded-[100vw] border-[2.8rem] sm:inset-2 sm:border-[3.2rem]"
	></div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';

	let { segmentColor = $bindable() } = $props();

	// Sample data structure (this would come from CMS in production)
	const wheelData = [
		{ text: 'Free Coffee', color: '#FF6B6B' },
		{ text: '10% Discount', color: '#4ECDC4' },
		{ text: 'Free Consultation Call', color: '#45B7D1' },
		{ text: 'Buy One Get One Free', color: '#96CEB4' },
		{ text: 'Mystery Prize Inside', color: '#FFEEAD' },
		{ text: '$25 Voucher Code', color: '#D4A5A5' },
		{ text: 'Exclusive Gift Box Offer', color: '#9B59B6' }
	];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let rotation = $state(0);
	let isSpinning = $state(false);
	let spinSpeed = $state(0);
	let spinDeceleration = $state(0.995);
	let lastTimestamp = $state(0);

	segmentColor = wheelData[0].color;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		// Set high resolution
		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);
		drawWheel();
	});

	function drawWheel() {
		if (!ctx) return;

		const centerX = canvas.width / (window.devicePixelRatio || 1) / 2;
		const centerY = canvas.height / (window.devicePixelRatio || 1) / 2;
		const radius = Math.min(centerX, centerY) - 10;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

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
			ctx.stroke();

			// Draw text (auto-wrap based on max width)
			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.rotate(startAngle + segmentAngle / 2);
			ctx.textAlign = 'right';
			ctx.fillStyle = '#000';

			// Scale font size based on radius
			const baseFontSize = radius * 0.06; // 6% of radius
			ctx.font = `bold ${baseFontSize}px Arial`;

			const maxTextWidth = radius * 0.7; // 70% of radius
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
				ctx.fillText(line, radius * 0.85, (i - (lines.length - 1) / 2) * lineHeight);
			});

			ctx.restore();
		});

		// Draw center circle
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius * 0.05, 0, 2 * Math.PI); // 5% of radius
		ctx.fillStyle = '#fff';
		ctx.fill();
		ctx.stroke();

		// Draw pointer triangle at the top
		ctx.save();
		ctx.translate(centerX, 0);
		ctx.beginPath();
		const pointerSize = radius * 0.04; // 4% of radius
		ctx.moveTo(-pointerSize, 0);
		ctx.lineTo(pointerSize, 0);
		ctx.lineTo(0, pointerSize * 1.5);
		ctx.closePath();
		ctx.fillStyle = '#333';
		ctx.fill();
		ctx.restore();
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

			if (spinSpeed < 0.0001) {
				isSpinning = false;
				spinSpeed = 0;
				// Normalize rotation to 0 to 2π
				const normalizedRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

				// Adjust for the top (pointer) being at -90 degrees (i.e., 3π/2 radians)
				const adjustedAngle = (2 * Math.PI + Math.PI * 1.5 - normalizedRotation) % (2 * Math.PI);

				// Determine which segment is at the pointer
				const winningIndex = Math.floor(adjustedAngle / segmentAngle) % wheelData.length;

				console.log('Wheel landed on:', wheelData[winningIndex]);
			}

			drawWheel();
			requestAnimationFrame(animate);
		}
	}

	function spinWheel() {
		if (!isSpinning) {
			isSpinning = true;
			// Random initial speed between 0.02 and 0.03 for more dramatic spins
			spinSpeed = 0.02 + Math.random() * 0.01;
			lastTimestamp = 0;
			requestAnimationFrame(animate);
		}
	}
</script>

<div class="relative flex h-full w-full flex-col items-center p-4">
	<div
		class="relative mx-auto flex aspect-square max-h-[90vh] w-full max-w-[90vw] items-center justify-center"
	>
		<canvas
			bind:this={canvas}
			class="block aspect-square h-full rounded-full bg-white shadow-2xl"
			style="border: 1px solid black;"
		></canvas>
		<button
			onclick={spinWheel}
			class="absolute top-1/2 left-1/2 flex aspect-square h-[10vh] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black bg-white text-[2vh] font-bold text-black shadow-lg transition-all duration-300 active:scale-90 disabled:cursor-not-allowed disabled:bg-gray-300"
			disabled={isSpinning}
		>
			<span class="whitespace-nowrap">Spin</span>
		</button>
	</div>
</div>

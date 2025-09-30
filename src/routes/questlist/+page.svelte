<script lang="ts">
	import { useQuery } from '@sanity/svelte-loader';
	import { eventQuery } from '$lib/queries';
	import { getAudioState } from '$lib/states/audio.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	
	let { initial } = data;
	const query = useQuery<any>(eventQuery, {}, { initial });
	
	const audioState = getAudioState();

	// Function to get the letter for choices (A, B, C)
	const getChoiceLetter = (index: number): 'A' | 'B' | 'C' => {
		return ['A', 'B', 'C'][index] as 'A' | 'B' | 'C';
	};

	// Function to handle navigation back to wheel
	const goBackToWheel = () => {
		audioState.play('click');
		window.location.href = '/';
	};
</script>

<svelte:head>
	<title>Game Questions - Spin & Win by Akixi</title>
	<meta name="description" content="Review all quiz questions and their correct answers" />
</svelte:head>

<main class="bg-gradient-to-b from-[#4450FF] to-[#2A35CC] min-h-screen text-white">
	<div class="container mx-auto px-8 py-12">
		<!-- Header -->
		<div class="text-center mb-12">
			<!-- Back Button -->
			<button
				on:mouseup={goBackToWheel}
				class="absolute top-8 left-8 w-12 h-12 bg-black/30 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="m15 18-6-6 6-6"/>
				</svg>
			</button>

			<!-- Akixi Logo -->
			<div class="flex items-center justify-center gap-2 mb-8">
				<div class="text-[3rem] font-apertura-black text-white">akixi</div>
				<div class="w-8 h-8 bg-[#1CD2FA] rounded-lg flex items-center justify-center">
					<span class="text-white font-bold text-sm">CX</span>
				</div>
			</div>

			<!-- Main Title -->
			<h1 class="text-[4rem] md:text-[5rem] font-apertura-black text-[#1CD2FA] mb-4 leading-none">
				SPIN & WIN
			</h1>

			<!-- Section Header -->
			<div class="mt-16 mb-8">
				<h2 class="text-[2.5rem] font-apertura-black text-white mb-2">GAME QUESTIONS</h2>
				<p class="text-[1.8rem] font-apertura-medium text-[#1CD2FA]">Correct Answer</p>
			</div>
		</div>

		<!-- Questions List -->
		<div class="max-w-[80rem] mx-auto space-y-8">
			{#if $query.data?.segments}
				{#each $query.data.segments as segment, segmentIndex (segment._id)}
					<div class="p-8">
						<!-- Question Number and Title -->
						<div class="mb-6">
							<h3 class="text-[2rem] font-apertura-black text-[#1CD2FA] mb-2">
								{segmentIndex + 1}.{segment.text}
							</h3>
						</div>

						{#if segment.question}
							<!-- Question Text -->
							<div class="mb-6">
								<p class="text-[1.8rem] font-apertura-medium text-white leading-relaxed">
									"{segment.question.text}"
								</p>
							</div>

							<!-- Answer Choices -->
							<div class="space-y-3">
								{#each segment.question.choices as choice, choiceIndex}
									{@const isCorrect = getChoiceLetter(choiceIndex) === segment.question.correct}
									<div class="flex items-center gap-4 p-4 rounded-xl bg-transparent">
										<span class="text-[2.5rem] font-apertura-medium {isCorrect ? 'text-[#1CD2FA]' : 'text-white'} min-w-[2rem]">
											{getChoiceLetter(choiceIndex)}.
										</span>
										<span class="text-[2.5rem] font-apertura-medium {isCorrect ? 'text-[#1CD2FA]' : 'text-white'} flex-1">
											{choice}
										</span>
									</div>
								{/each}
							</div>

							<!-- Explanation (if available) -->
							{#if segment.question.explanation}
								<div class="mt-6 pt-4 border-t border-white/20">
									<p class="text-[1.4rem] font-apertura-medium text-white/70 italic">
										{segment.question.explanation}
									</p>
								</div>
							{/if}
						{:else}
							<p class="text-[1.6rem] text-white/60 italic">No question available for this segment</p>
						{/if}
					</div>
				{/each}
			{:else}
				<div class="text-center py-16">
					<p class="text-[2rem] text-white/60">No questions available</p>
				</div>
			{/if}
		</div>

		<!-- Bottom Spacing -->
		<div class="h-16"></div>
	</div>
</main>
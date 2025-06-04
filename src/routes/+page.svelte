<script lang="ts">
	import Wheel from '$lib/components/Wheel.svelte';
	let segmentColor = $state('#FF6B6B');
</script>

<main
	class="flex min-h-screen items-center justify-center transition-colors duration-500"
	style={`background: ${segmentColor}`}
>
	<div class="flex aspect-[4/7] h-full w-[90%] flex-col items-center justify-between py-8">
		<div class="flex w-full flex-1 items-center justify-center">
			<Wheel bind:segmentColor />
		</div>
	</div>
</main>

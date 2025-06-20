<script lang="ts">
	let { text }: { text: string } = $props();
</script>

<div class="font-apertura-black text-vivid-sky text-shadow-small leading-[1.2]">
	{#if text.split(' ').length && text.split(' ').length > 1}
		{text.split(' ').slice(0, -1).join(' ')}
		<span class="text-aquamarineo">{text.split(' ').pop()}</span>
	{:else}
		{text}
	{/if}
</div>

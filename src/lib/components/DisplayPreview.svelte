<script lang="ts">
	import { isPreviewing } from '@sanity/svelte-loader';
</script>

{#if $isPreviewing}
	<div>Previews Enabled</div>
{:else}
	<div>Previews Disabled</div>
{/if}

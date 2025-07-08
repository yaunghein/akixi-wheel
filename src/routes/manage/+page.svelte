<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/utils/toast';
	import type { SubmitFunction } from '@sveltejs/kit';

	const bulkDelete: SubmitFunction = ({ formElement, formData, action, cancel, submitter }) => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Submissions deleted');
			}
		};
	};
</script>

<form method="POST" action="?/delete" use:enhance={bulkDelete}>
	<input type="hidden" name="type" value="submission" />
	<button class="text-5xl text-white">Delete Submissions</button>
</form>

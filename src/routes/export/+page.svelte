<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/utils/toast';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { client } from '$lib/utils/sanity';
	import { slugify } from '$lib/utils/slugify';

	let { data } = $props();
	let currentEvent = $state<string>(data.events[0]._id);
	let submissions = $state<any[]>([]);

	$effect(() => {
		client.fetch(`*[_type == "submission" && event._ref == "${currentEvent}"]`).then((d) => {
			submissions = d;
		});
	});

	const formattedSubmissions = $derived(
		submissions.map((sub: any) => ({
			first_name: sub.first_name || 'N/A',
			last_name: sub.last_name || 'N/A',
			email: sub.email || 'N/A'
		}))
	);

	function exportToCSV() {
		if (formattedSubmissions.length === 0) return;

		// Get the current event name for the filename
		const currentEventName =
			data.events.find((e: any) => e._id === currentEvent)?.name || 'submissions';
		const slugifiedEventName = slugify(currentEventName);

		// Create CSV content
		const headers = ['First Name', 'Last Name', 'Email'];
		const csvContent = [
			headers.join(','),
			...formattedSubmissions.map((sub) =>
				[`"${sub.first_name}"`, `"${sub.last_name}"`, `"${sub.email}"`].join(',')
			)
		].join('\n');

		// Create and download the file
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `${slugifiedEventName}-submissions.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	// const bulkDelete: SubmitFunction = ({ formElement, formData, action, cancel, submitter }) => {
	// 	return async ({ result, update }) => {
	// 		if (result.type === 'success') {
	// 			toast.success('Submissions deleted');
	// 		}
	// 	};
	// };
</script>

<div class="min-h-screen bg-white p-4 text-base">
	<div class="mx-auto max-w-6xl">
		<!-- Event Selector -->
		<div class="mb-4">
			<select
				name="event"
				id="event"
				bind:value={currentEvent}
				class="font-apertura-medium w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 pt-[0.65rem] text-black focus:ring-1 focus:ring-gray-500 focus:outline-none"
			>
				{#each data.events as event}
					<option value={event._id} class="bg-white text-black">
						{event.name}
						{event.active ? '(Active)' : ''}
					</option>
				{/each}
			</select>
		</div>

		<div>
			<div class="mb-4 text-center">
				<button
					onclick={() => exportToCSV()}
					class="font-apertura-medium cursor-pointer rounded-lg bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
				>
					Export CSV
				</button>
			</div>
		</div>

		<!-- Submissions Table -->
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			{#if formattedSubmissions.length === 0}
				<div class="py-8 text-center">
					<p class="text-gray-500">No submissions found</p>
				</div>
			{:else}
				<!-- Export Button -->

				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-gray-200">
								<th class="font-apertura-medium px-3 py-2 text-left text-sm text-black">
									First Name
								</th>
								<th class="font-apertura-medium px-3 py-2 text-left text-sm text-black">
									Last Name
								</th>
								<th class="font-apertura-medium px-3 py-2 text-left text-sm text-black"> Email </th>
							</tr>
						</thead>
						<tbody>
							{#each formattedSubmissions as submission, index}
								<tr class="border-b border-gray-100 hover:bg-gray-50">
									<td class="px-3 py-2">
										<span class="text-sm text-black">
											{submission.first_name}
										</span>
									</td>
									<td class="px-3 py-2">
										<span class="text-sm text-black">
											{submission.last_name}
										</span>
									</td>
									<td class="px-3 py-2">
										<span class="text-sm text-gray-600">
											{submission.email}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="mt-3 text-center">
					<p class="text-xs text-gray-500">
						Total: {formattedSubmissions.length}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

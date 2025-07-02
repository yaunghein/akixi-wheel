/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { IDB } from './lib/db';

const sw = self as unknown as ServiceWorkerGlobalScope;

/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files // everything in `static`
];

sw.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200 && event.request.url.startsWith('http')) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});

sw.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		sw.skipWaiting();
	}
});

const submit = async (data: any) => {
	const response = await fetch('/api/submit', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	console.log('[SUBMIT] response', response);

	if (!response.ok) {
		throw new Error('Failed to submit');
	}

	return response.json();
};

async function syncSubmissions() {
	console.log('[SYNC] syncSubmissions');
	const keys = await IDB.getAllKeys();

	for (const key of keys) {
		console.log('[SYNC] key', key);
		const data = await IDB.getByKey(key);
		const datax = await submit({
			_type: 'submission',
			...data
		});
		console.log('[SUBMIT] datax', datax);

		if (datax.success) {
			await IDB.deletebyKey(key);
			console.log('[DB] removed', key);
			console.log('[SUBMISSION]', datax);
		}
	}

	// Notify all open pages
	const clientsList = await (self as any).clients.matchAll();
	for (const client of clientsList) {
		client.postMessage({
			type: 'sync-complete'
		});
	}
}

sw.addEventListener('sync', function (event: any) {
	console.log('[SYNC] event', event);
	if (event.tag === 'submissions') {
		event.waitUntil(syncSubmissions());
	}
});

const DB_NAME = 'akixi-wheel';
const DB_VERSION = 1;
const STORE_NAME = 'submissions';

export const IDB = {
	initialize() {
		return new Promise<void>((resolve, reject) => {
			// Create a new DB
			const request = indexedDB.open(DB_NAME, DB_VERSION);
			request.onupgradeneeded = function () {
				request.result.createObjectStore(STORE_NAME);
				resolve();
			};
			request.onerror = function () {
				reject(request.error);
			};
		});
	},

	getByKey(key: any) {
		return new Promise<any>((resolve, reject) => {
			const oRequest = indexedDB.open(DB_NAME, DB_VERSION);
			oRequest.onsuccess = function () {
				const db = oRequest.result;
				const tx = db.transaction(STORE_NAME, 'readonly');
				const st = tx.objectStore(STORE_NAME);
				const gRequest = st.get(key);
				gRequest.onsuccess = function () {
					resolve(gRequest.result);
				};
				gRequest.onerror = function () {
					reject(gRequest.error);
				};
			};
			oRequest.onerror = function () {
				reject(oRequest.error);
			};
		});
	},

	setByKey(key: any, value: any) {
		return new Promise<void>((resolve, reject) => {
			const oRequest = indexedDB.open(DB_NAME, DB_VERSION);
			oRequest.onsuccess = function () {
				const db = oRequest.result;
				const tx = db.transaction(STORE_NAME, 'readwrite');
				const st = tx.objectStore(STORE_NAME);
				const sRequest = st.put(value, key);
				sRequest.onsuccess = function () {
					resolve();
				};
				sRequest.onerror = function () {
					reject(sRequest.error);
				};
			};
			oRequest.onerror = function () {
				reject(oRequest.error);
			};
		});
	},

	deletebyKey(key: any) {
		return new Promise<void>((resolve, reject) => {
			const oRequest = indexedDB.open(DB_NAME, DB_VERSION);
			oRequest.onsuccess = function () {
				const db = oRequest.result;
				const tx = db.transaction(STORE_NAME, 'readwrite');
				const st = tx.objectStore(STORE_NAME);
				const rRequest = st.delete(key);
				rRequest.onsuccess = function () {
					resolve();
				};
				rRequest.onerror = function () {
					reject(rRequest.error);
				};
			};
			oRequest.onerror = function () {
				reject(oRequest.error);
			};
		});
	},

	getAllKeys() {
		return new Promise<any[]>((resolve, reject) => {
			const oRequest = indexedDB.open(DB_NAME, DB_VERSION);
			oRequest.onsuccess = function () {
				const db = oRequest.result;
				const tx = db.transaction(STORE_NAME, 'readonly');
				const st = tx.objectStore(STORE_NAME);
				const kRequest = st.getAllKeys();
				kRequest.onsuccess = function () {
					resolve(kRequest.result);
				};
				kRequest.onerror = function () {
					reject(kRequest.error);
				};
			};
			oRequest.onerror = function () {
				reject(oRequest.error);
			};
		});
	}
};

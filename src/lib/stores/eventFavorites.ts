import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY_PREFIX = 'vasy_event_favorites_';

function getKey(userId: string | null): string {
	return userId ? `${STORAGE_KEY_PREFIX}${userId}` : `${STORAGE_KEY_PREFIX}guest`;
}

function createEventFavoritesStore() {
	const { subscribe, set, update } = writable<string[]>([]);

	let currentKey = getKey(null);

	function persist(ids: string[]) {
		if (browser) localStorage.setItem(currentKey, JSON.stringify(ids));
	}

	return {
		subscribe,

		init(userId: string | null) {
			currentKey = getKey(userId);
			if (browser) {
				const stored = localStorage.getItem(currentKey);
				set(stored ? JSON.parse(stored) : []);
			}
		},

		toggle(eventId: string) {
			update((ids) => {
				const next = ids.includes(eventId)
					? ids.filter((id) => id !== eventId)
					: [...ids, eventId];
				persist(next);
				return next;
			});
		},

		remove(eventId: string) {
			update((ids) => {
				const next = ids.filter((id) => id !== eventId);
				persist(next);
				return next;
			});
		},

		isFavorite(eventId: string, ids: string[]): boolean {
			return ids.includes(eventId);
		}
	};
}

export const eventFavorites = createEventFavoritesStore();

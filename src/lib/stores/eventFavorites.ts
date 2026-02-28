import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'event_favorites';

function createEventFavoritesStore() {
	const stored: string[] = browser
		? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		: [];

	const { subscribe, update } = writable<string[]>(stored);

	function persist(ids: string[]) {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
	}

	return {
		subscribe,

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

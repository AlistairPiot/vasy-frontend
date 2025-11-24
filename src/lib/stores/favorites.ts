import { writable, derived } from 'svelte/store';

const STORAGE_KEY = 'vasy_favorites';

function createFavoritesStore() {
	const { subscribe, set, update } = writable<string[]>([]);

	// Load from localStorage on creation
	if (typeof window !== 'undefined') {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				set(JSON.parse(stored));
			}
		} catch (err) {
			console.error('Failed to load favorites from localStorage:', err);
		}
	}

	return {
		subscribe,

		toggle(productId: string) {
			update((favorites) => {
				const index = favorites.indexOf(productId);
				if (index > -1) {
					favorites.splice(index, 1);
				} else {
					favorites.push(productId);
				}
				this.persist(favorites);
				return favorites;
			});
		},

		add(productId: string) {
			update((favorites) => {
				if (!favorites.includes(productId)) {
					favorites.push(productId);
					this.persist(favorites);
				}
				return favorites;
			});
		},

		remove(productId: string) {
			update((favorites) => {
				const index = favorites.indexOf(productId);
				if (index > -1) {
					favorites.splice(index, 1);
					this.persist(favorites);
				}
				return favorites;
			});
		},

		isFavorite(productId: string, favs: string[]): boolean {
			return favs.includes(productId);
		},

		persist(favorites: string[]) {
			if (typeof window !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
			}
		}
	};
}

export const favorites = createFavoritesStore();

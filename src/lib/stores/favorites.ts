import { writable } from 'svelte/store';

const STORAGE_KEY_PREFIX = 'vasy_favorites_';

function createFavoritesStore() {
	const { subscribe, set, update } = writable<string[]>([]);

	let currentUserId: string | null = null;

	function getStorageKey(): string {
		return currentUserId ? `${STORAGE_KEY_PREFIX}${currentUserId}` : `${STORAGE_KEY_PREFIX}guest`;
	}

	return {
		subscribe,

		// Initialize favorites for a specific user
		init(userId: string | null) {
			currentUserId = userId;
			if (typeof window !== 'undefined') {
				try {
					const stored = localStorage.getItem(getStorageKey());
					if (stored) {
						set(JSON.parse(stored));
					} else {
						set([]);
					}
				} catch (err) {
					console.error('Failed to load favorites from localStorage:', err);
					set([]);
				}
			}
		},

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
				localStorage.setItem(getStorageKey(), JSON.stringify(favorites));
			}
		}
	};
}

export const favorites = createFavoritesStore();

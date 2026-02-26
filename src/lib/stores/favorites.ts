import { writable } from 'svelte/store';

function createFavoritesStore() {
	const { subscribe, set, update } = writable<string[]>([]);

	return {
		subscribe,

		init(favoriteIds: string[]) {
			set(favoriteIds);
		},

		async toggle(productId: string) {
			let isCurrentlyFavorite = false;
			const unsub = subscribe((favs) => {
				isCurrentlyFavorite = favs.includes(productId);
			});
			unsub();

			if (isCurrentlyFavorite) {
				await this.remove(productId);
			} else {
				await this.add(productId);
			}
		},

		async add(productId: string) {
			try {
				await fetch('/api/favorites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ productId })
				});
				update((favs) => (favs.includes(productId) ? favs : [...favs, productId]));
			} catch (err) {
				console.error('Failed to add favorite:', err);
			}
		},

		async remove(productId: string) {
			try {
				await fetch(`/api/favorites/${productId}`, { method: 'DELETE' });
				update((favs) => favs.filter((id) => id !== productId));
			} catch (err) {
				console.error('Failed to remove favorite:', err);
			}
		},

		isFavorite(productId: string, favs: string[]): boolean {
			return favs.includes(productId);
		}
	};
}

export const favorites = createFavoritesStore();

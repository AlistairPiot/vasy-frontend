import { writable } from 'svelte/store';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	image_url: string;
	creator_id: string;
}

export interface Cart {
	items: CartItem[];
}

const STORAGE_KEY_PREFIX = 'vasy_cart_';

function createCartStore() {
	const initialCart: Cart = {
		items: []
	};

	const { subscribe, set, update } = writable<Cart>(initialCart);

	let currentUserId: string | null = null;

	function getStorageKey(): string {
		return currentUserId ? `${STORAGE_KEY_PREFIX}${currentUserId}` : `${STORAGE_KEY_PREFIX}guest`;
	}

	return {
		subscribe,

		// Initialize cart for a specific user
		init(userId: string | null) {
			currentUserId = userId;
			if (typeof window !== 'undefined') {
				try {
					const stored = localStorage.getItem(getStorageKey());
					if (stored) {
						set(JSON.parse(stored));
					} else {
						set({ items: [] });
					}
				} catch (err) {
					console.error('Failed to load cart from localStorage:', err);
					set({ items: [] });
				}
			}
		},

		addItem(item: CartItem) {
			update((cart) => {
				const existing = cart.items.find((i) => i.id === item.id);
				if (existing) {
					existing.quantity += item.quantity;
				} else {
					cart.items.push(item);
				}
				this.persist(cart);
				return cart;
			});
		},

		removeItem(productId: string) {
			update((cart) => {
				cart.items = cart.items.filter((item) => item.id !== productId);
				this.persist(cart);
				return cart;
			});
		},

		updateQuantity(productId: string, quantity: number) {
			update((cart) => {
				const item = cart.items.find((i) => i.id === productId);
				if (item) {
					if (quantity <= 0) {
						cart.items = cart.items.filter((i) => i.id !== productId);
					} else {
						item.quantity = quantity;
					}
				}
				this.persist(cart);
				return cart;
			});
		},

		clear() {
			set({ items: [] });
			if (typeof window !== 'undefined') {
				localStorage.removeItem(getStorageKey());
			}
		},

		persist(cart: Cart) {
			if (typeof window !== 'undefined') {
				localStorage.setItem(getStorageKey(), JSON.stringify(cart));
			}
		}
	};
}

export const cart = createCartStore();

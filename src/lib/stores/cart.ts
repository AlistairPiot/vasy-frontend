import { writable } from 'svelte/store';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	image_url: string;
	creator_id: string;
	stock: number; // stock disponible au moment de l'ajout (utilisé pour bloquer le +)
	expires_at: string; // ISO — TTL 30 min, rafraîchi à chaque modification
}

export interface Cart {
	items: CartItem[];
}

const STORAGE_KEY_PREFIX = 'vasy_cart_';

function newExpiresAt(): string {
	return new Date(Date.now() + 30 * 60 * 1000).toISOString();
}

async function syncReservation(productId: string, quantity: number): Promise<void> {
	try {
		await fetch(`/api/cart/items/${productId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ quantity }),
		});
	} catch {
		// Silencieux : la réservation est best-effort, le backend validera au checkout
	}
}

async function removeReservation(productId: string): Promise<void> {
	try {
		await fetch(`/api/cart/items/${productId}`, { method: 'DELETE' });
	} catch {
		// Silencieux
	}
}

async function clearReservations(): Promise<void> {
	try {
		await fetch('/api/cart', { method: 'DELETE' });
	} catch {
		// Silencieux
	}
}

function createCartStore() {
	const initialCart: Cart = {
		items: []
	};

	const { subscribe, set, update } = writable<Cart>(initialCart);

	let currentUserId: string | null = null;
	let isAuthenticated = false;

	function getStorageKey(): string {
		return currentUserId ? `${STORAGE_KEY_PREFIX}${currentUserId}` : `${STORAGE_KEY_PREFIX}guest`;
	}

	return {
		subscribe,

		init(userId: string | null) {
			currentUserId = userId;
			isAuthenticated = !!userId;
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
					const newQty = Math.min(existing.quantity + item.quantity, item.stock);
					existing.quantity = newQty;
					existing.expires_at = newExpiresAt();
					if (isAuthenticated) syncReservation(item.id, newQty);
				} else {
					const clampedQty = Math.min(item.quantity, item.stock);
					cart.items.push({ ...item, quantity: clampedQty, expires_at: newExpiresAt() });
					if (isAuthenticated) syncReservation(item.id, clampedQty);
				}
				this.persist(cart);
				return cart;
			});
		},

		removeItem(productId: string) {
			update((cart) => {
				cart.items = cart.items.filter((item) => item.id !== productId);
				if (isAuthenticated) removeReservation(productId);
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
						if (isAuthenticated) removeReservation(productId);
					} else {
						item.quantity = quantity;
						item.expires_at = newExpiresAt();
						if (isAuthenticated) syncReservation(productId, quantity);
					}
				}
				this.persist(cart);
				return cart;
			});
		},

		clear() {
			set({ items: [] });
			if (isAuthenticated) clearReservations();
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

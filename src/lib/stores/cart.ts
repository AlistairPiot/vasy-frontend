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

async function syncReservation(productId: string, quantity: number): Promise<{ ok: boolean; error?: string }> {
	try {
		const res = await fetch(`/api/cart/items/${productId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ quantity }),
		});
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			return { ok: false, error: data.detail || 'Stock insuffisant' };
		}
		return { ok: true };
	} catch {
		return { ok: false, error: 'Erreur réseau' };
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

	let currentUserId: string | null = null;
	let isAuthenticated = false;
	let currentCart: Cart = initialCart;

	const { subscribe, set, update } = writable<Cart>(initialCart);
	subscribe((c) => { currentCart = c; });

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

		async reserveItem(item: CartItem): Promise<{ ok: boolean; error?: string }> {
			const currentQty = currentCart.items.find((i) => i.id === item.id)?.quantity ?? 0;
			const newQty = Math.min(currentQty + item.quantity, item.stock);

			if (newQty <= currentQty) {
				return { ok: false, error: 'Quantité maximum atteinte' };
			}

			if (isAuthenticated) {
				return await syncReservation(item.id, newQty);
			}
			return { ok: true };
		},

		addItem(item: CartItem): void {
			update((cart) => {
				const existing = cart.items.find((i) => i.id === item.id);
				const currentQty = existing?.quantity ?? 0;
				const newQty = Math.min(currentQty + item.quantity, item.stock);
				if (existing) {
					existing.quantity = newQty;
					existing.expires_at = newExpiresAt();
				} else {
					cart.items.push({ ...item, quantity: newQty, expires_at: newExpiresAt() });
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

		async updateQuantity(productId: string, quantity: number): Promise<{ ok: boolean; error?: string }> {
			if (quantity <= 0) {
				update((cart) => {
					cart.items = cart.items.filter((i) => i.id !== productId);
					this.persist(cart);
					return cart;
				});
				if (isAuthenticated) removeReservation(productId);
				return { ok: true };
			}

			if (isAuthenticated) {
				const result = await syncReservation(productId, quantity);
				if (!result.ok) return result;
			}

			update((cart) => {
				const item = cart.items.find((i) => i.id === productId);
				if (item) {
					item.quantity = quantity;
					item.expires_at = newExpiresAt();
				}
				this.persist(cart);
				return cart;
			});
			return { ok: true };
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

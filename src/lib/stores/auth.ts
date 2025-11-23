import { writable } from 'svelte/store';
import { api } from '$lib/api/client';

interface User {
	id: string;
	email: string;
	role: 'admin' | 'creator' | 'client';
	is_active: boolean;
}

function createAuthStore() {
	const { subscribe, set } = writable<User | null>(null);

	return {
		subscribe,
		async login(email: string, password: string) {
			const response = await api.post<{ access_token: string }>('/auth/login', {
				email,
				password
			});
			api.setToken(response.access_token);
			await this.fetchUser();
		},
		async register(email: string, password: string) {
			const response = await api.post<{ access_token: string }>('/auth/register', {
				email,
				password
			});
			api.setToken(response.access_token);
			await this.fetchUser();
		},
		async registerCreator(token: string, password: string, displayName: string) {
			const response = await api.post<{ access_token: string }>('/auth/register/creator', {
				token,
				password,
				display_name: displayName
			});
			api.setToken(response.access_token);
			await this.fetchUser();
		},
		async fetchUser() {
			try {
				const user = await api.get<User>('/users/me');
				set(user);
			} catch {
				this.logout();
			}
		},
		logout() {
			api.setToken(null);
			set(null);
		},
		init() {
			const token = api.getToken();
			if (token) {
				this.fetchUser();
			}
		}
	};
}

export const auth = createAuthStore();

import { env } from '$env/dynamic/private';

const baseUrl = env.API_URL || 'http://localhost:8000/api';

export class RateLimitError extends Error {
	constructor(public retryAfter: number) {
		super(`Trop de tentatives. Réessayez dans ${retryAfter} secondes.`);
	}
}

export async function api<T>(
	endpoint: string,
	options: RequestInit & { token?: string } = {}
): Promise<T> {
	const { token, ...fetchOptions } = options;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((fetchOptions.headers as Record<string, string>) || {})
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${baseUrl}${endpoint}`, {
		...fetchOptions,
		headers
	});

	if (!response.ok) {
		if (response.status === 429) {
			const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
			throw new RateLimitError(retryAfter);
		}
		const error = await response.json().catch(() => ({ detail: 'Erreur serveur' }));
		throw new Error(error.detail || 'Erreur');
	}

	return response.json();
}

export const serverApi = {
	get<T>(endpoint: string, token?: string): Promise<T> {
		return api<T>(endpoint, { token });
	},

	post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
		return api<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
			token
		});
	},

	patch<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
		return api<T>(endpoint, {
			method: 'PATCH',
			body: JSON.stringify(data),
			token
		});
	},

	delete<T>(endpoint: string, token?: string, data?: unknown): Promise<T> {
		return api<T>(endpoint, {
			method: 'DELETE',
			body: data ? JSON.stringify(data) : undefined,
			token
		});
	},

	async uploadFile<T>(endpoint: string, formData: FormData, token?: string): Promise<T> {
		const headers: Record<string, string> = {};
		if (token) headers['Authorization'] = `Bearer ${token}`;
		const response = await fetch(`${baseUrl}${endpoint}`, {
			method: 'POST',
			headers,
			body: formData
		});
		if (!response.ok) {
			const error = await response.json().catch(() => ({ detail: 'Erreur serveur' }));
			throw new Error(error.detail || 'Erreur');
		}
		return response.json();
	}
};

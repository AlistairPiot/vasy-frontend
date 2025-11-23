import { API_URL } from '$env/static/private';

const baseUrl = API_URL || 'http://localhost:8000/api';

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

	delete<T>(endpoint: string, token?: string): Promise<T> {
		return api<T>(endpoint, { method: 'DELETE', token });
	}
};

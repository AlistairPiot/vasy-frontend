const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
	private token: string | null = null;

	setToken(token: string | null) {
		this.token = token;
		if (token) {
			localStorage.setItem('token', token);
		} else {
			localStorage.removeItem('token');
		}
	}

	getToken(): string | null {
		if (!this.token) {
			this.token = localStorage.getItem('token');
		}
		return this.token;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...((options.headers as Record<string, string>) || {})
		};

		const token = this.getToken();
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_URL}${endpoint}`, {
			...options,
			headers
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ detail: 'Erreur' }));
			throw new Error(error.detail || 'Erreur');
		}

		return response.json();
	}

	get<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint);
	}

	post<T>(endpoint: string, data?: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	patch<T>(endpoint: string, data: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	}

	delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'DELETE' });
	}
}

export const api = new ApiClient();

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const q = url.searchParams.get('q') ?? '';
		const limit = url.searchParams.get('limit') ?? '8';
		const data = await serverApi.get(`/search?q=${encodeURIComponent(q)}&limit=${limit}`);
		return json(data);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		throw error(500, message);
	}
};

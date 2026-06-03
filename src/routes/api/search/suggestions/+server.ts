import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const limit = url.searchParams.get('limit') ?? '5';
		const data = await serverApi.get(`/search/suggestions?limit=${limit}`);
		return json(data);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		throw error(500, message);
	}
};

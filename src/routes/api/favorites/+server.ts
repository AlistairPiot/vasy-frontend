import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.token) {
		throw error(401, 'Non authentifié');
	}
	try {
		const favorites = await serverApi.get<{ product_id: string }[]>('/favorites/', locals.token);
		return json(favorites);
	} catch (err) {
		return json([]);
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.token) {
		throw error(401, 'Non authentifié');
	}
	const { productId } = await request.json();
	try {
		const result = await serverApi.post(`/favorites/${productId}`, undefined, locals.token);
		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		return json({ error: message }, { status: 400 });
	}
};

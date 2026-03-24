import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.token) {
		throw error(401, 'Non authentifié');
	}
	const body = await request.json();
	try {
		const result = await serverApi.post(`/cart/items/${params.productId}`, body, locals.token);
		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		return json({ error: message }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.token) {
		throw error(401, 'Non authentifié');
	}
	try {
		const result = await serverApi.delete(`/cart/items/${params.productId}`, locals.token);
		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		return json({ error: message }, { status: 400 });
	}
};

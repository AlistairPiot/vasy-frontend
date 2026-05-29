import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.token) {
		throw error(401, 'Non authentifié');
	}
	try {
		const data = await request.json();
		const response = await serverApi.post('/orders/confirm', data, locals.token);
		return json(response);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		throw error(400, message);
	}
};

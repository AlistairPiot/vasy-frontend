import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.token) throw error(401, 'Non autorisé');
	try {
		const body = await request.json();
		const result = await serverApi.post('/admin/send-email', body, locals.token);
		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		throw error(500, message);
	}
};

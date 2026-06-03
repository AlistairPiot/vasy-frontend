import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.token) throw error(401, 'Non autorisé');
	try {
		const data = await serverApi.get('/admin/email-templates/invitation', locals.token);
		return json(data);
	} catch (err) {
		throw error(500, err instanceof Error ? err.message : 'Erreur serveur');
	}
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.token) throw error(401, 'Non autorisé');
	try {
		const body = await request.json();
		const result = await serverApi.patch('/admin/email-templates/invitation', body, locals.token);
		return json(result);
	} catch (err) {
		throw error(500, err instanceof Error ? err.message : 'Erreur serveur');
	}
};

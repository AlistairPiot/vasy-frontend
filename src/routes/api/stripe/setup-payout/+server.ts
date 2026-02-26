import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.token) {
		throw error(401, 'Non authentifié');
	}

	const body = await request.json();

	try {
		const response = await serverApi.post('/stripe/setup-payout', body, locals.token);
		return json(response);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		return json({ detail: message }, { status: 400 });
	}
};

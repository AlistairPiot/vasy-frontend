import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	try {
		const result = await serverApi.post('/reports', body);
		return json(result, { status: 201 });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		return json({ error: message }, { status: 400 });
	}
};

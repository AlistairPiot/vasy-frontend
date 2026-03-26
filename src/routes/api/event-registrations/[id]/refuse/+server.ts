import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.token) {
		throw error(401, 'Non authentifié');
	}

	try {
		const response = await serverApi.post(
			`/event-registrations/${params.id}/refuse`,
			undefined,
			locals.token
		);
		return json(response);
	} catch (err) {
		if (err instanceof Error) {
			throw error(400, err.message);
		}
		throw error(500, 'Erreur serveur');
	}
};

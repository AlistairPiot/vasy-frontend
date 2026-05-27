import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.token) {
		throw error(401, 'Non authentifié');
	}

	try {
		const response = await serverApi.post<{ url: string }>('/stripe/onboarding-link', {}, locals.token);
		return json(response);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur';
		return json({ detail: message }, { status: 400 });
	}
};

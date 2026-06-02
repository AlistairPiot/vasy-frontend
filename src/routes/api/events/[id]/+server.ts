import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const event = await serverApi.get(`/events/public/${params.id}`);
		return json(event);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Événement non trouvé';
		const status = message.includes('404') || message.includes('non trouvé') ? 404 : 500;
		throw error(status, message);
	}
};

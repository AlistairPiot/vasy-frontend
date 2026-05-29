import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverApi } from '$lib/server/api';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const product = await serverApi.get(`/products/${params.id}`);
		return json(product);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Produit non trouvé';
		const status = message.includes('404') || message.includes('non trouvé') ? 404 : 500;
		throw error(status, message);
	}
};

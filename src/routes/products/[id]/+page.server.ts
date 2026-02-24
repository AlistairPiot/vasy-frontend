import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Product {
	id: string;
	creator_id: string;
	name: string;
	description: string | null;
	price: number;
	stock: number;
	image_urls: string;
	is_active: boolean;
	created_at: string;
}

interface Creator {
	id: string;
	display_name: string;
	bio: string;
	profile_image_url: string;
	is_approved: boolean;
}

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { user } = await parent();

	try {
		const product = await serverApi.get<Product>(`/products/${params.id}`);

		// Charger les infos du créateur
		let creator: Creator | null = null;
		try {
			// Si l'utilisateur est connecté, on charge le créateur avec le token
			if (locals.token) {
				creator = await serverApi.get<Creator>(`/creators/${product.creator_id}`, locals.token);
			} else {
				// Sinon on essaie sans token (endpoint public)
				creator = await serverApi.get<Creator>(`/creators/${product.creator_id}`);
			}
		} catch {
			// Si on ne peut pas charger le créateur, on continue sans
			creator = null;
		}

		return { product, creator, user };
	} catch {
		throw error(404, 'Produit non trouvé');
	}
};

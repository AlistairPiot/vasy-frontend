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

export const load: PageServerLoad = async ({ params }) => {
	try {
		const product = await serverApi.get<Product>(`/products/${params.id}`);
		return { product };
	} catch {
		throw error(404, 'Produit non trouvé');
	}
};

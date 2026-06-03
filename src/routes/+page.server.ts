import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Product {
	id: string;
	name: string;
	creator_name: string | null;
	category: string | null;
	image_urls: string;
	price: number;
	stock: number;
}

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	try {
		const products = await serverApi.get<Product[]>('/products/?limit=12');
		// Garder seulement les produits avec au moins une image, max 6
		const featured = products
			.filter((p) => {
				try { return JSON.parse(p.image_urls).length > 0; } catch { return false; }
			})
			.slice(0, 6);

		return { user, featuredProducts: featured };
	} catch {
		return { user, featuredProducts: [] };
	}
};

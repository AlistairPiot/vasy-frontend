import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Creator {
	id: string;
	display_name: string;
	bio: string;
	profile_image_url: string;
	created_at: string;
	is_approved: boolean;
}

interface Product {
	id: string;
	name: string;
	price: number;
	image_urls: string;
	stock: number;
}

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { user } = await parent();

	try {
		const creator = await serverApi.get<Creator>(`/creators/${params.id}`);

		let products: Product[] = [];
		try {
			const allProducts = await serverApi.get<Product[]>(`/products/`);
			products = (allProducts || []).filter((p: any) => p.creator_id === params.id);
		} catch {
			products = [];
		}

		return { creator, products };
	} catch (err) {
		throw error(404, 'Créateur non trouvé');
	}
};

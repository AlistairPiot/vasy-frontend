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
	category: string | null;
	material: string | null;
	style: string;
	technique: string;
	created_at: string;
}

export const load: PageServerLoad = async ({ url, parent }) => {
	const searchQuery = url.searchParams.get('q');
	const { user } = await parent();

	if (searchQuery) {
		const searchResponse = await serverApi.get<{ results: Product[] }>(
			`/search?q=${encodeURIComponent(searchQuery)}&limit=100`
		);
		return { products: searchResponse.results, searchQuery, user };
	}

	const params = new URLSearchParams();
	params.set('limit', '100');

	const category  = url.searchParams.get('category');
	const material  = url.searchParams.get('material');
	const styles    = url.searchParams.getAll('style');
	const techniques = url.searchParams.getAll('technique');
	const priceMin  = url.searchParams.get('price_min');
	const priceMax  = url.searchParams.get('price_max');
	const sort      = url.searchParams.get('sort');

	if (category) params.set('category', category);
	if (material) params.set('material', material);
	styles.forEach(s => params.append('style', s));
	techniques.forEach(t => params.append('technique', t));
	if (priceMin) params.set('price_min', priceMin);
	if (priceMax) params.set('price_max', priceMax);
	if (sort) params.set('sort', sort);

	const products = await serverApi.get<Product[]>(`/products/?${params.toString()}`);
	return { products, searchQuery: null, user };
};

import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Product {
	id: string;
	name: string;
	price: number;
	stock: number;
	is_active: boolean;
	image_urls: string;
	created_at: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	const products = await serverApi.get<Product[]>('/products/my', locals.token);
	return { products };
};

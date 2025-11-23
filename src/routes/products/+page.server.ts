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
	created_at: string;
}

export const load: PageServerLoad = async ({ url }) => {
	const skip = parseInt(url.searchParams.get('skip') || '0');
	const limit = parseInt(url.searchParams.get('limit') || '20');

	const products = await serverApi.get<Product[]>(`/products/?skip=${skip}&limit=${limit}`);
	return { products };
};

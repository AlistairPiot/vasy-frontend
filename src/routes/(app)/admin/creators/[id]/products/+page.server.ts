import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Product {
	id: string;
	name: string;
	description: string | null;
	price: number;
	stock: number;
	is_active: boolean;
	image_urls: string;
	created_at: string;
}

interface Creator {
	id: string;
	display_name: string;
	email: string | null;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const [products, creators] = await Promise.all([
		serverApi.get<Product[]>(`/admin/creators/${params.id}/products`, locals.token),
		serverApi.get<Creator[]>('/admin/creators', locals.token)
	]);

	const creator = creators.find((c: Creator) => c.id === params.id);

	return {
		products,
		creator: creator || { id: params.id, display_name: 'Créateur inconnu', email: null }
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const productId = formData.get('productId') as string;

		await serverApi.delete(`/admin/products/${productId}`, locals.token);

		return { success: true };
	}
};

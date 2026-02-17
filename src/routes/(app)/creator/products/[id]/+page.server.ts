import { fail, redirect } from '@sveltejs/kit';
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
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const product = await serverApi.get<Product>(`/products/${params.id}`, locals.token);
	return { product };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const price = parseFloat(formData.get('price') as string) * 100;
		const stock = parseInt(formData.get('stock') as string);
		const imageUrls = formData.get('imageUrls') as string;

		if (!name || !price || stock === undefined) {
			return fail(400, { error: 'Champs requis manquants' });
		}

		try {
			await serverApi.patch(
				`/products/${params.id}`,
				{
					name,
					description: description || null,
					price: Math.round(price),
					stock,
					image_urls: imageUrls || '[]'
				},
				locals.token
			);

			return { success: true };
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { error: err.message });
			}
			throw err;
		}
	},

	toggleActive: async ({ params, locals }) => {
		try {
			const product = await serverApi.get<Product>(`/products/${params.id}`, locals.token);
			await serverApi.patch(
				`/products/${params.id}`,
				{ is_active: !product.is_active },
				locals.token
			);
			return { success: true };
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { error: err.message });
			}
			throw err;
		}
	},

	delete: async ({ params, locals }) => {
		try {
			await serverApi.delete(`/products/${params.id}`, locals.token);
			throw redirect(302, '/creator/products');
		} catch (err) {
			if (err instanceof Response) throw err;
			if (err instanceof Error && err.message) {
				return fail(400, { error: err.message });
			}
			throw err;
		}
	}
};

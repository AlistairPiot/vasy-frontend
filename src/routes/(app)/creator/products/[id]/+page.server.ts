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
	category: string | null;
	material: string | null;
	style: string;
	technique: string;
	reserved_in_carts?: number;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	// Endpoint dédié créateur : retourne le produit même s'il est inactif
	const product = await serverApi.get<Product>(`/products/creator/${params.id}`, locals.token);
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
		const category = (formData.get('category') as string) || null;
		const material = (formData.get('material') as string) || null;
		const style = (formData.get('style') as string) || '[]';
		const technique = (formData.get('technique') as string) || '[]';

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
					image_urls: imageUrls || '[]',
					category,
					material,
					style,
					technique,
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

	toggleActive: async ({ request, params, locals }) => {
		const formData = await request.formData();
		// L'état courant est transmis par le formulaire — pas besoin de re-fetcher le produit
		const currentIsActive = formData.get('current_is_active') === 'true';

		try {
			await serverApi.patch(
				`/products/${params.id}`,
				{ is_active: !currentIsActive },
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

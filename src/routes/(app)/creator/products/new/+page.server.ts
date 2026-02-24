import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface StripeStatus {
	connected: boolean;
	onboarding_complete: boolean;
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.token) {
		throw redirect(302, '/login');
	}

	try {
		const stripeStatus = await serverApi.get<StripeStatus>(
			'/stripe/connect/status',
			locals.token
		);
		return { stripeStatus };
	} catch {
		return { stripeStatus: { connected: false, onboarding_complete: false } };
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();

		const name = (formData.get('name') as string)?.trim();
		const description = formData.get('description') as string;
		const priceStr = formData.get('price') as string;
		const stockStr = formData.get('stock') as string;
		const imageUrls = formData.get('imageUrls') as string;

		// Validation
		if (!name) {
			return fail(400, { error: 'Le nom du produit est requis' });
		}

		if (!priceStr) {
			return fail(400, { error: 'Le prix est requis' });
		}

		const price = parseFloat(priceStr) * 100; // Convert to cents
		if (isNaN(price) || price < 1000 || price > 500000) {
			return fail(400, { error: 'Le prix doit être entre 10€ et 5000€' });
		}

		if (!stockStr) {
			return fail(400, { error: 'Le stock est requis' });
		}

		const stock = parseInt(stockStr);
		if (isNaN(stock) || stock < 0) {
			return fail(400, { error: 'Le stock doit être un nombre positif' });
		}

		const parsedImages = JSON.parse(imageUrls || '[]');
		if (!parsedImages.length) {
			return fail(400, { error: 'Au moins une image est requise' });
		}

		try {
			await serverApi.post(
				'/products/',
				{
					name,
					description: description || null,
					price: Math.round(price),
					stock,
					image_urls: imageUrls || '[]'
				},
				locals.token
			);

			throw redirect(302, '/creator/products');
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { error: err.message });
			}
			throw err;
		}
	}
};

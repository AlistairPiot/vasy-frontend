import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { creator } = await parent();

	// Charger les commandes du créateur
	let orders: any[] = [];
	try {
		orders = await serverApi.get('/orders/creator-orders', locals.token);
	} catch (error) {
		console.error('Error loading orders:', error);
	}

	return { creator, orders };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const formData = await request.formData();

		const displayName = formData.get('displayName') as string;
		const bio = formData.get('bio') as string;
		const profileImageUrl = formData.get('profileImageUrl') as string;

		if (!displayName) {
			return fail(400, { error: 'Nom requis' });
		}

		try {
			await serverApi.patch(
				'/creators/me',
				{
					display_name: displayName,
					bio: bio || null,
					profile_image_url: profileImageUrl || null
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

	acceptOrder: async ({ request, locals }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId') as string;

		try {
			await serverApi.post(`/orders/${orderId}/accept`, {}, locals.token);
			return { orderSuccess: true };
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { orderError: err.message });
			}
			throw err;
		}
	},

	refuseOrder: async ({ request, locals }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId') as string;

		try {
			await serverApi.post(`/orders/${orderId}/refuse`, {}, locals.token);
			return { orderSuccess: true };
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { orderError: err.message });
			}
			throw err;
		}
	},

	shipOrder: async ({ request, locals }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId') as string;
		const trackingNumber = formData.get('trackingNumber') as string;

		if (!trackingNumber) {
			return fail(400, { orderError: 'Numéro de suivi requis' });
		}

		try {
			await serverApi.post(`/orders/${orderId}/ship`, { tracking_number: trackingNumber }, locals.token);
			return { orderSuccess: true };
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { orderError: err.message });
			}
			throw err;
		}
	}
};

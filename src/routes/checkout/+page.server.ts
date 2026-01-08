import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.token) {
		throw redirect(302, '/login');
	}

	const { user } = await parent();

	// Seuls les clients peuvent accéder au checkout
	if (user && user.role !== 'client') {
		throw redirect(302, '/dashboard');
	}

	return {};
};

export const actions: Actions = {
	createCheckout: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = JSON.parse(formData.get('data') as string);

		try {
			const response = await serverApi.post('/orders/checkout', data, locals.token);
			return { success: true, data: response };
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { error: err.message });
			}
			throw err;
		}
	}
};

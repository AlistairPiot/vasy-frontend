import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.token) {
		throw redirect(302, '/login');
	}

	const { user } = await parent();

	if (user.role !== 'admin') {
		throw redirect(302, '/dashboard');
	}

	// Charger toutes les commandes
	let orders: any[] = [];
	try {
		orders = await serverApi.get('/orders/all-orders', locals.token);
	} catch (error) {
		console.error('Error loading orders:', error);
	}

	return { orders };
};

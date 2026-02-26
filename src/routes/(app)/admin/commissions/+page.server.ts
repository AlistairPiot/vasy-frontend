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

	let commissions: any[] = [];
	try {
		commissions = await serverApi.get('/admin/commissions', locals.token);
	} catch (error) {
		console.error('Error loading commissions:', error);
	}

	return { commissions };
};

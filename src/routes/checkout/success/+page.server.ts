import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.token) {
		throw redirect(302, '/login');
	}

	const { user } = await parent();

	if (user && user.role !== 'client') {
		throw redirect(302, '/dashboard');
	}

	return {};
};

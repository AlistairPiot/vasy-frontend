import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// Rediriger selon le rôle
	if (user.role === 'creator') {
		throw redirect(302, '/creator/products');
	} else if (user.role === 'admin') {
		throw redirect(302, '/admin/stats');
	} else {
		// Client - pour l'instant rediriger vers les produits
		throw redirect(302, '/products');
	}
};

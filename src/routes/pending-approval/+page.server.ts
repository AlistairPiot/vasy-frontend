import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.token) {
		throw redirect(302, '/login');
	}

	// Vérifier le statut de l'utilisateur
	try {
		const user = await serverApi.get<{
			id: string;
			email: string;
			role: 'admin' | 'creator' | 'client';
		}>('/users/me', locals.token);

		// Si ce n'est pas un créateur, rediriger
		if (user.role !== 'creator') {
			throw redirect(302, '/dashboard');
		}

		// Vérifier si déjà approuvé
		const creator = await serverApi.get<{
			is_approved: boolean;
			display_name: string;
		}>('/creators/me', locals.token);

		if (creator.is_approved) {
			throw redirect(302, '/dashboard');
		}

		return { user, creator };
	} catch (err) {
		throw redirect(302, '/login');
	}
};

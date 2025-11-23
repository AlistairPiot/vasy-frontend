import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	const { user } = await parent();

	if (user.role !== 'creator') {
		throw redirect(302, '/dashboard');
	}

	// Récupérer le profil créateur
	const creator = await serverApi.get<{
		id: string;
		display_name: string;
		bio: string | null;
		profile_image_url: string | null;
		stripe_onboarding_complete: boolean;
		is_approved: boolean;
	}>('/creators/me', locals.token);

	// Rediriger vers la page d'attente si non approuvé
	if (!creator.is_approved) {
		throw redirect(302, '/pending-approval');
	}

	return { creator };
};

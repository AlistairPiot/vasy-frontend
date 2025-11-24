import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const creator = await serverApi.get<{
			id: string;
			display_name: string;
			bio: string;
			profile_image_url: string;
			created_at: string;
			is_approved: boolean;
		}>(`/creators/${params.id}`, locals.token);

		return { creator };
	} catch (err) {
		throw error(404, 'Créateur non trouvé');
	}
};

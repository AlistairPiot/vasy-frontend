import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Creator {
	id: string;
	user_id: string;
	email: string | null;
	display_name: string;
	siret: string | null;
	stripe_onboarding_complete: boolean;
	is_verified: boolean;
	is_approved: boolean;
	created_at: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	const creators = await serverApi.get<Creator[]>('/admin/creators', locals.token);
	return { creators };
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		const formData = await request.formData();
		const creatorId = formData.get('creatorId') as string;

		await serverApi.post(`/admin/creators/${creatorId}/approve`, {}, locals.token);

		return { success: true };
	}
};

import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ parent }) => {
	const { creator } = await parent();
	return { creator };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
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
	}
};

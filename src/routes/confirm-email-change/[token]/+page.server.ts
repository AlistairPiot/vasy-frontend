import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	try {
		await serverApi.get(`/users/confirm-email-change/${params.token}`);
		return { success: true, user };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Lien invalide ou expiré';
		return { success: false, error: message, user };
	}
};

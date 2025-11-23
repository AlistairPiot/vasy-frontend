import type { LayoutServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.token) {
		return { user: null };
	}

	try {
		const user = await serverApi.get<{
			id: string;
			email: string;
			role: 'admin' | 'creator' | 'client';
		}>('/users/me', locals.token);

		return { user };
	} catch {
		return { user: null };
	}
};

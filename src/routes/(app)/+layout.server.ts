import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.token) {
		throw redirect(302, '/login');
	}

	try {
		const user = await serverApi.get<{
			id: string;
			email: string;
			role: 'admin' | 'creator' | 'client';
		}>('/users/me', locals.token);

		return { user };
	} catch {
		throw redirect(302, '/login');
	}
};

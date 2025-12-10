import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface User {
	id: string;
	email: string;
	role: string;
	is_active: boolean;
	created_at: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	const users = await serverApi.get<User[]>('/admin/users', locals.token);
	return { users };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		await serverApi.delete(`/admin/users/${userId}`, locals.token);

		return { success: true };
	}
};

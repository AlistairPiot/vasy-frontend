import type { PageServerLoad } from './$types';
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

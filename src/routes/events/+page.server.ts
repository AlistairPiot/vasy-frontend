import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';
import { redirect } from '@sveltejs/kit';

interface Event {
	id: string;
	creator_id: string;
	name: string;
	description: string | null;
	date: string;
	location_text: string;
	latitude: number | null;
	longitude: number | null;
	created_by_name: string;
	status: 'active' | 'expired' | 'deleted';
	visibility: 'internal' | 'public';
	created_at: string;
	updated_at: string;
}

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (user && user.role === 'admin') {
		throw redirect(302, '/dashboard');
	}

	const events = await serverApi.get<Event[]>('/events/public');
	return { events, user };
};

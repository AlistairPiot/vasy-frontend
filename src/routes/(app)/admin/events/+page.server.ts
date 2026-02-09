import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

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
	creator_email: string | null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const status = url.searchParams.get('status') || '';

	let endpoint = '/admin/events';
	if (status) {
		endpoint += `?status=${status}`;
	}

	const events = await serverApi.get<Event[]>(endpoint, locals.token);

	return {
		events,
		currentStatus: status
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const eventId = formData.get('eventId') as string;

		try {
			await serverApi.delete(`/admin/events/${eventId}`, locals.token);
			return { success: true };
		} catch (err) {
			if (err instanceof Error) {
				return fail(400, { error: err.message });
			}
			return fail(500, { error: 'Erreur lors de la suppression' });
		}
	},

	expire: async ({ locals }) => {
		try {
			const result = await serverApi.post<{ message: string }>(
				'/admin/events/expire',
				{},
				locals.token
			);
			return { success: true, message: result.message };
		} catch (err) {
			if (err instanceof Error) {
				return fail(400, { error: err.message });
			}
			return fail(500, { error: "Erreur lors de l'expiration" });
		}
	}
};

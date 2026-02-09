import { fail, redirect } from '@sveltejs/kit';
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
}

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const event = await serverApi.get<Event>(`/events/${params.id}`, locals.token);
		return { event };
	} catch (err) {
		throw redirect(302, '/creator/events');
	}
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const date = formData.get('date') as string;
		const time = formData.get('time') as string;
		const location_text = formData.get('location_text') as string;

		// Validation
		if (!name || name.trim().length === 0) {
			return fail(400, { error: "Le nom de l'événement est requis" });
		}

		if (!date) {
			return fail(400, { error: 'La date est requise' });
		}

		if (!location_text || location_text.trim().length === 0) {
			return fail(400, { error: 'Le lieu est requis' });
		}

		// Combiner date et heure
		const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`;

		try {
			await serverApi.patch(
				`/events/${params.id}`,
				{
					name: name.trim(),
					description: description?.trim() || null,
					date: dateTime,
					location_text: location_text.trim()
				},
				locals.token
			);

			throw redirect(302, '/creator/events');
		} catch (err) {
			if (err instanceof Response || (err as any)?.status === 302) {
				throw err;
			}
			if (err instanceof Error) {
				return fail(400, { error: err.message });
			}
			return fail(500, { error: 'Erreur lors de la modification' });
		}
	},

	delete: async ({ locals, params }) => {
		try {
			await serverApi.delete(`/events/${params.id}`, locals.token);
			throw redirect(302, '/creator/events');
		} catch (err) {
			if (err instanceof Response || (err as any)?.status === 302) {
				throw err;
			}
			if (err instanceof Error) {
				return fail(400, { error: err.message });
			}
			return fail(500, { error: 'Erreur lors de la suppression' });
		}
	}
};

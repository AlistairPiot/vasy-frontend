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
	creator_email: string | null;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const event = await serverApi.get<Event>(`/admin/events/${params.id}`, locals.token);
		return { event };
	} catch (err) {
		throw redirect(302, '/admin/events');
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
		const latitudeStr = formData.get('latitude') as string;
		const longitudeStr = formData.get('longitude') as string;

		// Validation
		if (!name || name.trim().length === 0) {
			return fail(400, { error: "Le nom de l'événement est requis" });
		}

		if (!date) {
			return fail(400, { error: 'La date est requise' });
		}

		if (!location_text || location_text.trim().length === 0) {
			return fail(400, { error: 'Veuillez sélectionner une adresse dans la liste' });
		}

		// Vérifier que les coordonnées sont présentes
		if (!latitudeStr || !longitudeStr) {
			return fail(400, { error: 'Veuillez sélectionner une adresse valide dans la liste' });
		}

		const latitude = parseFloat(latitudeStr);
		const longitude = parseFloat(longitudeStr);

		if (isNaN(latitude) || isNaN(longitude)) {
			return fail(400, { error: 'Coordonnées invalides. Veuillez resélectionner une adresse.' });
		}

		// Combiner date et heure
		const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`;

		try {
			await serverApi.patch(
				`/admin/events/${params.id}`,
				{
					name: name.trim(),
					description: description?.trim() || null,
					date: dateTime,
					location_text: location_text.trim(),
					latitude,
					longitude
				},
				locals.token
			);

			throw redirect(302, '/admin/events');
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
			await serverApi.delete(`/admin/events/${params.id}`, locals.token);
			throw redirect(302, '/admin/events');
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

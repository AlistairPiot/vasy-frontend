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
}

export const load: PageServerLoad = async ({ locals }) => {
	const events = await serverApi.get<Event[]>('/events/', locals.token);

	return {
		events
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
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

		// Vérifier que les coordonnées sont présentes (adresse sélectionnée)
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
			await serverApi.post(
				'/events/',
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

			return { success: true };
		} catch (err) {
			if (err instanceof Error) {
				return fail(400, { error: err.message });
			}
			return fail(500, { error: 'Erreur lors de la création' });
		}
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const eventId = formData.get('eventId') as string;

		try {
			await serverApi.delete(`/events/${eventId}`, locals.token);
			return { success: true };
		} catch (err) {
			if (err instanceof Error) {
				return fail(400, { error: err.message });
			}
			return fail(500, { error: 'Erreur lors de la suppression' });
		}
	}
};

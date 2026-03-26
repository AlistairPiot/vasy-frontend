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
	is_paid: boolean;
	price: number | null;
	attachment_urls: string | null;
	created_at: string;
	updated_at: string;
}

interface Registration {
	id: string;
	event_id: string;
	user_id: string;
	user_email: string;
	status: 'pending' | 'accepted' | 'refused';
	amount: number | null;
	created_at: string;
	updated_at: string;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const [event, registrations] = await Promise.all([
			serverApi.get<Event>(`/events/${params.id}`, locals.token),
			serverApi.get<Registration[]>(`/event-registrations/event/${params.id}`, locals.token).catch(() => [] as Registration[]),
		]);
		return { event, registrations };
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
		const latitudeStr = formData.get('latitude') as string;
		const longitudeStr = formData.get('longitude') as string;
		const attachments = formData.getAll('attachments') as File[];
		const removeIndicesRaw = formData.getAll('remove_attachment') as string[];
		const is_paid = formData.get('is_paid') === 'on';
		const priceStr = formData.get('price') as string;

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

		if (!latitudeStr || !longitudeStr) {
			return fail(400, { error: 'Veuillez sélectionner une adresse valide dans la liste' });
		}

		const latitude = parseFloat(latitudeStr);
		const longitude = parseFloat(longitudeStr);

		if (isNaN(latitude) || isNaN(longitude)) {
			return fail(400, { error: 'Coordonnées invalides. Veuillez resélectionner une adresse.' });
		}

		const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`;

		let price: number | null = null;
		if (is_paid) {
			price = Math.round(parseFloat(priceStr) * 100);
			if (isNaN(price) || price < 100) {
				return fail(400, { error: 'Le prix doit être d\'au moins 1 €' });
			}
		}

		try {
			await serverApi.patch(
				`/events/${params.id}`,
				{
					name: name.trim(),
					description: description?.trim() || null,
					date: dateTime,
					location_text: location_text.trim(),
					latitude,
					longitude,
					is_paid,
					price
				},
				locals.token
			);

			// Remove attachments (descending order to preserve indices)
			const removeIndices = removeIndicesRaw
				.map(Number)
				.filter((n) => !isNaN(n))
				.sort((a, b) => b - a);
			for (const index of removeIndices) {
				await serverApi.delete(`/events/${params.id}/attachments/${index}`, locals.token);
			}

			// Upload new attachments
			const validFiles = attachments.filter((f) => f && f.size > 0);
			for (const file of validFiles) {
				const fd = new FormData();
				fd.append('file', file);
				await serverApi.uploadFile(`/events/${params.id}/attachments`, fd, locals.token);
			}

			return { success: true };
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

	acceptRegistration: async ({ request, locals }) => {
		const formData = await request.formData();
		const registrationId = formData.get('registrationId') as string;
		try {
			await serverApi.post(`/event-registrations/${registrationId}/accept`, undefined, locals.token);
			return { success: true };
		} catch (err) {
			if (err instanceof Error) return fail(400, { error: err.message });
			return fail(500, { error: 'Erreur' });
		}
	},

	refuseRegistration: async ({ request, locals }) => {
		const formData = await request.formData();
		const registrationId = formData.get('registrationId') as string;
		try {
			await serverApi.post(`/event-registrations/${registrationId}/refuse`, undefined, locals.token);
			return { success: true };
		} catch (err) {
			if (err instanceof Error) return fail(400, { error: err.message });
			return fail(500, { error: 'Erreur' });
		}
	},

	addAttachment: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file || file.size === 0) {
			return fail(400, { error: 'Aucun fichier sélectionné' });
		}

		try {
			const fd = new FormData();
			fd.append('file', file);
			await serverApi.uploadFile(`/events/${params.id}/attachments`, fd, locals.token);
			return { success: true };
		} catch (err) {
			if (err instanceof Error) {
				return fail(400, { error: err.message });
			}
			return fail(500, { error: "Erreur lors de l'upload" });
		}
	},

	removeAttachment: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const index = parseInt(formData.get('index') as string);

		try {
			await serverApi.delete(`/events/${params.id}/attachments/${index}`, locals.token);
			return { success: true };
		} catch (err) {
			if (err instanceof Error) {
				return fail(400, { error: err.message });
			}
			return fail(500, { error: 'Erreur lors de la suppression' });
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

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
	is_paid: boolean;
	price: number | null;
	attachment_urls: string | null;
	created_at: string;
	updated_at: string;
}

interface StripeStatus {
	connected: boolean;
	onboarding_complete: boolean;
}

export const load: PageServerLoad = async ({ locals }) => {
	const events = await serverApi.get<Event[]>('/events/', locals.token);

	let stripeStatus: StripeStatus;
	try {
		stripeStatus = await serverApi.get<StripeStatus>('/stripe/connect/status', locals.token);
	} catch {
		stripeStatus = { connected: false, onboarding_complete: false };
	}

	return { events, stripeStatus };
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
		const attachments = formData.getAll('attachments') as File[];
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
			const event = await serverApi.post<Event>(
				'/events/',
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

			// Upload attachments if provided
			const validFiles = attachments.filter((f) => f && f.size > 0);
			for (const file of validFiles) {
				const fd = new FormData();
				fd.append('file', file);
				await serverApi.uploadFile(`/events/${event.id}/attachments`, fd, locals.token);
			}

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

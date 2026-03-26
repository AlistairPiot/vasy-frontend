import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
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
	status: 'pending' | 'accepted' | 'refused';
	amount: number | null;
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
	const { user } = await parent();

	if (user && user.role === 'admin') {
		throw redirect(302, '/dashboard');
	}

	try {
		const event = await serverApi.get<Event>(`/events/public/${params.id}`);

		// Charger l'inscription existante si l'utilisateur est connecté (client)
		let myRegistration: Registration | null = null;
		if (locals.token && user?.role === 'client') {
			try {
				myRegistration = await serverApi.get<Registration | null>(
					`/event-registrations/check/${params.id}`,
					locals.token
				);
			} catch {
				// Non authentifié ou erreur → pas d'inscription
			}
		}

		return { event, user, myRegistration };
	} catch {
		throw error(404, 'Événement non trouvé');
	}
};

import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Invitation {
	id: string;
	email: string;
	token: string;
	is_used: boolean;
	expires_at: string;
	created_at: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	const invitations = await serverApi.get<Invitation[]>('/admin/invitations', locals.token);
	return { invitations };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') as string)?.trim();

		if (!email) {
			return fail(400, { error: 'Email requis' });
		}

		// Validation email basique
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, { error: 'Email invalide' });
		}

		try {
			await serverApi.post('/admin/invitations', { email }, locals.token);
			return { success: true };
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { error: err.message });
			}
			throw err;
		}
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const invitationId = formData.get('invitationId') as string;

		await serverApi.delete(`/admin/invitations/${invitationId}`, locals.token);

		return { success: true };
	}
};

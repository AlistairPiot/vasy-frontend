import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { user } = await parent();

	// Seuls les clients peuvent accéder à cette page
	if (user.role !== 'client') {
		throw redirect(302, '/dashboard');
	}

	// Charger les commandes du client
	let orders: any[] = [];
	try {
		orders = await serverApi.get('/orders/my-orders', locals.token);
	} catch (error) {
		console.error('Error loading orders:', error);
	}

	return { user, orders };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const formData = await request.formData();

		const email = formData.get('email') as string;
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!email) {
			return fail(400, { error: 'Email requis' });
		}

		// Si changement de mot de passe
		if (newPassword) {
			if (!currentPassword) {
				return fail(400, { error: 'Mot de passe actuel requis' });
			}
			if (newPassword !== confirmPassword) {
				return fail(400, { error: 'Les mots de passe ne correspondent pas' });
			}
			if (newPassword.length < 6) {
				return fail(400, { error: 'Le mot de passe doit contenir au moins 6 caractères' });
			}
		}

		try {
			const payload: {
				email: string;
				current_password?: string;
				new_password?: string;
			} = { email };

			if (newPassword) {
				payload.current_password = currentPassword;
				payload.new_password = newPassword;
			}

			const result = await serverApi.patch('/users/me', payload, locals.token);

			if (result?.email_change_pending) {
				return { success: true, emailChangePending: true, newEmail: result.new_email };
			}

			return { success: true };
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, { error: err.message });
			}
			throw err;
		}
	}
};

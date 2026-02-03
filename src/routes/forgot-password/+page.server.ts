import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { serverApi } from '$lib/server/api';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
	email: z.string().email('Email invalide')
});

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			email: formData.get('email') as string
		};

		const result = forgotPasswordSchema.safeParse(data);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				errors,
				email: data.email
			});
		}

		try {
			await serverApi.post('/auth/forgot-password', {
				email: result.data.email
			});

			// Toujours retourner un succès pour éviter l'énumération d'emails
			return { success: true };
		} catch {
			// Même en cas d'erreur, on affiche un succès pour la sécurité
			return { success: true };
		}
	}
};

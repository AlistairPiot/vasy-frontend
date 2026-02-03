import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';
import { z } from 'zod';

const resetPasswordSchema = z.object({
	password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Les mots de passe ne correspondent pas',
	path: ['confirmPassword']
});

export const load: PageServerLoad = async ({ params }) => {
	try {
		await serverApi.get(`/auth/reset-password/${params.token}`);
		return { valid: true };
	} catch {
		return { valid: false };
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const data = {
			password: formData.get('password') as string,
			confirmPassword: formData.get('confirmPassword') as string
		};

		const result = resetPasswordSchema.safeParse(data);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { errors });
		}

		try {
			await serverApi.post('/auth/reset-password', {
				token: params.token,
				password: result.data.password
			});

			return { success: true };
		} catch (err) {
			if (err instanceof Error) {
				return fail(400, {
					errors: { form: [err.message] }
				});
			}
			return fail(400, {
				errors: { form: ['Une erreur est survenue'] }
			});
		}
	}
};

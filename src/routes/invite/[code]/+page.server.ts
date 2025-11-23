import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (locals.token) {
		throw redirect(302, '/dashboard');
	}

	// Vérifier si l'invitation est valide
	try {
		const invitation = await serverApi.get<{ email: string; valid: boolean }>(
			`/auth/invitation/${params.code}`
		);
		return { invitation, code: params.code };
	} catch (err) {
		if (err instanceof Error) {
			return { error: err.message, code: params.code };
		}
		return { error: 'Invitation invalide', code: params.code };
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, params }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;
		const displayName = formData.get('displayName') as string;

		// Validation
		if (!password || password.length < 8) {
			return fail(400, {
				errors: { password: ['Le mot de passe doit contenir au moins 8 caractères'] }
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				errors: { confirmPassword: ['Les mots de passe ne correspondent pas'] }
			});
		}

		if (!displayName || displayName.trim().length === 0) {
			return fail(400, {
				errors: { displayName: ["Le nom d'affichage est requis"] }
			});
		}

		try {
			const response = await serverApi.post<{ access_token: string }>('/auth/register/creator', {
				token: params.code,
				password,
				display_name: displayName.trim()
			});

			cookies.set('token', response.access_token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});

			throw redirect(302, '/dashboard');
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(400, {
					errors: { form: [err.message] }
				});
			}
			throw err;
		}
	}
};

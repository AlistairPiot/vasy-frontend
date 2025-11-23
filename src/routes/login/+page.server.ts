import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.token) {
		throw redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email et mot de passe requis', email });
		}

		try {
			const response = await serverApi.post<{ access_token: string }>('/auth/login', {
				email,
				password
			});

			cookies.set('token', response.access_token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 jours
			});

			throw redirect(302, '/dashboard');
		} catch (err) {
			if (err instanceof Error && err.message) {
				return fail(401, { error: err.message, email });
			}
			throw err;
		}
	}
};

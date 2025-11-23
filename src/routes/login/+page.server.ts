import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';
import { loginSchema } from '$lib/validations/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.token) {
		throw redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string
		};

		const result = loginSchema.safeParse(data);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				errors,
				email: data.email
			});
		}

		try {
			const response = await serverApi.post<{ access_token: string }>('/auth/login', {
				email: result.data.email,
				password: result.data.password
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
				return fail(401, {
					errors: { form: [err.message] },
					email: data.email
				});
			}
			throw err;
		}
	}
};

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';
import { registerSchema } from '$lib/validations/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.token) {
		throw redirect(302, '/dashboard');
	}

	const invitation = url.searchParams.get('invitation');
	return { invitation };
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const invitation = url.searchParams.get('invitation');
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string,
			confirmPassword: formData.get('confirmPassword') as string
		};

		const result = registerSchema.safeParse(data);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				errors,
				email: data.email
			});
		}

		try {
			const payload: { email: string; password: string; invitation_code?: string } = {
				email: result.data.email,
				password: result.data.password
			};

			if (invitation) {
				payload.invitation_code = invitation;
			}

			const response = await serverApi.post<{ access_token: string }>('/auth/register', payload);

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
					errors: { form: [err.message] },
					email: data.email
				});
			}
			throw err;
		}
	}
};

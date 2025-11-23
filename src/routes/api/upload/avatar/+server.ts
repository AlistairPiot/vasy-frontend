import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.token) {
		return json({ error: 'Non autorisé' }, { status: 401 });
	}

	const formData = await request.formData();
	const baseUrl = API_URL || 'http://localhost:8000/api';

	const response = await fetch(`${baseUrl}/upload/avatar`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${locals.token}`
		},
		body: formData
	});

	const data = await response.json();
	return json(data, { status: response.status });
};

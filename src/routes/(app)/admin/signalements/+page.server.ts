import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.token) {
		throw redirect(302, '/login');
	}

	const { user } = await parent();

	if (user.role !== 'admin') {
		throw redirect(302, '/dashboard');
	}

	let reports: any[] = [];
	let eventReports: any[] = [];
	try {
		[reports, eventReports] = await Promise.all([
			serverApi.get('/admin/reports', locals.token),
			serverApi.get('/admin/event-reports', locals.token),
		]);
	} catch (error) {
		console.error('Error loading reports:', error);
	}

	return { reports, eventReports };
};

import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Stats {
	total_creators: number;
	total_clients: number;
	total_transactions: number;
	total_revenue: number;
	total_commission: number;
}

export const load: PageServerLoad = async ({ locals }) => {
	const stats = await serverApi.get<Stats>('/admin/stats', locals.token);
	return { stats };
};

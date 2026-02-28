import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { user } = await parent();
	const q = url.searchParams.get('q') || '';

	if (!q.trim()) {
		return { products: [], creators: [], searchQuery: '', user };
	}

	const data = await serverApi.get<{
		results: any[];
		creators: any[];
	}>(`/search?q=${encodeURIComponent(q)}&limit=100`);

	return {
		products: data.results || [],
		creators: data.creators || [],
		searchQuery: q,
		user
	};
};

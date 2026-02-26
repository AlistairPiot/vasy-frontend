import type { LayoutServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.token) {
		return { user: null, favoriteIds: [] };
	}

	try {
		const [user, favoritesData] = await Promise.all([
			serverApi.get<{ id: string; email: string; role: 'admin' | 'creator' | 'client' }>(
				'/users/me',
				locals.token
			),
			serverApi
				.get<{ product_id: string }[]>('/favorites/', locals.token)
				.catch(() => [] as { product_id: string }[])
		]);

		return { user, favoriteIds: favoritesData.map((f) => f.product_id) };
	} catch {
		return { user: null, favoriteIds: [] };
	}
};

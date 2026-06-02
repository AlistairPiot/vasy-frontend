import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ parent }) => {
	const { user, favoriteIds } = await parent();

	const productResults = await Promise.all(
		(favoriteIds ?? []).map(async (id: string) => {
			try {
				return await serverApi.get<Record<string, unknown>>(`/products/${id}`);
			} catch {
				return null;
			}
		})
	);

	return { user, favoriteIds, products: productResults.filter(Boolean) };
};

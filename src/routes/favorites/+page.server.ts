import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user, favoriteIds } = await parent();
	return { user, favoriteIds };
};

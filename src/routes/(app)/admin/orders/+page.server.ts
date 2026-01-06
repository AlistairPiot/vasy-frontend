import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	// Pour l'instant, on ne charge pas de données
	// Elles seront ajoutées quand le système de commandes sera implémenté
	await parent();
	return {};
};

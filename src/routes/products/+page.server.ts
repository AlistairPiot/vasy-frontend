import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';
import { redirect } from '@sveltejs/kit';

interface Product {
	id: string;
	creator_id: string;
	name: string;
	description: string | null;
	price: number;
	stock: number;
	image_urls: string;
	created_at: string;
}

export const load: PageServerLoad = async ({ url, parent, locals }) => {
	// Vérifier l'authentification
	if (!locals.token) {
		throw redirect(302, '/login');
	}

	const skip = parseInt(url.searchParams.get('skip') || '0');
	const limit = parseInt(url.searchParams.get('limit') || '20');
	const searchQuery = url.searchParams.get('q');

	// Récupérer l'utilisateur depuis le layout parent
	const { user } = await parent();

	// Les admins ne peuvent pas accéder à cette page (ils ont leur propre interface)
	if (user && user.role === 'admin') {
		throw redirect(302, '/dashboard');
	}

	// Si une recherche est fournie, utiliser l'endpoint de recherche
	if (searchQuery) {
		const searchResponse = await serverApi.get<{ results: Product[] }>(
			`/search?q=${encodeURIComponent(searchQuery)}&limit=100`
		);
		return { products: searchResponse.results, searchQuery, user };
	}

	// Sinon, récupérer tous les produits
	const products = await serverApi.get<Product[]>(`/products/?skip=${skip}&limit=${limit}`);
	return { products, searchQuery: null, user };
};

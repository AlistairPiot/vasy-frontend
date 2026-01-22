import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

interface Product {
	id: string;
	name: string;
	price: number;
	stock: number;
	is_active: boolean;
	image_urls: string;
	created_at: string;
}

interface StripeStatus {
	connected: boolean;
	onboarding_complete: boolean;
}

export const load: PageServerLoad = async ({ locals }) => {
	const products = await serverApi.get<Product[]>('/products/my', locals.token);

	// Charger le statut Stripe
	let stripeStatus: StripeStatus;
	try {
		stripeStatus = await serverApi.get<StripeStatus>('/stripe/connect/status', locals.token);
	} catch {
		stripeStatus = { connected: false, onboarding_complete: false };
	}

	return { products, stripeStatus };
};

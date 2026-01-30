import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Constantes de commission (en pourcentage et centimes)
export const PLATFORM_COMMISSION_PERCENT = 5.0; // 5%
export const PLATFORM_COMMISSION_FIXED_PER_PRODUCT = 25; // 0.25€ = 25 centimes par produit distinct

export const STRIPE_COMMISSION_PERCENT = 1.5; // 1.5%
export const STRIPE_COMMISSION_FIXED = 25; // 0.25€ = 25 centimes par transaction

/**
 * Calcule les détails de commission pour un produit unique
 * @param price Prix en centimes
 * @returns Objet avec les détails de commission
 */
export function calculateProductCommission(price: number) {
	// Commission plateforme pour 1 produit
	const platformPercent = Math.floor((price * PLATFORM_COMMISSION_PERCENT) / 100);
	const platformFixed = PLATFORM_COMMISSION_FIXED_PER_PRODUCT;
	const platformTotal = platformPercent + platformFixed;

	// Commission Stripe (estimée pour 1 produit seul)
	const stripePercent = Math.floor((price * STRIPE_COMMISSION_PERCENT) / 100);
	const stripeFixed = STRIPE_COMMISSION_FIXED;
	const stripeTotal = stripePercent + stripeFixed;

	const totalCommission = platformTotal + stripeTotal;
	const creatorEarnings = price - totalCommission;

	return {
		price,
		platformCommission: platformTotal,
		stripeCommission: stripeTotal,
		totalCommission,
		creatorEarnings,
		commissionPercent: price > 0 ? Math.round((totalCommission / price) * 10000) / 100 : 0
	};
}

/**
 * Formate un montant en centimes vers un affichage en euros
 * @param cents Montant en centimes
 * @returns Chaîne formatée (ex: "12.50 €")
 */
export function formatPrice(cents: number): string {
	return (cents / 100).toFixed(2) + ' €';
}

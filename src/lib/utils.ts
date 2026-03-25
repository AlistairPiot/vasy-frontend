import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Commission : 10% fixe tout inclus (Stripe + plateforme)
export const COMMISSION_PERCENT = 10.0;

/**
 * Calcule les détails de commission pour un produit unique
 * @param price Prix en centimes
 * @returns Objet avec les détails de commission
 */
export function calculateProductCommission(price: number) {
	const commission = Math.round((price * COMMISSION_PERCENT) / 100);
	const creatorEarnings = price - commission;

	return {
		price,
		platformCommission: commission,
		stripeCommission: 0,
		totalCommission: commission,
		creatorEarnings,
		commissionPercent: COMMISSION_PERCENT
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

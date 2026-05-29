<script lang="ts">
	import { onMount } from 'svelte';
	import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	let { data } = $props();

	let stripe: Stripe | null = null;
	let elements: StripeElements | null = null;
	let cardElement: any = null;

	let isProcessing = $state(false);
	let errorMessage = $state('');

	let shippingName = $state('');
	let shippingAddress = $state('');
	let shippingCity = $state('');
	let shippingPostalCode = $state('');

	let totalAmount = $derived($cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0));

	onMount(async () => {
		if ($cart.items.length === 0) {
			goto('/cart');
			return;
		}

		stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
		if (!stripe) {
			errorMessage = 'Impossible de charger Stripe';
			return;
		}

		elements = stripe.elements();

		cardElement = elements.create('card', {
			style: {
				base: {
					fontSize: '15px',
					color: '#2C1F14',
					fontFamily: 'Inter, sans-serif',
					'::placeholder': { color: '#8B6E5A' },
				},
				invalid: { color: '#C4704A' },
			},
		});

		cardElement.mount('#card-element');

		cardElement.on('change', (event: any) => {
			errorMessage = event.error ? event.error.message : '';
		});
	});

	const checkoutPayload = () => ({
		items: $cart.items.map(item => ({ product_id: item.id, quantity: item.quantity })),
		shipping_name: shippingName,
		shipping_address: shippingAddress,
		shipping_city: shippingCity,
		shipping_postal_code: shippingPostalCode,
		shipping_country: 'FR',
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!stripe || !cardElement || isProcessing) return;

		isProcessing = true;
		errorMessage = '';

		try {
			// Étape 1 : valider le panier et créer le PaymentIntent (pas de commande en DB)
			const intentRes = await fetch('/api/checkout/create-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(checkoutPayload()),
			});

			if (!intentRes.ok) {
				const err = await intentRes.json().catch(() => ({}));
				throw new Error(err.message || 'Erreur lors de la préparation du paiement');
			}

			const { client_secret } = await intentRes.json();

			// Étape 2 : confirmer le paiement côté Stripe
			const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
				payment_method: {
					card: cardElement,
					billing_details: { name: shippingName },
				},
			});

			if (stripeError) throw new Error(stripeError.message);

			if (!paymentIntent || paymentIntent.status !== 'requires_capture') {
				throw new Error('Le paiement n\'a pas pu être autorisé');
			}

			// Étape 3 : créer la commande en DB (paiement vérifié par le backend)
			const confirmRes = await fetch('/api/checkout/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...checkoutPayload(),
					payment_intent_id: paymentIntent.id,
				}),
			});

			if (!confirmRes.ok) {
				const err = await confirmRes.json().catch(() => ({}));
				throw new Error(err.message || 'Erreur lors de la confirmation de la commande');
			}

			const { order_id } = await confirmRes.json();
			cart.clear();
			goto('/checkout/success?order_id=' + order_id);

		} catch (err: any) {
			errorMessage = err.message || 'Une erreur est survenue';
		} finally {
			isProcessing = false;
		}
	}

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	const inputClass = 'w-full px-3 py-2.5 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow';
	const labelClass = 'block text-sm font-medium text-foreground/80 mb-1.5';
</script>

<div class="min-h-screen bg-background">
	<Header user={data.user} />

	<main class="container mx-auto px-4 md:px-6 py-8 pt-24">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Panier', href: '/cart' },
			{ label: 'Paiement' }
		]} />

		<div class="pt-8 mb-8">
			<h1 class="text-3xl md:text-4xl text-foreground">Paiement</h1>
		</div>

		<div class="grid md:grid-cols-5 gap-8 items-start">
			<!-- Formulaire -->
			<div class="md:col-span-3">
				<form onsubmit={handleSubmit} class="space-y-6">
					<!-- Livraison -->
					<Card class="p-6">
						<h2 class="text-lg font-semibold mb-5">Informations de livraison</h2>
						<div class="space-y-4">
							<div>
								<label for="shipping-name" class={labelClass}>Nom complet</label>
								<input
									id="shipping-name"
									type="text"
									bind:value={shippingName}
									required
									autocomplete="name"
									placeholder="Jean Dupont"
									class={inputClass}
								/>
							</div>
							<div>
								<label for="shipping-address" class={labelClass}>Adresse</label>
								<input
									id="shipping-address"
									type="text"
									bind:value={shippingAddress}
									required
									autocomplete="street-address"
									placeholder="123 Rue de la Paix"
									class={inputClass}
								/>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label for="shipping-postal" class={labelClass}>Code postal</label>
									<input
										id="shipping-postal"
										type="text"
										bind:value={shippingPostalCode}
										required
										autocomplete="postal-code"
										placeholder="75001"
										class={inputClass}
									/>
								</div>
								<div>
									<label for="shipping-city" class={labelClass}>Ville</label>
									<input
										id="shipping-city"
										type="text"
										bind:value={shippingCity}
										required
										autocomplete="address-level2"
										placeholder="Paris"
										class={inputClass}
									/>
								</div>
							</div>
						</div>
					</Card>

					<!-- Paiement -->
					<Card class="p-6">
						<h2 class="text-lg font-semibold mb-5">Informations de paiement</h2>
						<div id="card-element" class="px-3 py-3 border border-input rounded-lg bg-background min-h-11"></div>
						{#if errorMessage}
							<p class="mt-3 text-sm text-destructive">{errorMessage}</p>
						{/if}
					</Card>

					<Button type="submit" disabled={isProcessing} class="w-full h-12 text-base">
						{#snippet children()}
							{#if isProcessing}
								<span class="flex items-center gap-2">
									<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
									</svg>
									Traitement en cours…
								</span>
							{:else}
								Confirmer — {formatPrice(totalAmount)}
							{/if}
						{/snippet}
					</Button>

					<p class="text-xs text-muted-foreground text-center leading-relaxed">
						Votre carte ne sera pas débitée maintenant. Le paiement est effectué uniquement quand le créateur expédie votre commande.
					</p>
				</form>
			</div>

			<!-- Récapitulatif -->
			<div class="md:col-span-2">
				<Card class="p-6 sticky top-24">
					<h2 class="text-lg font-semibold mb-5">Récapitulatif</h2>
					<div class="space-y-4 mb-5">
						{#each $cart.items as item}
							<div class="flex gap-3 items-center">
								{#if item.image_url}
									<img src={item.image_url} alt={item.name} class="w-14 h-14 object-cover rounded-lg shrink-0" />
								{:else}
									<div class="w-14 h-14 rounded-lg bg-muted shrink-0"></div>
								{/if}
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium truncate">{item.name}</p>
									<p class="text-xs text-muted-foreground">Qté : {item.quantity}</p>
								</div>
								<p class="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
							</div>
						{/each}
					</div>
					<div class="border-t border-border pt-4 space-y-2">
						<div class="flex justify-between text-sm text-muted-foreground">
							<span>Sous-total</span>
							<span>{formatPrice(totalAmount)}</span>
						</div>
						<div class="flex justify-between text-sm text-muted-foreground">
							<span>Livraison</span>
							<span>Gratuite</span>
						</div>
						<div class="flex justify-between items-center pt-2 border-t border-border">
							<span class="font-semibold">Total</span>
							<span class="text-xl font-bold text-primary">{formatPrice(totalAmount)}</span>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</main>
</div>

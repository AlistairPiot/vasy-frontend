<script lang="ts">
	import { onMount } from 'svelte';
	import { loadStripe, type Stripe, type StripeElements, type PaymentIntent } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Header from '$lib/components/Header.svelte';

	let { data } = $props();

	let stripe: Stripe | null = null;
	let elements: StripeElements | null = null;
	let cardElement: any = null;

	let isProcessing = $state(false);
	let errorMessage = $state('');
	let clientSecret = $state('');
	let orderId = $state('');

	// Formulaire
	let shippingName = $state('');
	let shippingAddress = $state('');
	let shippingCity = $state('');
	let shippingPostalCode = $state('');

	// Calculer le total
	let totalAmount = $derived($cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0));

	onMount(async () => {
		// Vérifier qu'il y a des articles
		if ($cart.items.length === 0) {
			goto('/cart');
			return;
		}

		// Initialiser Stripe
		stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
		if (!stripe) {
			errorMessage = 'Impossible de charger Stripe';
			return;
		}

		// Créer les éléments Stripe
		elements = stripe.elements();

		// Créer l'élément de carte
		cardElement = elements.create('card', {
			style: {
				base: {
					fontSize: '16px',
					color: '#424770',
					'::placeholder': {
						color: '#aab7c4',
					},
				},
				invalid: {
					color: '#9e2146',
				},
			},
		});

		cardElement.mount('#card-element');

		// Écouter les erreurs
		cardElement.on('change', (event: any) => {
			if (event.error) {
				errorMessage = event.error.message;
			} else {
				errorMessage = '';
			}
		});
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!stripe || !cardElement || isProcessing) return;

		isProcessing = true;
		errorMessage = '';

		try {
			// Créer la commande et obtenir le client secret
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					items: $cart.items.map(item => ({
						product_id: item.id,
						quantity: item.quantity,
					})),
					shipping_name: shippingName,
					shipping_address: shippingAddress,
					shipping_city: shippingCity,
					shipping_postal_code: shippingPostalCode,
					shipping_country: 'FR',
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.detail || 'Erreur lors de la création de la commande');
			}

			const data = await response.json();
			clientSecret = data.client_secret;
			orderId = data.order_id;

			// Confirmer le paiement avec Stripe
			const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
				payment_method: {
					card: cardElement,
					billing_details: {
						name: shippingName,
					},
				},
			});

			if (error) {
				throw new Error(error.message);
			}

			if (paymentIntent && paymentIntent.status === 'requires_capture') {
				// Succès ! L'autorisation est créée
				cart.clear();
				goto('/checkout/success?order_id=' + orderId);
			}
		} catch (err: any) {
			errorMessage = err.message || 'Une erreur est survenue';
		} finally {
			isProcessing = false;
		}
	}

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}
</script>

<div class="min-h-screen bg-background">
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8 pt-24">
		<h1 class="text-3xl font-bold mb-8">Paiement</h1>

		<div class="grid md:grid-cols-2 gap-8">
			<!-- Formulaire de livraison et paiement -->
			<div>
				<form onsubmit={handleSubmit}>
					<Card class="p-6 mb-6">
						<h2 class="text-xl font-semibold mb-4">Informations de livraison</h2>

						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium mb-1">Nom complet</label>
								<input
									type="text"
									bind:value={shippingName}
									required
									class="w-full px-3 py-2 border rounded-md"
									placeholder="Jean Dupont"
								/>
							</div>

							<div>
								<label class="block text-sm font-medium mb-1">Adresse</label>
								<input
									type="text"
									bind:value={shippingAddress}
									required
									class="w-full px-3 py-2 border rounded-md"
									placeholder="123 Rue de la Paix"
								/>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="block text-sm font-medium mb-1">Code postal</label>
									<input
										type="text"
										bind:value={shippingPostalCode}
										required
										class="w-full px-3 py-2 border rounded-md"
										placeholder="75001"
									/>
								</div>

								<div>
									<label class="block text-sm font-medium mb-1">Ville</label>
									<input
										type="text"
										bind:value={shippingCity}
										required
										class="w-full px-3 py-2 border rounded-md"
										placeholder="Paris"
									/>
								</div>
							</div>
						</div>
					</Card>

					<Card class="p-6 mb-6">
						<h2 class="text-xl font-semibold mb-4">Informations de paiement</h2>

						<div id="card-element" class="p-3 border rounded-md"></div>

						{#if errorMessage}
							<div class="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
								{errorMessage}
							</div>
						{/if}
					</Card>

					<Button type="submit" disabled={isProcessing} class="w-full">
						{#snippet children()}
							{isProcessing ? 'Traitement...' : `Confirmer l'autorisation de paiement - ${formatPrice(totalAmount)}`}
						{/snippet}
					</Button>

					<p class="text-sm text-muted-foreground mt-2 text-center">
						Votre carte ne sera pas débitée maintenant. Le paiement sera effectué uniquement lorsque le créateur expédiera votre commande.
					</p>
				</form>
			</div>

			<!-- Récapitulatif de la commande -->
			<div>
				<Card class="p-6">
					<h2 class="text-xl font-semibold mb-4">Récapitulatif</h2>

					<div class="space-y-4 mb-6">
						{#each $cart.items as item}
							<div class="flex gap-4">
								<img
									src={item.image_url}
									alt={item.name}
									class="w-16 h-16 object-cover rounded"
								/>
								<div class="flex-1">
									<p class="font-medium">{item.name}</p>
									<p class="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
								</div>
								<p class="font-medium">{formatPrice(item.price * item.quantity)}</p>
							</div>
						{/each}
					</div>

					<div class="border-t pt-4">
						<div class="flex justify-between items-center text-lg font-bold">
							<span>Total</span>
							<span>{formatPrice(totalAmount)}</span>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</main>
</div>

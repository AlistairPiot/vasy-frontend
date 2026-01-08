<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ConfirmModal from '$lib/components/ui/ConfirmModal.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { cart } from '$lib/stores/cart';

	let { data } = $props();
	let showClearCartModal = $state(false);

	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	function getTotalPrice(): number {
		return $cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
	}

	function incrementQuantity(productId: string) {
		const item = $cart.items.find((i) => i.id === productId);
		if (item) {
			cart.updateQuantity(productId, item.quantity + 1);
		}
	}

	function decrementQuantity(productId: string) {
		const item = $cart.items.find((i) => i.id === productId);
		if (item && item.quantity > 1) {
			cart.updateQuantity(productId, item.quantity - 1);
		}
	}

	function handleClearCart() {
		cart.clear();
		showClearCartModal = false;
	}

	function removeItemWithAnimation(productId: string, event: MouseEvent) {
		// Trouver l'élément parent de la carte
		const button = event.currentTarget as HTMLElement;
		const cardElement = button.closest('.cart-item-card') as HTMLElement;

		if (cardElement) {
			// Animation de sortie
			gsap.to(cardElement, {
				x: 100,
				opacity: 0,
				height: 0,
				marginBottom: 0,
				paddingTop: 0,
				paddingBottom: 0,
				duration: 0.4,
				ease: 'power2.inOut',
				onComplete: () => {
					// Supprimer l'item après l'animation
					cart.removeItem(productId);
				}
			});
		} else {
			// Fallback si l'élément n'est pas trouvé
			cart.removeItem(productId);
		}
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Produits', href: '/products' },
			{ label: 'Panier' }
		]} />

		<div class="grid md:grid-cols-3 gap-8 py-8">
			<!-- Cart Items -->
			<div class="md:col-span-2">
				<div class="animate-in">
					<h1 class="text-3xl font-bold mb-2">Mon panier</h1>
					<p class="text-muted-foreground mb-6">
						{$cart.items.length} article{$cart.items.length !== 1 ? 's' : ''}
					</p>
				</div>

				{#if $cart.items.length === 0}
					<Card class="p-8 text-center animate-in">
						<p class="text-muted-foreground mb-6">Votre panier est vide</p>
						<a href="/products">
							<Button>
								{#snippet children()}
									Continuer les achats
								{/snippet}
							</Button>
						</a>
					</Card>
				{:else}
					<div class="space-y-4">
						{#each $cart.items as item, index (item.id)}
							<Card class="cart-item-card p-4 animate-in hover:shadow-md transition-shadow" style={`animation-delay: ${index * 0.1}s`}>
								<div class="flex gap-4">
									<!-- Image -->
									<div class="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
										{#if item.image_url}
											<img src={item.image_url} alt={item.name} class="w-full h-full object-cover" />
										{:else}
											<div class="w-full h-full flex items-center justify-center text-muted-foreground">
												Pas d'image
											</div>
										{/if}
									</div>

									<!-- Item Details -->
									<div class="flex-1">
										<h3 class="font-semibold mb-2">{item.name}</h3>
										<p class="text-lg font-bold text-primary">{formatPrice(item.price)}</p>

										<!-- Quantity Controls -->
										<div class="flex items-center gap-2 mt-4">
											<button
												onclick={() => decrementQuantity(item.id)}
												class="w-8 h-8 rounded border border-input hover:bg-accent transition-colors flex items-center justify-center"
											>
												−
											</button>
											<span class="w-8 text-center font-medium">{item.quantity}</span>
											<button
												onclick={() => incrementQuantity(item.id)}
												class="w-8 h-8 rounded border border-input hover:bg-accent transition-colors flex items-center justify-center"
											>
												+
											</button>
										</div>
									</div>

									<!-- Item Total & Remove -->
									<div class="flex flex-col items-end justify-between">
										<p class="text-lg font-bold">{formatPrice(item.price * item.quantity)}</p>
										<button
											onclick={(e) => removeItemWithAnimation(item.id, e)}
											class="text-sm text-destructive hover:text-destructive/80 transition-colors"
										>
											Supprimer
										</button>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Order Summary -->
			<div>
				<Card class="p-6 animate-in sticky top-4">
					<h2 class="text-xl font-bold mb-6">Résumé de la commande</h2>

					<div class="space-y-4 mb-6 border-b pb-6">
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Sous-total</span>
							<span class="font-medium">{formatPrice(getTotalPrice())}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Frais de port</span>
							<span class="font-medium">Gratuit</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Taxes</span>
							<span class="font-medium">Incluses</span>
						</div>
					</div>

					<div class="flex justify-between items-center mb-6">
						<span class="font-bold">Total</span>
						<span class="text-2xl font-bold text-primary">{formatPrice(getTotalPrice())}</span>
					</div>

					{#if $cart.items.length > 0}
						<a href="/checkout">
							<Button class="w-full">
								{#snippet children()}
									Procéder au paiement
								{/snippet}
							</Button>
						</a>
					{/if}

					<button
						onclick={() => showClearCartModal = true}
						class="w-full mt-2 px-4 py-2 text-sm text-destructive border border-destructive rounded-md hover:bg-destructive/10 transition-colors"
					>
						Vider le panier
					</button>
				</Card>
			</div>
		</div>
	</main>

	<!-- Modale de confirmation pour vider le panier -->
	<ConfirmModal
		bind:isOpen={showClearCartModal}
		title="Vider le panier ?"
		message="Êtes-vous sûr de vouloir supprimer tous les articles de votre panier ? Cette action est irréversible."
		confirmText="Vider le panier"
		cancelText="Annuler"
		variant="destructive"
		onConfirm={handleClearCart}
		onCancel={() => showClearCartModal = false}
	/>
</div>

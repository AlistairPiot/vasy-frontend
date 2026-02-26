<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { calculateProductCommission, formatPrice } from '$lib/utils';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function getFirstImage(imageUrls: string): string | null {
		try {
			const urls = JSON.parse(imageUrls);
			return urls[0] || null;
		} catch {
			return null;
		}
	}
</script>

<div bind:this={containerRef}>
	<div class="flex justify-between items-center mb-6">
		<h1 class="animate-in text-2xl font-bold">Mes produits</h1>
		<a href="/creator/products/new">
			<Button>
				{#snippet children()}
					+ Nouveau produit
				{/snippet}
			</Button>
		</a>
	</div>

	{#if !data.stripeStatus.onboarding_complete}
		<Card class="animate-in p-6 mb-6 border-orange-500 bg-orange-50">
			<div class="flex gap-4 items-start">
				<svg
					class="w-6 h-6 text-orange-600 shrink-0 mt-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<div class="flex-1">
					<h3 class="font-semibold text-orange-900 mb-2">Configuration Stripe requise</h3>
					<p class="text-sm text-orange-800 mb-4">
						Vous devez configurer votre compte Stripe pour pouvoir créer et vendre des produits.
						Cette étape est obligatoire pour recevoir les paiements de vos clients.
					</p>
					<a href="/creator/profile#stripe">
						<Button size="sm" class="bg-orange-600 hover:bg-orange-700 text-white">
							{#snippet children()}
								Configurer Stripe maintenant
							{/snippet}
						</Button>
					</a>
				</div>
			</div>
		</Card>
	{/if}

	{#if data.products.length === 0}
		<Card class="animate-in p-8 text-center">
			<p class="text-muted-foreground mb-4">Vous n'avez pas encore de produit</p>
			<a href="/creator/products/new">
				<Button>
					{#snippet children()}
						Créer mon premier produit
					{/snippet}
				</Button>
			</a>
		</Card>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each data.products as product}
				<a href="/creator/products/{product.id}" class="block">
					<Card class="animate-in p-4 hover:shadow-md transition-shadow">
						{#if getFirstImage(product.image_urls)}
							<img
								src={getFirstImage(product.image_urls)}
								alt={product.name}
								class="w-full h-40 object-cover rounded-md mb-3"
							/>
						{:else}
							<div class="w-full h-40 bg-muted rounded-md mb-3 flex items-center justify-center">
								<span class="text-muted-foreground text-sm">Pas d'image</span>
							</div>
						{/if}
						<h3 class="font-semibold truncate">{product.name}</h3>
						<div class="flex justify-between items-center mt-2">
							<div>
								<span class="text-lg font-bold">{formatPrice(product.price)}</span>
								<div class="text-xs text-green-600">
									Vous recevez: {formatPrice(calculateProductCommission(product.price).creatorEarnings)}
								</div>
							</div>
							<span class="text-sm text-muted-foreground">
								Stock: {product.stock}
							</span>
						</div>
						{#if !product.is_active}
							<span class="inline-block mt-2 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
								Inactif
							</span>
						{/if}
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>

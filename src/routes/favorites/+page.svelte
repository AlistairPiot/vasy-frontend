<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { PUBLIC_API_URL } from '$env/static/public';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { favorites } from '$lib/stores/favorites';
	import { formatPrice } from '$lib/utils';

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let products = $state<any[]>([]);
	let loading = $state(true);

	onMount(async () => {
		const ids = $favorites;

		if (ids.length === 0) {
			loading = false;
			return;
		}

		const results = await Promise.all(
			ids.map(async (id) => {
				try {
					const res = await fetch(`${PUBLIC_API_URL}/products/${id}`);
					if (!res.ok) return null;
					return await res.json();
				} catch {
					return null;
				}
			})
		);

		products = results.filter(Boolean);
		loading = false;

		if (products.length > 0) {
			gsap.from(containerRef.querySelectorAll('.product-card'), {
				y: 20,
				opacity: 0,
				duration: 0.5,
				stagger: 0.08,
				ease: 'power3.out'
			});
		}
	});

	function getFirstImage(imageUrls: string): string | null {
		try {
			const urls = JSON.parse(imageUrls);
			return urls[0] || null;
		} catch {
			return null;
		}
	}

	function removeFavorite(productId: string, event: MouseEvent) {
		const card = (event.currentTarget as HTMLElement).closest('.product-card') as HTMLElement;
		if (!card) return;

		gsap.to(card, {
			opacity: 0,
			scale: 0.9,
			duration: 0.3,
			ease: 'power3.in',
			onComplete: () => {
				card.style.visibility = 'hidden';
				favorites.remove(productId);
				products = products.filter((p) => p.id !== productId);
			}
		});
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Mes favoris' }
		]} />

		<div class="flex items-center gap-3 mt-6 mb-8">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-red-500">
				<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
			</svg>
			<h1 class="text-2xl font-bold">Mes favoris</h1>
		</div>

		{#if loading}
			<div class="flex justify-center py-16">
				<div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if products.length === 0}
			<Card class="p-12 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-muted-foreground">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
				</svg>
				<p class="text-muted-foreground mb-4">Vous n'avez pas encore de favoris</p>
				<a href="/products" class="text-primary hover:underline text-sm">Explorer les produits</a>
			</Card>
		{:else}
			<p class="text-sm text-muted-foreground mb-6">{products.length} produit{products.length > 1 ? 's' : ''} en favori</p>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each products as product (product.id)}
					<div class="product-card relative">
						<button
							onclick={(e) => removeFavorite(product.id, e)}
							class="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
							title="Retirer des favoris"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-red-500">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
						</button>
						<a href="/products/{product.id}">
							<Card class="p-0 overflow-hidden hover:shadow-md transition-shadow">
								{#if getFirstImage(product.image_urls)}
									<img
										src={getFirstImage(product.image_urls)}
										alt={product.name}
										class="w-full h-48 object-cover"
									/>
								{:else}
									<div class="w-full h-48 bg-muted flex items-center justify-center">
										<span class="text-muted-foreground text-sm">Pas d'image</span>
									</div>
								{/if}
								<div class="p-4">
									<h3 class="font-semibold truncate mb-1">{product.name}</h3>
									<p class="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
									{#if product.stock === 0}
										<span class="text-xs text-red-500 mt-1 inline-block">Épuisé</span>
									{/if}
								</div>
							</Card>
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

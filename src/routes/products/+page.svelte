<script lang="ts">
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let previousProductsLength = 0;

	// Animer les éléments quand les produits changent
	$effect(() => {
		// Vérifier si les produits ont changé
		const currentLength = data.products.length;

		if (containerRef && currentLength !== previousProductsLength) {
			previousProductsLength = currentLength;

			// Petit délai pour s'assurer que le DOM est mis à jour
			setTimeout(() => {
				const elements = containerRef.querySelectorAll('.animate-in');

				// D'abord, définir l'état initial (caché)
				gsap.set(elements, {
					y: 20,
					opacity: 0
				});

				// Puis animer vers l'état visible
				gsap.to(elements, {
					y: 0,
					opacity: 1,
					duration: 0.5,
					stagger: 0.08,
					ease: 'power3.out',
					clearProps: 'all'
				});
			}, 10);
		}
	});

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	function getFirstImage(imageUrls: string): string | null {
		try {
			const urls = JSON.parse(imageUrls);
			return urls[0] || null;
		} catch {
			return null;
		}
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Produits' }
		]} />

		{#if data.searchQuery}
			<h1 class="animate-in text-3xl font-bold mb-2 pt-8">
				Résultats pour "{data.searchQuery}"
			</h1>
			<p class="animate-in text-muted-foreground mb-8">
				{data.products.length} produit{data.products.length > 1 ? 's' : ''} trouvé{data.products.length > 1 ? 's' : ''}
			</p>
		{:else}
			<h1 class="animate-in text-3xl font-bold mb-8 pt-8">Tous les produits</h1>
		{/if}

		{#if data.products.length === 0}
			<Card class="animate-in p-8 text-center">
				{#if data.searchQuery}
					<p class="text-muted-foreground">Aucun produit trouvé pour "{data.searchQuery}"</p>
				{:else}
					<p class="text-muted-foreground">Aucun produit disponible pour le moment</p>
				{/if}
			</Card>
		{:else}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.products as product}
					<a href="/products/{product.id}" class="block">
						<Card class="animate-in overflow-hidden hover:shadow-lg transition-shadow">
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
								<h3 class="font-semibold truncate">{product.name}</h3>
								<div class="flex justify-between items-center mt-2">
									<span class="text-lg font-bold text-primary">
										{formatPrice(product.price)}
									</span>
									{#if product.stock > 0}
										<span class="text-xs text-green-600">En stock</span>
									{:else}
										<span class="text-xs text-red-600">Épuisé</span>
									{/if}
								</div>
							</div>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>

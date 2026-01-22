<script lang="ts">
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let previousProductsLength = 0;
	let sortBy = $state<'default' | 'price_asc' | 'price_desc'>('default');
	let isLoading = $state(false);

	// Produits triés
	let sortedProducts = $derived.by(() => {
		const products = [...data.products];

		if (sortBy === 'price_asc') {
			return products.sort((a, b) => a.price - b.price);
		} else if (sortBy === 'price_desc') {
			return products.sort((a, b) => b.price - a.price);
		}

		return products;
	});

	// Gérer le changement de tri avec loader
	function handleSortChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		isLoading = true;

		// Petit délai pour afficher le loader
		setTimeout(() => {
			sortBy = target.value as 'default' | 'price_asc' | 'price_desc';

			// Attendre un peu avant de masquer le loader et réanimer
			setTimeout(() => {
				isLoading = false;
			}, 200);
		}, 100);
	}

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

		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 mb-8">
			<div>
				{#if data.searchQuery}
					<h1 class="animate-in text-3xl font-bold mb-2">
						Résultats pour "{data.searchQuery}"
					</h1>
					<p class="animate-in text-muted-foreground">
						{data.products.length} produit{data.products.length > 1 ? 's' : ''} trouvé{data.products.length > 1 ? 's' : ''}
					</p>
				{:else}
					<h1 class="animate-in text-3xl font-bold">Tous les produits</h1>
				{/if}
			</div>

			<!-- Menu de tri -->
			{#if data.products.length > 0}
				<div class="animate-in flex items-center gap-3">
					<label for="sort" class="text-sm font-medium text-muted-foreground">
						Trier par :
					</label>
					<select
						id="sort"
						value={sortBy}
						onchange={handleSortChange}
						class="px-4 py-2 border border-input bg-background rounded-md text-sm font-medium cursor-pointer hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
					>
						<option value="default">Par défaut</option>
						<option value="price_asc">Prix croissant</option>
						<option value="price_desc">Prix décroissant</option>
					</select>
				</div>
			{/if}
		</div>

		{#if data.products.length === 0}
			<Card class="animate-in p-8 text-center">
				{#if data.searchQuery}
					<p class="text-muted-foreground">Aucun produit trouvé pour "{data.searchQuery}"</p>
				{:else}
					<p class="text-muted-foreground">Aucun produit disponible pour le moment</p>
				{/if}
			</Card>
		{:else if isLoading}
			<!-- Loader -->
			<div class="flex flex-col items-center justify-center py-20">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
				<p class="text-muted-foreground text-sm">Tri en cours...</p>
			</div>
		{:else}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each sortedProducts as product}
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

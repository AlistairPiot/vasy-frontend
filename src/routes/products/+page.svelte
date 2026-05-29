<script lang="ts">
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { tilt } from '$lib/actions/tilt';

	let { data } = $props();
	let containerRef: HTMLDivElement;
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

	$effect(() => {
		void data.products.length; // tracked
		if (isLoading || !containerRef) return;

		setTimeout(() => {
			const elements = containerRef.querySelectorAll('.product-card');
			gsap.fromTo(
				elements,
				{ y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
			);
		}, 10);
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

	<main class="container mx-auto px-6 py-8">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Produits' }
		]} />

		<div class="flex flex-col sm:flex-row justify-between items-end gap-4 pt-10 mb-10">
			<div>
				{#if data.searchQuery}
					<h1 class="animate-in text-4xl text-foreground mb-1">
						Résultats pour<br /><em class="not-italic text-primary">"{data.searchQuery}"</em>
					</h1>
					<p class="animate-in text-sm text-muted-foreground">
						{data.products.length} produit{data.products.length > 1 ? 's' : ''} trouvé{data.products.length > 1 ? 's' : ''}
					</p>
				{:else}
					<h1 class="animate-in text-4xl text-foreground">Toutes les créations</h1>
					<p class="animate-in text-sm text-muted-foreground mt-1">Pièces uniques façonnées à la main</p>
				{/if}
			</div>

			{#if data.products.length > 0}
				<div class="animate-in flex items-center gap-3 shrink-0">
					<label for="sort" class="text-sm text-muted-foreground">Trier par :</label>
					<select
						id="sort"
						value={sortBy}
						onchange={handleSortChange}
						class="px-3 py-1.5 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-secondary transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
					>
						<option value="default">Par défaut</option>
						<option value="price_asc">Prix croissant</option>
						<option value="price_desc">Prix décroissant</option>
					</select>
				</div>
			{/if}
		</div>

		{#if data.products.length === 0}
			<div class="animate-in py-20 text-center">
				{#if data.searchQuery}
					<p class="text-muted-foreground">Aucun produit trouvé pour "{data.searchQuery}"</p>
				{:else}
					<p class="text-muted-foreground">Aucune création disponible pour le moment</p>
				{/if}
			</div>
		{:else if isLoading}
			<div class="flex flex-col items-center justify-center py-20">
				<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
				<p class="text-muted-foreground text-sm">Tri en cours…</p>
			</div>
		{:else}
			<div class="columns-2 md:columns-3 xl:columns-4 gap-4">
				{#each sortedProducts as product}
					<a href="/products/{product.id}" use:tilt class="block break-inside-avoid mb-4 group">
						<div class="product-card opacity-0 overflow-hidden rounded-lg bg-card border border-border/40 hover:border-border hover:shadow-md transition-all duration-300">
							{#if getFirstImage(product.image_urls)}
								<div class="overflow-hidden">
									<img
										src={getFirstImage(product.image_urls)}
										alt={product.name}
										class="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
									/>
								</div>
							{:else}
								<div class="aspect-4/3 bg-muted flex items-center justify-center">
									<svg class="w-8 h-8 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
							{/if}
							<div class="p-3">
								<h3 class="font-medium text-sm text-foreground truncate">{product.name}</h3>
								<div class="flex justify-between items-center mt-1.5">
									<span class="text-sm font-semibold text-primary">{formatPrice(product.price)}</span>
									{#if product.stock === 0}
										<span class="text-xs text-muted-foreground">Épuisé</span>
									{/if}
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>

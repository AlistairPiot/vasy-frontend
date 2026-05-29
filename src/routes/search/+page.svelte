<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { formatPrice } from '$lib/utils';
	import { tilt } from '$lib/actions/tilt';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out'
		});
		const cards = containerRef.querySelectorAll('.product-card');
		if (cards.length) {
			gsap.fromTo(cards,
				{ y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.5, stagger: 0.06, delay: 0.2, ease: 'power3.out' }
			);
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

	const totalCount = $derived(data.products.length + data.creators.length);
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Recherche' }
		]} />

		<div class="pt-8 mb-8">
			<h1 class="animate-in text-3xl font-bold mb-1">
				Résultats pour "{data.searchQuery}"
			</h1>
			<p class="animate-in text-muted-foreground">
				{totalCount} résultat{totalCount > 1 ? 's' : ''}
				{#if data.creators.length > 0 && data.products.length > 0}
					— {data.creators.length} créateur{data.creators.length > 1 ? 's' : ''}, {data.products.length} produit{data.products.length > 1 ? 's' : ''}
				{/if}
			</p>
		</div>

		{#if totalCount === 0}
			<Card class="animate-in p-12 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-muted-foreground">
					<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
				</svg>
				<p class="text-muted-foreground">Aucun résultat pour "{data.searchQuery}"</p>
				<p class="text-sm text-muted-foreground mt-2">Essayez avec d'autres mots-clés</p>
			</Card>
		{:else}
			<!-- Section Créateurs -->
			{#if data.creators.length > 0}
				<section class="animate-in mb-10">
					<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
						Créateurs
						<span class="text-sm font-normal text-muted-foreground">({data.creators.length})</span>
					</h2>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each data.creators as creator}
							<a href="/creators/{creator.id}">
								<Card class="p-4 hover:shadow-md transition-shadow flex items-center gap-4">
									{#if creator.profile_image_url}
										<img src={creator.profile_image_url} alt={creator.display_name} class="w-14 h-14 rounded-full object-cover shrink-0" />
									{:else}
										<div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2">
											<h3 class="font-semibold truncate">{creator.display_name}</h3>
											<span class="shrink-0 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Créateur</span>
										</div>
										{#if creator.bio}
											<p class="text-sm text-muted-foreground line-clamp-2 mt-0.5">{creator.bio}</p>
										{/if}
									</div>
								</Card>
							</a>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Section Produits -->
			{#if data.products.length > 0}
				<section class="animate-in">
					<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
						Produits
						<span class="text-sm font-normal text-muted-foreground">({data.products.length})</span>
					</h2>
					<div class="columns-2 md:columns-3 xl:columns-4 gap-4">
						{#each data.products as product}
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
										<p class="text-xs text-muted-foreground truncate mt-0.5">{product.creator_name}</p>
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
				</section>
			{/if}
		{/if}
	</main>
</div>

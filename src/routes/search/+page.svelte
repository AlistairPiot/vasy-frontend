<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { formatPrice } from '$lib/utils';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.06,
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
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each data.products as product}
							<a href="/products/{product.id}">
								<Card class="p-0 overflow-hidden hover:shadow-md transition-shadow">
									{#if getFirstImage(product.image_urls)}
										<img src={getFirstImage(product.image_urls)} alt={product.name} class="w-full h-48 object-cover" />
									{:else}
										<div class="w-full h-48 bg-muted flex items-center justify-center">
											<span class="text-muted-foreground text-sm">Pas d'image</span>
										</div>
									{/if}
									<div class="p-4">
										<h3 class="font-semibold truncate mb-1">{product.name}</h3>
										<p class="text-xs text-muted-foreground mb-2">{product.creator_name}</p>
										<p class="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
										{#if product.stock === 0}
											<span class="text-xs text-red-500 mt-1 inline-block">Épuisé</span>
										{/if}
									</div>
								</Card>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		{/if}
	</main>
</div>

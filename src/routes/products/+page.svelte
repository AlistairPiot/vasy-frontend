<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.08,
			ease: 'power3.out'
		});
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

	<main class="container mx-auto px-4 py-8 pt-24">
		<h1 class="animate-in text-3xl font-bold mb-8">Tous les produits</h1>

		{#if data.products.length === 0}
			<Card class="animate-in p-8 text-center">
				<p class="text-muted-foreground">Aucun produit disponible pour le moment</p>
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

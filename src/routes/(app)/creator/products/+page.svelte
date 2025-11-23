<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

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
							<span class="text-lg font-bold">{formatPrice(product.price)}</span>
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

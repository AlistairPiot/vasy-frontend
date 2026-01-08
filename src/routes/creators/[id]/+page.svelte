<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
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

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long'
		});
	}

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	function getFirstImage(imageUrls: string): string {
		try {
			const images = JSON.parse(imageUrls);
			return images[0] || '';
		} catch {
			return '';
		}
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<header class="border-b">
		<div class="container mx-auto px-4 py-4 flex justify-between items-center">
			<a href="/" class="text-xl font-bold">Vasy</a>
			<nav class="flex gap-4 items-center">
				<a href="/products" class="text-muted-foreground hover:text-foreground">Produits</a>
				<a href="/login" class="text-muted-foreground hover:text-foreground">Connexion</a>
			</nav>
		</div>
	</header>

	<main class="container mx-auto px-4 py-8">
		<a href="/products" class="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 transition-colors">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="m15 18-6-6 6-6"/>
			</svg>
			<span>Retour aux produits</span>
		</a>

		<!-- Creator Header -->
		<Card class="p-8 mb-8 animate-in">
			<div class="flex gap-6 items-start md:items-center flex-col md:flex-row">
				<!-- Avatar -->
				<div class="flex-shrink-0">
					{#if data.creator.profile_image_url}
						<img
							src={data.creator.profile_image_url}
							alt={data.creator.display_name}
							class="w-32 h-32 rounded-full object-cover border-4 border-primary"
						/>
					{:else}
						<div class="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary">
							<span class="text-4xl font-bold text-muted-foreground">
								{data.creator.display_name.charAt(0).toUpperCase()}
							</span>
						</div>
					{/if}
				</div>

				<!-- Creator Info -->
				<div class="flex-1">
					<h1 class="text-3xl font-bold mb-2">{data.creator.display_name}</h1>

					<p class="text-muted-foreground mb-4">{data.creator.bio}</p>

					<p class="text-sm text-muted-foreground">
						Membre depuis {formatDate(data.creator.created_at)}
					</p>
				</div>
			</div>
		</Card>

		<!-- Products Section -->
		<div class="animate-in">
			<h2 class="text-2xl font-bold mb-6">Produits</h2>
			{#if data.products && data.products.length > 0}
				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.products as product (product.id)}
						<a href="/products/{product.id}">
							<Card class="overflow-hidden hover:shadow-lg transition-shadow h-full">
								<div class="aspect-square bg-muted overflow-hidden">
									{#if getFirstImage(product.image_urls)}
										<img
											src={getFirstImage(product.image_urls)}
											alt={product.name}
											class="w-full h-full object-cover hover:scale-105 transition-transform"
										/>
									{:else}
										<div class="w-full h-full flex items-center justify-center text-muted-foreground">
											Pas d'image
										</div>
									{/if}
								</div>
								<div class="p-4">
									<h3 class="font-semibold mb-2 line-clamp-2">{product.name}</h3>
									<p class="text-lg font-bold text-primary mb-2">{formatPrice(product.price)}</p>
									<p class="text-sm text-muted-foreground">
										{#if product.stock > 0}
											<span class="text-green-600">En stock</span>
										{:else}
											<span class="text-red-600">Épuisé</span>
										{/if}
									</p>
								</div>
							</Card>
						</a>
					{/each}
				</div>
			{:else}
				<Card class="p-8 text-center text-muted-foreground animate-in">
					<p>Ce créateur n'a pas encore de produits</p>
				</Card>
			{/if}
		</div>
	</main>
</div>

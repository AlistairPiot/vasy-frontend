<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let selectedImage = $state(0);
	let images = $state<string[]>([]);

	onMount(() => {
		try {
			images = JSON.parse(data.product.image_urls);
		} catch {
			images = [];
		}

		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<header class="border-b">
		<div class="container mx-auto px-4 py-4 flex justify-between items-center">
			<a href="/" class="text-xl font-bold">Vasy</a>
			<nav class="flex gap-4 items-center">
				<a href="/products" class="text-muted-foreground hover:text-foreground">Produits</a>
				{#if data.user}
					{#if data.user.role === 'creator' || data.user.role === 'admin'}
						<a href="/dashboard" class="text-muted-foreground hover:text-foreground">Dashboard</a>
					{/if}
					<form action="/logout" method="POST">
						<button type="submit" class="text-muted-foreground hover:text-foreground">
							Déconnexion
						</button>
					</form>
				{:else}
					<a href="/login" class="text-muted-foreground hover:text-foreground">Connexion</a>
				{/if}
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

		<div class="grid md:grid-cols-2 gap-8">
			<!-- Images -->
			<div class="animate-in">
				{#if images.length > 0}
					<div class="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
						<img
							src={images[selectedImage]}
							alt={data.product.name}
							class="w-full h-full object-cover"
						/>
					</div>
					{#if images.length > 1}
						<div class="grid grid-cols-5 gap-2">
							{#each images as image, i}
								<button
									onclick={() => (selectedImage = i)}
									class="aspect-square rounded overflow-hidden border-2 {selectedImage === i
										? 'border-primary'
										: 'border-transparent'}"
								>
									<img src={image} alt="" class="w-full h-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				{:else}
					<div class="aspect-square rounded-lg bg-muted flex items-center justify-center">
						<span class="text-muted-foreground">Pas d'image</span>
					</div>
				{/if}
			</div>

			<!-- Infos -->
			<div class="animate-in">
				<h1 class="text-3xl font-bold mb-4">{data.product.name}</h1>

				<p class="text-4xl font-bold text-primary mb-6">
					{formatPrice(data.product.price)}
				</p>

				{#if data.product.description}
					<div class="prose prose-sm mb-6">
						<p class="text-muted-foreground whitespace-pre-wrap">{data.product.description}</p>
					</div>
				{/if}

				<Card class="p-4 mb-6">
					<div class="flex justify-between items-center">
						<span class="text-sm">Disponibilité</span>
						{#if data.product.stock > 0}
							<span class="text-sm text-green-600 font-medium">
								En stock ({data.product.stock} disponibles)
							</span>
						{:else}
							<span class="text-sm text-red-600 font-medium">Épuisé</span>
						{/if}
					</div>
				</Card>

				<Button class="w-full" disabled={data.product.stock === 0}>
					{#snippet children()}
						{data.product.stock > 0 ? 'Acheter maintenant' : 'Produit épuisé'}
					{/snippet}
				</Button>
			</div>
		</div>
	</main>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { beforeNavigate } from '$app/navigation';
	import { PUBLIC_API_URL } from '$env/static/public';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { favorites } from '$lib/stores/favorites';
	import { eventFavorites } from '$lib/stores/eventFavorites';
	import { formatPrice } from '$lib/utils';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	let products = $state<any[]>([]);
	let events = $state<any[]>([]);
	let loading = $state(true);

	// IDs marqués pour suppression (mais pas encore retirés du store)
	let pendingRemovalProducts = $state(new Set<string>());
	let pendingRemovalEvents = $state(new Set<string>());

	// Commit les suppressions en quittant la page
	function commitRemovals() {
		for (const id of pendingRemovalProducts) favorites.remove(id);
		for (const id of pendingRemovalEvents) eventFavorites.remove(id);
	}

	beforeNavigate(() => commitRemovals());

	onMount(async () => {
		const productIds = $favorites;
		const eventIds = $eventFavorites;

		const [productResults, eventResults] = await Promise.all([
			Promise.all(
				productIds.map(async (id) => {
					try {
						const res = await fetch(`${PUBLIC_API_URL}/products/${id}`);
						return res.ok ? await res.json() : null;
					} catch { return null; }
				})
			),
			Promise.all(
				eventIds.map(async (id) => {
					try {
						const res = await fetch(`${PUBLIC_API_URL}/events/public/${id}`);
						return res.ok ? await res.json() : null;
					} catch { return null; }
				})
			)
		]);

		products = productResults.filter(Boolean);
		events = eventResults.filter(Boolean);
		loading = false;

		const cards = containerRef?.querySelectorAll('.fav-card');
		if (cards?.length) {
			gsap.from(cards, { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
		}

		// beforeunload pour fermeture onglet / navigation externe
		window.addEventListener('beforeunload', commitRemovals);
		return () => window.removeEventListener('beforeunload', commitRemovals);
	});

	function toggleProductRemoval(productId: string) {
		const next = new Set(pendingRemovalProducts);
		if (next.has(productId)) {
			next.delete(productId);
		} else {
			next.add(productId);
		}
		pendingRemovalProducts = next;
	}

	function toggleEventRemoval(eventId: string) {
		const next = new Set(pendingRemovalEvents);
		if (next.has(eventId)) {
			next.delete(eventId);
		} else {
			next.add(eventId);
		}
		pendingRemovalEvents = next;
	}

	function getFirstImage(imageUrls: string): string | null {
		try {
			const urls = JSON.parse(imageUrls);
			return urls[0] || null;
		} catch { return null; }
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
		});
	}

	function formatTime(dateStr: string): string {
		return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
		{:else if products.length === 0 && events.length === 0}
			<Card class="p-12 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-muted-foreground">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
				</svg>
				<p class="text-muted-foreground mb-4">Vous n'avez pas encore de favoris</p>
				<div class="flex justify-center gap-4">
					<a href="/products" class="text-primary hover:underline text-sm">Explorer les produits</a>
					<a href="/events" class="text-primary hover:underline text-sm">Explorer les événements</a>
				</div>
			</Card>
		{:else}
			<!-- Section Produits -->
			<section class="mb-10">
				<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
					Produits
					<span class="text-sm font-normal text-muted-foreground">({products.length})</span>
				</h2>
				{#if products.length === 0}
					<p class="text-sm text-muted-foreground py-4">
						Aucun produit en favori. <a href="/products" class="text-primary hover:underline">Explorer les produits</a>
					</p>
				{:else}
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each products as product (product.id)}
							{@const pending = pendingRemovalProducts.has(product.id)}
							<div class="fav-card relative transition-opacity duration-200 {pending ? 'opacity-50' : ''}">
								<!-- Bouton cœur -->
								<button
									onclick={() => toggleProductRemoval(product.id)}
									class="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm transition-colors {pending ? 'hover:bg-muted' : 'hover:bg-red-50'}"
									title={pending ? 'Remettre en favoris' : 'Retirer des favoris'}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={pending ? 'none' : 'currentColor'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={pending ? 'text-muted-foreground' : 'text-red-500'}>
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
									</svg>
								</button>

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
											{#if pending}
												<p class="text-xs text-muted-foreground italic">Retiré des favoris</p>
											{:else}
												<p class="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
												{#if product.stock === 0}
													<span class="text-xs text-red-500 mt-1 inline-block">Épuisé</span>
												{/if}
											{/if}
										</div>
									</Card>
								</a>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Section Événements -->
			<section>
				<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
					Événements
					<span class="text-sm font-normal text-muted-foreground">({events.length})</span>
				</h2>
				{#if events.length === 0}
					<p class="text-sm text-muted-foreground py-4">
						Aucun événement en favori. <a href="/events" class="text-primary hover:underline">Explorer les événements</a>
					</p>
				{:else}
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each events as event (event.id)}
							{@const pending = pendingRemovalEvents.has(event.id)}
							<div class="fav-card relative transition-opacity duration-200 {pending ? 'opacity-50' : ''}">
								<button
									onclick={() => toggleEventRemoval(event.id)}
									class="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm transition-colors {pending ? 'hover:bg-muted' : 'hover:bg-red-50'}"
									title={pending ? 'Remettre en favoris' : 'Retirer des favoris'}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={pending ? 'none' : 'currentColor'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={pending ? 'text-muted-foreground' : 'text-red-500'}>
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
									</svg>
								</button>

								<a href="/events/{event.id}">
									<Card class="p-4 hover:shadow-md transition-shadow">
										<h3 class="font-semibold mb-2 pr-6 truncate">{event.name}</h3>
										{#if pending}
											<p class="text-xs text-muted-foreground italic">Retiré des favoris</p>
										{:else}
											<div class="space-y-1 text-sm text-muted-foreground">
												<p class="flex items-center gap-2">
													<span class="shrink-0">📅</span>
													<span class="truncate">{formatDate(event.date)} à {formatTime(event.date)}</span>
												</p>
												<p class="flex items-center gap-2">
													<span class="shrink-0">📍</span>
													<span class="truncate">{event.location_text}</span>
												</p>
												{#if event.created_by_name}
													<p class="flex items-center gap-2">
														<span class="shrink-0">👤</span>
														<span class="truncate">{event.created_by_name}</span>
													</p>
												{/if}
											</div>
										{/if}
									</Card>
								</a>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	</main>
</div>

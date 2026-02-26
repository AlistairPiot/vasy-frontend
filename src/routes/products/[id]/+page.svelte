<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { cart } from '$lib/stores/cart';
	import { favorites } from '$lib/stores/favorites';

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let selectedImage = $state(0);
	let images = $state<string[]>([]);
	let showAddedNotification = $state(false);
	let notificationTimeout: ReturnType<typeof setTimeout>;

	const isFavorite = $derived(favorites.isFavorite(data.product.id, $favorites));

	// Report modal
	let showReportModal = $state(false);
	let reportEmail = $state(data.user?.email ?? '');
	let reportReason = $state('');
	let reportLoading = $state(false);
	let reportSuccess = $state(false);
	let reportError = $state('');

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

	function addToCart() {
		if (!data.user) {
			window.location.href = '/login';
			return;
		}

		if (data.product.stock <= 0) return;

		cart.addItem({
			id: data.product.id,
			name: data.product.name,
			price: data.product.price,
			quantity: 1,
			image_url: images[0] || '',
			creator_id: data.product.creator_id
		});

		showAddedNotification = true;
		if (notificationTimeout) clearTimeout(notificationTimeout);
		notificationTimeout = setTimeout(() => {
			showAddedNotification = false;
		}, 2000);

		// Animate notification
		gsap.fromTo('.notification', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
	}

	function toggleFavorite() {
		if (!data.user) {
			window.location.href = '/login';
			return;
		}

		favorites.toggle(data.product.id);
	}

	function openReportModal() {
		reportEmail = data.user?.email ?? '';
		reportReason = '';
		reportSuccess = false;
		reportError = '';
		showReportModal = true;
	}

	async function submitReport() {
		if (!reportEmail.trim() || !reportReason.trim()) {
			reportError = 'Veuillez remplir tous les champs.';
			return;
		}
		reportLoading = true;
		reportError = '';
		try {
			const res = await fetch('/api/reports', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					product_id: data.product.id,
					reporter_email: reportEmail.trim(),
					reason: reportReason.trim()
				})
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || 'Erreur serveur');
			}
			reportSuccess = true;
		} catch (e) {
			reportError = e instanceof Error ? e.message : 'Erreur lors de l\'envoi.';
		} finally {
			reportLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Produits', href: '/products' },
			{ label: data.product.name }
		]} />

		<a
			href="/products"
			class="animate-in group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
			Retour aux produits
		</a>

		<div class="grid md:grid-cols-2 gap-8 py-8">
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
				{#if data.creator}
					<a href="/creators/{data.creator.id}" class="text-muted-foreground hover:text-foreground transition-colors mb-2 inline-flex items-center gap-2">
						{#if data.creator.profile_image_url}
							<img
								src={data.creator.profile_image_url}
								alt={data.creator.display_name}
								class="w-8 h-8 rounded-full object-cover"
							/>
						{:else}
							<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
								{data.creator.display_name.charAt(0).toUpperCase()}
							</div>
						{/if}
						<span class="text-sm font-medium">{data.creator.display_name}</span>
					</a>
				{/if}

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

				{#if showAddedNotification}
					<div class="notification bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">
						Produit ajouté au panier !
					</div>
				{/if}

				{#if !data.user || data.user.role === 'client'}
					<div class="flex gap-3 mb-6">
						<button
							onclick={addToCart}
							disabled={data.product.stock === 0}
							class="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4 py-2 rounded-md font-medium transition-colors"
						>
							{data.product.stock > 0 ? 'Ajouter au panier' : 'Produit épuisé'}
						</button>
						{#if data.user}
							<button
								onclick={toggleFavorite}
								class="px-4 py-2 rounded-md border border-input transition-colors hover:bg-accent {isFavorite ? 'bg-red-100 text-red-600 border-red-300' : 'bg-background'}"
							>
								{#if isFavorite}
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
									</svg>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
									</svg>
								{/if}
							</button>
						{/if}
					</div>

					{#if data.user}
						<div class="text-center">
							<a href="/cart" class="text-primary hover:underline text-sm">Voir le panier</a>
						</div>
					{/if}
				{/if}

				<!-- Signaler le produit -->
				{#if data.user}
				<div class="mt-6 pt-4 border-t">
					<button
						onclick={openReportModal}
						class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
						Signaler ce produit
					</button>
				</div>
				{/if}
			</div>
		</div>
	</main>
</div>

<!-- Modal de signalement -->
{#if showReportModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/50"
			onclick={() => showReportModal = false}
			aria-label="Fermer"
		></button>

		<!-- Contenu -->
		<div class="relative bg-background rounded-lg border shadow-lg w-full max-w-md p-6">
			<div class="flex items-start justify-between mb-4">
				<div>
					<h2 class="text-lg font-semibold">Signaler ce produit</h2>
					<p class="text-sm text-muted-foreground mt-0.5">{data.product.name}</p>
				</div>
				<button
					onclick={() => showReportModal = false}
					class="text-muted-foreground hover:text-foreground ml-4"
					aria-label="Fermer"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
			</div>

			{#if reportSuccess}
				<div class="text-center py-6">
					<div class="text-green-600 mb-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
					</div>
					<p class="font-medium">Signalement envoyé</p>
					<p class="text-sm text-muted-foreground mt-1">Merci, nous examinerons votre signalement.</p>
					<button
						onclick={() => showReportModal = false}
						class="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
					>
						Fermer
					</button>
				</div>
			{:else}
				<div class="space-y-4">
					<div>
						<label for="report-email" class="block text-sm font-medium mb-1">Votre email</label>
						<input
							id="report-email"
							type="email"
							bind:value={reportEmail}
							placeholder="votre@email.com"
							class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
					<div>
						<label for="report-reason" class="block text-sm font-medium mb-1">Motif du signalement</label>
						<textarea
							id="report-reason"
							bind:value={reportReason}
							placeholder="Décrivez le problème avec ce produit..."
							rows="4"
							class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
						></textarea>
					</div>

					{#if reportError}
						<p class="text-sm text-red-500">{reportError}</p>
					{/if}

					<div class="flex gap-3 pt-1">
						<button
							onclick={() => showReportModal = false}
							class="flex-1 px-4 py-2 rounded-md border border-input text-sm font-medium hover:bg-accent transition-colors"
						>
							Annuler
						</button>
						<button
							onclick={submitReport}
							disabled={reportLoading}
							class="flex-1 px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
						>
							{reportLoading ? 'Envoi...' : 'Envoyer le signalement'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

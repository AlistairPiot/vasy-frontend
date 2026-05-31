<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { cart } from '$lib/stores/cart';
	import { favorites } from '$lib/stores/favorites';
	import WoodBackground from '$lib/components/WoodBackground.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let selectedImage = $state(0);
	let images = $state<string[]>([]);
	let mainImageRef: HTMLButtonElement | undefined = $state();
	let showAddedNotification = $state(false);
	let notificationTimeout: ReturnType<typeof setTimeout>;

	const isFavorite = $derived(favorites.isFavorite(data.product.id, $favorites));
	const cartItem = $derived($cart.items.find((i) => i.id === data.product.id));
	const isMaxInCart = $derived(!!cartItem && cartItem.quantity >= data.product.stock);

	// Lightbox
	let lightboxOpen = $state(false);
	let lightboxContainer: HTMLDivElement | undefined = $state();
	let lightboxImg: HTMLImageElement | undefined = $state();

	$effect(() => {
		if (lightboxOpen && lightboxContainer && lightboxImg) {
			document.body.style.overflow = 'hidden';
			gsap.fromTo(lightboxContainer, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
			gsap.fromTo(lightboxImg, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out' });
		} else if (!lightboxOpen) {
			document.body.style.overflow = '';
		}
	});

	function openLightbox() {
		lightboxOpen = true;
	}

	function closeLightbox() {
		if (!lightboxContainer || !lightboxImg) { lightboxOpen = false; return; }
		gsap.to(lightboxImg, { scale: 0.88, opacity: 0, duration: 0.2, ease: 'power2.in' });
		gsap.to(lightboxContainer, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => { lightboxOpen = false; } });
	}

	function lightboxPrev(e: MouseEvent) {
		e.stopPropagation();
		selectedImage = (selectedImage - 1 + images.length) % images.length;
	}

	function lightboxNext(e: MouseEvent) {
		e.stopPropagation();
		selectedImage = (selectedImage + 1) % images.length;
	}

	function handleLightboxKey(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowRight' && images.length > 1) selectedImage = (selectedImage + 1) % images.length;
		if (e.key === 'ArrowLeft' && images.length > 1) selectedImage = (selectedImage - 1 + images.length) % images.length;
	}

	// Report modal
	let showReportModal = $state(false);
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

	function flyToCart(onArrive: () => void) {
		const cartIconEl = Array.from(document.querySelectorAll('[data-cart-icon]'))
			.find((el) => (el as HTMLElement).getBoundingClientRect().width > 0) as HTMLElement | undefined;

		if (!cartIconEl || !images[selectedImage]) {
			onArrive();
			return;
		}

		const srcEl = mainImageRef;
		const srcRect = srcEl
			? srcEl.getBoundingClientRect()
			: { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
		const dstRect = cartIconEl.getBoundingClientRect();

		const size = Math.min(Math.max(srcRect.width * 0.4, 48), 72);
		const startLeft = srcRect.left + srcRect.width / 2 - size / 2;
		const startTop = srcRect.top + srcRect.height / 2 - size / 2;

		const fly = document.createElement('div');
		Object.assign(fly.style, {
			position: 'fixed',
			left: `${startLeft}px`,
			top: `${startTop}px`,
			width: `${size}px`,
			height: `${size}px`,
			borderRadius: '50%',
			overflow: 'hidden',
			zIndex: '9999',
			pointerEvents: 'none',
			boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
		});
		const img = document.createElement('img');
		img.src = images[selectedImage];
		img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
		fly.appendChild(img);
		document.body.appendChild(fly);

		const destX = dstRect.left + dstRect.width / 2 - startLeft - size / 2;
		const destY = dstRect.top + dstRect.height / 2 - startTop - size / 2;

		const tl = gsap.timeline({
			onComplete: () => {
				fly.remove();
				onArrive();
				gsap.fromTo(cartIconEl,
					{ scale: 1.5 },
					{ scale: 1, duration: 0.4, ease: 'back.out(2.5)' }
				);
			}
		});
		tl.to(fly, { x: destX, duration: 0.65, ease: 'power2.inOut' }, 0);
		tl.to(fly, { y: destY, duration: 0.65, ease: 'power3.in' }, 0);
		tl.to(fly, { scale: 0.15, opacity: 0.7, duration: 0.65, ease: 'power3.in' }, 0);
	}

	function addToCart() {
		if (!data.user) {
			window.location.href = '/login';
			return;
		}

		if (data.product.stock <= 0) return;

		flyToCart(() => {
			cart.addItem({
				id: data.product.id,
				name: data.product.name,
				price: data.product.price,
				quantity: 1,
				image_url: images[0] || '',
				creator_id: data.product.creator_id,
				stock: data.product.stock,
				expires_at: ''
			});
		});

		showAddedNotification = true;
		if (notificationTimeout) clearTimeout(notificationTimeout);
		notificationTimeout = setTimeout(() => {
			showAddedNotification = false;
		}, 2000);

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
		reportReason = '';
		reportSuccess = false;
		reportError = '';
		showReportModal = true;
	}

	async function submitReport() {
		if (!reportReason.trim()) {
			reportError = 'Veuillez indiquer le motif du signalement.';
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
					reporter_email: data.user?.email ?? '',
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

<svelte:window onkeydown={handleLightboxKey} />

<div class="relative min-h-screen bg-background" bind:this={containerRef}>
	<WoodBackground />
	<div class="relative" style="z-index: 2;">
	<Header user={data.user} />

	<main class="container mx-auto px-4 md:px-6 py-6 md:py-8">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Produits', href: '/products' },
			{ label: data.product.name }
		]} />

		<a href="/products" class="animate-in group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
			Retour aux créations
		</a>

		<div class="grid md:grid-cols-2 gap-6 md:gap-12 py-6 md:py-10">
			<!-- Images -->
			<div class="animate-in">
				{#if images.length > 0}
					<button
						bind:this={mainImageRef}
						onclick={openLightbox}
						class="block w-full rounded-xl overflow-hidden bg-muted mb-3 aspect-square cursor-zoom-in group"
						aria-label="Agrandir l'image"
					>
						<img
							src={images[selectedImage]}
							alt={data.product.name}
							class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					</button>
					{#if images.length > 1}
						<div class="grid grid-cols-5 gap-1 md:gap-2">
							{#each images as image, i}
								<button
									onclick={() => (selectedImage = i)}
									class="aspect-square rounded-lg overflow-hidden border-2 transition-colors {selectedImage === i ? 'border-primary' : 'border-transparent hover:border-border'}"
								>
									<img src={image} alt="" class="w-full h-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				{:else}
					<div class="aspect-square rounded-xl bg-muted flex items-center justify-center">
						<span class="text-muted-foreground text-sm">Pas d'image</span>
					</div>
				{/if}
			</div>

			<!-- Infos -->
			<div class="animate-in flex flex-col">
				{#if data.creator}
					<a href="/creators/{data.creator.id}" class="inline-flex items-center gap-2 mb-5 group w-fit">
						{#if data.creator.profile_image_url}
							<img src={data.creator.profile_image_url} alt={data.creator.display_name} class="w-8 h-8 rounded-full object-cover" />
						{:else}
							<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
								{data.creator.display_name.charAt(0).toUpperCase()}
							</div>
						{/if}
						<span class="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{data.creator.display_name}</span>
					</a>
				{/if}

				<h1 class="text-3xl md:text-4xl text-foreground mb-3 leading-tight">{data.product.name}</h1>

				<p class="text-3xl font-semibold text-primary mb-6">{formatPrice(data.product.price)}</p>

				{#if data.product.description}
					<div class="max-h-48 overflow-y-auto mb-6 pr-1" data-lenis-prevent>
						<p class="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{data.product.description}</p>
					</div>
				{/if}

				<!-- Stock -->
				<div class="flex items-center gap-2 mb-6 py-3 border-y border-border/50">
					{#if data.product.stock > 0}
						<span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
						<span class="text-sm text-foreground/70">En stock — {data.product.stock} disponible{data.product.stock > 1 ? 's' : ''}</span>
					{:else}
						<span class="w-2 h-2 rounded-full bg-muted-foreground shrink-0"></span>
						<span class="text-sm text-muted-foreground">Épuisé</span>
					{/if}
				</div>

				{#if showAddedNotification}
					<div class="notification bg-primary/10 text-primary text-sm p-3 rounded-lg mb-4 border border-primary/20">
						Produit ajouté au panier !
					</div>
				{/if}

				{#if !data.user || data.user.role === 'client'}
					<div class="flex gap-3 mb-4">
						<button
							onclick={addToCart}
							disabled={data.product.stock === 0 || isMaxInCart}
							class="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed h-11 px-6 rounded-lg font-medium transition-colors text-sm"
						>
							{#if data.product.stock === 0}
								Épuisé
							{:else if isMaxInCart}
								Quantité max atteinte
							{:else}
								Ajouter au panier
							{/if}
						</button>
						{#if data.user}
							<button
								onclick={toggleFavorite}
								class="px-4 h-11 rounded-lg border transition-colors {isFavorite ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-background hover:bg-secondary text-muted-foreground'}"
								aria-label="{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="{isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
								</svg>
							</button>
						{/if}
					</div>

					{#if data.user}
						<a href="/cart" class="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
							Voir le panier
						</a>
					{/if}
				{/if}

				<div class="mt-auto pt-6 border-t border-border/40 flex items-center justify-between">
					<ShareButton title={data.product.name} text={data.product.description ?? ''} />
					{#if data.user}
						<button onclick={openReportModal} class="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
							Signaler
						</button>
					{/if}
				</div>
			</div>
		</div>
	</main>
	</div>
</div>

<!-- Lightbox -->
{#if lightboxOpen}
	<div
		bind:this={lightboxContainer}
		class="fixed inset-0 z-200 flex items-center justify-center bg-black/92 backdrop-blur-sm"
		onclick={closeLightbox}
		role="dialog"
		aria-modal="true"
		aria-label="Galerie"
	>
		<!-- Fermer -->
		<button
			onclick={closeLightbox}
			class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
			aria-label="Fermer"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
				<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
			</svg>
		</button>

		<!-- Flèche gauche -->
		{#if images.length > 1}
			<button
				onclick={lightboxPrev}
				class="absolute left-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
				aria-label="Image précédente"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
					<path d="M15 18l-6-6 6-6"/>
				</svg>
			</button>
		{/if}

		<!-- Image -->
		<img
			bind:this={lightboxImg}
			src={images[selectedImage]}
			alt={data.product.name}
			class="max-w-[90vw] max-h-[88vh] object-contain rounded-lg select-none"
			onclick={(e) => e.stopPropagation()}
			draggable="false"
		/>

		<!-- Flèche droite -->
		{#if images.length > 1}
			<button
				onclick={lightboxNext}
				class="absolute right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
				aria-label="Image suivante"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
					<path d="M9 18l6-6-6-6"/>
				</svg>
			</button>
		{/if}

		<!-- Indicateurs -->
		{#if images.length > 1}
			<div class="absolute bottom-5 flex gap-2 items-center">
				{#each images as _, i}
					<button
						onclick={(e) => { e.stopPropagation(); selectedImage = i; }}
						class="rounded-full transition-all duration-200 {selectedImage === i ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}"
						aria-label="Image {i + 1}"
					></button>
				{/each}
			</div>
		{/if}
	</div>
{/if}

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

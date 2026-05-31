<script lang="ts">
	import { gsap } from 'gsap';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { tilt } from '$lib/actions/tilt';
	import WoodBackground from '$lib/components/WoodBackground.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { CATEGORIES, MATERIALS, STYLES, TECHNIQUES } from '$lib/productFilters';
	import Select from '$lib/components/ui/Select.svelte';

	const sortOptions = [
		{ value: 'default',    label: 'Par défaut',      icon: '↕' },
		{ value: 'price_asc',  label: 'Prix croissant',  icon: '↑' },
		{ value: 'price_desc', label: 'Prix décroissant', icon: '↓' },
	] as const;

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let filtersOpen = $state(false);
	let sortOpen = $state(false);
	let sortDropdownEl: HTMLDivElement;
	let sortContainerEl: HTMLDivElement;
	let isLoading = $state(false);

	// Listener actif uniquement quand le dropdown est ouvert
	$effect(() => {
		if (!sortOpen) return;
		function handle(e: MouseEvent) {
			if (!sortContainerEl.contains(e.target as Node)) sortOpen = false;
		}
		document.addEventListener('click', handle, true);
		return () => document.removeEventListener('click', handle, true);
	});

	$effect(() => {
		if (sortOpen && sortDropdownEl) {
			gsap.fromTo(sortDropdownEl,
				{ opacity: 0, y: -6, scale: 0.97 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.18, ease: 'power2.out' }
			);
		}
	});

	// Filtres appliqués (depuis l'URL — ce que le serveur a rendu)
	const activeCategory   = $derived(page.url.searchParams.get('category') ?? '');
	const activeMaterial   = $derived(page.url.searchParams.get('material') ?? '');
	const activeStyles     = $derived(page.url.searchParams.getAll('style'));
	const activeTechniques = $derived(page.url.searchParams.getAll('technique'));
	const activePriceMin   = $derived(page.url.searchParams.get('price_min') ?? '');
	const activePriceMax   = $derived(page.url.searchParams.get('price_max') ?? '');
	const activeSort       = $derived(page.url.searchParams.get('sort') ?? 'default');

	// État local du panneau (pas encore validé)
	let draftCategory  = $state('');
	let draftMaterial  = $state('');
	let draftStyles    = $state<string[]>([]);
	let draftTechniques = $state<string[]>([]);
	let draftPriceMin  = $state('');
	let draftPriceMax  = $state('');

	// Sync état local depuis l'URL quand le panneau s'ouvre
	$effect(() => {
		if (filtersOpen) {
			draftCategory   = activeCategory;
			draftMaterial   = activeMaterial;
			draftStyles     = [...activeStyles];
			draftTechniques = [...activeTechniques];
			draftPriceMin   = activePriceMin ? String(Math.round(parseInt(activePriceMin) / 100)) : '';
			draftPriceMax   = activePriceMax ? String(Math.round(parseInt(activePriceMax) / 100)) : '';
		}
	});

	const activeFiltersCount = $derived(
		[activeCategory, activeMaterial, activePriceMin, activePriceMax].filter(Boolean).length
		+ activeStyles.length + activeTechniques.length
	);

	const draftFiltersCount = $derived(
		[draftCategory, draftMaterial, draftPriceMin, draftPriceMax].filter(Boolean).length
		+ draftStyles.length + draftTechniques.length
	);

	function toggleDraftStyle(s: string) {
		draftStyles = draftStyles.includes(s)
			? draftStyles.filter(v => v !== s)
			: [...draftStyles, s];
	}

	function toggleDraftTechnique(t: string) {
		draftTechniques = draftTechniques.includes(t)
			? draftTechniques.filter(v => v !== t)
			: [...draftTechniques, t];
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (activeSort !== 'default') params.set('sort', activeSort);
		if (draftCategory) params.set('category', draftCategory);
		if (draftMaterial) params.set('material', draftMaterial);
		draftStyles.forEach(s => params.append('style', s));
		draftTechniques.forEach(t => params.append('technique', t));
		if (draftPriceMin) params.set('price_min', String(parseInt(draftPriceMin) * 100));
		if (draftPriceMax) params.set('price_max', String(parseInt(draftPriceMax) * 100));
		isLoading = true;
		goto(`/products?${params.toString()}`, { replaceState: false }).then(() => {
			isLoading = false;
			filtersOpen = false;
		});
	}

	// Suppression rapide d'un filtre actif depuis les chips (sans ouvrir le panneau)
	function removeActiveFilter(key: string, value?: string) {
		const params = new URLSearchParams(page.url.searchParams);
		if (value) {
			const current = params.getAll(key).filter(v => v !== value);
			params.delete(key);
			current.forEach(v => params.append(key, v));
		} else {
			params.delete(key);
		}
		isLoading = true;
		goto(`/products?${params.toString()}`, { replaceState: false }).then(() => { isLoading = false; });
	}

	function removePriceFilter() {
		const params = new URLSearchParams(page.url.searchParams);
		params.delete('price_min');
		params.delete('price_max');
		isLoading = true;
		goto(`/products?${params.toString()}`, { replaceState: false }).then(() => { isLoading = false; });
	}

	function resetFilters() {
		const params = new URLSearchParams();
		if (activeSort !== 'default') params.set('sort', activeSort);
		isLoading = true;
		goto(`/products${params.toString() ? '?' + params.toString() : ''}`, { replaceState: false }).then(() => {
			isLoading = false;
			filtersOpen = false;
		});
	}

	function applySort(value: string) {
		const params = new URLSearchParams(page.url.searchParams);
		if (value === 'default') params.delete('sort');
		else params.set('sort', value);
		isLoading = true;
		goto(`/products?${params.toString()}`, { replaceState: false }).then(() => { isLoading = false; });
	}

	$effect(() => {
		void data.products.length;
		if (isLoading || !containerRef) return;
		setTimeout(() => {
			const elements = containerRef.querySelectorAll('.product-card');
			gsap.fromTo(elements,
				{ y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
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

<div class="min-h-screen bg-background relative" bind:this={containerRef}>
	<WoodBackground />
	<div class="relative" style="z-index: 2;">
		<Header user={data.user} />

		<main class="container mx-auto px-4 md:px-6 py-8">
			<Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Produits' }]} />

			<div class="flex flex-col sm:flex-row justify-between items-end gap-4 pt-10 mb-6">
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

				<div class="animate-in flex items-center gap-3 shrink-0">
					<!-- Bouton filtres -->
					{#if !data.searchQuery}
						<button
							onclick={() => filtersOpen = !filtersOpen}
							class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors text-sm {filtersOpen || activeFiltersCount > 0 ? 'border-primary bg-primary/10 text-primary' : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground'}"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
							</svg>
							Filtres
							{#if activeFiltersCount > 0}
								<span class="bg-primary text-primary-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
									{activeFiltersCount}
								</span>
							{/if}
						</button>
					{/if}

					<!-- Tri -->
					<div class="relative" bind:this={sortContainerEl}>
						<button
							onclick={() => (sortOpen = !sortOpen)}
							class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors text-sm select-none
								{sortOpen || activeSort !== 'default'
									? 'border-primary bg-primary/10 text-primary'
									: 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground'}"
						>
							<span class="text-xs">{sortOptions.find(o => o.value === activeSort)?.icon}</span>
							{sortOptions.find(o => o.value === activeSort)?.label}
							<svg
								class="w-3 h-3 transition-transform duration-200 {sortOpen ? 'rotate-180' : ''}"
								fill="none" stroke="currentColor" viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{#if sortOpen}
							<div
								bind:this={sortDropdownEl}
								class="absolute right-0 top-[calc(100%+6px)] w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-30 origin-top-right"
							>
								{#each sortOptions as option}
									<button
										onclick={() => { applySort(option.value); sortOpen = false; }}
										class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
											{activeSort === option.value
												? 'bg-primary/10 text-primary font-medium'
												: 'text-foreground hover:bg-accent'}"
									>
										<span class="w-4 text-center opacity-60 text-xs">{option.icon}</span>
										<span class="flex-1">{option.label}</span>
										{#if activeSort === option.value}
											<svg class="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
											</svg>
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Panneau de filtres -->
			{#if filtersOpen && !data.searchQuery}
				<div class="mb-6 p-4 md:p-5 bg-card border border-border rounded-xl animate-in">
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
						<!-- Catégorie -->
						<div>
							<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Catégorie</p>
							<Select
								bind:value={draftCategory}
								placeholder="Toutes"
								options={CATEGORIES.map(c => ({ value: c, label: c }))}
							/>
						</div>

						<!-- Matière -->
						<div>
							<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Matière</p>
							<Select
								bind:value={draftMaterial}
								placeholder="Toutes"
								options={MATERIALS.map(m => ({ value: m, label: m }))}
							/>
						</div>

						<!-- Style -->
						<div>
							<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Style</p>
							<div class="flex flex-wrap gap-1.5">
								{#each STYLES as s}
									<button
										type="button"
										onclick={() => toggleDraftStyle(s)}
										class="px-2.5 py-1 rounded-full text-xs border transition-colors {draftStyles.includes(s) ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-input bg-background text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary'}"
									>{s}</button>
								{/each}
							</div>
						</div>

						<!-- Technique -->
						<div>
							<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Technique</p>
							<div class="flex flex-wrap gap-1.5">
								{#each TECHNIQUES as t}
									<button
										type="button"
										onclick={() => toggleDraftTechnique(t)}
										class="px-2.5 py-1 rounded-full text-xs border transition-colors {draftTechniques.includes(t) ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-input bg-background text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary'}"
									>{t}</button>
								{/each}
							</div>
						</div>
					</div>

					<!-- Fourchette de prix -->
					<div class="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-3">
						<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prix (€)</p>
						<div class="flex items-center gap-2">
							<input
								type="number"
								placeholder="Min"
								min="0"
								bind:value={draftPriceMin}
								class="w-20 px-2 py-1.5 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring"
							/>
							<span class="text-muted-foreground text-sm">—</span>
							<input
								type="number"
								placeholder="Max"
								min="0"
								bind:value={draftPriceMax}
								class="w-20 px-2 py-1.5 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring"
							/>
						</div>

						<div class="ml-auto flex items-center gap-3">
							{#if draftFiltersCount > 0}
								<button
									onclick={() => { draftCategory = ''; draftMaterial = ''; draftStyles = []; draftTechniques = []; draftPriceMin = ''; draftPriceMax = ''; }}
									class="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
								>
									Effacer
								</button>
							{/if}
							<button
								onclick={applyFilters}
								class="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
							>
								Appliquer{draftFiltersCount > 0 ? ` (${draftFiltersCount})` : ''}
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- Chips filtres actifs (hors panneau ouvert) -->
			{#if activeFiltersCount > 0 && !filtersOpen}
				<div class="flex flex-wrap gap-2 mb-5">
					{#if activeCategory}
						<span class="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/30">
							{activeCategory}
							<button onclick={() => removeActiveFilter('category')} class="w-4 h-4 flex items-center justify-center rounded-full bg-primary/15 hover:bg-primary/35 transition-colors text-primary leading-none">×</button>
						</span>
					{/if}
					{#if activeMaterial}
						<span class="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/30">
							{activeMaterial}
							<button onclick={() => removeActiveFilter('material')} class="w-4 h-4 flex items-center justify-center rounded-full bg-primary/15 hover:bg-primary/35 transition-colors text-primary leading-none">×</button>
						</span>
					{/if}
					{#each activeStyles as s}
						<span class="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/30">
							{s}
							<button onclick={() => removeActiveFilter('style', s)} class="w-4 h-4 flex items-center justify-center rounded-full bg-primary/15 hover:bg-primary/35 transition-colors text-primary leading-none">×</button>
						</span>
					{/each}
					{#each activeTechniques as t}
						<span class="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/30">
							{t}
							<button onclick={() => removeActiveFilter('technique', t)} class="w-4 h-4 flex items-center justify-center rounded-full bg-primary/15 hover:bg-primary/35 transition-colors text-primary leading-none">×</button>
						</span>
					{/each}
					{#if activePriceMin || activePriceMax}
						<span class="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/30">
							{activePriceMin ? Math.round(parseInt(activePriceMin) / 100) + ' €' : '0 €'} — {activePriceMax ? Math.round(parseInt(activePriceMax) / 100) + ' €' : '∞'}
							<button onclick={removePriceFilter} class="w-4 h-4 flex items-center justify-center rounded-full bg-primary/15 hover:bg-primary/35 transition-colors text-primary leading-none">×</button>
						</span>
					{/if}
					<button onclick={resetFilters} class="self-center text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
						Tout effacer
					</button>
				</div>
			{/if}

			{#if isLoading}
				<div class="columns-2 md:columns-3 xl:columns-4 gap-2 md:gap-4">
					{#each [180, 220, 160, 240, 200, 170, 230, 190] as h}
						<div class="break-inside-avoid mb-4 rounded-lg overflow-hidden border border-border/40 bg-card">
							<Skeleton class="w-full rounded-none" style="height: {h}px;" />
							<div class="p-3 space-y-2">
								<Skeleton class="h-4 w-3/4" />
								<Skeleton class="h-3 w-1/2" />
								<Skeleton class="h-4 w-1/4 mt-1" />
							</div>
						</div>
					{/each}
				</div>
			{:else if data.products.length === 0}
				<div class="animate-in">
					{#if data.searchQuery}
						<EmptyState
							variant="search"
							title='Aucun résultat pour "{data.searchQuery}"'
							description="Essayez avec d'autres mots-clés."
						/>
					{:else}
						<EmptyState
							variant="products"
							title="Aucune création pour ces critères"
							description="Essayez d'élargir vos filtres."
							ctas={[{ label: 'Voir toutes les créations', href: '/products' }]}
						/>
					{/if}
				</div>
			{:else}
				<div class="columns-2 md:columns-3 xl:columns-4 gap-2 md:gap-4">
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
									{#if product.category}
										<p class="text-xs text-muted-foreground mt-0.5">{product.category}</p>
									{/if}
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
</div>

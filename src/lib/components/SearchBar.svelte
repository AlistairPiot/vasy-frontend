<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { goto } from '$app/navigation';
	import { PUBLIC_API_URL } from '$env/static/public';

	interface SearchResult {
		id: string;
		name: string;
		description: string | null;
		price: number;
		image_url: string | null;
		creator_name: string;
		creator_id: string;
		stock: number;
	}

	interface Suggestion {
		id: string;
		name: string;
		price: number;
		image_url: string | null;
		creator_name: string;
	}

	let searchQuery = $state('');
	let isOpen = $state(false);
	let isLoading = $state(false);
	let results = $state<SearchResult[]>([]);
	let suggestions = $state<Suggestion[]>([]);
	let selectedIndex = $state(-1);
	let hoveredResult = $state<SearchResult | null>(null);
	let showPreview = $state(false);

	let searchContainer: HTMLDivElement | undefined = $state();
	let resultsContainer: HTMLDivElement | undefined = $state();
	let previewContainer: HTMLDivElement | undefined = $state();
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Charger les suggestions populaires au montage
	onMount(async () => {
		await loadSuggestions();

		// Gestion du clic en dehors (seulement côté client)
		if (typeof window !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			document.removeEventListener('click', handleClickOutside);
		}
		if (debounceTimer) clearTimeout(debounceTimer);
	});

	function handleClickOutside(event: MouseEvent) {
		if (searchContainer && !searchContainer.contains(event.target as Node)) {
			closeSearch();
		}
	}

	async function loadSuggestions() {
		try {
			const response = await fetch(`${PUBLIC_API_URL}/search/suggestions?limit=5`);
			const data = await response.json();
			suggestions = data.suggestions || [];
		} catch (error) {
			console.error('Erreur lors du chargement des suggestions:', error);
		}
	}

	function handleInput() {
		// Debounce de 250ms
		if (debounceTimer) clearTimeout(debounceTimer);

		const query = searchQuery.trim();

		// Si le champ est vide, afficher les suggestions
		if (!query) {
			results = [];
			selectedIndex = -1;
			isOpen = true;
			return;
		}

		isLoading = true;
		isOpen = true;

		debounceTimer = setTimeout(async () => {
			await performSearch(query);
		}, 250);
	}

	async function performSearch(query: string) {
		try {
			const response = await fetch(`${PUBLIC_API_URL}/search?q=${encodeURIComponent(query)}&limit=8`);
			const data = await response.json();
			results = data.results || [];
			selectedIndex = -1;

			// Animer l'apparition des résultats
			if (resultsContainer) {
				animateResults();
			}
		} catch (error) {
			console.error('Erreur lors de la recherche:', error);
			results = [];
		} finally {
			isLoading = false;
		}
	}

	function animateResults() {
		// Animation GSAP pour l'apparition des résultats
		const items = resultsContainer.querySelectorAll('.search-result-item');
		gsap.fromTo(
			items,
			{
				opacity: 0,
				y: -10,
			},
			{
				opacity: 1,
				y: 0,
				duration: 0.3,
				stagger: 0.05,
				ease: 'power2.out',
			}
		);
	}

	function handleKeydown(event: KeyboardEvent) {
		const itemCount = searchQuery.trim() ? results.length : suggestions.length;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % itemCount;
			scrollToSelected();
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = selectedIndex <= 0 ? itemCount - 1 : selectedIndex - 1;
			scrollToSelected();
		} else if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault();
			const item = searchQuery.trim() ? results[selectedIndex] : suggestions[selectedIndex];
			if (item) {
				navigateToProduct(item.id);
			}
		} else if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
		}
	}

	function scrollToSelected() {
		if (!resultsContainer) return;
		const items = resultsContainer.querySelectorAll('.search-result-item');
		const selectedItem = items[selectedIndex] as HTMLElement;
		if (selectedItem) {
			selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}

	function handleMouseEnter(result: SearchResult) {
		hoveredResult = result;
		showPreview = true;

		// Animer l'apparition de la preview
		if (previewContainer) {
			gsap.fromTo(
				previewContainer,
				{
					opacity: 0,
					scale: 0.95,
				},
				{
					opacity: 1,
					scale: 1,
					duration: 0.2,
					ease: 'power2.out',
				}
			);
		}
	}

	function handleMouseLeave() {
		showPreview = false;
		hoveredResult = null;
	}

	function navigateToProduct(id: string) {
		goto(`/products/${id}`);
		closeSearch();
	}

	function viewAllResults() {
		goto(`/products?q=${encodeURIComponent(searchQuery)}`);
		closeSearch();
	}

	function closeSearch() {
		isOpen = false;
		searchQuery = '';
		results = [];
		selectedIndex = -1;
		hoveredResult = null;
		showPreview = false;
	}

	function formatPrice(price: number): string {
		return `${(price / 100).toFixed(2)} €`;
	}

	function highlightText(text: string, query: string): string {
		if (!query.trim()) return text;
		const regex = new RegExp(`(${query})`, 'gi');
		return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
	}
</script>

<div bind:this={searchContainer} class="relative w-full max-w-2xl">
	<!-- Champ de recherche -->
	<div class="relative">
		<input
			type="text"
			bind:value={searchQuery}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={() => (isOpen = true)}
			placeholder="Rechercher des produits..."
			class="w-full px-4 py-3 pl-12 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
		/>
		<svg
			class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
		{#if isLoading}
			<div
				class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"
			></div>
		{/if}
	</div>

	<!-- Menu flottant des résultats -->
	{#if isOpen}
		<div
			bind:this={resultsContainer}
			class="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
		>
			{#if isLoading}
				<!-- Skeleton loader -->
				<div class="p-4 space-y-3">
					{#each Array(3) as _}
						<div class="flex items-center gap-3 animate-pulse">
							<div class="w-16 h-16 bg-gray-200 rounded"></div>
							<div class="flex-1">
								<div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
								<div class="h-3 bg-gray-200 rounded w-1/2"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if searchQuery.trim() && results.length > 0}
				<!-- Résultats de recherche -->
				{#each results as result, index}
					<button
						class="search-result-item w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0 {selectedIndex ===
						index
							? 'bg-gray-100'
							: ''}"
						onclick={() => navigateToProduct(result.id)}
						onmouseenter={() => handleMouseEnter(result)}
						onmouseleave={handleMouseLeave}
					>
						<img
							src={result.image_url || '/placeholder.png'}
							alt={result.name}
							class="w-16 h-16 object-cover rounded"
						/>
						<div class="flex-1 text-left">
							<h3 class="font-medium text-sm">
								{@html highlightText(result.name, searchQuery)}
							</h3>
							<p class="text-xs text-gray-500 mt-1">{result.creator_name}</p>
							<p class="text-sm font-semibold text-primary mt-1">
								{formatPrice(result.price)}
							</p>
						</div>
						{#if result.stock <= 0}
							<span class="text-xs text-red-600 font-medium">Rupture de stock</span>
						{/if}
					</button>
				{/each}

				<!-- Bouton voir tous les résultats -->
				<button
					onclick={viewAllResults}
					class="w-full p-4 text-center text-sm font-medium text-primary hover:bg-gray-50 transition-colors"
				>
					Voir tous les résultats ({results.length}+)
				</button>
			{:else if searchQuery.trim() && !isLoading}
				<!-- Aucun résultat -->
				<div class="p-8 text-center text-gray-500">
					<svg
						class="w-12 h-12 mx-auto mb-3 text-gray-300"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<p class="font-medium">Aucun résultat pour "{searchQuery}"</p>
					<p class="text-sm mt-2">Essayez avec d'autres mots-clés</p>
				</div>
			{:else if !searchQuery.trim() && suggestions.length > 0}
				<!-- Suggestions populaires -->
				<div class="p-4">
					<p class="text-xs font-medium text-gray-500 mb-3">SUGGESTIONS POPULAIRES</p>
					{#each suggestions as suggestion, index}
						<button
							class="search-result-item w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors rounded-lg {selectedIndex ===
							index
								? 'bg-gray-100'
								: ''}"
							onclick={() => navigateToProduct(suggestion.id)}
						>
							<img
								src={suggestion.image_url || '/placeholder.png'}
								alt={suggestion.name}
								class="w-12 h-12 object-cover rounded"
							/>
							<div class="flex-1 text-left">
								<h3 class="font-medium text-sm">{suggestion.name}</h3>
								<p class="text-xs text-gray-500">{suggestion.creator_name}</p>
							</div>
							<p class="text-sm font-semibold text-primary">
								{formatPrice(suggestion.price)}
							</p>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Preview enrichie (affichée à côté sur hover) -->
	{#if showPreview && hoveredResult}
		<div
			bind:this={previewContainer}
			class="fixed z-[60] bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-80"
			style="left: calc(100% + 1rem); top: 0;"
		>
			<img
				src={hoveredResult.image_url || '/placeholder.png'}
				alt={hoveredResult.name}
				class="w-full h-48 object-cover rounded-lg mb-4"
			/>
			<h3 class="font-bold text-lg mb-2">{hoveredResult.name}</h3>
			<p class="text-sm text-gray-600 mb-3 line-clamp-3">
				{hoveredResult.description || 'Pas de description disponible'}
			</p>
			<div class="flex items-center justify-between mb-4">
				<span class="text-2xl font-bold text-primary">
					{formatPrice(hoveredResult.price)}
				</span>
				<span class="text-sm text-gray-500">par {hoveredResult.creator_name}</span>
			</div>
			<button
				onclick={() => navigateToProduct(hoveredResult.id)}
				class="w-full py-2 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
			>
				Voir le produit
			</button>
		</div>
	{/if}
</div>

<style>
	:global(mark) {
		background-color: #fef08a;
		padding: 0 2px;
		border-radius: 2px;
	}
</style>

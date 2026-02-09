<script lang="ts">
	import { onMount } from 'svelte';

	interface AddressSuggestion {
		display_name: string;
		lat: string;
		lon: string;
		place_id: number;
	}

	let {
		value = $bindable(''),
		latitude = $bindable<number | null>(null),
		longitude = $bindable<number | null>(null),
		placeholder = 'Rechercher une adresse...',
		required = false,
		id = 'address',
		name = 'location_text',
		class: className = ''
	}: {
		value?: string;
		latitude?: number | null;
		longitude?: number | null;
		placeholder?: string;
		required?: boolean;
		id?: string;
		name?: string;
		class?: string;
	} = $props();

	let inputValue = $state(value);
	let suggestions = $state<AddressSuggestion[]>([]);
	let isLoading = $state(false);
	let showDropdown = $state(false);
	let selectedIndex = $state(-1);
	let isAddressSelected = $state(!!value && !!latitude && !!longitude);
	let inputRef: HTMLInputElement;
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Sync inputValue with value prop
	$effect(() => {
		if (value !== inputValue && isAddressSelected) {
			inputValue = value;
		}
	});

	async function searchAddress(query: string) {
		if (query.length < 3) {
			suggestions = [];
			return;
		}

		isLoading = true;

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?` +
					new URLSearchParams({
						q: query,
						format: 'json',
						limit: '5',
						countrycodes: 'fr',
						addressdetails: '1'
					}),
				{
					headers: {
						'Accept-Language': 'fr'
					}
				}
			);

			if (response.ok) {
				suggestions = await response.json();
				showDropdown = suggestions.length > 0;
				selectedIndex = -1;
			}
		} catch (error) {
			console.error('Erreur de recherche:', error);
			suggestions = [];
		} finally {
			isLoading = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inputValue = target.value;

		// Reset selection when typing
		isAddressSelected = false;
		latitude = null;
		longitude = null;
		value = '';

		// Debounce search
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchAddress(inputValue);
		}, 300);
	}

	function selectAddress(suggestion: AddressSuggestion) {
		inputValue = suggestion.display_name;
		value = suggestion.display_name;
		latitude = parseFloat(suggestion.lat);
		longitude = parseFloat(suggestion.lon);
		isAddressSelected = true;
		showDropdown = false;
		suggestions = [];
		selectedIndex = -1;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!showDropdown || suggestions.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
					selectAddress(suggestions[selectedIndex]);
				}
				break;
			case 'Escape':
				showDropdown = false;
				selectedIndex = -1;
				break;
		}
	}

	function handleBlur() {
		// Delay to allow click on suggestion
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

	function handleFocus() {
		if (suggestions.length > 0 && !isAddressSelected) {
			showDropdown = true;
		}
	}

	function clearSelection() {
		inputValue = '';
		value = '';
		latitude = null;
		longitude = null;
		isAddressSelected = false;
		suggestions = [];
		inputRef?.focus();
	}
</script>

<div class="relative {className}">
	<div class="relative">
		<input
			bind:this={inputRef}
			type="text"
			{id}
			{name}
			{required}
			{placeholder}
			value={inputValue}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onblur={handleBlur}
			onfocus={handleFocus}
			autocomplete="off"
			class="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary
				{!isAddressSelected && inputValue.length > 0 ? 'border-orange-300 bg-orange-50' : ''}
				{isAddressSelected ? 'border-green-300 bg-green-50' : ''}"
		/>

		<!-- Indicateur de statut -->
		<div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
			{#if isLoading}
				<div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin">
				</div>
			{:else if isAddressSelected}
				<button
					type="button"
					onclick={clearSelection}
					class="text-gray-400 hover:text-gray-600 p-1"
					title="Effacer"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
				<span class="text-green-600" title="Adresse validée">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</span>
			{:else if inputValue.length > 0}
				<span class="text-orange-500" title="Sélectionnez une adresse dans la liste">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</span>
			{/if}
		</div>
	</div>

	<!-- Message d'aide -->
	{#if !isAddressSelected && inputValue.length > 0 && !showDropdown && !isLoading}
		<p class="text-xs text-orange-600 mt-1">Sélectionnez une adresse dans la liste de suggestions</p>
	{/if}

	<!-- Dropdown de suggestions -->
	{#if showDropdown && suggestions.length > 0}
		<ul
			class="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
		>
			{#each suggestions as suggestion, index}
				<li>
					<button
						type="button"
						class="w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors
							{index === selectedIndex ? 'bg-primary/10' : ''}"
						onmousedown={() => selectAddress(suggestion)}
					>
						<div class="flex items-start gap-2">
							<span class="text-primary mt-0.5 shrink-0">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</span>
							<span class="line-clamp-2">{suggestion.display_name}</span>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<!-- Champs cachés pour les coordonnées -->
	<input type="hidden" name="latitude" value={latitude ?? ''} />
	<input type="hidden" name="longitude" value={longitude ?? ''} />
</div>

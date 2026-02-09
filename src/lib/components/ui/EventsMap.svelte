<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map, Marker } from 'leaflet';

	interface Event {
		id: string;
		name: string;
		date: string;
		location_text: string;
		latitude: number | null;
		longitude: number | null;
		status: string;
	}

	let {
		events = [],
		selectedEventId = $bindable<string | null>(null),
		onEventSelect = (id: string) => {},
		class: className = ''
	}: {
		events: Event[];
		selectedEventId?: string | null;
		onEventSelect?: (id: string) => void;
		class?: string;
	} = $props();

	let mapContainer: HTMLDivElement;
	let map: Map | null = null;
	let markers: Marker[] = [];
	let L: typeof import('leaflet') | null = null;

	// Position par défaut (France)
	const DEFAULT_CENTER: [number, number] = [46.603354, 1.888334];
	const DEFAULT_ZOOM = 6;

	onMount(async () => {
		// Import dynamique de Leaflet (côté client uniquement)
		L = await import('leaflet');

		// Créer la carte
		map = L.map(mapContainer).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

		// Ajouter les tuiles OpenStreetMap
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		// Ajouter les marqueurs
		updateMarkers();
	});

	onDestroy(() => {
		if (map) {
			map.remove();
			map = null;
		}
	});

	function updateMarkers() {
		if (!map || !L) return;

		// Supprimer les anciens marqueurs
		markers.forEach((marker) => marker.remove());
		markers = [];

		// Filtrer les événements avec coordonnées
		const eventsWithCoords = events.filter(
			(e) => e.latitude !== null && e.longitude !== null && e.status !== 'deleted'
		);

		if (eventsWithCoords.length === 0) {
			// Pas de coordonnées, afficher un message sur la carte
			return;
		}

		// Créer l'icône personnalisée
		const createIcon = (isSelected: boolean, isActive: boolean) => {
			const color = isSelected ? '#7c3aed' : isActive ? '#22c55e' : '#6b7280';
			return L!.divIcon({
				className: 'custom-marker',
				html: `
					<div style="
						background-color: ${color};
						width: ${isSelected ? '32px' : '24px'};
						height: ${isSelected ? '32px' : '24px'};
						border-radius: 50%;
						border: 3px solid white;
						box-shadow: 0 2px 6px rgba(0,0,0,0.3);
						display: flex;
						align-items: center;
						justify-content: center;
						transition: all 0.2s;
					"></div>
				`,
				iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
				iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12]
			});
		};

		// Ajouter les marqueurs
		eventsWithCoords.forEach((event) => {
			const isSelected = event.id === selectedEventId;
			const isActive = event.status === 'active';
			const marker = L!.marker([event.latitude!, event.longitude!], {
				icon: createIcon(isSelected, isActive)
			}).addTo(map!);

			// Popup avec infos
			const popupContent = `
				<div style="min-width: 150px;">
					<strong>${event.name}</strong>
					<p style="margin: 4px 0; font-size: 12px; color: #666;">
						${event.location_text}
					</p>
					<p style="margin: 0; font-size: 11px; color: #888;">
						${new Date(event.date).toLocaleDateString('fr-FR', {
							day: 'numeric',
							month: 'short',
							year: 'numeric'
						})}
					</p>
				</div>
			`;
			marker.bindPopup(popupContent);

			// Clic sur le marqueur
			marker.on('click', () => {
				onEventSelect(event.id);
			});

			markers.push(marker);
		});

		// Ajuster la vue pour montrer tous les marqueurs
		if (markers.length > 0) {
			const group = L!.featureGroup(markers);
			map!.fitBounds(group.getBounds().pad(0.1));
		}
	}

	// Réagir aux changements
	$effect(() => {
		if (map && L) {
			updateMarkers();
		}
	});
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
		integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
		crossorigin=""
	/>
</svelte:head>

<div bind:this={mapContainer} class="w-full h-full min-h-[300px] rounded-lg {className}">
	{#if events.filter((e) => e.latitude && e.longitude).length === 0}
		<div
			class="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-[1000] pointer-events-none"
		>
			<div class="text-center p-6">
				<p class="text-muted-foreground text-sm">
					Aucun événement géolocalisé.<br />
					Les coordonnées seront ajoutées automatiquement<br />
					lorsque le géocodage sera activé.
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.custom-marker) {
		background: transparent;
		border: none;
	}
</style>

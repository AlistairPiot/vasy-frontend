<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
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
	let markerMap = new Map<string, Marker>();
	let L: typeof import('leaflet') | null = null;

	// Position par défaut (France)
	const DEFAULT_CENTER: [number, number] = [46.603354, 1.888334];
	const DEFAULT_ZOOM = 6;

	onMount(async () => {
		L = await import('leaflet');
		map = L.map(mapContainer).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
		buildMarkers();
	});

	onDestroy(() => {
		if (map) { map.remove(); map = null; }
	});

	function createIcon(isSelected: boolean, isActive: boolean) {
		const color = isSelected ? '#7c3aed' : isActive ? '#22c55e' : '#6b7280';
		const size = isSelected ? 32 : 24;
		const anchor = size / 2;
		return L!.divIcon({
			className: 'custom-marker',
			html: `<div style="background-color:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:all 0.2s;"></div>`,
			iconSize: [size, size],
			iconAnchor: [anchor, anchor]
		});
	}

	// Construit tous les marqueurs et ajuste la vue (appelé une seule fois ou quand events change)
	function buildMarkers() {
		if (!map || !L) return;
		markerMap.forEach((m) => m.remove());
		markerMap.clear();

		const eventsWithCoords = events.filter(
			(e) => e.latitude !== null && e.longitude !== null && e.status !== 'deleted'
		);
		if (eventsWithCoords.length === 0) return;

		eventsWithCoords.forEach((event) => {
			const marker = L!.marker([event.latitude!, event.longitude!], {
				icon: createIcon(event.id === selectedEventId, event.status === 'active')
			}).addTo(map!);

			marker.bindPopup(`
				<div style="min-width:150px;">
					<strong>${event.name}</strong>
					<p style="margin:4px 0;font-size:12px;color:#666;">${event.location_text}</p>
					<p style="margin:0;font-size:11px;color:#888;">${new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
				</div>
			`);
			marker.on('click', () => onEventSelect(event.id));
			markerMap.set(event.id, marker);
		});

		// fitBounds uniquement à la construction, pas lors d'un clic
		const group = L!.featureGroup([...markerMap.values()]);
		map!.fitBounds(group.getBounds().pad(0.1));
	}

	// Met à jour uniquement les icônes sans toucher au zoom
	function refreshIcons() {
		if (!L) return;
		const eventMap = new Map(events.map((e) => [e.id, e]));
		markerMap.forEach((marker, eventId) => {
			const event = eventMap.get(eventId);
			if (event) marker.setIcon(createIcon(eventId === selectedEventId, event.status === 'active'));
		});
	}

	// Reconstruire si la liste d'événements change (untrack selectedEventId pour ne pas fitBounds au clic)
	$effect(() => {
		const _events = events;
		if (map && L && _events) untrack(() => buildMarkers());
	});

	// Juste mettre à jour les icônes quand la sélection change (pas de fitBounds)
	$effect(() => {
		const _selected = selectedEventId;
		if (map && L && markerMap.size > 0) refreshIcons();
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

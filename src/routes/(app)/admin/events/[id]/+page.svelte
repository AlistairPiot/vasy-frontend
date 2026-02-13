<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AddressAutocomplete from '$lib/components/ui/AddressAutocomplete.svelte';
	import EventsMap from '$lib/components/ui/EventsMap.svelte';

	let { data, form } = $props();
	let containerRef: HTMLDivElement;

	// Extraire la date et l'heure de l'événement
	const eventDate = new Date(data.event.date);
	const dateValue = eventDate.toISOString().split('T')[0];
	const timeValue = eventDate.toTimeString().slice(0, 5);

	// État pour l'adresse avec valeurs initiales
	let locationValue = $state(data.event.location_text);
	let latitudeValue = $state<number | null>(data.event.latitude);
	let longitudeValue = $state<number | null>(data.event.longitude);

	// Pour la carte
	const eventsForMap = [data.event];
	let selectedEventId = $state<string | null>(data.event.id);
	const hasCoordinates = data.event.latitude !== null && data.event.longitude !== null;

	// Onglet actif
	let activeTab = $state<'detail' | 'edit'>('detail');

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active':
				return { text: 'Actif', class: 'bg-green-100 text-green-800' };
			case 'expired':
				return { text: 'Expiré', class: 'bg-orange-100 text-orange-800' };
			case 'deleted':
				return { text: 'Supprimé', class: 'bg-red-100 text-red-800' };
			default:
				return { text: status, class: 'bg-gray-100 text-gray-800' };
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function formatTime(dateStr: string): string {
		return new Date(dateStr).toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const badge = getStatusBadge(data.event.status);
</script>

<div bind:this={containerRef}>
	<div class="animate-in mb-6">
		<a
			href="/admin/events"
			class="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
			Retour aux événements
		</a>
	</div>

	<div class="animate-in flex items-center gap-3 mb-6">
		<h1 class="text-2xl font-bold">{data.event.name}</h1>
		<span class="text-xs px-2 py-1 rounded {badge.class}">
			{badge.text}
		</span>
	</div>

	<!-- Infos créateur -->
	<Card class="animate-in mb-6">
		<div class="p-4 bg-muted/50">
			<p class="text-sm text-muted-foreground">
				Créé par <span class="font-medium">{data.event.created_by_name}</span>
				{#if data.event.creator_email}
					(<span class="text-primary">{data.event.creator_email}</span>)
				{/if}
			</p>
		</div>
	</Card>

	<!-- Onglets Détail / Modifier -->
	<div class="animate-in flex gap-1 bg-muted rounded-lg p-1 mb-6 w-fit">
		<button
			class="px-4 py-2 text-sm rounded-md transition-colors {activeTab === 'detail'
				? 'bg-background shadow-sm font-medium'
				: 'hover:bg-background/50'}"
			onclick={() => (activeTab = 'detail')}
		>
			Détail
		</button>
		{#if data.event.status !== 'deleted'}
			<button
				class="px-4 py-2 text-sm rounded-md transition-colors {activeTab === 'edit'
					? 'bg-background shadow-sm font-medium'
					: 'hover:bg-background/50'}"
				onclick={() => (activeTab = 'edit')}
			>
				Modifier
			</button>
		{/if}
	</div>

	{#if form?.error}
		<div class="animate-in bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	<!-- Vue Détail -->
	{#if activeTab === 'detail'}
		<div class="grid md:grid-cols-2 gap-6 mb-6">
			<Card class="animate-in">
				<div class="p-6">
					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<span class="text-lg">📅</span>
							<div>
								<p class="font-medium">{formatDate(data.event.date)}</p>
								<p class="text-sm text-muted-foreground">à {formatTime(data.event.date)}</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-lg">📍</span>
							<p class="font-medium">{data.event.location_text}</p>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-lg">👤</span>
							<div>
								<p class="font-medium">{data.event.created_by_name}</p>
								{#if data.event.creator_email}
									<p class="text-sm text-muted-foreground">{data.event.creator_email}</p>
								{/if}
							</div>
						</div>
					</div>

					{#if data.event.description}
						<div class="mt-6 pt-4 border-t">
							<h3 class="text-sm font-semibold mb-2">Description</h3>
							<p class="text-muted-foreground text-sm whitespace-pre-wrap">{data.event.description}</p>
						</div>
					{:else}
						<div class="mt-6 pt-4 border-t">
							<p class="text-muted-foreground text-sm italic">Aucune description.</p>
						</div>
					{/if}
				</div>
			</Card>

			<div class="animate-in">
				{#if hasCoordinates}
					<Card class="overflow-hidden h-[350px]">
						<EventsMap
							events={eventsForMap}
							bind:selectedEventId
							class="h-full"
						/>
					</Card>
				{:else}
					<Card class="h-[350px] flex items-center justify-center">
						<p class="text-muted-foreground text-sm text-center">
							Aucune carte disponible pour cet événement.
						</p>
					</Card>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Vue Modifier -->
	{#if activeTab === 'edit'}
		<Card class="animate-in">
			<div class="p-6">
				<form method="POST" action="?/update" use:enhance class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium mb-1">
							Nom de l'événement <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							maxlength="200"
							value={data.event.name}
							class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Ex: Marché de Noël, Atelier créatif..."
						/>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="date" class="block text-sm font-medium mb-1">
								Date <span class="text-red-500">*</span>
							</label>
							<input
								type="date"
								id="date"
								name="date"
								required
								value={dateValue}
								class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>
						<div>
							<label for="time" class="block text-sm font-medium mb-1"> Heure (optionnel) </label>
							<input
								type="time"
								id="time"
								name="time"
								value={timeValue}
								class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>
					</div>

					<div>
						<label for="location_text" class="block text-sm font-medium mb-1">
							Lieu <span class="text-red-500">*</span>
						</label>
						<AddressAutocomplete
							id="location_text"
							name="location_text"
							required
							placeholder="Rechercher une adresse..."
							bind:value={locationValue}
							bind:latitude={latitudeValue}
							bind:longitude={longitudeValue}
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium mb-1">
							Description (optionnel)
						</label>
						<textarea
							id="description"
							name="description"
							rows="4"
							maxlength="2000"
							class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Décrivez l'événement..."
						>{data.event.description || ''}</textarea>
					</div>

					<div class="flex justify-end gap-3 pt-4 border-t">
						<Button variant="outline" onclick={() => (activeTab = 'detail')}>
							{#snippet children()}
								Annuler
							{/snippet}
						</Button>
						<Button type="submit">
							{#snippet children()}
								Enregistrer
							{/snippet}
						</Button>
					</div>
				</form>
			</div>
		</Card>

		<!-- Zone de danger -->
		{#if data.event.status !== 'deleted'}
			<Card class="animate-in mt-6 border-red-200">
				<div class="p-6">
					<h3 class="text-lg font-semibold text-red-600 mb-2">Zone de danger</h3>
					<p class="text-sm text-muted-foreground mb-4">
						La suppression d'un événement est irréversible.
					</p>
					<form method="POST" action="?/delete" use:enhance>
						<Button
							type="submit"
							variant="destructive"
							onclick={(e: MouseEvent) => {
								if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
									e.preventDefault();
								}
							}}
						>
							{#snippet children()}
								Supprimer cet événement
							{/snippet}
						</Button>
					</form>
				</div>
			</Card>
		{/if}
	{/if}
</div>

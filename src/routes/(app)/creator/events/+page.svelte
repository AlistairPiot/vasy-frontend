<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EventsMap from '$lib/components/ui/EventsMap.svelte';
	import AddressAutocomplete from '$lib/components/ui/AddressAutocomplete.svelte';

	let { data, form } = $props();
	let containerRef: HTMLDivElement;
	let showCreateForm = $state(false);
	let selectedEventId = $state<string | null>(null);

	// Vue actuelle: 'both', 'map', 'list'
	let viewMode = $state<'both' | 'map' | 'list'>('both');

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

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

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active':
				return { text: 'Actif', class: 'bg-green-100 text-green-800' };
			case 'expired':
				return { text: 'Passé', class: 'bg-gray-100 text-gray-800' };
			default:
				return { text: status, class: 'bg-gray-100 text-gray-800' };
		}
	}

	function isEventPast(dateStr: string): boolean {
		return new Date(dateStr) < new Date();
	}

	function handleEventSelect(eventId: string) {
		selectedEventId = eventId;
		// Scroll vers l'événement si en mode 'both' ou 'list'
		if (viewMode !== 'map') {
			const element = document.getElementById(`event-${eventId}`);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}
</script>

<div bind:this={containerRef}>
	<!-- Header avec titre et actions -->
	<div class="animate-in flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">Mes événements</h1>
		<div class="flex items-center gap-3">
			<!-- Toggle de vue -->
			<div class="flex bg-muted rounded-lg p-1">
				<button
					class="px-3 py-1.5 text-sm rounded-md transition-colors {viewMode === 'list'
						? 'bg-background shadow-sm'
						: 'hover:bg-background/50'}"
					onclick={() => (viewMode = 'list')}
					title="Afficher la liste"
				>
					Liste
				</button>
				<button
					class="px-3 py-1.5 text-sm rounded-md transition-colors {viewMode === 'both'
						? 'bg-background shadow-sm'
						: 'hover:bg-background/50'}"
					onclick={() => (viewMode = 'both')}
					title="Afficher les deux"
				>
					Les deux
				</button>
				<button
					class="px-3 py-1.5 text-sm rounded-md transition-colors {viewMode === 'map'
						? 'bg-background shadow-sm'
						: 'hover:bg-background/50'}"
					onclick={() => (viewMode = 'map')}
					title="Afficher la carte"
				>
					Carte
				</button>
			</div>
			<Button onclick={() => (showCreateForm = !showCreateForm)}>
				{#snippet children()}
					{showCreateForm ? 'Annuler' : '+ Nouvel événement'}
				{/snippet}
			</Button>
		</div>
	</div>

	{#if !data.stripeStatus.onboarding_complete}
		<Card class="animate-in p-6 mb-6 border-orange-500 bg-orange-50">
			<div class="flex gap-4 items-start">
				<svg
					class="w-6 h-6 text-orange-600 shrink-0 mt-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<div class="flex-1">
					<h3 class="font-semibold text-orange-900 mb-2">Configuration Stripe requise</h3>
					<p class="text-sm text-orange-800 mb-4">
						Vous devez configurer votre compte Stripe pour pouvoir créer des événements.
						Cette étape est obligatoire pour recevoir les paiements de vos clients.
					</p>
					<a href="/creator/profile#stripe">
						<Button size="sm" class="bg-orange-600 hover:bg-orange-700 text-white">
							{#snippet children()}
								Configurer Stripe maintenant
							{/snippet}
						</Button>
					</a>
				</div>
			</div>
		</Card>
	{/if}

	{#if form?.error}
		<div class="animate-in bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div
			class="animate-in bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
		>
			Événement créé avec succès !
		</div>
	{/if}

	<!-- Formulaire de création -->
	{#if showCreateForm}
		<Card class="animate-in mb-6 {!data.stripeStatus.onboarding_complete ? 'opacity-50 pointer-events-none' : ''}">
			<div class="p-6">
				<h2 class="text-lg font-semibold mb-4">Créer un événement</h2>
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								showCreateForm = false;
								await invalidateAll();
							}
						};
					}}
					class="space-y-4"
				>
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
								class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>
						<div>
							<label for="time" class="block text-sm font-medium mb-1"> Heure (optionnel) </label>
							<input
								type="time"
								id="time"
								name="time"
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
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium mb-1">
							Description (optionnel)
						</label>
						<textarea
							id="description"
							name="description"
							rows="3"
							maxlength="2000"
							class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Décrivez votre événement..."
						></textarea>
					</div>

					<div class="flex justify-end gap-3">
						<Button variant="outline" onclick={() => (showCreateForm = false)}>
							{#snippet children()}
								Annuler
							{/snippet}
						</Button>
						<Button type="submit">
							{#snippet children()}
								Créer l'événement
							{/snippet}
						</Button>
					</div>
				</form>
			</div>
		</Card>
	{/if}

	<!-- Contenu principal avec carte et liste -->
	{#if data.events.length === 0}
		<Card class="animate-in">
			<div class="p-8 text-center text-muted-foreground">
				<p class="mb-4">Vous n'avez pas encore créé d'événement.</p>
				<Button onclick={() => (showCreateForm = true)}>
					{#snippet children()}
						Créer mon premier événement
					{/snippet}
				</Button>
			</div>
		</Card>
	{:else}
		<div
			class="animate-in grid gap-6"
			class:grid-cols-1={viewMode !== 'both'}
			class:lg:grid-cols-2={viewMode === 'both'}
		>
			<!-- Liste des événements (gauche) -->
			{#if viewMode === 'list' || viewMode === 'both'}
				<div
					class="space-y-4 {viewMode === 'both' ? 'max-h-[calc(100vh-280px)] overflow-y-auto pr-2' : ''}"
				>
					{#each data.events as event}
						{@const badge = getStatusBadge(event.status)}
						<Card
							id="event-{event.id}"
							class="transition-all cursor-pointer {selectedEventId === event.id
								? 'shadow-md -translate-y-0.5'
								: 'hover:shadow-md hover:-translate-y-0.5'}"
						>
							<button
								type="button"
								class="w-full text-left overflow-hidden cursor-pointer"
								onclick={() => (selectedEventId = event.id)}
							>
								<div class="p-4">
									<div class="flex items-start justify-between min-w-0">
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 mb-2 min-w-0">
												<h3 class="font-semibold truncate">{event.name}</h3>
												<span class="text-xs px-2 py-0.5 rounded shrink-0 {badge.class}">
													{badge.text}
												</span>
											</div>

											<div class="space-y-1 text-sm text-muted-foreground">
												<p class="flex items-center gap-2 min-w-0">
													<span class="shrink-0">📅</span>
													<span class="truncate" class:line-through={isEventPast(event.date)}>
														{formatDate(event.date)} à {formatTime(event.date)}
													</span>
												</p>
												<p class="flex items-center gap-2 min-w-0">
													<span class="shrink-0">📍</span>
													<span class="truncate">{event.location_text}</span>
												</p>
												{#if event.latitude && event.longitude}
													<p class="flex items-center gap-2 text-xs text-green-600">
														<span>✓</span>
														<span>Géolocalisé</span>
													</p>
												{/if}
											</div>

											{#if event.description}
												<p class="mt-2 text-sm line-clamp-2">{event.description}</p>
											{/if}
										</div>
									</div>
								</div>
							</button>

							<!-- Actions -->
							<div class="px-4 pb-4 flex gap-2 border-t pt-3">
								<a href="/creator/events/{event.id}" class="flex-1">
									<Button size="sm" variant="outline" class="w-full">
										{#snippet children()}
											Modifier
										{/snippet}
									</Button>
								</a>
								<form
									method="POST"
									action="?/delete"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												await invalidateAll();
											}
										};
									}}
								>
									<input type="hidden" name="eventId" value={event.id} />
									<Button
										type="submit"
										size="sm"
										variant="destructive"
										onclick={(e: MouseEvent) => {
											if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
												e.preventDefault();
											}
										}}
									>
										{#snippet children()}
											Supprimer
										{/snippet}
									</Button>
								</form>
							</div>
						</Card>
					{/each}

					<div class="text-sm text-muted-foreground pt-2">
						Total : {data.events.length} événement{data.events.length > 1 ? 's' : ''}
					</div>
				</div>
			{/if}

			<!-- Carte (droite/centre) -->
			{#if viewMode === 'map' || viewMode === 'both'}
				<div
					class="relative {viewMode === 'map' ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-280px)]'}"
				>
					<Card class="h-full overflow-hidden">
						<EventsMap
							events={data.events}
							bind:selectedEventId
							onEventSelect={handleEventSelect}
							class="h-full"
						/>
					</Card>
				</div>
			{/if}
		</div>
	{/if}
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import EventsMap from '$lib/components/ui/EventsMap.svelte';
	import WoodBackground from '$lib/components/WoodBackground.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { eventFavorites } from '$lib/stores/eventFavorites';

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let listContainerRef: HTMLDivElement;
	let selectedEventId = $state<string | null>(null);
	let viewMode = $state<'both' | 'list'>('list');

	onMount(() => {
		if (window.innerWidth >= 768) viewMode = 'both';

		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.08,
			ease: 'power3.out'
		});
	});

	$effect(() => {
		if (!selectedEventId) return;
		const el = document.getElementById(`event-${selectedEventId}`);
		if (el) {
			gsap.fromTo(el, { scale: 1 }, { scale: 1.025, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 });
		}
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

	function getEventStatus(dateStr: string): 'past' | 'today' | 'upcoming' {
		const eventDate = new Date(dateStr);
		const today = new Date();
		const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
		const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		if (eventDay.getTime() === todayDay.getTime()) return 'today';
		if (eventDay < todayDay) return 'past';
		return 'upcoming';
	}

	function getStatusBadge(dateStr: string) {
		const status = getEventStatus(dateStr);
		switch (status) {
			case 'past':
				return { text: 'Passé', class: 'bg-muted text-muted-foreground' };
			case 'today':
				return { text: "Aujourd'hui", class: 'bg-primary/15 text-primary font-medium' };
			case 'upcoming':
				return { text: 'À venir', class: 'bg-secondary text-foreground/70' };
		}
	}

	function handleEventSelect(eventId: string) {
		selectedEventId = eventId;
		const element = document.getElementById(`event-${eventId}`);
		if (!element) return;

		if (viewMode === 'both' && listContainerRef) {
			const offset =
				element.getBoundingClientRect().top -
				listContainerRef.getBoundingClientRect().top -
				listContainerRef.clientHeight / 2 +
				element.clientHeight / 2;
			listContainerRef.scrollBy({ top: offset, behavior: 'smooth' });
		} else {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}
</script>

<div class="relative min-h-screen bg-background" bind:this={containerRef}>
	<WoodBackground />
	<div class="relative" style="z-index: 2;">
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8 overflow-x-hidden">
		<Breadcrumb
			items={[{ label: 'Accueil', href: '/' }, { label: 'Événements' }]}
		/>

		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-10 mb-8">
			<div>
				<h1 class="animate-in text-2xl sm:text-3xl md:text-4xl text-foreground">Événements</h1>
				<p class="animate-in text-sm text-muted-foreground mt-1">
					{data.events.length} événement{data.events.length > 1 ? 's' : ''} à découvrir
				</p>
			</div>

			{#if data.events.length > 0}
				<div class="animate-in hidden sm:flex bg-muted rounded-lg p-1">
					<button
						class="px-3 py-1.5 text-sm rounded-md transition-colors {viewMode === 'list'
							? 'bg-background shadow-sm'
							: 'hover:bg-background/50'}"
						onclick={() => (viewMode = 'list')}
					>
						Liste
					</button>
					<button
						class="px-3 py-1.5 text-sm rounded-md transition-colors {viewMode === 'both'
							? 'bg-background shadow-sm'
							: 'hover:bg-background/50'}"
						onclick={() => (viewMode = 'both')}
					>
						Les deux
					</button>
				</div>
			{/if}
		</div>

		{#if data.events.length === 0}
			<div class="animate-in">
				<EmptyState
					variant="events"
					title="Aucun événement à venir"
					description="Les artisans organisent régulièrement des marchés et ateliers. Revenez bientôt !"
					ctas={[{ label: 'Voir les créations', href: '/products' }]}
				/>
			</div>
		{:else}
			<div
				class="animate-in grid gap-6"
				class:grid-cols-1={viewMode !== 'both'}
				class:lg:grid-cols-2={viewMode === 'both'}
			>
				<!-- Liste des événements -->
				{#if viewMode === 'list' || viewMode === 'both'}
					<div
						bind:this={listContainerRef}
						class="space-y-4 {viewMode === 'both'
							? 'md:max-h-[calc(100vh-280px)] md:overflow-y-auto md:pr-2 md:pl-0.5 md:py-0.5'
							: ''}"
					>
						{#each data.events as event}
							{@const badge = getStatusBadge(event.date)}
							<Card
								id="event-{event.id}"
								class="transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 {selectedEventId === event.id
									? 'ring-2 ring-primary shadow-lg -translate-y-0.5'
									: ''}"
							>
								<div
									role="button"
									tabindex="0"
									class="w-full text-left overflow-hidden cursor-pointer"
									onclick={() => goto(`/events/${event.id}`)}
									onkeydown={(e) => e.key === 'Enter' && goto(`/events/${event.id}`)}
								>
									<div class="p-4">
										<div class="flex items-start justify-between min-w-0">
											<div class="flex-1 min-w-0">
												<div class="flex items-center gap-2 mb-2 min-w-0">
													<h3 class="font-semibold text-lg truncate">
														{event.name}
													</h3>
													<span class="text-xs px-2 py-0.5 rounded shrink-0 {badge.class}">
														{badge.text}
													</span>
												</div>

												<div class="space-y-1 text-sm text-muted-foreground">
													<p class="flex items-center gap-2 min-w-0">
														<span class="shrink-0">📅</span>
														<span class="truncate">
															{formatDate(event.date)} à {formatTime(event.date)}
														</span>
													</p>
													<p class="flex items-center gap-2 min-w-0">
														<span class="shrink-0">📍</span>
														<span class="truncate">{event.location_text}</span>
													</p>
													<p class="flex items-center gap-2 min-w-0">
														<span class="shrink-0">👤</span>
														<span class="truncate">{event.created_by_name}</span>
													</p>
													{#if event.is_paid && event.price}
														<p class="flex items-center gap-2 min-w-0 text-primary font-medium">
															<span class="shrink-0">🎟️</span>
															<span>{(event.price / 100).toFixed(2)} €</span>
														</p>
													{:else}
														<p class="flex items-center gap-2 min-w-0 text-muted-foreground">
															<span class="shrink-0">🎟️</span>
															<span>Entrée libre</span>
														</p>
													{/if}
												</div>

												{#if event.description}
													<p class="mt-2 text-sm text-muted-foreground line-clamp-2">
														{event.description}
													</p>
												{/if}
											</div>
											<div class="flex items-center gap-1 shrink-0 ml-3">
												{#if data.user && data.user.role !== 'creator'}
													<button
														type="button"
														onclick={(e) => { e.stopPropagation(); eventFavorites.toggle(event.id); }}
														class="p-1.5 rounded-full hover:bg-muted transition-colors"
														title={$eventFavorites.includes(event.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={$eventFavorites.includes(event.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={$eventFavorites.includes(event.id) ? 'text-red-500' : 'text-muted-foreground'}>
															<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
														</svg>
													</button>
												{/if}
												<span class="text-muted-foreground">
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M9 18l6-6-6-6"/>
													</svg>
												</span>
											</div>
										</div>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				{/if}

				<!-- Carte -->
				{#if viewMode === 'both'}
					<div class="relative h-[55vh] md:h-[calc(100vh-280px)]">
						<Card class="h-full overflow-hidden" data-lenis-prevent>
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
	</main>
	</div>
</div>

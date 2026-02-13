<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import EventsMap from '$lib/components/ui/EventsMap.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;
	let selectedEventId = $state<string | null>(null);
	let viewMode = $state<'both' | 'map' | 'list'>('both');

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.08,
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

	function handleEventSelect(eventId: string) {
		selectedEventId = eventId;
		if (viewMode !== 'map') {
			const element = document.getElementById(`event-${eventId}`);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8">
		<Breadcrumb
			items={[{ label: 'Accueil', href: '/' }, { label: 'Événements' }]}
		/>

		<div
			class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 mb-8"
		>
			<div>
				<h1 class="animate-in text-3xl font-bold">Événements</h1>
				<p class="animate-in text-muted-foreground mt-1">
					{data.events.length} événement{data.events.length > 1 ? 's' : ''} à venir
				</p>
			</div>

			{#if data.events.length > 0}
				<div class="animate-in flex bg-muted rounded-lg p-1">
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
					<button
						class="px-3 py-1.5 text-sm rounded-md transition-colors {viewMode === 'map'
							? 'bg-background shadow-sm'
							: 'hover:bg-background/50'}"
						onclick={() => (viewMode = 'map')}
					>
						Carte
					</button>
				</div>
			{/if}
		</div>

		{#if data.events.length === 0}
			<Card class="animate-in p-8 text-center">
				<p class="text-muted-foreground">Aucun événement à venir pour le moment.</p>
			</Card>
		{:else}
			<div
				class="animate-in grid gap-6"
				class:grid-cols-1={viewMode !== 'both'}
				class:lg:grid-cols-2={viewMode === 'both'}
			>
				<!-- Liste des événements -->
				{#if viewMode === 'list' || viewMode === 'both'}
					<div
						class="space-y-4 {viewMode === 'both'
							? 'max-h-[calc(100vh-280px)] overflow-y-auto pr-2'
							: ''}"
					>
						{#each data.events as event}
							<a
								href="/events/{event.id}"
								class="block"
								onmouseenter={() => (selectedEventId = event.id)}
							>
								<Card
									id="event-{event.id}"
									class="transition-all {selectedEventId === event.id
										? 'ring-2 ring-primary'
										: 'hover:shadow-md'}"
								>
									<div class="p-4">
										<div class="flex items-start justify-between min-w-0">
											<div class="flex-1 min-w-0">
												<h3 class="font-semibold text-lg truncate mb-2">
													{event.name}
												</h3>

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
												</div>

												{#if event.description}
													<p class="mt-2 text-sm text-muted-foreground line-clamp-2">
														{event.description}
													</p>
												{/if}
											</div>
										</div>
									</div>
								</Card>
							</a>
						{/each}
					</div>
				{/if}

				<!-- Carte -->
				{#if viewMode === 'map' || viewMode === 'both'}
					<div
						class="relative {viewMode === 'map'
							? 'h-[calc(100vh-200px)]'
							: 'h-[calc(100vh-280px)]'}"
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
	</main>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import EventsMap from '$lib/components/ui/EventsMap.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	const eventsForMap = [data.event];
	let selectedEventId = $state<string | null>(data.event.id);
	const hasCoordinates = data.event.latitude !== null && data.event.longitude !== null;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
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

	function isEventPast(dateStr: string): boolean {
		return new Date(dateStr) < new Date();
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8">
		<Breadcrumb
			items={[
				{ label: 'Accueil', href: '/' },
				{ label: 'Événements', href: '/events' },
				{ label: data.event.name }
			]}
		/>

		<div class="grid md:grid-cols-2 gap-8 py-8">
			<!-- Infos de l'événement -->
			<div class="animate-in">
				{#if isEventPast(data.event.date)}
					<div
						class="mb-4 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md inline-block"
					>
						Événement passé
					</div>
				{:else}
					<div
						class="mb-4 px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-md inline-block"
					>
						Événement à venir
					</div>
				{/if}

				<h1 class="text-3xl font-bold mb-4">{data.event.name}</h1>

				<Card class="p-4 mb-6">
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<span class="text-lg">📅</span>
							<div>
								<p
									class="font-medium"
									class:line-through={isEventPast(data.event.date)}
								>
									{formatDate(data.event.date)}
								</p>
								<p class="text-sm text-muted-foreground">
									à {formatTime(data.event.date)}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-lg">📍</span>
							<p class="font-medium">{data.event.location_text}</p>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-lg">👤</span>
							<p class="text-sm text-muted-foreground">
								Organisé par <span class="font-medium text-foreground"
									>{data.event.created_by_name}</span
								>
							</p>
						</div>
					</div>
				</Card>

				{#if data.event.description}
					<div class="animate-in">
						<h2 class="text-lg font-semibold mb-2">Description</h2>
						<p class="text-muted-foreground whitespace-pre-wrap">
							{data.event.description}
						</p>
					</div>
				{/if}
			</div>

			<!-- Carte -->
			<div class="animate-in">
				{#if hasCoordinates}
					<Card class="overflow-hidden h-[400px]">
						<EventsMap
							events={eventsForMap}
							bind:selectedEventId
							class="h-full"
						/>
					</Card>
				{:else}
					<Card class="h-[400px] flex items-center justify-center">
						<p class="text-muted-foreground text-sm text-center">
							Aucune carte disponible pour cet événement.
						</p>
					</Card>
				{/if}
			</div>
		</div>
	</main>
</div>

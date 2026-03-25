<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import EventsMap from '$lib/components/ui/EventsMap.svelte';
	import { eventFavorites } from '$lib/stores/eventFavorites';

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

	function getEventStatus(dateStr: string): 'past' | 'today' | 'upcoming' {
		const eventDate = new Date(dateStr);
		const today = new Date();
		// Comparer uniquement les jours (sans l'heure)
		const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
		const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		if (eventDay.getTime() === todayDay.getTime()) return 'today';
		if (eventDay < todayDay) return 'past';
		return 'upcoming';
	}

	const eventStatus = getEventStatus(data.event.date);

	const attachments: string[] = JSON.parse(data.event.attachment_urls || '[]');

	function isPdf(url: string) {
		return url.includes('/raw/') || url.toLowerCase().includes('.pdf');
	}

	function attachmentLabel(url: string, index: number) {
		const name = url.split('/').pop()?.split('?')[0] || `fichier-${index + 1}`;
		return decodeURIComponent(name);
	}

	// Visionneur de pièces jointes
	let viewerUrl = $state<string | null>(null);
	let viewerIsPdf = $state(false);

	function openViewer(url: string) {
		viewerIsPdf = isPdf(url);
		viewerUrl = viewerIsPdf
			? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
			: url;
	}

	function closeViewer() {
		viewerUrl = null;
	}

	// Report modal
	let showReportModal = $state(false);
	let reportReason = $state('');
	let reportLoading = $state(false);
	let reportSuccess = $state(false);
	let reportError = $state('');

	function openReportModal() {
		reportReason = '';
		reportSuccess = false;
		reportError = '';
		showReportModal = true;
	}

	async function submitReport() {
		if (!reportReason.trim()) {
			reportError = 'Veuillez indiquer le motif du signalement.';
			return;
		}
		reportLoading = true;
		reportError = '';
		try {
			const res = await fetch('/api/event-reports', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					event_id: data.event.id,
					reporter_email: data.user?.email ?? '',
					reason: reportReason.trim()
				})
			});
			if (!res.ok) {
				const body = await res.json();
				reportError = body.error || 'Erreur lors du signalement.';
			} else {
				reportSuccess = true;
			}
		} catch {
			reportError = 'Erreur réseau.';
		} finally {
			reportLoading = false;
		}
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

		<div class="animate-in flex items-center justify-between mt-6">
			<a
				href="/events"
				class="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
				Retour aux événements
			</a>
			<div class="flex items-center gap-2">
				{#if data.user}
					<button
						type="button"
						onclick={openReportModal}
						class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-input hover:bg-accent text-muted-foreground transition-colors text-sm"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
						Signaler
					</button>
				{/if}
				{#if data.user && data.user.role !== 'creator'}
					<button
						type="button"
						onclick={() => eventFavorites.toggle(data.event.id)}
						class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors text-sm {$eventFavorites.includes(data.event.id) ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100' : 'border-input hover:bg-accent text-muted-foreground'}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={$eventFavorites.includes(data.event.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
						</svg>
						{$eventFavorites.includes(data.event.id) ? 'Favori' : 'Ajouter aux favoris'}
					</button>
				{/if}
			</div>
		</div>

		<div class="grid md:grid-cols-2 gap-8 py-8">
			<!-- Infos de l'événement -->
			<div class="animate-in">
				{#if eventStatus === 'past'}
					<div
						class="mb-4 px-3 py-1.5 bg-red-100 text-red-800 text-sm rounded-md inline-block"
					>
						Événement passé
					</div>
				{:else if eventStatus === 'today'}
					<div
						class="mb-4 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-md inline-block"
					>
						Aujourd'hui
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
									class:line-through={eventStatus === 'past'}
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
					{#if data.event.is_paid && data.event.price}
						<div class="flex items-center gap-3">
							<span class="text-lg">🎟️</span>
							<div>
								<p class="font-medium">{(data.event.price / 100).toFixed(2)} €</p>
								<p class="text-xs text-muted-foreground">Entrée payante</p>
							</div>
						</div>
					{:else}
						<div class="flex items-center gap-3">
							<span class="text-lg">🎟️</span>
							<p class="font-medium text-green-600">Entrée libre</p>
						</div>
					{/if}
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

				{#if attachments.length > 0}
					<div class="animate-in mt-6">
						<h2 class="text-lg font-semibold mb-3">Documents</h2>
						<ul class="space-y-2">
							{#each attachments as url, i}
								<li class="flex items-center gap-3 p-3 rounded-lg border bg-card">
									{#if isPdf(url)}
										<div class="w-9 h-9 rounded bg-red-100 flex items-center justify-center shrink-0">
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
										</div>
									{:else}
										<button type="button" onclick={() => openViewer(url)} class="w-9 h-9 shrink-0 rounded overflow-hidden hover:opacity-80 transition-opacity">
											<img src={url} alt={attachmentLabel(url, i)} class="w-full h-full object-cover" />
										</button>
									{/if}
									<span class="flex-1 text-sm truncate">{attachmentLabel(url, i)}</span>
									<button
									type="button"
									onclick={() => openViewer(url)}
									class="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-input hover:bg-accent transition-colors shrink-0"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
									Voir
								</button>
								</li>
							{/each}
						</ul>
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

<!-- Visionneur de pièces jointes -->
{#if viewerUrl}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-black/90"
		role="dialog"
		aria-modal="true"
	>
		<!-- Barre supérieure -->
		<div class="flex items-center justify-between px-4 py-3 shrink-0">
			<span class="text-white/70 text-sm truncate max-w-xs">{attachmentLabel(viewerUrl, 0)}</span>
			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={closeViewer}
					class="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
					aria-label="Fermer"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
			</div>
		</div>

		<!-- Contenu -->
		<div class="flex-1 overflow-hidden flex items-center justify-center p-4 relative">
			<button
				type="button"
				class="absolute inset-0 w-full h-full cursor-default"
				onclick={closeViewer}
				aria-label="Fermer le visionneur"
			></button>
			{#if viewerIsPdf}
				<div class="w-full h-full max-w-5xl relative z-10">
					<iframe
						src={viewerUrl}
						title="Aperçu PDF"
						class="w-full h-full rounded-lg"
					></iframe>
				</div>
			{:else}
				<img
					src={viewerUrl}
					alt="Aperçu"
					class="max-w-full max-h-full object-contain rounded-lg cursor-default relative z-10"
				/>
			{/if}
		</div>
	</div>
{/if}

<!-- Modal de signalement -->
{#if showReportModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="bg-background rounded-lg shadow-xl w-full max-w-md p-6">
			{#if reportSuccess}
				<div class="text-center py-4">
					<div class="text-green-500 mb-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold mb-1">Signalement envoyé</h3>
					<p class="text-sm text-muted-foreground mb-4">Merci, notre équipe va examiner cet événement.</p>
					<button
						type="button"
						onclick={() => showReportModal = false}
						class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
					>
						Fermer
					</button>
				</div>
			{:else}
				<h3 class="text-lg font-semibold mb-1">Signaler cet événement</h3>
				<p class="text-sm text-muted-foreground mb-4">{data.event.name}</p>

				<label for="report-reason" class="block text-sm font-medium mb-1">Motif du signalement</label>
				<textarea
					id="report-reason"
					bind:value={reportReason}
					placeholder="Décrivez le problème avec cet événement..."
					rows="4"
					class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
				></textarea>

				{#if reportError}
					<p class="text-red-500 text-sm mt-2">{reportError}</p>
				{/if}

				<div class="flex gap-3 mt-4">
					<button
						type="button"
						onclick={() => showReportModal = false}
						class="flex-1 px-4 py-2 rounded-md border border-input text-sm font-medium hover:bg-accent transition-colors"
					>
						Annuler
					</button>
					<button
						type="button"
						onclick={submitReport}
						disabled={reportLoading}
						class="flex-1 px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
					>
						{reportLoading ? 'Envoi...' : 'Signaler'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

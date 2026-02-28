<script lang="ts">
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	let openId = $state<string | null>(null);

	function toggle(id: string) {
		openId = openId === id ? null : id;
	}
</script>

<div class="space-y-10" bind:this={containerRef}>
	<div class="animate-in flex items-start justify-between">
		<div>
			<h1 class="text-3xl font-bold">Signalements</h1>
			<p class="text-muted-foreground mt-1">Produits et événements signalés par les utilisateurs</p>
		</div>
		<div class="text-right">
			<p class="text-2xl font-bold">{data.reports.length + data.eventReports.length}</p>
			<p class="text-sm text-muted-foreground">signalement{(data.reports.length + data.eventReports.length) > 1 ? 's' : ''} au total</p>
		</div>
	</div>

	<!-- Signalements de produits -->
	<section class="animate-in space-y-4">
		<div class="flex items-center gap-3">
			<h2 class="text-xl font-semibold">Produits</h2>
			<span class="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">{data.reports.length}</span>
		</div>

		{#if data.reports.length === 0}
			<div class="text-center py-10 bg-card rounded-lg border">
				<div class="text-3xl mb-2">🚩</div>
				<p class="text-sm text-muted-foreground">Aucun signalement de produit</p>
			</div>
		{:else}
			<div class="bg-card rounded-lg border overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-muted">
							<tr>
								<th class="px-4 py-3 text-left text-sm font-medium">Produit signalé</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Créateur</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Email créateur</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Email signaleur</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Motif</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Date</th>
								<th class="px-4 py-3"></th>
							</tr>
						</thead>
						<tbody class="divide-y">
							{#each data.reports as report}
								<tr class="hover:bg-muted/50">
									<td class="px-4 py-3 text-sm">
										<span class="font-medium">{report.product_name}</span>
									</td>
									<td class="px-4 py-3 text-sm font-medium">
										{report.creator_name}
									</td>
									<td class="px-4 py-3 text-sm text-muted-foreground">
										{#if report.creator_email}
											<a href="mailto:{report.creator_email}" class="hover:underline">{report.creator_email}</a>
										{:else}
											<span>-</span>
										{/if}
									</td>
									<td class="px-4 py-3 text-sm text-muted-foreground">
										<a href="mailto:{report.reporter_email}" class="hover:underline">{report.reporter_email}</a>
									</td>
									<td class="px-4 py-3 text-sm max-w-xs">
										<button
											type="button"
											onclick={() => toggle(report.id)}
											class="text-left w-full"
										>
											{#if openId === report.id}
												<span class="whitespace-pre-wrap">{report.reason}</span>
											{:else}
												<span class="line-clamp-2 text-muted-foreground">{report.reason}</span>
											{/if}
										</button>
									</td>
									<td class="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
										{formatDate(report.created_at)}
									</td>
									<td class="px-4 py-3">
										<a
											href={report.creator_id ? `/admin/creators/${report.creator_id}/products` : `/products/${report.product_id}`}
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input text-xs font-medium hover:bg-accent transition-colors whitespace-nowrap"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
											Voir le produit
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</section>

	<!-- Signalements d'événements -->
	<section class="animate-in space-y-4">
		<div class="flex items-center gap-3">
			<h2 class="text-xl font-semibold">Événements</h2>
			<span class="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">{data.eventReports.length}</span>
		</div>

		{#if data.eventReports.length === 0}
			<div class="text-center py-10 bg-card rounded-lg border">
				<div class="text-3xl mb-2">📅</div>
				<p class="text-sm text-muted-foreground">Aucun signalement d'événement</p>
			</div>
		{:else}
			<div class="bg-card rounded-lg border overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-muted">
							<tr>
								<th class="px-4 py-3 text-left text-sm font-medium">Événement signalé</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Organisateur</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Email organisateur</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Email signaleur</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Motif</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Date</th>
								<th class="px-4 py-3"></th>
							</tr>
						</thead>
						<tbody class="divide-y">
							{#each data.eventReports as report}
								<tr class="hover:bg-muted/50">
									<td class="px-4 py-3 text-sm">
										<span class="font-medium">{report.event_name}</span>
									</td>
									<td class="px-4 py-3 text-sm font-medium">
										{report.organizer_name}
									</td>
									<td class="px-4 py-3 text-sm text-muted-foreground">
										{#if report.organizer_email}
											<a href="mailto:{report.organizer_email}" class="hover:underline">{report.organizer_email}</a>
										{:else}
											<span>-</span>
										{/if}
									</td>
									<td class="px-4 py-3 text-sm text-muted-foreground">
										<a href="mailto:{report.reporter_email}" class="hover:underline">{report.reporter_email}</a>
									</td>
									<td class="px-4 py-3 text-sm max-w-xs">
										<button
											type="button"
											onclick={() => toggle(report.id)}
											class="text-left w-full"
										>
											{#if openId === report.id}
												<span class="whitespace-pre-wrap">{report.reason}</span>
											{:else}
												<span class="line-clamp-2 text-muted-foreground">{report.reason}</span>
											{/if}
										</button>
									</td>
									<td class="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
										{formatDate(report.created_at)}
									</td>
									<td class="px-4 py-3">
										<a
											href="/admin/events/{report.event_id}"
											
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input text-xs font-medium hover:bg-accent transition-colors whitespace-nowrap"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
											Voir l'événement
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</section>
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
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

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
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
				return { text: 'Expiré', class: 'bg-orange-100 text-orange-800' };
			case 'deleted':
				return { text: 'Supprimé', class: 'bg-red-100 text-red-800' };
			default:
				return { text: status, class: 'bg-gray-100 text-gray-800' };
		}
	}

	function isEventPast(dateStr: string): boolean {
		return new Date(dateStr) < new Date();
	}

	function handleStatusFilter(status: string) {
		const url = new URL(window.location.href);
		if (status) {
			url.searchParams.set('status', status);
		} else {
			url.searchParams.delete('status');
		}
		goto(url.toString());
	}
</script>

<div bind:this={containerRef}>
	<div class="animate-in flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">Événements</h1>
		<form
			method="POST"
			action="?/expire"
			use:enhance={() => {
				return async () => {
					await invalidateAll();
				};
			}}
		>
			<Button type="submit" variant="outline">
				{#snippet children()}
					Expirer les événements passés
				{/snippet}
			</Button>
		</form>
	</div>

	{#if form?.error}
		<div class="animate-in bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.message}
		<div
			class="animate-in bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
		>
			{form.message}
		</div>
	{/if}

	<!-- Filtres -->
	<div class="animate-in flex gap-2 mb-6">
		<button
			class="px-3 py-1 rounded-full text-sm transition-colors {!data.currentStatus
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
			onclick={() => handleStatusFilter('')}
		>
			Tous
		</button>
		<button
			class="px-3 py-1 rounded-full text-sm transition-colors {data.currentStatus === 'active'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
			onclick={() => handleStatusFilter('active')}
		>
			Actifs
		</button>
		<button
			class="px-3 py-1 rounded-full text-sm transition-colors {data.currentStatus === 'expired'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
			onclick={() => handleStatusFilter('expired')}
		>
			Expirés
		</button>
		<button
			class="px-3 py-1 rounded-full text-sm transition-colors {data.currentStatus === 'deleted'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
			onclick={() => handleStatusFilter('deleted')}
		>
			Supprimés
		</button>
	</div>

	<!-- Liste des événements -->
	{#if data.events.length === 0}
		<Card class="animate-in">
			<div class="p-8 text-center text-muted-foreground">
				<p>Aucun événement trouvé.</p>
			</div>
		</Card>
	{:else}
		<Card class="animate-in">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b">
						<tr>
							<th class="text-left p-4 text-sm font-medium">Événement</th>
							<th class="text-left p-4 text-sm font-medium">Date</th>
							<th class="text-left p-4 text-sm font-medium">Lieu</th>
							<th class="text-left p-4 text-sm font-medium">Créateur</th>
							<th class="text-left p-4 text-sm font-medium">Statut</th>
							<th class="text-left p-4 text-sm font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.events as event}
							{@const badge = getStatusBadge(event.status)}
							<tr class="border-b last:border-0 transition-colors hover:bg-muted/50">
								<td class="p-4">
									<div class="font-medium">{event.name}</div>
									{#if event.description}
										<div class="text-sm text-muted-foreground line-clamp-1">
											{event.description}
										</div>
									{/if}
								</td>
								<td class="p-4 text-sm">
									<div class:line-through={isEventPast(event.date)} class:text-muted-foreground={isEventPast(event.date)}>
										{formatDate(event.date)}
									</div>
									<div class="text-muted-foreground">{formatTime(event.date)}</div>
								</td>
								<td class="p-4 text-sm max-w-xs">
									<div class="truncate" title={event.location_text}>
										{event.location_text}
									</div>
								</td>
								<td class="p-4 text-sm">
									<div>{event.created_by_name}</div>
									{#if event.creator_email}
										<div class="text-muted-foreground text-xs">{event.creator_email}</div>
									{/if}
								</td>
								<td class="p-4">
									<span class="text-xs px-2 py-1 rounded {badge.class}">
										{badge.text}
									</span>
								</td>
								<td class="p-4">
									<div class="flex gap-2">
										{#if event.status !== 'deleted'}
											<a href="/admin/events/{event.id}">
												<Button size="sm" variant="outline">
													{#snippet children()}
														Modifier
													{/snippet}
												</Button>
											</a>
											<form
												method="POST"
												action="?/delete"
												use:enhance={() => {
													return async () => {
														await invalidateAll();
													};
												}}
											>
												<input type="hidden" name="eventId" value={event.id} />
												<Button
													type="submit"
													size="sm"
													variant="destructive"
													onclick={(e: MouseEvent) => {
														if (
															!confirm(
																`Êtes-vous sûr de vouloir supprimer l'événement "${event.name}" ?`
															)
														) {
															e.preventDefault();
														}
													}}
												>
													{#snippet children()}
														Supprimer
													{/snippet}
												</Button>
											</form>
										{:else}
											<span class="text-sm text-muted-foreground">-</span>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>

		<div class="animate-in mt-6 text-sm text-muted-foreground">
			Total : {data.events.length} événement{data.events.length > 1 ? 's' : ''}
		</div>
	{/if}
</div>

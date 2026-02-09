<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
	let containerRef: HTMLDivElement;
	let showCreateForm = $state(false);

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
</script>

<div bind:this={containerRef}>
	<div class="animate-in flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">Mes événements</h1>
		<Button onclick={() => (showCreateForm = !showCreateForm)}>
			{#snippet children()}
				{showCreateForm ? 'Annuler' : '+ Nouvel événement'}
			{/snippet}
		</Button>
	</div>

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
		<Card class="animate-in mb-6">
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
						<input
							type="text"
							id="location_text"
							name="location_text"
							required
							maxlength="500"
							class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Ex: 12 Rue de la Paix, 75002 Paris"
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

	<!-- Liste des événements -->
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
		<div class="space-y-4">
			{#each data.events as event}
				{@const badge = getStatusBadge(event.status)}
				<Card class="animate-in">
					<div class="p-6">
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-3 mb-2">
									<h3 class="text-lg font-semibold">{event.name}</h3>
									<span class="text-xs px-2 py-1 rounded {badge.class}">
										{badge.text}
									</span>
								</div>

								<div class="space-y-1 text-sm text-muted-foreground">
									<p class="flex items-center gap-2">
										<span>📅</span>
										<span class:line-through={isEventPast(event.date)}>
											{formatDate(event.date)} à {formatTime(event.date)}
										</span>
									</p>
									<p class="flex items-center gap-2">
										<span>📍</span>
										<span>{event.location_text}</span>
									</p>
								</div>

								{#if event.description}
									<p class="mt-3 text-sm">{event.description}</p>
								{/if}
							</div>

							<div class="ml-4 flex gap-2">
								<a href="/creator/events/{event.id}">
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
											if (
												!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')
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
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>

		<div class="animate-in mt-6 text-sm text-muted-foreground">
			Total : {data.events.length} événement{data.events.length > 1 ? 's' : ''}
		</div>
	{/if}
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
	let containerRef: HTMLDivElement;

	// Extraire la date et l'heure de l'événement
	const eventDate = new Date(data.event.date);
	const dateValue = eventDate.toISOString().split('T')[0];
	const timeValue = eventDate.toTimeString().slice(0, 5);

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

	const badge = getStatusBadge(data.event.status);
</script>

<div bind:this={containerRef}>
	<div class="animate-in flex items-center gap-4 mb-6">
		<a href="/admin/events" class="text-primary hover:underline"> ← Retour aux événements </a>
	</div>

	<div class="animate-in flex items-center gap-3 mb-6">
		<h1 class="text-2xl font-bold">Modifier l'événement (Admin)</h1>
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

	{#if form?.error}
		<div class="animate-in bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

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
					<input
						type="text"
						id="location_text"
						name="location_text"
						required
						maxlength="500"
						value={data.event.location_text}
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
						rows="4"
						maxlength="2000"
						class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="Décrivez l'événement..."
					>{data.event.description || ''}</textarea>
				</div>

				<div class="flex justify-end gap-3 pt-4 border-t">
					<a href="/admin/events">
						<Button variant="outline">
							{#snippet children()}
								Annuler
							{/snippet}
						</Button>
					</a>
					<Button type="submit">
						{#snippet children()}
							Enregistrer
						{/snippet}
					</Button>
				</div>
			</form>
		</div>
	</Card>

	<!-- Formulaire de suppression séparé -->
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
</div>

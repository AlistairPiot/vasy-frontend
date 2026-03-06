<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AddressAutocomplete from '$lib/components/ui/AddressAutocomplete.svelte';

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
				return { text: 'Passé', class: 'bg-gray-100 text-gray-800' };
			default:
				return { text: status, class: 'bg-gray-100 text-gray-800' };
		}
	}

	const badge = getStatusBadge(data.event.status);

	// Pièces jointes existantes
	let attachmentUrls = $state<string[]>(JSON.parse(data.event.attachment_urls || '[]'));
	let removedIndices = $state<Set<number>>(new Set());
	let newFiles = $state<File[]>([]);
	let fileInputRef: HTMLInputElement;

	function isPdf(url: string) {
		return url.includes('/raw/') || url.toLowerCase().endsWith('.pdf');
	}

	function fileName(url: string) {
		return url.split('/').pop()?.split('?')[0] || 'fichier';
	}

	function markForRemoval(i: number) {
		removedIndices = new Set([...removedIndices, i]);
	}

	function handleFileSelect(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			newFiles = [...newFiles, ...Array.from(input.files)];
			const dt = new DataTransfer();
			for (const f of newFiles) dt.items.add(f);
			fileInputRef.files = dt.files;
			input.value = '';
		}
	}

	function removeNewFile(i: number) {
		newFiles = newFiles.filter((_, idx) => idx !== i);
		const dt = new DataTransfer();
		for (const f of newFiles) dt.items.add(f);
		fileInputRef.files = dt.files;
	}
</script>

<div bind:this={containerRef}>
	<div class="animate-in mb-6">
		<a href="/creator/events" class="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
			Retour aux événements
		</a>
	</div>

	<div class="animate-in flex items-center gap-3 mb-6">
		<h1 class="text-2xl font-bold">Modifier l'événement</h1>
		<span class="text-xs px-2 py-1 rounded {badge.class}">
			{badge.text}
		</span>
	</div>

	{#if form?.success}
		<div class="animate-in bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
			Événement enregistré avec succès.
		</div>
	{/if}

	{#if form?.error}
		<div class="animate-in bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	<Card class="animate-in">
		<div class="p-6">
			<form method="POST" action="?/update" enctype="multipart/form-data" use:enhance={({ formElement }) => {
				return async ({ result, update }) => {
					await update({ reset: false });
					if (result.type === 'success') {
						removedIndices = new Set();
						newFiles = [];
						fileInputRef.files = new DataTransfer().files;
						await invalidateAll();
						attachmentUrls = JSON.parse(data.event.attachment_urls || '[]');
					}
				};
			}} class="space-y-4">
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
						placeholder="Décrivez votre événement..."
					>{data.event.description || ''}</textarea>
				</div>

				<!-- Pièces jointes -->
			<div class="pt-4 border-t space-y-3">
				<div>
					<label class="block text-sm font-medium mb-1">Pièces jointes</label>
					<p class="text-xs text-muted-foreground">Images (JPEG, PNG, WebP) ou PDF — max 20 Mo par fichier</p>
				</div>

				<!-- Input réel soumis avec le formulaire -->
				<input type="file" name="attachments" multiple bind:this={fileInputRef} class="hidden" />

				<!-- Inputs cachés pour les suppressions -->
				{#each [...removedIndices] as idx}
					<input type="hidden" name="remove_attachment" value={idx} />
				{/each}

				<!-- Pièces jointes existantes -->
				{#if attachmentUrls.some((_, i) => !removedIndices.has(i))}
					<ul class="space-y-2">
						{#each attachmentUrls as url, i}
							{#if !removedIndices.has(i)}
								<li class="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border">
									{#if isPdf(url)}
										<div class="w-9 h-9 rounded bg-red-100 flex items-center justify-center shrink-0">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
										</div>
									{:else}
										<img src={url} alt="aperçu" class="w-9 h-9 object-cover rounded shrink-0" />
									{/if}
									<span class="flex-1 text-sm truncate">{fileName(url)}</span>
									<button type="button" onclick={() => markForRemoval(i)} class="p-1 rounded hover:bg-muted transition-colors shrink-0" title="Supprimer">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
									</button>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}

				<!-- Nouveaux fichiers -->
				{#if newFiles.length > 0}
					<ul class="space-y-2">
						{#each newFiles as file, i}
							<li class="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
								<div class="w-9 h-9 rounded bg-primary/10 flex items-center justify-center shrink-0">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
								</div>
								<span class="flex-1 text-sm truncate">{file.name}</span>
								<span class="text-xs text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
								<button type="button" onclick={() => removeNewFile(i)} class="p-1 rounded hover:bg-muted transition-colors shrink-0" title="Retirer">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				<label class="flex items-center gap-2 cursor-pointer w-fit px-3 py-2 rounded-lg border border-dashed border-input hover:bg-accent transition-colors text-sm text-muted-foreground">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
					Ajouter un fichier
					<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="hidden" onchange={handleFileSelect} />
				</label>
			</div>

			<div class="flex justify-end gap-3 pt-4 border-t">
					<a href="/creator/events">
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
</div>

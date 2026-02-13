<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	// Modal state
	let showDeleteModal = $state(false);
	let productToDelete = $state<{ id: string; name: string } | null>(null);
	let deleteReason = $state('');
	let deleteFormRef: HTMLFormElement | null = $state(null);

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function formatPrice(price: number): string {
		return `${(price / 100).toFixed(2)} €`;
	}

	function formatDate(date: string): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function getFirstImage(imageUrls: string): string {
		try {
			const urls = JSON.parse(imageUrls);
			return urls[0] || '/placeholder.png';
		} catch {
			return '/placeholder.png';
		}
	}

	function openDeleteModal(product: { id: string; name: string }) {
		productToDelete = product;
		deleteReason = '';
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		showDeleteModal = false;
		productToDelete = null;
		deleteReason = '';
	}

	function confirmDelete() {
		if (!deleteReason.trim()) {
			alert('Veuillez indiquer un motif de suppression.');
			return;
		}
		if (deleteFormRef) {
			deleteFormRef.requestSubmit();
		}
	}
</script>

<div bind:this={containerRef}>
	<div class="animate-in mb-6">
		<a href="/admin/creators" class="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
			Retour aux créateurs
		</a>
	</div>

	<h1 class="animate-in text-2xl font-bold mb-2">
		Produits de {data.creator.display_name}
	</h1>
	{#if data.creator.email}
		<p class="animate-in text-sm text-muted-foreground mb-6">{data.creator.email}</p>
	{/if}

	{#if data.products.length === 0}
		<Card class="animate-in">
			<div class="p-8 text-center text-muted-foreground">
				<p>Aucun produit trouvé pour ce créateur.</p>
			</div>
		</Card>
	{:else}
		<Card class="animate-in">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b">
						<tr>
							<th class="text-left p-4 text-sm font-medium">Image</th>
							<th class="text-left p-4 text-sm font-medium">Nom</th>
							<th class="text-left p-4 text-sm font-medium">Prix</th>
							<th class="text-left p-4 text-sm font-medium">Stock</th>
							<th class="text-left p-4 text-sm font-medium">Statut</th>
							<th class="text-left p-4 text-sm font-medium">Créé le</th>
							<th class="text-left p-4 text-sm font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.products as product}
							<tr class="border-b last:border-0 transition-colors hover:bg-muted/50">
								<td class="p-4">
									<img
										src={getFirstImage(product.image_urls)}
										alt={product.name}
										class="w-16 h-16 object-cover rounded"
									/>
								</td>
								<td class="p-4">
									<div class="font-medium">{product.name}</div>
									{#if product.description}
										<div class="text-sm text-muted-foreground line-clamp-1">
											{product.description}
										</div>
									{/if}
								</td>
								<td class="p-4 text-sm font-medium">
									{formatPrice(product.price)}
								</td>
								<td class="p-4 text-sm">
									{product.stock}
								</td>
								<td class="p-4">
									{#if product.is_active}
										<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
											Actif
										</span>
									{:else}
										<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
											Inactif
										</span>
									{/if}
								</td>
								<td class="p-4 text-sm text-muted-foreground">
									{formatDate(product.created_at)}
								</td>
								<td class="p-4">
									<Button
										size="sm"
										variant="destructive"
										onclick={() => openDeleteModal({ id: product.id, name: product.name })}
									>
										{#snippet children()}
											Supprimer
										{/snippet}
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>

		<div class="animate-in mt-6 text-sm text-muted-foreground">
			Total : {data.products.length} produit{data.products.length > 1 ? 's' : ''}
		</div>
	{/if}
</div>

<!-- Modal de suppression -->
{#if showDeleteModal && productToDelete}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={closeDeleteModal}>
		<div class="bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onclick={(e) => e.stopPropagation()}>
			<h2 class="text-xl font-bold mb-4">Supprimer le produit</h2>
			<p class="text-muted-foreground mb-4">
				Vous êtes sur le point de supprimer le produit <strong>"{productToDelete.name}"</strong>.
			</p>

			<form
				method="POST"
				action="?/delete"
				bind:this={deleteFormRef}
				use:enhance={() => {
					return async () => {
						closeDeleteModal();
						await invalidateAll();
					};
				}}
			>
				<input type="hidden" name="productId" value={productToDelete.id} />

				<label class="block mb-2 font-medium">
					Motif de la suppression <span class="text-red-500">*</span>
				</label>
				<textarea
					name="reason"
					bind:value={deleteReason}
					rows="3"
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
					placeholder="Ex: Contenu inapproprié, droits d'auteur..."
					required
				></textarea>

				<div class="flex gap-3 justify-end">
					<Button variant="outline" onclick={closeDeleteModal}>
						{#snippet children()}
							Annuler
						{/snippet}
					</Button>
					<Button variant="destructive" onclick={confirmDelete}>
						{#snippet children()}
							Supprimer
						{/snippet}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

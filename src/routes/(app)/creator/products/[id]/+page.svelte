<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import {
		calculateProductCommission,
		formatPrice,
		PLATFORM_COMMISSION_PERCENT,
		STRIPE_COMMISSION_PERCENT
	} from '$lib/utils';

	let { data, form } = $props();

	// Calcul des commissions
	let commission = $derived(calculateProductCommission(data.product.price));
	let formRef: HTMLFormElement;
	let imageUrls = $state<string[]>([]);
	let uploading = $state(false);
	let showDeleteConfirm = $state(false);

	onMount(() => {
		// Parse existing images
		try {
			imageUrls = JSON.parse(data.product.image_urls);
		} catch {
			imageUrls = [];
		}

		gsap.from(formRef, {
			y: 20,
			opacity: 0,
			duration: 0.5,
			ease: 'power3.out'
		});
	});

	$effect(() => {
		if (form?.error || form?.success) {
			gsap.from('.form-message', {
				y: -10,
				opacity: 0,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	});

	async function handleImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		uploading = true;

		for (const file of files) {
			const formData = new FormData();
			formData.append('file', file);

			try {
				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData
				});
				const data = await response.json();
				if (data.url) {
					imageUrls = [...imageUrls, data.url];
				}
			} catch (err) {
				console.error('Upload failed:', err);
			}
		}

		uploading = false;
		input.value = '';
	}

	function removeImage(index: number) {
		imageUrls = imageUrls.filter((_, i) => i !== index);
	}
</script>

<div>
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">Modifier le produit</h1>
		<div class="flex gap-3">
			<form method="POST" action="?/toggleActive" use:enhance>
				<Button type="submit" variant="outline">
					{#snippet children()}
						{data.product.is_active ? 'Désactiver' : 'Activer'}
					{/snippet}
				</Button>
			</form>
			<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>
				{#snippet children()}
					Supprimer
				{/snippet}
			</Button>
		</div>
	</div>

	{#if form?.success}
		<div class="form-message bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">
			Produit mis à jour avec succès
		</div>
	{/if}

	<!-- Section des commissions -->
	<Card class="max-w-2xl p-6 mb-6 bg-blue-50 border-blue-200">
		<h3 class="font-semibold text-blue-900 mb-4">Détail des commissions</h3>
		<div class="grid grid-cols-2 gap-4 text-sm">
			<div>
				<p class="text-blue-700">Prix de vente</p>
				<p class="text-lg font-bold text-blue-900">{formatPrice(data.product.price)}</p>
			</div>
			<div>
				<p class="text-blue-700">Vous recevez</p>
				<p class="text-lg font-bold text-green-600">{formatPrice(commission.creatorEarnings)}</p>
			</div>
		</div>
		<div class="mt-4 pt-4 border-t border-blue-200">
			<p class="text-xs text-blue-600 mb-2">Détail des frais :</p>
			<div class="flex justify-between text-xs text-blue-700">
				<span>Commission plateforme ({PLATFORM_COMMISSION_PERCENT}% + 0.25€)</span>
				<span>-{formatPrice(commission.platformCommission)}</span>
			</div>
			<div class="flex justify-between text-xs text-blue-700">
				<span>Commission Stripe ({STRIPE_COMMISSION_PERCENT}% + 0.25€)</span>
				<span>-{formatPrice(commission.stripeCommission)}</span>
			</div>
			<div class="flex justify-between text-xs font-semibold text-blue-900 mt-2 pt-2 border-t border-blue-200">
				<span>Total des frais ({commission.commissionPercent}%)</span>
				<span>-{formatPrice(commission.totalCommission)}</span>
			</div>
		</div>
	</Card>

	<Card class="max-w-2xl p-6">
		<form method="POST" action="?/update" use:enhance bind:this={formRef} class="space-y-6" novalidate>
			{#if form?.error}
				<div class="form-message bg-destructive/10 text-destructive text-sm p-3 rounded-md">
					{form.error}
				</div>
			{/if}

			<div class="space-y-2">
				<label for="name" class="text-sm font-medium">Nom du produit *</label>
				<Input type="text" id="name" name="name" required value={data.product.name} />
			</div>

			<div class="space-y-2">
				<label for="description" class="text-sm font-medium">Description</label>
				<textarea
					id="description"
					name="description"
					rows={4}
					class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>{data.product.description || ''}</textarea>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<label for="price" class="text-sm font-medium">Prix (€) *</label>
					<Input
						type="number"
						id="price"
						name="price"
						required
						min="10"
						max="5000"
						step="0.01"
						value={(data.product.price / 100).toFixed(2)}
					/>
				</div>

				<div class="space-y-2">
					<label for="stock" class="text-sm font-medium">Stock *</label>
					<Input
						type="number"
						id="stock"
						name="stock"
						required
						min="0"
						value={data.product.stock}
					/>
				</div>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium">Images</label>
				<div class="border-2 border-dashed border-input rounded-md p-4">
					<input
						type="file"
						accept="image/*"
						multiple
						onchange={handleImageUpload}
						class="hidden"
						id="image-upload"
						disabled={uploading || imageUrls.length >= 5}
					/>
					<label
						for="image-upload"
						class="cursor-pointer text-center block text-sm text-muted-foreground"
					>
						{#if uploading}
							Upload en cours...
						{:else if imageUrls.length >= 5}
							Maximum 5 images atteint
						{:else}
							Cliquez pour ajouter des images (max 5)
						{/if}
					</label>
				</div>

				{#if imageUrls.length > 0}
					<div class="grid grid-cols-5 gap-2 mt-2">
						{#each imageUrls as url, i}
							<div class="relative">
								<img src={url} alt="Preview" class="w-full h-20 object-cover rounded" />
								<button
									type="button"
									onclick={() => removeImage(i)}
									class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs"
								>
									×
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />

			<div class="flex gap-4">
				<a href="/creator/products" class="flex-1">
					<Button variant="outline" class="w-full">
						{#snippet children()}
							Retour
						{/snippet}
					</Button>
				</a>
				<Button type="submit" class="flex-1">
					{#snippet children()}
						Enregistrer
					{/snippet}
				</Button>
			</div>
		</form>
	</Card>
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<Card class="max-w-md p-6">
			<h2 class="text-lg font-bold mb-4">Confirmer la suppression</h2>
			<p class="text-muted-foreground mb-6">
				Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
			</p>
			<div class="flex gap-4">
				<Button variant="outline" class="flex-1" onclick={() => (showDeleteConfirm = false)}>
					{#snippet children()}
						Annuler
					{/snippet}
				</Button>
				<form method="POST" action="?/delete" class="flex-1">
					<Button type="submit" variant="destructive" class="w-full">
						{#snippet children()}
							Supprimer
						{/snippet}
					</Button>
				</form>
			</div>
		</Card>
	</div>
{/if}

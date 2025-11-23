<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { form } = $props();
	let formRef: HTMLFormElement;
	let imageUrls = $state<string[]>([]);
	let uploading = $state(false);

	onMount(() => {
		gsap.from(formRef, {
			y: 20,
			opacity: 0,
			duration: 0.5,
			ease: 'power3.out'
		});
	});

	$effect(() => {
		if (form?.error) {
			gsap.from('.error-message', {
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
	<h1 class="text-2xl font-bold mb-6">Nouveau produit</h1>

	<Card class="max-w-2xl p-6">
		<form method="POST" use:enhance bind:this={formRef} class="space-y-6" novalidate>
			{#if form?.error}
				<div class="error-message bg-destructive/10 text-destructive text-sm p-3 rounded-md">
					{form.error}
				</div>
			{/if}

			<div class="space-y-2">
				<label for="name" class="text-sm font-medium">Nom du produit *</label>
				<Input type="text" id="name" name="name" required placeholder="Mon super produit" />
			</div>

			<div class="space-y-2">
				<label for="description" class="text-sm font-medium">Description</label>
				<textarea
					id="description"
					name="description"
					rows={4}
					class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					placeholder="Décrivez votre produit..."
				></textarea>
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
						placeholder="25.00"
					/>
				</div>

				<div class="space-y-2">
					<label for="stock" class="text-sm font-medium">Stock *</label>
					<Input type="number" id="stock" name="stock" required min="0" value="0" />
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
							Annuler
						{/snippet}
					</Button>
				</a>
				<Button type="submit" class="flex-1">
					{#snippet children()}
						Créer le produit
					{/snippet}
				</Button>
			</div>
		</form>
	</Card>
</div>

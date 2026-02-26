<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { form, data } = $props();
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

	let dragIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	function onDragStart(i: number) {
		dragIndex = i;
	}

	function onDragOver(e: DragEvent, i: number) {
		e.preventDefault();
		dragOverIndex = i;
	}

	function onDrop(i: number) {
		if (dragIndex === null || dragIndex === i) return;
		const arr = [...imageUrls];
		const [item] = arr.splice(dragIndex, 1);
		arr.splice(i, 0, item);
		imageUrls = arr;
		dragIndex = null;
		dragOverIndex = null;
	}

	function onDragEnd() {
		dragIndex = null;
		dragOverIndex = null;
	}
</script>

<div>
	<h1 class="text-2xl font-bold mb-6">Nouveau produit</h1>

	{#if !data.stripeStatus.onboarding_complete}
		<Card class="max-w-2xl p-6 mb-6 border-orange-500 bg-orange-50">
			<div class="flex gap-4 items-start">
				<svg
					class="w-6 h-6 text-orange-600 shrink-0 mt-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<div class="flex-1">
					<h3 class="font-semibold text-orange-900 mb-2">Configuration Stripe requise</h3>
					<p class="text-sm text-orange-800 mb-4">
						Vous devez configurer votre compte Stripe avant de pouvoir créer un produit. Cela
						permet de recevoir les paiements de vos clients.
					</p>
					<a href="/creator/profile#stripe">
						<Button size="sm" class="bg-orange-600 hover:bg-orange-700 text-white">
							{#snippet children()}
								Configurer Stripe
							{/snippet}
						</Button>
					</a>
				</div>
			</div>
		</Card>
	{/if}

	<Card class="max-w-2xl p-6 {!data.stripeStatus.onboarding_complete ? 'opacity-50 pointer-events-none' : ''}">
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
				<label class="text-sm font-medium">Images *</label>
				<div class="border-2 border-dashed rounded-md p-4 {imageUrls.length === 0 && form?.error?.includes('image') ? 'border-destructive' : 'border-input'}">
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
					<p class="text-xs text-muted-foreground mt-2">Faites glisser pour réorganiser. La première image est la principale.</p>
					<div class="grid grid-cols-5 gap-2 mt-1">
						{#each imageUrls as url, i}
							<div
								class="relative cursor-grab active:cursor-grabbing transition-opacity rounded
									{dragIndex === i ? 'opacity-40' : ''}
									{dragOverIndex === i && dragIndex !== i ? 'ring-2 ring-primary' : ''}"
								draggable="true"
								ondragstart={() => onDragStart(i)}
								ondragover={(e) => onDragOver(e, i)}
								ondrop={() => onDrop(i)}
								ondragend={onDragEnd}
							>
								<img src={url} alt="Preview" class="w-full h-20 object-cover rounded" />
								{#if i === 0}
									<span class="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">Principale</span>
								{/if}
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

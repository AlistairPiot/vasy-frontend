<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

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

	function enhanceDelete(productName: string) {
		return async ({ cancel }: any) => {
			if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${productName}" ?\n\nCette action est irréversible.`)) {
				cancel();
				return;
			}

			return async () => {
				await invalidateAll();
			};
		};
	}
</script>

<div bind:this={containerRef}>
	<div class="animate-in flex items-center gap-4 mb-6">
		<a href="/admin/creators" class="text-primary hover:underline">
			← Retour aux créateurs
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
									<form method="POST" action="?/delete" use:enhance={enhanceDelete(product.name)}>
										<input type="hidden" name="productId" value={product.id} />
										<Button size="sm" variant="destructive">
											{#snippet children()}
												Supprimer
											{/snippet}
										</Button>
									</form>
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

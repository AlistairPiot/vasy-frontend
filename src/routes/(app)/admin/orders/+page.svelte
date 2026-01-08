<script lang="ts">
	let { data } = $props();

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			'en_attente': 'En attente',
			'validee': 'Validée',
			'expediee': 'Expédiée',
			'refusee': 'Refusée',
			'annulee': 'Annulée'
		};
		return labels[status] || status;
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			'en_attente': 'bg-yellow-100 text-yellow-800',
			'validee': 'bg-blue-100 text-blue-800',
			'expediee': 'bg-green-100 text-green-800',
			'refusee': 'bg-red-100 text-red-800',
			'annulee': 'bg-gray-100 text-gray-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	}

	// Grouper les commandes par statut
	let ordersEnAttente = $derived(data.orders.filter((o: any) => o.status === 'en_attente'));
	let ordersValidees = $derived(data.orders.filter((o: any) => o.status === 'validee'));
	let ordersExpediees = $derived(data.orders.filter((o: any) => o.status === 'expediee'));
	let ordersAutres = $derived(data.orders.filter((o: any) => ['refusee', 'annulee'].includes(o.status)));
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Commandes</h1>
		<p class="text-muted-foreground mt-1">Gérer toutes les commandes de la plateforme</p>
	</div>

	<!-- Statistiques rapides -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
			<div class="text-2xl font-bold text-yellow-800">{ordersEnAttente.length}</div>
			<div class="text-sm text-yellow-600">En attente</div>
		</div>
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
			<div class="text-2xl font-bold text-blue-800">{ordersValidees.length}</div>
			<div class="text-sm text-blue-600">Validées</div>
		</div>
		<div class="bg-green-50 border border-green-200 rounded-lg p-4">
			<div class="text-2xl font-bold text-green-800">{ordersExpediees.length}</div>
			<div class="text-sm text-green-600">Expédiées</div>
		</div>
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
			<div class="text-2xl font-bold text-gray-800">{data.orders.length}</div>
			<div class="text-sm text-gray-600">Total</div>
		</div>
	</div>

	<!-- Liste des commandes -->
	{#if data.orders.length === 0}
		<div class="text-center py-12 bg-card rounded-lg border">
			<p class="text-muted-foreground">Aucune commande pour le moment</p>
		</div>
	{:else}
		<div class="bg-card rounded-lg border overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-muted">
						<tr>
							<th class="px-4 py-3 text-left text-sm font-medium">Commande</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Client</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Produits</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Montant</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Date</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Suivi</th>
						</tr>
					</thead>
					<tbody class="divide-y">
						{#each data.orders as order}
							<tr class="hover:bg-muted/50">
								<td class="px-4 py-3 text-sm">
									<span class="font-mono">#{order.id.slice(0, 8)}</span>
								</td>
								<td class="px-4 py-3 text-sm">
									<div>
										<div class="font-medium">{order.shipping_name}</div>
										<div class="text-muted-foreground text-xs">
											{order.shipping_address}<br/>
											{order.shipping_postal_code} {order.shipping_city}
										</div>
									</div>
								</td>
								<td class="px-4 py-3 text-sm">
									<div class="space-y-1">
										{#each order.items as item}
											<div class="text-xs">
												{item.product_name} x{item.quantity}
											</div>
										{/each}
									</div>
								</td>
								<td class="px-4 py-3 text-sm font-medium">
									{formatPrice(order.total_amount)}
								</td>
								<td class="px-4 py-3 text-sm">
									<span class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(order.status)}">
										{getStatusLabel(order.status)}
									</span>
								</td>
								<td class="px-4 py-3 text-sm text-muted-foreground">
									{formatDate(order.created_at)}
								</td>
								<td class="px-4 py-3 text-sm">
									{#if order.tracking_number}
										<span class="font-mono text-xs bg-green-50 px-2 py-1 rounded">
											{order.tracking_number}
										</span>
									{:else}
										<span class="text-muted-foreground text-xs">-</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

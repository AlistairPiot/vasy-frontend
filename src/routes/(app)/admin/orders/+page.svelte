<script lang="ts">
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';

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

	const STATUS_ORDER: Record<string, number> = {
		'en_attente': 0,
		'validee': 1,
		'expediee': 2,
		'refusee': 3,
		'annulee': 4
	};

	// Compteurs par statut
	let ordersEnAttente = $derived(data.orders.filter((o: any) => o.status === 'en_attente'));
	let ordersValidees = $derived(data.orders.filter((o: any) => o.status === 'validee'));
	let ordersExpediees = $derived(data.orders.filter((o: any) => o.status === 'expediee'));

	// Filtre actif : null = tous
	let activeFilter = $state<string | null>(null);

	// Commandes filtrées et triées
	const filteredOrders = $derived(() => {
		const orders = activeFilter
			? data.orders.filter((o: any) => o.status === activeFilter)
			: [...data.orders];

		return orders.sort((a: any, b: any) => {
			const statusDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
			if (statusDiff !== 0) return statusDiff;
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});
	});
</script>

<div class="space-y-6" bind:this={containerRef}>
	<div class="animate-in">
		<h1 class="text-3xl font-bold">Commandes</h1>
		<p class="text-muted-foreground mt-1">Gérer toutes les commandes de la plateforme</p>
	</div>

	<!-- Statistiques / Filtres rapides -->
	<div class="animate-in grid grid-cols-1 md:grid-cols-4 gap-4">
		<button
			type="button"
			onclick={() => activeFilter = activeFilter === 'en_attente' ? null : 'en_attente'}
			class="text-left bg-yellow-50 border rounded-lg p-4 transition-all {activeFilter === 'en_attente' ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-yellow-200 hover:border-yellow-400'}"
		>
			<div class="text-2xl font-bold text-yellow-800">{ordersEnAttente.length}</div>
			<div class="text-sm text-yellow-600">En attente</div>
		</button>
		<button
			type="button"
			onclick={() => activeFilter = activeFilter === 'validee' ? null : 'validee'}
			class="text-left bg-blue-50 border rounded-lg p-4 transition-all {activeFilter === 'validee' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-200 hover:border-blue-400'}"
		>
			<div class="text-2xl font-bold text-blue-800">{ordersValidees.length}</div>
			<div class="text-sm text-blue-600">Validées</div>
		</button>
		<button
			type="button"
			onclick={() => activeFilter = activeFilter === 'expediee' ? null : 'expediee'}
			class="text-left bg-green-50 border rounded-lg p-4 transition-all {activeFilter === 'expediee' ? 'border-green-500 ring-2 ring-green-300' : 'border-green-200 hover:border-green-400'}"
		>
			<div class="text-2xl font-bold text-green-800">{ordersExpediees.length}</div>
			<div class="text-sm text-green-600">Expédiées</div>
		</button>
		<button
			type="button"
			onclick={() => activeFilter = null}
			class="text-left bg-gray-50 border rounded-lg p-4 transition-all {activeFilter === null ? 'border-gray-500 ring-2 ring-gray-300' : 'border-gray-200 hover:border-gray-400'}"
		>
			<div class="text-2xl font-bold text-gray-800">{data.orders.length}</div>
			<div class="text-sm text-gray-600">Toutes</div>
		</button>
	</div>

	<!-- Filtre statut supplémentaire (refusée / annulée) -->
	<div class="animate-in flex items-center gap-2 flex-wrap">
		<span class="text-sm text-muted-foreground">Filtrer :</span>
		{#each [
			{ value: null, label: 'Toutes' },
			{ value: 'en_attente', label: 'En attente' },
			{ value: 'validee', label: 'Validées' },
			{ value: 'expediee', label: 'Expédiées' },
			{ value: 'refusee', label: 'Refusées' }
		] as f}
			<button
				type="button"
				onclick={() => activeFilter = f.value}
				class="px-3 py-1 rounded-full text-xs font-medium border transition-colors {activeFilter === f.value
					? 'bg-foreground text-background border-foreground'
					: 'bg-background text-muted-foreground border-border hover:border-foreground'}"
			>
				{f.label}
			</button>
		{/each}
	</div>

	<!-- Liste des commandes -->
	{#if filteredOrders().length === 0}
		<div class="text-center py-12 bg-card rounded-lg border">
			<p class="text-muted-foreground">Aucune commande{activeFilter ? ' pour ce statut' : ''}</p>
		</div>
	{:else}
		<div class="animate-in bg-card rounded-lg border overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-muted">
						<tr>
							<th class="px-4 py-3 text-left text-sm font-medium">Commande</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Créateur</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Client</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Produits</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Montant</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Date</th>
							<th class="px-4 py-3 text-left text-sm font-medium">Suivi</th>
						</tr>
					</thead>
					<tbody class="divide-y">
						{#each filteredOrders() as order}
							<tr class="hover:bg-muted/50">
								<td class="px-4 py-3 text-sm">
									<span class="font-mono">#{order.id.slice(0, 8)}</span>
								</td>
								<td class="px-4 py-3 text-sm">
									{#if order.creator_name}
										<div>
											<div class="font-medium">{order.creator_name}</div>
											{#if order.creator_email}
												<div class="text-muted-foreground text-xs">{order.creator_email}</div>
											{/if}
										</div>
									{:else}
										<span class="text-muted-foreground text-xs">-</span>
									{/if}
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

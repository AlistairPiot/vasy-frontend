<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let containerRef: HTMLDivElement;
	let orders = $state<any[]>([
		// Données stub - à remplacer par des données réelles du backend
		{
			id: '1',
			date: new Date('2025-01-15'),
			total: 12999,
			status: 'delivered',
			items: [
				{ name: 'Produit 1', price: 5999, quantity: 1 },
				{ name: 'Produit 2', price: 7000, quantity: 1 }
			]
		}
	]);

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	function getStatusLabel(status: string): string {
		const labels: { [key: string]: string } = {
			pending: 'En attente',
			processing: 'En cours de traitement',
			shipped: 'Expédié',
			delivered: 'Livré',
			cancelled: 'Annulé'
		};
		return labels[status] || status;
	}

	function getStatusColor(status: string): string {
		const colors: { [key: string]: string } = {
			pending: 'bg-yellow-100 text-yellow-800',
			processing: 'bg-blue-100 text-blue-800',
			shipped: 'bg-cyan-100 text-cyan-800',
			delivered: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800'
		};
		return colors[status] || 'bg-muted text-muted-foreground';
	}
</script>

<div class="space-y-6" bind:this={containerRef}>
	<div class="animate-in">
		<h1 class="text-3xl font-bold mb-2">Mes commandes</h1>
		<p class="text-muted-foreground">Historique de vos achats sur Vasy</p>
	</div>

	{#if orders.length === 0}
		<Card class="p-8 text-center animate-in">
			<p class="text-muted-foreground mb-6">Vous n'avez pas encore de commandes</p>
			<a href="/products">
				<Button>
					{#snippet children()}
						Découvrir nos produits
					{/snippet}
				</Button>
			</a>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each orders as order, index (order.id)}
				<Card class="p-6 animate-in hover:shadow-md transition-shadow" style={`animation-delay: ${index * 0.1}s`}>
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="font-semibold">Commande #{order.id}</h3>
							<p class="text-sm text-muted-foreground">
								{order.date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
							</p>
						</div>
						<span class={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
							{getStatusLabel(order.status)}
						</span>
					</div>

					<div class="border-t pt-4 mb-4">
						{#each order.items as item}
							<div class="flex justify-between text-sm mb-2">
								<span class="text-muted-foreground">
									{item.name} × {item.quantity}
								</span>
								<span class="font-semibold">{formatPrice(item.price * item.quantity)}</span>
							</div>
						{/each}
					</div>

					<div class="flex justify-between items-center">
						<div class="text-right">
							<p class="text-sm text-muted-foreground">Total</p>
							<p class="text-xl font-bold text-primary">{formatPrice(order.total)}</p>
						</div>
						<a href={`/orders/${order.id}`}>
							<Button variant="outline" size="sm">
								{#snippet children()}
									Détails
								{/snippet}
							</Button>
						</a>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

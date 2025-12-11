<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
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
</script>

<div bind:this={containerRef}>
	<h1 class="animate-in text-2xl font-bold mb-6">Statistiques</h1>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Card class="animate-in p-6">
			<p class="text-sm text-muted-foreground mb-1">Créateurs</p>
			<p class="text-3xl font-bold">{data.stats.total_creators}</p>
		</Card>

		<Card class="animate-in p-6">
			<p class="text-sm text-muted-foreground mb-1">Clients</p>
			<p class="text-3xl font-bold">{data.stats.total_clients}</p>
		</Card>

		<Card class="animate-in p-6">
			<p class="text-sm text-muted-foreground mb-1">Transactions</p>
			<p class="text-3xl font-bold">{data.stats.total_transactions}</p>
		</Card>

		<Card class="animate-in p-6">
			<p class="text-sm text-muted-foreground mb-1">Chiffre d'affaires</p>
			<p class="text-3xl font-bold">{formatPrice(data.stats.total_revenue)}</p>
		</Card>

		<Card class="animate-in p-6">
			<p class="text-sm text-muted-foreground mb-1">Commissions</p>
			<p class="text-3xl font-bold">{formatPrice(data.stats.total_commission)}</p>
		</Card>
	</div>
</div>

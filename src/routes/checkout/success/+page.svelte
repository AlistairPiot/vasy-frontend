<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Header from '$lib/components/Header.svelte';

	let { data } = $props();

	let orderId = $derived($page.url.searchParams.get('order_id'));
</script>

<div class="min-h-screen bg-background">
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8 pt-24">
		<div class="max-w-2xl mx-auto text-center">
			<Card class="p-8">
				<div class="mb-6">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>

				<h1 class="text-3xl font-bold mb-4">Commande confirmée !</h1>

				<p class="text-muted-foreground mb-2">
					Votre commande #{orderId?.slice(0, 8)} a été créée avec succès.
				</p>

				<p class="text-sm text-muted-foreground mb-6">
					Le créateur a été notifié et va examiner votre commande. Vous ne serez débité que lorsque le créateur expédiera votre commande avec un numéro de suivi.
				</p>

				<div class="flex gap-4 justify-center">
					<a href="/dashboard">
						<Button>
							{#snippet children()}
								Voir mes commandes
							{/snippet}
						</Button>
					</a>
					<a href="/products">
						<Button variant="outline">
							{#snippet children()}
								Continuer mes achats
							{/snippet}
						</Button>
					</a>
				</div>
			</Card>
		</div>
	</main>
</div>

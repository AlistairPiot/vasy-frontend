<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<header class="border-b">
		<div class="container mx-auto px-4 py-4 flex justify-between items-center">
			<a href="/" class="text-xl font-bold">Vasy</a>
			<div class="flex items-center gap-4">
				<span class="text-sm text-muted-foreground">{data.user.email}</span>
				<form action="/logout" method="POST">
					<button type="submit" class="text-sm text-muted-foreground hover:text-foreground">
						Déconnexion
					</button>
				</form>
			</div>
		</div>
	</header>

	<main class="container mx-auto px-4 py-8">
		<h1 class="animate-in text-3xl font-bold mb-8">Tableau de bord</h1>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#if data.user.role === 'creator'}
				<Card class="animate-in p-6">
					<h3 class="font-semibold mb-2">Mes produits</h3>
					<p class="text-muted-foreground text-sm">Gérez vos produits en vente</p>
				</Card>
				<Card class="animate-in p-6">
					<h3 class="font-semibold mb-2">Mes ventes</h3>
					<p class="text-muted-foreground text-sm">Historique de vos ventes</p>
				</Card>
				<Card class="animate-in p-6">
					<h3 class="font-semibold mb-2">Stripe</h3>
					<p class="text-muted-foreground text-sm">Configurez vos paiements</p>
				</Card>
			{:else if data.user.role === 'admin'}
				<Card class="animate-in p-6">
					<h3 class="font-semibold mb-2">Créateurs</h3>
					<p class="text-muted-foreground text-sm">Gérez les créateurs</p>
				</Card>
				<Card class="animate-in p-6">
					<h3 class="font-semibold mb-2">Invitations</h3>
					<p class="text-muted-foreground text-sm">Invitez de nouveaux créateurs</p>
				</Card>
				<Card class="animate-in p-6">
					<h3 class="font-semibold mb-2">Statistiques</h3>
					<p class="text-muted-foreground text-sm">Vue globale de la plateforme</p>
				</Card>
			{:else}
				<Card class="animate-in p-6">
					<h3 class="font-semibold mb-2">Mes achats</h3>
					<p class="text-muted-foreground text-sm">Historique de vos commandes</p>
				</Card>
				<Card class="animate-in p-6">
					<h3 class="font-semibold mb-2">Mon profil</h3>
					<p class="text-muted-foreground text-sm">Gérez vos informations</p>
				</Card>
			{/if}
		</div>
	</main>
</div>

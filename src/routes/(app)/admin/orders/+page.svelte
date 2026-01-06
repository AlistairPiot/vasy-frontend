<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';

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
</script>

<div bind:this={containerRef}>
	<h1 class="animate-in text-2xl font-bold mb-6">Commandes</h1>

	<Card class="animate-in p-6">
		<p class="text-sm text-muted-foreground mb-6">
			Visualisez et gérez toutes les commandes de la plateforme.
		</p>

		<div class="space-y-6">
			<!-- Statistiques rapides -->
			<div class="grid grid-cols-3 gap-4 pb-6 border-b">
				<div class="text-center">
					<div class="text-3xl font-bold text-orange-600 mb-1">0</div>
					<div class="text-sm text-muted-foreground">En attente</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-blue-600 mb-1">0</div>
					<div class="text-sm text-muted-foreground">Validées</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-green-600 mb-1">0</div>
					<div class="text-sm text-muted-foreground">Expédiées</div>
				</div>
			</div>

			<!-- Liste des commandes -->
			<div>
				<h2 class="text-lg font-semibold mb-4">Toutes les commandes</h2>

				<div class="text-center py-12">
					<div class="text-muted-foreground text-sm">
						Aucune commande pour le moment
					</div>
					<p class="text-xs text-muted-foreground mt-2">
						Les commandes apparaîtront ici une fois le système de paiement configuré
					</p>
				</div>
			</div>
		</div>
	</Card>
</div>

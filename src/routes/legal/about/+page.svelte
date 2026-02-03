<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
</script>

<div class="max-w-3xl mx-auto">
	<h1 class="text-4xl font-bold mb-8">À propos de nous</h1>

	<Card class="p-8">
		<div class="prose prose-sm max-w-none">
			<h2 class="text-2xl font-semibold mb-4">Qui sommes-nous ?</h2>
			<p class="mb-4">
				Vasy est une plateforme innovante qui connecte les créateurs indépendants avec des clients
				à la recherche de produits uniques et authentiques.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">Notre mission</h2>
			<p class="mb-4">
				Notre mission est de faciliter la vente et l'achat de créations originales tout en offrant
				une expérience sécurisée et transparente pour tous nos utilisateurs.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">Nos valeurs</h2>
			<ul class="list-disc pl-6 mb-4">
				<li class="mb-2">Authenticité : Nous valorisons les créations originales</li>
				<li class="mb-2">Transparence : Des transactions claires et sécurisées</li>
				<li class="mb-2">Communauté : Soutenir les créateurs indépendants</li>
				<li class="mb-2">Qualité : Une sélection rigoureuse des créateurs</li>
			</ul>

			<h2 class="text-2xl font-semibold mb-4 mt-8">Contact</h2>
			<p class="mb-4">
				Pour toute question, n'hésitez pas à nous contacter à :
				<a href="mailto:vasy.creation.contact@gmail.com" class="text-primary hover:underline">vasy.creation.contact@gmail.com</a>
			</p>
		</div>
	</Card>
</div>

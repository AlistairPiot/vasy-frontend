<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
</script>

<div class="max-w-3xl mx-auto">
	<h1 class="text-4xl font-bold mb-8">Mentions Légales</h1>

	<Card class="p-8">
		<div class="prose prose-sm max-w-none">
			<h2 class="text-2xl font-semibold mb-4">1. Éditeur du site</h2>
			<p class="mb-4">
				<strong>Raison sociale :</strong> Vasy<br/>
				<strong>Siège social :</strong> [À compléter]<br/>
				<strong>Email :</strong> <a href="mailto:vasy.creation.contact@gmail.com" class="text-primary hover:underline">vasy.creation.contact@gmail.com</a><br/>
				<strong>SIRET :</strong> [À compléter]<br/>
				<strong>Capital social :</strong> [À compléter]
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">2. Directeur de la publication</h2>
			<p class="mb-4">
				[À compléter]
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">3. Hébergement</h2>
			<p class="mb-4">
				Le site est hébergé par :<br/>
				[Nom de l'hébergeur]<br/>
				[Adresse de l'hébergeur]<br/>
				[Téléphone de l'hébergeur]
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">4. Protection des données</h2>
			<p class="mb-4">
				Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au RGPD,
				vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
			</p>
			<p class="mb-4">
				Pour exercer ce droit, contactez-nous à :
				<a href="mailto:vasy.creation.contact@gmail.com" class="text-primary hover:underline">vasy.creation.contact@gmail.com</a>
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">5. Propriété intellectuelle</h2>
			<p class="mb-4">
				L'ensemble du contenu de ce site (textes, images, vidéos) est protégé par le droit d'auteur.
				Toute reproduction, même partielle, est interdite sans autorisation préalable.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">6. Crédits</h2>
			<p class="mb-4">
				Design et développement : Vasy<br/>
				Technologies : SvelteKit, FastAPI, PostgreSQL, Stripe
			</p>
		</div>
	</Card>
</div>

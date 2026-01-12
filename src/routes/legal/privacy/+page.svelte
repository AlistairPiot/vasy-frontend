<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
</script>

<div class="max-w-3xl mx-auto">
	<h1 class="text-4xl font-bold mb-8">Politique de Confidentialité</h1>

	<Card class="p-8">
		<div class="prose prose-sm max-w-none">
			<p class="text-sm text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

			<h2 class="text-2xl font-semibold mb-4">1. Collecte des données</h2>
			<p class="mb-4">
				Nous collectons les données suivantes :
			</p>
			<ul class="list-disc pl-6 mb-4">
				<li class="mb-2">Informations d'identification (nom, email)</li>
				<li class="mb-2">Informations de paiement (via Stripe)</li>
				<li class="mb-2">Adresses de livraison</li>
				<li class="mb-2">Historique des commandes</li>
			</ul>

			<h2 class="text-2xl font-semibold mb-4 mt-8">2. Utilisation des données</h2>
			<p class="mb-4">
				Vos données sont utilisées pour :
			</p>
			<ul class="list-disc pl-6 mb-4">
				<li class="mb-2">Gérer votre compte et vos commandes</li>
				<li class="mb-2">Traiter les paiements</li>
				<li class="mb-2">Améliorer nos services</li>
				<li class="mb-2">Communiquer avec vous</li>
			</ul>

			<h2 class="text-2xl font-semibold mb-4 mt-8">3. Protection des données</h2>
			<p class="mb-4">
				Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre
				tout accès, modification ou divulgation non autorisé.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">4. Vos droits</h2>
			<p class="mb-4">
				Conformément au RGPD, vous disposez des droits suivants :
			</p>
			<ul class="list-disc pl-6 mb-4">
				<li class="mb-2">Droit d'accès à vos données</li>
				<li class="mb-2">Droit de rectification</li>
				<li class="mb-2">Droit à l'effacement</li>
				<li class="mb-2">Droit à la portabilité</li>
			</ul>

			<h2 class="text-2xl font-semibold mb-4 mt-8">5. Cookies</h2>
			<p class="mb-4">
				Notre site utilise des cookies essentiels pour son fonctionnement. Vous pouvez les désactiver
				dans les paramètres de votre navigateur.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">6. Contact</h2>
			<p class="mb-4">
				Pour exercer vos droits ou pour toute question :
				<a href="mailto:privacy@vasy.fr" class="text-primary hover:underline">privacy@vasy.fr</a>
			</p>
		</div>
	</Card>
</div>

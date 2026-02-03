<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
</script>

<div class="max-w-3xl mx-auto">
	<h1 class="text-4xl font-bold mb-8">Conditions Générales de Vente (CGV)</h1>

	<Card class="p-8">
		<div class="prose prose-sm max-w-none">
			<p class="text-sm text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

			<h2 class="text-2xl font-semibold mb-4">1. Objet</h2>
			<p class="mb-4">
				Les présentes conditions générales de vente régissent les relations contractuelles entre Vasy
				et ses utilisateurs dans le cadre de l'utilisation de la plateforme.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">2. Prix</h2>
			<p class="mb-4">
				Les prix des produits sont indiqués en euros TTC. Les frais de livraison sont à la charge de l'acheteur.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">3. Commande et paiement</h2>
			<p class="mb-4">
				Le paiement est sécurisé via Stripe. Le débit intervient uniquement après l'expédition du produit
				par le créateur.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">4. Livraison</h2>
			<p class="mb-4">
				Les délais de livraison sont indicatifs et dépendent du créateur. Un numéro de suivi est fourni
				lors de l'expédition.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">5. Droit de rétractation</h2>
			<p class="mb-4">
				Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours pour exercer
				votre droit de rétractation.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">6. Réclamations</h2>
			<p class="mb-4">
				Pour toute réclamation, contactez-nous à :
				<a href="mailto:vasy.creation.contact@gmail.com" class="text-primary hover:underline">vasy.creation.contact@gmail.com</a>
			</p>
		</div>
	</Card>
</div>

<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
</script>

<div class="max-w-3xl mx-auto">
	<h1 class="text-4xl font-bold mb-8">Conditions Générales d'Utilisation (CGU)</h1>

	<Card class="p-8">
		<div class="prose prose-sm max-w-none">
			<p class="text-sm text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

			<h2 class="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
			<p class="mb-4">
				L'utilisation de la plateforme Vasy implique l'acceptation pleine et entière des présentes
				conditions générales d'utilisation.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">2. Inscription</h2>
			<p class="mb-4">
				Pour utiliser certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable
				de la confidentialité de vos identifiants.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">3. Obligations des utilisateurs</h2>
			<p class="mb-4">
				Les utilisateurs s'engagent à :
			</p>
			<ul class="list-disc pl-6 mb-4">
				<li class="mb-2">Respecter les lois en vigueur</li>
				<li class="mb-2">Ne pas porter atteinte aux droits de tiers</li>
				<li class="mb-2">Fournir des informations exactes</li>
				<li class="mb-2">Ne pas usurper l'identité d'autrui</li>
			</ul>

			<h2 class="text-2xl font-semibold mb-4 mt-8">4. Propriété intellectuelle</h2>
			<p class="mb-4">
				Tous les contenus présents sur la plateforme sont protégés par le droit d'auteur.
				Toute reproduction est interdite sans autorisation.
			</p>

			<h2 class="text-2xl font-semibold mb-4 mt-8">5. Responsabilité</h2>
			<p class="mb-4">
				Vasy agit en tant qu'intermédiaire entre créateurs et clients. Les transactions sont effectuées
				sous la responsabilité des parties.
			</p>
		</div>
	</Card>
</div>

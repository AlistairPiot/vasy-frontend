<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();
</script>

<div class="min-h-screen bg-background">
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-24 flex justify-center">
		<Card class="w-full max-w-md p-8 text-center">
			{#if data.success}
				<div class="text-green-600 mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
				</div>
				<h1 class="text-2xl font-bold mb-2">Email mis à jour !</h1>
				<p class="text-muted-foreground mb-6">
					Votre adresse email a été modifiée avec succès. Reconnectez-vous avec votre nouvelle adresse.
				</p>
				<a
					href="/login"
					class="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
				>
					Se connecter
				</a>
			{:else}
				<div class="text-red-500 mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
						<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
					</svg>
				</div>
				<h1 class="text-2xl font-bold mb-2">Lien invalide</h1>
				<p class="text-muted-foreground mb-6">{data.error}</p>
				<a
					href="/profile"
					class="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
				>
					Retour au profil
				</a>
			{/if}
		</Card>
	</main>
</div>

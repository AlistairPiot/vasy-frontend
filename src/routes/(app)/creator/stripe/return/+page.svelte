<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(async () => {
		// Synchronise le statut directement depuis l'API Stripe (ne dépend pas du webhook)
		try {
			await fetch('/api/stripe/connect/sync', { method: 'POST' });
		} catch {
			// Si le sync échoue, on redirige quand même
		}
		goto('/creator/profile');
	});
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center space-y-4">
		<div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
			<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		</div>
		<h1 class="text-xl font-semibold">Configuration terminée</h1>
		<p class="text-muted-foreground">Redirection vers votre profil...</p>
	</div>
</div>

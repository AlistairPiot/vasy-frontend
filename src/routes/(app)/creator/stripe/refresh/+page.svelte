<script lang="ts">
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function retry() {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/stripe/onboarding-link', { method: 'POST' });
			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				error = data.detail || 'Erreur lors de la génération du lien';
			}
		} catch {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center space-y-4 max-w-sm mx-auto px-4">
		<div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
			<svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</div>
		<h1 class="text-xl font-semibold">Lien expiré</h1>
		<p class="text-muted-foreground text-sm">Le lien de configuration a expiré. Cliquez ci-dessous pour en générer un nouveau.</p>

		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}

		<button
			onclick={retry}
			disabled={loading}
			class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
		>
			{loading ? 'Chargement...' : 'Relancer la configuration'}
		</button>
	</div>
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';

	let { data, children } = $props();

	const navItems = [
		{ href: '/creator/products', label: 'Mes produits' },
		{ href: '/creator/events', label: 'Mes événements' },
		{ href: '/creator/profile', label: 'Mon profil' }
	];
</script>

<div class="min-h-screen bg-background">
	<Header user={data.user} />

	<div class="container mx-auto px-4 py-6 pt-24">
		<nav class="flex gap-4 mb-8 border-b pb-4">
			{#each navItems as item}
				<a
					href={item.href}
					class="px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname.startsWith(
						item.href
					)
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		{@render children()}
	</div>
</div>

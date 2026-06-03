<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import ConfirmModal from '$lib/components/ui/ConfirmModal.svelte';

	let { data, children } = $props();

	const navItems = [
		{ href: '/admin/stats', label: 'Statistiques' },
		{ href: '/admin/invitations', label: 'Invitations' },
		{ href: '/admin/creators', label: 'Créateurs' },
		{ href: '/admin/users', label: 'Utilisateurs' },
		{ href: '/admin/orders', label: 'Commandes' },
		{ href: '/admin/commissions', label: 'Commissions' },
		{ href: '/admin/events', label: 'Événements' },
		{ href: '/admin/signalements', label: 'Signalements' },
		{ href: '/admin/email', label: 'Emails' }
	];
</script>

<div class="min-h-screen bg-background">
	<Header user={data.user} />

	<div class="container mx-auto px-4 md:px-6 py-6 pt-24">
		<nav class="flex gap-1 mb-8 border-b pb-4 overflow-x-auto">
			{#each navItems as item}
				<a
					href={item.href}
					class="px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 {$page.url.pathname.startsWith(
						item.href
					)
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{item.label}
				</a>
			{/each}
			<div class="ml-auto shrink-0">
				<a
					href="/products"
					class="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 whitespace-nowrap"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
					Page produits
				</a>
			</div>
		</nav>

		{@render children()}
	</div>
</div>

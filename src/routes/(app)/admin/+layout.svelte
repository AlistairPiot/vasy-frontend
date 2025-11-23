<script lang="ts">
	import { page } from '$app/stores';

	let { data, children } = $props();

	const navItems = [
		{ href: '/admin/stats', label: 'Statistiques' },
		{ href: '/admin/invitations', label: 'Invitations' },
		{ href: '/admin/creators', label: 'Créateurs' }
	];
</script>

<div class="min-h-screen bg-background">
	<header class="border-b">
		<div class="container mx-auto px-4 py-4 flex justify-between items-center">
			<a href="/" class="text-xl font-bold">Vasy Admin</a>
			<div class="flex items-center gap-4">
				<span class="text-sm text-muted-foreground">{data.user.email}</span>
				<form action="/logout" method="POST">
					<button type="submit" class="text-sm text-muted-foreground hover:text-foreground">
						Déconnexion
					</button>
				</form>
			</div>
		</div>
	</header>

	<div class="container mx-auto px-4 py-6">
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

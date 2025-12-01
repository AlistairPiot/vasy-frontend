<script lang="ts">
	import type { User } from '$lib/types';

	interface Props {
		user?: User;
	}

	let { user } = $props<Props>();
</script>

<header class="fixed top-0 left-0 right-0 border-b bg-background z-50">
	<div class="container mx-auto px-4 py-4 flex justify-between items-center">
		<a href="/" class="text-xl font-bold min-w-fit">Vasy</a>
		<nav class="flex gap-4 items-center">
			<a href="/products" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Produits</a>
			{#if user}
				<a href="/cart" class="text-muted-foreground hover:text-foreground flex items-center gap-1 whitespace-nowrap">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="9" cy="21" r="1"/>
						<circle cx="20" cy="21" r="1"/>
						<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
					</svg>
					Panier
				</a>
				{#if user.role === 'creator' || user.role === 'admin'}
					<a href="/dashboard" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Dashboard</a>
				{/if}
				<form action="/logout" method="POST">
					<button type="submit" class="text-muted-foreground hover:text-foreground">
						Déconnexion
					</button>
				</form>
			{:else}
				<a href="/login" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Connexion</a>
			{/if}
		</nav>
	</div>
</header>

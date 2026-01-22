<script lang="ts">
	import type { User } from '$lib/types';
	import SearchBar from './SearchBar.svelte';
	import { cart } from '$lib/stores/cart';
	import logo from '$lib/assets/vasy.svg';

	interface Props {
		user?: User;
	}

	let { user } = $props<Props>();

	// Calculer le nombre total d'articles dans le panier
	let cartItemCount = $derived($cart.items.reduce((total, item) => total + item.quantity, 0));
</script>

<header class="fixed top-0 left-0 right-0 border-b bg-background z-50">
	<div class="container mx-auto px-4 py-4 flex justify-between items-center gap-6">
		<a href="/" class="flex items-center gap-2 min-w-fit">
			<img src={logo} alt="Vasy" class="h-8 w-auto" />
		</a>
		<div class="flex-1 max-w-2xl">
			<SearchBar />
		</div>
		<nav class="flex gap-4 items-center">
			<a href="/products" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Produits</a>
			{#if user}
				{#if user.role === 'creator' || user.role === 'admin'}
					<a href="/dashboard" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Tableau de bord</a>
				{:else}
					<a href="/profile" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Profil</a>
				{/if}
				{#if user.role === 'client'}
					<a href="/cart" class="text-muted-foreground hover:text-foreground flex items-center gap-1 whitespace-nowrap relative">
						<div class="relative">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="9" cy="21" r="1"/>
								<circle cx="20" cy="21" r="1"/>
								<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
							</svg>
							{#if cartItemCount > 0}
								<span class="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
									{cartItemCount > 9 ? '9+' : cartItemCount}
								</span>
							{/if}
						</div>
						Panier
					</a>
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

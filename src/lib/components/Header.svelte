<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { User } from '$lib/types';
	import SearchBar from './SearchBar.svelte';
	import ConfirmModal from './ui/ConfirmModal.svelte';
	import { cart } from '$lib/stores/cart';
	import { favorites } from '$lib/stores/favorites';
	import { eventFavorites } from '$lib/stores/eventFavorites';
	import logo from '$lib/assets/vasy.svg';

	interface Props {
		user?: User;
	}

	let { user } = $props<Props>();

	let cartItemCount = $derived($cart.items.reduce((total, item) => total + item.quantity, 0));
	let favCount = $derived($favorites.length + $eventFavorites.length);

	let showLogoutModal = $state(false);
	let mobileMenuOpen = $state(false);
	let logoutFormRef: HTMLFormElement;

	function handleLogoutClick(event: Event) {
		event.preventDefault();
		mobileMenuOpen = false;
		showLogoutModal = true;
	}

	function confirmLogout() {
		showLogoutModal = false;
		setTimeout(() => {
			logoutFormRef?.submit();
		}, 100);
	}

	function cancelLogout() {
		showLogoutModal = false;
	}

	function closeMenu() {
		mobileMenuOpen = false;
	}

	const eventsHref = user?.role === 'creator' ? '/creator/evenements' : '/events';
</script>

<header class="fixed top-0 left-0 right-0 border-b border-border/60 bg-background/95 backdrop-blur-sm z-50 shadow-sm">
	<div class="container mx-auto px-4 md:px-6 py-3">
		<!-- Main row -->
		<div class="flex items-center gap-4">
			<!-- Logo -->
			<a href="/" class="flex items-center shrink-0">
				<img src={logo} alt="Vasy" class="h-8 w-auto" />
			</a>

			<!-- Search bar — desktop only -->
			<div class="hidden md:flex flex-1 max-w-2xl">
				<SearchBar />
			</div>

			<!-- Desktop nav -->
			<nav class="hidden md:flex gap-5 items-center text-sm ml-auto">
				<a href="/products" class="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">Produits</a>
				{#if !user || user.role === 'client' || user.role === 'creator'}
					<a href={eventsHref} class="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">Événements</a>
				{/if}
				{#if user}
					{#if user.role === 'creator' || user.role === 'admin'}
						<a href="/dashboard" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Tableau de bord</a>
					{:else}
						<a href="/profile" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Profil</a>
					{/if}
					{#if user.role === 'client'}
						<a href="/favorites" class="relative text-muted-foreground hover:text-foreground transition-colors" title="Mes favoris">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							{#if favCount > 0}
								<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
									{favCount > 9 ? '9+' : favCount}
								</span>
							{/if}
						</a>
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
					<form action="/logout" method="POST" bind:this={logoutFormRef}>
						<button type="button" onclick={handleLogoutClick} class="text-muted-foreground hover:text-foreground">
							Déconnexion
						</button>
					</form>
				{:else}
					<a href="/login" class="text-muted-foreground hover:text-foreground whitespace-nowrap">Connexion</a>
				{/if}
			</nav>

			<!-- Mobile right: cart + hamburger -->
			<div class="flex items-center gap-3 md:hidden ml-auto">
				{#if user?.role === 'client'}
					<a href="/cart" class="relative text-muted-foreground hover:text-foreground">
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="9" cy="21" r="1"/>
							<circle cx="20" cy="21" r="1"/>
							<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
						</svg>
						{#if cartItemCount > 0}
							<span class="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
								{cartItemCount > 9 ? '9+' : cartItemCount}
							</span>
						{/if}
					</a>
				{/if}
				<button
					onclick={() => mobileMenuOpen = !mobileMenuOpen}
					class="p-1 text-muted-foreground hover:text-foreground transition-colors"
					aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
					aria-expanded={mobileMenuOpen}
				>
					{#if mobileMenuOpen}
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div transition:slide={{ duration: 200 }} class="md:hidden pt-4 pb-2 border-t border-border/40 mt-3 space-y-1">
				<!-- Search -->
				<div class="mb-4">
					<SearchBar />
				</div>

				<!-- Nav links -->
				<a href="/products" onclick={closeMenu} class="flex items-center py-2.5 px-1 text-sm text-foreground/80 hover:text-foreground border-b border-border/30">Produits</a>
				{#if !user || user.role === 'client' || user.role === 'creator'}
					<a href={eventsHref} onclick={closeMenu} class="flex items-center py-2.5 px-1 text-sm text-foreground/80 hover:text-foreground border-b border-border/30">Événements</a>
				{/if}
				{#if user}
					{#if user.role === 'creator' || user.role === 'admin'}
						<a href="/dashboard" onclick={closeMenu} class="flex items-center py-2.5 px-1 text-sm text-foreground/80 hover:text-foreground border-b border-border/30">Tableau de bord</a>
					{:else}
						<a href="/profile" onclick={closeMenu} class="flex items-center py-2.5 px-1 text-sm text-foreground/80 hover:text-foreground border-b border-border/30">Profil</a>
					{/if}
					{#if user.role === 'client'}
						<a href="/favorites" onclick={closeMenu} class="flex items-center justify-between py-2.5 px-1 text-sm text-foreground/80 hover:text-foreground border-b border-border/30">
							<span>Mes favoris</span>
							{#if favCount > 0}
								<span class="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">{favCount}</span>
							{/if}
						</a>
					{/if}
					<form action="/logout" method="POST">
						<button type="button" onclick={handleLogoutClick} class="flex items-center w-full py-2.5 px-1 text-sm text-destructive hover:text-destructive/80">
							Déconnexion
						</button>
					</form>
				{:else}
					<a href="/login" onclick={closeMenu} class="flex items-center py-2.5 px-1 text-sm text-foreground/80 hover:text-foreground border-b border-border/30">Connexion</a>
					<a href="/register" onclick={closeMenu} class="flex items-center py-2.5 px-1 text-sm font-medium text-primary hover:text-primary/80">S'inscrire</a>
				{/if}
			</div>
		{/if}
	</div>
</header>

<ConfirmModal
	bind:isOpen={showLogoutModal}
	title="Confirmer la déconnexion"
	message="Êtes-vous sûr de vouloir vous déconnecter ?"
	confirmText="Se déconnecter"
	cancelText="Annuler"
	variant="destructive"
	onConfirm={confirmLogout}
	onCancel={cancelLogout}
/>

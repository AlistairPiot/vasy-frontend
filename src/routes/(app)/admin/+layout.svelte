<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/assets/vasy.svg';
	import ConfirmModal from '$lib/components/ui/ConfirmModal.svelte';

	let { data, children } = $props();

	const navItems = [
		{ href: '/admin/stats', label: 'Statistiques' },
		{ href: '/admin/invitations', label: 'Invitations' },
		{ href: '/admin/creators', label: 'Créateurs' },
		{ href: '/admin/users', label: 'Utilisateurs' },
		{ href: '/admin/orders', label: 'Commandes' }
	];

	// État de la modale de confirmation de déconnexion
	let showLogoutModal = $state(false);
	let logoutFormRef: HTMLFormElement;

	function handleLogoutClick(event: Event) {
		event.preventDefault();
		showLogoutModal = true;
	}

	function confirmLogout() {
		showLogoutModal = false;
		// Soumettre le formulaire après la fermeture de la modale
		setTimeout(() => {
			logoutFormRef?.submit();
		}, 100);
	}

	function cancelLogout() {
		showLogoutModal = false;
	}
</script>

<div class="min-h-screen bg-background">
	<header class="border-b">
		<div class="container mx-auto px-4 py-4 flex justify-between items-center">
			<a href="/" class="flex items-center gap-2">
				<img src={logo} alt="Vasy" class="h-8 w-auto" />
				<span class="text-sm font-medium text-muted-foreground">Admin</span>
			</a>
			<div class="flex items-center gap-4">
				<span class="text-sm text-muted-foreground">{data.user.email}</span>
				<form action="/logout" method="POST" bind:this={logoutFormRef}>
					<button
						type="button"
						onclick={handleLogoutClick}
						class="text-sm text-muted-foreground hover:text-foreground"
					>
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

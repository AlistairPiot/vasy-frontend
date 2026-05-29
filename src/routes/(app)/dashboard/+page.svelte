<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 md:px-6 py-8 pt-24">
		<Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Mon espace' }]} />

		<div class="pt-8 mb-8">
			<h1 class="animate-in text-3xl md:text-4xl text-foreground">Mon espace</h1>
			<p class="animate-in text-sm text-muted-foreground mt-1">{data.user.email}</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#if data.user.role === 'creator'}
				<a href="/creator/products">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Mes produits</h3>
						<p class="text-muted-foreground text-sm">Gérez vos produits en vente</p>
					</Card>
				</a>
				<a href="/creator/profile">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Mon profil</h3>
						<p class="text-muted-foreground text-sm">Gérez votre profil créateur</p>
					</Card>
				</a>
				<a href="/creator/evenements">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Événements</h3>
						<p class="text-muted-foreground text-sm">Gérez vos événements</p>
					</Card>
				</a>
				<a href="/dashboard/orders">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Commandes</h3>
						<p class="text-muted-foreground text-sm">Suivez vos commandes reçues</p>
					</Card>
				</a>
			{:else if data.user.role === 'admin'}
				<a href="/admin/creators">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Créateurs</h3>
						<p class="text-muted-foreground text-sm">Gérez les créateurs</p>
					</Card>
				</a>
				<a href="/admin/invitations">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Invitations</h3>
						<p class="text-muted-foreground text-sm">Invitez de nouveaux créateurs</p>
					</Card>
				</a>
				<a href="/admin/stats">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Statistiques</h3>
						<p class="text-muted-foreground text-sm">Vue globale de la plateforme</p>
					</Card>
				</a>
				<a href="/admin/users">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Utilisateurs</h3>
						<p class="text-muted-foreground text-sm">Gérez les utilisateurs</p>
					</Card>
				</a>
				<a href="/admin/orders">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Commandes</h3>
						<p class="text-muted-foreground text-sm">Visualisez toutes les commandes</p>
					</Card>
				</a>
				<a href="/admin/signalements">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Signalements</h3>
						<p class="text-muted-foreground text-sm">Gérez les signalements</p>
					</Card>
				</a>
			{:else}
				<a href="/profile">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Mon profil</h3>
						<p class="text-muted-foreground text-sm">Gérez vos informations et commandes</p>
					</Card>
				</a>
				<a href="/fonctionnement">
					<Card class="animate-in p-6 hover:shadow-md transition-shadow cursor-pointer">
						<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 class="font-semibold mb-1">Fonctionnement</h3>
						<p class="text-muted-foreground text-sm">Comprendre les paiements et les statuts de commande</p>
					</Card>
				</a>
			{/if}
		</div>
	</main>
</div>

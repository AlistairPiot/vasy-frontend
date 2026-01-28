<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { gsap } from 'gsap';
	import { enhance } from '$app/forms';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
	let containerRef: HTMLDivElement;

	// Initialiser l'onglet actif selon le paramètre URL
	let activeTab = $state<'profile' | 'orders'>(
		($page.url.searchParams.get('tab') === 'orders' ? 'orders' : 'profile')
	);

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	let email = $state(data.user.email);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// États pour afficher/masquer les mots de passe
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8 mt-16">
		<div class="animate-in mb-8">
			<h1 class="text-3xl font-bold mb-2">Mon profil</h1>
			<p class="text-muted-foreground">Gérez vos informations personnelles et vos commandes</p>
		</div>

		<div class="grid md:grid-cols-4 gap-8">
			<!-- Sidebar Navigation -->
			<aside class="md:col-span-1">
				<Card class="animate-in p-4">
					<nav class="space-y-2">
						<button
							onclick={() => (activeTab = 'profile')}
							class="w-full text-left px-4 py-2 rounded-md transition-colors {activeTab === 'profile'
								? 'bg-primary text-primary-foreground'
								: 'hover:bg-accent text-muted-foreground'}"
						>
							Mon profil
						</button>
						<button
							onclick={() => (activeTab = 'orders')}
							class="w-full text-left px-4 py-2 rounded-md transition-colors {activeTab === 'orders'
								? 'bg-primary text-primary-foreground'
								: 'hover:bg-accent text-muted-foreground'}"
						>
							Commandes
						</button>
					</nav>
				</Card>
			</aside>

			<!-- Main Content -->
			<div class="md:col-span-3">
				{#if activeTab === 'profile'}
					<Card class="animate-in p-6">
						<h2 class="text-xl font-semibold mb-6">Informations du compte</h2>

						{#if form?.success}
							<div class="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">
								Profil mis à jour avec succès
							</div>
						{/if}

						{#if form?.error}
							<div class="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
								{form.error}
							</div>
						{/if}

						<form method="POST" action="?/updateProfile" use:enhance class="space-y-6">
							<div class="space-y-2">
								<label for="email" class="text-sm font-medium">Email</label>
								<Input type="email" id="email" name="email" required bind:value={email} />
							</div>

							<div class="border-t pt-6">
								<h3 class="text-lg font-semibold mb-4">Changer le mot de passe</h3>
								<p class="text-sm text-muted-foreground mb-4">
									Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe
								</p>

								<div class="space-y-4">
									<div class="space-y-2">
										<label for="currentPassword" class="text-sm font-medium">
											Mot de passe actuel
										</label>
										<div class="relative">
											<Input
												type={showCurrentPassword ? 'text' : 'password'}
												id="currentPassword"
												name="currentPassword"
												bind:value={currentPassword}
												class="pr-10"
											/>
											<button
												type="button"
												onclick={() => (showCurrentPassword = !showCurrentPassword)}
												class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
												aria-label={showCurrentPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
											>
												{#if showCurrentPassword}
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
														<line x1="1" y1="1" x2="23" y2="23"/>
													</svg>
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
														<circle cx="12" cy="12" r="3"/>
													</svg>
												{/if}
											</button>
										</div>
									</div>

									<div class="space-y-2">
										<label for="newPassword" class="text-sm font-medium">
											Nouveau mot de passe
										</label>
										<div class="relative">
											<Input
												type={showNewPassword ? 'text' : 'password'}
												id="newPassword"
												name="newPassword"
												bind:value={newPassword}
												class="pr-10"
											/>
											<button
												type="button"
												onclick={() => (showNewPassword = !showNewPassword)}
												class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
												aria-label={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
											>
												{#if showNewPassword}
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
														<line x1="1" y1="1" x2="23" y2="23"/>
													</svg>
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
														<circle cx="12" cy="12" r="3"/>
													</svg>
												{/if}
											</button>
										</div>
									</div>

									<div class="space-y-2">
										<label for="confirmPassword" class="text-sm font-medium">
											Confirmer le nouveau mot de passe
										</label>
										<div class="relative">
											<Input
												type={showConfirmPassword ? 'text' : 'password'}
												id="confirmPassword"
												name="confirmPassword"
												bind:value={confirmPassword}
												class="pr-10"
											/>
											<button
												type="button"
												onclick={() => (showConfirmPassword = !showConfirmPassword)}
												class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
												aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
											>
												{#if showConfirmPassword}
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
														<line x1="1" y1="1" x2="23" y2="23"/>
													</svg>
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
														<circle cx="12" cy="12" r="3"/>
													</svg>
												{/if}
											</button>
										</div>
									</div>
								</div>
							</div>

							<Button type="submit" class="w-full">
								{#snippet children()}
									Enregistrer les modifications
								{/snippet}
							</Button>
						</form>
					</Card>
				{:else if activeTab === 'orders'}
					<Card class="animate-in p-6">
						<h2 class="text-xl font-semibold mb-6">Mes commandes</h2>

						{#if data.orders.length === 0}
							<div class="text-center py-12">
								<p class="text-muted-foreground">Vous n'avez pas encore de commandes.</p>
							</div>
						{:else}
							<div class="space-y-4">
								{#each data.orders as order}
									<div class="border rounded-lg p-4">
										<div class="flex justify-between items-start mb-3">
											<div>
												<p class="font-medium">Commande #{order.id.slice(0, 8)}</p>
												<p class="text-sm text-muted-foreground">
													{new Date(order.created_at).toLocaleDateString('fr-FR', {
														day: 'numeric',
														month: 'long',
														year: 'numeric'
													})}
												</p>
											</div>
											<span class="px-3 py-1 rounded-full text-sm font-medium
												{order.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
												 order.status === 'validee' ? 'bg-blue-100 text-blue-800' :
												 order.status === 'expediee' ? 'bg-green-100 text-green-800' :
												 order.status === 'refusee' ? 'bg-red-100 text-red-800' :
												 'bg-gray-100 text-gray-800'}">
												{order.status === 'en_attente' ? 'En attente' :
												 order.status === 'validee' ? 'Validée' :
												 order.status === 'expediee' ? 'Expédiée' :
												 order.status === 'refusee' ? 'Refusée' :
												 'Annulée'}
											</span>
										</div>

										<div class="text-sm mb-3">
											<p><strong>Livraison :</strong> {order.shipping_name}</p>
											<p class="text-muted-foreground">{order.shipping_address}, {order.shipping_postal_code} {order.shipping_city}</p>
										</div>

										{#if order.tracking_number}
											<div class="text-sm mb-3 bg-green-50 p-2 rounded">
												<p><strong>Numéro de suivi :</strong> <span class="font-mono">{order.tracking_number}</span></p>
											</div>
										{/if}

										<div class="text-sm mb-3">
											<p><strong>Produits :</strong></p>
											{#each order.items as item}
												<div class="flex gap-2 items-center mt-2">
													{#if item.product_image_url}
														<img src={item.product_image_url} alt={item.product_name} class="w-12 h-12 object-cover rounded" />
													{/if}
													<div class="flex-1">
														<p class="text-muted-foreground">{item.product_name} x{item.quantity}</p>
														<p class="text-muted-foreground">{(item.product_price / 100).toFixed(2)} €</p>
													</div>
												</div>
											{/each}
										</div>

										<div class="border-t pt-3 flex justify-between items-center">
											<span class="font-semibold">Total</span>
											<span class="font-semibold">{(order.total_amount / 100).toFixed(2)} €</span>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</Card>
				{/if}
			</div>
		</div>
	</main>
</div>

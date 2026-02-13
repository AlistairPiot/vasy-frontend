<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { formatPrice } from '$lib/utils';

	let { data, form } = $props();
	let formRef: HTMLFormElement;
	let profileImageUrl = $state(data.creator.profile_image_url || '');
	let uploading = $state(false);

	// États pour les modales de confirmation
	let confirmModal = $state<{
		isOpen: boolean;
		type: 'accept' | 'refuse' | 'ship' | null;
		orderId: string | null;
		trackingNumber?: string;
	}>({ isOpen: false, type: null, orderId: null });

	onMount(() => {
		gsap.from(formRef, {
			y: 20,
			opacity: 0,
			duration: 0.5,
			ease: 'power3.out'
		});
	});

	async function handleAvatarUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploading = true;

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/api/upload/avatar', {
				method: 'POST',
				body: formData
			});
			const data = await response.json();
			if (data.url) {
				profileImageUrl = data.url;
			}
		} catch (err) {
			console.error('Upload failed:', err);
		}

		uploading = false;
		input.value = '';
	}

	function openConfirmModal(type: 'accept' | 'refuse' | 'ship', orderId: string, trackingNumber?: string) {
		confirmModal = { isOpen: true, type, orderId, trackingNumber };
	}

	function closeConfirmModal() {
		confirmModal = { isOpen: false, type: null, orderId: null };
	}

	function confirmAction() {
		if (!confirmModal.orderId) return;

		const form = document.createElement('form');
		form.method = 'POST';

		if (confirmModal.type === 'accept') {
			form.action = '?/acceptOrder';
		} else if (confirmModal.type === 'refuse') {
			form.action = '?/refuseOrder';
		} else if (confirmModal.type === 'ship') {
			form.action = '?/shipOrder';
		}

		const orderIdInput = document.createElement('input');
		orderIdInput.type = 'hidden';
		orderIdInput.name = 'orderId';
		orderIdInput.value = confirmModal.orderId;
		form.appendChild(orderIdInput);

		if (confirmModal.type === 'ship' && confirmModal.trackingNumber) {
			const trackingInput = document.createElement('input');
			trackingInput.type = 'hidden';
			trackingInput.name = 'trackingNumber';
			trackingInput.value = confirmModal.trackingNumber;
			form.appendChild(trackingInput);
		}

		document.body.appendChild(form);
		form.submit();
	}

	async function handleStripeConnect() {
		console.log('handleStripeConnect called');
		try {
			console.log('Fetching /api/stripe/connect...');
			const response = await fetch('/api/stripe/connect', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			console.log('Response status:', response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Response error:', errorText);
				throw new Error('Erreur lors de la connexion à Stripe');
			}

			const data = await response.json();
			console.log('Response data:', data);

			// Rediriger vers l'URL Stripe
			if (data.url) {
				console.log('Redirecting to:', data.url);
				window.location.href = data.url;
			} else {
				console.error('No URL in response');
			}
		} catch (error) {
			console.error('Stripe Connect error:', error);
			alert('Erreur lors de la connexion à Stripe. Veuillez réessayer.');
		}
	}
</script>

<div>
	<h1 class="text-2xl font-bold mb-6">Mon profil</h1>

	{#if data.stripeSuccess}
		<div class="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">
			Configuration Stripe réussie ! Votre compte est maintenant {data.stripeStatus.onboarding_complete ? 'complètement configuré' : 'en cours de validation'}.
			{#if !data.stripeStatus.onboarding_complete}
				<br/>Il peut prendre quelques minutes pour que Stripe valide vos informations.
			{/if}
		</div>
	{/if}

	{#if data.stripeError}
		<div class="bg-red-100 text-red-800 text-sm p-3 rounded-md mb-4">
			Une erreur s'est produite lors de la configuration Stripe. Veuillez réessayer.
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">
			Profil mis à jour avec succès
		</div>
	{/if}

	<div class="grid lg:grid-cols-2 gap-6">
		<!-- Colonne de gauche : Informations du profil -->
		<div class="space-y-6">
			<Card class="p-6">
		<form method="POST" action="?/updateProfile" use:enhance bind:this={formRef} class="space-y-6">
			{#if form?.error}
				<div class="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
					{form.error}
				</div>
			{/if}

			<div class="space-y-2">
				<label class="text-sm font-medium">Photo de profil</label>
				<div class="flex items-center gap-4">
					{#if profileImageUrl && profileImageUrl.length > 0}
						<img
							src={profileImageUrl}
							alt="Avatar"
							class="w-20 h-20 rounded-full object-cover"
						/>
					{:else}
						<div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
							<span class="text-2xl text-muted-foreground">
								{data.creator.display_name?.charAt(0)?.toUpperCase() || '?'}
							</span>
						</div>
					{/if}
					<div>
						<input
							type="file"
							accept="image/*"
							onchange={handleAvatarUpload}
							class="hidden"
							id="avatar-upload"
							disabled={uploading}
						/>
						<label
							for="avatar-upload"
							class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer {uploading ? 'opacity-50 cursor-not-allowed' : ''}"
						>
							{uploading ? 'Upload...' : 'Changer la photo'}
						</label>
					</div>
				</div>
			</div>

			<div class="space-y-2">
				<label for="displayName" class="text-sm font-medium">Nom d'affichage *</label>
				<Input
					type="text"
					id="displayName"
					name="displayName"
					required
					value={data.creator.display_name}
				/>
			</div>

			<div class="space-y-2">
				<label for="siret" class="text-sm font-medium">Numéro de SIRET</label>
				<div class="flex items-center justify-between px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm font-mono">
					{#if data.creator.siret}
						<span>{data.creator.siret.slice(0, 3)} {data.creator.siret.slice(3, 6)} {data.creator.siret.slice(6, 9)} {data.creator.siret.slice(9)}</span>
					{:else}
						<span class="text-xs">Non renseigné</span>
					{/if}
				</div>
				<p class="text-xs text-muted-foreground">Ce numéro ne peut pas être modifié</p>
			</div>

			<div class="space-y-2">
				<label for="bio" class="text-sm font-medium">Description courte</label>
				<textarea
					id="bio"
					name="bio"
					rows={4}
					class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					placeholder="Parlez de vous et de votre activité..."
				>{data.creator.bio || ''}</textarea>
			</div>

			<input type="hidden" name="profileImageUrl" value={profileImageUrl} />

			<Button type="submit" class="w-full">
				{#snippet children()}
					Enregistrer
				{/snippet}
			</Button>
			</form>
		</Card>

		{#if !data.stripeStatus.onboarding_complete}
			<Card class="p-6 border-orange-200 bg-orange-50">
				<div class="flex justify-between items-start mb-2">
					<h2 class="font-semibold">Configuration Stripe requise</h2>
					{#if data.stripeStatus.connected}
						<button
							type="button"
							onclick={() => window.location.reload()}
							class="text-xs text-muted-foreground hover:text-foreground"
							title="Rafraîchir le statut"
						>
							↻ Rafraîchir
						</button>
					{/if}
				</div>
				<p class="text-sm text-muted-foreground mb-4">
					Pour recevoir des paiements, vous devez configurer votre compte Stripe.
					{#if data.stripeStatus.connected}
						<br/>Stripe valide vos informations, cela peut prendre quelques minutes.
					{/if}
				</p>
				<Button type="button" onclick={handleStripeConnect}>
					{#snippet children()}
						{data.stripeStatus.connected ? 'Reprendre la configuration' : 'Configurer Stripe'}
					{/snippet}
				</Button>
			</Card>
		{:else}
			<Card class="p-6 border-green-200 bg-green-50">
				<h2 class="font-semibold mb-2 text-green-800">✓ Stripe configuré</h2>
				<p class="text-sm text-muted-foreground mb-4">
					Votre compte Stripe est configuré et vous pouvez recevoir des paiements.
					Pour modifier vos informations bancaires ou fiscales, cliquez sur le bouton ci-dessous.
				</p>
				<Button type="button" onclick={handleStripeConnect} variant="outline">
					{#snippet children()}
						Gérer mon compte Stripe
					{/snippet}
				</Button>
			</Card>
		{/if}
	</div>

	<!-- Colonne de droite : Commandes -->
	<div>
		<Card class="p-6">
			<h2 class="text-2xl font-bold mb-6">Commandes</h2>

			<!-- Section En attente (en_attente) -->
			<div class="mb-6">
				<h3 class="text-lg font-semibold mb-4 pb-2 border-b">En attente</h3>
				{#if data.orders.filter(o => o.status === 'en_attente').length === 0}
					<div class="text-sm text-muted-foreground text-center py-4">
						Aucune commande en attente
					</div>
				{:else}
					<div class="space-y-4">
						{#each data.orders.filter(o => o.status === 'en_attente') as order}
							<div class="border rounded-lg p-4">
								<div class="flex justify-between items-start mb-2">
									<div>
										<p class="font-semibold">Commande #{order.id.slice(0, 8)}</p>
										<p class="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
									</div>
									<div class="text-right">
										<p class="font-bold">{formatPrice(order.total_amount)}</p>
										<p class="text-xs text-green-600">Vous recevrez: {formatPrice(order.creator_earnings)}</p>
									</div>
								</div>

								<div class="text-sm mb-3">
									<p><strong>Livraison :</strong> {order.shipping_name}</p>
									<p class="text-muted-foreground">{order.shipping_address}, {order.shipping_postal_code} {order.shipping_city}</p>
								</div>

								<div class="text-sm mb-3">
									<p><strong>Produits :</strong></p>
									{#each order.items as item}
										<p class="text-muted-foreground">- {item.product_name} x{item.quantity}</p>
									{/each}
								</div>

								<div class="flex gap-2">
									<Button onclick={() => openConfirmModal('accept', order.id)} class="flex-1" size="sm">
										{#snippet children()}
											Accepter
										{/snippet}
									</Button>
									<Button onclick={() => openConfirmModal('refuse', order.id)} variant="destructive" class="flex-1" size="sm">
										{#snippet children()}
											Refuser
										{/snippet}
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Section Validé (validee) -->
			<div class="mb-6">
				<h3 class="text-lg font-semibold mb-4 pb-2 border-b">Validé</h3>
				{#if data.orders.filter(o => o.status === 'validee').length === 0}
					<div class="text-sm text-muted-foreground text-center py-4">
						Aucune commande validée
					</div>
				{:else}
					<div class="space-y-4">
						{#each data.orders.filter(o => o.status === 'validee') as order}
							<div class="border rounded-lg p-4">
								<div class="flex justify-between items-start mb-2">
									<div>
										<p class="font-semibold">Commande #{order.id.slice(0, 8)}</p>
										<p class="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
									</div>
									<div class="text-right">
										<p class="font-bold">{formatPrice(order.total_amount)}</p>
										<p class="text-xs text-green-600">Vous recevrez: {formatPrice(order.creator_earnings)}</p>
									</div>
								</div>

								<div class="text-sm mb-3">
									<p><strong>Livraison :</strong> {order.shipping_name}</p>
									<p class="text-muted-foreground">{order.shipping_address}, {order.shipping_postal_code} {order.shipping_city}</p>
								</div>

								<div class="text-sm mb-3">
									<p><strong>Produits :</strong></p>
									{#each order.items as item}
										<p class="text-muted-foreground">- {item.product_name} x{item.quantity}</p>
									{/each}
								</div>

								<div class="space-y-2">
									<div>
										<label class="text-sm font-medium">Numéro de suivi</label>
										<input
											type="text"
											id="trackingNumber-{order.id}"
											required
											class="w-full px-3 py-2 border rounded-md text-sm"
											placeholder="Ex: 1Z999AA10123456784"
										/>
									</div>
									<Button onclick={() => {
										const trackingInput = document.getElementById(`trackingNumber-${order.id}`) as HTMLInputElement;
										if (trackingInput && trackingInput.value) {
											openConfirmModal('ship', order.id, trackingInput.value);
										}
									}} class="w-full" size="sm">
										{#snippet children()}
											Marquer comme expédié
										{/snippet}
									</Button>
									<Button onclick={() => openConfirmModal('refuse', order.id)} variant="destructive" class="w-full" size="sm">
										{#snippet children()}
											Refuser
										{/snippet}
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Section Expédié (expediee) -->
			<div>
				<h3 class="text-lg font-semibold mb-4 pb-2 border-b">Expédié</h3>
				{#if data.orders.filter(o => o.status === 'expediee').length === 0}
					<div class="text-sm text-muted-foreground text-center py-4">
						Aucune commande expédiée
					</div>
				{:else}
					<div class="space-y-4">
						{#each data.orders.filter(o => o.status === 'expediee') as order}
							<div class="border rounded-lg p-4 bg-green-50">
								<div class="flex justify-between items-start mb-2">
									<div>
										<p class="font-semibold">Commande #{order.id.slice(0, 8)}</p>
										<p class="text-sm text-muted-foreground">{new Date(order.shipped_at).toLocaleDateString('fr-FR')}</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground line-through">{formatPrice(order.total_amount)}</p>
										<p class="font-bold text-green-600">Gagné: {formatPrice(order.creator_earnings)}</p>
									</div>
								</div>

								<div class="text-sm mb-2">
									<p><strong>Livraison :</strong> {order.shipping_name}</p>
								</div>

								<div class="text-sm">
									<p><strong>Suivi :</strong> <span class="font-mono">{order.tracking_number}</span></p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</Card>
	</div>
</div>

<!-- Modale de confirmation -->
{#if confirmModal.isOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={closeConfirmModal}>
		<div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" onclick={(e) => e.stopPropagation()}>
			<h3 class="text-lg font-semibold mb-4">
				{#if confirmModal.type === 'accept'}
					Confirmer l'acceptation
				{:else if confirmModal.type === 'refuse'}
					Confirmer le refus
				{:else if confirmModal.type === 'ship'}
					Confirmer l'expédition
				{/if}
			</h3>

			<p class="text-muted-foreground mb-6">
				{#if confirmModal.type === 'accept'}
					Êtes-vous sûr de vouloir accepter cette commande ? Vous devrez ensuite l'expédier avec un numéro de suivi.
				{:else if confirmModal.type === 'refuse'}
					Êtes-vous sûr de vouloir refuser cette commande ? Cette action est irréversible et le client sera notifié.
				{:else if confirmModal.type === 'ship'}
					Êtes-vous sûr de vouloir marquer cette commande comme expédiée ? Le client sera débité et recevra le numéro de suivi.
				{/if}
			</p>

			<div class="flex gap-3 justify-end">
				<Button variant="outline" onclick={closeConfirmModal}>
					{#snippet children()}
						Annuler
					{/snippet}
				</Button>
				<Button
					variant={confirmModal.type === 'refuse' ? 'destructive' : 'default'}
					onclick={confirmAction}
				>
					{#snippet children()}
						{#if confirmModal.type === 'accept'}
							Accepter
						{:else if confirmModal.type === 'refuse'}
							Refuser
						{:else if confirmModal.type === 'ship'}
							Expédier
						{/if}
					{/snippet}
				</Button>
			</div>
		</div>
	</div>
{/if}
</div>

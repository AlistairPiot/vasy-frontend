<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { loadStripe } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
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

	// Recadrage photo de profil
	const CROP_VIEWPORT = 280;
	let showCropModal = $state(false);
	let cropObjectUrl = $state('');
	let cropScale = $state(1);
	let cropX = $state(0);
	let cropY = $state(0);
	let imgNaturalWidth = $state(1);
	let imgNaturalHeight = $state(1);
	let isDragging = $state(false);
	let dragStartX = 0, dragStartY = 0, dragStartCropX = 0, dragStartCropY = 0;

	// Valeurs dérivées réactives
	const minScale = $derived(Math.max(CROP_VIEWPORT / imgNaturalWidth, CROP_VIEWPORT / imgNaturalHeight));
	const scaledW = $derived(imgNaturalWidth * cropScale);
	const scaledH = $derived(imgNaturalHeight * cropScale);
	const imgLeft = $derived(CROP_VIEWPORT / 2 - scaledW / 2 + cropX);
	const imgTop = $derived(CROP_VIEWPORT / 2 - scaledH / 2 + cropY);
	let sliderPos = $state(0);

	function syncSlider() {
		sliderPos = Math.max(0, Math.min(100, ((cropScale - minScale) / (minScale * 4)) * 100));
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		input.value = '';

		if (cropObjectUrl) URL.revokeObjectURL(cropObjectUrl);
		const url = URL.createObjectURL(file);
		const tmpImg = new Image();
		tmpImg.onload = () => {
			imgNaturalWidth = tmpImg.naturalWidth;
			imgNaturalHeight = tmpImg.naturalHeight;
			cropObjectUrl = url;
			cropScale = Math.max(CROP_VIEWPORT / imgNaturalWidth, CROP_VIEWPORT / imgNaturalHeight);
			cropX = 0;
			cropY = 0;
			showCropModal = true;
		};
		tmpImg.src = url;
	}

	function clampPosition() {
		const maxX = Math.max(0, (scaledW - CROP_VIEWPORT) / 2);
		const maxY = Math.max(0, (scaledH - CROP_VIEWPORT) / 2);
		cropX = Math.max(-maxX, Math.min(maxX, cropX));
		cropY = Math.max(-maxY, Math.min(maxY, cropY));
	}

	function onCropWheel(event: WheelEvent) {
		event.preventDefault();
		const factor = event.deltaY > 0 ? 0.92 : 1.08;
		cropScale = Math.max(minScale, Math.min(cropScale * factor, minScale * 5));
		clampPosition();
		syncSlider();
	}

	function onCropPointerDown(event: PointerEvent) {
		isDragging = true;
		dragStartX = event.clientX;
		dragStartY = event.clientY;
		dragStartCropX = cropX;
		dragStartCropY = cropY;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onCropPointerMove(event: PointerEvent) {
		if (!isDragging) return;
		cropX = dragStartCropX + (event.clientX - dragStartX);
		cropY = dragStartCropY + (event.clientY - dragStartY);
		clampPosition();
	}

	function onSliderInput() {
		cropScale = minScale + (sliderPos / 100) * minScale * 4;
		clampPosition();
	}

	async function confirmCrop() {
		const img = new Image();
		img.src = cropObjectUrl;
		await new Promise<void>(r => { img.onload = () => r(); });

		const OUTPUT = 400;
		const canvas = document.createElement('canvas');
		canvas.width = OUTPUT;
		canvas.height = OUTPUT;
		const ctx = canvas.getContext('2d')!;

		// Clip circulaire
		ctx.beginPath();
		ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
		ctx.clip();

		// Coordonnées source : quelle portion de l'image originale est visible dans le viewport
		const srcX = -imgLeft / cropScale;
		const srcY = -imgTop / cropScale;
		const srcW = CROP_VIEWPORT / cropScale;
		const srcH = CROP_VIEWPORT / cropScale;

		ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT, OUTPUT);

		canvas.toBlob(async (blob) => {
			if (!blob) return;
			showCropModal = false;
			URL.revokeObjectURL(cropObjectUrl);
			cropObjectUrl = '';
			uploading = true;
			const fd = new FormData();
			fd.append('file', new File([blob], 'avatar.png', { type: 'image/png' }));
			try {
				const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd });
				const d = await res.json();
				if (d.url) profileImageUrl = d.url;
			} catch (err) {
				console.error('Upload failed:', err);
			} finally {
				uploading = false;
			}
		}, 'image/png', 0.95);
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

	// Formulaire coordonnées bancaires
	let showPayoutForm = $state(false);
	let payoutLoading = $state(false);
	let payoutError = $state<string | null>(null);
	let payoutSuccess = $state(false);
	let ibanDisplay = $state('');
	let mandateAccepted = $state(false);

	function handleIbanInput(e: Event) {
		const input = e.target as HTMLInputElement;
		// Ne garder que lettres et chiffres, majuscules, max 34 chars
		const raw = input.value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 34);
		// Formater par groupes de 4
		ibanDisplay = raw.match(/.{1,4}/g)?.join(' ') ?? raw;
	}

	const ibanRaw = $derived(ibanDisplay.replace(/\s/g, ''));
	const ibanValid = $derived(ibanRaw.length >= 15 && /^[A-Z]{2}\d{2}/.test(ibanRaw));

	async function handlePayoutSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formEl = event.target as HTMLFormElement;
		const formData = new FormData(formEl);

		payoutLoading = true;
		payoutError = null;

		try {
			const stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
			if (!stripe) throw new Error('Stripe non disponible');

			const firstName = formData.get('first_name') as string;
			const lastName = formData.get('last_name') as string;

			// 1. Créer le token account avec les données personnelles (obligatoire pour FR)
			const { token: accountToken, error: accountError } = await stripe.createToken('account', {
				business_type: 'individual',
				individual: {
					first_name: firstName,
					last_name: lastName,
					dob: {
						day: parseInt(formData.get('dob_day') as string),
						month: parseInt(formData.get('dob_month') as string),
						year: parseInt(formData.get('dob_year') as string),
					},
					address: {
						line1: formData.get('address_line1') as string,
						city: formData.get('address_city') as string,
						postal_code: formData.get('address_postal_code') as string,
						country: 'FR',
					},
					email: data.user.email,
				},
				tos_shown_and_accepted: true,
			} as Parameters<typeof stripe.createToken>[1]);

			if (accountError || !accountToken) {
				payoutError = accountError?.message ?? 'Erreur lors de la création du token compte';
				return;
			}

			// 2. Créer le token bank_account avec l'IBAN
			const { token: bankToken, error: bankError } = await stripe.createToken('bank_account', {
				country: 'FR',
				currency: 'eur',
				account_number: ibanRaw,
				account_holder_name: `${firstName} ${lastName}`,
				account_holder_type: 'individual',
			});

			if (bankError || !bankToken) {
				payoutError = bankError?.message ?? "Erreur lors de la validation de l'IBAN";
				return;
			}

			// 3. Envoyer les tokens au backend
			const response = await fetch('/api/stripe/setup-payout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					account_token: accountToken.id,
					bank_account_token: bankToken.id,
					iban_last4: ibanRaw.slice(-4),
					mandate_accepted: mandateAccepted,
				}),
			});

			if (!response.ok) {
				const err = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
				payoutError = err.detail || 'Erreur lors de la configuration';
			} else {
				payoutSuccess = true;
				showPayoutForm = false;
				window.location.reload();
			}
		} catch (e) {
			payoutError = e instanceof Error ? e.message : 'Erreur réseau. Veuillez réessayer.';
		} finally {
			payoutLoading = false;
		}
	}
</script>

<div>
	<h1 class="text-2xl font-bold mb-6">Mon profil</h1>

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
							onchange={handleFileSelect}
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

		{#if payoutError}
			<div class="bg-red-100 text-red-800 text-sm p-3 rounded-md">
				{payoutError}
			</div>
		{/if}

		<div id="stripe"></div>
		{#if !data.stripeStatus.onboarding_complete}
			<Card class="p-6 border-orange-200 bg-orange-50">
				<h2 class="font-semibold mb-2">Coordonnées bancaires requises</h2>
				<p class="text-sm text-muted-foreground mb-4">
					Pour recevoir vos paiements, renseignez vos coordonnées bancaires. Ces informations sont transmises de manière sécurisée à notre partenaire Stripe.
				</p>

				{#if !showPayoutForm}
					<Button type="button" onclick={() => (showPayoutForm = true)}>
						{#snippet children()}
							Configurer mes coordonnées bancaires
						{/snippet}
					</Button>
				{:else}
					<form onsubmit={handlePayoutSubmit} class="space-y-4 mt-4">
						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-1">
								<label class="text-sm font-medium">Prénom *</label>
								<Input type="text" name="first_name" required />
							</div>
							<div class="space-y-1">
								<label class="text-sm font-medium">Nom *</label>
								<Input type="text" name="last_name" required />
							</div>
						</div>

						<div class="space-y-1">
							<label class="text-sm font-medium">Date de naissance *</label>
							<div class="grid grid-cols-3 gap-2">
								<Input type="number" name="dob_day" placeholder="JJ" min="1" max="31" required />
								<Input type="number" name="dob_month" placeholder="MM" min="1" max="12" required />
								<Input type="number" name="dob_year" placeholder="AAAA" min="1900" max="2005" required />
							</div>
						</div>

						<div class="space-y-1">
							<label class="text-sm font-medium">Adresse *</label>
							<Input type="text" name="address_line1" placeholder="Numéro et nom de rue" required />
						</div>

						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-1">
								<label class="text-sm font-medium">Code postal *</label>
								<Input type="text" name="address_postal_code" placeholder="75001" required />
							</div>
							<div class="space-y-1">
								<label class="text-sm font-medium">Ville *</label>
								<Input type="text" name="address_city" placeholder="Paris" required />
							</div>
						</div>

						<div class="space-y-1">
							<label class="text-sm font-medium">IBAN *</label>
							<div class="relative">
								<input
									type="text"
									name="iban"
									value={ibanDisplay}
									oninput={handleIbanInput}
									placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
									required
									autocomplete="off"
									spellcheck="false"
									class="flex w-full rounded-md border px-3 py-2 text-sm font-mono tracking-wider pr-20
										{ibanRaw.length > 0
											? ibanValid
												? 'border-green-500 focus-visible:ring-green-500'
												: 'border-red-400 focus-visible:ring-red-400'
											: 'border-input'}
										bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2"
								/>
								<div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
									{#if ibanRaw.length > 0}
										{#if ibanValid}
											<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										{:else}
											<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										{/if}
									{/if}
									<span class="text-xs text-muted-foreground tabular-nums">{ibanRaw.length}/34</span>
								</div>
							</div>
							{#if ibanRaw.length > 0 && !ibanValid}
								<p class="text-xs text-red-500">Format invalide — doit commencer par 2 lettres suivies de 2 chiffres (ex : FR76…)</p>
							{/if}
							<p class="text-xs text-muted-foreground">Votre IBAN est transmis de façon sécurisée à Stripe. Nous ne le stockons pas.</p>
						</div>

						<label class="flex items-start gap-3 p-3 rounded-md border border-input bg-muted/30 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={mandateAccepted}
								required
								class="mt-0.5 h-4 w-4 shrink-0 accent-primary"
							/>
							<span class="text-xs text-muted-foreground leading-relaxed">
								J'autorise <strong>Vasy</strong> à encaisser les paiements de mes clients en mon nom,
								à prélever une commission de 5% + 0,25€ par produit sur chaque vente,
								et à me reverser le solde net sur le compte bancaire renseigné ci-dessus.
								<span class="text-foreground font-medium">Ce mandat d'encaissement est obligatoire pour recevoir vos paiements.</span>
							</span>
						</label>

						<div class="flex gap-2 pt-2">
							<Button type="submit" disabled={payoutLoading || !mandateAccepted}>
								{#snippet children()}
									{payoutLoading ? 'Enregistrement...' : 'Enregistrer'}
								{/snippet}
							</Button>
							<Button type="button" variant="outline" onclick={() => (showPayoutForm = false)}>
								{#snippet children()}
									Annuler
								{/snippet}
							</Button>
						</div>
					</form>
				{/if}
			</Card>
		{:else}
			<Card class="p-6 border-green-200 bg-green-50">
				<h2 class="font-semibold mb-2 text-green-800">✓ Coordonnées bancaires configurées</h2>
				<p class="text-sm text-muted-foreground mb-4">
					Vos virements seront effectués automatiquement sur votre compte IBAN se terminant par <span class="font-mono font-semibold">{data.stripeStatus.iban_last4 || '····'}</span>.
				</p>
				<Button type="button" variant="outline" onclick={() => (showPayoutForm = !showPayoutForm)}>
					{#snippet children()}
						{showPayoutForm ? 'Annuler' : 'Modifier les coordonnées'}
					{/snippet}
				</Button>

				{#if showPayoutForm}
					<form onsubmit={handlePayoutSubmit} class="space-y-4 mt-4">
						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-1">
								<label class="text-sm font-medium">Prénom *</label>
								<Input type="text" name="first_name" required />
							</div>
							<div class="space-y-1">
								<label class="text-sm font-medium">Nom *</label>
								<Input type="text" name="last_name" required />
							</div>
						</div>

						<div class="space-y-1">
							<label class="text-sm font-medium">Date de naissance *</label>
							<div class="grid grid-cols-3 gap-2">
								<Input type="number" name="dob_day" placeholder="JJ" min="1" max="31" required />
								<Input type="number" name="dob_month" placeholder="MM" min="1" max="12" required />
								<Input type="number" name="dob_year" placeholder="AAAA" min="1900" max="2005" required />
							</div>
						</div>

						<div class="space-y-1">
							<label class="text-sm font-medium">Adresse *</label>
							<Input type="text" name="address_line1" placeholder="Numéro et nom de rue" required />
						</div>

						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-1">
								<label class="text-sm font-medium">Code postal *</label>
								<Input type="text" name="address_postal_code" placeholder="75001" required />
							</div>
							<div class="space-y-1">
								<label class="text-sm font-medium">Ville *</label>
								<Input type="text" name="address_city" placeholder="Paris" required />
							</div>
						</div>

						<div class="space-y-1">
							<label class="text-sm font-medium">Nouvel IBAN *</label>
							<Input type="text" name="iban" placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" required />
						</div>

						<label class="flex items-start gap-3 p-3 rounded-md border border-input bg-muted/30 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={mandateAccepted}
								required
								class="mt-0.5 h-4 w-4 shrink-0 accent-primary"
							/>
							<span class="text-xs text-muted-foreground leading-relaxed">
								J'autorise <strong>Vasy</strong> à encaisser les paiements de mes clients en mon nom,
								à prélever une commission de 5% + 0,25€ par produit sur chaque vente,
								et à me reverser le solde net sur le compte bancaire renseigné ci-dessus.
								<span class="text-foreground font-medium">Ce mandat d'encaissement est obligatoire pour recevoir vos paiements.</span>
							</span>
						</label>

						<Button type="submit" disabled={payoutLoading || !mandateAccepted}>
							{#snippet children()}
								{payoutLoading ? 'Enregistrement...' : 'Mettre à jour'}
							{/snippet}
						</Button>
					</form>
				{/if}
			</Card>
		{/if}

		<!-- Historique des virements -->
		{#if data.stripeStatus.onboarding_complete && data.payoutsData.transfers.length > 0}
			<Card class="p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="font-semibold">Virements reçus</h2>
					<span class="text-sm font-semibold text-green-600">
						Total : {(data.payoutsData.total_paid_out / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
					</span>
				</div>
				<div class="space-y-2">
					{#each data.payoutsData.transfers as transfer}
						<div class="flex items-center justify-between py-2 border-b last:border-0">
							<div class="text-sm text-muted-foreground">
								{new Date(transfer.created * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
								{#if transfer.metadata?.order_id}
									<span class="ml-2 text-xs font-mono">#{transfer.metadata.order_id.slice(0, 8)}</span>
								{/if}
							</div>
							<span class="font-semibold text-green-600">
								+{(transfer.amount / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
							</span>
						</div>
					{/each}
				</div>
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

<!-- Modal de recadrage photo -->
{#if showCropModal}
	<div class="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
			<h3 class="text-lg font-semibold mb-1 text-center">Positionner la photo</h3>
			<p class="text-xs text-muted-foreground text-center mb-4">Glissez pour repositionner · molette ou curseur pour zoomer</p>

			<!-- Zone de recadrage circulaire -->
			<div class="flex justify-center mb-4">
				<div
					class="overflow-hidden rounded-full ring-2 ring-primary cursor-grab select-none"
					style:width="{CROP_VIEWPORT}px"
					style:height="{CROP_VIEWPORT}px"
					style:background-image={cropObjectUrl ? `url(${cropObjectUrl})` : 'none'}
					style:background-size="{scaledW}px {scaledH}px"
					style:background-position="{imgLeft}px {imgTop}px"
					style:background-repeat="no-repeat"
					onwheel={onCropWheel}
					onpointerdown={onCropPointerDown}
					onpointermove={onCropPointerMove}
					onpointerup={() => (isDragging = false)}
					onpointercancel={() => (isDragging = false)}
					role="img"
					aria-label="Zone de recadrage"
				></div>
			</div>

			<!-- Curseur de zoom -->
			<div class="flex items-center gap-2 mb-5 px-1">
				<svg class="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" />
				</svg>
				<input
					type="range" min="0" max="100" step="1"
					bind:value={sliderPos}
					oninput={onSliderInput}
					class="flex-1 accent-primary"
				/>
				<svg class="w-5 h-5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
				</svg>
			</div>

			<div class="flex gap-3">
				<Button variant="outline" class="flex-1" onclick={() => (showCropModal = false)}>
					{#snippet children()}Annuler{/snippet}
				</Button>
				<Button class="flex-1" onclick={confirmCrop}>
					{#snippet children()}Confirmer{/snippet}
				</Button>
			</div>
		</div>
	</div>
{/if}
</div>

<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let activeTab = $state<'email' | 'template'>('email');

	// ── Envoi libre ──────────────────────────────────────────────────────────
	let toEmail = $state('');
	let toName = $state('');
	let subject = $state('');
	let message = $state('');
	let sending = $state(false);
	let sendSuccess = $state(false);
	let sendError = $state('');

	async function send() {
		if (!toEmail || !subject || !message) return;
		sending = true;
		sendError = '';
		sendSuccess = false;
		try {
			const res = await fetch('/api/admin/send-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ to_email: toEmail, to_name: toName, subject, message })
			});
			if (!res.ok) {
				const d = await res.json().catch(() => ({}));
				sendError = d.detail || "Erreur lors de l'envoi";
			} else {
				sendSuccess = true;
				toEmail = ''; toName = ''; subject = ''; message = '';
			}
		} catch {
			sendError = 'Erreur réseau';
		} finally {
			sending = false;
		}
	}

	// ── Modèle invitation ─────────────────────────────────────────────────────
	let tplSubject = $state('');
	let tplBody = $state('');
	let tplSaving = $state(false);
	let tplSuccess = $state(false);
	let tplError = $state('');
	let tplLoaded = $state(false);

	async function openTemplate() {
		activeTab = 'template';
		if (tplLoaded) return;
		try {
			const res = await fetch('/api/admin/email-templates/invitation');
			const d = await res.json();
			tplSubject = d.subject ?? '';
			tplBody = d.body ?? '';
			tplLoaded = true;
		} catch {
			tplError = 'Impossible de charger le modèle';
		}
	}

	async function saveTemplate() {
		if (!tplSubject || !tplBody) return;
		tplSaving = true;
		tplSuccess = false;
		tplError = '';
		try {
			const res = await fetch('/api/admin/email-templates/invitation', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subject: tplSubject, body: tplBody })
			});
			if (!res.ok) {
				const d = await res.json().catch(() => ({}));
				tplError = d.detail || 'Erreur lors de la sauvegarde';
			} else {
				tplSuccess = true;
				setTimeout(() => { tplSuccess = false; }, 3000);
			}
		} catch {
			tplError = 'Erreur réseau';
		} finally {
			tplSaving = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<h1 class="text-2xl font-bold mb-1">Emails</h1>
		<p class="text-sm text-muted-foreground">Gérez vos communications depuis la plateforme Vasy.</p>
	</div>

	<!-- Sous-onglets -->
	<div class="flex gap-1 border-b border-border">
		<button
			onclick={() => activeTab = 'email'}
			class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'email'
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:text-foreground'}"
		>
			Envoyer un email
		</button>
		<button
			onclick={openTemplate}
			class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'template'
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:text-foreground'}"
		>
			Modèle invitation
		</button>
	</div>

	<!-- Onglet : Envoyer un email -->
	{#if activeTab === 'email'}
		<Card class="p-6 space-y-4">
			<div class="grid sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-sm font-medium">Email destinataire *</label>
					<input type="email" bind:value={toEmail} placeholder="createur@exemple.com"
						class="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
				</div>
				<div class="space-y-1.5">
					<label class="text-sm font-medium">Prénom / Nom <span class="text-muted-foreground font-normal">(optionnel)</span></label>
					<input type="text" bind:value={toName} placeholder="Marie Dupont"
						class="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
				</div>
			</div>
			<div class="space-y-1.5">
				<label class="text-sm font-medium">Objet *</label>
				<input type="text" bind:value={subject} placeholder="Objet de l'email"
					class="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
			</div>
			<div class="space-y-1.5">
				<label class="text-sm font-medium">Message *</label>
				<textarea bind:value={message} rows="8" placeholder="Rédigez votre message ici…"
					class="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-sans"></textarea>
			</div>
			{#if sendSuccess}
				<div class="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-md border border-green-200">
					Email envoyé avec succès.
				</div>
			{/if}
			{#if sendError}
				<div class="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-md">{sendError}</div>
			{/if}
			<div class="flex justify-end">
				<Button onclick={send} disabled={sending || !toEmail || !subject || !message}>
					{#snippet children()}{sending ? 'Envoi en cours…' : 'Envoyer'}{/snippet}
				</Button>
			</div>
		</Card>
	{/if}

	<!-- Onglet : Modèle invitation -->
	{#if activeTab === 'template'}
		<Card class="p-6 space-y-4">
			<p class="text-sm text-muted-foreground">
				Ce contenu est envoyé automatiquement à chaque créateur invité. Le bouton "Créer mon compte créateur" et le lien d'inscription sont ajoutés automatiquement.
			</p>
			<div class="space-y-1.5">
				<label class="text-sm font-medium">Objet</label>
				<input type="text" bind:value={tplSubject}
					class="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
			</div>
			<div class="space-y-1.5">
				<label class="text-sm font-medium">Contenu</label>
				<textarea bind:value={tplBody} rows="12"
					class="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-sans"></textarea>
			</div>
			{#if tplSuccess}
				<div class="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-md border border-green-200">
					Modèle enregistré. La prochaine invitation utilisera ce contenu.
				</div>
			{/if}
			{#if tplError}
				<div class="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-md">{tplError}</div>
			{/if}
			<div class="flex justify-end">
				<Button onclick={saveTemplate} disabled={tplSaving || !tplSubject || !tplBody}>
					{#snippet children()}{tplSaving ? 'Enregistrement…' : 'Enregistrer le modèle'}{/snippet}
				</Button>
			</div>
		</Card>
	{/if}
</div>

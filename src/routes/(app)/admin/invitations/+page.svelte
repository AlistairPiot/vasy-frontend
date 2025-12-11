<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data, form } = $props();
	let containerRef: HTMLDivElement;
	let emailInput: any;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function formatDate(date: string): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function isExpired(date: string): boolean {
		return new Date(date) < new Date();
	}

	// Animation des messages d'erreur/succès
	$effect(() => {
		if (form?.error || form?.success) {
			gsap.from('.form-message', {
				y: -10,
				opacity: 0,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	});

	let copiedToken = $state<string | null>(null);

	function copyToClipboard(token: string, event: MouseEvent) {
		const url = `${window.location.origin}/invite/${token}`;
		navigator.clipboard.writeText(url);

		copiedToken = token;

		// Animation du bouton
		const button = event.currentTarget as HTMLElement;
		gsap.fromTo(button,
			{ scale: 0.95 },
			{ scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
		);

		// Reset après 2 secondes
		setTimeout(() => {
			copiedToken = null;
		}, 2000);
	}

	function enhanceCreate() {
		return async ({ cancel, formElement }: any) => {
			const formData = new FormData(formElement);
			const email = formData.get('email') as string;

			if (!email) {
				return;
			}

			if (!confirm(`Êtes-vous sûr de vouloir envoyer une invitation à "${email}" ?`)) {
				cancel();
				return;
			}

			return async () => {
				await invalidateAll();
				// Réinitialiser le champ email après succès
				if (emailInput) {
					emailInput.value = '';
				}
			};
		};
	}

	function enhanceDelete(invitationEmail: string) {
		return async ({ cancel }: any) => {
			if (!confirm(`Êtes-vous sûr de vouloir supprimer l'invitation pour "${invitationEmail}" ?\n\nCette action est irréversible.`)) {
				cancel();
				return;
			}

			return async () => {
				await invalidateAll();
			};
		};
	}
</script>

<div bind:this={containerRef}>
	<h1 class="animate-in text-2xl font-bold mb-6">Invitations créateurs</h1>

	<Card class="animate-in p-6 mb-6">
		<h2 class="font-semibold mb-4">Nouvelle invitation</h2>
		<form method="POST" action="?/create" use:enhance={enhanceCreate()} class="flex gap-4" novalidate>
			<div class="flex-1">
				<Input
					bind:this={emailInput}
					type="email"
					name="email"
					placeholder="email@createur.com"
					class={form?.error ? 'border-destructive' : ''}
				/>
			</div>
			<Button type="submit">
				{#snippet children()}
					Inviter
				{/snippet}
			</Button>
		</form>
		{#if form?.error}
			<p class="form-message text-destructive text-sm mt-3">{form.error}</p>
		{/if}
		{#if form?.success}
			<p class="form-message text-green-600 text-sm mt-3">Invitation envoyée avec succès</p>
		{/if}
	</Card>

	<Card class="animate-in">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b">
					<tr>
						<th class="text-left p-4 text-sm font-medium">Email</th>
						<th class="text-left p-4 text-sm font-medium">Statut</th>
						<th class="text-left p-4 text-sm font-medium">Expire le</th>
						<th class="text-left p-4 text-sm font-medium">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.invitations as invitation}
						<tr class="border-b last:border-0">
							<td class="p-4 text-sm">{invitation.email}</td>
							<td class="p-4">
								{#if invitation.is_used}
									<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
										Utilisée
									</span>
								{:else if isExpired(invitation.expires_at)}
									<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
										Expirée
									</span>
								{:else}
									<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
										En attente
									</span>
								{/if}
							</td>
							<td class="p-4 text-sm text-muted-foreground">
								{formatDate(invitation.expires_at)}
							</td>
							<td class="p-4">
								<div class="flex items-center gap-2">
									{#if !invitation.is_used && !isExpired(invitation.expires_at)}
										<button
											onclick={(e) => copyToClipboard(invitation.token, e)}
											class="text-sm text-primary hover:underline inline-flex items-center gap-1.5 transition-colors {copiedToken === invitation.token ? 'text-green-600' : ''}"
										>
											{#if copiedToken === invitation.token}
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<polyline points="20 6 9 17 4 12"/>
												</svg>
												Copié !
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
													<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
												</svg>
												Copier le lien
											{/if}
										</button>
									{/if}
									{#if !invitation.is_used}
										<form method="POST" action="?/delete" use:enhance={enhanceDelete(invitation.email)}>
											<input type="hidden" name="invitationId" value={invitation.id} />
											<Button size="sm" variant="destructive">
												{#snippet children()}
													Supprimer
												{/snippet}
											</Button>
										</form>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>

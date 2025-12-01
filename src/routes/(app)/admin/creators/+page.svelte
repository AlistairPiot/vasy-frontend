<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

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

	let approvingId = $state<string | null>(null);

	function handleApprove(creatorId: string) {
		approvingId = creatorId;
	}

	function enhanceApprove() {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			// Animation de succès sur la ligne
			setTimeout(() => {
				const row = document.querySelector(`[data-creator-id="${approvingId}"]`);
				if (row) {
					gsap.fromTo(row,
						{ backgroundColor: 'rgba(34, 197, 94, 0.2)' },
						{ backgroundColor: 'transparent', duration: 1, ease: 'power2.out' }
					);
				}
				approvingId = null;
			}, 100);
		};
	}
</script>

<div bind:this={containerRef}>
	<h1 class="animate-in text-2xl font-bold mb-6">Créateurs</h1>

	<Card class="animate-in">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b">
					<tr>
						<th class="text-left p-4 text-sm font-medium">Nom</th>
						<th class="text-left p-4 text-sm font-medium">Email</th>
						<th class="text-left p-4 text-sm font-medium">Numéro de SIRET</th>
						<th class="text-left p-4 text-sm font-medium">Statut</th>
						<th class="text-left p-4 text-sm font-medium">Stripe</th>
						<th class="text-left p-4 text-sm font-medium">Inscrit le</th>
						<th class="text-left p-4 text-sm font-medium">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.creators as creator}
						<tr class="border-b last:border-0 transition-colors" data-creator-id={creator.id}>
							<td class="p-4 text-sm font-medium">{creator.display_name}</td>
							<td class="p-4 text-sm text-muted-foreground">{creator.email || '-'}</td>
							<td class="p-4 text-sm font-mono">
								{#if creator.siret}
									<span class="text-foreground">{creator.siret.slice(0, 3)} {creator.siret.slice(3, 6)} {creator.siret.slice(6, 9)} {creator.siret.slice(9)}</span>
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</td>
							<td class="p-4">
								{#if creator.is_approved}
									<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
										Approuvé
									</span>
								{:else}
									<span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
										En attente
									</span>
								{/if}
							</td>
							<td class="p-4">
								{#if creator.stripe_onboarding_complete}
									<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
										Configuré
									</span>
								{:else}
									<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
										Non configuré
									</span>
								{/if}
							</td>
							<td class="p-4 text-sm text-muted-foreground">
								{formatDate(creator.created_at)}
							</td>
							<td class="p-4">
								{#if !creator.is_approved}
									<form method="POST" action="?/approve" use:enhance={enhanceApprove} onsubmit={() => handleApprove(creator.id)}>
										<input type="hidden" name="creatorId" value={creator.id} />
										<Button size="sm" disabled={approvingId === creator.id}>
											{#snippet children()}
												{#if approvingId === creator.id}
													<span class="inline-flex items-center gap-1.5">
														<svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
															<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
															<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
														</svg>
														Approbation...
													</span>
												{:else}
													Approuver
												{/if}
											{/snippet}
										</Button>
									</form>
								{:else}
									<span class="text-xs text-muted-foreground">-</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>

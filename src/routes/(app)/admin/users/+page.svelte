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

	function enhanceDelete(userEmail: string) {
		return async ({ cancel, update }: { cancel: () => void; update: () => Promise<void> }) => {
			if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userEmail}" ?\n\nCette action est irréversible.`)) {
				cancel();
				return;
			}

			await update();
		};
	}
</script>

<div bind:this={containerRef}>
	<h1 class="animate-in text-2xl font-bold mb-6">Utilisateurs</h1>

	<Card class="animate-in">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b">
					<tr>
						<th class="text-left p-4 text-sm font-medium">Email</th>
						<th class="text-left p-4 text-sm font-medium">Statut</th>
						<th class="text-left p-4 text-sm font-medium">Inscrit le</th>
						<th class="text-left p-4 text-sm font-medium">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.users as user}
						<tr class="border-b last:border-0 transition-colors">
							<td class="p-4 text-sm">{user.email}</td>
							<td class="p-4">
								{#if user.is_active}
									<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
										Actif
									</span>
								{:else}
									<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
										Inactif
									</span>
								{/if}
							</td>
							<td class="p-4 text-sm text-muted-foreground">
								{formatDate(user.created_at)}
							</td>
							<td class="p-4">
								<form method="POST" action="?/delete" use:enhance={enhanceDelete(user.email)}>
									<input type="hidden" name="userId" value={user.id} />
									<Button size="sm" variant="destructive">
										{#snippet children()}
											Supprimer
										{/snippet}
									</Button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>

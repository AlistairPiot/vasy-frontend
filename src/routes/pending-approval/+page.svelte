<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
	let cardRef: HTMLDivElement;
	let logoRef: HTMLAnchorElement;

	onMount(() => {
		gsap.to(logoRef, {
			y: 0,
			opacity: 1,
			duration: 0.8,
			ease: 'power3.out'
		});
		gsap.to(cardRef, {
			y: 0,
			opacity: 1,
			duration: 0.6,
			delay: 0.15,
			ease: 'power3.out'
		});
	});
</script>

<div class="min-h-screen bg-background flex flex-col">
	<header class="container mx-auto px-4 py-4 flex justify-between items-center">
		<a href="/" class="text-xl font-bold opacity-0 translate-y-[30px] inline-block" bind:this={logoRef}>Vasy</a>
		<form action="/logout" method="POST">
			<button type="submit" class="text-muted-foreground hover:text-foreground text-sm">
				Déconnexion
			</button>
		</form>
	</header>

	<div class="flex-1 flex items-center justify-center p-4">
		<div bind:this={cardRef} class="w-full max-w-md opacity-0 translate-y-5">
			<Card class="p-8 text-center">
				<div class="mb-6">
					<div class="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600">
							<circle cx="12" cy="12" r="10"/>
							<polyline points="12 6 12 12 16 14"/>
						</svg>
					</div>
					<h1 class="text-2xl font-bold mb-2">En attente d'approbation</h1>
					<p class="text-muted-foreground">
						Bonjour {data.creator.display_name}, votre compte créateur est en cours de validation par notre équipe.
					</p>
				</div>

				<div class="bg-muted/50 rounded-lg p-4 mb-6">
					<p class="text-sm text-muted-foreground">
						Vous recevrez un email dès que votre compte sera activé. En attendant, vous pouvez explorer la plateforme.
					</p>
				</div>

				<div class="flex flex-col gap-3">
					<a href="/products">
						<Button variant="outline" class="w-full">
							{#snippet children()}
								Explorer les produits
							{/snippet}
						</Button>
					</a>
				</div>
			</Card>
		</div>
	</div>
</div>

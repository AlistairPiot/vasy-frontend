<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';

	let heroRef: HTMLDivElement;

	onMount(() => {
		gsap.from(heroRef.querySelectorAll('.animate-in'), {
			y: 30,
			opacity: 0,
			duration: 0.8,
			stagger: 0.15,
			ease: 'power3.out'
		});
	});
</script>

<div class="min-h-screen bg-background" bind:this={heroRef}>
	<header class="container mx-auto px-4 py-6 flex justify-between items-center">
		<div class="animate-in text-2xl font-bold">Vasy</div>
		<nav class="animate-in flex gap-4">
			<a href="/login" class="text-muted-foreground hover:text-foreground">Connexion</a>
			<Button size="sm">
				{#snippet children()}
					S'inscrire
				{/snippet}
			</Button>
		</nav>
	</header>

	<main class="container mx-auto px-4 py-20 text-center">
		<h1 class="animate-in text-5xl font-bold mb-6">
			La plateforme des créateurs français
		</h1>
		<p class="animate-in text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
			Découvrez des produits artisanaux uniques créés par des artisans passionnés.
			Vendez vos créations en toute simplicité.
		</p>
		<div class="animate-in flex gap-4 justify-center">
			<Button size="lg">
				{#snippet children()}
					Explorer les produits
				{/snippet}
			</Button>
			<Button variant="outline" size="lg">
				{#snippet children()}
					En savoir plus
				{/snippet}
			</Button>
		</div>
	</main>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
	let heroRef: HTMLDivElement;

	onMount(() => {
		gsap.to(heroRef.querySelectorAll('.animate-in'), {
			y: 0,
			opacity: 1,
			duration: 0.8,
			stagger: 0.15,
			ease: 'power3.out'
		});
	});
</script>

<div class="min-h-screen bg-background" bind:this={heroRef}>
	<header class="container mx-auto px-4 py-4 flex justify-between items-center">
		<div class="animate-in text-xl font-bold opacity-0 translate-y-[30px]">Vasy</div>
		<nav class="animate-in flex gap-4 items-center opacity-0 translate-y-[30px]">
			{#if data.user}
				<a href="/dashboard">
					<Button size="sm">
						{#snippet children()}
							Tableau de bord
						{/snippet}
					</Button>
				</a>
			{:else}
				<a href="/login" class="text-muted-foreground hover:text-foreground">Connexion</a>
				<a href="/register">
					<Button size="sm">
						{#snippet children()}
							S'inscrire
						{/snippet}
					</Button>
				</a>
			{/if}
		</nav>
	</header>

	<main class="container mx-auto px-4 py-20 text-center">
		<h1 class="animate-in text-5xl font-bold mb-6 opacity-0 translate-y-[30px]">
			La plateforme des créateurs français
		</h1>
		<p class="animate-in text-xl text-muted-foreground mb-8 max-w-2xl mx-auto opacity-0 translate-y-[30px]">
			Découvrez des produits artisanaux uniques créés par des artisans passionnés.
			Vendez vos créations en toute simplicité.
		</p>
		<div class="animate-in flex gap-4 justify-center opacity-0 translate-y-[30px]">
			<a href="/products">
				<Button size="lg">
					{#snippet children()}
						Explorer les produits
					{/snippet}
				</Button>
			</a>
			<Button variant="outline" size="lg">
				{#snippet children()}
					En savoir plus
				{/snippet}
			</Button>
		</div>
	</main>
</div>

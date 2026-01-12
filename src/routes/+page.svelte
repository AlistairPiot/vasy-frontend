<script lang="ts">
	import backgroundImage from '$lib/assets/sac.jpg';
	import Button from '$lib/components/ui/Button.svelte';
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';

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

<div class="min-h-screen relative overflow-hidden" bind:this={heroRef}>
	<!-- Image de fond avec blur -->
	<div class="absolute inset-0 z-0">
		<img
			src={backgroundImage}
			alt="Background"
			class="w-full h-full object-cover opacity-100"
		/>
		<div class="absolute inset-0 bg-black/70"></div>
	</div>

	<!-- Contenu au premier plan -->
	<div class="relative z-10">
	<header class="container mx-auto px-4 py-4 flex justify-between items-center">
		<div class="animate-in text-xl font-bold opacity-0 translate-y-[30px] text-white">Vasy</div>
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
				<a href="/login" class="text-gray-200 hover:text-white">Connexion</a>
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
		<h1 class="animate-in text-5xl font-bold mb-6 opacity-0 translate-y-[30px] text-white">
			La plateforme des créateurs français
		</h1>
		<p class="animate-in text-xl text-gray-200 mb-8 max-w-2xl mx-auto opacity-0 translate-y-[30px]">
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
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import logo from '$lib/assets/vasy.svg';

	let containerRef: HTMLDivElement;

	const messages: Record<number, { title: string; description: string }> = {
		404: {
			title: 'Page introuvable',
			description: "La page que vous cherchez n'existe pas ou a été déplacée."
		},
		403: {
			title: 'Accès refusé',
			description: "Vous n'avez pas les droits nécessaires pour accéder à cette page."
		},
		500: {
			title: 'Erreur serveur',
			description: 'Une erreur inattendue est survenue. Réessayez dans quelques instants.'
		}
	};

	const status = $derived($page.status);
	const content = $derived(messages[status] ?? { title: 'Une erreur est survenue', description: $page.error?.message ?? 'Quelque chose s\'est mal passé.' });

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 24,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});
</script>

<div class="min-h-screen bg-background flex flex-col items-center justify-center px-4" bind:this={containerRef}>
	<a href="/" class="animate-in mb-10">
		<img src={logo} alt="Vasy" class="h-10 w-auto" />
	</a>

	<p class="animate-in text-7xl font-bold text-primary mb-4">{status}</p>

	<h1 class="animate-in text-2xl font-semibold mb-3">{content.title}</h1>

	<p class="animate-in text-muted-foreground text-center max-w-sm mb-8">
		{content.description}
	</p>

	<a
		href="/"
		class="animate-in inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M19 12H5M12 19l-7-7 7-7"/>
		</svg>
		Retour à l'accueil
	</a>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	let { children, data } = $props();
	let containerRef: HTMLDivElement;

	// Mapper les routes aux titres
	const pageTitles: Record<string, string> = {
		'/legal/about': 'À propos de nous',
		'/legal/cgv': 'CGV',
		'/legal/cgu': 'CGU',
		'/legal/privacy': 'Confidentialité',
		'/legal/mentions': 'Mentions légales'
	};

	let currentPageTitle = $derived(pageTitles[$page.url.pathname] || 'Légal');

	onMount(() => {
		if (containerRef) {
			const elements = containerRef.querySelectorAll('.animate-in');
			gsap.from(elements, {
				y: 20,
				opacity: 0,
				duration: 0.6,
				stagger: 0.1,
				ease: 'power3.out'
			});
		}
	});
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<div class="container mx-auto px-4 pb-8 pt-24">
		<div class="animate-in">
			<Breadcrumb compact items={[
				{ label: 'Accueil', href: '/' },
				{ label: currentPageTitle }
			]} />
		</div>

		<!-- Contenu de la page -->
		<div class="animate-in">
			{@render children()}
		</div>

		<!-- Retour à l'accueil -->
		<div class="mt-16 mb-8 animate-in">
			<a
				href="/"
				class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="transition-transform group-hover:-translate-x-1"
				>
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
				Retour à l'accueil
			</a>
		</div>
	</div>
</div>

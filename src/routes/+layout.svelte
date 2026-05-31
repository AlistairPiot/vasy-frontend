<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import favicon from '$lib/assets/favicon_vasy.png';
	import { cart } from '$lib/stores/cart';
	import { favorites } from '$lib/stores/favorites';
	import { eventFavorites } from '$lib/stores/eventFavorites';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import { lenisStore } from '$lib/stores/lenis';

	let { children, data } = $props();

	let lenisInstance: any = null;
	let pageContent: HTMLDivElement;
	let progressBar: HTMLDivElement;

	$effect(() => {
		if (typeof window !== 'undefined') {
			cart.init(data.user?.id || null);
			favorites.init(data.favoriteIds ?? []);
			eventFavorites.init(data.user?.id || null);
		}
	});

	onMount(async () => {
		if (!browser) return;

		gsap.registerPlugin(ScrollTrigger);

		const { default: Lenis } = await import('lenis');

		lenisInstance = new Lenis({
			duration: 1.2,
			easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			orientation: 'vertical',
			smoothWheel: true,
		});

		lenisInstance.on('scroll', ScrollTrigger.update);

		gsap.ticker.add((time) => { lenisInstance.raf(time * 1000); });
		gsap.ticker.lagSmoothing(0);

		lenisStore.set(lenisInstance);

		return () => {
			lenisInstance?.destroy();
			lenisInstance = null;
			lenisStore.set(null);
		};
	});

	afterNavigate(({ type }) => {
		if (lenisInstance) {
			lenisInstance.scrollTo(0, { immediate: true });
			lenisInstance.resize();
		} else if (browser) {
			window.scrollTo(0, 0);
		}

		if (type === 'enter') return;

		// Barre de progression
		gsap.set(progressBar, { scaleX: 0, opacity: 1, transformOrigin: 'left center' });
		gsap.to(progressBar, {
			scaleX: 1,
			duration: 0.3,
			ease: 'power2.out',
			onComplete: () => {
				gsap.to(progressBar, { opacity: 0, duration: 0.2 });
			},
		});

		// Fade-in rapide sans mouvement
		gsap.killTweensOf(pageContent);
		gsap.fromTo(
			pageContent,
			{ opacity: 0 },
			{ opacity: 1, duration: 0.2, ease: 'power1.out', clearProps: 'opacity' }
		);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Barre de progression inter-routes -->
<div
	bind:this={progressBar}
	class="fixed top-0 left-0 w-full h-0.5 bg-primary z-1000 pointer-events-none"
	style="opacity: 0; transform: scaleX(0); transform-origin: left center;"
></div>

<div class="flex flex-col min-h-screen">
	<div class="flex-1" bind:this={pageContent}>
		{@render children()}
	</div>
	<Footer />
	<ScrollToTop />
</div>

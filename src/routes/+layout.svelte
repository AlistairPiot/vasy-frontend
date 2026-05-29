<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import favicon from '$lib/assets/favicon_vasy.png';
	import { cart } from '$lib/stores/cart';
	import { favorites } from '$lib/stores/favorites';
	import { eventFavorites } from '$lib/stores/eventFavorites';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';

	let { children, data } = $props();

	let lenisInstance: any = null;

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

		return () => {
			lenisInstance?.destroy();
			lenisInstance = null;
		};
	});

	// Retour en haut à chaque navigation (compatible Lenis)
	afterNavigate(() => {
		if (lenisInstance) {
			lenisInstance.scrollTo(0, { immediate: true });
		} else if (browser) {
			window.scrollTo(0, 0);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex flex-col min-h-screen">
	<div class="flex-1">
		{@render children()}
	</div>
	<Footer />
	<ScrollToTop />
</div>

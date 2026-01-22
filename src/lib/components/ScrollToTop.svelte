<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	let buttonRef: HTMLButtonElement;
	let isVisible = $state(false);

	onMount(() => {
		const handleScroll = () => {
			// Afficher le bouton après 300px de défilement
			if (window.scrollY > 300) {
				if (!isVisible) {
					isVisible = true;
					gsap.to(buttonRef, {
						opacity: 1,
						scale: 1,
						duration: 0.3,
						ease: 'back.out(1.7)'
					});
				}
			} else {
				if (isVisible) {
					isVisible = false;
					gsap.to(buttonRef, {
						opacity: 0,
						scale: 0,
						duration: 0.2,
						ease: 'power2.in'
					});
				}
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}
</script>

<button
	bind:this={buttonRef}
	onclick={scrollToTop}
	class="fixed bottom-6 right-6 z-50 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center opacity-0 scale-0 group"
	aria-label="Retour en haut"
>
	<svg
		class="w-6 h-6 transition-transform group-hover:-translate-y-1"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M5 10l7-7m0 0l7 7m-7-7v18"
		/>
	</svg>
</button>

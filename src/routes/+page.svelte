<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Button from '$lib/components/ui/Button.svelte';
	import backgroundImage from '$lib/assets/sac.jpg';
	import logo from '$lib/assets/vasy.svg';

	let { data } = $props();
	let heroRef: HTMLDivElement;
	let headerRef: HTMLElement;
	let scrollY = $state(0);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// Animation hero au chargement
		gsap.to(heroRef.querySelectorAll('.animate-in'), {
			y: 0,
			opacity: 1,
			duration: 0.8,
			stagger: 0.15,
			ease: 'power3.out'
		});

		// Parallax sur l'image de fond
		gsap.to('.hero-bg', {
			y: 200,
			ease: 'none',
			scrollTrigger: {
				trigger: heroRef,
				start: 'top top',
				end: 'bottom top',
				scrub: true
			}
		});

		// Animation des sections au scroll
		gsap.utils.toArray('.fade-in-section').forEach((section: any) => {
			gsap.from(section, {
				y: 50,
				opacity: 0,
				duration: 1,
				scrollTrigger: {
					trigger: section,
					start: 'top 80%',
					end: 'top 50%',
					scrub: 1
				}
			});
		});

		// Effet glassmorphism au scroll
		const handleScroll = () => {
			scrollY = window.scrollY;
		};
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			ScrollTrigger.getAll().forEach(trigger => trigger.kill());
		};
	});
</script>

<!-- Header avec effet glassmorphism -->
<header
	bind:this={headerRef}
	class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrollY > 50
		? 'bg-white/80 backdrop-blur-md shadow-lg'
		: 'bg-transparent'}"
>
	<div class="container mx-auto px-4 py-4 flex justify-between items-center">
		<a href="/" class="flex items-center gap-2 cursor-pointer">
			<img src={logo} alt="Vasy" class="h-10 w-auto {scrollY > 50 ? '' : 'brightness-0 invert'}" />
		</a>
		<nav class="flex gap-6 items-center">
			{#if data.user}
				<a href="/dashboard" class="cursor-pointer">
					<Button size="sm">
						{#snippet children()}
							Tableau de bord
						{/snippet}
					</Button>
				</a>
			{:else}
				<a
					href="/login"
					class="text-sm font-medium transition-colors cursor-pointer {scrollY > 50
						? 'text-gray-700 hover:text-primary'
						: 'text-white hover:text-gray-200'}"
				>
					Connexion
				</a>
				<a href="/register" class="cursor-pointer">
					<Button size="sm" class="cursor-pointer">
						{#snippet children()}
							S'inscrire
						{/snippet}
					</Button>
				</a>
			{/if}
		</nav>
	</div>
</header>

<!-- Hero Section -->
<div class="min-h-screen relative overflow-hidden" bind:this={heroRef}>
	<!-- Image de fond avec parallax -->
	<div class="absolute inset-0 z-0 hero-bg">
		<img src={backgroundImage} alt="Background" class="w-full h-full object-cover" />
		<div
			class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"
		></div>
		<!-- Gradient radial pour focus central -->
		<div
			class="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/50"
		></div>
	</div>

	<!-- Contenu hero -->
	<div class="relative z-10 min-h-screen flex items-center">
		<div class="container mx-auto px-4 py-32 text-center">
			<!-- Badge -->
			<div class="animate-in opacity-0 translate-y-[30px] mb-6 inline-block">
				<span
					class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium"
				>
					<span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
					100% Artisans français
				</span>
			</div>

			<!-- Titre principal avec meilleure hiérarchie -->
			<h1
				class="animate-in text-6xl md:text-7xl font-bold mb-6 opacity-0 translate-y-[30px] text-white leading-tight"
			>
				La plateforme des
				<span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
					créateurs français
				</span>
			</h1>

			<!-- Sous-titre -->
			<p
				class="animate-in text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto opacity-0 translate-y-[30px] leading-relaxed"
			>
				Découvrez des produits artisanaux uniques créés par des artisans passionnés. Vendez vos
				créations en toute simplicité.
			</p>

			<!-- CTA avec micro-interactions -->
			<div class="animate-in flex flex-col sm:flex-row gap-4 justify-center opacity-0 translate-y-[30px]">
				<a href="/products" class="group cursor-pointer">
					<Button size="lg" class="relative overflow-hidden cursor-pointer">
						{#snippet children()}
							<span class="relative z-10 flex items-center gap-2">
								Explorer les produits
								<svg
									class="w-5 h-5 transition-transform group-hover:translate-x-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 7l5 5m0 0l-5 5m5-5H6"
									/>
								</svg>
							</span>
							<span
								class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
							></span>
						{/snippet}
					</Button>
				</a>
				<a href="/legal/about" class="cursor-pointer">
					<Button
						variant="outline"
						size="lg"
						class="!border-white !text-white !bg-transparent hover:!bg-white hover:!text-primary backdrop-blur-sm cursor-pointer"
					>
						{#snippet children()}
							En savoir plus
						{/snippet}
					</Button>
				</a>
			</div>

			<!-- Scroll indicator -->
			<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
				<svg
					class="w-6 h-6 text-white/60"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 14l-7 7m0 0l-7-7m7 7V3"
					/>
				</svg>
			</div>
		</div>
	</div>
</div>

<!-- Badges de réassurance -->
<section class="py-12 bg-white border-y border-gray-200 fade-in-section">
	<div class="container mx-auto px-4">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
			<div class="flex flex-col items-center gap-3">
				<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="text-sm font-medium text-gray-700">Paiement sécurisé</p>
			</div>
			<div class="flex flex-col items-center gap-3">
				<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="text-sm font-medium text-gray-700">Livraison rapide</p>
			</div>
			<div class="flex flex-col items-center gap-3">
				<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
				<p class="text-sm font-medium text-gray-700">Fait avec passion</p>
			</div>
			<div class="flex flex-col items-center gap-3">
				<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
				<p class="text-sm font-medium text-gray-700">Support 7j/7</p>
			</div>
		</div>
	</div>
</section>

<!-- Comment ça marche -->
<section class="py-24 bg-gray-50 fade-in-section">
	<div class="container mx-auto px-4">
		<div class="text-center mb-16">
			<h2 class="text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto">
				Rejoignez notre communauté en quelques étapes simples
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-12">
			<!-- Étape 1 -->
			<div class="text-center group">
				<div
					class="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform"
				>
					1
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-4">Inscrivez-vous</h3>
				<p class="text-gray-600 leading-relaxed">
					Créez votre compte gratuitement en quelques secondes. Choisissez votre rôle : créateur ou
					client.
				</p>
			</div>

			<!-- Étape 2 -->
			<div class="text-center group">
				<div
					class="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform"
				>
					2
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-4">Explorez ou vendez</h3>
				<p class="text-gray-600 leading-relaxed">
					Découvrez des milliers de produits artisanaux ou ajoutez vos propres créations à notre
					catalogue.
				</p>
			</div>

			<!-- Étape 3 -->
			<div class="text-center group">
				<div
					class="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform"
				>
					3
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-4">Profitez</h3>
				<p class="text-gray-600 leading-relaxed">
					Recevez vos commandes rapidement ou développez votre activité avec nos outils dédiés.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Mise en avant créateurs/produits -->
<section class="py-24 bg-white fade-in-section">
	<div class="container mx-auto px-4">
		<div class="text-center mb-16">
			<h2 class="text-4xl font-bold text-gray-900 mb-4">Nos créateurs passionnés</h2>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto">
				Découvrez le talent et le savoir-faire de nos artisans
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 mb-12">
			{#each Array(3) as _, i}
				<div
					class="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
				>
					<div class="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
						></div>
					</div>
					<div class="p-6">
						<h3 class="text-xl font-bold text-gray-900 mb-2">Artisan {i + 1}</h3>
						<p class="text-gray-600 mb-4">Créateur de maroquinerie artisanale</p>
						<a href="/products" class="text-primary hover:underline font-medium cursor-pointer">
							Voir les produits →
						</a>
					</div>
				</div>
			{/each}
		</div>

		<div class="text-center">
			<a href="/products" class="cursor-pointer">
				<Button size="lg" class="cursor-pointer">
					{#snippet children()}
						Découvrir tous les produits
					{/snippet}
				</Button>
			</a>
		</div>
	</div>
</section>

<!-- CTA Final -->
<section class="py-24 bg-primary text-white fade-in-section">
	<div class="container mx-auto px-4 text-center">
		<h2 class="text-4xl font-bold mb-6">Prêt à rejoindre l'aventure ?</h2>
		<p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
			Que vous soyez créateur ou client, Vasy est la plateforme idéale pour découvrir et partager
			l'artisanat français.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/register" class="cursor-pointer">
				<Button size="lg" class="bg-white text-primary hover:bg-gray-100 cursor-pointer">
					{#snippet children()}
						Créer un compte
					{/snippet}
				</Button>
			</a>
			<a href="/products" class="cursor-pointer">
				<Button size="lg" variant="outline" class="!border-white !text-white !bg-transparent hover:!bg-white hover:!text-primary cursor-pointer">
					{#snippet children()}
						Explorer les produits
					{/snippet}
				</Button>
			</a>
		</div>
	</div>
</section>

<style>
	/* Gradient radial personnalisé */
	.bg-gradient-radial {
		background: radial-gradient(circle at center, var(--tw-gradient-stops));
	}

	/* Animation personnalisée pour le scroll indicator */
	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0) translateX(-50%);
		}
		50% {
			transform: translateY(-10px) translateX(-50%);
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Button from '$lib/components/ui/Button.svelte';
	import backgroundImage from '$lib/assets/sac.jpg';
	import logo from '$lib/assets/vasy.svg';
	import { tilt } from '$lib/actions/tilt';
	import textureCuir from '$lib/assets/cuir.jpg';
	import textureBois from '$lib/assets/bois.jpg';
	import textureLifege from '$lib/assets/liege.jpg';

	let { data } = $props();
	let heroRef: HTMLDivElement;
	let h1Ref: HTMLHeadingElement;
	let scrollY = $state(0);
	let mobileMenuOpen = $state(false);

	// Spotlight lerp — position + opacité cible et courante par card
	const _spotTarget  = [{ x: 50, y: 50, op: 0 }, { x: 50, y: 50, op: 0 }, { x: 50, y: 50, op: 0 }];
	const _spotCurrent = [{ x: 50, y: 50, op: 0 }, { x: 50, y: 50, op: 0 }, { x: 50, y: 50, op: 0 }];
	const _spotRafs: number[] = [0, 0, 0];

	function startSpotLerp(el: HTMLElement, i: number) {
		cancelAnimationFrame(_spotRafs[i]);
		function frame() {
			const c = _spotCurrent[i], t = _spotTarget[i];
			c.x += (t.x - c.x) * 0.07;
			c.y += (t.y - c.y) * 0.07;
			// fadeIn plus rapide que fadeOut
			const opLerp = t.op > c.op ? 0.12 : 0.07;
			c.op += (t.op - c.op) * opLerp;
			el.style.setProperty('--mx', c.x.toFixed(2) + '%');
			el.style.setProperty('--my', c.y.toFixed(2) + '%');
			el.style.setProperty('--spot-op', c.op.toFixed(3));
			// s'arrête tout seul une fois fondu
			if (t.op === 0 && c.op < 0.005) {
				el.style.setProperty('--spot-op', '0');
				return;
			}
			_spotRafs[i] = requestAnimationFrame(frame);
		}
		_spotRafs[i] = requestAnimationFrame(frame);
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		gsap.set(h1Ref.querySelectorAll('.word-inner'), { y: '110%' });

		gsap.to('.hero-tagline', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 });

		gsap.to(h1Ref.querySelectorAll('.word-inner'), {
			y: '0%',
			duration: 0.85,
			stagger: 0.07,
			ease: 'power3.out',
			delay: 0.3
		});

		gsap.to('.hero-subtitle', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.0 });
		gsap.to('.hero-cta',      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.2 });

		gsap.to('.hero-bg', {
			y: 180,
			ease: 'none',
			scrollTrigger: {
				trigger: heroRef,
				start: 'top top',
				end: 'bottom top',
				scrub: true
			}
		});

		gsap.utils.toArray('.fade-in-section').forEach((section: any) => {
			gsap.from(section, {
				y: 60,
				opacity: 0,
				duration: 1.2,
				scrollTrigger: {
					trigger: section,
					start: 'top 82%',
					end: 'top 55%',
					scrub: 1
				}
			});
		});

		const handleScroll = () => { scrollY = window.scrollY; };
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
			ScrollTrigger.getAll().forEach(t => t.kill());
		};
	});
</script>

<!-- Header -->
<header class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b {(scrollY > 50 || mobileMenuOpen) ? 'bg-background/95 backdrop-blur-md shadow-sm border-border' : 'bg-transparent border-transparent'}">
	<div class="container mx-auto px-4 md:px-6 py-4">
		<div class="flex justify-between items-center">
			<a href="/" class="flex items-center gap-2 cursor-pointer">
				<img src={logo} alt="Vasy" class="h-9 w-auto {(scrollY > 50 || mobileMenuOpen) ? '' : 'brightness-0 invert'}" />
			</a>

			<!-- Desktop nav -->
			<nav class="hidden sm:flex gap-6 items-center">
				{#if data.user}
					<a href="/dashboard">
						<Button size="sm">
							{#snippet children()}Mon espace{/snippet}
						</Button>
					</a>
				{:else}
					<a href="/login" class="text-sm font-medium transition-colors {scrollY > 50 ? 'text-foreground/70 hover:text-foreground' : 'text-white/80 hover:text-white'}">
						Connexion
					</a>
					<a href="/register">
						<Button size="sm" class="{scrollY > 50 ? '' : 'bg-white/15! text-white! border-white/30! backdrop-blur-sm hover:bg-white/25!'}">
							{#snippet children()}S'inscrire{/snippet}
						</Button>
					</a>
				{/if}
			</nav>

			<!-- Mobile hamburger -->
			<button
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				class="sm:hidden p-2 rounded-md transition-colors {(scrollY > 50 || mobileMenuOpen) ? 'text-foreground/70 hover:text-foreground hover:bg-accent' : 'text-white/80 hover:text-white'}"
				aria-label="Menu"
			>
				{#if mobileMenuOpen}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div transition:slide={{ duration: 200 }} class="sm:hidden mt-3 pt-3 border-t border-border/40">
				{#if data.user}
					<a href="/dashboard" onclick={() => mobileMenuOpen = false} class="block py-2.5 px-1 text-sm font-medium text-foreground hover:text-primary transition-colors border-b border-border/30">
						Mon espace
					</a>
				{:else}
					<div class="flex flex-col gap-1 pb-2">
						<a href="/login" onclick={() => mobileMenuOpen = false} class="py-2.5 px-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors border-b border-border/30">
							Connexion
						</a>
						<a href="/register" onclick={() => mobileMenuOpen = false} class="pt-2">
							<Button size="sm" class="w-full">
								{#snippet children()}S'inscrire{/snippet}
							</Button>
						</a>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</header>

<!-- Hero -->
<div class="min-h-screen relative overflow-hidden" bind:this={heroRef}>
	<div class="absolute inset-0 z-0 hero-bg">
		<img src={backgroundImage} alt="Artisan au travail" class="w-full h-full object-cover" />
		<div class="absolute inset-0 bg-linear-to-b from-black/50 via-black/40 to-black/70"></div>
		<div class="absolute inset-0 bg-[#2C1F14]/30"></div>
	</div>

	<div class="relative z-10 min-h-screen flex items-center">
		<div class="container mx-auto px-5 md:px-6 py-16 md:py-24 lg:py-32 text-center">

			<p class="hero-tagline opacity-0 translate-y-5 text-white/60 text-sm tracking-[0.25em] uppercase mb-6 md:mb-8 font-medium">
				Artisanat français
			</p>

			<h1 bind:this={h1Ref} class="text-3xl sm:text-5xl md:text-7xl text-white mb-6 leading-tight">
				<span class="word-wrap overflow-hidden inline-block"><span class="word-inner inline-block" style="transform:translateY(110%)">Fait</span></span>
				<span class="word-wrap overflow-hidden inline-block"><span class="word-inner inline-block" style="transform:translateY(110%)">avec</span></span>
				<span class="word-wrap overflow-hidden inline-block"><span class="word-inner inline-block" style="transform:translateY(110%)">les</span></span>
				<span class="word-wrap overflow-hidden inline-block"><span class="word-inner inline-block" style="transform:translateY(110%)">mains,</span></span><br />
				<em class="not-italic text-[#E8A882]"><span class="word-wrap overflow-hidden inline-block"><span class="word-inner inline-block" style="transform:translateY(110%)">vendu</span></span>
				<span class="word-wrap overflow-hidden inline-block"><span class="word-inner inline-block" style="transform:translateY(110%)">avec</span></span>
				<span class="word-wrap overflow-hidden inline-block"><span class="word-inner inline-block" style="transform:translateY(110%)">le</span></span>
				<span class="word-wrap overflow-hidden inline-block"><span class="word-inner inline-block" style="transform:translateY(110%)">cœur.</span></span></em>
			</h1>

			<p class="hero-subtitle opacity-0 translate-y-5 text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
				Découvrez des créations uniques imaginées et façonnées par des artisans passionnés.
			</p>

			<div class="hero-cta opacity-0 translate-y-5 flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/products">
					<Button size="lg" class="bg-[#C4704A]! text-white! border-transparent! hover:bg-[#B5623C]! cursor-pointer">
						{#snippet children()}
							Explorer les créations
						{/snippet}
					</Button>
				</a>
				<a href="/legal/about">
					<Button variant="outline" size="lg" class="border-white/40! text-white! bg-transparent! hover:bg-white/10! cursor-pointer">
						{#snippet children()}
							Notre histoire
						{/snippet}
					</Button>
				</a>
			</div>
		</div>
	</div>

	<button
		onclick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
		class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
		aria-label="Défiler vers le bas"
	>
		<svg class="w-8 h-8 text-white/40 hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
		</svg>
	</button>
</div>

<!-- Bandeau événements -->
<section class="py-8 border-b border-border fade-in-section">
	<div class="container mx-auto px-4 md:px-6">
		<a href="/events" class="group flex items-center justify-center gap-3 md:gap-6">
			<div class="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
				<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
			<div>
				<p class="font-semibold text-foreground">Rencontrez vos créateurs en personne</p>
				<p class="text-sm text-muted-foreground">Marchés, ateliers et expositions — voir les événements</p>
			</div>
			<svg class="w-5 h-5 text-primary transition-transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
			</svg>
		</a>
	</div>
</section>

<!-- Réassurance -->
<section class="py-16 fade-in-section">
	<div class="container mx-auto px-4 md:px-6">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
			<div class="flex flex-col items-center gap-3">
				<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
					<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<p class="text-sm font-medium text-foreground">Paiement sécurisé</p>
			</div>
			<div class="flex flex-col items-center gap-3">
				<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
					<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
					</svg>
				</div>
				<p class="text-sm font-medium text-foreground">Livraison soignée</p>
			</div>
			<div class="flex flex-col items-center gap-3">
				<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
					<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
					</svg>
				</div>
				<p class="text-sm font-medium text-foreground">Fait main</p>
			</div>
			<div class="flex flex-col items-center gap-3">
				<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
					<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<p class="text-sm font-medium text-foreground">100% français</p>
			</div>
		</div>
	</div>
</section>

<!-- SVG clip-path definitions (hidden) -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
	<defs>
		<!--
			outer r=0.025 (Q), depth=4%, inner wall 20%–80%
			single 45° diagonal per corner: face→inner wall direct, no horizontal lip
			Card 1: right notch only
		-->
		<clipPath id="clip-step-0" clipPathUnits="objectBoundingBox">
			<path d="M 0.025,0 L 0.975,0 Q 1,0 1,0.025 L 1,0.16 L 0.96,0.20 L 0.96,0.80 L 1,0.84 L 1,0.975 Q 1,1 0.975,1 L 0.025,1 Q 0,1 0,0.975 L 0,0.025 Q 0,0 0.025,0 Z"/>
		</clipPath>
		<!-- Card 2: left protrusion + right notch -->
		<clipPath id="clip-step-1" clipPathUnits="objectBoundingBox">
			<path d="M 0.065,0 L 0.975,0 Q 1,0 1,0.025 L 1,0.16 L 0.96,0.20 L 0.96,0.80 L 1,0.84 L 1,0.975 Q 1,1 0.975,1 L 0.065,1 Q 0.04,1 0.04,0.975 L 0.04,0.84 L 0,0.80 L 0,0.20 L 0.04,0.16 L 0.04,0.025 Q 0.04,0 0.065,0 Z"/>
		</clipPath>
		<!-- Card 3: left protrusion only -->
		<clipPath id="clip-step-2" clipPathUnits="objectBoundingBox">
			<path d="M 0.065,0 L 0.975,0 Q 1,0 1,0.025 L 1,0.975 Q 1,1 0.975,1 L 0.065,1 Q 0.04,1 0.04,0.975 L 0.04,0.84 L 0,0.80 L 0,0.20 L 0.04,0.16 L 0.04,0.025 Q 0.04,0 0.065,0 Z"/>
		</clipPath>
	</defs>
</svg>

<!-- Comment ça marche -->
<section class="relative py-16 md:py-28 overflow-hidden fade-in-section">
	<div class="absolute inset-0 bg-[#0E0804]"></div>
	<div class="absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle, #C4704A 1px, transparent 1px); background-size: 32px 32px;"></div>

	<div class="relative container mx-auto px-4 md:px-6">
		<div class="text-center mb-10 md:mb-16">
			<p class="text-[#E8A882]/60 text-xs tracking-[0.35em] uppercase mb-4 font-medium">Fonctionnement</p>
			<h2 class="text-2xl sm:text-3xl md:text-5xl text-white mb-4">Comment ça marche ?</h2>
			<p class="text-white/35 max-w-xl mx-auto leading-relaxed">
				Rejoignez notre communauté en quelques étapes simples
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-y-6 md:gap-x-8">
			{#each [
				{
					n: '01', title: 'Inscrivez-vous',
					text: 'Créez votre compte gratuitement en quelques secondes.',
					texture: textureCuir,
					glow: 'rgba(196,80,45,0.5)',
				},
				{
					n: '02', title: 'Explorez ou créez',
					text: 'Découvrez des produits artisanaux uniques ou ajoutez vos propres créations.',
					texture: textureBois,
					glow: 'rgba(196,138,55,0.5)',
				},
				{
					n: '03', title: 'Profitez',
					text: 'Recevez vos commandes ou développez votre activité avec nos outils dédiés.',
					texture: textureLifege,
					glow: 'rgba(220,165,85,0.5)',
				}
			] as step, i}
				<div
					use:tilt={{ intensity: 6 }}
					class="group relative overflow-hidden bg-white/4 p-6 md:p-8 transition-colors duration-500 cursor-default {i === 0 ? 'step-0' : i === 1 ? 'step-1' : 'step-2'}"
					style="z-index: {i + 1}; --mx: 50%; --my: 50%; --spot-op: 0;"
					onmouseenter={(e) => {
						const r = e.currentTarget.getBoundingClientRect();
						const x = (e.clientX - r.left) / r.width * 100;
						const y = (e.clientY - r.top) / r.height * 100;
						_spotTarget[i].x = x; _spotTarget[i].y = y; _spotTarget[i].op = 1;
						_spotCurrent[i].x = x; _spotCurrent[i].y = y;
						startSpotLerp(e.currentTarget as HTMLElement, i);
					}}
					onmousemove={(e) => {
						const r = e.currentTarget.getBoundingClientRect();
						_spotTarget[i].x = (e.clientX - r.left) / r.width * 100;
						_spotTarget[i].y = (e.clientY - r.top) / r.height * 100;
					}}
					onmouseleave={() => { _spotTarget[i].op = 0; }}
				>
					<!-- Texture spotlight sous le curseur -->
					<div
						class="absolute inset-0 pointer-events-none"
						style="opacity: calc(var(--spot-op) * 0.7); background-image: url({step.texture}); background-size: cover; background-position: center; mask-image: radial-gradient(circle 90px at var(--mx) var(--my), black 20%, transparent 100%); -webkit-mask-image: radial-gradient(circle 90px at var(--mx) var(--my), black 20%, transparent 100%);"
					></div>
					<!-- Glow couleur au curseur -->
					<div
						class="absolute inset-0 pointer-events-none"
						style="opacity: var(--spot-op); background: radial-gradient(circle 70px at var(--mx) var(--my), {step.glow} 0%, transparent 100%);"
					></div>
					<!-- Top highlight line -->
					<div class="absolute inset-x-0 top-0 h-px pointer-events-none" style="opacity: calc(var(--spot-op) * 0.6); background: linear-gradient(90deg, transparent, {step.glow}, transparent);"></div>

					<div class="relative z-10">
						<div class="flex justify-end mb-10">
							<span class="text-white/15 text-xs tracking-widest font-bold tabular-nums transition-colors duration-500 group-hover:text-white/50">{step.n}</span>
						</div>
						<h3 class="text-xl font-semibold text-white/70 mb-3 transition-colors duration-300 group-hover:text-white">{step.title}</h3>
						<p class="text-white/30 text-sm leading-relaxed transition-colors duration-500 group-hover:text-white/80">{step.text}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Section produits -->
<section class="py-14 md:py-24 fade-in-section">
	<div class="container mx-auto px-4 md:px-6">
		<div class="flex items-end justify-between mb-6 md:mb-12">
			<h2 class="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-foreground max-w-xs leading-tight">
				Nos dernières<br /><em class="not-italic text-primary">créations</em>
			</h2>
			<a href="/products" class="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
				Tout voir
				<svg class="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</a>
		</div>

		{#if data.featuredProducts.length > 0}
			<div class="columns-2 md:columns-3 gap-2 md:gap-4 space-y-2 md:space-y-4">
				{#each data.featuredProducts as product, i}
					{@const images = (() => { try { return JSON.parse(product.image_urls); } catch { return []; } })()}
					{@const aspects = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/5]', 'aspect-square', 'aspect-[4/3]']}
					<a href="/products/{product.id}" use:tilt class="break-inside-avoid group cursor-pointer block">
						<div class="{aspects[i % aspects.length]} bg-muted rounded-lg overflow-hidden relative">
							{#if images[0]}
								<img src={images[0]} alt={product.name} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
							{/if}
							<div class="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300"></div>
						</div>
						<div class="pt-2 pb-1">
							<p class="text-sm font-medium text-foreground truncate">{product.name}</p>
							<p class="text-xs text-muted-foreground">{product.creator_name ?? ''}</p>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16 text-muted-foreground">
				<p class="text-sm">Les premières créations arrivent bientôt…</p>
			</div>
		{/if}

		<div class="text-center mt-14">
			<a href="/products">
				<Button size="lg">
					{#snippet children()}Découvrir tous les produits{/snippet}
				</Button>
			</a>
		</div>
	</div>
</section>

<!-- CTA final -->
<section class="py-14 md:py-24 bg-[#2C1F14] text-white fade-in-section">
	<div class="container mx-auto px-4 md:px-6 text-center">
		<h2 class="text-xl sm:text-2xl md:text-5xl mb-4 md:mb-6 leading-tight">
			Prêt à rejoindre<br /><em class="not-italic text-[#E8A882]">l'aventure ?</em>
		</h2>
		<p class="text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
			Que vous soyez créateur ou client, Vasy est la plateforme idéale pour découvrir et partager l'artisanat français.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/register">
				<Button size="lg" class="bg-[#C4704A]! text-white! border-transparent! hover:bg-[#B5623C]!">
					{#snippet children()}Créer un compte{/snippet}
				</Button>
			</a>
			<a href="/products">
				<Button size="lg" variant="outline" class="border-white/30! text-white! bg-transparent! hover:bg-white/10!">
					{#snippet children()}Explorer les produits{/snippet}
				</Button>
			</a>
		</div>
	</div>
</section>

<style>
	@keyframes bounce {
		0%, 100% { transform: translateY(0) translateX(-50%); }
		50% { transform: translateY(-10px) translateX(-50%); }
	}

	@media (min-width: 768px) {
		.step-0 {
			clip-path: url(#clip-step-0);
		}
		.step-1 {
			clip-path: url(#clip-step-1);
		}
		.step-2 {
			clip-path: url(#clip-step-2);
		}
	}
</style>

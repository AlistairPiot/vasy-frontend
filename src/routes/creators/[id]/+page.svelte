<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long'
		});
	}
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<header class="border-b">
		<div class="container mx-auto px-4 py-4 flex justify-between items-center">
			<a href="/" class="text-xl font-bold">Vasy</a>
			<nav class="flex gap-4 items-center">
				<a href="/products" class="text-muted-foreground hover:text-foreground">Produits</a>
				<a href="/login" class="text-muted-foreground hover:text-foreground">Connexion</a>
			</nav>
		</div>
	</header>

	<main class="container mx-auto px-4 py-8">
		<a href="/products" class="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 transition-colors">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="m15 18-6-6 6-6"/>
			</svg>
			<span>Retour aux produits</span>
		</a>

		<!-- Creator Header -->
		<Card class="p-8 mb-8 animate-in">
			<div class="flex gap-6 items-start md:items-center flex-col md:flex-row">
				<!-- Avatar -->
				<div class="flex-shrink-0">
					{#if data.creator.profile_image_url}
						<img
							src={data.creator.profile_image_url}
							alt={data.creator.display_name}
							class="w-32 h-32 rounded-full object-cover border-4 border-primary"
						/>
					{:else}
						<div class="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary">
							<span class="text-4xl font-bold text-muted-foreground">
								{data.creator.display_name.charAt(0).toUpperCase()}
							</span>
						</div>
					{/if}
				</div>

				<!-- Creator Info -->
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-2">
						<h1 class="text-3xl font-bold">{data.creator.display_name}</h1>
						{#if data.creator.is_approved}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="text-blue-500"
							>
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
								<polyline points="22 4 12 14.01 9 11.01" />
							</svg>
						{/if}
					</div>

					<p class="text-muted-foreground mb-4">{data.creator.bio}</p>

					<p class="text-sm text-muted-foreground">
						Membre depuis {formatDate(data.creator.created_at)}
					</p>
				</div>
			</div>
		</Card>

		<!-- Products Section -->
		<div class="animate-in">
			<h2 class="text-2xl font-bold mb-6">Produits</h2>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card class="p-4 text-center text-muted-foreground">
					<p>Les produits de ce créateur apparaîtront ici</p>
					<p class="text-sm mt-2">(À connecter au backend)</p>
				</Card>
			</div>
		</div>
	</main>
</div>

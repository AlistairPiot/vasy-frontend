<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Header from '$lib/components/Header.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.6,
			stagger: 0.08,
			ease: 'power3.out'
		});
	});

	const statuses = [
		{
			label: 'En attente',
			color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
			dot: 'bg-yellow-400',
			description:
				'Votre commande a été passée et un pré-autorisation bancaire a été effectuée. Votre compte n\'est pas encore débité. Le créateur doit accepter ou refuser la commande.'
		},
		{
			label: 'Validée',
			color: 'bg-blue-100 text-blue-800 border-blue-200',
			dot: 'bg-blue-400',
			description:
				'Le créateur a accepté votre commande. Elle est en cours de préparation. Votre compte n\'est toujours pas débité à ce stade.'
		},
		{
			label: 'Expédiée',
			color: 'bg-green-100 text-green-800 border-green-200',
			dot: 'bg-green-400',
			description:
				'La commande a été envoyée. C\'est à ce moment précis que votre compte est débité et que le paiement est transféré au créateur. Un numéro de suivi vous est communiqué par email.'
		},
		{
			label: 'Refusée',
			color: 'bg-red-100 text-red-800 border-red-200',
			dot: 'bg-red-400',
			description:
				'Le créateur n\'a pas pu honorer votre commande (rupture de stock, indisponibilité…). La pré-autorisation est annulée et vous n\'êtes pas débité.'
		},
		{
			label: 'Annulée',
			color: 'bg-gray-100 text-gray-700 border-gray-200',
			dot: 'bg-gray-400',
			description:
				'La commande a été annulée automatiquement suite à un incident de paiement (carte refusée, autorisation expirée après 7 jours). Aucun débit n\'a eu lieu.'
		}
	];
</script>

<div class="min-h-screen bg-background" bind:this={containerRef}>
	<Header user={data.user} />

	<main class="container mx-auto px-4 py-8 max-w-3xl">
		<Breadcrumb items={[
			{ label: 'Accueil', href: '/' },
			{ label: 'Mon profil', href: '/profile' },
			{ label: 'Fonctionnement' }
		]} />

		<div class="py-8 space-y-10">

			<div class="animate-in">
				<h1 class="text-3xl font-bold mb-2">Comment ça fonctionne ?</h1>
				<p class="text-muted-foreground">
					Tout ce que vous devez savoir sur les commandes et les paiements sur Vasy.
				</p>
			</div>

			<!-- Paiement -->
			<section class="animate-in">
				<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
					<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
					Le système de paiement
				</h2>
				<Card class="p-6 space-y-4">
					<p class="text-sm text-muted-foreground leading-relaxed">
						Vasy utilise un système de <strong class="text-foreground">pré-autorisation bancaire</strong>.
						Lorsque vous passez commande, votre banque bloque temporairement le montant mais
						<strong class="text-foreground">votre compte n'est pas débité immédiatement</strong>.
					</p>
					<p class="text-sm text-muted-foreground leading-relaxed">
						Le débit réel n'a lieu qu'au moment où le créateur expédie votre colis.
						Si la commande est refusée ou annulée, la pré-autorisation est levée et vous ne payez rien.
					</p>

					<div class="border rounded-lg divide-y mt-2">
						<div class="flex items-center gap-3 px-4 py-3">
							<div class="w-2 h-2 rounded-full bg-yellow-400 shrink-0"></div>
							<div>
								<span class="text-sm font-medium">Commande passée</span>
								<span class="text-xs text-muted-foreground ml-2">→ Pré-autorisation uniquement</span>
							</div>
						</div>
						<div class="flex items-center gap-3 px-4 py-3">
							<div class="w-2 h-2 rounded-full bg-blue-400 shrink-0"></div>
							<div>
								<span class="text-sm font-medium">Commande acceptée</span>
								<span class="text-xs text-muted-foreground ml-2">→ Toujours pas débité</span>
							</div>
						</div>
						<div class="flex items-center gap-3 px-4 py-3">
							<div class="w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
							<div>
								<span class="text-sm font-medium">Commande expédiée</span>
								<span class="text-xs text-muted-foreground ml-2">→ <strong>Débit effectif</strong></span>
							</div>
						</div>
					</div>

					<p class="text-xs text-muted-foreground pt-1">
						La pré-autorisation expire automatiquement après 7 jours si le créateur n'a pas agi. Dans ce cas, la commande est annulée et vous n'êtes pas débité.
					</p>
				</Card>
			</section>

			<!-- Statuts -->
			<section class="animate-in">
				<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
					<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
					Les statuts d'une commande
				</h2>
				<div class="space-y-3">
					{#each statuses as status}
						<Card class="p-4">
							<div class="flex items-start gap-3">
								<div class="mt-0.5 shrink-0">
									<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border {status.color}">
										<span class="w-1.5 h-1.5 rounded-full {status.dot}"></span>
										{status.label}
									</span>
								</div>
								<p class="text-sm text-muted-foreground leading-relaxed">{status.description}</p>
							</div>
						</Card>
					{/each}
				</div>
			</section>

			<!-- Remboursements -->
			<section class="animate-in">
				<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
					<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
					Remboursements
				</h2>
				<Card class="p-6">
					<p class="text-sm text-muted-foreground leading-relaxed">
						Si votre commande est <strong class="text-foreground">refusée ou annulée</strong>, vous n'êtes
						jamais débité — la pré-autorisation est simplement levée.
					</p>
					<p class="text-sm text-muted-foreground leading-relaxed mt-3">
						Si la commande a déjà été expédiée (vous avez donc été débité) et qu'un litige survient,
						contactez le créateur directement ou notre support via l'adresse indiquée en bas de page.
					</p>
				</Card>
			</section>

		</div>
	</main>
</div>

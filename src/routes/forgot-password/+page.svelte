<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import logo from '$lib/assets/vasy.svg';

	let { form } = $props();
	let cardRef: HTMLDivElement;
	let logoRef: HTMLAnchorElement;

	onMount(() => {
		gsap.to(logoRef, {
			y: 0,
			opacity: 1,
			duration: 0.8,
			ease: 'power3.out'
		});
		gsap.to(cardRef, {
			y: 0,
			opacity: 1,
			duration: 0.6,
			delay: 0.15,
			ease: 'power3.out'
		});
	});

	$effect(() => {
		if (form?.success || form?.errors) {
			gsap.from('.message', {
				y: -10,
				opacity: 0,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	});
</script>

<div class="min-h-screen bg-background flex flex-col">
	<header class="container mx-auto px-4 py-4">
		<a href="/" class="opacity-0 translate-y-[30px] inline-block" bind:this={logoRef}>
			<img src={logo} alt="Vasy" class="h-8 w-auto" />
		</a>
	</header>

	<div class="flex-1 flex items-center justify-center p-4">
		<div bind:this={cardRef} class="w-full max-w-md opacity-0 translate-y-5">
			<Card class="p-8">
				{#if form?.success}
					<div class="text-center space-y-4">
						<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
							<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h1 class="text-2xl font-bold">Email envoyé</h1>
						<p class="text-muted-foreground">
							Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.
						</p>
						<a href="/login" class="text-primary hover:underline inline-block mt-4">
							Retour à la connexion
						</a>
					</div>
				{:else}
					<form method="POST" use:enhance class="space-y-6" novalidate>
						<div class="text-center mb-8">
							<h1 class="text-2xl font-bold">Mot de passe oublié</h1>
							<p class="text-muted-foreground mt-2">
								Entrez votre email pour recevoir un lien de réinitialisation
							</p>
						</div>

						{#if form?.errors?.form}
							<div class="message bg-destructive/10 text-destructive text-sm p-3 rounded-md">
								{form.errors.form[0]}
							</div>
						{/if}

						<div class="space-y-2">
							<label for="email" class="text-sm font-medium">Email</label>
							<Input
								type="email"
								id="email"
								name="email"
								value={form?.email ?? ''}
								required
								placeholder="vous@exemple.com"
								class={form?.errors?.email ? 'border-destructive' : ''}
							/>
							{#if form?.errors?.email}
								<p class="message text-sm text-destructive">{form.errors.email[0]}</p>
							{/if}
						</div>

						<Button type="submit" class="w-full">
							{#snippet children()}
								Envoyer le lien
							{/snippet}
						</Button>

						<p class="text-center text-sm text-muted-foreground">
							<a href="/login" class="text-primary hover:underline">Retour à la connexion</a>
						</p>
					</form>
				{/if}
			</Card>
		</div>
	</div>
</div>

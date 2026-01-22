<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import logo from '$lib/assets/vasy.svg';

	let { form } = $props();
	let formRef: HTMLFormElement;
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
		if (form?.errors) {
			gsap.from('.error-message', {
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
				<form method="POST" use:enhance bind:this={formRef} class="space-y-6" novalidate>
					<div class="text-center mb-8">
						<h1 class="text-2xl font-bold">Connexion</h1>
						<p class="text-muted-foreground mt-2">Accédez à votre compte</p>
					</div>

					{#if form?.errors?.form}
						<div class="error-message bg-destructive/10 text-destructive text-sm p-3 rounded-md">
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
							<p class="error-message text-sm text-destructive">{form.errors.email[0]}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<label for="password" class="text-sm font-medium">Mot de passe</label>
						<Input
							type="password"
							id="password"
							name="password"
							required
							placeholder="••••••••"
							class={form?.errors?.password ? 'border-destructive' : ''}
						/>
						{#if form?.errors?.password}
							<p class="error-message text-sm text-destructive">{form.errors.password[0]}</p>
						{/if}
					</div>

					<Button type="submit" class="w-full">
						{#snippet children()}
							Se connecter
						{/snippet}
					</Button>

					<p class="text-center text-sm text-muted-foreground">
						Pas encore de compte ?
						<a href="/register" class="text-primary hover:underline">S'inscrire</a>
					</p>
				</form>
			</Card>
		</div>
	</div>
</div>

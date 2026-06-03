<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import logo from '$lib/assets/vasy.svg';

	import { onDestroy } from 'svelte';

	let { form } = $props();
	let formRef: HTMLFormElement;
	let cardRef: HTMLDivElement;
	let logoRef: HTMLAnchorElement;
	let showPassword = $state(false);
	let countdown = $state(0);
	let countdownTimer: ReturnType<typeof setInterval> | null = null;

	function startCountdown(seconds: number) {
		if (countdownTimer) clearInterval(countdownTimer);
		countdown = seconds;
		countdownTimer = setInterval(() => {
			countdown -= 1;
			if (countdown <= 0) {
				clearInterval(countdownTimer!);
				countdownTimer = null;
				countdown = 0;
			}
		}, 1000);
	}

	onDestroy(() => { if (countdownTimer) clearInterval(countdownTimer); });

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
		if (form?.rateLimitSeconds) {
			startCountdown(form.rateLimitSeconds);
		}
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
							autocomplete="email"
							placeholder="vous@exemple.com"
							class={form?.errors?.email ? 'border-destructive' : ''}
						/>
						{#if form?.errors?.email}
							<p class="error-message text-sm text-destructive">{form.errors.email[0]}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label for="password" class="text-sm font-medium">Mot de passe</label>
							<a href="/forgot-password" class="text-sm text-primary hover:underline">
								Mot de passe oublié ?
							</a>
						</div>
						<div class="relative">
							<Input
								type={showPassword ? 'text' : 'password'}
								id="password"
								name="password"
								required
								autocomplete="current-password"
								placeholder="••••••••"
								class="pr-10 {form?.errors?.password ? 'border-destructive' : ''}"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								tabindex="-1"
							>
								{#if showPassword}
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
								{/if}
							</button>
						</div>
						{#if form?.errors?.password}
							<p class="error-message text-sm text-destructive">{form.errors.password[0]}</p>
						{/if}
					</div>

					<Button type="submit" class="w-full" disabled={countdown > 0}>
						{#snippet children()}
							{#if countdown > 0}
								Réessayer dans {countdown}s
							{:else}
								Se connecter
							{/if}
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

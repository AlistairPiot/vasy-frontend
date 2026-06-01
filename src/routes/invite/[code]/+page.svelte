<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import logo from '$lib/assets/vasy.svg';

	let { data, form } = $props();
	let cardRef: HTMLDivElement;
	let logoRef: HTMLAnchorElement;
	let siretInput = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

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

	function formatSiret(value: string): string {
		// Remove non-digits and limit to 14
		const digits = value.replace(/\D/g, '').slice(0, 14);
		// Format as 3 3 3 5
		if (digits.length <= 3) return digits;
		if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
		if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
		return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
	}

	function handleSiretInput(e: Event) {
		const input = e.target as HTMLInputElement;
		// Only keep digits and limit to 14
		const digitsOnly = input.value.replace(/\D/g, '').slice(0, 14);
		siretInput = formatSiret(digitsOnly);
	}
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
				{#if data.error}
					<div class="text-center">
						<h1 class="text-2xl font-bold mb-4">Invitation invalide</h1>
						<p class="text-muted-foreground mb-6">{data.error}</p>
						<a href="/" class="text-primary hover:underline">Retour à l'accueil</a>
					</div>
				{:else if data.invitation}
					<form method="POST" class="space-y-6" novalidate>
						<!-- Hidden field so password managers associate the correct email -->
						<input type="email" name="username" autocomplete="username" value={data.invitation.email} readonly style="display:none" />

						<div class="text-center mb-8">
							<h1 class="text-2xl font-bold">Créer votre compte créateur</h1>
							<p class="text-muted-foreground mt-2">
								Invitation pour {data.invitation.email}
							</p>
						</div>

						{#if form?.errors?.form}
							<div class="error-message bg-destructive/10 text-destructive text-sm p-3 rounded-md">
								{form.errors.form[0]}
							</div>
						{/if}

						<div class="space-y-2">
							<label for="displayName" class="text-sm font-medium">Nom d'affichage</label>
							<Input
								type="text"
								id="displayName"
								name="displayName"
								required
								placeholder="Votre nom de créateur"
								class={form?.errors?.displayName ? 'border-destructive' : ''}
							/>
							{#if form?.errors?.displayName}
								<p class="error-message text-sm text-destructive">{form.errors.displayName[0]}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<label for="siret" class="text-sm font-medium">Numéro de SIRET</label>
							<Input
								type="text"
								id="siret"
								name="siret"
								required
								placeholder="XXX XXX XXX XXXXX"
								value={siretInput}
								oninput={handleSiretInput}
								maxlength={17}
								autocomplete="off"
								inputmode="numeric"
								class={form?.errors?.siret ? 'border-destructive' : ''}
							/>
							{#if form?.errors?.siret}
								<p class="error-message text-sm text-destructive">{form.errors.siret[0]}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<label for="password" class="text-sm font-medium">Mot de passe</label>
							<div class="relative">
								<Input
									type={showPassword ? 'text' : 'password'}
									id="password"
									name="password"
									required
									placeholder="••••••••"
									minlength={8}
									autocomplete="new-password"
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

						<div class="space-y-2">
							<label for="confirmPassword" class="text-sm font-medium">Confirmer le mot de passe</label>
							<div class="relative">
								<Input
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirmPassword"
									name="confirmPassword"
									required
									placeholder="••••••••"
									minlength={8}
									autocomplete="new-password"
									class="pr-10 {form?.errors?.confirmPassword ? 'border-destructive' : ''}"
								/>
								<button
									type="button"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
									class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									tabindex="-1"
								>
									{#if showConfirmPassword}
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
									{/if}
								</button>
							</div>
							{#if form?.errors?.confirmPassword}
								<p class="error-message text-sm text-destructive">{form.errors.confirmPassword[0]}</p>
							{/if}
						</div>

						<Button type="submit" class="w-full">
							{#snippet children()}
								Créer mon compte
							{/snippet}
						</Button>
					</form>
				{/if}
			</Card>
		</div>
	</div>
</div>

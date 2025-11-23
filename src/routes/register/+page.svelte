<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { form } = $props();
	let formRef: HTMLFormElement;

	onMount(() => {
		gsap.from(formRef, {
			y: 20,
			opacity: 0,
			duration: 0.6,
			ease: 'power3.out'
		});
	});
</script>

<div class="min-h-screen bg-background flex items-center justify-center p-4">
	<Card class="w-full max-w-md p-8">
		<form method="POST" use:enhance bind:this={formRef} class="space-y-6">
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold">Créer un compte</h1>
				<p class="text-muted-foreground mt-2">Rejoignez notre communauté</p>
			</div>

			{#if form?.error}
				<div class="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
					{form.error}
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
				/>
			</div>

			<div class="space-y-2">
				<label for="password" class="text-sm font-medium">Mot de passe</label>
				<Input
					type="password"
					id="password"
					name="password"
					required
					placeholder="••••••••"
					minlength={8}
				/>
			</div>

			<div class="space-y-2">
				<label for="confirmPassword" class="text-sm font-medium">Confirmer le mot de passe</label>
				<Input
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					required
					placeholder="••••••••"
					minlength={8}
				/>
			</div>

			<Button type="submit" class="w-full">
				{#snippet children()}
					S'inscrire
				{/snippet}
			</Button>

			<p class="text-center text-sm text-muted-foreground">
				Déjà un compte ?
				<a href="/login" class="text-primary hover:underline">Se connecter</a>
			</p>
		</form>
	</Card>
</div>

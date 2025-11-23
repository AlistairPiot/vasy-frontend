<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data, form } = $props();
	let formRef: HTMLFormElement;
	let profileImageUrl = $state(data.creator.profile_image_url || '');
	let uploading = $state(false);

	onMount(() => {
		gsap.from(formRef, {
			y: 20,
			opacity: 0,
			duration: 0.5,
			ease: 'power3.out'
		});
	});

	async function handleAvatarUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploading = true;

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/api/upload/avatar', {
				method: 'POST',
				body: formData
			});
			const data = await response.json();
			if (data.url) {
				profileImageUrl = data.url;
			}
		} catch (err) {
			console.error('Upload failed:', err);
		}

		uploading = false;
		input.value = '';
	}
</script>

<div>
	<h1 class="text-2xl font-bold mb-6">Mon profil</h1>

	{#if form?.success}
		<div class="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">
			Profil mis à jour avec succès
		</div>
	{/if}

	<Card class="max-w-2xl p-6">
		<form method="POST" use:enhance bind:this={formRef} class="space-y-6">
			{#if form?.error}
				<div class="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
					{form.error}
				</div>
			{/if}

			<div class="space-y-2">
				<label class="text-sm font-medium">Photo de profil</label>
				<div class="flex items-center gap-4">
					{#if profileImageUrl && profileImageUrl.length > 0}
						<img
							src={profileImageUrl}
							alt="Avatar"
							class="w-20 h-20 rounded-full object-cover"
						/>
					{:else}
						<div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
							<span class="text-2xl text-muted-foreground">
								{data.creator.display_name?.charAt(0)?.toUpperCase() || '?'}
							</span>
						</div>
					{/if}
					<div>
						<input
							type="file"
							accept="image/*"
							onchange={handleAvatarUpload}
							class="hidden"
							id="avatar-upload"
							disabled={uploading}
						/>
						<label
							for="avatar-upload"
							class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer {uploading ? 'opacity-50 cursor-not-allowed' : ''}"
						>
							{uploading ? 'Upload...' : 'Changer la photo'}
						</label>
					</div>
				</div>
			</div>

			<div class="space-y-2">
				<label for="displayName" class="text-sm font-medium">Nom d'affichage *</label>
				<Input
					type="text"
					id="displayName"
					name="displayName"
					required
					value={data.creator.display_name}
				/>
			</div>

			<div class="space-y-2">
				<label for="bio" class="text-sm font-medium">Biographie</label>
				<textarea
					id="bio"
					name="bio"
					rows={4}
					class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					placeholder="Parlez de vous et de votre activité..."
				>{data.creator.bio || ''}</textarea>
			</div>

			<input type="hidden" name="profileImageUrl" value={profileImageUrl} />

			<Button type="submit" class="w-full">
				{#snippet children()}
					Enregistrer
				{/snippet}
			</Button>
		</form>
	</Card>

	{#if !data.creator.stripe_onboarding_complete}
		<Card class="max-w-2xl p-6 mt-6 border-orange-200 bg-orange-50">
			<h2 class="font-semibold mb-2">Configuration Stripe requise</h2>
			<p class="text-sm text-muted-foreground mb-4">
				Pour recevoir des paiements, vous devez configurer votre compte Stripe.
			</p>
			<Button>
				{#snippet children()}
					Configurer Stripe
				{/snippet}
			</Button>
		</Card>
	{/if}
</div>

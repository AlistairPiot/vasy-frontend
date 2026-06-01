<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	const STORAGE_KEY = 'vasy_cookie_consent';

	let visible = $state(false);
	let bannerEl = $state<HTMLDivElement | undefined>(undefined);

	onMount(() => {
		if (!localStorage.getItem(STORAGE_KEY)) {
			visible = true;
		}
	});

	$effect(() => {
		if (visible && bannerEl) {
			gsap.fromTo(bannerEl,
				{ y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.8 }
			);
		}
	});

	function accept() {
		localStorage.setItem(STORAGE_KEY, 'accepted');
		hide();
	}

	function refuse() {
		localStorage.setItem(STORAGE_KEY, 'refused');
		hide();
	}

	function hide() {
		gsap.to(bannerEl, {
			y: 16, opacity: 0, duration: 0.25, ease: 'power3.in',
			onComplete: () => { visible = false; }
		});
	}
</script>

{#if visible}
	<div
		bind:this={bannerEl}
		class="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 rounded-xl border border-border bg-card shadow-xl p-4"
		style="opacity: 0;"
	>
		<p class="text-sm text-foreground font-medium mb-1">Ce site utilise des cookies</p>
		<p class="text-xs text-muted-foreground mb-4 leading-relaxed">
			Nous utilisons des cookies nécessaires au fonctionnement (session, paiement Stripe) et des services tiers comme Google Fonts.
			<a href="/legal/privacy" class="underline hover:text-foreground transition-colors">En savoir plus</a>
		</p>
		<div class="flex gap-2">
			<button
				type="button"
				onclick={refuse}
				class="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
			>
				Refuser
			</button>
			<button
				type="button"
				onclick={accept}
				class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
			>
				Accepter
			</button>
		</div>
	</div>
{/if}

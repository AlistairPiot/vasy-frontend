<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from './Button.svelte';

	interface Props {
		isOpen: boolean;
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'default' | 'destructive';
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		isOpen = $bindable(),
		title,
		message,
		confirmText = 'Confirmer',
		cancelText = 'Annuler',
		variant = 'default',
		onConfirm,
		onCancel
	}: Props = $props();

	let modalContainer: HTMLDivElement | undefined = $state();
	let modalContent: HTMLDivElement | undefined = $state();

	// Animer l'ouverture/fermeture de la modale
	$effect(() => {
		if (isOpen && modalContainer && modalContent) {
			// Bloquer le scroll du body
			document.body.style.overflow = 'hidden';

			// Animer l'ouverture
			gsap.fromTo(
				modalContainer,
				{ opacity: 0 },
				{ opacity: 1, duration: 0.2, ease: 'power2.out' }
			);

			gsap.fromTo(
				modalContent,
				{ scale: 0.9, opacity: 0, y: 20 },
				{ scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
			);
		} else if (!isOpen) {
			// Restaurer le scroll
			document.body.style.overflow = '';
		}
	});

	function handleCancel() {
		if (modalContainer && modalContent) {
			// Animer la fermeture
			gsap.to(modalContent, {
				scale: 0.9,
				opacity: 0,
				y: 20,
				duration: 0.2,
				ease: 'power2.in'
			});

			gsap.to(modalContainer, {
				opacity: 0,
				duration: 0.2,
				ease: 'power2.in',
				onComplete: () => {
					onCancel();
				}
			});
		} else {
			onCancel();
		}
	}

	function handleConfirm() {
		if (modalContainer && modalContent) {
			// Animer la fermeture
			gsap.to(modalContent, {
				scale: 0.9,
				opacity: 0,
				y: 20,
				duration: 0.2,
				ease: 'power2.in'
			});

			gsap.to(modalContainer, {
				opacity: 0,
				duration: 0.2,
				ease: 'power2.in',
				onComplete: () => {
					onConfirm();
				}
			});
		} else {
			onConfirm();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}

	// Gestion de la touche Escape
	$effect(() => {
		function handleEscape(event: KeyboardEvent) {
			if (event.key === 'Escape' && isOpen) {
				handleCancel();
			}
		}

		if (isOpen && typeof window !== 'undefined') {
			window.addEventListener('keydown', handleEscape);
			return () => window.removeEventListener('keydown', handleEscape);
		}
	});
</script>

{#if isOpen}
	<div
		bind:this={modalContainer}
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div
			bind:this={modalContent}
			class="bg-background rounded-lg shadow-2xl max-w-md w-full p-6 border border-border"
		>
			<!-- Icon -->
			<div class="mb-4 flex justify-center">
				{#if variant === 'destructive'}
					<div class="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
						<svg
							class="w-6 h-6 text-destructive"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
				{:else}
					<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
						<svg
							class="w-6 h-6 text-primary"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				{/if}
			</div>

			<!-- Title -->
			<h2 id="modal-title" class="text-xl font-bold text-center mb-2">
				{title}
			</h2>

			<!-- Message -->
			<p class="text-muted-foreground text-center mb-6">
				{message}
			</p>

			<!-- Actions -->
			<div class="flex gap-3">
				<Button class="flex-1" variant="outline" onclick={handleCancel}>
					{#snippet children()}
						{cancelText}
					{/snippet}
				</Button>
				<Button class="flex-1" variant={variant} onclick={handleConfirm}>
					{#snippet children()}
						{confirmText}
					{/snippet}
				</Button>
			</div>
		</div>
	</div>
{/if}

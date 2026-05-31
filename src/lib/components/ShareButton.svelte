<script lang="ts">
	import { gsap } from 'gsap';
	import { page } from '$app/state';

	interface Props {
		url?: string;
		title: string;
		text?: string;
		class?: string;
	}

	let { url: urlProp, title, text = '', class: className = '' }: Props = $props();
	const url = $derived(urlProp ?? page.url.href);

	let open = $state(false);
	let copied = $state(false);
	let modalEl: HTMLDivElement | undefined = $state();
	let cardEl: HTMLDivElement | undefined = $state();

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy() { node.remove(); } };
	}

	async function handleShare() {
		if (navigator.share) {
			try {
				await navigator.share({ title, text, url });
				return;
			} catch {
				// user cancelled — fall through to modal
			}
		}
		open = true;
	}

	$effect(() => {
		if (open && modalEl && cardEl) {
			gsap.fromTo(modalEl, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
			gsap.fromTo(cardEl, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'back.out(1.6)' });
		}
	});

	function close() {
		if (!modalEl || !cardEl) { open = false; return; }
		gsap.to(cardEl, { opacity: 0, y: 12, scale: 0.96, duration: 0.18, ease: 'power2.in' });
		gsap.to(modalEl, { opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: () => { open = false; } });
	}

	async function copyLink() {
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => { copied = false; }, 1500);
	}

	function shareWhatsApp() {
		window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
		close();
	}

	function shareX() {
		window.open(`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
		close();
	}

	function shareFacebook() {
		window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
		close();
	}

	function sharePinterest() {
		const imageUrl = document.querySelector<HTMLImageElement>('img[src]')?.src ?? '';
		window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`, '_blank');
		close();
	}
</script>

<button
	type="button"
	onclick={handleShare}
	class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-input hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors text-sm {className}"
	aria-label="Partager"
>
	<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
		<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
		<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
	</svg>
	Partager
</button>

{#if open}
	<div
		use:portal
		bind:this={modalEl}
		role="dialog"
		aria-modal="true"
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
		onclick={(e) => { if (e.target === modalEl) close(); }}
	>
		<div bind:this={cardEl} class="bg-background rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
			<div class="flex items-center justify-between px-5 py-4 border-b border-border">
				<h3 class="font-semibold text-base">Partager</h3>
				<button type="button" onclick={close} class="text-muted-foreground hover:text-foreground transition-colors" aria-label="Fermer">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
			</div>

			<p class="px-5 pt-3 pb-1 text-sm text-muted-foreground truncate">{title}</p>

			<!-- Copy link -->
			<div class="px-5 py-3">
				<div class="flex items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 py-2">
					<span class="flex-1 text-xs text-muted-foreground truncate">{url}</span>
					<button
						type="button"
						onclick={copyLink}
						class="shrink-0 text-xs font-medium px-2.5 py-1 rounded-md transition-colors {copied ? 'bg-green-100 text-green-700' : 'bg-primary text-primary-foreground hover:bg-primary/90'}"
					>
						{copied ? 'Copié !' : 'Copier'}
					</button>
				</div>
			</div>

			<div class="border-t border-border/50 mx-5"></div>

			<!-- Réseaux sociaux -->
			<div class="grid grid-cols-2 gap-2 p-4">
				<button
					type="button"
					onclick={shareWhatsApp}
					class="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm text-left"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-[#25D366] shrink-0">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
					</svg>
					WhatsApp
				</button>

				<button
					type="button"
					onclick={shareX}
					class="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm text-left"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-foreground shrink-0">
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
					</svg>
					X (Twitter)
				</button>

				<button
					type="button"
					onclick={shareFacebook}
					class="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm text-left"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-[#1877F2] shrink-0">
						<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
					</svg>
					Facebook
				</button>

				<button
					type="button"
					onclick={sharePinterest}
					class="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm text-left"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-[#E60023] shrink-0">
						<path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
					</svg>
					Pinterest
				</button>
			</div>
		</div>
	</div>
{/if}

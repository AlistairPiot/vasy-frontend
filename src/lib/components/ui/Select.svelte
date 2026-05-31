<script lang="ts">
	import { gsap } from 'gsap';

	interface Option { value: string; label: string; }

	let {
		options,
		value = $bindable(''),
		placeholder = '— Choisir —',
		name,
		id,
		class: className = '',
	}: {
		options: Option[];
		value?: string;
		placeholder?: string;
		name?: string;
		id?: string;
		class?: string;
	} = $props();

	let open = $state(false);
	let dropdownEl: HTMLDivElement;
	let containerEl: HTMLDivElement;

	const selectedLabel = $derived(options.find(o => o.value === value)?.label);

	// Listener actif uniquement quand le dropdown est ouvert
	$effect(() => {
		if (!open) return;
		function handle(e: MouseEvent) {
			if (!containerEl.contains(e.target as Node)) open = false;
		}
		document.addEventListener('click', handle, true);
		return () => document.removeEventListener('click', handle, true);
	});

	// Animation GSAP à l'ouverture
	$effect(() => {
		if (open && dropdownEl) {
			gsap.fromTo(dropdownEl,
				{ opacity: 0, y: -6, scale: 0.97 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.18, ease: 'power2.out' }
			);
		}
	});
</script>

<div class="relative {className}" bind:this={containerEl}>
	{#if name}<input type="hidden" {name} value={value ?? ''} />{/if}

	<button
		type="button"
		{id}
		onclick={() => (open = !open)}
		class="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors
			{open ? 'ring-2 ring-ring border-ring' : 'hover:bg-accent hover:text-foreground'}
			{value ? 'text-foreground' : 'text-muted-foreground'}"
	>
		<span class="truncate">{selectedLabel ?? placeholder}</span>
		<svg
			class="w-4 h-4 shrink-0 opacity-50 transition-transform duration-200 {open ? 'rotate-180' : ''}"
			fill="none" stroke="currentColor" viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<div
			bind:this={dropdownEl}
			class="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-xl border border-border bg-card shadow-xl origin-top"
		>
			<button
				type="button"
				onclick={() => { value = ''; open = false; }}
				class="w-full flex items-center px-4 py-2.5 text-sm text-left transition-colors
					{!value ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent'}"
			>
				<span class="flex-1">{placeholder}</span>
				{#if !value}
					<svg class="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>
			{#each options as opt}
				<button
					type="button"
					onclick={() => { value = opt.value; open = false; }}
					class="w-full flex items-center px-4 py-2.5 text-sm text-left transition-colors
						{value === opt.value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'}"
				>
					<span class="flex-1">{opt.label}</span>
					{#if value === opt.value}
						<svg class="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

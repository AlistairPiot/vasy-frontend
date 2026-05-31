<script lang="ts">
	import { gsap } from 'gsap';

	let {
		name = 'date',
		initialValue = '',
		required = false,
	}: {
		name?: string;
		initialValue?: string;
		required?: boolean;
	} = $props();

	const MONTH_NAMES = [
		'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
		'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
	];
	const DAY_NAMES = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

	const today = new Date();

	// Navigation state
	let viewYear  = $state(initialValue ? parseInt(initialValue.split('-')[0]) : today.getFullYear());
	let viewMonth = $state(initialValue ? parseInt(initialValue.split('-')[1]) - 1 : today.getMonth());

	// Selection state
	let selYear  = $state<number | null>(initialValue ? parseInt(initialValue.split('-')[0]) : null);
	let selMonth = $state<number | null>(initialValue ? parseInt(initialValue.split('-')[1]) - 1 : null);
	let selDay   = $state<number | null>(initialValue ? parseInt(initialValue.split('-')[2]) : null);

	let open = $state(false);
	let dropdownEl: HTMLDivElement;

	function getCalendarDays(year: number, month: number): (number | null)[] {
		const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
		const offset = firstDow === 0 ? 6 : firstDow - 1;  // Monday-start
		const total = new Date(year, month + 1, 0).getDate();
		const cells: (number | null)[] = Array(offset).fill(null);
		for (let d = 1; d <= total; d++) cells.push(d);
		return cells;
	}

	const calendarDays = $derived(getCalendarDays(viewYear, viewMonth));

	const selectedValue = $derived(
		selYear !== null && selMonth !== null && selDay !== null
			? `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`
			: ''
	);

	const displayLabel = $derived(
		selectedValue
			? new Date(selYear!, selMonth!, selDay!).toLocaleDateString('fr-FR', {
					day: 'numeric', month: 'long', year: 'numeric',
			  })
			: ''
	);

	function prevMonth() {
		if (viewMonth === 0) { viewMonth = 11; viewYear--; }
		else viewMonth--;
	}
	function nextMonth() {
		if (viewMonth === 11) { viewMonth = 0; viewYear++; }
		else viewMonth++;
	}

	function selectDay(day: number) {
		selYear = viewYear;
		selMonth = viewMonth;
		selDay = day;
		open = false;
	}

	function isSelected(day: number) {
		return selYear === viewYear && selMonth === viewMonth && selDay === day;
	}
	function isToday(day: number) {
		return viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
	}

	$effect(() => {
		if (open && dropdownEl) {
			gsap.fromTo(dropdownEl,
				{ opacity: 0, y: -6, scale: 0.97 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.18, ease: 'power2.out' }
			);
		}
	});
</script>

<div
	class="relative"
	onfocusout={(e) => {
		if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) open = false;
	}}
>
	<input type="hidden" {name} value={selectedValue} />

	<!-- Trigger -->
	<button
		type="button"
		onclick={() => (open = !open)}
		class="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors
			{open ? 'ring-2 ring-ring border-ring' : 'hover:bg-accent hover:text-foreground'}
			{selectedValue ? 'text-foreground' : 'text-muted-foreground'}"
	>
		<span class="truncate">{displayLabel || 'Choisir une date'}</span>
		<svg class="w-4 h-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
		</svg>
	</button>

	<!-- Calendar dropdown -->
	{#if open}
		<div
			bind:this={dropdownEl}
			class="absolute left-0 top-[calc(100%+4px)] z-30 w-72 rounded-xl border border-border bg-card shadow-xl origin-top p-3"
		>
			<!-- Month navigation -->
			<div class="flex items-center justify-between mb-3">
				<button
					type="button"
					onclick={prevMonth}
					class="p-1.5 rounded-md hover:bg-accent transition-colors"
					aria-label="Mois précédent"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
				<span class="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
				<button
					type="button"
					onclick={nextMonth}
					class="p-1.5 rounded-md hover:bg-accent transition-colors"
					aria-label="Mois suivant"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</button>
			</div>

			<!-- Day headers -->
			<div class="grid grid-cols-7 mb-1">
				{#each DAY_NAMES as d}
					<div class="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
				{/each}
			</div>

			<!-- Day grid -->
			<div class="grid grid-cols-7 gap-y-0.5">
				{#each calendarDays as day}
					{#if day === null}
						<div></div>
					{:else}
						<button
							type="button"
							onclick={() => selectDay(day)}
							class="h-8 w-full flex items-center justify-center rounded-md text-sm transition-colors
								{isSelected(day)
									? 'bg-primary text-primary-foreground font-semibold'
									: isToday(day)
									? 'ring-1 ring-primary text-primary font-medium hover:bg-primary/10'
									: 'hover:bg-accent text-foreground'}"
						>
							{day}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>

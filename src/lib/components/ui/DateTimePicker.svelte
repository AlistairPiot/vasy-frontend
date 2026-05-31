<script lang="ts">
	import { gsap } from 'gsap';

	let {
		dateName    = 'date',
		timeName    = 'time',
		initialDate = '',
		initialTime = '',
		placeholder = 'Choisir une date',
	}: {
		dateName?:    string;
		timeName?:    string;
		initialDate?: string;
		initialTime?: string;
		placeholder?: string;
	} = $props();

	/* ── constantes ─────────────────────────────────────────────── */
	const MONTH_NAMES = [
		'Janvier','Février','Mars','Avril','Mai','Juin',
		'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
	];
	const DAY_NAMES = ['Lu','Ma','Me','Je','Ve','Sa','Di'];
	const HOURS     = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
	const MINUTES   = ['00','05','10','15','20','25','30','35','40','45','50','55'];

	/* ── navigation calendrier ──────────────────────────────────── */
	const today   = new Date();
	let viewYear  = $state(initialDate ? parseInt(initialDate.split('-')[0]) : today.getFullYear());
	let viewMonth = $state(initialDate ? parseInt(initialDate.split('-')[1]) - 1 : today.getMonth());

	/* ── sélection ──────────────────────────────────────────────── */
	let selYear   = $state<number | null>(initialDate ? parseInt(initialDate.split('-')[0]) : null);
	let selMonth  = $state<number | null>(initialDate ? parseInt(initialDate.split('-')[1]) - 1 : null);
	let selDay    = $state<number | null>(initialDate ? parseInt(initialDate.split('-')[2]) : null);
	let selHour   = $state(initialTime ? initialTime.split(':')[0] : '');
	let selMinute = $state(initialTime ? (
		String(Math.round(parseInt(initialTime.split(':')[1] || '0') / 5) * 5).padStart(2, '0')
	) : '');

	/* ── état UI ─────────────────────────────────────────────────── */
	let open        = $state(false);
	let step        = $state<'date' | 'hour' | 'minute'>('date');
	let containerEl: HTMLDivElement;
	let dropdownEl:  HTMLDivElement;

	/* ── listener click-outside ─────────────────────────────────── */
	$effect(() => {
		if (!open) return;
		function handle(e: MouseEvent) {
			if (!containerEl?.contains(e.target as Node)) {
				open = false;
				step = 'date';
			}
		}
		document.addEventListener('click', handle, true);
		return () => document.removeEventListener('click', handle, true);
	});

	/* ── calendrier ─────────────────────────────────────────────── */
	function getCalendarDays(year: number, month: number): (number | null)[] {
		const firstDow = new Date(year, month, 1).getDay();
		const offset   = firstDow === 0 ? 6 : firstDow - 1;
		const total    = new Date(year, month + 1, 0).getDate();
		const cells: (number | null)[] = Array(offset).fill(null);
		for (let d = 1; d <= total; d++) cells.push(d);
		return cells;
	}

	const calendarDays = $derived(getCalendarDays(viewYear, viewMonth));

	function prevMonth() {
		if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--;
	}
	function nextMonth() {
		if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++;
	}

	function isSelDay(day: number) {
		return selYear === viewYear && selMonth === viewMonth && selDay === day;
	}
	function isToday(day: number) {
		return viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
	}

	/* ── interactions ───────────────────────────────────────────── */
	function selectDay(day: number) {
		selYear = viewYear; selMonth = viewMonth; selDay = day;
		step = 'hour';
	}
	function selectHour(h: string) {
		selHour = h;
		step = 'minute';
	}
	function selectMinute(m: string) {
		selMinute = m;
		setTimeout(() => { open = false; step = 'date'; }, 100);
	}
	function clearSelection() {
		selYear = null; selMonth = null; selDay = null;
		selHour = ''; selMinute = '';
		step = 'date';
	}

	/* ── valeurs dérivées ───────────────────────────────────────── */
	const dateValue = $derived(
		selYear !== null && selMonth !== null && selDay !== null
			? `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`
			: ''
	);
	const timeValue    = $derived(selHour && selMinute ? `${selHour}:${selMinute}` : '');
	const selDateLabel = $derived(
		selYear !== null && selMonth !== null && selDay !== null
			? new Date(selYear, selMonth, selDay).toLocaleDateString('fr-FR', {
					weekday: 'long', day: 'numeric', month: 'long',
			  })
			: ''
	);
	const displayLabel = $derived(
		selDateLabel
			? selMinute
				? `${selDateLabel} · ${selHour}h${selMinute}`
				: selHour
				? `${selDateLabel} · ${selHour}h`
				: selDateLabel
			: ''
	);

	/* ── animation dropdown ─────────────────────────────────────── */
	$effect(() => {
		if (open && dropdownEl) {
			gsap.fromTo(dropdownEl,
				{ opacity: 0, y: -6, scale: 0.97 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.18, ease: 'power2.out' }
			);
		}
	});

	/* ── animation transitions entre étapes ─────────────────────── */
	function slideIn(node: HTMLElement, direction: 'forward' | 'back') {
		gsap.fromTo(node,
			{ opacity: 0, x: direction === 'forward' ? 28 : -28 },
			{ opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' }
		);
	}
</script>

<div class="relative" bind:this={containerEl}>
	<input type="hidden" name={dateName} value={dateValue} />
	<input type="hidden" name={timeName}  value={timeValue} />

	<!-- Trigger -->
	<div
		role="button"
		tabindex="0"
		onclick={() => { open = !open; step = 'date'; }}
		onkeydown={(e) => e.key === 'Enter' && (open = !open)}
		class="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors cursor-pointer
			{open ? 'ring-2 ring-ring border-ring' : 'hover:bg-accent hover:text-foreground'}
			{dateValue ? 'text-foreground' : 'text-muted-foreground'}"
	>
		<span class="truncate flex-1">{displayLabel || placeholder}</span>
		{#if dateValue}
			<button
				type="button"
				onclick={(e) => { e.stopPropagation(); clearSelection(); }}
				class="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
				aria-label="Effacer"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		{/if}
		<svg class="w-4 h-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
		</svg>
	</div>

	<!-- Dropdown -->
	{#if open}
		<div
			bind:this={dropdownEl}
			class="absolute left-0 top-[calc(100%+4px)] z-30 w-72 rounded-xl border border-border bg-card shadow-xl origin-top overflow-hidden"
		>
			<!-- ÉTAPE 1 : Calendrier -->
			{#if step === 'date'}
				<div class="p-3" use:slideIn={'back'}>
					<div class="flex items-center justify-between mb-3">
						<button type="button" onclick={prevMonth}
							class="p-1.5 rounded-md hover:bg-accent transition-colors">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"/>
							</svg>
						</button>
						<span class="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
						<button type="button" onclick={nextMonth}
							class="p-1.5 rounded-md hover:bg-accent transition-colors">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/>
							</svg>
						</button>
					</div>
					<div class="grid grid-cols-7 mb-1">
						{#each DAY_NAMES as d}
							<div class="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
						{/each}
					</div>
					<div class="grid grid-cols-7 gap-y-0.5">
						{#each calendarDays as day}
							{#if day === null}
								<div></div>
							{:else}
								<button
									type="button"
									onclick={() => selectDay(day)}
									class="h-8 w-full flex items-center justify-center rounded-md text-sm transition-colors
										{isSelDay(day)
											? 'bg-primary text-primary-foreground font-semibold'
											: isToday(day)
											? 'ring-1 ring-primary text-primary font-medium hover:bg-primary/10'
											: 'hover:bg-accent text-foreground'}"
								>{day}</button>
							{/if}
						{/each}
					</div>
				</div>

			<!-- ÉTAPE 2 : Heure -->
			{:else if step === 'hour'}
				<div class="p-3" use:slideIn={'forward'}>
					<button
						type="button"
						onclick={() => (step = 'date')}
						class="flex items-center gap-2 text-sm mb-3 group hover:text-foreground transition-colors text-muted-foreground"
					>
						<svg class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"/>
						</svg>
						<span class="font-medium text-foreground truncate">{selDateLabel}</span>
					</button>
					<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Heure</p>
					<div class="grid grid-cols-6 gap-1">
						{#each HOURS as h}
							<button type="button" onclick={() => selectHour(h)}
								class="h-8 flex items-center justify-center rounded-md text-xs font-mono transition-colors
									{selHour === h ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent text-foreground'}"
							>{h}</button>
						{/each}
					</div>
				</div>

			<!-- ÉTAPE 3 : Minute -->
			{:else}
				<div class="p-3" use:slideIn={'forward'}>
					<button
						type="button"
						onclick={() => (step = 'hour')}
						class="flex items-center gap-2 text-sm mb-3 group hover:text-foreground transition-colors text-muted-foreground"
					>
						<svg class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"/>
						</svg>
						<span class="font-medium text-foreground truncate">{selDateLabel} · {selHour}h</span>
					</button>
					<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Minute</p>
					<div class="grid grid-cols-6 gap-1">
						{#each MINUTES as m}
							<button type="button" onclick={() => selectMinute(m)}
								class="h-8 flex items-center justify-center rounded-md text-xs font-mono transition-colors
									{selMinute === m ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent text-foreground'}"
							>{m}</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<script lang="ts">
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';

	let { data } = $props();
	let containerRef: HTMLDivElement;

	onMount(() => {
		gsap.from(containerRef.querySelectorAll('.animate-in'), {
			y: 20,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
			ease: 'power3.out'
		});
	});

	type Item = { product_name: string; quantity: number; unit_price: number };
	type Commission = {
		id: string;
		shipped_at: string;
		total_amount: number;
		platform_commission: number;
		stripe_commission: number;
		creator_earnings: number;
		creator_name: string;
		creator_email: string | null;
		client_name: string;
		client_email: string | null;
		items: Item[];
	};

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	function formatDateKey(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function formatTime(dateString: string): string {
		return new Date(dateString).toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Palette de 12 couleurs (une par mois) : bg card, border, bg hover, bg detail, accent texte
	const MONTH_PALETTE: Record<number, { bg: string; border: string; hover: string; detail: string; label: string }> = {
		1:  { bg: '#EFF6FF', border: '#BFDBFE', hover: '#DBEAFE', detail: '#DBEAFE80', label: '#1D4ED8' }, // Janvier – bleu
		2:  { bg: '#FDF4FF', border: '#E9D5FF', hover: '#F3E8FF', detail: '#F3E8FF80', label: '#7C3AED' }, // Février – violet
		3:  { bg: '#F0FDF4', border: '#BBF7D0', hover: '#DCFCE7', detail: '#DCFCE780', label: '#15803D' }, // Mars – vert
		4:  { bg: '#FFF1F2', border: '#FECDD3', hover: '#FFE4E6', detail: '#FFE4E680', label: '#BE123C' }, // Avril – rose
		5:  { bg: '#FFFBEB', border: '#FDE68A', hover: '#FEF3C7', detail: '#FEF3C780', label: '#B45309' }, // Mai – ambre
		6:  { bg: '#F0FDFA', border: '#99F6E4', hover: '#CCFBF1', detail: '#CCFBF180', label: '#0F766E' }, // Juin – teal
		7:  { bg: '#FFF7ED', border: '#FED7AA', hover: '#FFEDD5', detail: '#FFEDD580', label: '#C2410C' }, // Juillet – orange
		8:  { bg: '#EEF2FF', border: '#C7D2FE', hover: '#E0E7FF', detail: '#E0E7FF80', label: '#4338CA' }, // Août – indigo
		9:  { bg: '#F7FEE7', border: '#D9F99D', hover: '#ECFCCB', detail: '#ECFCCB80', label: '#4D7C0F' }, // Septembre – lime
		10: { bg: '#FFF0F3', border: '#FFCCD5', hover: '#FFE0E6', detail: '#FFE0E680', label: '#C9184A' }, // Octobre – framboise
		11: { bg: '#F0F9FF', border: '#BAE6FD', hover: '#E0F2FE', detail: '#E0F2FE80', label: '#0369A1' }, // Novembre – ciel
		12: { bg: '#FDF2F8', border: '#FBCFE8', hover: '#FCE7F3', detail: '#FCE7F380', label: '#BE185D' }, // Décembre – pink
	};

	function getMonthPalette(dateKey: string) {
		const month = new Date(dateKey + 'T12:00:00').getMonth() + 1;
		return MONTH_PALETTE[month];
	}

	function formatMonthHeader(monthKey: string): string {
		const [year, month] = monthKey.split('-');
		return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('fr-FR', {
			month: 'long',
			year: 'numeric'
		});
	}

	// Grouper par mois → par jour
	const groupedByMonth = $derived(() => {
		// Map<monthKey YYYY-MM, Map<dayKey YYYY-MM-DD, Commission[]>>
		const months = new Map<string, Map<string, Commission[]>>();
		for (const c of data.commissions as Commission[]) {
			const d = new Date(c.shipped_at).toISOString().slice(0, 10);
			const m = d.slice(0, 7);
			if (!months.has(m)) months.set(m, new Map());
			const days = months.get(m)!;
			if (!days.has(d)) days.set(d, []);
			days.get(d)!.push(c);
		}
		return months;
	});

	const totalCommission = $derived(
		(data.commissions as Commission[]).reduce((sum, c) => sum + c.platform_commission, 0)
	);

	// Détail ouvert
	let openId = $state<string | null>(null);

	function toggle(id: string) {
		openId = openId === id ? null : id;
	}
</script>

<div class="space-y-6" bind:this={containerRef}>
	<div class="animate-in flex items-start justify-between">
		<div>
			<h1 class="text-3xl font-bold">Commissions</h1>
			<p class="text-muted-foreground mt-1">Historique des commissions perçues (commandes expédiées)</p>
		</div>
		{#if (data.commissions as Commission[]).length > 0}
			<div class="text-right">
				<p class="text-sm text-muted-foreground">Total perçu</p>
				<p class="text-2xl font-bold text-green-600">{formatPrice(totalCommission)}</p>
				<p class="text-xs text-muted-foreground">{(data.commissions as Commission[]).length} transaction{(data.commissions as Commission[]).length > 1 ? 's' : ''}</p>
			</div>
		{/if}
	</div>

	{#if (data.commissions as Commission[]).length === 0}
		<div class="animate-in text-center py-16 bg-card rounded-lg border">
			<div class="text-4xl mb-3">💳</div>
			<p class="font-medium text-muted-foreground">Aucune commission pour le moment</p>
			<p class="text-sm text-muted-foreground mt-1">Les commissions apparaissent dès qu'une commande est expédiée</p>
		</div>
	{:else}
		<div class="animate-in space-y-12">
			{#each [...groupedByMonth().entries()] as [monthKey, days]}
				{@const palette = getMonthPalette(monthKey + '-01')}
				<div>
					<!-- Header de mois -->
					<div class="flex items-center gap-2 mb-1">
						<span class="text-sm font-semibold capitalize" style:color={palette.label}>
							{formatMonthHeader(monthKey)}
						</span>
						<span class="text-sm font-medium text-muted-foreground">
							· {formatPrice([...days.values()].flat().reduce((s, c) => s + c.platform_commission, 0))}
						</span>
					</div>

					<div class="space-y-3">
						{#each [...days.entries()] as [dateKey, items]}
							<div>
								<!-- Séparateur de jour -->
								<div class="flex items-center gap-3 mb-2">
									<div class="h-px flex-1" style:background-color={palette.border}></div>
									<span class="text-xs font-medium uppercase tracking-wide px-2" style:color={palette.label}>
										{formatDateKey(dateKey + 'T12:00:00')}
									</span>
									<div class="h-px flex-1" style:background-color={palette.border}></div>
								</div>

								<!-- Cards du jour -->
								<div class="space-y-1.5">
									{#each items as commission}
										<div
											class="rounded-lg overflow-hidden"
											style:background-color={palette.bg}
											style:border="1px solid {palette.border}"
										>
											<!-- Ligne principale cliquable -->
											<button
												type="button"
												onclick={() => toggle(commission.id)}
												class="w-full flex items-center gap-4 px-4 py-3 transition-colors text-left"
												style:background-color={openId === commission.id ? palette.hover : 'transparent'}
												onmouseenter={(e) => { if (openId !== commission.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = palette.hover; }}
												onmouseleave={(e) => { if (openId !== commission.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
											>
												<!-- Icône -->
												<div
													class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
													style:background-color={palette.border}
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style:color={palette.label}>
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
												</div>

												<!-- Infos principales -->
												<div class="flex-1 min-w-0">
													<p class="font-medium text-sm truncate">{commission.creator_name}</p>
													<p class="text-xs text-muted-foreground">
														{formatTime(commission.shipped_at)} · #{commission.id.slice(0, 8)}
													</p>
												</div>

												<!-- Montant commission -->
												<div class="text-right shrink-0">
													<p class="font-semibold" style:color={palette.label}>+{formatPrice(commission.platform_commission)}</p>
													<p class="text-xs text-muted-foreground">sur {formatPrice(commission.total_amount)}</p>
												</div>

												<!-- Chevron -->
												<svg
													class="w-4 h-4 shrink-0 transition-transform {openId === commission.id ? 'rotate-180' : ''}"
													fill="none" stroke="currentColor" viewBox="0 0 24 24"
													style:color={palette.label}
												>
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
												</svg>
											</button>

											<!-- Détail dépliable -->
											{#if openId === commission.id}
												<div class="px-4 py-4 space-y-4" style:border-top="1px solid {palette.border}" style:background-color={palette.hover}>
													<!-- Parties prenantes -->
													<div class="grid grid-cols-2 gap-4">
														<div>
															<p class="text-xs text-muted-foreground mb-1">Créateur</p>
															<p class="text-sm font-medium">{commission.creator_name}</p>
															{#if commission.creator_email}
																<p class="text-xs text-muted-foreground">{commission.creator_email}</p>
															{/if}
														</div>
														<div>
															<p class="text-xs text-muted-foreground mb-1">Client</p>
															<p class="text-sm font-medium">{commission.client_name}</p>
															{#if commission.client_email}
																<p class="text-xs text-muted-foreground">{commission.client_email}</p>
															{/if}
														</div>
													</div>

													<!-- Produits -->
													<div>
														<p class="text-xs text-muted-foreground mb-1.5">Produits</p>
														<div class="space-y-1">
															{#each commission.items as item}
																<div class="flex justify-between text-sm">
																	<span class="text-muted-foreground">{item.product_name} ×{item.quantity}</span>
																	<span>{formatPrice(item.unit_price * item.quantity)}</span>
																</div>
															{/each}
														</div>
													</div>

													<!-- Calcul détaillé -->
													<div class="rounded-md p-3 space-y-1.5" style:background-color={palette.bg} style:border="1px solid {palette.border}">
														<p class="text-xs font-medium text-muted-foreground mb-2">Détail du calcul</p>

														<div class="flex justify-between text-sm">
															<span class="text-muted-foreground">Montant client</span>
															<span class="font-medium">{formatPrice(commission.total_amount)}</span>
														</div>

														<div class="flex justify-between text-sm">
															<span class="text-muted-foreground">Commission plateforme (5% + 0,25€/produit)</span>
															<span class="text-red-500">−{formatPrice(commission.platform_commission)}</span>
														</div>

														<div class="flex justify-between text-sm">
															<span class="text-muted-foreground">Frais Stripe estimés (1,5% + 0,25€)</span>
															<span class="text-orange-500">−{formatPrice(commission.stripe_commission)}</span>
														</div>

														<div class="h-px my-1" style:background-color={palette.border}></div>

														<div class="flex justify-between text-sm font-medium">
															<span>Reversé au créateur</span>
															<span>{formatPrice(commission.creator_earnings)}</span>
														</div>

														<div class="flex justify-between text-sm font-semibold pt-1" style:color={palette.label}>
															<span>Votre commission nette</span>
															<span>+{formatPrice(commission.platform_commission)}</span>
														</div>
													</div>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

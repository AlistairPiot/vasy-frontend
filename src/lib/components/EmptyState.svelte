<script lang="ts">
	interface CTA {
		label: string;
		href: string;
	}

	let {
		title,
		description = '',
		ctas = [] as CTA[],
		variant = 'default'
	}: {
		title: string;
		description?: string;
		ctas?: CTA[];
		variant?: 'favorites' | 'search' | 'products' | 'cart' | 'events' | 'orders' | 'default';
	} = $props();
</script>

<div class="py-16 flex flex-col items-center text-center px-4">
	<div class="w-36 h-36 mb-6 text-primary">

		{#if variant === 'favorites'}
			<!-- Coeur avec point de croix artisanal -->
			<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
				<circle cx="60" cy="60" r="52" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="5 3"/>
				<!-- Coeur -->
				<path d="M60 91 C58 89 24 70 24 49 C24 37 33 28 44 28 C51 28 57 32 60 37 C63 32 69 28 76 28 C87 28 96 37 96 49 C96 70 62 89 60 91 Z"
					fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
				<!-- Points de croix X -->
				<line x1="50" y1="50" x2="54" y2="54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="54" y1="50" x2="50" y2="54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="58" y1="44" x2="62" y2="48" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="62" y1="44" x2="58" y2="48" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="66" y1="50" x2="70" y2="54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="70" y1="50" x2="66" y2="54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<!-- Aiguille -->
				<line x1="85" y1="30" x2="70" y2="56" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
				<path d="M83 27 Q86 24 89 27 Q90 30 87 32" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>
				<!-- Fil -->
				<path d="M70 56 Q58 72 64 85" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-dasharray="3 3" opacity="0.35"/>
			</svg>

		{:else if variant === 'search'}
			<!-- Loupe avec brindille à l'intérieur -->
			<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
				<circle cx="60" cy="60" r="52" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="5 3"/>
				<!-- Lentille -->
				<circle cx="50" cy="50" r="28" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-width="2.5"/>
				<!-- Intérieur: reflet léger -->
				<circle cx="42" cy="42" r="6" fill="currentColor" fill-opacity="0.06"/>
				<!-- Feuille à l'intérieur de la loupe -->
				<path d="M50 38 Q58 44 50 58 Q42 52 50 38 Z" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
				<line x1="50" y1="38" x2="50" y2="58" stroke="currentColor" stroke-width="1" opacity="0.5"/>
				<line x1="50" y1="46" x2="45" y2="42" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
				<line x1="50" y1="50" x2="45" y2="47" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
				<!-- Manche -->
				<line x1="71" y1="71" x2="90" y2="91" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
				<line x1="71" y1="71" x2="91" y2="91" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
				<!-- Point d'interrogation discret -->
				<text x="84" y="46" font-size="22" fill="currentColor" fill-opacity="0.2" font-family="serif" text-anchor="middle">?</text>
			</svg>

		{:else if variant === 'products'}
			<!-- Panier vide artisanal -->
			<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
				<circle cx="60" cy="60" r="52" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="5 3"/>
				<!-- Anse du panier -->
				<path d="M34 58 Q34 28 60 28 Q86 28 86 58" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
				<!-- Corps du panier -->
				<path d="M22 58 L28 92 Q28 96 32 96 L88 96 Q92 96 92 92 L98 58 Z" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2"/>
				<!-- Tressage: lignes horizontales -->
				<line x1="24" y1="70" x2="96" y2="70" stroke="currentColor" stroke-width="1" opacity="0.3"/>
				<line x1="26" y1="81" x2="94" y2="81" stroke="currentColor" stroke-width="1" opacity="0.3"/>
				<!-- Tressage: lignes verticales ondulées -->
				<path d="M38 58 L36 70 L38 81 L36 96" stroke="currentColor" stroke-width="1" fill="none" opacity="0.25"/>
				<path d="M50 58 L48 70 L50 81 L48 96" stroke="currentColor" stroke-width="1" fill="none" opacity="0.25"/>
				<path d="M62 58 L60 70 L62 81 L60 96" stroke="currentColor" stroke-width="1" fill="none" opacity="0.25"/>
				<path d="M74 58 L72 70 L74 81 L72 96" stroke="currentColor" stroke-width="1" fill="none" opacity="0.25"/>
				<path d="M86 58 L84 70 L86 81 L84 96" stroke="currentColor" stroke-width="1" fill="none" opacity="0.25"/>
				<!-- Petite branche avec feuille (artisanal touch) -->
				<path d="M54 44 Q60 36 66 44" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
				<circle cx="60" cy="37" r="3" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1"/>
			</svg>

		{:else if variant === 'cart'}
			<!-- Panier shopping vide -->
			<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
				<circle cx="60" cy="60" r="52" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="5 3"/>
				<!-- Corps panier (forme caisse) -->
				<path d="M26 46 L32 88 Q32 92 36 92 L84 92 Q88 92 88 88 L94 46 Z" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2"/>
				<!-- Barre horizontale haute -->
				<line x1="22" y1="46" x2="98" y2="46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
				<!-- Tressage -->
				<line x1="28" y1="60" x2="92" y2="60" stroke="currentColor" stroke-width="1" opacity="0.3"/>
				<line x1="30" y1="74" x2="90" y2="74" stroke="currentColor" stroke-width="1" opacity="0.3"/>
				<path d="M44 46 L42 60 L44 74 L42 92" stroke="currentColor" stroke-width="1" fill="none" opacity="0.25"/>
				<path d="M60 46 L58 60 L60 74 L58 92" stroke="currentColor" stroke-width="1" fill="none" opacity="0.25"/>
				<path d="M76 46 L74 60 L76 74 L74 92" stroke="currentColor" stroke-width="1" fill="none" opacity="0.25"/>
				<!-- Roulettes -->
				<circle cx="40" cy="97" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
				<circle cx="80" cy="97" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
				<!-- Anse (bâton de poignée) -->
				<line x1="48" y1="46" x2="44" y2="32" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
				<line x1="72" y1="46" x2="76" y2="32" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
				<line x1="44" y1="32" x2="76" y2="32" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
			</svg>

		{:else if variant === 'events'}
			<!-- Calendrier artisanal avec fleur -->
			<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
				<circle cx="60" cy="60" r="52" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="5 3"/>
				<!-- Calendrier corps -->
				<rect x="20" y="34" width="80" height="68" rx="6" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-width="2"/>
				<!-- Bandeau du haut -->
				<rect x="20" y="34" width="80" height="20" rx="6" fill="currentColor" fill-opacity="0.18" stroke="none"/>
				<rect x="20" y="46" width="80" height="8" fill="currentColor" fill-opacity="0.18"/>
				<!-- Crochets de reliure -->
				<line x1="38" y1="28" x2="38" y2="42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
				<line x1="60" y1="28" x2="60" y2="42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
				<line x1="82" y1="28" x2="82" y2="42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
				<!-- Grille des jours (points) -->
				<circle cx="34" cy="66" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="46" cy="66" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="58" cy="66" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="70" cy="66" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="82" cy="66" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="34" cy="78" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="46" cy="78" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="58" cy="78" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="70" cy="78" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="34" cy="90" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<circle cx="46" cy="90" r="2.5" fill="currentColor" fill-opacity="0.3"/>
				<!-- Petite fleur dans le coin -->
				<path d="M76 88 Q78 82 82 88 Q86 82 88 88 Q82 92 76 88 Z" fill="currentColor" fill-opacity="0.35" stroke="currentColor" stroke-width="1"/>
				<circle cx="82" cy="87" r="2.5" fill="currentColor" fill-opacity="0.6"/>
				<line x1="82" y1="90" x2="82" y2="98" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
				<path d="M82 94 Q78 92 76 94" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.4"/>
			</svg>

		{:else if variant === 'orders'}
			<!-- Colis avec ruban artisanal -->
			<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
				<circle cx="60" cy="60" r="52" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="5 3"/>
				<!-- Boîte -->
				<rect x="24" y="52" width="72" height="56" rx="4" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2"/>
				<!-- Couvercle -->
				<rect x="20" y="42" width="80" height="16" rx="4" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="2"/>
				<!-- Ruban vertical -->
				<line x1="60" y1="42" x2="60" y2="108" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
				<!-- Ruban horizontal -->
				<line x1="24" y1="60" x2="96" y2="60" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
				<!-- Noeud ruban -->
				<path d="M60 42 Q52 34 44 36 Q44 44 52 44 Q56 44 60 42 Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
				<path d="M60 42 Q68 34 76 36 Q76 44 68 44 Q64 44 60 42 Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
				<circle cx="60" cy="42" r="3" fill="currentColor" fill-opacity="0.6"/>
				<!-- Etiquette manuscrite sur la boîte -->
				<rect x="36" y="68" width="48" height="28" rx="3" fill="white" fill-opacity="0.5" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2" opacity="0.6"/>
				<line x1="42" y1="78" x2="78" y2="78" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
				<line x1="42" y1="84" x2="70" y2="84" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
			</svg>

		{:else}
			<!-- Default: illustration générique (étoile / atelier) -->
			<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
				<circle cx="60" cy="60" r="52" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="5 3"/>
				<path d="M60 26 L64 50 L88 50 L68 65 L76 90 L60 75 L44 90 L52 65 L32 50 L56 50 Z" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
			</svg>
		{/if}

	</div>

	<h3 class="text-xl font-semibold mb-2 text-foreground">{title}</h3>

	{#if description}
		<p class="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
	{/if}

	{#if ctas.length > 0}
		<div class="flex gap-3 flex-wrap justify-center mt-2">
			{#each ctas as cta, i}
				<a
					href={cta.href}
					class="{i === 0
						? 'px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors'
						: 'px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground'}"
				>
					{cta.label}
				</a>
			{/each}
		</div>
	{/if}
</div>

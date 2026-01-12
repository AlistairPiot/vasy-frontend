<script lang="ts">
	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		items: BreadcrumbItem[];
		compact?: boolean;
	}

	let { items, compact = false }: Props = $props();
</script>

<nav class="{compact ? 'pt-6' : 'pt-24'} pb-6" aria-label="Breadcrumb">
	<ol class="flex items-center gap-2 text-sm">
		{#each items as item, index}
			<li>
				{#if item.href && index < items.length - 1}
					<a href={item.href} class="text-primary hover:underline">
						{item.label}
					</a>
				{:else}
					<span class="text-muted-foreground">
						{item.label}
					</span>
				{/if}
			</li>
			{#if index < items.length - 1}
				<li class="text-muted-foreground">/</li>
			{/if}
		{/each}
	</ol>
</nav>

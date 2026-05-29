<script lang="ts">
	let { class: className = '', style = '' }: { class?: string; style?: string } = $props();
</script>

<div class="animate-pulse rounded-md bg-muted {className}" {style}></div>

<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { cart } from '$lib/stores/cart';
	import { favorites } from '$lib/stores/favorites';

	let { children, data } = $props();

	// Initialize cart and favorites with user ID when component mounts or user changes
	$effect(() => {
		if (typeof window !== 'undefined') {
			cart.init(data.user?.id || null);
			favorites.init(data.user?.id || null);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

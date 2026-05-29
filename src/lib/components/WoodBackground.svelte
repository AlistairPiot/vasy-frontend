<script lang="ts">
	import textureBois from '$lib/assets/bois.jpg';
</script>

<!-- Texture bois fixed avec mix-blend-mode multiply -->
<div
	class="fixed inset-0 pointer-events-none"
	style="
		background-image: url({textureBois});
		background-size: cover;
		background-position: center;
		background-attachment: fixed;
		opacity: 0.22;
		filter: brightness(0.75) saturate(0.6);
		mix-blend-mode: multiply;
		z-index: 0;
	"
></div>

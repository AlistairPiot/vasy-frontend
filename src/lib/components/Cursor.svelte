<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';

	let dotRef: HTMLDivElement;
	let ringRef: HTMLDivElement;
	let show = $state(false);
	let hovering = $state(false);
	let clicking = $state(false);

	// Vérification touch côté serveur ignorée, on fait ça dans onMount
	onMount(() => {
		if ('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches) return;
		show = true;

		const styleTag = document.createElement('style');
		styleTag.id = 'cursor-override';
		styleTag.textContent = '* { cursor: none !important; }';
		document.head.appendChild(styleTag);

		return () => {
			document.getElementById('cursor-override')?.remove();
		};
	});

	// $effect s'exécute après que le DOM a mis à jour — dotRef/ringRef sont garantis présents
	$effect(() => {
		if (!show || !dotRef || !ringRef || !browser) return;

		// Centrage via xPercent/yPercent : compatible avec les quickSetters x/y
		gsap.set([dotRef, ringRef], { xPercent: -50, yPercent: -50, x: -200, y: -200 });

		const mouse = { x: -200, y: -200 };
		const ring  = { x: -200, y: -200 };

		const setDotX  = gsap.quickSetter(dotRef,  'x', 'px');
		const setDotY  = gsap.quickSetter(dotRef,  'y', 'px');
		const setRingX = gsap.quickSetter(ringRef, 'x', 'px');
		const setRingY = gsap.quickSetter(ringRef, 'y', 'px');

		function onMouseMove(e: MouseEvent) {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			setDotX(mouse.x);
			setDotY(mouse.y);
		}

		function tick() {
			ring.x += (mouse.x - ring.x) * 0.1;
			ring.y += (mouse.y - ring.y) * 0.1;
			setRingX(ring.x);
			setRingY(ring.y);
		}

		const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, [tabindex]';

		function onMouseOver(e: MouseEvent) {
			hovering = !!(e.target as Element)?.closest(INTERACTIVE);
		}

		function onMouseDown() { clicking = true; }
		function onMouseUp()   { clicking = false; }
		function onDocLeave()  { gsap.to([dotRef, ringRef], { opacity: 0, duration: 0.3 }); }
		function onDocEnter()  { gsap.to([dotRef, ringRef], { opacity: 1, duration: 0.3 }); }

		gsap.ticker.add(tick);
		window.addEventListener('mousemove',  onMouseMove);
		window.addEventListener('mouseover',  onMouseOver);
		window.addEventListener('mousedown',  onMouseDown);
		window.addEventListener('mouseup',    onMouseUp);
		document.documentElement.addEventListener('mouseleave', onDocLeave);
		document.documentElement.addEventListener('mouseenter', onDocEnter);

		return () => {
			gsap.ticker.remove(tick);
			window.removeEventListener('mousemove',  onMouseMove);
			window.removeEventListener('mouseover',  onMouseOver);
			window.removeEventListener('mousedown',  onMouseDown);
			window.removeEventListener('mouseup',    onMouseUp);
			document.documentElement.removeEventListener('mouseleave', onDocLeave);
			document.documentElement.removeEventListener('mouseenter', onDocEnter);
		};
	});
</script>

{#if show}
	<div bind:this={dotRef}  class="cursor-dot"  class:hovering class:clicking></div>
	<div bind:this={ringRef} class="cursor-ring" class:hovering class:clicking></div>
{/if}

<style>
	.cursor-dot,
	.cursor-ring {
		position: fixed;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 9999;
		border-radius: 50%;
		will-change: transform;
		transition: width 0.2s ease, height 0.2s ease,
		            background-color 0.2s ease, border-color 0.2s ease,
		            opacity 0.2s ease;
	}

	.cursor-dot {
		width: 6px;
		height: 6px;
		background-color: #C4704A;
	}

	.cursor-dot.hovering {
		width: 4px;
		height: 4px;
		background-color: #2C1F14;
	}

	.cursor-dot.clicking {
		width: 4px;
		height: 4px;
		opacity: 0.6;
	}

	.cursor-ring {
		width: 36px;
		height: 36px;
		border: 1.5px solid rgba(196, 112, 74, 0.5);
		background: transparent;
	}

	.cursor-ring.hovering {
		width: 48px;
		height: 48px;
		border-color: rgba(196, 112, 74, 0.8);
	}

	.cursor-ring.clicking {
		width: 28px;
		height: 28px;
		border-color: rgba(196, 112, 74, 1);
	}
</style>

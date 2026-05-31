import { gsap } from 'gsap';

export function ripple(node: HTMLElement) {
	function handleClick(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const size = Math.max(rect.width, rect.height) * 2;

		const el = document.createElement('span');
		el.style.cssText = `
			position: absolute;
			border-radius: 50%;
			background: currentColor;
			opacity: 0.18;
			width: ${size}px;
			height: ${size}px;
			left: ${x - size / 2}px;
			top: ${y - size / 2}px;
			pointer-events: none;
			transform: scale(0);
		`;

		node.style.position = 'relative';
		node.style.overflow = 'hidden';
		node.appendChild(el);

		gsap.to(el, {
			scale: 1,
			opacity: 0,
			duration: 0.55,
			ease: 'power2.out',
			onComplete: () => el.remove()
		});
	}

	node.addEventListener('click', handleClick);
	return {
		destroy() {
			node.removeEventListener('click', handleClick);
		}
	};
}

import { gsap } from 'gsap';

export function tilt(node: HTMLElement, { intensity = 6 }: { intensity?: number } = {}) {
	function onMouseMove(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
		const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
		gsap.to(node, {
			rotateY: dx * intensity,
			rotateX: -dy * intensity,
			scale: 1.03,
			duration: 0.3,
			ease: 'power2.out',
			transformPerspective: 700,
		});
	}

	function onMouseLeave() {
		gsap.to(node, {
			rotateX: 0,
			rotateY: 0,
			scale: 1,
			duration: 0.5,
			ease: 'power3.out',
		});
	}

	node.addEventListener('mousemove', onMouseMove);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mousemove', onMouseMove);
			node.removeEventListener('mouseleave', onMouseLeave);
		}
	};
}

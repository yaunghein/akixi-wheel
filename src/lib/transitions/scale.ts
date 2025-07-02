export default function (
	node: HTMLElement,
	{ duration = 400, easing, start = 0.9 }: { duration?: number; easing?: any; start?: number }
) {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	return {
		duration,
		easing,
		css: (t: number) => `
      transform: ${transform} scale(${start + (1 - start) * t});
    `
	};
}

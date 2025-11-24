import { useEffect, type RefObject } from "react";

/**
 * Hook that detects clicks outside of the specified element.
 *
 * @param ref - The ref of the element to detect clicks outside of.
 * @param handler - The function to call when a click outside is detected.
 */
export function useClickOutside(
	ref: RefObject<HTMLElement | null>,
	handler: (event: MouseEvent | TouchEvent) => void,
) {
	useEffect(() => {
		const listener = (event: MouseEvent | TouchEvent) => {
			if (!ref.current || ref.current.contains(event.target as Node)) {
				return;
			}
			handler(event);
		};

		document.addEventListener("mousedown", listener);
		document.addEventListener("touchstart", listener);

		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchstart", listener);
		};
	}, [ref, handler]);
}

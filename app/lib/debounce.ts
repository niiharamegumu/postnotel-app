export const debounce = <T extends (...args: never[]) => unknown>(
	func: T,
	delay: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let lastArgs: Parameters<T> | null = null;

	const debouncedFunction = (...args: Parameters<T>) => {
		lastArgs = args;
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			if (lastArgs) {
				func(...lastArgs);
				lastArgs = null;
			}
			timeoutId = null;
		}, delay);
	};

	debouncedFunction.cancel = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		lastArgs = null;
	};

	debouncedFunction.flush = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		if (lastArgs) {
			func(...lastArgs);
			lastArgs = null;
		}
	};

	return debouncedFunction as typeof debouncedFunction & { cancel: () => void; flush: () => void };
};

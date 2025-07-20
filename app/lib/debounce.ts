export const debounce = <T extends (...args: never[]) => unknown>(
	func: T,
	delay: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const debouncedFunction = (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};

	debouncedFunction.cancel = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	return debouncedFunction;
};

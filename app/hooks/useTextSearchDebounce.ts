import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "~/lib/debounce";

type UseTextSearchDebounceOptions = {
	delay: number;
	onSearch: (query: string) => void;
};

export const useTextSearchDebounce = ({ delay, onSearch }: UseTextSearchDebounceOptions) => {
	const [isComposing, setIsComposing] = useState<boolean>(false);
	const lastQueryRef = useRef<string>("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: onSearch needs to be in deps to ensure latest function reference
	const debouncedSearch = useCallback(
		debounce((searchQuery: string) => {
			const trimmedQuery = searchQuery.trim();
			if (trimmedQuery !== lastQueryRef.current) {
				lastQueryRef.current = trimmedQuery;
				onSearch(trimmedQuery);
			}
		}, delay),
		[onSearch],
	);

	const handleInputChange = useCallback(
		(value: string) => {
			if (!isComposing) {
				debouncedSearch(value);
			}
		},
		[isComposing, debouncedSearch],
	);

	const handleCompositionStart = useCallback(() => {
		setIsComposing(true);
	}, []);

	const handleCompositionEnd = useCallback(
		(value: string) => {
			setIsComposing(false);
			debouncedSearch(value);
		},
		[debouncedSearch],
	);

	useEffect(() => {
		return () => {
			debouncedSearch.cancel?.();
		};
	}, [debouncedSearch]);

	return {
		isComposing,
		handleInputChange,
		handleCompositionStart,
		handleCompositionEnd,
	};
};

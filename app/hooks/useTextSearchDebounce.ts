import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "~/lib/debounce";

type UseTextSearchDebounceOptions = {
	delay: number;
	onSearch: (query: string) => void;
};

export const useTextSearchDebounce = ({ delay, onSearch }: UseTextSearchDebounceOptions) => {
	const [isComposing, setIsComposing] = useState<boolean>(false);
	const [query, setQuery] = useState<string>("");
	const lastQueryRef = useRef<string>("");

	const debouncedSearch = useCallback(
		debounce((searchQuery: string) => {
			if (searchQuery.trim() !== lastQueryRef.current.trim()) {
				lastQueryRef.current = searchQuery.trim();
				onSearch(searchQuery.trim());
			}
		}, delay),
		[],
	);

	const handleInputChange = useCallback(
		(value: string) => {
			setQuery(value);
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
			setQuery(value);
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
		query,
		setQuery,
		isComposing,
		handleInputChange,
		handleCompositionStart,
		handleCompositionEnd,
	};
};

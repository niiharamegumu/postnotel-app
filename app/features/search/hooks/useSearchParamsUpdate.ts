import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { type SearchParamsUpdates, updateSearchParams } from "../utils/searchUrlUtils";

export function useSearchParamsUpdate() {
	const [, setSearchParams] = useSearchParams();

	const updateSearchParamsAndNavigate = useCallback(
		(updates: SearchParamsUpdates) => {
			setSearchParams((currentParams) => {
				const current = new URLSearchParams(currentParams);
				const next = updateSearchParams(current, updates);
				return next;
			});
		},
		[setSearchParams],
	);

	return updateSearchParamsAndNavigate;
}

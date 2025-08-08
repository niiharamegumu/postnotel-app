import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { updateSearchParams, type SearchParamsUpdates } from "../utils/searchUrlUtils";

export function useSearchParamsUpdate() {
	const [searchParams, setSearchParams] = useSearchParams();

	const updateSearchParamsAndNavigate = useCallback(
		(updates: SearchParamsUpdates) => {
			const current = new URLSearchParams(searchParams);
			console.log("現在の検索パラメータ:", current.toString());
			const next = updateSearchParams(current, updates);
			console.log("更新後の検索パラメータ:", next.toString());
			setSearchParams(next);
		},
		[searchParams, setSearchParams],
	);

	return updateSearchParamsAndNavigate;
}

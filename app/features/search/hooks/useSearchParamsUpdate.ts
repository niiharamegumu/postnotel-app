import { useCallback } from "react";
import { useNavigate } from "react-router";
import type { NoteContentType } from "~/constants/noteContentType";
import { updateSearchParams } from "../utils/searchUrlUtils";

type SearchParamsUpdates = {
	tagIds?: string[];
	contentType?: NoteContentType | "all";
	q?: string;
};

export function useSearchParamsUpdate() {
	const navigate = useNavigate();

	const updateSearchParamsAndNavigate = useCallback(
		(updates: SearchParamsUpdates) => {
			// window.location.searchを使用して確実に最新のURLパラメータを取得
			// これによりReact Routerの更新タイミングに依存せず、常に正確な値を取得可能
			const currentSearchParams = new URLSearchParams(window.location.search);
			const newSearchParams = updateSearchParams(currentSearchParams, updates);
			navigate(`/notes/search?${newSearchParams.toString()}`);
		},
		[navigate],
	);

	return updateSearchParamsAndNavigate;
}
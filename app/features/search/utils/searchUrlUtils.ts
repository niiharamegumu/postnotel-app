export type SearchParams = {
	tagIds?: string[];
	q?: string;
	page?: number;
};

export const parseSearchParams = (searchParams: URLSearchParams): SearchParams => {
	const tagIdsParam = searchParams.get("tagIds");
	const qParam = searchParams.get("q");
	const pageParam = searchParams.get("page");

	return {
		tagIds: tagIdsParam ? tagIdsParam.split(",").filter(Boolean) : undefined,
		q: qParam?.trim() || undefined,
		page: pageParam ? Number.parseInt(pageParam, 10) : undefined,
	};
};

export const buildSearchUrl = (params: SearchParams, baseUrl: string): string => {
	const searchParams = new URLSearchParams();

	if (params.tagIds && params.tagIds.length > 0) {
		searchParams.set("tagIds", params.tagIds.join(","));
	}

	if (params.q?.trim()) {
		searchParams.set("q", params.q.trim());
	}

	if (params.page && params.page > 1) {
		searchParams.set("page", params.page.toString());
	}

	const queryString = searchParams.toString();
	return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const validateSearchQuery = (query: string | undefined): string | null => {
	if (!query) return null;

	const trimmedQuery = query.trim();
	if (trimmedQuery.length === 0) return null;
	if (trimmedQuery.length > 100) return trimmedQuery.slice(0, 100);

	return trimmedQuery;
};

export function updateSearchParams(
	currentSearchParams: URLSearchParams,
	tagIds: string[],
): URLSearchParams {
	const newSearchParams = new URLSearchParams(currentSearchParams);
	if (tagIds.length > 0) {
		newSearchParams.set("tagIds", tagIds.join(","));
	} else {
		newSearchParams.delete("tagIds");
	}
	newSearchParams.delete("page"); // ページをリセット
	return newSearchParams;
}

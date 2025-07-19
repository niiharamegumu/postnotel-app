export function parseTagIdsFromUrl(searchParams: URLSearchParams): string[] {
	const tagIdsParam = searchParams.get("tagIds");
	return tagIdsParam ? tagIdsParam.split(",").filter(Boolean) : [];
}

export function buildSearchUrl(tagIds: string[], page?: number): string {
	const params = new URLSearchParams();
	if (tagIds.length > 0) {
		params.set("tagIds", tagIds.join(","));
	}
	if (page && page > 1) {
		params.set("page", page.toString());
	}
	return `/notes/search${params.toString() ? `?${params.toString()}` : ""}`;
}

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

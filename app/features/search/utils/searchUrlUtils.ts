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

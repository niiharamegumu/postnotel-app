import type { NoteContentType } from "~/constants/noteContentType";

export type SearchParams = {
	tagIds?: string[];
	q?: string;
	contentType?: NoteContentType;
	page?: number;
	startDate?: string;
	endDate?: string;
};

export type SearchParamsUpdates = {
	tagIds?: string[];
	contentType?: NoteContentType | "all";
	q?: string;
	startDate?: string | null;
	endDate?: string | null;
};

export const parseSearchParams = (searchParams: URLSearchParams): SearchParams => {
	const tagIdsParam = searchParams.get("tagIds");
	const qParam = searchParams.get("q");
	const contentTypeParam = searchParams.get("contentType");
	const pageParam = searchParams.get("page");
	const startDateParam = searchParams.get("startDate");
	const endDateParam = searchParams.get("endDate");

	return {
		tagIds: tagIdsParam ? tagIdsParam.split(",").filter(Boolean) : undefined,
		q: qParam?.trim() || undefined,
		contentType: (contentTypeParam as NoteContentType) || undefined,
		page: pageParam ? Number.parseInt(pageParam, 10) : undefined,
		startDate: startDateParam || undefined,
		endDate: endDateParam || undefined,
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

	if (params.contentType) {
		searchParams.set("contentType", params.contentType);
	}

	if (params.startDate) {
		searchParams.set("startDate", params.startDate);
	}

	if (params.endDate) {
		searchParams.set("endDate", params.endDate);
	}

	if (params.page && params.page > 1) {
		searchParams.set("page", params.page.toString());
	}

	const queryString = searchParams.toString();
	return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export function updateSearchParams(
	currentSearchParams: URLSearchParams,
	updates: SearchParamsUpdates,
): URLSearchParams {
	const newSearchParams = new URLSearchParams(currentSearchParams);

	// tagIds の更新
	if (updates.tagIds !== undefined) {
		if (updates.tagIds.length > 0) {
			newSearchParams.set("tagIds", updates.tagIds.join(","));
		} else {
			newSearchParams.delete("tagIds");
		}
	}

	// contentType の更新
	if (updates.contentType !== undefined) {
		if (updates.contentType === "all") {
			newSearchParams.delete("contentType");
		} else {
			newSearchParams.set("contentType", updates.contentType);
		}
	}

	// q の更新
	if (updates.q !== undefined) {
		if (updates.q.trim()) {
			newSearchParams.set("q", updates.q.trim());
		} else {
			newSearchParams.delete("q");
		}
	}

	// startDate の更新
	if (updates.startDate !== undefined) {
		if (updates.startDate) {
			newSearchParams.set("startDate", updates.startDate);
		} else {
			newSearchParams.delete("startDate");
		}
	}

	// endDate の更新
	if (updates.endDate !== undefined) {
		if (updates.endDate) {
			newSearchParams.set("endDate", updates.endDate);
		} else {
			newSearchParams.delete("endDate");
		}
	}

	newSearchParams.delete("page"); // ページをリセット

	return newSearchParams;
}

import { parseISO } from "date-fns";
import { type AppLoadContext, redirect } from "react-router";
import { PAGINATION_LIMITS } from "~/constants/pagination";
import type { Note } from "~/features/notes/types/note";
import type { Tag } from "~/features/tags/types/tag";
import { type PaginationInfo, calculateOffset } from "~/lib/pagination";
import { fetchAvailableTags, fetchSearchResults } from "../api/searchApi";
import { searchParamsCache } from "../searchParams";
import { validateSearchParams } from "../utils/searchValidation";

export type SearchLoaderData = {
	notes: Note[];
	availableTags: Tag[];
	paginationInfo: PaginationInfo | null;
	// Meta情報用
	selectedTags: Tag[];
	searchQuery: string;
};

export async function useSearchLoader(
	request: Request,
	context: AppLoadContext,
): Promise<SearchLoaderData> {
	const url = new URL(request.url);
	const searchParams = searchParamsCache.parse(Object.fromEntries(url.searchParams.entries()));

	const page = searchParams.page;
	const limit = PAGINATION_LIMITS.SEARCH_PAGE;
	const offset = calculateOffset(page, limit);

	// Process tag IDs and content type
	const tagIds = searchParams.tagIds || [];
	const contentType = searchParams.contentType || undefined;

	// Get all available tags
	const availableTags = await fetchAvailableTags(request, context);

	// Validate search parameters
	const validation = validateSearchParams(
		searchParams.q,
		tagIds,
		contentType,
		searchParams.startDate || undefined,
		searchParams.endDate || undefined,
		availableTags,
	);

	// Fetch search results
	const notesResult = await fetchSearchResults(request, context, {
		limit,
		offset,
		tagIds: validation.validTagIds,
		contentType: validation.validContentType || undefined,
		q: validation.validSearchQuery || undefined,
		startDate: validation.validStartDate ? parseISO(validation.validStartDate) : undefined,
		endDate: validation.validEndDate ? parseISO(validation.validEndDate) : undefined,
	});

	// Handle pagination redirect if page is invalid
	if (notesResult) {
		const { totalPages } = notesResult.paginationInfo;
		if (page > totalPages && totalPages > 0) {
			const redirectUrl = new URL(url);
			redirectUrl.searchParams.delete("page");
			throw redirect(redirectUrl.toString());
		}
	}

	return {
		notes: notesResult?.notes || [],
		availableTags,
		paginationInfo: notesResult?.paginationInfo || null,
		// Meta情報用のデータ
		selectedTags: availableTags.filter((tag) => validation.validTagIds.includes(tag.id)),
		searchQuery: validation.validSearchQuery || "",
	};
}

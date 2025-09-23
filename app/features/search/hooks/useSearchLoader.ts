import { parseISO } from "date-fns";
import type { AppLoadContext } from "react-router";
import type { NoteContentType } from "~/constants/noteContentType";
import { PAGINATION_LIMITS } from "~/constants/pagination";
import type { Note } from "~/features/notes/types/note";
import type { Tag } from "~/features/tags/types/tag";
import { type PaginationInfo, calculateOffset, getPageFromSearchParams } from "~/lib/pagination";
import { fetchAvailableTags, fetchSearchResults } from "../api/searchApi";
import { handlePaginationRedirect, handleSearchRedirect } from "../utils/searchRedirect";
import { parseSearchParams } from "../utils/searchUrlUtils";
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
	const url: URL = new URL(request.url);
	const urlSearchParams: URLSearchParams = url.searchParams;

	// Parse search parameters
	const searchParams = parseSearchParams(urlSearchParams);
	const page: number = getPageFromSearchParams(urlSearchParams);
	const limit: number = PAGINATION_LIMITS.SEARCH_PAGE;
	const offset: number = calculateOffset(page, limit);

	// Process tag IDs and content type
	const tagIds: string[] = searchParams.tagIds || [];
	const contentType: NoteContentType | undefined = searchParams.contentType;

	// Get all available tags
	const availableTags: Tag[] = await fetchAvailableTags(request, context);

	// Validate search parameters
	const validation = validateSearchParams(
		searchParams.q,
		tagIds,
		contentType,
		searchParams.startDate,
		searchParams.endDate,
		availableTags,
	);

	// Handle redirect if parameters were cleaned
	handleSearchRedirect(validation, url);

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
		handlePaginationRedirect(page, notesResult.paginationInfo.totalPages, url);
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

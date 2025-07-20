import { redirect, useLoaderData, useNavigation } from "react-router";
import { LoadingState } from "~/components/common/LoadingState";
import { PaginationControls } from "~/components/common/PaginationControls";
import { endpoints } from "~/constants/endpoints";
import { PAGINATION_LIMITS } from "~/constants/pagination";
import { fetchNotesWithPagination } from "~/features/notes/api/get";
import type { Note } from "~/features/notes/types/note";
import { SearchForm } from "~/features/search/components/SearchForm";
import { SearchHeader } from "~/features/search/components/SearchHeader";
import { SearchResults } from "~/features/search/components/SearchResults";
import { SelectedTagsDisplay } from "~/features/search/components/SelectedTagsDisplay";
import {
	buildSearchUrl,
	parseSearchParams,
	validateSearchQuery,
} from "~/features/search/utils/searchUrlUtils";
import type { Tag as TagType, TagsResponse } from "~/features/tags/types/tag";
import { fetcher } from "~/lib/fetcher";
import { type PaginationInfo, calculateOffset, getPageFromSearchParams } from "~/lib/pagination";
import type { Route } from "./+types/search";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const urlSearchParams = url.searchParams;

	// Parse search parameters
	const searchParams = parseSearchParams(urlSearchParams);
	const page = getPageFromSearchParams(urlSearchParams);
	const limit = PAGINATION_LIMITS.SEARCH_PAGE;
	const offset = calculateOffset(page, limit);

	// Validate and process search query
	const validSearchQuery = validateSearchQuery(searchParams.q);

	// Process tag IDs
	const tagIds = searchParams.tagIds || [];

	// Get all available tags
	const tagsResponse = await fetcher(context, endpoints.tags.list, {
		headers: {
			Cookie: request.headers.get("cookie") || "",
		},
	});

	const tagsData: TagsResponse = await tagsResponse.json();

	// Validate selected tag IDs
	const validTagIds = tagIds.filter((id) => tagsData.tags.some((tag) => tag.id === id));

	// Check if we need to redirect for invalid parameters
	let needsRedirect = false;
	const redirectParams = { ...searchParams };

	// Handle invalid tag IDs
	if (tagIds.length !== validTagIds.length) {
		if (validTagIds.length > 0) {
			redirectParams.tagIds = validTagIds;
		} else {
			redirectParams.tagIds = undefined;
		}
		needsRedirect = true;
	}

	// Handle invalid search query
	if (searchParams.q && !validSearchQuery) {
		redirectParams.q = undefined;
		needsRedirect = true;
	} else if (validSearchQuery && validSearchQuery !== searchParams.q) {
		redirectParams.q = validSearchQuery;
		needsRedirect = true;
	}

	// Redirect if parameters were cleaned
	if (needsRedirect) {
		const cleanUrl = buildSearchUrl(redirectParams, url.pathname);
		throw redirect(cleanUrl);
	}

	// Fetch notes based on search criteria
	let notesResult = null;
	const fetchParams: { limit: number; offset: number; tagIds?: string[]; q?: string } = {
		limit,
		offset,
	};

	// Add tag filtering if tags are selected
	if (validTagIds.length > 0) {
		fetchParams.tagIds = validTagIds;
	}

	// Add text search if query exists
	if (validSearchQuery) {
		fetchParams.q = validSearchQuery;
	}

	// Fetch notes with combined filters
	notesResult = await fetchNotesWithPagination(request, context, fetchParams);

	// If page is invalid (beyond total pages), redirect to page 1
	if (
		notesResult &&
		page > notesResult.paginationInfo.totalPages &&
		notesResult.paginationInfo.totalPages > 0
	) {
		const redirectUrl = new URL(request.url);
		redirectUrl.searchParams.delete("page");
		throw redirect(redirectUrl.toString());
	}

	return {
		notes: notesResult?.notes || [],
		selectedTags: tagsData.tags.filter((tag) => validTagIds.includes(tag.id)),
		availableTags: tagsData.tags,
		paginationInfo: notesResult?.paginationInfo || null,
		searchQuery: validSearchQuery || "",
	};
}

export function meta({ data }: Route.MetaArgs) {
	const selectedTags = data?.selectedTags || [];
	const searchQuery = data?.searchQuery || "";

	let title = "検索 - PostNotel Notes";
	let description = "ノートを検索";

	if (searchQuery && selectedTags.length > 0) {
		title = `「${searchQuery}」${selectedTags.map((tag) => tag.name).join(", ")} - PostNotel Notes`;
		description = `「${searchQuery}」でタグ検索`;
	} else if (searchQuery) {
		title = `「${searchQuery}」- PostNotel Notes`;
		description = `「${searchQuery}」で検索`;
	} else if (selectedTags.length > 0) {
		title = `${selectedTags.map((tag) => tag.name).join(", ")} - PostNotel Notes`;
		description = "タグでノートを検索";
	}

	return [{ title }, { name: "description", content: description }];
}

export default function SearchPage() {
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";

	const { notes, selectedTags, availableTags, paginationInfo } = useLoaderData<typeof loader>() as {
		notes: Note[];
		selectedTags: TagType[];
		availableTags: TagType[];
		paginationInfo: PaginationInfo | null;
	};

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-4">
			<SearchHeader />
			<SearchForm availableTags={availableTags} selectedTags={selectedTags} />
			<SelectedTagsDisplay selectedTags={selectedTags} />

			{isLoading ? (
				<LoadingState variant="spinner" className="text-center" />
			) : (
				<>
					{paginationInfo && paginationInfo.totalPages > 1 && (
						<PaginationControls pagination={paginationInfo} baseUrl="/notes/search" />
					)}
					<SearchResults
						notes={notes}
						selectedTags={selectedTags}
						paginationInfo={paginationInfo}
					/>
					{paginationInfo && paginationInfo.totalPages > 1 && (
						<PaginationControls pagination={paginationInfo} baseUrl="/notes/search" />
					)}
				</>
			)}
		</div>
	);
}

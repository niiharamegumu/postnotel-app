import { redirect, useLoaderData, useNavigation } from "react-router";
import { LoadingState } from "~/components/common/LoadingState";
import { endpoints } from "~/constants/endpoints";
import { PAGINATION_LIMITS } from "~/constants/pagination";
import { fetchNotesWithPagination } from "~/features/notes/api/get";
import type { Note } from "~/features/notes/types/note";
import { SearchHeader } from "~/features/search/components/SearchHeader";
import { SearchResults } from "~/features/search/components/SearchResults";
import { TagSelectionForm } from "~/features/search/components/TagSelectionForm";
import type { Tag as TagType, TagsResponse } from "~/features/tags/types/tag";
import { fetcher } from "~/lib/fetcher";
import { type PaginationInfo, calculateOffset, getPageFromSearchParams } from "~/lib/pagination";
import type { Route } from "./+types/search";
import { SelectedTagsDisplay } from "~/features/search/components/SelectedTagsDisplay";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const tagIdsParam = searchParams.get("tagIds");
	const page = getPageFromSearchParams(searchParams);
	const limit = PAGINATION_LIMITS.SEARCH_PAGE;
	const offset = calculateOffset(page, limit);

	const tagIds = tagIdsParam ? tagIdsParam.split(",").filter(Boolean) : [];

	// Get all available tags
	const tagsResponse = await fetcher(context, endpoints.tags.list, {
		headers: {
			Cookie: request.headers.get("cookie") || "",
		},
	});

	const tagsData: TagsResponse = await tagsResponse.json();

	// Validate selected tag IDs
	const validTagIds = tagIds.filter((id) => tagsData.tags.some((tag) => tag.id === id));

	// If there are invalid tag IDs, redirect to clean URL
	if (tagIds.length !== validTagIds.length && validTagIds.length > 0) {
		const newUrl = new URL(request.url);
		newUrl.searchParams.set("tagIds", validTagIds.join(","));
		throw redirect(newUrl.toString());
	}
	if (tagIds.length !== validTagIds.length && validTagIds.length === 0) {
		const newUrl = new URL(request.url);
		newUrl.searchParams.delete("tagIds");
		throw redirect(newUrl.toString());
	}

	// Fetch notes - either filtered by tags or all notes
	let notesResult = null;
	if (validTagIds.length > 0) {
		// Fetch notes filtered by selected tags
		notesResult = await fetchNotesWithPagination(request, context, {
			tagIds: validTagIds,
			limit,
			offset,
		});
	} else {
		// Fetch all notes when no tags are selected
		notesResult = await fetchNotesWithPagination(request, context, {
			limit,
			offset,
		});
	}

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
	};
}

export function meta({ data }: Route.MetaArgs) {
	const selectedTags = data?.selectedTags || [];
	const title =
		selectedTags.length > 0
			? `${selectedTags.map((tag) => tag.name).join(", ")} - PostNotel Notes`
			: "検索 - PostNotel Notes";

	return [{ title }, { name: "description", content: "タグでノートを検索" }];
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
		<div className="max-w-2xl mx-auto py-8 space-y-6">
			<SearchHeader selectedTags={selectedTags} />

			<TagSelectionForm availableTags={availableTags} selectedTags={selectedTags} />

			<SelectedTagsDisplay selectedTags={selectedTags} />

			{isLoading ? (
				<div className="space-y-4">
					<LoadingState variant="spinner" className="text-center" />
				</div>
			) : (
				<SearchResults notes={notes} selectedTags={selectedTags} paginationInfo={paginationInfo} />
			)}
		</div>
	);
}

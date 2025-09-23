import type { AppLoadContext } from "react-router";
import { endpoints } from "~/constants/endpoints";
import type { NoteContentType } from "~/constants/noteContentType";
import { fetchNotesWithPagination } from "~/features/notes/api/get";
import type { Tag, TagsResponse } from "~/features/tags/types/tag";
import { fetcher } from "~/lib/fetcher";

export type SearchFetchParams = {
	limit: number;
	offset: number;
	tagIds?: string[];
	contentType?: NoteContentType;
	q?: string;
	startDate?: Date;
	endDate?: Date;
};

export async function fetchAvailableTags(
	request: Request,
	context: AppLoadContext,
): Promise<Tag[]> {
	const tagsResponse = await fetcher(context, endpoints.tags.list, {
		headers: {
			Cookie: request.headers.get("cookie") || "",
		},
	});

	const tagsData: TagsResponse = await tagsResponse.json();
	return tagsData.tags;
}

export async function fetchSearchResults(
	request: Request,
	context: AppLoadContext,
	params: SearchFetchParams,
) {
	const fetchParams: SearchFetchParams = {
		limit: params.limit,
		offset: params.offset,
	};

	// Add tag filtering if tags are selected
	if (params.tagIds && params.tagIds.length > 0) {
		fetchParams.tagIds = params.tagIds;
	}

	// Add content type filtering if specified
	if (params.contentType) {
		fetchParams.contentType = params.contentType;
	}

	// Add text search if query exists
	if (params.q) {
		fetchParams.q = params.q;
	}

	if (params.startDate) {
		fetchParams.startDate = params.startDate;
	}

	if (params.endDate) {
		fetchParams.endDate = params.endDate;
	}

	return await fetchNotesWithPagination(request, context, fetchParams);
}

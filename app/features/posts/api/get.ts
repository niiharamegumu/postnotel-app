import type { AppLoadContext } from "react-router";
import type { GetNotesParams } from "~/constants/endpoints";
import { NoteContentType } from "~/constants/noteContentType";
import { fetchNoteById, fetchNotesWithPagination } from "~/features/notes/api/get";
import type { Note } from "~/features/notes/types/note";
import type { PaginationInfo } from "~/lib/pagination";
import type { Post } from "../types/post";

export type FetchPostsResult = {
	posts: Post[];
	paginationInfo: PaginationInfo;
};

export async function fetchPostsWithPagination(
	request: Request,
	context: AppLoadContext,
	params?: GetNotesParams,
): Promise<FetchPostsResult | null> {
	const result = await fetchNotesWithPagination(
		request as Parameters<typeof fetchNotesWithPagination>[0],
		context as Parameters<typeof fetchNotesWithPagination>[1],
		{ ...params, contentType: NoteContentType.Post },
	);

	if (!result) {
		return null;
	}

	return {
		posts: result.notes as Post[],
		paginationInfo: result.paginationInfo,
	};
}

export async function fetchPostById(
	request: Request,
	context: AppLoadContext,
	postId: string,
): Promise<Post | null> {
	const post = await fetchNoteById(
		request as Parameters<typeof fetchNoteById>[0],
		context as Parameters<typeof fetchNoteById>[1],
		postId,
	);

	if (!post || post.contentType !== NoteContentType.Post) {
		return null;
	}

	return post as Post;
}

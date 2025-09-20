import { StatusCodes } from "http-status-codes";
import { type GetNoteImagesParams, endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";
import { type PaginationInfo, convertApiPaginationToFrontend } from "~/lib/pagination";
import type { NoteImage, NoteImagesWithPaginationResponse } from "../types/image";
import type { Route } from ".react-router/types/app/routes/notes/+types";

export async function fetchNoteImagesWithPagination(
	request: Route.ActionArgs["request"],
	context: Route.ActionArgs["context"],
	params?: GetNoteImagesParams,
): Promise<{ noteImages: NoteImage[]; paginationInfo: PaginationInfo } | null> {
	try {
		const res = await fetcher(context, endpoints.image.list(params), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (res.status === StatusCodes.NOT_FOUND) return null;

		if (res.status === StatusCodes.NO_CONTENT) {
			const emptyPagination = {
				total: 0,
				count: 0,
				offset: params?.offset || 0,
				limit: params?.limit || 100,
				hasNext: false,
				hasPrevious: false,
			};
			const paginationInfo = convertApiPaginationToFrontend(emptyPagination);

			return {
				noteImages: [],
				paginationInfo,
			};
		}

		const noteImagesResponse: NoteImagesWithPaginationResponse = await res.json();
		const paginationInfo = convertApiPaginationToFrontend(noteImagesResponse.pagination);

		return {
			noteImages: noteImagesResponse.noteImages,
			paginationInfo,
		};
	} catch (error) {
		return null;
	}
}

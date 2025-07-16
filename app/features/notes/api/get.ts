import { fetcher } from "~/lib/fetcher";
import type { NoteDaysResponse, NotesByDateResponse, NotesWithPaginationResponse } from "../types/note";
import { endpoints, type GetNotesParams, type GetNoteDaysParams } from "~/constants/endpoints";
import type { Route } from ".react-router/types/app/routes/notes/+types";
import { StatusCodes } from "http-status-codes";
import { convertApiPaginationToFrontend, type PaginationInfo } from "~/lib/pagination";

export async function fetchNotes(
	request: Route.ActionArgs["request"],
	context: Route.ActionArgs["context"],
	params?: GetNotesParams,
): Promise<NotesByDateResponse | null> {
	try {
		const res = await fetcher(context, endpoints.notes.getNotes(params), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (res.status === StatusCodes.NOT_FOUND) return null;

		const notes: NotesByDateResponse = await res.json();
		return notes;
	} catch (e) {
		return null;
	}
}

export async function fetchNotesWithPagination(
	request: Route.ActionArgs["request"],
	context: Route.ActionArgs["context"],
	params?: GetNotesParams,
): Promise<{ notes: NotesWithPaginationResponse; paginationInfo: PaginationInfo } | null> {
	try {
		const res = await fetcher(context, endpoints.notes.getNotes(params), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (res.status === StatusCodes.NOT_FOUND) return null;
		
		// No content - return empty result with pagination info
		if (res.status === StatusCodes.NO_CONTENT) {
			const emptyResponse: NotesWithPaginationResponse = {
				notes: [],
				pagination: {
					total: 0,
					count: 0,
					offset: params?.offset || 0,
					limit: params?.limit || 100,
					hasNext: false,
					hasPrevious: false,
				},
			};
			const paginationInfo = convertApiPaginationToFrontend(emptyResponse.pagination);
			
			return {
				notes: emptyResponse,
				paginationInfo,
			};
		}

		const notesResponse: NotesWithPaginationResponse = await res.json();
		const paginationInfo = convertApiPaginationToFrontend(notesResponse.pagination);
		
		return {
			notes: notesResponse,
			paginationInfo,
		};
	} catch (e) {
		return null;
	}
}

export async function fetchDays(
	request: Route.ActionArgs["request"],
	context: Route.ActionArgs["context"],
	params: GetNoteDaysParams,
): Promise<string[]> {
	try {
		const res = await fetcher(context, endpoints.notes.days(params), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (res.status === StatusCodes.NOT_FOUND) return [];

		const days: NoteDaysResponse = await res.json();
		return days.noteDays;
	} catch (e) {
		return [];
	}
}

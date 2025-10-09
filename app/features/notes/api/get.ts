import { StatusCodes } from "http-status-codes";
import { type GetNoteDaysParams, type GetNotesParams, endpoints } from "~/constants/endpoints";
import { fetcher } from "~/lib/fetcher";
import { type PaginationInfo, convertApiPaginationToFrontend } from "~/lib/pagination";
import type { Note, NoteDaysResponse, NotesWithPaginationResponse } from "../types/note";
import type { Route } from ".react-router/types/app/routes/notes/+types";

export async function fetchNotesWithPagination(
	request: Route.ActionArgs["request"],
	context: Route.ActionArgs["context"],
	params?: GetNotesParams,
): Promise<{ notes: Note[]; paginationInfo: PaginationInfo } | null> {
	try {
		const res = await fetcher(context, endpoints.notes.getNotes(params), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (res.status === StatusCodes.NOT_FOUND) return null;

		// No content - return empty result with pagination info
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
				notes: [],
				paginationInfo,
			};
		}

		const notesResponse: NotesWithPaginationResponse = await res.json();
		const paginationInfo = convertApiPaginationToFrontend(notesResponse.pagination);

		return {
			notes: notesResponse.notes,
			paginationInfo,
		};
	} catch (e) {
		return null;
	}
}

export async function fetchNoteById(
	request: Route.ActionArgs["request"],
	context: Route.ActionArgs["context"],
	noteId: string,
): Promise<Note | null> {
	try {
		const res = await fetcher(context, endpoints.notes.get(noteId), {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (res.status === StatusCodes.NOT_FOUND || res.status === StatusCodes.NO_CONTENT) {
			return null;
		}

		return (await res.json()) as Note;
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

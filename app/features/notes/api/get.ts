import { fetcher } from "~/lib/fetcher";
import type { NoteDaysResponse, NotesByDateResponse } from "../types/note";
import { endpoints, type GetNotesParams } from "~/constants/endpoints";
import type { Route } from ".react-router/types/app/routes/notes/+types";
import { StatusCodes } from "http-status-codes";

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

export async function fetchDays(
	request: Route.ActionArgs["request"],
	context: Route.ActionArgs["context"],
): Promise<string[]> {
	try {
		const res = await fetcher(context, endpoints.notes.days, {
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

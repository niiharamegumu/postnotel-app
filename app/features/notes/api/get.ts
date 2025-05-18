import { fetcher } from "~/lib/fetcher";
import type { NotesByDateResponse } from "../types/note";
import { endpoints } from "~/constants/endpoints";
import type { Route } from ".react-router/types/app/routes/notes/+types";
import { StatusCodes } from "http-status-codes";

export async function fetchNotesByDate(
	request: Route.ActionArgs["request"],
	context: Route.ActionArgs["context"],
	date: Date,
): Promise<NotesByDateResponse | null> {
	try {
		const res = await fetcher(context, endpoints.notes.notesByDate(date), {
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

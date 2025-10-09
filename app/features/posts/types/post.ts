import type { Note, NoteApiRequest } from "~/features/notes/types/note";

export type Post = Note;

export type PostApiRequest = NoteApiRequest & {
	noteDay?: string;
};

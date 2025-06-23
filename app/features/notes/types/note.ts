import type { AccessLevel } from "~/constants/accessLevel";
import type { NoteContentType } from "~/constants/noteContentType";

export type Note = {
	noteId: string;
	content: string;
	accessLevel: AccessLevel;
	tags: {
		tags: string[];
		count: number;
	};
	images: string[];
	contentType: NoteContentType;
	createdAt: string;
	updatedAt: string;
};

export type NotesByDateResponse = {
	noteDate: string;
	notes: Note[];
	notesCount: number;
};

export type NoteDaysResponse = {
	noteDays: string[];
};

export type NoteApiRequest = {
	content: string;
	accessLevel: AccessLevel;
	images: string[];
};

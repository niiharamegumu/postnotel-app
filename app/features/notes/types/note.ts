import type { AccessLevel } from "~/constants/accessLevel";

export type Note = {
	noteId: string;
	content: string;
	accessLevel: AccessLevel;
	tags: {
		tags: string[];
		count: number;
	};
	images: string[];
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
};

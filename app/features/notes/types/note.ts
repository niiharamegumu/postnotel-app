import type { AccessLevel } from "~/constants/accessLevel";
import type { NoteContentType } from "~/constants/noteContentType";
import type { Tag } from "~/features/tags/types/tag";

export type Note = {
	noteId: string;
	content: string;
	accessLevel: AccessLevel;
	tags: {
		tags: Tag[];
		count: number;
	};
	images: string[];
	contentType: NoteContentType;
	createdAt: string;
	updatedAt: string;
};

export type NotesByDateResponse = {
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
	tagIds?: string[];
};

export type Note = {
	noteId: string;
	content: string;
	accessLevel: "private" | "public";
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

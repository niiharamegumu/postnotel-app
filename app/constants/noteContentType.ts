export enum NoteContentType {
	Note = "note",
	Post = "post",
	WineByAi = "winebyAI",
}

export const noteContentTypeLabels: Record<NoteContentType, string> = {
	[NoteContentType.Note]: "Note",
	[NoteContentType.Post]: "Post",
	[NoteContentType.WineByAi]: "Wine by AI",
};

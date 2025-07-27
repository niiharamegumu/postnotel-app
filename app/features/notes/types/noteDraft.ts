export type NoteDraft = {
	content: string;
	timestamp: number;
};

export type NoteDraftKey = {
	date: string;
};

export type UseNoteDraftOptions = {
	targetDate: Date;
	onDraftRestore?: (draft: NoteDraft) => void;
};

export type UseNoteDraftReturn = {
	saveDraft: (draft: Partial<NoteDraft>) => void;
	clearDraft: () => void;
	restoreDraft: () => NoteDraft | null;
};

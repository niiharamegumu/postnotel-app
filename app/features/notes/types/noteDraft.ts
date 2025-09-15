export type NoteDraft = {
	content: string;
	timestamp: number;
};

export type UseNoteDraftOptions = {
	onDraftRestore?: (draft: NoteDraft) => void;
};

export type UseNoteDraftReturn = {
	saveDraft: (draft: Partial<NoteDraft>) => void;
	saveDraftImmediate: (draft: Partial<NoteDraft>) => void;
	clearDraft: () => void;
	restoreDraft: () => NoteDraft | null;
};

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
	saveDraftImmediate: (draft: Partial<NoteDraft>, opts?: { targetDate?: Date }) => void;
	clearDraft: () => void;
	restoreDraft: () => NoteDraft | null;
};

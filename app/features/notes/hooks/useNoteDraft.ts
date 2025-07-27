import { useCallback, useEffect, useMemo, useRef } from "react";
import { debounce } from "../../../lib/debounce";
import {
	cleanupExpiredDrafts,
	deleteDraft,
	generateKey,
	getDraft,
	isLocalStorageAvailable,
	saveDraft,
} from "../lib/noteDraftManager";
import type { NoteDraft, UseNoteDraftOptions, UseNoteDraftReturn } from "../types/noteDraft";

const DEBOUNCE_DELAY = 1000;

export function useNoteDraft(options: UseNoteDraftOptions): UseNoteDraftReturn {
	const { targetDate, onDraftRestore } = options;
	const debouncedSaveRef = useRef<(((draft: NoteDraft) => void) & { cancel: () => void }) | null>(
		null,
	);

	// Generate storage key - memoized to avoid recalculation
	const storageKey = useMemo(() => {
		const dateString = targetDate.toISOString().split("T")[0];
		return generateKey(dateString);
	}, [targetDate]);

	// Initialize debounced save function once
	useEffect(() => {
		const debouncedSave = debounce((draft: NoteDraft) => {
			saveDraft(storageKey, draft);
		}, DEBOUNCE_DELAY);

		debouncedSaveRef.current = debouncedSave;

		return () => {
			debouncedSave.cancel();
		};
	}, [storageKey]);

	// Check for existing draft on mount and restore if available
	useEffect(() => {
		if (!isLocalStorageAvailable()) return;

		cleanupExpiredDrafts();
		const existingDraft = getDraft(storageKey);

		if (existingDraft && onDraftRestore) {
			onDraftRestore(existingDraft);
		}
	}, [storageKey, onDraftRestore]);

	const handleSaveDraft = useCallback((draft: Partial<NoteDraft>) => {
		if (!isLocalStorageAvailable()) {
			console.warn("Cannot save draft: localStorage not available");
			return;
		}

		const fullDraft: NoteDraft = {
			content: "",
			timestamp: Date.now(),
			...draft,
		};

		debouncedSaveRef.current?.(fullDraft);
	}, []);

	const handleClearDraft = useCallback(() => {
		debouncedSaveRef.current?.cancel();
		deleteDraft(storageKey);
	}, [storageKey]);

	const handleRestoreDraft = useCallback((): NoteDraft | null => {
		if (!isLocalStorageAvailable()) {
			return null;
		}
		return getDraft(storageKey);
	}, [storageKey]);

	return {
		saveDraft: handleSaveDraft,
		clearDraft: handleClearDraft,
		restoreDraft: handleRestoreDraft,
	};
}

import type { NoteDraft } from "../types/noteDraft";

const STORAGE_PREFIX = "note_draft";
const EXPIRY_DAYS = 7;

export function generateKey(date: string): string {
	return `${STORAGE_PREFIX}_${date}`;
}

export function saveDraft(key: string, draft: NoteDraft): void {
	try {
		localStorage.setItem(key, JSON.stringify(draft));
	} catch (error) {
		if (error instanceof Error && error.name === "QuotaExceededError") {
			cleanupExpiredDrafts();
			try {
				localStorage.setItem(key, JSON.stringify(draft));
			} catch {
				console.warn("Failed to save draft due to storage limitations");
			}
		}
	}
}

export function getDraft(key: string): NoteDraft | null {
	try {
		const data = localStorage.getItem(key);
		if (!data) return null;

		const parsed = JSON.parse(data);
		if (!validateDraft(parsed)) {
			deleteDraft(key);
			return null;
		}

		return parsed;
	} catch {
		deleteDraft(key);
		return null;
	}
}

export function deleteDraft(key: string): void {
	try {
		localStorage.removeItem(key);
	} catch {
		return;
	}
}

export function cleanupExpiredDrafts(): void {
	try {
		const now = Date.now();
		const expiredKeys: string[] = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (!key?.startsWith(STORAGE_PREFIX)) continue;

			try {
				const data = localStorage.getItem(key);
				if (!data) continue;

				const draft = JSON.parse(data);
				if (validateDraft(draft) && now - draft.timestamp > EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
					expiredKeys.push(key);
				}
			} catch {
				expiredKeys.push(key);
			}
		}

		for (const key of expiredKeys) {
			localStorage.removeItem(key);
		}
	} catch {
		return;
	}
}

export function validateDraft(draft: unknown): draft is NoteDraft {
	if (typeof draft !== "object" || draft === null) return false;

	const d = draft as Record<string, unknown>;

	return typeof d.content === "string" && typeof d.timestamp === "number";
}

export function isLocalStorageAvailable(): boolean {
	try {
		const test = "__localStorage_test__";
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch {
		return false;
	}
}

export function clearOtherDraftsExcept(keepKey: string): void {
	try {
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i);
			if (!key) continue;
			if (!key.startsWith(STORAGE_PREFIX)) continue;
			if (key === keepKey) continue;
			try {
				localStorage.removeItem(key);
			} catch {
				// ignore
			}
		}
	} catch {
		return;
	}
}

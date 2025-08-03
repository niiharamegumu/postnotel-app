import type { Tag } from "~/features/tags/types/tag";
import { validateSearchQuery } from "./searchUrlUtils";

export type ValidationResult = {
	validSearchQuery: string | null;
	validTagIds: string[];
	needsRedirect: boolean;
	redirectParams: {
		q?: string;
		tagIds?: string[];
	};
};

export function validateSearchParams(
	searchQuery: string | undefined,
	tagIds: string[],
	availableTags: Tag[],
): ValidationResult {
	const validSearchQuery: string | null = validateSearchQuery(searchQuery);
	const validTagIds: string[] = tagIds.filter((id) => availableTags.some((tag) => tag.id === id));

	let needsRedirect = false;
	const redirectParams: { q?: string; tagIds?: string[] } = {};

	// Handle invalid tag IDs
	if (tagIds.length !== validTagIds.length) {
		if (validTagIds.length > 0) {
			redirectParams.tagIds = validTagIds;
		} else {
			redirectParams.tagIds = undefined;
		}
		needsRedirect = true;
	}

	// Handle invalid search query
	if (searchQuery && !validSearchQuery) {
		redirectParams.q = undefined;
		needsRedirect = true;
	} else if (validSearchQuery && validSearchQuery !== searchQuery) {
		redirectParams.q = validSearchQuery;
		needsRedirect = true;
	}

	return {
		validSearchQuery,
		validTagIds,
		needsRedirect,
		redirectParams,
	};
}

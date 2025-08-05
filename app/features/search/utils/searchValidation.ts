import { NoteContentType } from "~/constants/noteContentType";
import type { Tag } from "~/features/tags/types/tag";

export type ValidationResult = {
	validSearchQuery: string | null;
	validTagIds: string[];
	validContentType: NoteContentType | null;
	needsRedirect: boolean;
	redirectParams: {
		q?: string;
		tagIds?: string[];
		contentType?: NoteContentType;
	};
};

const validateTagIds = (tagIds: string[], availableTags: Tag[]): string[] => {
	if (!tagIds || tagIds.length === 0) return [];
	return tagIds.filter((id) => availableTags.some((tag) => tag.id === id));
};

const validateSearchQuery = (query: string | undefined): string | null => {
	if (!query) return null;

	const trimmedQuery = query.trim();
	if (trimmedQuery.length === 0) return null;
	if (trimmedQuery.length > 100) return trimmedQuery.slice(0, 100);

	return trimmedQuery;
};

const validateContentType = (contentType: NoteContentType | undefined): NoteContentType | null => {
	if (!contentType) return null;

	const validContentTypes = Object.values(NoteContentType);
	return validContentTypes.includes(contentType) ? contentType : null;
};

export function validateSearchParams(
	searchQuery: string | undefined,
	tagIds: string[],
	contentType: NoteContentType | undefined,
	availableTags: Tag[],
): ValidationResult {
	const validSearchQuery: string | null = validateSearchQuery(searchQuery);
	const validTagIds: string[] = validateTagIds(tagIds, availableTags);
	const validContentType: NoteContentType | null = validateContentType(contentType);

	let needsRedirect = false;
	const redirectParams: { q?: string; tagIds?: string[]; contentType?: NoteContentType } = {};

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

	// Handle invalid content type
	if (contentType && !validContentType) {
		redirectParams.contentType = undefined;
		needsRedirect = true;
	}

	return {
		validSearchQuery,
		validTagIds,
		validContentType,
		needsRedirect,
		redirectParams,
	};
}

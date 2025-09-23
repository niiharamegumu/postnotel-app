import { format, isAfter, isValid, parseISO } from "date-fns";
import { NoteContentType } from "~/constants/noteContentType";
import type { Tag } from "~/features/tags/types/tag";

export type ValidationResult = {
	validSearchQuery: string | null;
	validTagIds: string[];
	validContentType: NoteContentType | null;
	validStartDate: string | null;
	validEndDate: string | null;
	needsRedirect: boolean;
	redirectParams: {
		q?: string;
		tagIds?: string[];
		contentType?: NoteContentType;
		startDate?: string;
		endDate?: string;
	};
};

const DATE_FORMAT = "yyyy-MM-dd";

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

const parseAndNormalizeDate = (value: string | undefined): string | null => {
	if (!value) return null;
	const parsed = parseISO(value);
	if (!isValid(parsed)) return null;
	return format(parsed, DATE_FORMAT);
};

const normalizeDateRange = (
	startDate: string | undefined,
	endDate: string | undefined,
): { startDate: string | null; endDate: string | null } => {
	const normalizedStart = parseAndNormalizeDate(startDate);
	const normalizedEnd = parseAndNormalizeDate(endDate);

	if (normalizedStart && normalizedEnd) {
		const start = parseISO(normalizedStart);
		const end = parseISO(normalizedEnd);
		if (isAfter(start, end)) {
			return {
				startDate: format(end, DATE_FORMAT),
				endDate: format(start, DATE_FORMAT),
			};
		}
	}

	return { startDate: normalizedStart, endDate: normalizedEnd };
};

export function validateSearchParams(
	searchQuery: string | undefined,
	tagIds: string[],
	contentType: NoteContentType | undefined,
	startDate: string | undefined,
	endDate: string | undefined,
	availableTags: Tag[],
): ValidationResult {
	const validSearchQuery: string | null = validateSearchQuery(searchQuery);
	const validTagIds: string[] = validateTagIds(tagIds, availableTags);
	const validContentType: NoteContentType | null = validateContentType(contentType);
	const { startDate: validStartDate, endDate: validEndDate } = normalizeDateRange(
		startDate,
		endDate,
	);

	let needsRedirect = false;
	const redirectParams: {
		q?: string;
		tagIds?: string[];
		contentType?: NoteContentType;
		startDate?: string;
		endDate?: string;
	} = {};

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

	// Handle invalid date range
	if (startDate && !validStartDate) {
		redirectParams.startDate = undefined;
		needsRedirect = true;
	} else if (validStartDate && validStartDate !== startDate) {
		redirectParams.startDate = validStartDate;
		needsRedirect = true;
	}

	if (endDate && !validEndDate) {
		redirectParams.endDate = undefined;
		needsRedirect = true;
	} else if (validEndDate && validEndDate !== endDate) {
		redirectParams.endDate = validEndDate;
		needsRedirect = true;
	}

	return {
		validSearchQuery,
		validTagIds,
		validContentType,
		validStartDate,
		validEndDate,
		needsRedirect,
		redirectParams,
	};
}

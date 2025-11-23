import { format, isAfter, isValid, parseISO } from "date-fns";
import { NoteContentType } from "~/constants/noteContentType";
import type { Tag } from "~/features/tags/types/tag";

export type ValidationResult = {
	validSearchQuery: string | null;
	validTagIds: string[];
	validContentType: NoteContentType | null;
	validStartDate: string | null;
	validEndDate: string | null;
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

	return {
		validSearchQuery,
		validTagIds,
		validContentType,
		validStartDate,
		validEndDate,
	};
}

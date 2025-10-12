import { differenceInCalendarDays, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { NOTES_CACHE_POLICY } from "~/constants/cache";
import type { Note } from "../types/note";

type CacheVisibility = "public" | "private";

type CreateCacheControlOptions = {
	visibility: CacheVisibility;
	maxAgeSeconds: number;
	sMaxAgeSeconds?: number;
	staleWhileRevalidateSeconds: number;
	isImmutable: boolean;
	mustRevalidate: boolean;
};

type RequestHeaderSnapshot = {
	cacheControl?: string | null;
	cookie?: string | null;
	ifNoneMatch?: string | null;
	ifModifiedSince?: string | null;
};

export type NotesCachePolicy = {
	shouldUsePublicCache: boolean;
	headers: Record<string, string>;
	isNotModified: boolean;
};

export type NotesCacheContext = {
	shouldUsePublicCache: boolean;
	isImmutableCandidate: boolean;
	isRecentRange: boolean;
};

const NOTES_TIMEZONE = "Asia/Tokyo";

const createCacheControlHeader = ({
	visibility,
	maxAgeSeconds,
	sMaxAgeSeconds,
	staleWhileRevalidateSeconds,
	isImmutable,
	mustRevalidate,
}: CreateCacheControlOptions) => {
	const directives = [`${visibility}`, `max-age=${maxAgeSeconds}`];

	if (typeof sMaxAgeSeconds === "number") {
		directives.push(`s-maxage=${sMaxAgeSeconds}`);
	}

	if (staleWhileRevalidateSeconds > 0) {
		directives.push(`stale-while-revalidate=${staleWhileRevalidateSeconds}`);
	}

	if (isImmutable) {
		directives.push("immutable");
	}

	if (mustRevalidate) {
		directives.push("must-revalidate");
	}

	return directives.join(", ");
};

const getLatestUpdatedAt = (notes: Note[], fallbackDate: Date) => {
	const latestUpdatedAt = notes.reduce<Date>((latest, note) => {
		const updatedAt = parseISO(note.updatedAt);
		if (Number.isNaN(updatedAt.getTime())) {
			return latest;
		}
		return updatedAt > latest ? updatedAt : latest;
	}, new Date(fallbackDate));

	latestUpdatedAt.setMilliseconds(0);
	return latestUpdatedAt;
};

export const deriveNotesCacheContext = ({
	selectedDate,
	isAuthenticated,
}: {
	selectedDate: Date;
	isAuthenticated: boolean;
}): NotesCacheContext => {
	const tokyoToday = parseISO(formatInTimeZone(new Date(), NOTES_TIMEZONE, "yyyy-MM-dd"));
	const dayDiffFromToday = differenceInCalendarDays(selectedDate, tokyoToday);
	const isFutureDate = dayDiffFromToday > 0;
	const isRecentRange = dayDiffFromToday >= 0;
	const isImmutableCandidate = dayDiffFromToday < 0;

	return {
		shouldUsePublicCache: !isAuthenticated && !isFutureDate,
		isImmutableCandidate,
		isRecentRange,
	};
};

const getPrimaryEtagValue = (rawEtag: string | null | undefined): string | null => {
	if (!rawEtag) return null;
	const primary = rawEtag.split(",")[0]?.trim();
	return primary ?? null;
};

const extractNotesCountFromEtag = (etag: string | null): number | null => {
	if (!etag) return null;
	const match = etag.match(/count:(\d+)"$/);
	if (!match) return null;

	const parsed = Number.parseInt(match[1], 10);
	return Number.isNaN(parsed) ? null : parsed;
};

export const buildNotesCachePolicy = ({
	selectedDate,
	notes,
	headers,
	context,
}: {
	selectedDate: Date;
	notes: Note[];
	headers: RequestHeaderSnapshot;
	context: NotesCacheContext;
}): NotesCachePolicy => {
	const { shouldUsePublicCache, isImmutableCandidate, isRecentRange } = context;

	const latestUpdatedAt = getLatestUpdatedAt(notes, selectedDate);
	const normalizedIfNoneMatch = getPrimaryEtagValue(headers.ifNoneMatch);
	const previousNotesCount = extractNotesCountFromEtag(normalizedIfNoneMatch);
	const ifModifiedSinceHeader = headers.ifModifiedSince;
	const ifModifiedSince = ifModifiedSinceHeader ? Date.parse(ifModifiedSinceHeader) : Number.NaN;

	let lastModifiedTimestamp = latestUpdatedAt.getTime();
	const nowTimestamp = Date.now();
	let forcedTimestampBump = false;

	if (!Number.isNaN(ifModifiedSince) && lastModifiedTimestamp < ifModifiedSince) {
		lastModifiedTimestamp = Math.min(ifModifiedSince, nowTimestamp);
	}

	if (
		previousNotesCount !== null &&
		previousNotesCount !== notes.length &&
		!Number.isNaN(ifModifiedSince) &&
		lastModifiedTimestamp <= ifModifiedSince
	) {
		lastModifiedTimestamp = Math.min(nowTimestamp, ifModifiedSince + 1000);
		forcedTimestampBump = true;
	}

	const lastModifiedUtc = new Date(lastModifiedTimestamp).toUTCString();

	const etag = `W/"notes-${selectedDate.toISOString()}-${lastModifiedTimestamp}-count:${notes.length}"`;

	const cacheVisibility: CacheVisibility = shouldUsePublicCache ? "public" : "private";
	const maxAgeSeconds = shouldUsePublicCache
		? NOTES_CACHE_POLICY.PUBLIC_MAX_AGE_SECONDS
		: NOTES_CACHE_POLICY.PRIVATE_MAX_AGE_SECONDS;
	const sMaxAgeSeconds = shouldUsePublicCache
		? isRecentRange
			? NOTES_CACHE_POLICY.PUBLIC_S_MAXAGE_SECONDS
			: NOTES_CACHE_POLICY.PUBLIC_S_MAXAGE_SECONDS * 2
		: undefined;
	const staleWhileRevalidateSeconds = shouldUsePublicCache
		? NOTES_CACHE_POLICY.PUBLIC_STALE_WHILE_REVALIDATE_SECONDS
		: NOTES_CACHE_POLICY.PRIVATE_STALE_WHILE_REVALIDATE_SECONDS;

	const cacheControl = createCacheControlHeader({
		visibility: cacheVisibility,
		maxAgeSeconds,
		sMaxAgeSeconds,
		staleWhileRevalidateSeconds,
		isImmutable: shouldUsePublicCache && isImmutableCandidate,
		mustRevalidate: !shouldUsePublicCache,
	});

	const vary = shouldUsePublicCache ? "Accept-Encoding" : "Cookie, Accept-Encoding";

	let isNotModified = false;
	if (normalizedIfNoneMatch) {
		isNotModified = normalizedIfNoneMatch === etag;
	} else if (!Number.isNaN(ifModifiedSince) && !forcedTimestampBump) {
		isNotModified = lastModifiedTimestamp <= ifModifiedSince;
	}

	return {
		shouldUsePublicCache,
		headers: {
			"Cache-Control": cacheControl,
			ETag: etag,
			"Last-Modified": lastModifiedUtc,
			Vary: vary,
		},
		isNotModified,
	};
};

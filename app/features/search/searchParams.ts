import {
	createSearchParamsCache,
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
} from "nuqs/server";
import { NoteContentType } from "~/constants/noteContentType";

export const searchParamsParsers = {
	q: parseAsString.withDefault(""),
	contentType: parseAsStringEnum<NoteContentType>(Object.values(NoteContentType)),
	tagIds: parseAsArrayOf(parseAsString).withDefault([]),
	startDate: parseAsString,
	endDate: parseAsString,
	page: parseAsInteger.withDefault(1),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

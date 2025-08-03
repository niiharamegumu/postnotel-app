import { redirect } from "react-router";
import { buildSearchUrl } from "./searchUrlUtils";
import type { ValidationResult } from "./searchValidation";

export function handleSearchRedirect(validation: ValidationResult, originalUrl: URL): never | null {
	if (!validation.needsRedirect) {
		return null;
	}

	const cleanUrl: string = buildSearchUrl(validation.redirectParams, originalUrl.pathname);
	throw redirect(cleanUrl);
}

export function handlePaginationRedirect(
	currentPage: number,
	totalPages: number,
	originalUrl: URL,
): never | null {
	if (currentPage > totalPages && totalPages > 0) {
		const redirectUrl: URL = new URL(originalUrl);
		redirectUrl.searchParams.delete("page");
		throw redirect(redirectUrl.toString());
	}
	return null;
}

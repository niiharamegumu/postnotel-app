export interface PaginationMeta {
	total: number;
	count: number;
	offset: number;
	limit: number;
	hasNext: boolean;
	hasPrevious: boolean;
}

export interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	hasNext: boolean;
	hasPrevious: boolean;
	startItem: number;
	endItem: number;
	totalItems: number;
}

export function calculatePagination(
	offset: number,
	limit: number,
	total: number,
	count: number,
): PaginationInfo {
	const currentPage = Math.floor(offset / limit) + 1;
	const totalPages = Math.ceil(total / limit);
	const hasNext = offset + limit < total;
	const hasPrevious = offset > 0;
	const startItem = total > 0 ? offset + 1 : 0;
	const endItem = offset + count;

	return {
		currentPage,
		totalPages,
		hasNext,
		hasPrevious,
		startItem,
		endItem,
		totalItems: total,
	};
}

export function convertApiPaginationToFrontend(apiPagination: PaginationMeta): PaginationInfo {
	return calculatePagination(
		apiPagination.offset,
		apiPagination.limit,
		apiPagination.total,
		apiPagination.count,
	);
}

export function getPageFromSearchParams(searchParams: URLSearchParams): number {
	const pageStr = searchParams.get("page");
	if (!pageStr) return 1;

	const page = Number.parseInt(pageStr, 10);
	return Number.isNaN(page) || page < 1 ? 1 : page;
}

export function calculateOffset(page: number, limit: number): number {
	return (page - 1) * limit;
}

export function generatePageNumbers(
	currentPage: number,
	totalPages: number,
	maxVisible = 5,
): number[] {
	if (totalPages <= maxVisible) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const halfVisible = Math.floor(maxVisible / 2);
	let startPage = Math.max(1, currentPage - halfVisible);
	const endPage = Math.min(totalPages, startPage + maxVisible - 1);

	if (endPage - startPage + 1 < maxVisible) {
		startPage = Math.max(1, endPage - maxVisible + 1);
	}

	return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
}

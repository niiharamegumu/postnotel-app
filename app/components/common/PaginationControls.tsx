import { Link, useNavigate } from "react-router";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "~/components/ui/pagination";
import { type PaginationInfo, generatePageNumbers } from "~/lib/pagination";
import { cn } from "~/lib/utils";

interface PaginationControlsProps {
	pagination: PaginationInfo;
	baseUrl: string;
	className?: string;
}

export function PaginationControls({ pagination, baseUrl, className }: PaginationControlsProps) {
	const navigate = useNavigate();

	const { currentPage, totalPages, hasNext, hasPrevious } = pagination;

	const buildUrl = (page: number): string => {
		const url = new URL(baseUrl, window.location.origin);
		if (page > 1) {
			url.searchParams.set("page", page.toString());
		}
		return url.pathname + url.search;
	};

	const pageNumbers = generatePageNumbers(currentPage, totalPages);
	const showEllipsis = totalPages > 5;

	if (totalPages <= 1) {
		return null;
	}

	return (
		<Pagination className={className}>
			<PaginationContent>
				<PaginationItem>
					{hasPrevious ? (
						<PaginationPrevious
							href={buildUrl(currentPage - 1)}
							onClick={(e) => {
								e.preventDefault();
								navigate(buildUrl(currentPage - 1));
							}}
						/>
					) : (
						<PaginationPrevious
							href="#"
							onClick={(e) => e.preventDefault()}
							className="pointer-events-none opacity-50"
						/>
					)}
				</PaginationItem>

				{showEllipsis && currentPage > 3 && (
					<>
						<PaginationItem>
							<PaginationLink
								href={buildUrl(1)}
								onClick={(e) => {
									e.preventDefault();
									navigate(buildUrl(1));
								}}
							>
								1
							</PaginationLink>
						</PaginationItem>
						{currentPage > 4 && (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
						)}
					</>
				)}

				{pageNumbers.map((pageNumber) => (
					<PaginationItem key={pageNumber}>
						<PaginationLink
							href={buildUrl(pageNumber)}
							isActive={pageNumber === currentPage}
							onClick={(e) => {
								e.preventDefault();
								if (pageNumber !== currentPage) {
									navigate(buildUrl(pageNumber));
								}
							}}
						>
							{pageNumber}
						</PaginationLink>
					</PaginationItem>
				))}

				{showEllipsis && currentPage < totalPages - 2 && (
					<>
						{currentPage < totalPages - 3 && (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
						)}
						<PaginationItem>
							<PaginationLink
								href={buildUrl(totalPages)}
								onClick={(e) => {
									e.preventDefault();
									navigate(buildUrl(totalPages));
								}}
							>
								{totalPages}
							</PaginationLink>
						</PaginationItem>
					</>
				)}

				<PaginationItem>
					{hasNext ? (
						<PaginationNext
							href={buildUrl(currentPage + 1)}
							onClick={(e) => {
								e.preventDefault();
								navigate(buildUrl(currentPage + 1));
							}}
						/>
					) : (
						<PaginationNext
							href="#"
							onClick={(e) => e.preventDefault()}
							className="pointer-events-none opacity-50"
						/>
					)}
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}

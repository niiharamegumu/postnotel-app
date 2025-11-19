import { useLoaderData } from "react-router";
import { LoadingState } from "~/components/common/LoadingState";
import { PaginationControls } from "~/components/common/PaginationControls";
import { ActiveFilters } from "~/features/search/components/ActiveFilters";
import { SearchForm } from "~/features/search/components/SearchForm";
import { SearchHeader } from "~/features/search/components/SearchHeader";
import { SearchResults } from "~/features/search/components/SearchResults";
import { type SearchLoaderData, useSearchLoader } from "~/features/search/hooks/useSearchLoader";
import { useSearchMeta } from "~/features/search/hooks/useSearchMeta";
import { useNavigation } from "~/hooks/useNavigation";
import type { Route } from "./+types/search";

export async function loader({ request, context }: Route.LoaderArgs): Promise<SearchLoaderData> {
	return await useSearchLoader(request, context);
}

export function meta({ data }: Route.MetaArgs) {
	return useSearchMeta(data);
}

export default function SearchPage() {
	const { isLoading } = useNavigation();
	const { notes, availableTags, paginationInfo } = useLoaderData<typeof loader>();

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-4">
			<SearchHeader />
			<SearchForm availableTags={availableTags} />
			<div className="fixed top-0 left-0 right-0 z-2 backdrop-blur-xs">
				<ActiveFilters availableTags={availableTags} />
			</div>

			{isLoading ? (
				<LoadingState variant="spinner" size="sm" className="text-center" />
			) : (
				<>
					{paginationInfo && paginationInfo.totalPages > 1 && (
						<PaginationControls pagination={paginationInfo} baseUrl="/notes/search" />
					)}
					<SearchResults
						notes={notes}
						availableTags={availableTags}
						paginationInfo={paginationInfo}
					/>
					{paginationInfo && paginationInfo.totalPages > 1 && (
						<PaginationControls pagination={paginationInfo} baseUrl="/notes/search" />
					)}
				</>
			)}
		</div>
	);
}

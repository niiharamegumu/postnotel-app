import { useLoaderData } from "react-router";

import { PaginationControls } from "~/components/common/PaginationControls";
import { ActiveFilters } from "~/features/search/components/ActiveFilters";
import { SearchForm } from "~/features/search/components/SearchForm";
import { SearchHeader } from "~/features/search/components/SearchHeader";
import { SearchResults } from "~/features/search/components/SearchResults";
import { type SearchLoaderData, useSearchLoader } from "~/features/search/hooks/useSearchLoader";
import { useSearchMeta } from "~/features/search/hooks/useSearchMeta";

import type { Route } from "./+types/search";

export async function loader({ request, context }: Route.LoaderArgs): Promise<SearchLoaderData> {
	return await useSearchLoader(request, context);
}

export function meta({ data }: Route.MetaArgs) {
	return useSearchMeta(data);
}

export default function SearchPage() {

	const { notes, availableTags, paginationInfo } = useLoaderData<typeof loader>();

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-4">
			<div className="sticky top-0 left-0 right-0 z-2 backdrop-blur-xs px-4">
				<div className="flex items-center gap-2 relative">
					<SearchHeader />
					<SearchForm availableTags={availableTags} />
				</div>
				{availableTags.length > 0 && (
					<div className="mb-2">
						<ActiveFilters availableTags={availableTags} />
					</div>
				)}
				<h3 className="text-sm font-medium text-muted-foreground mb-2">{paginationInfo?.totalItems || 0}件</h3>
				{paginationInfo && paginationInfo.totalPages > 1 && (
					<PaginationControls pagination={paginationInfo} baseUrl="/notes/search"/>
				)}
			</div>

			{paginationInfo && (
				<div className="px-4">
					<SearchResults
						notes={notes}
						availableTags={availableTags}
						paginationInfo={paginationInfo}
					/>
				</div>
			)}
		</div>
	);
}

import { useLoaderData } from "react-router";
import { LoadingState } from "~/components/common/LoadingState";
import { PaginationControls } from "~/components/common/PaginationControls";
import type { Note } from "~/features/notes/types/note";
import { SearchForm } from "~/features/search/components/SearchForm";
import { SearchHeader } from "~/features/search/components/SearchHeader";
import { SearchResults } from "~/features/search/components/SearchResults";
import { SelectedTagsDisplay } from "~/features/search/components/SelectedTagsDisplay";
import { type SearchLoaderData, useSearchLoader } from "~/features/search/hooks/useSearchLoader";
import { useSearchMeta } from "~/features/search/hooks/useSearchMeta";
import type { Tag as TagType } from "~/features/tags/types/tag";
import { useNavigation } from "~/hooks/useNavigation";
import type { PaginationInfo } from "~/lib/pagination";
import type { Route } from "./+types/search";

export async function loader({ request, context }: Route.LoaderArgs): Promise<SearchLoaderData> {
	return await useSearchLoader(request, context);
}

export function meta({ data }: Route.MetaArgs) {
	return useSearchMeta(data);
}

export default function SearchPage() {
	const { isLoading } = useNavigation();
	const { notes, selectedTags, availableTags, paginationInfo } = useLoaderData<typeof loader>() as {
		notes: Note[];
		selectedTags: TagType[];
		availableTags: TagType[];
		paginationInfo: PaginationInfo | null;
	};

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-4">
			<SearchHeader />
			<SearchForm availableTags={availableTags} selectedTags={selectedTags} />
			<SelectedTagsDisplay selectedTags={selectedTags} />

			{isLoading ? (
				<LoadingState variant="spinner" className="text-center" />
			) : (
				<>
					{paginationInfo && paginationInfo.totalPages > 1 && (
						<PaginationControls pagination={paginationInfo} baseUrl="/notes/search" />
					)}
					<SearchResults
						notes={notes}
						selectedTags={selectedTags}
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

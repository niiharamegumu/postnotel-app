import type { Tag } from "~/features/tags/types/tag";
import type { PaginationInfo } from "~/lib/pagination";

type SearchQueryDisplayProps = {
	selectedTags: Tag[];
	searchQuery: string;
	paginationInfo: PaginationInfo | null;
	isLoading: boolean;
};

export function SearchQueryDisplay({
	selectedTags,
	searchQuery,
	paginationInfo,
	isLoading,
}: SearchQueryDisplayProps) {
	const hasSearchCriteria = selectedTags.length > 0 || searchQuery.length > 0;
	const hasResults = (paginationInfo?.totalItems || 0) > 0;
	const totalResults = paginationInfo?.totalItems || 0;

	if (!hasSearchCriteria || isLoading) {
		return null;
	}

	return (
		<div className="text-sm text-muted-foreground border-l-4 border-primary pl-4 py-2">
			{hasResults ? (
				<p>
					{totalResults}件のノートが見つかりました
					{searchQuery && ` (「${searchQuery}」で検索)`}
				</p>
			) : (
				<p className="text-orange-600 dark:text-orange-400">
					検索条件に該当するノートが見つかりませんでした
					{searchQuery && ` (「${searchQuery}」で検索)`}
				</p>
			)}
		</div>
	);
}
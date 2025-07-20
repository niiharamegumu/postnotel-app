import { useNavigation, useSearchParams } from "react-router";
import type { Tag } from "~/features/tags/types/tag";
import { TagSelectionForm } from "./TagSelectionForm";
import { TextSearchInput } from "./TextSearchInput";

type SearchFormProps = {
	availableTags: Tag[];
	selectedTags: Tag[];
};

export function SearchForm({ availableTags, selectedTags }: SearchFormProps) {
	const navigation = useNavigation();
	const [searchParams] = useSearchParams();
	const isLoading = navigation.state === "loading";

	const currentQuery = searchParams.get("q") || "";

	return (
		<div className="space-y-6">
			{/* テキスト検索 */}
			<div className="space-y-2">
				<h3 className="text-lg font-medium">検索</h3>
				<TextSearchInput isLoading={isLoading} className="w-full" />
				{currentQuery && (
					<p className="text-sm text-muted-foreground">「{currentQuery}」で検索中</p>
				)}
			</div>

			{/* タグ検索 */}
			<TagSelectionForm availableTags={availableTags} selectedTags={selectedTags} />
		</div>
	);
}

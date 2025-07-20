import { useNavigation } from "react-router";
import type { Tag } from "~/features/tags/types/tag";
import { TagSelectionForm } from "./TagSelectionForm";
import { TextSearchInput } from "./TextSearchInput";

type SearchFormProps = {
	availableTags: Tag[];
	selectedTags: Tag[];
};

export function SearchForm({ availableTags, selectedTags }: SearchFormProps) {
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";

	return (
		<div className="space-y-6">
			{/* テキスト検索 */}
			<TextSearchInput isLoading={isLoading} className="w-full" />

			{/* タグ検索 */}
			<TagSelectionForm availableTags={availableTags} selectedTags={selectedTags} />
		</div>
	);
}

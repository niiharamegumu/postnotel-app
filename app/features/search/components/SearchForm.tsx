import type { Tag } from "~/features/tags/types/tag";
import { useNavigation } from "~/hooks/useNavigation";
import { TagSelectionForm } from "./TagSelectionForm";
import { TextSearchInput } from "./TextSearchInput";

type SearchFormProps = {
	availableTags: Tag[];
	selectedTags: Tag[];
};

export function SearchForm({ availableTags, selectedTags }: SearchFormProps) {
	const { isLoading } = useNavigation();

	return (
		<div className="space-y-4">
			{/* テキスト検索 */}
			<TextSearchInput isLoading={isLoading} className="w-full" />

			{/* タグ検索 */}
			<TagSelectionForm availableTags={availableTags} selectedTags={selectedTags} />
		</div>
	);
}

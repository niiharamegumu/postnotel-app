import type { Tag } from "~/features/tags/types/tag";
import { useNavigation } from "~/hooks/useNavigation";
import { ContentTypeSelectionForm } from "./ContentTypeSelectionForm";
import { TagSelectionForm } from "./TagSelectionForm";
import { TextSearchInput } from "./TextSearchInput";

type SearchFormProps = {
	availableTags: Tag[];
};

export function SearchForm({ availableTags }: SearchFormProps) {
	const { isLoading } = useNavigation();

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				{/* テキスト検索 */}
				<TextSearchInput isLoading={isLoading} className="w-full" />

				{/* コンテンツタイプ検索 */}
				<ContentTypeSelectionForm />
			</div>

			{/* タグ検索 */}
			<TagSelectionForm availableTags={availableTags} />
		</div>
	);
}

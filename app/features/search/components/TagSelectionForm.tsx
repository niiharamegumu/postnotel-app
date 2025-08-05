import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { TagSelector } from "~/features/tags/components/TagSelector";
import type { Tag } from "~/features/tags/types/tag";
import { updateSearchParams } from "../utils/searchUrlUtils";

type TagSelectionFormProps = {
	availableTags: Tag[];
	selectedTags: Tag[];
};

export function TagSelectionForm({ availableTags, selectedTags }: TagSelectionFormProps) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const handleTagAdd = useCallback(
		(tag: Tag) => {
			const currentTagIds = selectedTags.map((t) => t.id);
			const newTagIds = [...currentTagIds, tag.id];
			const newSearchParams = updateSearchParams(searchParams, { tagIds: newTagIds });
			navigate(`/notes/search?${newSearchParams.toString()}`);
		},
		[selectedTags, searchParams, navigate],
	);

	const handleTagRemove = useCallback(
		(tagIdToRemove: string) => {
			const newTagIds = selectedTags.filter((tag) => tag.id !== tagIdToRemove).map((tag) => tag.id);
			const newSearchParams = updateSearchParams(searchParams, { tagIds: newTagIds });
			navigate(`/notes/search?${newSearchParams.toString()}`);
		},
		[selectedTags, searchParams, navigate],
	);

	// 選択可能なタグは、まだ選択されていないタグのみ
	const selectableTags = useMemo(
		() => availableTags.filter((tag) => !selectedTags.some((selected) => selected.id === tag.id)),
		[availableTags, selectedTags],
	);

	return (
		<TagSelector
			availableTags={selectableTags}
			selectedTags={[]} // タグ選択フォームでは空配列、選択済みタグは別コンポーネントで表示
			onTagSelect={handleTagAdd}
			onTagRemove={handleTagRemove}
			maxHeight="15svh"
		/>
	);
}

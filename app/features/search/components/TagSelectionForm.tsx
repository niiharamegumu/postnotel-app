import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { TagSelector } from "~/features/tags/components/TagSelector";
import type { Tag } from "~/features/tags/types/tag";
import { searchParamsParsers } from "../searchParams";

type TagSelectionFormProps = {
	availableTags: Tag[];
};

export function TagSelectionForm({ availableTags }: TagSelectionFormProps) {
	const [tagIds, setTagIds] = useQueryState(
		"tagIds",
		searchParamsParsers.tagIds.withOptions({ shallow: false }),
	);

	// URLパラメータからselectedTagsを計算
	const selectedTagIds = tagIds || [];
	const selectedTags = useMemo(
		() => availableTags.filter((tag) => selectedTagIds.includes(tag.id)),
		[availableTags, selectedTagIds],
	);

	const handleTagAdd = useCallback(
		(tag: Tag) => {
			const newTagIds = [...selectedTagIds, tag.id];
			setTagIds(newTagIds);
		},
		[selectedTagIds, setTagIds],
	);

	const handleTagRemove = useCallback(
		(tagIdToRemove: string) => {
			const newTagIds = selectedTagIds.filter((id) => id !== tagIdToRemove);
			setTagIds(newTagIds.length > 0 ? newTagIds : null);
		},
		[selectedTagIds, setTagIds],
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

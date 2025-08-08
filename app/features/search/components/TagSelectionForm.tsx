import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { TagSelector } from "~/features/tags/components/TagSelector";
import type { Tag } from "~/features/tags/types/tag";
import { useSearchParamsUpdate } from "../hooks/useSearchParamsUpdate";

type TagSelectionFormProps = {
	availableTags: Tag[];
};

export function TagSelectionForm({ availableTags }: TagSelectionFormProps) {
	const [searchParams] = useSearchParams();
	const updateSearchParams = useSearchParamsUpdate();

	// URLパラメータからselectedTagsを計算
	const selectedTagIds = searchParams.get("tagIds")?.split(",").filter(Boolean) || [];
	const selectedTags = useMemo(
		() => availableTags.filter((tag) => selectedTagIds.includes(tag.id)),
		[availableTags, selectedTagIds],
	);

	const handleTagAdd = useCallback(
		(tag: Tag) => {
			const newTagIds = [...selectedTagIds, tag.id];
			updateSearchParams({ tagIds: newTagIds });
		},
		[selectedTagIds, updateSearchParams],
	);

	const handleTagRemove = useCallback(
		(tagIdToRemove: string) => {
			const newTagIds = selectedTagIds.filter((id) => id !== tagIdToRemove);
			updateSearchParams({ tagIds: newTagIds });
		},
		[selectedTagIds, updateSearchParams],
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

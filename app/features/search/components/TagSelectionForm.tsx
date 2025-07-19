import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { TagSelector } from "~/features/tags/components/TagSelector";
import { useTags } from "~/features/tags/hooks/useTags";
import type { Tag } from "~/features/tags/types/tag";
import { updateSearchParams } from "../utils/searchUrlUtils";

type TagSelectionFormProps = {
	availableTags: Tag[];
	selectedTags: Tag[];
};

export function TagSelectionForm({ availableTags, selectedTags }: TagSelectionFormProps) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { createTag } = useTags();
	const [isExpanded, setIsExpanded] = useState(false);

	const handleTagAdd = useCallback(
		(tag: Tag) => {
			const currentTagIds = selectedTags.map((t) => t.id);
			const newTagIds = [...currentTagIds, tag.id];
			const newSearchParams = updateSearchParams(searchParams, newTagIds);
			navigate(`/notes/search?${newSearchParams.toString()}`);
		},
		[selectedTags, searchParams, navigate],
	);

	const handleTagRemove = useCallback(
		(tagIdToRemove: string) => {
			const newTagIds = selectedTags.filter((tag) => tag.id !== tagIdToRemove).map((tag) => tag.id);
			const newSearchParams = updateSearchParams(searchParams, newTagIds);
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
		<div className="space-y-4 border-b-1 border-primary/50 py-4">
			<div className="space-y-2">
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="flex items-center justify-between w-full text-left group"
				>
					<div>
						<h3 className="text-lg font-medium group-hover:text-primary transition-colors">Tags</h3>
					</div>
					{isExpanded ? (
						<ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
					) : (
						<ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
					)}
				</button>
			</div>

			{isExpanded && (
				<div className="mt-4">
					<TagSelector
						availableTags={selectableTags}
						selectedTags={[]} // タグ選択フォームでは空配列、選択済みタグは別コンポーネントで表示
						onTagSelect={handleTagAdd}
						onTagRemove={handleTagRemove}
						onCreateTag={createTag}
					/>
				</div>
			)}
		</div>
	);
}

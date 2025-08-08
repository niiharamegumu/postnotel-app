import { Trash, X } from "lucide-react";
import { Tag } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { Tag as TagType } from "~/features/tags/types/tag";
import { useSearchParamsUpdate } from "../hooks/useSearchParamsUpdate";

type SelectedTagsDisplayProps = {
	availableTags: TagType[];
};

export function SelectedTagsDisplay({ availableTags }: SelectedTagsDisplayProps) {
	const [searchParams] = useSearchParams();
	const updateSearchParams = useSearchParamsUpdate();

	// URLパラメータからselectedTagsを計算
	const selectedTagIds: string[] = searchParams.get("tagIds")?.split(",").filter(Boolean) || [];
	const selectedTags: TagType[] = useMemo(
		() => availableTags.filter((tag) => selectedTagIds.includes(tag.id)),
		[availableTags, selectedTagIds],
	);

	const handleTagRemove = useCallback(
		(tagIdToRemove: string) => {
			const newTagIds: string[] = selectedTagIds.filter((id) => id !== tagIdToRemove);
			updateSearchParams({ tagIds: newTagIds });
		},
		[selectedTagIds, updateSearchParams],
	);

	const handleClearAll = useCallback(() => {
		updateSearchParams({ tagIds: [] });
	}, [updateSearchParams]);

	if (selectedTags.length === 0) {
		return null;
	}

	return (
		<div className="space-y-3 p-4 bg-card rounded-md">
			<div className="flex items-center">
				<div className="flex flex-wrap gap-2 flex-1">
					{selectedTags.map((tag) => (
						<div
							key={tag.id}
							className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium"
						>
							<Tag size={12} />
							<span>{tag.name}</span>
							<button
								type="button"
								onClick={() => handleTagRemove(tag.id)}
								className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
								aria-label={`${tag.name}タグを削除`}
							>
								<X size={12} />
							</button>
						</div>
					))}
				</div>
				{selectedTags.length > 0 && (
					<button type="button" onClick={handleClearAll} aria-label="すべてのタグをクリア">
						<Trash size={18} />
					</button>
				)}
			</div>
		</div>
	);
}

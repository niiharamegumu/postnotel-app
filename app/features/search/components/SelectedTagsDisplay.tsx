import { Trash, X } from "lucide-react";
import { Tag } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { Tag as TagType } from "~/features/tags/types/tag";
import { updateSearchParams } from "../utils/searchUrlUtils";

type SelectedTagsDisplayProps = {
	selectedTags: TagType[];
};

export function SelectedTagsDisplay({ selectedTags }: SelectedTagsDisplayProps) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const handleTagRemove = useCallback(
		(tagIdToRemove: string) => {
			const newTagIds = selectedTags.filter((tag) => tag.id !== tagIdToRemove).map((tag) => tag.id);
			const newSearchParams = updateSearchParams(searchParams, { tagIds: newTagIds });
			navigate(`/notes/search?${newSearchParams.toString()}`);
		},
		[selectedTags, searchParams, navigate],
	);

	const handleClearAll = useCallback(() => {
		const newSearchParams = updateSearchParams(searchParams, { tagIds: [] });
		navigate(`/notes/search?${newSearchParams.toString()}`);
	}, [searchParams, navigate]);

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

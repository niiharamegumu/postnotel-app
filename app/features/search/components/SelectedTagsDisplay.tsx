import { X } from "lucide-react";
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
			const newSearchParams = updateSearchParams(searchParams, newTagIds);
			navigate(`/notes/search?${newSearchParams.toString()}`);
		},
		[selectedTags, searchParams, navigate],
	);

	const handleClearAll = useCallback(() => {
		const newSearchParams = updateSearchParams(searchParams, []);
		navigate(`/notes/search?${newSearchParams.toString()}`);
	}, [searchParams, navigate]);

	if (selectedTags.length === 0) {
		return null;
	}

	return (
		<div className="space-y-3 border-b-1 border-primary/50 py-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-muted-foreground">Selected Tags</h3>
				{selectedTags.length > 0 && (
					<button
						type="button"
						onClick={handleClearAll}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Clear
					</button>
				)}
			</div>
			<div className="flex flex-wrap gap-2">
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
		</div>
	);
}

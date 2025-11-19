import { Calendar, FileType, Search, Tag, X } from "lucide-react";
import { useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { NoteContentType, noteContentTypeLabels } from "~/constants/noteContentType";
import type { Tag as TagType } from "~/features/tags/types/tag";
import { useSearchParamsUpdate } from "../hooks/useSearchParamsUpdate";

type ActiveFiltersProps = {
	availableTags: TagType[];
};

export function ActiveFilters({ availableTags }: ActiveFiltersProps) {
	const [searchParams] = useSearchParams();
	const updateSearchParams = useSearchParamsUpdate();

	const query: string = searchParams.get("q") || "";
	const contentType: string | null = searchParams.get("contentType");
	const startDate: string | null = searchParams.get("startDate");
	const endDate: string | null = searchParams.get("endDate");
	const tagIds: string[] = searchParams.get("tagIds")?.split(",").filter(Boolean) || [];

	const selectedTags: TagType[] = availableTags.filter((tag) => tagIds.includes(tag.id));

	const hasActiveFilters: boolean = !!(
		query ||
		contentType ||
		startDate ||
		endDate ||
		tagIds.length > 0
	);

	if (!hasActiveFilters) {
		return null;
	}

	const handleRemoveQuery = (): void => {
		updateSearchParams({ q: "" });
	};

	const handleRemoveContentType = (): void => {
		updateSearchParams({ contentType: "all" });
	};

	const handleRemoveDateRange = (): void => {
		updateSearchParams({ startDate: null, endDate: null });
	};

	const handleRemoveTag = (tagId: string): void => {
		const newTagIds: string[] = tagIds.filter((id) => id !== tagId);
		updateSearchParams({ tagIds: newTagIds });
	};

	const handleClearAll = (): void => {
		updateSearchParams({
			q: "",
			contentType: "all",
			startDate: null,
			endDate: null,
			tagIds: [],
		});
	};

	return (
		<div className="px-4 md:px-2 py-2">
			<div className="max-w-2xl mx-auto space-y-2">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-muted-foreground">適用中のフィルター</h3>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleClearAll}
					className="h-7 text-xs"
				>
					すべてクリア
				</Button>
			</div>
			<div className="flex flex-wrap gap-2">
				{query && (
					<div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20">
						<Search size={12} />
						<span>{query}</span>
						<button
							type="button"
							onClick={handleRemoveQuery}
							className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
							aria-label="テキスト検索を削除"
						>
							<X size={12} />
						</button>
					</div>
				)}
				{contentType && (
					<div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-md text-xs font-medium border border-blue-500/20">
						<FileType size={12} />
						<span>{noteContentTypeLabels[contentType as NoteContentType]}</span>
						<button
							type="button"
							onClick={handleRemoveContentType}
							className="ml-1 hover:bg-blue-500/20 rounded-full p-0.5 transition-colors"
							aria-label="コンテンツタイプを削除"
						>
							<X size={12} />
						</button>
					</div>
				)}
				{(startDate || endDate) && (
					<div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-medium border border-green-500/20">
						<Calendar size={12} />
						<span>
							{startDate && endDate
								? `${startDate} 〜 ${endDate}`
								: startDate
									? `${startDate} 〜`
									: `〜 ${endDate}`}
						</span>
						<button
							type="button"
							onClick={handleRemoveDateRange}
							className="ml-1 hover:bg-green-500/20 rounded-full p-0.5 transition-colors"
							aria-label="日付範囲を削除"
						>
							<X size={12} />
						</button>
					</div>
				)}
				{selectedTags.map((tag) => (
					<div
						key={tag.id}
						className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-500 rounded-md text-xs font-medium border border-purple-500/20"
					>
						<Tag size={12} />
						<span>{tag.name}</span>
						<button
							type="button"
							onClick={() => handleRemoveTag(tag.id)}
							className="ml-1 hover:bg-purple-500/20 rounded-full p-0.5 transition-colors"
							aria-label={`${tag.name}タグを削除`}
						>
							<X size={12} />
						</button>
					</div>
				))}
			</div>
			</div>
		</div>
	);
}

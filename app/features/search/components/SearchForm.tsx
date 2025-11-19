import { Calendar, ChevronDown, FileType, Tag as TagIcon } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import type { Tag } from "~/features/tags/types/tag";
import { useNavigation } from "~/hooks/useNavigation";
import { cn } from "~/lib/utils";
import { ContentTypeSelectionForm } from "./ContentTypeSelectionForm";
import { DateRangeSelectionForm } from "./DateRangeSelectionForm";
import { TagSelectionForm } from "./TagSelectionForm";
import { TextSearchInput } from "./TextSearchInput";

type SearchFormProps = {
	availableTags: Tag[];
};

export function SearchForm({ availableTags }: SearchFormProps) {
	const { isLoading } = useNavigation();
	const [openFilters, setOpenFilters] = useState<{
		contentType: boolean;
		dateRange: boolean;
		tags: boolean;
	}>({
		contentType: false,
		dateRange: false,
		tags: false,
	});

	const toggleFilter = (filterName: keyof typeof openFilters): void => {
		setOpenFilters((prev) => ({
			...prev,
			[filterName]: !prev[filterName],
		}));
	};

	return (
		<div className="space-y-3">
			{/* テキスト検索 - 常に表示 */}
			<TextSearchInput isLoading={isLoading} className="w-full" />

			<div className="space-y-2">
				{/* コンテンツタイプフィルター */}
				<Collapsible
					open={openFilters.contentType}
					onOpenChange={() => toggleFilter("contentType")}
				>
					<CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium bg-card hover:bg-accent rounded-md transition-colors border">
						<div className="flex items-center gap-2">
							<FileType size={16} />
							<span>コンテンツタイプ</span>
						</div>
						<ChevronDown
							size={16}
							className={cn(
								"transition-transform duration-200",
								openFilters.contentType && "rotate-180",
							)}
						/>
					</CollapsibleTrigger>
					<CollapsibleContent className="pt-2">
						<ContentTypeSelectionForm />
					</CollapsibleContent>
				</Collapsible>

				{/* 日付範囲フィルター */}
				<Collapsible open={openFilters.dateRange} onOpenChange={() => toggleFilter("dateRange")}>
					<CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium bg-card hover:bg-accent rounded-md transition-colors border">
						<div className="flex items-center gap-2">
							<Calendar size={16} />
							<span>日付範囲</span>
						</div>
						<ChevronDown
							size={16}
							className={cn(
								"transition-transform duration-200",
								openFilters.dateRange && "rotate-180",
							)}
						/>
					</CollapsibleTrigger>
					<CollapsibleContent className="pt-2">
						<DateRangeSelectionForm />
					</CollapsibleContent>
				</Collapsible>

				{/* タグフィルター */}
				<Collapsible open={openFilters.tags} onOpenChange={() => toggleFilter("tags")}>
					<CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium bg-card hover:bg-accent rounded-md transition-colors border">
						<div className="flex items-center gap-2">
							<TagIcon size={16} />
							<span>タグ</span>
						</div>
						<ChevronDown
							size={16}
							className={cn("transition-transform duration-200", openFilters.tags && "rotate-180")}
						/>
					</CollapsibleTrigger>
					<CollapsibleContent className="pt-2">
						<TagSelectionForm availableTags={availableTags} />
					</CollapsibleContent>
				</Collapsible>
			</div>
		</div>
	);
}

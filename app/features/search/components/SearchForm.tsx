import { ChevronDown, Filter } from "lucide-react";
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
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
			<CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium hover:bg-accent/50 transition-colors">
				<div className="flex items-center gap-2">
					<Filter size={16} />
					<span>検索条件</span>
				</div>
				<ChevronDown
					size={16}
					className={cn("transition-transform duration-200", isOpen && "rotate-180")}
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="space-y-4">
					<div className="space-y-1">
						<label className="text-sm font-medium text-muted-foreground block">テキスト検索</label>
						<TextSearchInput isLoading={isLoading} />
					</div>

					<div className="space-y-1">
						<label className="text-sm font-medium text-muted-foreground block">コンテンツタイプ</label>
						<ContentTypeSelectionForm />
					</div>

					<div className="space-y-1">
						<label className="text-sm font-medium text-muted-foreground block">日付範囲</label>
						<DateRangeSelectionForm />
					</div>

					<div className="space-y-1">
						<label className="text-sm font-medium text-muted-foreground block">タグ</label>
						<TagSelectionForm availableTags={availableTags} />
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

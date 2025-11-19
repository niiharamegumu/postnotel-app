import { AnimatePresence, motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { Tag } from "~/features/tags/types/tag";
import { useNavigation } from "~/hooks/useNavigation";
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
		<div className="flex justify-start w-full">
			<Button
				variant="outline"
				size="icon"
				className="rounded-full w-8 h-8 transition-all bg-background"
				onClick={() => setIsOpen(!isOpen)}
				aria-label={isOpen ? "検索条件を閉じる" : "検索条件を開く"}
			>
				{isOpen ? <X size={8} /> : <Filter size={8} />}
			</Button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, transformOrigin: "top center" }}
						animate={{ opacity: 1, scale: 1, transformOrigin: "top center" }}
						exit={{ opacity: 0, scale: 0.95, transformOrigin: "top center" }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="absolute top-full left-0 mt-2 z-2 w-full bg-background border rounded-lg p-4 shadow-lg"
					>
						<div className="space-y-4">
							<div className="space-y-1">
								<label className="text-sm font-medium text-muted-foreground block">
									テキスト検索
								</label>
								<TextSearchInput isLoading={isLoading} />
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-muted-foreground block">
									コンテンツタイプ
								</label>
								<ContentTypeSelectionForm />
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-muted-foreground block">
									日付範囲
								</label>
								<DateRangeSelectionForm />
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-muted-foreground block">タグ</label>
								<TagSelectionForm availableTags={availableTags} />
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

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
		<div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, transformOrigin: "bottom right" }}
						animate={{ opacity: 1, scale: 1, transformOrigin: "bottom right" }}
						exit={{ opacity: 0, scale: 0.95, transformOrigin: "bottom right" }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="mb-4 w-80 bg-background border rounded-lg p-4 shadow-lg"
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

			<Button
				variant="outline"
				size="icon"
				className="rounded-full w-12 h-12 transition-all bg-background"
				onClick={() => setIsOpen(!isOpen)}
				aria-label={isOpen ? "検索条件を閉じる" : "検索条件を開く"}
			>
				{isOpen ? <X size={20} /> : <Filter size={20} />}
			</Button>
		</div>
	);
}

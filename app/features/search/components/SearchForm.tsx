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
		<div className="relative">
			<div className="flex justify-end mb-4">
				<Button
					variant="outline"
					size="icon"
					className="rounded-full w-12 h-12 transition-all"
					onClick={() => setIsOpen(!isOpen)}
					aria-label={isOpen ? "検索条件を閉じる" : "検索条件を開く"}
				>
					{isOpen ? <X size={20} /> : <Filter size={20} />}
				</Button>
			</div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, height: 0, transformOrigin: "top right" }}
						animate={{ opacity: 1, scale: 1, height: "auto", transformOrigin: "top right" }}
						exit={{ opacity: 0, scale: 0.95, height: 0, transformOrigin: "top right" }}
						transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
						className="overflow-hidden"
					>
						<div className="space-y-4 p-1">
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
